import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import { withIdempotency } from "@/lib/idempotency";
import { logger } from "@/lib/observability/logger";
import crypto from "crypto";

export class UsersUserIdEmpcodeApiService {
    static async handlePATCH(req: NextRequest, ctx: { params: Promise<{ userId: string }> }) {
    }
}
const transactionService = new TransactionService(prisma);
async function empCodePatchHandler(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const { emp_code } = await req.json();
    const code = emp_code?.trim() || null;

    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    const user = await transactionService.runInTransaction(correlationId, async (tx) => {
      // Validate user exists
      const existingUser = await tx.$queryRaw<{ id: string; company_id: string }[]>`
        SELECT id, company_id FROM "User" WHERE id = ${userId} LIMIT 1
      `;
      if (!existingUser || existingUser.length === 0) {
        throw new DomainError('User not found', ErrorCode.NOT_FOUND);
      }

      const companyId = existingUser[0].company_id;

      // Duplicate emp_code check
      if (code) {
        const duplicate = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM "User" WHERE emp_code = ${code} AND company_id = ${companyId} AND id != ${userId} LIMIT 1
        `;
        if (duplicate && duplicate.length > 0) {
          throw new DomainError('Duplicate employee code exists', ErrorCode.CONFLICT);
        }
      }

      await tx.$executeRaw`UPDATE "User" SET emp_code = ${code} WHERE id = ${userId}`;

      const users = await tx.$queryRaw<{ id: string; fullName: string; emp_code: string | null }[]>`
        SELECT id, "fullName", emp_code FROM "User" WHERE id = ${userId} LIMIT 1
      `;
      return users[0];
    }, undefined, {
      userId: 'system',
      tenantId: 'unknown', // Need company ID to set accurately, but extracted inside Tx
      domain: 'hr',
      service: 'update-emp-code',
      targetUserId: userId
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    logger.error('HR PATCH EmpCode Error:', err);
    if (err instanceof DomainError) {
      let status = 500;
      if (err.code === ErrorCode.NOT_FOUND) status = 404;
      if (err.code === ErrorCode.CONFLICT) status = 409;
      return NextResponse.json({ error: err.message }, { status });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}