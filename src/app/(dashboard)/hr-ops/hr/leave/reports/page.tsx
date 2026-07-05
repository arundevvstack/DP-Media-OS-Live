export const dynamic = 'force-dynamic';
// @ts-nocheck
import React from "react";
import prisma from "@/lib/prisma";
import { Download, Search, FileText, Calendar as CalendarIcon, Filter } from "lucide-react";

export default async function LeaveReportsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams.status as string || '';

  const whereClause: any = {};
  if (statusFilter) {
    whereClause.status = statusFilter;
  }

  const requests = await prisma.leaveRequest.findMany({
    where: whereClause,
    include: {
      User: { select: { fullName: true, department: true } },
      LeaveType: true,
      Approvals: { include: { Approver: { select: { fullName: true } } } }
    },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Exportable records of all historical and upcoming leaves.</p>
        </div>
        <button className="px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-secondary/80 flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center justify-between bg-muted/30">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative min-w-[250px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search employee or department..." 
                className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <form className="flex gap-2">
              <div className="relative flex items-center">
                <Filter className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <select name="status" defaultValue={statusFilter} onChange={(e) => e.target.form?.requestSubmit()} className="pl-9 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">All Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </form>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Approver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.length > 0 ? requests.map(req => (
                <tr key={req.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{req.User.fullName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{req.User.department}</td>
                  <td className="px-6 py-4 font-medium">{req.LeaveType?.name || req.type}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" /> {req.start_date.toLocaleDateString()} - {req.end_date.toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">{req.days} day(s)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' :
                      req.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {req.Approvals.length > 0 ? req.Approvals[0].Approver.fullName : '-'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <FileText className="h-10 w-10 mb-3 opacity-20" />
                      <p>No leave records found matching your filters.</p>
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

