import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import { withIdempotency } from "@/lib/idempotency";
import { logger } from "@/lib/observability/logger";
import crypto from "crypto";

export class AttendanceIdApiService {
    static async handlePATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    }
}
const transactionService = new TransactionService(prisma);
async function attendancePatchHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { check_in, check_out, status } = await req.json();

    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    const updated = await transactionService.runInTransaction(correlationId, async (tx) => {
      // Fetch the record to get the date for building DateTime values
      const existing = await tx.employeeAttendance.findUnique({ where: { id } });
      if (!existing) {
        throw new DomainError('Record not found', ErrorCode.NOT_FOUND);
      }

      const dateStr = existing.date.toISOString().split('T')[0];
      const checkInDt  = check_in  ? new Date(dateStr + 'T' + check_in)  : existing.check_in;
      const checkOutDt = check_out ? new Date(dateStr + 'T' + check_out) : existing.check_out;

      return tx.employeeAttendance.update({
        where: { id },
        data: {
          ...(status    && { status }),
          check_in:  checkInDt,
          check_out: checkOutDt,
        },
      });
    }, undefined, {
      userId: 'system',
      tenantId: 'unknown',
      domain: 'hr',
      service: 'attendance-update',
      attendanceId: id
    });

    return NextResponse.json({
      success: true,
      record: {
        ...updated,
        date:       updated.date.toISOString(),
        check_in:   updated.check_in  ? updated.check_in.toISOString()  : null,
        check_out:  updated.check_out ? updated.check_out.toISOString() : null,
        created_at: updated.created_at ? updated.created_at.toISOString() : null,
        updated_at: updated.updated_at ? updated.updated_at.toISOString() : null,
      }
    });
  } catch (err: any) {
    logger.error('Attendance PATCH Error:', err);
    if (err instanceof DomainError) {
      let status = 500;
      if (err.code === ErrorCode.NOT_FOUND) status = 404;
      return NextResponse.json({ error: err.message }, { status });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}