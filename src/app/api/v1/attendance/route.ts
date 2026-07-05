import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';

// POST /api/v1/attendance — upsert an attendance record
export async function POST(req: NextRequest) {
  try {
    const { user_id, company_id, date, status, check_in, check_out, location } = await req.json();

    if (!user_id || !date) {
      return NextResponse.json({ error: 'user_id and date are required' }, { status: 400 });
    }

    const dateObj = new Date(date + 'T00:00:00.000Z');
    const checkInDt  = check_in  ? new Date(date + 'T' + check_in)  : null;
    const checkOutDt = check_out ? new Date(date + 'T' + check_out) : null;

    // Manual upsert — compound unique @@unique([user_id, date]) not in client types
    const existing = await prisma.employeeAttendance.findFirst({
      where: { user_id, date: dateObj },
    });

    let record;
    if (existing) {
      record = await prisma.employeeAttendance.update({
        where: { id: existing.id },
        data: {
          status,
          ...(checkInDt  !== null && { check_in:  checkInDt }),
          ...(checkOutDt !== null && { check_out: checkOutDt }),
          ...(location && { location }),
        },
      });
    } else {
      record = await prisma.employeeAttendance.create({
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
