import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserDetails } from '@/lib/auth';

// GET /api/v1/attendance/by-date?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Get company_id from session
    const { userId, companyId } = await getUserDetails();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company_id = companyId;
    if (!company_id) return NextResponse.json({ error: 'No company' }, { status: 400 });

    const dateObj = new Date(dateParam + 'T00:00:00.000Z');
    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    // Fetch all employees + their attendance for the date
    const [employees, attendanceRecords] = await Promise.all([
      prisma.user.findMany({
        where: { company_id, role_id: { in: ['EMPLOYEE', 'SUPER_ADMIN'] } },
        select: { id: true, fullName: true, department: true, avatar: true },
        orderBy: { fullName: 'asc' },
      }),
      prisma.employeeAttendance.findMany({
        where: { company_id, date: { gte: dateObj, lt: nextDay } },
        select: { id: true, user_id: true, status: true, check_in: true, check_out: true, location: true },
      }),
    ]);

    // Build attendance map
    const attMap = new Map(attendanceRecords.map(a => [a.user_id, a]));

    const result = employees.map(emp => {
      const att = attMap.get(emp.id);
      return {
        id: emp.id,
        fullName: emp.fullName,
        department: emp.department || 'General',
        avatar: emp.avatar,
        attendance: {
          id: att?.id || null,
          status: att?.status || null,
          check_in: att?.check_in ? att.check_in.toISOString() : null,
          check_out: att?.check_out ? att.check_out.toISOString() : null,
          location: att?.location || null,
        },
      };
    });

    return NextResponse.json({ employees: result, date: dateParam });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
