import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH /api/v1/attendance/[id] — update check_in, check_out, status on an existing record
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { check_in, check_out, status } = await req.json();

    // Fetch the record to get the date for building DateTime values
    const existing = await prisma.employeeAttendance.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const dateStr = existing.date.toISOString().split('T')[0];
    const checkInDt  = check_in  ? new Date(dateStr + 'T' + check_in)  : existing.check_in;
    const checkOutDt = check_out ? new Date(dateStr + 'T' + check_out) : existing.check_out;

    const updated = await prisma.employeeAttendance.update({
      where: { id },
      data: {
        ...(status    && { status }),
        check_in:  checkInDt,
        check_out: checkOutDt,
      },
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
