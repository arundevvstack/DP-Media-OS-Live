import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import { withIdempotency } from "@/lib/idempotency";
import { logger } from "@/lib/observability/logger";
import crypto from "crypto";
import { userRepository } from "@/domains/identity/repositories/UserRepository";

export class CrmProspectIdRequirementApiService {
    static async handleGET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    }

    static async handlePOST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    }
}
const transactionService = new TransactionService(prisma);
async function requirementPostHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }

    const profile = await userRepository.findUnique({
      where: { id: user.id },
    });

    if (!profile || !profile.company_id) {
      return NextResponse.json({ error: 'Forbidden: Tenant company association missing.' }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();

    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    const updated = await transactionService.runInTransaction(correlationId, async (tx) => {
      const existing = await tx.requirementChart.findFirst({
        where: { prospect_id: id, company_id: profile.company_id }
      });

      if (!existing) {
        throw new DomainError("Requirement not found", ErrorCode.NOT_FOUND);
      }

      const updatedRequirement = await tx.requirementChart.update({
        where: { id: existing.id },
        data: {
          client_details: body.client_details,
          project_details: body.project_details,
          objective: body.objective,
          assets: body.assets,
          timeline: body.timeline,
          notes: body.notes,
          scope_of_work: body.scope_of_work,
          deliverables_summary: body.deliverables_summary,
          
          production_type: body.production_type || "",
          ai_style: body.ai_style,
          ai_assets_required: body.ai_assets_required,
          live_shoot_details: body.live_shoot_details,
          hybrid_details: body.hybrid_details,
          photography_details: body.photography_details,
          post_production_details: body.post_production_details,
          universal_deliverables: body.universal_deliverables,
          items_checked: body.items_checked,

          status: body.completeness_score >= 80 ? 'approved' : 'draft',
          completeness_score: body.completeness_score
        }
      });
      
      // Sync Prospect requirement status
      const newStatus = body.completeness_score >= 80 ? 'completed' : 'in_progress';
      await tx.prospect.update({
        where: { id: id },
        data: { requirement_status: newStatus }
      });

      if (body.create_version) {
        const count = await tx.requirementVersion.count({ where: { requirement_chart_id: updatedRequirement.id } });
        await tx.requirementVersion.create({
          data: {
            id: crypto.randomUUID(),
            requirement_chart_id: updatedRequirement.id,
            version_number: count + 1,
            changed_by: user.id,
            changed_fields: body.changed_fields || [],
            reason: body.version_reason || "Auto-saved revision",
            data_snapshot: updatedRequirement as any
          }
        });
      }
      return updatedRequirement;
    }, undefined, {
      userId: profile.id,
      tenantId: profile.company_id,
      domain: 'crm',
      service: 'requirement-update',
      prospectId: id
    });

    return NextResponse.json({ requirement: updated });
  } catch (error: any) {
    logger.error("Requirement POST Error:", error);
    if (error instanceof DomainError) {
      let status = 500;
      if (error.code === ErrorCode.NOT_FOUND) status = 404;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}