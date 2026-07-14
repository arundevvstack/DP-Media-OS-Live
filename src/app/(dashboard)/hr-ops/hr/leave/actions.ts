"use server";

import prisma from "@/lib/prisma";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import crypto from "crypto";
import { logger } from "@/lib/observability/logger";

const transactionService = new TransactionService(prisma);

export async function submitLeaveRequest(data: { type: string; start_date: string; end_date: string; reason: string }, idempotencyKey?: string) {
  try {
    const company = await prisma.company.findFirst();
    if (!company) throw new DomainError("Company not found", ErrorCode.NOT_FOUND);

    const user = await prisma.user.findFirst({ where: { company_id: company.id } });
    if (!user) throw new DomainError("No users found to request leave for", ErrorCode.NOT_FOUND);

    const correlationId = idempotencyKey || crypto.randomUUID();

    const result = await transactionService.runInTransaction(correlationId, async (tx) => {
      const requestId = crypto.randomUUID();
      
      // Ensure idempotency for identical requests (same user, type, dates, status pending)
      const existing = await tx.leaveRequest.findFirst({
        where: {
          user_id: user.id,
          type: data.type,
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
          status: 'Pending'
        }
      });

      if (existing) {
        throw new DomainError("Duplicate pending leave request already exists for these dates", ErrorCode.CONFLICT);
      }

      await tx.$executeRaw`
        INSERT INTO "LeaveRequest" (id, company_id, user_id, type, start_date, end_date, status, reason, created_at, updated_at)
        VALUES (${requestId}, ${company.id}, ${user.id}, ${data.type}, ${new Date(data.start_date)}, ${new Date(data.end_date)}, 'Pending', ${data.reason}, NOW(), NOW())
      `;

      // Create activity log
      await tx.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: "LEAVE_REQUESTED",
          entity_type: "LeaveRequest",
          entity_id: requestId,
          user_id: user.id,
          user_name: user.fullName,
          company_id: company.id,
          details: JSON.stringify({
            type: data.type,
            start_date: data.start_date,
            end_date: data.end_date
          })
        }
      });

      return { success: true, requestId };
    }, undefined, {
      userId: user.id,
      tenantId: company.id,
      domain: 'hr',
      service: 'leave-request'
    });

    return result;
  } catch (error: any) {
    logger.error('HR Action Error in submitLeaveRequest:', error);
    throw new Error(error.message);
  }
}
