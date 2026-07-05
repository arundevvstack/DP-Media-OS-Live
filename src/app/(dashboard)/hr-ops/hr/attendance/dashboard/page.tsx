// @ts-nocheck
import React from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Fingerprint } from 'lucide-react';
import { AttendanceManager } from '../components/attendance-manager';
import { getUserDetails } from '@/lib/auth';

export default async function AttendanceDashboardPage({ searchParams }: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const todayStr = new Date().toISOString().split('T')[0];
  const dateStr = sp.date || todayStr;
  const dateObj = new Date(dateStr + 'T00:00:00.000Z');
  const nextDay = new Date(dateObj); nextDay.setDate(nextDay.getDate() + 1);

  // Auth
  const { userId, companyId } = await getUserDetails();
  if (!userId || !companyId) redirect('/login');
  const company_id = companyId;

  // Parallel data fetch
  const [employees, attendanceRecords, trend] = await Promise.all([
    prisma.user.findMany({
      where: { company_id, role_id: { notIn: ['CLIENT', 'TALENT'] } },
      select: { id: true, fullName: true, department: true, avatar: true },
      orderBy: { fullName: 'asc' },
    }),

    prisma.employeeAttendance.findMany({
      where: { company_id, date: { gte: dateObj, lt: nextDay } },
      select: { id: true, user_id: true, status: true, check_in: true, check_out: true, location: true },
    }),

    // 7-day trend: count present per day
    Promise.all(
      Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        const next = new Date(d); next.setDate(next.getDate() + 1);
        const dateKey = d.toISOString().split('T')[0];
        return prisma.employeeAttendance.count({
          where: {
            company_id,
            date: { gte: d, lt: next },
            status: { in: ['PRESENT', 'LATE'] },
          },
        }).then(present => ({ date: dateKey, present, total: 0 }));
      })
    ),
  ]);

  // Total employees for trend
  const totalEmployees = employees.length;
  const trendWithTotal = trend.map(t => ({ ...t, total: totalEmployees }));

  // Map attendance to employees
  const attMap = new Map(attendanceRecords.map(a => [a.user_id, a]));
  const employeeRows = employees.map(emp => {
    const att = attMap.get(emp.id);
    return {
      id: emp.id,
      fullName: emp.fullName,
      department: emp.department || 'General',
      avatar: emp.avatar,
      attendance: {
        id: att?.id ?? null,
        status: att?.status ?? null,
        check_in:  att?.check_in  ? att.check_in.toISOString()  : null,
        check_out: att?.check_out ? att.check_out.toISOString() : null,
        location:  att?.location  ?? null,
      },
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live workforce attendance · Edit any record inline · Navigate by date
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/hr-ops/hr/attendance/check-in"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Fingerprint className="h-4 w-4" /> Kiosk
          </Link>
        </div>
      </div>

      {/* Interactive manager (client component) */}
      <AttendanceManager
        date={dateStr}
        employees={employeeRows}
        companyId={company_id}
        trend={trendWithTotal}
      />
    </div>
  );
}
