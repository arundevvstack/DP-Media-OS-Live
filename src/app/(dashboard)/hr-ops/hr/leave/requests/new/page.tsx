// @ts-nocheck
import React from "react";
import prisma from "@/lib/prisma";
import { ArrowLeft, Save, Calendar as CalendarIcon, FileText, Info } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserDetails } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function NewLeaveRequestPage() {
  const { userId, roleId } = await getUserDetails();
  const isEmployee = roleId === 'EMPLOYEE' || roleId === 'TALENT' || roleId === 'CLIENT';

  const users = await prisma.user.findMany({
    where: { 
      ...(isEmployee && userId ? { id: userId } : {})
    },
    select: { id: true, fullName: true, department: true }
  });

  const leaveTypes = await prisma.leaveType.findMany();

  async function submitLeaveRequest(formData: FormData) {
    'use server';
    
    const user_id = formData.get('user_id') as string;
    const leave_type_id = formData.get('leave_type_id') as string;
    const start_date = new Date(formData.get('start_date') as string);
    const end_date = new Date(formData.get('end_date') as string);
    const reason = formData.get('reason') as string;

    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (!user) throw new Error("User not found");

    // Calculate days (simple exclusion of weekends could go here via a business rule)
    const diffTime = Math.abs(end_date.getTime() - start_date.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Defaulting to "Sick Leave" or equivalent for backward compatibility field
    const lt = await prisma.leaveType.findUnique({ where: { id: leave_type_id }});

    const request = await prisma.leaveRequest.create({
      data: {
        user_id,
        leave_type_id,
        start_date,
        end_date,
        days,
        reason,
        status: 'PENDING'
      }
    });

    // Removed LeaveApproval logic because LeaveRequest handles approval state itself via 'status' field.

    // Activity Timeline integration
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        company_id: user.company_id || 'default',
        user_id: user.id,
        user_name: user.fullName,
        action: `Applied for ${days} days of ${lt?.name || 'Leave'}.`
      }
    });

    redirect('/hr-ops/hr/leave/dashboard');
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex items-center gap-4">
        <Link href="/hr-ops/hr/leave/dashboard" className="p-2 border border-border bg-card rounded-md hover:bg-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Apply for Leave</h1>
          <p className="text-muted-foreground mt-1">Submit an absence request for approval.</p>
        </div>
      </div>

      <form action={submitLeaveRequest} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">
          
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-700 p-4 rounded-lg flex gap-3 text-sm">
            <Info className="h-5 w-5 shrink-0" />
            <p>Your request will be routed to your functional manager for approval. Ensure your dates do not overlap with scheduled operational shifts.</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
              <FileText className="h-5 w-5 text-primary" /> Request Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee <span className="text-destructive">*</span></label>
                {isEmployee ? (
                  <div className="w-full px-3 py-2 border border-border rounded-md bg-muted text-sm font-medium text-muted-foreground cursor-not-allowed">
                    {users[0]?.fullName || "Current User"}
                    <input type="hidden" name="user_id" value={userId || ""} />
                  </div>
                ) : (
                  <select name="user_id" required defaultValue={userId || ""} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                    <option value="">-- Select Employee --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.fullName}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Leave Type <span className="text-destructive">*</span></label>
                <select name="leave_type_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                  {leaveTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>{lt.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
              <CalendarIcon className="h-5 w-5 text-primary" /> Duration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date <span className="text-destructive">*</span></label>
                <input type="date" name="start_date" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date <span className="text-destructive">*</span></label>
                <input type="date" name="end_date" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
              Reason & Comments
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Leave</label>
              <textarea name="reason" rows={4} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-y" placeholder="Optional context for your manager..." />
            </div>
          </section>

        </div>
        <div className="px-6 py-4 bg-muted/50 border-t border-border flex justify-end gap-3">
          <Link href="/hr-ops/hr/leave/dashboard" className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors">
            Cancel
          </Link>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Save className="h-4 w-4" /> Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}
