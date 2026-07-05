export const dynamic = 'force-dynamic';
import React from "react";
import prisma from "@/lib/prisma";
import { CheckCircle, XCircle, Search, Calendar as CalendarIcon, Clock } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getUserDetails } from "@/lib/auth";

export default async function LeaveApprovalsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams.status as string || 'PENDING';
  
  const { userId, roleId } = await getUserDetails();
  
  // Only HR/Admins should see this
  const isAdmin = roleId === 'SUPER_ADMIN' || roleId === 'HR_MANAGER' || roleId === 'ADMIN';

  // Fetch LeaveRequests directly
  const requests = await prisma.leaveRequest.findMany({
    where: { status: statusFilter },
    include: {
      User: { select: { fullName: true, department: true } },
      LeaveType: { select: { name: true } }
    },
    orderBy: { created_at: 'desc' }
  });

  async function processApproval(formData: FormData) {
    'use server';
    const requestId = formData.get('request_id') as string;
    const action = formData.get('action') as string; // APPROVED or REJECTED
    const comments = formData.get('comments') as string;

    const { userId: approverId } = await getUserDetails();

    const parentRequest = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status: action },
      include: { User: true, LeaveType: true }
    });
    
    // We need approver info for the ActivityLog
    const approver = approverId ? await prisma.user.findUnique({ where: { id: approverId } }) : null;

    // EventBus / Automation: Update Attendance dynamically if Approved
    if (action === 'APPROVED') {
      const start = new Date(parentRequest.start_date);
      const end = new Date(parentRequest.end_date);
      
      // Seed EmployeeAttendance records for the leave days
      const days = [];
      for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        if (dt.getDay() !== 0 && dt.getDay() !== 6) { // Exclude weekends
          days.push({
            user_id: parentRequest.user_id,
            company_id: parentRequest.User?.company_id || 'default',
            date: new Date(dt),
            status: 'ON_LEAVE'
          });
        }
      }

      if (days.length > 0) {
        await prisma.employeeAttendance.createMany({ data: days, skipDuplicates: true });
      }

      // Decrement Leave Balance dynamically
      if (parentRequest.leave_type_id) {
        const balance = await prisma.leaveBalance.findFirst({
          where: { 
            user_id: parentRequest.user_id, 
            leave_type_id: parentRequest.leave_type_id,
            year: new Date().getFullYear()
          }
        });

        if (balance) {
          await prisma.leaveBalance.update({
            where: { id: balance.id },
            data: { used: { increment: parentRequest.days }, balance: { decrement: parentRequest.days } }
          });
        }
      }

      // ActivityLog
      await prisma.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          company_id: approver?.company_id || 'default',
          user_id: parentRequest.user_id,
          user_name: parentRequest.User.fullName,
          action: `Leave request for ${parentRequest.days} days of ${parentRequest.LeaveType?.name || 'Leave'} was APPROVED by ${approver?.fullName || 'Admin'}.`
        }
      });
    }

    revalidatePath('/hr-ops/hr/leave/approvals');
    revalidatePath('/hr-ops/hr/leave/dashboard');

    // Push to eTimeOffice if this is an approval
    if (action === 'APPROVED') {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/integrations/etimeoffice/push-leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leaveRequestId: requestId })
        });
      } catch {
        // Non-blocking — if eTimeOffice push fails, leave approval still succeeds
      }
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Approvals</h1>
          <p className="text-muted-foreground mt-1">Review and process employee leave requests.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center justify-between">
          <div className="relative min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search employee..." 
              className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <Link href="?status=PENDING" className={`px-3 py-1.5 border border-border rounded-md text-sm font-medium transition-colors ${statusFilter === 'PENDING' ? 'bg-primary/10 text-primary' : 'bg-background hover:bg-accent'}`}>
              Pending
            </Link>
            <Link href="?status=APPROVED" className={`px-3 py-1.5 border border-border rounded-md text-sm font-medium transition-colors ${statusFilter === 'APPROVED' ? 'bg-primary/10 text-primary' : 'bg-background hover:bg-accent'}`}>
              Approved
            </Link>
            <Link href="?status=REJECTED" className={`px-3 py-1.5 border border-border rounded-md text-sm font-medium transition-colors ${statusFilter === 'REJECTED' ? 'bg-primary/10 text-primary' : 'bg-background hover:bg-accent'}`}>
              Rejected
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Dates & Duration</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.length > 0 ? requests.map(request => (
                <tr key={request.id} className="hover:bg-accent/50 transition-colors group">
                  <td className="px-6 py-4 font-medium">{request.User?.fullName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{request.User?.department || '-'}</td>
                  <td className="px-6 py-4 font-medium">{request.LeaveType?.name || 'Leave'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" /> {request.start_date.toLocaleDateString()} - {request.end_date.toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">{request.days} day(s)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate" title={request.reason || ''}>
                    {request.reason || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {request.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <form action={processApproval}>
                          <input type="hidden" name="request_id" value={request.id} />
                          <input type="hidden" name="action" value="REJECTED" />
                          <button type="submit" className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Reject">
                            <XCircle className="h-5 w-5" />
                          </button>
                        </form>
                        <form action={processApproval}>
                          <input type="hidden" name="request_id" value={request.id} />
                          <input type="hidden" name="action" value="APPROVED" />
                          <button type="submit" className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors" title="Approve">
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        request.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                      }`}>
                        {request.status}
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <Clock className="h-10 w-10 mb-3 opacity-20" />
                      <p>No {statusFilter.toLowerCase()} requests found.</p>
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

