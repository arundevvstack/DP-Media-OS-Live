// @ts-nocheck
import React from "react";
import prisma from "@/lib/prisma";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function AttendanceCalendarPage() {
  const users = await prisma.user.findMany({
    where: { status: 'active' },
    select: { id: true, fullName: true, department: true }
  });

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Simple mock of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    return {
      date: d,
      dayName: d.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNumber: d.getDate(),
      isWeekend: d.getDay() === 0 || d.getDay() === 6
    };
  });

  // Fetch real attendance records for this month to populate calendar
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  const attendanceRecords = await prisma.employeeAttendance.findMany({
    where: { date: { gte: startDate, lte: endDate } }
  });

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workforce Calendar</h1>
          <p className="text-muted-foreground mt-1">Monthly view of schedules, shifts, and attendance.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" /> 
            {today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 border border-border rounded-md hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
            <button className="px-3 py-1.5 border border-border rounded-md text-sm font-medium hover:bg-accent">Today</button>
            <button className="p-1.5 border border-border rounded-md hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left border-collapse min-w-max">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4 border-r border-border sticky left-0 bg-muted/90 z-10 min-w-[200px]">Employee</th>
                {days.map(d => (
                  <th key={d.dayNumber} className={`px-2 py-3 text-center min-w-[60px] border-r border-border ${d.isWeekend ? 'bg-accent/50' : ''}`}>
                    <div className="text-[10px] uppercase font-bold">{d.dayName}</div>
                    <div className="text-sm text-foreground">{d.dayNumber}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 border-r border-border sticky left-0 bg-card z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    <p className="font-semibold truncate w-[160px]">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate w-[160px]">{user.department}</p>
                  </td>
                  {days.map(d => {
                    const rec = attendanceRecords.find(a => a.user_id === user.id && new Date(a.date).getDate() === d.dayNumber);
                    return (
                      <td key={d.dayNumber} className={`px-2 py-2 border-r border-border text-center ${d.isWeekend ? 'bg-accent/20' : ''}`}>
                        {rec ? (
                          <div title={`Status: ${rec.status}`}>
                            {rec.status === 'PRESENT' ? <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" /> :
                             rec.status === 'LATE' ? <Clock className="h-4 w-4 text-amber-500 mx-auto" /> :
                             <span className="text-[10px] font-bold text-red-500">ABS</span>}
                          </div>
                        ) : d.isWeekend ? (
                          <span className="text-muted-foreground/30 text-[10px]">-</span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-border inline-block mx-auto"></span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
