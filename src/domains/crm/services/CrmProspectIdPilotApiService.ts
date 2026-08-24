import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import { withIdempotency } from "@/lib/idempotency";
import { logger } from "@/lib/observability/logger";
import crypto from "crypto";
import { userRepository } from "@/domains/identity/repositories/UserRepository";
import prisma from "@/lib/prisma";

export class CrmProspectIdPilotApiService {
    static async handlePOST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    }
}
const transactionService = new TransactionService(prisma);
async function pilotHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await userRepository.findFirst({
      where: { id: user.id }
    });

    if (!profile?.company_id) {
      return NextResponse.json({ error: "No company context found" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { assignee_id } = body;

    const correlationId = request.headers.get("x-correlation-id") || crypto.randomUUID();

    const result = await transactionService.runInTransaction(correlationId, async (tx) => {
      const prospect = await tx.prospect.findUnique({
        where: { id: id, company_id: profile.company_id },
        include: {
          requirements: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });

      if (!prospect) {
        throw new DomainError("Prospect not found", ErrorCode.NOT_FOUND);
      }

      const requirement = prospect.requirements[0];

      // Check if pilot already exists
      if (prospect.pilot_project_id) {
        throw new DomainError("Pilot project already exists", ErrorCode.CONFLICT);
      }

      // Create Pilot Project
      const project = await tx.project.create({
        data: {
          id: crypto.randomUUID(),
          company_id: profile.company_id,
          project_name: `${prospect.company_name} - Pilot Video`,
          type: "Pilot",
          project_type: "Pilot Video",
          status: "active",
          client_name: prospect.company_name,
          progress: 0,
          budget: requirement?.project_details?.budget ? parseFloat(requirement.project_details.budget) : 0,
          pilot_project_id: id,
          updated_at: new Date(),
          requirements: requirement ? {
            connect: { id: requirement.id }
          } : undefined,
          ProjectMember: assignee_id ? {
            create: {
              id: crypto.randomUUID(),
              user_id: assignee_id,
              role: "lead",
              company_id: profile.company_id
            }
          } : undefined
        }
      });

      // Update prospect with pilot details and move stage
      const updatedProspect = await tx.prospect.update({
        where: { id: id },
        data: {
          stage: "pilot_video",
          pilot_project_id: project.id,
          pilot_status: "in_progress"
        }
      });

      return { project, prospect: updatedProspect };
    }, undefined, {
      userId: profile.id,
      tenantId: profile.company_id,
      domain: 'crm',
      service: 'pilot-creation',
      prospectId: id
    });

    return NextResponse.json({ 
      success: true, 
      ...result
    });

  } catch (error: any) {
    logger.error("Error creating pilot:", error);
    if (error instanceof DomainError) {
      let status = 500;
      if (error.code === ErrorCode.NOT_FOUND) status = 404;
      if (error.code === ErrorCode.CONFLICT) status = 409;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: error.message || "Failed to create pilot project" }, { status: 500 });
  }
}