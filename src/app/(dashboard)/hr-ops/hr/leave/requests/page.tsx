export const dynamic = 'force-dynamic';
// @ts-nocheck
import React from "react";
import prisma from "@/lib/prisma";
import { Calendar as CalendarIcon, FileText, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default async function MyLeaveRequestsPage() {
  // In a real app this is derived from session. Using a mock first user for demo purposes
  const me = await prisma.user.findFirst({ where: { status: 'active' } });
  
  if (!me) {
    return <div>No active users found to display requests for.</div>;
  }

  const myRequests = await prisma.leaveRequest.findMany({
    where: { user_id: me.id },
    include: { LeaveType: true, Approvals: { include: { Approver: { select: { fullName: true } } } } },
    orderBy: { created_at: 'desc' }
  });

  const balances = await prisma.leaveBalance.findMany({
    where: { user_id: me.id, year: new Date().getFullYear() },
    include: { LeaveType: true }
  });

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Leave Requests</h1>
          <p className="text-muted-foreground mt-1">Manage your absences and track your available balances.</p>
        </div>
        <Link href="/hr-ops/hr/leave/requests/new" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Apply for Leave
        </Link>
      </div>

      {balances.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances.map(b => (
            <div key={b.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-1">{b.LeaveType.name}</p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-3xl font-bold">{b.balance}</span>
                <span className="text-sm text-muted-foreground mb-1">days left</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col flex-1">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Request History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Days</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {myRequests.length > 0 ? myRequests.map(req => (
                <tr key={req.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{req.LeaveType?.name || req.type}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {req.start_date.toLocaleDateString()} to {req.end_date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{req.days}</td>
                  <td className="px-6 py-4 text-muted-foreground">{req.created_at.toLocaleDateString()}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {req.status === 'PENDING' && <Clock className="h-4 w-4 text-amber-500" />}
                    {req.status === 'APPROVED' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                    {req.status === 'REJECTED' && <XCircle className="h-4 w-4 text-red-500" />}
                    <span className={`font-semibold ${
                      req.status === 'APPROVED' ? 'text-emerald-600' :
                      req.status === 'REJECTED' ? 'text-red-600' : 'text-amber-600'
                    }`}>{req.status}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <p>You have not submitted any leave requests yet.</p>
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

