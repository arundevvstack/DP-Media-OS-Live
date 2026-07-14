// @ts-nocheck
import prisma from "@/lib/prisma";
import { ProviderManager } from "./ProviderManager";
import { TransactionService, DomainError, ErrorCode } from '@/lib/transaction';
import crypto from 'crypto';

const transactionService = new TransactionService(prisma);

export class JobDispatcher {
  
  /**
   * Executes a ProductionAIJob end-to-end.
   * Uses the provider manager to find the correct adapter, fetches the credentials,
   * submits the job, and converts the normalized response into a ProductionAsset.
   */
  static async dispatchJob(jobId: string, companyId: string, correlationId?: string): Promise<void> {
    const id = correlationId || crypto.randomUUID();

    const job = await prisma.productionAIJob.findUnique({
      where: { id: jobId },
      include: { provider: true }
    });

    if (!job) throw new DomainError("Job not found", ErrorCode.NOT_FOUND);
    if (job.status !== "Queued") {
      throw new DomainError(`Job is already ${job.status}`, ErrorCode.CONFLICT);
    }

    // Mark as running (outside transaction since it's just a state flip before a long process)
    await prisma.productionAIJob.update({
      where: { id: jobId },
      data: { status: "Running" }
    });

    try {
      if (!job.provider_id || !job.provider) {
        throw new DomainError("Job has no provider assigned", ErrorCode.VALIDATION);
      }

      // 1. Get Decrypted Credentials
      const apiKey = await ProviderManager.getDecryptedCredentials(companyId, job.provider_id);

      // 2. Load Adapter
      const adapter = ProviderManager.getAdapter(job.provider.name);

      // 3. Assemble Prompt from associated Prompt Set
      let promptText = "Generate content";
      if (job.prompt_set_id) {
        const pSet = await prisma.productionPromptSet.findUnique({ where: { id: job.prompt_set_id } });
        if (pSet) {
          promptText = pSet.image_prompt || pSet.video_prompt || "Generate content";
        }
      }

      // 4. Submit Job to 3rd party (long-running, outside transaction)
      const normalizedResponse = await adapter.submitJob(apiKey, job.model_name, promptText);

      // 5. Store Asset and mark completed IN A SINGLE TRANSACTION
      await transactionService.runInTransaction(id, async (tx) => {
        // Prevent duplicate completions
        const checkJob = await tx.productionAIJob.findUnique({ where: { id: jobId } });
        if (checkJob?.status === 'Completed') {
          throw new DomainError('Job already completed', ErrorCode.CONFLICT);
        }

        const asset = await tx.productionAsset.create({
          data: {
            id: crypto.randomUUID(),
            project_id: job.project_id,
            type: job.asset_type,
            status: "Pending Review",
            scene_id: job.scene_id,
            shot_id: job.shot_id,
            updated_at: new Date()
          }
        });

        await tx.productionAssetVersion.create({
          data: {
            id: crypto.randomUUID(),
            asset_id: asset.id,
            job_id: jobId,
            version_number: 1,
            file_url: normalizedResponse.assetUrl || null,
            metadata: normalizedResponse.metadata as any,
            provider_id: job.provider_id,
            model_name: job.model_name,
            created_at: new Date()
          }
        });

        await tx.productionAIJob.update({
          where: { id: jobId },
          data: { status: "Completed", updated_at: new Date() }
        });

        await tx.auditLog.create({
          data: {
            id: crypto.randomUUID(),
            company_id: companyId,
            user_id: 'system',
            entity_type: 'ProductionAIJob',
            entity_id: jobId,
            action: 'JOB_COMPLETED',
            after_state: { asset_id: asset.id }
          }
        });

        return asset;
      }, undefined, {
        userId: 'system',
        tenantId: companyId,
        domain: 'ai-studio',
        service: 'job-dispatch',
        jobId
      });

    } catch (e: any) {
      console.error("Job Dispatch Error:", e);
      
      // Mark Job Failed safely
      await transactionService.runInTransaction(`${id}-fail`, async (tx) => {
        await tx.productionAIJob.update({
          where: { id: jobId },
          data: { status: "Failed", updated_at: new Date() }
        });
      }, undefined, {
        userId: 'system',
        tenantId: companyId,
        domain: 'ai-studio',
        service: 'job-dispatch-fail'
      });
      
      throw e;
    }
  }
}
