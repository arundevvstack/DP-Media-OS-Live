// @ts-nocheck
import React from "react";
import prisma from "@/lib/prisma";
import { Clock, Plus, Users, Settings2, Moon } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function ShiftManagementPage() {
  const shifts = await prisma.attendanceShift.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      _count: { select: { Assignments: true } }
    }
  });

  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  const defaultCompanyId = companies[0]?.id || 'default';

  async function createShift(formData: FormData) {
    'use server';
    
    const name = formData.get('name') as string;
    const start_time = formData.get('start_time') as string;
    const end_time = formData.get('end_time') as string;
    const break_duration = parseInt(formData.get('break_duration') as string || '60');
    const grace_period = parseInt(formData.get('grace_period') as string || '15');
    const is_night_shift = formData.get('is_night_shift') === 'on';

    await prisma.attendanceShift.create({
      data: {
        company_id: defaultCompanyId,
        name,
        start_time,
        end_time,
        break_duration,
        grace_period,
        is_night_shift,
        status: 'ACTIVE'
      }
    });

    revalidatePath('/hr-ops/hr/attendance/shifts');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shift Management</h1>
          <p className="text-muted-foreground mt-1">Configure operating hours, grace periods, and night shifts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create Shift Form */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Create New Shift
          </h2>
          
          <form action={createShift} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Shift Name <span className="text-destructive">*</span></label>
              <input type="text" name="name" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="e.g. Morning Shift" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time <span className="text-destructive">*</span></label>
                <input type="time" name="start_time" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time <span className="text-destructive">*</span></label>
                <input type="time" name="end_time" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Break (Mins)</label>
                <input type="number" name="break_duration" defaultValue="60" min="0" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Grace Period (Mins)</label>
                <input type="number" name="grace_period" defaultValue="15" min="0" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 pb-4">
              <input type="checkbox" name="is_night_shift" id="is_night_shift" className="rounded border-border" />
              <label htmlFor="is_night_shift" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                <Moon className="h-4 w-4 text-indigo-500" /> Mark as Night Shift (crosses midnight)
              </label>
            </div>

            <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              Save Shift Configuration
            </button>
          </form>
        </div>

        {/* Shift List */}
        <div className="lg:col-span-2 space-y-4">
          {shifts.length > 0 ? (
            shifts.map(shift => (
              <div key={shift.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl flex items-center justify-center ${shift.is_night_shift ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {shift.is_night_shift ? <Moon className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{shift.name}</h3>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-semibold">{shift.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <span className="font-medium text-foreground">{shift.start_time} - {shift.end_time}</span>
                      <span>•</span>
                      <span>{shift.break_duration}m break</span>
                      <span>•</span>
                      <span>{shift.grace_period}m grace</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col gap-3 justify-end items-end sm:border-l sm:border-border sm:pl-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{shift._count.Assignments} Assigned</span>
                  </div>
                  <Link href={`/hr-ops/hr/attendance/shifts/${shift.id}`} className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                    <Settings2 className="h-4 w-4" /> Manage Assignments
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground shadow-sm">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground mb-1">No Shifts Configured</h3>
              <p>Create your first working shift configuration to start assigning employees.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
