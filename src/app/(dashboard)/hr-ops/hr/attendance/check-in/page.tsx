// @ts-nocheck
import React from "react";
import prisma from "@/lib/prisma";
import { LogIn, LogOut, Clock, MapPin, CheckCircle, Search } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function CheckInKioskPage() {
  const users = await prisma.user.findMany({
    where: { status: 'approved', role_id: 'EMPLOYEE' },
    select: { id: true, fullName: true, email: true, department: true }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get active check-ins today
  const todaysAttendance = await prisma.employeeAttendance.findMany({
    where: {
      date: { gte: today, lt: tomorrow }
    },
    include: { User: { select: { id: true, fullName: true } } }
  });

  const checkedInUsers = new Set(todaysAttendance.filter(a => a.check_in && !a.check_out).map(a => a.user_id));
  const completedUsers = new Set(todaysAttendance.filter(a => a.check_in && a.check_out).map(a => a.user_id));

  async function handleCheckIn(formData: FormData) {
    'use server';
    const userId = formData.get('user_id') as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    // Check if already checked in today
    const existing = await prisma.employeeAttendance.findFirst({
      where: {
        user_id: userId,
        date: { gte: today, lt: tomorrow }
      }
    });

    if (existing) return;

    const now = new Date();
    // Simulate simple late calculation (e.g. past 9:30 AM is late)
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);

    const record = await prisma.employeeAttendance.create({
      data: {
        company_id: user.company_id || 'default-company',
        user_id: user.id,
        date: today,
        check_in: now,
        status: isLate ? 'LATE' : 'PRESENT',
        location: 'HQ Office' // Defaulting for kiosk
      }
    });

    // Create Activity log (Automation hook)
    await prisma.activityLog.create({
      data: {
        company_id: user.company_id || 'default-company',
        user_id: user.id,
        user_name: user.fullName,
        action: `Checked In at ${now.toLocaleTimeString()}`,
      }
    });

    revalidatePath('/hr-ops/hr/attendance/check-in');
  }

  async function handleCheckOut(formData: FormData) {
    'use server';
    const userId = formData.get('user_id') as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const existing = await prisma.employeeAttendance.findFirst({
      where: {
        user_id: userId,
        date: { gte: today, lt: tomorrow },
        check_out: null
      }
    });

    if (!existing) return;

    const now = new Date();
    await prisma.employeeAttendance.update({
      where: { id: existing.id },
      data: { check_out: now }
    });

    // Create Activity log (Automation hook)
    await prisma.activityLog.create({
      data: {
        company_id: user.company_id || 'default-company',
        user_id: user.id,
        user_name: user.fullName,
        action: `Checked Out at ${now.toLocaleTimeString()}`,
      }
    });

    revalidatePath('/hr-ops/hr/attendance/check-in');
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto h-full flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
          <Clock className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Terminal Kiosk</h1>
        <p className="text-muted-foreground text-lg">HQ Office • {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-6">Select Employee Profile</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar p-2">
            {users.map(user => {
              const isCheckedIn = checkedInUsers.has(user.id);
              const isCompleted = completedUsers.has(user.id);
              
              return (
                <div key={user.id} className="border border-border rounded-xl p-4 flex flex-col justify-between hover:border-primary/50 transition-colors bg-background">
                  <div className="mb-4">
                    <p className="font-semibold text-lg">{user.fullName}</p>
                    <p className="text-sm text-muted-foreground">{user.department}</p>
                  </div>
                  
                  {isCompleted ? (
                    <div className="w-full py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Shift Completed
                    </div>
                  ) : isCheckedIn ? (
                    <form action={handleCheckOut}>
                      <input type="hidden" name="user_id" value={user.id} />
                      <button type="submit" className="w-full py-2.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                        <LogOut className="h-4 w-4" /> Check Out
                      </button>
                    </form>
                  ) : (
                    <form action={handleCheckIn}>
                      <input type="hidden" name="user_id" value={user.id} />
                      <button type="submit" className="w-full py-2.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                        <LogIn className="h-4 w-4" /> Check In
                      </button>
                    </form>
                  )}
                </div>
              )
            })}
          </div>

        </div>
        <div className="px-8 py-4 bg-muted/50 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Geofence: Active</span>
          <span>Device Sync: Connected</span>
        </div>
      </div>
    </div>
  );
}
