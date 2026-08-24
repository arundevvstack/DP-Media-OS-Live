import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import { withIdempotency } from "@/lib/idempotency";
import { logger } from "@/lib/observability/logger";
import crypto from "crypto";
import { userRepository } from "@/domains/identity/repositories/UserRepository";

export class TimeentriesApproveApiService {
    static async handlePOST(req: NextRequest) {
    }
}
const transactionService = new TransactionService(prisma);
async function timeEntryApproveHandler(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { timeEntryId, status, companyId } = body;

    if (!timeEntryId || !status || !companyId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const dbUser = await userRepository.findUnique({ where: { id: user.id }});
    const isAdmin = dbUser?.role_id === 'SUPER_ADMIN' || dbUser?.role_id === 'ADMIN';

    if (!isAdmin && dbUser?.role_id !== 'PROJECT_MANAGER' && dbUser?.role_id !== 'DEPT_HEAD') {
        return NextResponse.json({ error: 'Forbidden. Only managers can approve time entries.' }, { status: 403 });
    }

    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    const updatedEntry = await transactionService.runInTransaction(correlationId, async (tx) => {
        const existingEntry = await tx.timeEntry.findUnique({ where: { id: timeEntryId } });
        if (!existingEntry) {
            throw new DomainError("Time entry not found", ErrorCode.NOT_FOUND);
        }

        if (existingEntry.approval_status === status) {
            throw new DomainError(`Time entry is already ${status}`, ErrorCode.CONFLICT);
        }

        const entry = await tx.timeEntry.update({
            where: { id: timeEntryId },
            data: {
                approval_status: status,
                approved_by: user.id
            }
        });

        await tx.auditLog.create({
            data: {
                id: crypto.randomUUID(),
                company_id: companyId,
                user_id: user.id,
                entity_type: 'TimeEntry',
                entity_id: timeEntryId,
                action: status.toUpperCase(),
                after_state: { approval_status: status }
            }
        });

        return entry;
    }, undefined, {
        userId: user.id,
        tenantId: companyId,
        domain: 'hr',
        service: 'time-entry-approval'
    });

    return NextResponse.json({ success: true, data: updatedEntry });

  } catch (error: any) {
    logger.error("TimeEntry Approval Error:", error);
    if (error instanceof DomainError) {
      let status = 500;
      if (error.code === ErrorCode.NOT_FOUND) status = 404;
      if (error.code === ErrorCode.CONFLICT) status = 409;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: error.message || "Failed to approve time entry" }, { status: 500 });
  }
}