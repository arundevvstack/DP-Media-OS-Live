export const dynamic = 'force-dynamic';
import React from "react";
import prisma from "@/lib/prisma";
import { Plus, CheckCircle, XCircle, Search, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function ReimbursementsPage() {
  const users = await prisma.user.findMany({
    where: { status: 'active' },
    select: { id: true, fullName: true, department: true }
  });

  const reimbursements = await prisma.reimbursement.findMany({
    include: { User: { select: { fullName: true, department: true } } },
    orderBy: { created_at: 'desc' }
  });

  async function createReimbursement(formData: FormData) {
    'use server';
    const user_id = formData.get('user_id') as string;
    const type = formData.get('type') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;
    const company_id = (await prisma.company.findFirst())?.id || 'default';

    await prisma.reimbursement.create({
      data: {
        company_id,
        user_id,
        type,
        amount,
        description,
        status: 'PENDING'
      }
    });

    revalidatePath('/hr-ops/hr/payroll/reimbursements');
  }

  async function processClaim(formData: FormData) {
    'use server';
    const claim_id = formData.get('claim_id') as string;
    const action = formData.get('action') as string;

    const claim = await prisma.reimbursement.update({
      where: { id: claim_id },
      data: { status: action },
      include: { User: true }
    });

    if (action === 'APPROVED') {
      await prisma.activityLog.create({
        data: {
          company_id: claim.company_id,
          user_id: claim.user_id,
          user_name: claim.User.fullName,
          action: `${claim.type} reimbursement claim of $${claim.amount} was approved for payroll.`
        }
      });
    }

    revalidatePath('/hr-ops/hr/payroll/reimbursements');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reimbursements & Expenses</h1>
          <p className="text-muted-foreground mt-1">Process employee expense claims for payroll integration.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Submit Claim Form */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Submit Claim
          </h2>
          
          <form action={createReimbursement} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee <span className="text-destructive">*</span></label>
              <select name="user_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="">-- Select Employee --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Expense Category <span className="text-destructive">*</span></label>
              <select name="type" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="TRAVEL">Travel</option>
                <option value="MEDICAL">Medical</option>
                <option value="FOOD">Food & Meals</option>
                <option value="INTERNET">Internet / Telecom</option>
                <option value="ACCOMMODATION">Accommodation</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount <span className="text-destructive">*</span></label>
              <input type="number" step="0.01" name="amount" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="0.00" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea name="description" rows={3} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-y" placeholder="Brief details about the expense..."></textarea>
            </div>

            <div className="p-4 border-2 border-dashed border-border rounded-lg text-center bg-muted/20 text-muted-foreground text-sm flex flex-col items-center">
              <Upload className="h-5 w-5 mb-2 opacity-50" />
              <span>Attach Receipt (Optional)</span>
            </div>

            <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors mt-2">
              Submit Claim
            </button>
          </form>
        </div>

        {/* Claims List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Pending & Processed Claims
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reimbursements.length > 0 ? reimbursements.map(claim => (
                  <tr key={claim.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{claim.User.fullName}</td>
                    <td className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">{claim.type}</td>
                    <td className="px-6 py-4 max-w-[200px] truncate" title={claim.description || ''}>{claim.description || '-'}</td>
                    <td className="px-6 py-4 text-right font-bold">${claim.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        claim.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' :
                        claim.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' :
                        claim.status === 'PAID' ? 'bg-blue-500/10 text-blue-600' : 'bg-red-500/10 text-red-600'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {claim.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <form action={processClaim}>
                            <input type="hidden" name="claim_id" value={claim.id} />
                            <input type="hidden" name="action" value="REJECTED" />
                            <button type="submit" className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Reject">
                              <XCircle className="h-5 w-5" />
                            </button>
                          </form>
                          <form action={processClaim}>
                            <input type="hidden" name="claim_id" value={claim.id} />
                            <input type="hidden" name="action" value="APPROVED" />
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
                      <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>No reimbursement claims found.</p>
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


