// Server component wrapper — fetches logs, passes to the interactive client component
import prisma from '@/lib/prisma';
import { EmployeeAttendanceClient } from './employee-attendance';

export async function EmployeeAttendance({
  employeeId,
  companyId,
}: {
  employeeId: string;
  companyId: string;
}) {
  const logs = await prisma.employeeAttendance.findMany({
    where: { user_id: employeeId },
    orderBy: { date: 'desc' },
    take: 60,
  });

  // Serialize dates so they can be passed as props to the client component
  const serialized = logs.map(l => ({
    ...l,
    date: l.date.toISOString(),
    check_in: l.check_in ? l.check_in.toISOString() : null,
    check_out: l.check_out ? l.check_out.toISOString() : null,
    created_at: l.created_at ? l.created_at.toISOString() : null,
    updated_at: l.updated_at ? l.updated_at.toISOString() : null,
  }));

  return (
    <EmployeeAttendanceClient
      initialLogs={serialized}
      employeeId={employeeId}
      companyId={companyId}
    />
  );
}
