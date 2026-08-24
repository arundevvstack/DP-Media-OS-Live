import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import { withIdempotency } from "@/lib/idempotency";
import { logger } from "@/lib/observability/logger";
import crypto from "crypto";
import { projectStageRepository } from "@/domains/platform/repositories/ProjectStageRepository";
import { objectiveRepository } from "@/domains/projects/repositories/ObjectiveRepository";

export class ProjectsProjectIdObjectivesApiService {
    static async handleGET(req: Request, context: { params: Promise<{ projectId: string }> }) {
    }

    static async handlePOST(req: NextRequest, ctx: { params: Promise<{ projectId: string }> }) {
    }
}

const transactionService = new TransactionService(prisma);
async function objectiveCreateHandler(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const {
      title,
      description,
      department,
      priority,
      estimated_hours,
      due_date,
      stage_id,
      assignee_id,
      checklist,
      depends_on_ids,
    } = body;

    if (!projectId || !title || !stage_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    const objective = await transactionService.runInTransaction(correlationId, async (tx) => {
      // Conflict detection: prevent exact duplicate objective in the same stage
      const duplicate = await tx.objective.findFirst({
        where: { project_id: projectId, stage_id, title }
      });

      if (duplicate) {
        throw new DomainError(`Objective with title "${title}" already exists in this stage`, ErrorCode.CONFLICT);
      }

      const newObj = await tx.objective.create({
        data: {
          id: crypto.randomUUID(),
          project_id: projectId,
          stage_id,
          title,
          description: description ?? null,
          department: department ?? 'Production',
          priority: priority ?? 'Medium',
          estimated_hours: estimated_hours ? parseFloat(estimated_hours) : null,
          due_date: due_date ? new Date(due_date) : null,
          assignee_id: assignee_id ?? null,
          checklist: checklist ?? [],
          status: 'Pending',
          updated_at: new Date()
        },
      });

      // Wire dependencies if provided
      if (depends_on_ids && depends_on_ids.length > 0) {
        for (const parentId of depends_on_ids) {
          await tx.objectiveDependency.create({
            data: {
              id: crypto.randomUUID(),
              parent_id: parentId,
              child_id: newObj.id,
              type: 'blocking',
            },
          });
        }
      }

      return newObj;
    }, undefined, {
      userId: 'system',
      tenantId: 'unknown',
      domain: 'project',
      service: 'objective-create',
      projectId
    });

    return NextResponse.json({ success: true, objective });
  } catch (error: any) {
    logger.error('Objective creation error:', error);
    if (error instanceof DomainError) {
      let status = 500;
      if (error.code === ErrorCode.CONFLICT) status = 409;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}