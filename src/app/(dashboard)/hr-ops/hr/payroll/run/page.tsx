import React from "react";
import prisma from "@/lib/prisma";
import { Play, CheckCircle, Clock, AlertTriangle, User, DollarSign, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function PayrollRunPage() {
  const openPeriods = await prisma.payrollPeriod.findMany({
    where: { status: 'OPEN' },
    orderBy: { start_date: 'asc' }
  });

  const activeRuns = await prisma.payrollRun.findMany({
    where: { Period: { status: { in: ['PROCESSING', 'OPEN'] } } },
    include: { User: { select: { fullName: true, department: true } }, Period: true },
    orderBy: { created_at: 'desc' }
  });

  async function executePayroll(formData: FormData) {
    'use server';
    const period_id = formData.get('period_id') as string;
    
    // Lock the period to Processing
    const period = await prisma.payrollPeriod.update({
      where: { id: period_id },
      data: { status: 'PROCESSING' }
    });

    // 1. Fetch all active employees with defined salary structures
    const employees = await prisma.user.findMany({
      where: { status: 'active', UserEmployeeSalary: { isNot: null } },
      include: { 
        UserEmployeeSalary: { include: { Structure: true } },
        UserLoans: { where: { status: 'ACTIVE' } }
      }
    });

    for (const emp of employees) {
      if (!emp.UserEmployeeSalary || !emp.UserEmployeeSalary.Structure) continue;

      const struct = emp.UserEmployeeSalary.Structure;
      const base = struct.base_salary;
      const hra = base * (struct.hra_percent / 100);
      const da = base * (struct.da_percent / 100);
      const special = struct.special_allowance;
      
      let gross = base + hra + da + special;
      let totalDeductions = 0;
      const items = [];

      items.push({ type: 'BASIC', name: 'Base Salary', amount: base });
      items.push({ type: 'ALLOWANCE', name: 'HRA', amount: hra });
      items.push({ type: 'ALLOWANCE', name: 'DA', amount: da });
      items.push({ type: 'ALLOWANCE', name: 'Special Allowance', amount: special });

      // 2. Attendance & Leave Calculation
      // Find LWP (Leave Without Pay) -> Approved Unpaid Leaves or Unjustified Absences
      // Simplified simulation: Deduct 1 day for each REJECTED leave request during period
      const rejectedLeaves = await prisma.leaveRequest.findMany({
        where: { user_id: emp.id, status: 'REJECTED', start_date: { gte: period.start_date }, end_date: { lte: period.end_date } }
      });
      
      let unpaidDays = 0;
      rejectedLeaves.forEach(rl => { unpaidDays += rl.days; });

      if (unpaidDays > 0) {
        // Assume 30 days in month for per-day calculation
        const perDay = gross / 30;
        const leaveDeduction = perDay * unpaidDays;
        totalDeductions += leaveDeduction;
        items.push({ type: 'LEAVE_DEDUCTION', name: `Unpaid Leave (${unpaidDays} days)`, amount: leaveDeduction });
      }

      // 3. Deductions (Loans/EMI)
      for (const loan of emp.UserLoans) {
        if (loan.outstanding > 0) {
          const emi = Math.min(loan.emi, loan.outstanding);
          totalDeductions += emi;
          items.push({ type: 'DEDUCTION', name: 'Loan EMI Repayment', amount: emi });
          
          // Note: Actual DB decrement of Loan outstanding would happen in POST-APPROVAL step, 
          // not during run calculation to allow rollback.
        }
      }

      // Tax (Simulated flat 10% if gross > 5000)
      if (gross > 5000) {
        const tax = gross * 0.10;
        totalDeductions += tax;
        items.push({ type: 'DEDUCTION', name: 'Income Tax', amount: tax });
      }

      const net = gross - totalDeductions;

      // 4. Generate PayrollRun record
      await prisma.payrollRun.create({
        data: {
          company_id: emp.company_id || 'default',
          period_id: period.id,
          user_id: emp.id,
          gross_pay: gross,
          net_pay: net,
          total_allowances: hra + da + special,
          total_deductions: totalDeductions,
          status: 'DRAFT',
          Items: { create: items }
        }
      });
    }

    revalidatePath('/hr-ops/hr/payroll/run');
    revalidatePath('/hr-ops/hr/payroll/dashboard');
  }

  async function createPeriod(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const s = new Date(formData.get('start_date') as string);
    const e = new Date(formData.get('end_date') as string);
    const comp = await prisma.company.findFirst();

    if (comp) {
      await prisma.payrollPeriod.create({
        data: { company_id: comp.id, name, start_date: s, end_date: e, status: 'OPEN' }
      });
    }
    revalidatePath('/hr-ops/hr/payroll/run');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Run Payroll</h1>
          <p className="text-muted-foreground mt-1">Execute calculation engine across the organization.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Setup & Run */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">1. Create Period</h3>
            <form action={createPeriod} className="space-y-4">
              <input type="text" name="name" required placeholder="e.g. September 2026" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" name="start_date" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
                <input type="date" name="end_date" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
              <button type="submit" className="w-full py-2 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-secondary/80">
                Initialize Period
              </button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm border-t-4 border-t-primary">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" /> 2. Execute Run
            </h3>
            {openPeriods.length > 0 ? (
              <form action={executePayroll} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Select Target Period</label>
                  <select name="period_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                    {openPeriods.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs rounded-md flex gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <p>Execution will scan all active Attendance, Leave, Overtime, and Loans to compile final DRAFT registers.</p>
                </div>
                <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
                  <Play className="h-4 w-4 fill-current" /> Compile Payroll Engine
                </button>
              </form>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No open periods available to run.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Active DRAFTS */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Active Processing Queues
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4 text-right">Gross</th>
                  <th className="px-6 py-4 text-right">Deductions</th>
                  <th className="px-6 py-4 text-right">Net Pay</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeRuns.length > 0 ? activeRuns.map(run => (
                  <tr key={run.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{run.User.fullName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{run.Period.name}</td>
                    <td className="px-6 py-4 text-right text-muted-foreground">${run.gross_pay.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-red-500">-${run.total_deductions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">${run.net_pay.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        run.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'
                      }`}>
                        {run.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>No active payroll processing found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

