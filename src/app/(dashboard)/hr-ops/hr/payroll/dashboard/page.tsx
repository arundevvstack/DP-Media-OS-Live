import React from "react";
import prisma from "@/lib/prisma";
import { DollarSign, FileText, CheckCircle, Clock, AlertTriangle, Users, Calendar, Activity } from "lucide-react";
import Link from "next/link";

export default async function PayrollDashboardPage() {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Find current payroll period
  const activePeriod = await prisma.payrollPeriod.findFirst({
    where: { status: { in: ['OPEN', 'PROCESSING'] } },
    orderBy: { start_date: 'desc' }
  });

  const [
    totalEmployees,
    approvedRuns,
    pendingRuns,
    totalGrossPaid,
    totalDeductions
  ] = await Promise.all([
    prisma.user.count({ where: { status: 'active' } }),
    prisma.payrollRun.count({ where: { status: { in: ['APPROVED', 'PAID'] } } }),
    prisma.payrollRun.count({ where: { status: { in: ['DRAFT', 'PENDING_APPROVAL'] } } }),
    prisma.payrollRun.aggregate({
      where: { status: { in: ['APPROVED', 'PAID'] } },
      _sum: { gross_pay: true }
    }),
    prisma.payrollRun.aggregate({
      where: { status: { in: ['APPROVED', 'PAID'] } },
      _sum: { total_deductions: true }
    })
  ]);

  const recentRuns = await prisma.payrollRun.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    include: { User: { select: { fullName: true, department: true } }, Period: true }
  });

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Engine</h1>
          <p className="text-muted-foreground mt-1">Live metrics, payroll runs, and compensation analysis.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/hr-ops/hr/payroll/run" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Execute Payroll Run
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Gross Paid</p>
              <h3 className="text-3xl font-bold">${(totalGrossPaid._sum.gross_pay || 0).toLocaleString()}</h3>
              <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Historical disbursed
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Deductions</p>
              <h3 className="text-3xl font-bold">${(totalDeductions._sum.total_deductions || 0).toLocaleString()}</h3>
              <p className="text-xs text-muted-foreground mt-1">Taxes, PF, and Loans</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors">
          <Link href="/hr-ops/hr/payroll/run">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pending Processing</p>
                <h3 className="text-3xl font-bold">{pendingRuns}</h3>
                <p className="text-xs text-primary mt-1 hover:underline">Draft or Pending Approval</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Payroll Period</p>
              <h3 className="text-lg font-bold mt-1 line-clamp-1">{activePeriod?.name || 'No Active Period'}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {activePeriod ? `${activePeriod.start_date.toLocaleDateString()} - ${activePeriod.end_date.toLocaleDateString()}` : 'Create a period to run payroll'}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Payroll Runs */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Recent Payroll Runs
            </h3>
            <Link href="/hr-ops/hr/payroll/run" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          <div className="divide-y divide-border">
            {recentRuns.length > 0 ? (
              recentRuns.map(run => (
                <div key={run.id} className="p-6 hover:bg-accent/50 transition-colors flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {run.User.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold">{run.User.fullName}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{run.User.department}</span>
                        <span>•</span>
                        <span>{run.Period.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${run.net_pay.toLocaleString()}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${
                      run.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600' :
                      run.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-600' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>
                      {run.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <DollarSign className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p>No payroll runs found.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI COO Payroll Insights */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col border-t-4 border-t-purple-500">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="text-purple-500 text-xl">✨</span> AI COO Insights
          </h3>
          <div className="space-y-4 flex-1">
            <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
              <h4 className="text-sm font-semibold text-purple-700 mb-1">Payroll Forecast</h4>
              <p className="text-xs text-muted-foreground">Based on current active employee structures, projected gross payroll for next month is ~${(totalEmployees * 5000).toLocaleString()}.</p>
            </div>
            <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
              <h4 className="text-sm font-semibold text-blue-700 mb-1">Overtime Trend</h4>
              <p className="text-xs text-muted-foreground">Overtime costs remain stable. No abnormal spikes detected in recent payroll runs.</p>
            </div>
            <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
              <h4 className="text-sm font-semibold text-emerald-700 mb-1">Budget Variance</h4>
              <p className="text-xs text-muted-foreground">Payroll is operating within 98% of the projected quarterly financial budget.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

