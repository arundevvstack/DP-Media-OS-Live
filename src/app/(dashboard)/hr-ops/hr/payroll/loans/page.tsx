export const dynamic = 'force-dynamic';
import React from "react";
import prisma from "@/lib/prisma";
import { Plus, CheckCircle, XCircle, Search, DollarSign, Wallet } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function LoansPage() {
  const users = await prisma.user.findMany({
    where: { status: 'active' },
    select: { id: true, fullName: true, department: true }
  });

  const loans = await prisma.loan.findMany({
    include: { User: { select: { fullName: true, department: true } } },
    orderBy: { created_at: 'desc' }
  });

  async function createLoan(formData: FormData) {
    'use server';
    const user_id = formData.get('user_id') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const emi = parseFloat(formData.get('emi') as string);
    const company_id = (await prisma.company.findFirst())?.id || 'default';

    await prisma.loan.create({
      data: {
        company_id,
        user_id,
        amount,
        emi,
        outstanding: amount,
        status: 'PENDING'
      }
    });

    revalidatePath('/hr-ops/hr/payroll/loans');
  }

  async function approveLoan(formData: FormData) {
    'use server';
    const loan_id = formData.get('loan_id') as string;
    const action = formData.get('action') as string;

    const loan = await prisma.loan.update({
      where: { id: loan_id },
      data: { status: action === 'APPROVE' ? 'ACTIVE' : 'REJECTED' },
      include: { User: true }
    });

    if (action === 'APPROVE') {
      await prisma.activityLog.create({
        data: {
          company_id: loan.company_id,
          user_id: loan.user_id,
          user_name: loan.User.fullName,
          action: `Loan of $${loan.amount} was approved.`
        }
      });
    }

    revalidatePath('/hr-ops/hr/payroll/loans');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loans & Advances</h1>
          <p className="text-muted-foreground mt-1">Manage employee financial assistance and EMI deductions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create Loan Form */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Issue Loan
          </h2>
          
          <form action={createLoan} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee <span className="text-destructive">*</span></label>
              <select name="user_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="">-- Select Employee --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.department})</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Principal Amount <span className="text-destructive">*</span></label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="number" step="0.01" name="amount" required className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly EMI Deduction <span className="text-destructive">*</span></label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="number" step="0.01" name="emi" required className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="0.00" />
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors mt-2">
              Submit Request
            </button>
          </form>
        </div>

        {/* Loans List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> Active & Pending Loans
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Monthly EMI</th>
                  <th className="px-6 py-4 text-right">Outstanding</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loans.length > 0 ? loans.map(loan => (
                  <tr key={loan.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{loan.User.fullName}</td>
                    <td className="px-6 py-4 text-right font-semibold">${loan.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-muted-foreground">${loan.emi.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-red-500 font-bold">${loan.outstanding.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        loan.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' :
                        loan.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' :
                        loan.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-600' : 'bg-red-500/10 text-red-600'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {loan.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <form action={approveLoan}>
                            <input type="hidden" name="loan_id" value={loan.id} />
                            <input type="hidden" name="action" value="REJECT" />
                            <button type="submit" className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Reject">
                              <XCircle className="h-5 w-5" />
                            </button>
                          </form>
                          <form action={approveLoan}>
                            <input type="hidden" name="loan_id" value={loan.id} />
                            <input type="hidden" name="action" value="APPROVE" />
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
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <Wallet className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>No loans or advances found.</p>
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


