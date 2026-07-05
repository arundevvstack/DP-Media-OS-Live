export const dynamic = 'force-dynamic';
// @ts-nocheck
import React from "react";
import prisma from "@/lib/prisma";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileText } from "lucide-react";

export default async function LeaveCalendarPage() {
  const users = await prisma.user.findMany({
    where: { status: 'active' },
    select: { id: true, fullName: true, department: true }
  });

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

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

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const approvedLeaves = await prisma.leaveRequest.findMany({
    where: {
      status: 'APPROVED',
      OR: [
        { start_date: { lte: endDate, gte: startDate } },
        { end_date: { lte: endDate, gte: startDate } }
      ]
    },
    include: { LeaveType: true }
  });

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Calendar</h1>
          <p className="text-muted-foreground mt-1">Monthly view of scheduled employee absences.</p>
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
              {users.map(user => {
                const userLeaves = approvedLeaves.filter(l => l.user_id === user.id);
                return (
                  <tr key={user.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4 border-r border-border sticky left-0 bg-card z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      <p className="font-semibold truncate w-[160px]">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate w-[160px]">{user.department}</p>
                    </td>
                    {days.map(d => {
                      const isOnLeave = userLeaves.some(l => {
                        const s = new Date(l.start_date);
                        s.setHours(0,0,0,0);
                        const e = new Date(l.end_date);
                        e.setHours(23,59,59,999);
                        const current = new Date(d.date);
                        current.setHours(12,0,0,0);
                        return current >= s && current <= e;
                      });

                      return (
                        <td key={d.dayNumber} className={`px-2 py-2 border-r border-border text-center ${d.isWeekend ? 'bg-accent/20' : ''}`}>
                          {isOnLeave && !d.isWeekend ? (
                            <div className="w-full h-8 bg-red-500/10 rounded-md flex items-center justify-center border border-red-500/20" title="On Leave">
                              <FileText className="h-4 w-4 text-red-500" />
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

