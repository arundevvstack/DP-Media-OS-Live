import React from "react";
import prisma from "@/lib/prisma";
import { Wrench, CheckCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function MaintenancePage() {
  const availableEquipments = await prisma.equipment.findMany({
    orderBy: { name: 'asc' }
  });

  const vendors = await prisma.equipmentVendor.findMany({
    orderBy: { name: 'asc' }
  });

  const activeMaintenance = await prisma.equipmentMaintenance.findMany({
    include: {
      Equipment: true
    },
    orderBy: { start_date: 'desc' }
  });

  async function scheduleMaintenance(formData: FormData) {
    'use server';
    const equipment_id = formData.get('equipment_id') as string;
    const vendor_id = formData.get('vendor_id') as string || null;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const cost = formData.get('cost') ? parseFloat(formData.get('cost') as string) : null;
    
    // Create maintenance record
    await prisma.equipmentMaintenance.create({
      data: { equipment_id, vendor_id, type, description, cost, status: 'SCHEDULED' }
    });

    // Update equipment status
    await prisma.equipment.update({
      where: { id: equipment_id },
      data: { status: 'MAINTENANCE' }
    });

    revalidatePath('/hr-ops/assets/maintenance');
    revalidatePath('/hr-ops/assets/inventory');
    revalidatePath('/hr-ops/assets/dashboard');
  }

  async function completeMaintenance(formData: FormData) {
    'use server';
    const maintenance_id = formData.get('maintenance_id') as string;
    const equipment_id = formData.get('equipment_id') as string;

    await prisma.equipmentMaintenance.update({
      where: { id: maintenance_id },
      data: { status: 'COMPLETED', end_date: new Date() }
    });

    await prisma.equipment.update({
      where: { id: equipment_id },
      data: { status: 'AVAILABLE', condition: 'GOOD' }
    });

    revalidatePath('/hr-ops/assets/maintenance');
    revalidatePath('/hr-ops/assets/inventory');
    revalidatePath('/hr-ops/assets/dashboard');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Maintenance & Repair</h1>
          <p className="text-muted-foreground mt-1">Track AMCs, warranties, and manage hardware servicing logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Maintenance Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-8">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" /> Schedule Service
          </h3>
          <form action={scheduleMaintenance} className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Equipment <span className="text-destructive">*</span></label>
              <select name="equipment_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="">-- Select Asset --</option>
                {availableEquipments.map(eq => (
                  <option key={eq.id} value={eq.id}>[{eq.asset_tag}] {eq.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type</label>
              <select name="type" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="PREVENTIVE">Preventive (Routine)</option>
                <option value="CORRECTIVE">Corrective (Repair)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor / Service Center</label>
              <select name="vendor_id" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="">-- In-House / None --</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Description</label>
              <textarea name="description" required rows={2} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-none"></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Cost ($)</label>
              <input type="number" name="cost" step="0.01" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            </div>

            <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors mt-2">
              Send to Maintenance
            </button>
          </form>
        </div>

        {/* Maintenance Log */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-amber-500/5">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" /> Active Service Orders
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Asset</th>
                    <th className="px-6 py-4">Service Details</th>
                    <th className="px-6 py-4">Cost</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Resolve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeMaintenance.length > 0 ? activeMaintenance.map(m => (
                    <tr key={m.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">{m.Equipment.name}</p>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">{m.Equipment.asset_tag}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{m.type}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{m.description}</p>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-xs">
                        {m.cost ? `$${m.cost.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          m.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' :
                          'bg-amber-500/10 text-amber-600'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {m.status !== 'COMPLETED' ? (
                          <form action={completeMaintenance}>
                            <input type="hidden" name="maintenance_id" value={m.id} />
                            <input type="hidden" name="equipment_id" value={m.equipment_id} />
                            <button type="submit" className="px-3 py-1.5 bg-background border border-emerald-500 text-emerald-600 text-xs font-semibold rounded hover:bg-emerald-500/10 flex items-center gap-1.5 ml-auto">
                              <CheckCircle className="h-3.5 w-3.5" /> Restore
                            </button>
                          </form>
                        ) : (
                          <span className="text-xs text-muted-foreground">Fixed</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                        <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No active maintenance tickets.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
