import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TransactionService, DomainError, ErrorCode } from '@/lib/transaction';
import { withIdempotency } from '@/lib/idempotency';
import { logger } from '@/lib/observability/logger';
import crypto from 'crypto';

const transactionService = new TransactionService(prisma);

// PATCH /api/v1/users/[userId]/org
// Updates department, functional_manager_id, hr_manager_id via raw SQL
async function orgPatchHandler(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const { department, functional_manager_id, hr_manager_id } = await req.json();

    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    const user = await transactionService.runInTransaction(correlationId, async (tx) => {
      // Validate user exists
      const existingUser = await tx.$queryRaw<{ id: string; company_id: string }[]>`
        SELECT id, company_id FROM "User" WHERE id = ${userId} LIMIT 1
      `;
      if (!existingUser || existingUser.length === 0) {
        throw new DomainError('User not found', ErrorCode.NOT_FOUND);
      }

      await tx.$executeRawUnsafe(
        `UPDATE "User" SET department = $1, functional_manager_id = $2, hr_manager_id = $3 WHERE id = $4`,
        department || null,
        functional_manager_id || null,
        hr_manager_id || null,
        userId
      );

      // Return updated values
      const rows = await tx.$queryRawUnsafe<any[]>(
        `SELECT u.id, u.department, u.functional_manager_id, u.hr_manager_id,
          fm."fullName" as functional_manager_name, hm."fullName" as hr_manager_name
         FROM "User" u
         LEFT JOIN "User" fm ON fm.id = u.functional_manager_id
         LEFT JOIN "User" hm ON hm.id = u.hr_manager_id
         WHERE u.id = $1`,
        userId
      );
      
      return rows[0];
    }, undefined, {
      userId: 'system',
      tenantId: 'unknown',
      domain: 'hr',
      service: 'update-user-org',
      targetUserId: userId
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    logger.error('HR PATCH Org Error:', err);
    if (err instanceof DomainError) {
      let status = 500;
      if (err.code === ErrorCode.NOT_FOUND) status = 404;
      return NextResponse.json({ error: err.message }, { status });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ userId: string }> }) {
  return withIdempotency(req, orgPatchHandler, ctx);
}
