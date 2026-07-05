import React from "react";
import prisma from "@/lib/prisma";
import { Plus, Settings2, Percent, DollarSign, Users } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function SalaryStructuresPage() {
  const structures = await prisma.salaryStructure.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { EmployeeSalaries: true } } }
  });

  const companies = await prisma.company.findMany({ select: { id: true } });
  const defaultCompany = companies[0]?.id || 'default';

  async function createStructure(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const base_salary = parseFloat(formData.get('base_salary') as string);
    const hra_percent = parseFloat(formData.get('hra_percent') as string);
    const da_percent = parseFloat(formData.get('da_percent') as string);
    const special_allowance = parseFloat(formData.get('special_allowance') as string);

    await prisma.salaryStructure.create({
      data: {
        company_id: defaultCompany,
        name,
        base_salary,
        hra_percent,
        da_percent,
        special_allowance
      }
    });

    revalidatePath('/hr-ops/hr/payroll/salary-structures');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salary Structures</h1>
          <p className="text-muted-foreground mt-1">Define standard compensation frameworks for employment tiers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create Structure Form */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> New Structure
          </h2>
          
          <form action={createStructure} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Framework Name <span className="text-destructive">*</span></label>
              <input type="text" name="name" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="e.g. Executive Tier 1" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Salary (Fixed) <span className="text-destructive">*</span></label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="number" step="0.01" name="base_salary" required className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="0.00" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">HRA % <span className="text-destructive">*</span></label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="number" step="0.1" name="hra_percent" required className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="40" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">DA % <span className="text-destructive">*</span></label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="number" step="0.1" name="da_percent" required className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="10" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Special Allowance (Fixed) <span className="text-destructive">*</span></label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="number" step="0.01" name="special_allowance" required className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="0.00" />
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors mt-2">
              Save Structure
            </button>
          </form>
        </div>

        {/* Structures List */}
        <div className="lg:col-span-2 space-y-4">
          {structures.length > 0 ? (
            structures.map(structure => (
              <div key={structure.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                    <Settings2 className="h-6 w-6" />
                  </div>
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full">
                      <h3 className="font-bold text-lg">{structure.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${structure.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                        {structure.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Base</p>
                        <p className="text-sm font-semibold">${structure.base_salary.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">HRA</p>
                        <p className="text-sm font-semibold">{structure.hra_percent}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">DA</p>
                        <p className="text-sm font-semibold">{structure.da_percent}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Special</p>
                        <p className="text-sm font-semibold">${structure.special_allowance.toLocaleString()}</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" /> <strong>{structure._count.EmployeeSalaries}</strong> Employees assigned
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground shadow-sm">
              <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground mb-1">No Structures Configured</h3>
              <p>Create a salary structure to begin managing employee compensation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

