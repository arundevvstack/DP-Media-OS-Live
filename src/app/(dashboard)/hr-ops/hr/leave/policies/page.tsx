// @ts-nocheck
import React from "react";
import prisma from "@/lib/prisma";
import { Plus, Settings2, Shield, Calendar, Layers } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserDetails } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function LeavePoliciesPage() {
  const { roleId } = await getUserDetails();
  const isEmployee = roleId === 'EMPLOYEE' || roleId === 'TALENT' || roleId === 'CLIENT';

  const policies = await prisma.leaveType.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { LeaveRequest: true } }
    }
  });

  const companies = await prisma.company.findMany({ select: { id: true } });
  const defaultCompany = companies[0]?.id || 'default';

  async function createPolicy(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const description = formData.get('code') as string;
    
    await prisma.leaveType.create({
      data: {
        company_id: defaultCompany,
        name,
        description
      }
    });

    revalidatePath('/hr-ops/hr/leave/policies');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Policies</h1>
          <p className="text-muted-foreground mt-1">Configure leave types, accrual rules, and carry-forward balances.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create Policy Form */}
        {!isEmployee && (
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Create Leave Type
            </h2>
          
          <form action={createPolicy} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Policy Name <span className="text-destructive">*</span></label>
              <input type="text" name="name" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="e.g. Annual Leave" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Policy Code <span className="text-destructive">*</span></label>
              <input type="text" name="code" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm uppercase" placeholder="e.g. AL" />
            </div>

            <div className="flex items-center gap-2 pt-2 pb-4">
              <input type="checkbox" name="is_paid" id="is_paid" defaultChecked className="rounded border-border" />
              <label htmlFor="is_paid" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                <Shield className="h-4 w-4 text-emerald-500" /> Paid Leave (deducts from balance)
              </label>
            </div>

            <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              Save Policy
            </button>
          </form>
        </div>
        )}

        {/* Policies List */}
        <div className={isEmployee ? "lg:col-span-3 space-y-4" : "lg:col-span-2 space-y-4"}>
          {policies.length > 0 ? (
            policies.map(policy => (
              <div key={policy.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{policy.name}</h3>
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-semibold">{policy.description || 'LEAVE'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{policy._count.LeaveRequest} Requests Processed</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col gap-3 justify-end items-end sm:border-l sm:border-border sm:pl-6">
                  <Link href={`/hr-ops/hr/leave/policies/${policy.id}`} className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                    <Settings2 className="h-4 w-4" /> View Rules & Accruals
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground shadow-sm">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground mb-1">No Policies Configured</h3>
              <p>Create your first leave policy to start managing employee absences.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
