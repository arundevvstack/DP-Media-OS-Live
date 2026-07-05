// @ts-nocheck
import React from "react";
import prisma from "@/lib/prisma";
import { Clock, CheckCircle, XCircle, Search, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function OvertimeRequestsPage() {
  const requests = await prisma.overtimeRequest.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      User: { select: { id: true, fullName: true, department: true } },
      Approver: { select: { fullName: true } }
    }
  });

  async function updateOvertimeStatus(formData: FormData) {
    'use server';
    const id = formData.get('request_id') as string;
    const status = formData.get('status') as string;
    // Realistically, the approver_id comes from session, mocking with default logic
    const admin = await prisma.user.findFirst({ where: { role_id: 'Admin' } });

    const updated = await prisma.overtimeRequest.update({
      where: { id },
      data: { 
        status,
        approved_by_id: status === 'APPROVED' ? admin?.id : null
      },
      include: { User: true }
    });

    if (status === 'APPROVED') {
      // Create Activity log (Automation hook)
      await prisma.activityLog.create({
        data: {
          company_id: updated.company_id,
          user_id: updated.user_id,
          user_name: updated.User.fullName,
          action: `Overtime of ${updated.hours} hours approved by Admin.`,
        }
      });
    }

    revalidatePath('/hr-ops/hr/attendance/overtime');
  }

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overtime Management</h1>
          <p className="text-muted-foreground mt-1">Review and approve employee overtime requests.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center justify-between">
          <div className="relative min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search employee or department..." 
              className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <Link href="?status=PENDING" className="px-3 py-1.5 border border-border rounded-md text-sm font-medium transition-colors bg-primary/10 text-primary">
              Pending
            </Link>
            <Link href="?status=APPROVED" className="px-3 py-1.5 border border-border rounded-md text-sm font-medium transition-colors bg-background hover:bg-accent">
              Approved
            </Link>
            <Link href="/hr-ops/hr/attendance/overtime" className="px-3 py-1.5 border border-border rounded-md text-sm font-medium transition-colors bg-background hover:bg-accent">
              All
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Hours</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.length > 0 ? requests.map(req => (
                <tr key={req.id} className="hover:bg-accent/50 transition-colors group">
                  <td className="px-6 py-4 font-medium">{req.User.fullName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{req.User.department}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" /> {req.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold">{req.hours}h</td>
                  <td className="px-6 py-4 max-w-[200px] truncate" title={req.reason || ''}>
                    {req.reason || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' :
                      req.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>
                      {req.status}
                    </span>
                    {req.Approver && (
                      <p className="text-[10px] text-muted-foreground mt-1">by {req.Approver.fullName}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <form action={updateOvertimeStatus}>
                          <input type="hidden" name="request_id" value={req.id} />
                          <input type="hidden" name="status" value="REJECTED" />
                          <button type="submit" className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Reject">
                            <XCircle className="h-5 w-5" />
                          </button>
                        </form>
                        <form action={updateOvertimeStatus}>
                          <input type="hidden" name="request_id" value={req.id} />
                          <input type="hidden" name="status" value="APPROVED" />
                          <button type="submit" className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors" title="Approve">
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs font-medium">Processed</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <Clock className="h-10 w-10 mb-3 opacity-20" />
                      <p>No overtime requests found.</p>
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
