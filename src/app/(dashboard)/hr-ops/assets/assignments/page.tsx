export const dynamic = 'force-dynamic';
import React from "react";
import prisma from "@/lib/prisma";
import { UserCheck, Laptop, RotateCcw, Activity } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AssignmentsPage() {
  const users = await prisma.user.findMany({
    where: { status: 'active' },
    select: { id: true, fullName: true, department: true }
  });

  const availableEquipments: any[] = [];
  const activeAssignments: any[] = [];

  async function assignAsset(formData: FormData) {
    'use server';
    // Mock action
    revalidatePath('/hr-ops/assets/assignments');
    revalidatePath('/hr-ops/assets/dashboard');
  }

  async function returnAsset(formData: FormData) {
    'use server';
    const assignment_id = formData.get('assignment_id') as string;
    const equipment_id = formData.get('equipment_id') as string;
    const condition_in = formData.get('condition_in') as string;

    await prisma.equipmentAssignment.update({
      where: { id: assignment_id },
      data: { status: 'RETURNED', returned_at: new Date(), condition_in }
    });

    await prisma.equipment.update({
      where: { id: equipment_id },
      data: { status: 'AVAILABLE', condition: condition_in }
    });

    revalidatePath('/hr-ops/assets/assignments');
    revalidatePath('/hr-ops/assets/inventory');
    revalidatePath('/hr-ops/assets/dashboard');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Assignments</h1>
          <p className="text-muted-foreground mt-1">Deploy hardware to employees, enforce liability, and manage offboarding retrievals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Assignment Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-8">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" /> Deploy Asset
          </h3>
          <form action={assignAsset} className="space-y-5">
            
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
              <label className="text-sm font-medium">Select Available Equipment <span className="text-destructive">*</span></label>
              <select name="equipment_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="">-- Select Asset --</option>
                {availableEquipments.map(eq => (
                  <option key={eq.id} value={eq.id}>[{eq.asset_tag}] {eq.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Condition at Checkout</label>
              <select name="condition_out" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="NEW">New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
              </select>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex gap-3 text-sm text-primary">
              <Activity className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Deploying this asset will automatically trigger an ActivityLog event and require digital acknowledgement from the employee.</p>
            </div>

            <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              Process Assignment
            </button>
          </form>
        </div>

        {/* Active Assignments */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Laptop className="h-5 w-5 text-primary" /> Currently Deployed
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Asset Details</th>
                  <th className="px-6 py-4">Checkout Date</th>
                  <th className="px-6 py-4 text-right">Return Asset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeAssignments.length > 0 ? activeAssignments.map(a => (
                  <tr key={a.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{a.User.fullName}</p>
                      <p className="text-xs text-muted-foreground">{a.User.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{a.Equipment.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{a.Equipment.asset_tag}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {a.assigned_at.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={returnAsset} className="flex flex-col items-end gap-2">
                        <input type="hidden" name="assignment_id" value={a.id} />
                        <input type="hidden" name="equipment_id" value={a.equipment_id} />
                        <div className="flex items-center gap-2">
                          <select name="condition_in" required className="text-xs px-2 py-1 border border-border rounded bg-background">
                            <option value="GOOD">Return: Good</option>
                            <option value="FAIR">Return: Fair</option>
                            <option value="POOR">Return: Poor</option>
                            <option value="BROKEN">Return: Broken</option>
                          </select>
                          <button type="submit" className="p-1.5 text-blue-600 hover:bg-blue-500/10 rounded-md transition-colors" title="Process Return">
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground">
                      <UserCheck className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>No active assignments.</p>
                      <p className="text-xs mt-1">All deployed equipment will appear here.</p>
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

