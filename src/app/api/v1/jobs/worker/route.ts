import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { FinancialEngine } from '@/lib/financial-engine';
import { TransactionService, DomainError, ErrorCode } from '@/lib/transaction';
import crypto from 'crypto';
import { logger } from '@/lib/observability/logger';

const prisma = new PrismaClient();
const transactionService = new TransactionService(prisma);

// In production, this would be triggered by a Cron job or a Redis worker polling loop.
// For Next.js on Vercel, this is typically called via Vercel Cron.

export async function POST(req: Request) {
  try {
    // Basic shared-secret auth for cron jobs
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    // 1. Fetch highest priority queued job and lock it transactionally
    const job = await transactionService.runInTransaction(`${correlationId}-lock`, async (tx) => {
      const pendingJob = await tx.distributedJobQueue.findFirst({
        where: { status: 'queued' },
        orderBy: [
          { priority: 'desc' },
          { started_at: 'asc' } // Oldest first within same priority
        ]
      });

      if (!pendingJob) return null;

      const lockedJob = await tx.distributedJobQueue.update({
        where: { id: pendingJob.id },
        data: { status: 'processing', started_at: new Date() }
      });

      return lockedJob;
    }, undefined, {
      userId: 'system',
      tenantId: 'system',
      domain: 'ai-studio',
      service: 'worker-queue-lock'
    });

    if (!job) {
      return NextResponse.json({ success: true, message: 'No jobs in queue' });
    }

    const payload: any = job.payload;

    try {
      // 3. Process based on Event Type (Simulated external processing without tx)
      switch (job.job_type) {
        case 'STAGE_TRANSITIONED':
          if (payload.projectId) {
            await FinancialEngine.recalculateProjectBudget(payload.projectId);
          }
          break;

        case 'AI_RENDER_FAILED':
          logger.info("Triggering auto-remediation for failed AI Job", { jobId: payload.jobId });
          break;

        case 'ASSET_UPLOADED':
          // Trigger vision tagging API asynchronously
          break;

        default:
          logger.info(`Unknown job type ${job.job_type}, acknowledging anyway.`);
      }

      // 4. Mark Complete Transactionally
      await transactionService.runInTransaction(`${correlationId}-complete`, async (tx) => {
        await tx.distributedJobQueue.update({
          where: { id: job.id },
          data: { status: 'completed', completed_at: new Date() }
        });
      }, undefined, {
        userId: 'system',
        tenantId: 'system',
        domain: 'ai-studio',
        service: 'worker-queue-complete',
        jobId: job.id
      });

      return NextResponse.json({ success: true, processedJobId: job.id });

    } catch (processError: any) {
      // 5. Mark Failed Transactionally
      await transactionService.runInTransaction(`${correlationId}-fail`, async (tx) => {
        await tx.distributedJobQueue.update({
          where: { id: job.id },
          data: { status: 'failed', error_log: processError.message, completed_at: new Date() }
        });
      }, undefined, {
        userId: 'system',
        tenantId: 'system',
        domain: 'ai-studio',
        service: 'worker-queue-fail',
        jobId: job.id
      });

      return NextResponse.json({ error: processError.message }, { status: 500 });
    }

  } catch (error: any) {
    logger.error("Worker Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process queue" }, { status: 500 });
  }
}
