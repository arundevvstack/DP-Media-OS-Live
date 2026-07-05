export const dynamic = 'force-dynamic';
import React from "react";
import prisma from "@/lib/prisma";
import { FileText, Download, CheckCircle, Search, Mail } from "lucide-react";

export default async function PayslipsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams.q as string || '';

  // Fetch approved or paid payroll runs which act as our payslips
  const payslips = await prisma.payrollRun.findMany({
    where: {
      status: { in: ['APPROVED', 'PAID'] },
      User: { fullName: { contains: q, mode: 'insensitive' } }
    },
    include: {
      User: { select: { fullName: true, department: true } },
      Period: { select: { name: true } }
    },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payslips Register</h1>
          <p className="text-muted-foreground mt-1">Access, download, and distribute employee payslips.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center justify-between">
          <form className="relative min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              name="q"
              defaultValue={q}
              placeholder="Search employee..." 
              className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </form>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-secondary/80 flex items-center gap-2">
              <Mail className="h-4 w-4" /> Distribute All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4 text-right">Gross Pay</th>
                <th className="px-6 py-4 text-right">Net Pay</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payslips.length > 0 ? payslips.map(slip => (
                <tr key={slip.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <p>{slip.User.fullName}</p>
                    <p className="text-xs text-muted-foreground">{slip.User.department}</p>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{slip.Period.name}</td>
                  <td className="px-6 py-4 text-right">${slip.gross_pay.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">${slip.net_pay.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 w-fit px-2.5 py-1 rounded-full">
                      <CheckCircle className="h-3.5 w-3.5" /> Generated
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-accent transition-colors" title="Download PDF">
                      <Download className="h-3.5 w-3.5" /> PDF
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <FileText className="h-10 w-10 mb-3 opacity-20" />
                      <p>No finalized payslips available.</p>
                      <p className="text-xs mt-1">Run and approve payroll first.</p>
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


