import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { JobDispatcher } from "@/lib/production/providers/JobDispatcher";
import { TransactionService, DomainError, ErrorCode } from '@/lib/transaction';
import { withIdempotency } from '@/lib/idempotency';
import { logger } from '@/lib/observability/logger';
import crypto from 'crypto';

const transactionService = new TransactionService(prisma);

async function jobRunHandler(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const { prompt_set_id, provider_id, model_name, asset_type, scene_id, shot_id } = body;
    const companyId = "c-1"; // Hardcoded for this prototype

    if (!prompt_set_id || !provider_id || !model_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    // 1. Create the queued job transactionally
    const job = await transactionService.runInTransaction(correlationId, async (tx) => {
        // Prevent duplicate queued jobs for the exact same prompt and location
        const duplicate = await tx.productionAIJob.findFirst({
            where: {
                project_id: projectId,
                scene_id: scene_id || null,
                shot_id: shot_id || null,
                prompt_set_id,
                status: "Queued"
            }
        });

        if (duplicate) {
            throw new DomainError("An identical job is already queued", ErrorCode.CONFLICT);
        }

        return tx.productionAIJob.create({
          data: {
            id: crypto.randomUUID(),
            project_id: projectId,
            scene_id: scene_id || null,
            shot_id: shot_id || null,
            prompt_set_id,
            provider_id,
            model_name,
            asset_type: asset_type || "Text",
            status: "Queued",
            updated_at: new Date()
          }
        });
    }, undefined, {
        userId: 'system',
        tenantId: companyId,
        domain: 'ai-studio',
        service: 'job-queue',
        projectId
    });

    // 2. Dispatch Job Synchronously (For Prototype)
    // In production, we would drop this to a BullMQ queue and return { jobId } instantly.
    await JobDispatcher.dispatchJob(job.id, companyId, correlationId);

    // 3. Find the newly created asset version to return the assetId
    const finalAssetVersion = await prisma.productionAssetVersion.findFirst({
      where: { job_id: job.id },
      orderBy: { created_at: 'desc' }
    });
    
    return NextResponse.json({ 
      success: true, 
      jobId: job.id, 
      assetId: finalAssetVersion?.asset_id 
    });

  } catch (error: any) {
    logger.error("Run Job Error:", error);
    if (error instanceof DomainError) {
      let status = 500;
      if (error.code === ErrorCode.CONFLICT) status = 409;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ projectId: string }> }
) {
  return withIdempotency(req, jobRunHandler, ctx);
}
