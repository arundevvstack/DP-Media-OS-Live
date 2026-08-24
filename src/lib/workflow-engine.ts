import prisma from "@/lib/prisma";
import { PrismaClient } from '@prisma/client';
import { TransactionService, DomainError, ErrorCode } from '@/lib/transaction';
import crypto from 'crypto';


const transactionService = new TransactionService(prisma);

export class WorkflowEngine {
  /**
   * Attempts to move a project to the next stage safely using a Prisma transaction.
   * Validates mandatory objectives and approvals before transitioning.
   */
  static async transitionStage(
    projectId: string,
    currentStageId: string,
    nextStageId: string,
    userId: string,
    companyId: string,
    correlationId?: string
  ) {
    const id = correlationId || crypto.randomUUID();
    return await transactionService.runInTransaction(id, async (tx) => {
      // 1. Fetch current workflow state
      let workflowState = await tx.workflowState.findUnique({
        where: { project_id: projectId },
      });

      if (!workflowState) {
        workflowState = await tx.workflowState.create({
          data: {
            id: crypto.randomUUID(),
            project_id: projectId,
            active_stage_id: currentStageId,
          },
        });
      }

      // 2. Validate state lock
      if (workflowState.is_blocked) {
        throw new DomainError(`Workflow is blocked: ${workflowState.blocked_reason}`, ErrorCode.CONFLICT);
      }

      // Check idempotency (duplicate transitions)
      if (workflowState.active_stage_id === nextStageId) {
        throw new DomainError(`Project is already in the target stage`, ErrorCode.CONFLICT);
      }

      // 3. Verify all mandatory objectives in current stage are completed
      const incompleteObjectives = await tx.objective.findMany({
        where: {
          project_id: projectId,
          stage_id: currentStageId,
          status: { not: 'Completed' },
        },
      });

      if (incompleteObjectives.length > 0) {
        throw new DomainError(
          `Cannot transition stage. ${incompleteObjectives.length} objective(s) are incomplete in the current stage.`,
          ErrorCode.VALIDATION
        );
      }

      // 4. Perform Transition
      const updatedState = await tx.workflowState.update({
        where: { project_id: projectId },
        data: {
          previous_stage_id: currentStageId,
          active_stage_id: nextStageId,
          updated_at: new Date(),
        },
      });

      // 5. Update actual ProjectStage records
      await tx.projectStage.update({
        where: { id: currentStageId },
        data: { status: 'completed', end_date: new Date() },
      });

      await tx.projectStage.update({
        where: { id: nextStageId },
        data: { status: 'active', start_date: new Date() },
      });

      // 6. Audit Log
      await tx.auditLog.create({
        data: {
          id: crypto.randomUUID(),
          company_id: companyId,
          user_id: userId,
          entity_type: 'ProjectStage',
          entity_id: projectId,
          action: 'STAGE_TRANSITION',
          before_state: { stage_id: currentStageId },
          after_state: { stage_id: nextStageId },
        },
      });

      return updatedState;
    }, undefined, {
      userId,
      tenantId: companyId,
      domain: 'project',
      service: 'workflow-transition',
      projectId
    });
  }

  /**
   * Locks the workflow (e.g., when client rejects or a critical block occurs)
   */
  static async lockWorkflow(projectId: string, reason: string, userId: string, companyId: string, correlationId?: string) {
    const id = correlationId || crypto.randomUUID();
    return await transactionService.runInTransaction(id, async (tx) => {
      const existing = await tx.workflowState.findUnique({ where: { project_id: projectId } });
      if (existing?.is_blocked) {
        throw new DomainError('Workflow is already locked', ErrorCode.CONFLICT);
      }

      const state = await tx.workflowState.update({
        where: { project_id: projectId },
        data: {
          is_blocked: true,
          blocked_reason: reason,
        },
      });

      await tx.auditLog.create({
        data: {
          id: crypto.randomUUID(),
          company_id: companyId,
          user_id: userId,
          entity_type: 'WorkflowState',
          entity_id: projectId,
          action: 'WORKFLOW_LOCKED',
          after_state: { reason },
        },
      });

      return state;
    }, undefined, {
      userId,
      tenantId: companyId,
      domain: 'project',
      service: 'workflow-lock',
      projectId
    });
  }

  /**
   * Unlocks the workflow
   */
  static async unlockWorkflow(projectId: string, userId: string, companyId: string, correlationId?: string) {
    const id = correlationId || crypto.randomUUID();
    return await transactionService.runInTransaction(id, async (tx) => {
      const existing = await tx.workflowState.findUnique({ where: { project_id: projectId } });
      if (!existing?.is_blocked) {
        throw new DomainError('Workflow is not locked', ErrorCode.CONFLICT);
      }

      const state = await tx.workflowState.update({
        where: { project_id: projectId },
        data: {
          is_blocked: false,
          blocked_reason: null,
        },
      });

      await tx.auditLog.create({
        data: {
          id: crypto.randomUUID(),
          company_id: companyId,
          user_id: userId,
          entity_type: 'WorkflowState',
          entity_id: projectId,
          action: 'WORKFLOW_UNLOCKED',
        },
      });

      return state;
    }, undefined, {
      userId,
      tenantId: companyId,
      domain: 'project',
      service: 'workflow-unlock',
      projectId
    });
  }
}
