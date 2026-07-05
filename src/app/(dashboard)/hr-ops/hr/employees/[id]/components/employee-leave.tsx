// @ts-nocheck
import React from 'react';
import prisma from "@/lib/prisma";
import { Plane, Calendar as CalendarIcon, CheckCircle2, Clock, XCircle, Plus } from "lucide-react";
import { revalidatePath } from "next/cache";

export async function EmployeeLeave({ employeeId, companyId }: { employeeId: string, companyId: string }) {
  const leaves = await prisma.leaveRequest.findMany({
    where: { user_id: employeeId },
    orderBy: { start_date: 'desc' }
  });

  async function requestLeave(formData: FormData) {
    'use server';
    const type = formData.get('type') as string;
    const start_date = new Date(formData.get('start_date') as string);
    const end_date = new Date(formData.get('end_date') as string);
    const reason = formData.get('reason') as string;

    await prisma.leaveRequest.create({
      data: {
        user_id: employeeId,
        company_id: companyId,
        type,
        start_date,
        end_date,
        reason,
        status: 'Pending'
      }
    });
    revalidatePath(`/hr-ops/hr/employees/${employeeId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Leave & Time Off</h3>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Plane className="h-4 w-4" /> Request Leave
        </h4>
        <form action={requestLeave} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-[2] space-y-2">
              <label className="text-sm">Leave Type</label>
              <select name="type" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="ANNUAL">Annual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
                <option value="MATERNITY">Maternity/Paternity</option>
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm">Start Date</label>
              <input type="date" name="start_date" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm">End Date</label>
              <input type="date" name="end_date" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm">Reason (Optional)</label>
            <input type="text" name="reason" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="e.g. Family vacation" />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Submit Request
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {leaves.length > 0 ? leaves.map(leave => (
          <div key={leave.id} className="flex justify-between items-center p-5 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
            <div>
              <h4 className="font-semibold text-lg flex items-center gap-2">
                {leave.type.replace('_', ' ')}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' :
                  leave.status === 'Rejected' ? 'bg-red-500/10 text-red-600' :
                  'bg-amber-500/10 text-amber-600'
                }`}>
                  {leave.status}
                </span>
              </h4>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <CalendarIcon className="h-4 w-4" />
                {new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}
              </p>
              {leave.reason && (
                <p className="text-sm text-foreground/80 mt-2 bg-muted/50 p-2 rounded-md border border-border/50">
                  {leave.reason}
                </p>
              )}
            </div>
            
            {leave.status === 'Pending' && (
              <div className="flex gap-2">
                <form action={async () => {
                  'use server';
                  await prisma.leaveRequest.update({ where: { id: leave.id }, data: { status: 'Approved' } });
                  revalidatePath(`/hr-ops/hr/employees/${employeeId}`);
                }}>
                  <button type="submit" className="p-2 bg-emerald-500/10 text-emerald-600 rounded-md hover:bg-emerald-500/20 transition-colors" title="Approve">
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                </form>
                <form action={async () => {
                  'use server';
                  await prisma.leaveRequest.update({ where: { id: leave.id }, data: { status: 'Rejected' } });
                  revalidatePath(`/hr-ops/hr/employees/${employeeId}`);
                }}>
                  <button type="submit" className="p-2 bg-red-500/10 text-red-600 rounded-md hover:bg-red-500/20 transition-colors" title="Reject">
                    <XCircle className="h-5 w-5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center p-8 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
            No leave requests found.
          </div>
        )}
      </div>
    </div>
  );
}
