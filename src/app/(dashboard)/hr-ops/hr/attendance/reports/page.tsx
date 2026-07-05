// @ts-nocheck
import React from "react";
import prisma from "@/lib/prisma";
import { Download, Search, Edit2, Calendar as CalendarIcon, Clock } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function AttendanceReportsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const dateStr = searchParams.date as string || new Date().toISOString().split('T')[0];
  
  const filterDate = new Date(dateStr);
  filterDate.setHours(0, 0, 0, 0);
  const nextDate = new Date(filterDate);
  nextDate.setDate(nextDate.getDate() + 1);

  const records = await prisma.employeeAttendance.findMany({
    where: {
      date: { gte: filterDate, lt: nextDate }
    },
    include: {
      User: { select: { id: true, fullName: true, department: true } }
    },
    orderBy: { check_in: 'desc' }
  });

  async function updateStatus(formData: FormData) {
    'use server';
    const id = formData.get('record_id') as string;
    const newStatus = formData.get('status') as string;

    await prisma.employeeAttendance.update({
      where: { id },
      data: { status: newStatus }
    });
    revalidatePath('/hr-ops/hr/attendance/reports');
  }

  function calculateHours(checkIn: Date | null, checkOut: Date | null) {
    if (!checkIn || !checkOut) return '-';
    const diff = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
    return diff.toFixed(2) + ' hrs';
  }

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance Log & Reports</h1>
          <p className="text-muted-foreground mt-1">View, correct, and export daily workforce attendance.</p>
        </div>
        <button className="px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-secondary/80 flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center justify-between bg-muted/30">
          <form className="flex items-center gap-4">
            <div className="relative flex items-center max-w-xs">
              <CalendarIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input 
                type="date" 
                name="date"
                defaultValue={dateStr}
                className="pl-9 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
              Filter Date
            </button>
          </form>
          
          <div className="relative min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search employee..." 
              className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.length > 0 ? records.map(record => (
                <tr key={record.id} className="hover:bg-accent/50 transition-colors group">
                  <td className="px-6 py-4 font-medium">{record.User.fullName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{record.User.department}</td>
                  <td className="px-6 py-4">
                    {record.check_in ? (
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-emerald-500" /> {record.check_in.toLocaleTimeString()}</span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {record.check_out ? (
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-blue-500" /> {record.check_out.toLocaleTimeString()}</span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {calculateHours(record.check_in, record.check_out)}
                  </td>
                  <td className="px-6 py-4">
                    <form action={updateStatus} className="inline-block">
                      <input type="hidden" name="record_id" value={record.id} />
                      <select 
                        name="status" 
                        defaultValue={record.status}
                        onChange={(e) => e.target.form?.requestSubmit()}
                        className={`text-xs font-semibold px-2 py-1 rounded-md border-none cursor-pointer focus:ring-2 focus:ring-primary/50 ${
                          record.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-700' :
                          record.status === 'LATE' ? 'bg-amber-500/10 text-amber-700' :
                          record.status === 'ABSENT' ? 'bg-red-500/10 text-red-700' :
                          'bg-muted text-muted-foreground'
                        }`}
                      >
                        <option value="PRESENT">Present</option>
                        <option value="LATE">Late</option>
                        <option value="ABSENT">Absent</option>
                        <option value="EARLY_EXIT">Early Exit</option>
                        <option value="ON_LEAVE">On Leave</option>
                      </select>
                    </form>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Edit Log">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <Clock className="h-10 w-10 mb-3 opacity-20" />
                      <p>No attendance records found for {filterDate.toDateString()}.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
