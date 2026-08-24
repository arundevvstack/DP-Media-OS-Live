import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import { withIdempotency } from "@/lib/idempotency";
import { logger } from "@/lib/observability/logger";
import crypto from "crypto";

export class AttendanceApiService {
    static async handlePOST(req: NextRequest) {
    }
}
const transactionService = new TransactionService(prisma);
async function attendancePostHandler(req: NextRequest) {
  try {
    const { user_id, company_id, date, status, check_in, check_out, location } = await req.json();

    if (!user_id || !date) {
      return NextResponse.json({ error: 'user_id and date are required' }, { status: 400 });
    }

    const dateObj = new Date(date + 'T00:00:00.000Z');
    const checkInDt  = check_in  ? new Date(date + 'T' + check_in)  : null;
    const checkOutDt = check_out ? new Date(date + 'T' + check_out) : null;
    
    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    const record = await transactionService.runInTransaction(correlationId, async (tx) => {
      // Manual upsert — compound unique @@unique([user_id, date]) not in client types
      const existing = await tx.employeeAttendance.findFirst({
        where: { user_id, date: dateObj },
      });

      if (existing) {
        // Prevent duplicate creation with same initial params if not actually an update
        if (!check_in && !check_out && existing.status === (status || 'PRESENT')) {
          throw new DomainError("Duplicate attendance record for this date already exists", ErrorCode.CONFLICT);
        }
        
        return tx.employeeAttendance.update({
          where: { id: existing.id },
          data: {
            status,
            ...(checkInDt  !== null && { check_in:  checkInDt }),
            ...(checkOutDt !== null && { check_out: checkOutDt }),
            ...(location && { location }),
          },
        });
      } else {
        return tx.employeeAttendance.create({
          data: {
            id: randomUUID(),
            user_id,
            company_id: company_id || '',
            date: dateObj,
            status: status || 'PRESENT',
            check_in:  checkInDt,
            check_out: checkOutDt,
            location:  location || 'Office - Head Quarters',
          },
        });
      }
    }, undefined, {
      userId: user_id,
      tenantId: company_id || 'unknown',
      domain: 'hr',
      service: 'attendance-upsert'
    });

    return NextResponse.json({
      success: true,
      record: {
        ...record,
        date:       record.date.toISOString(),
        check_in:   record.check_in  ? record.check_in.toISOString()  : null,
        check_out:  record.check_out ? record.check_out.toISOString() : null,
        created_at: record.created_at ? record.created_at.toISOString() : null,
        updated_at: record.updated_at ? record.updated_at.toISOString() : null,
      }
    });
  } catch (err: any) {
    logger.error('Attendance POST Error:', err);
    if (err instanceof DomainError) {
      let status = 500;
      if (err.code === ErrorCode.CONFLICT) status = 409;
      return NextResponse.json({ error: err.message }, { status });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}