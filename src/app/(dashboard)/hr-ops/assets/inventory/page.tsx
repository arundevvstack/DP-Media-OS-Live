export const dynamic = 'force-dynamic';
import React from "react";
import prisma from "@/lib/prisma";
import { Search, Plus, Laptop, Camera, ShieldAlert, MonitorCheck, Car } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function InventoryPage() {
  const categories: any[] = [];
  const vendors: any[] = [];
  const equipments: any[] = [];

  async function registerAsset(formData: FormData) {
    'use server';
    // Mock action
    revalidatePath('/hr-ops/assets/inventory');
    revalidatePath('/hr-ops/assets/dashboard');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Asset Inventory</h1>
          <p className="text-muted-foreground mt-1">Global catalog for IT hardware, media production gear, and facility resources.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Register Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-fit xl:col-span-1">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Register Equipment
          </h3>
          <form action={registerAsset} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Asset Name <span className="text-destructive">*</span></label>
              <input type="text" name="name" required placeholder="e.g. MacBook Pro M3" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Asset Tag (Unique) <span className="text-destructive">*</span></label>
              <input type="text" name="asset_tag" required placeholder="e.g. DP-IT-001" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm font-mono" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Serial No.</label>
                <input type="text" name="serial_number" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <input type="text" name="type" placeholder="e.g. Laptop" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category <span className="text-destructive">*</span></label>
              <select name="category_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="">-- Select Category --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor / Supplier</label>
              <select name="vendor_id" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="">-- None --</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Condition</label>
                <select name="condition" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                  <option value="NEW">New</option>
                  <option value="GOOD">Good / Used</option>
                  <option value="FAIR">Fair (Needs TLC)</option>
                  <option value="POOR">Poor</option>
                  <option value="BROKEN">Broken / Needs Repair</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location / Studio</label>
                <input type="text" name="location" placeholder="e.g. Studio A" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 mt-4 transition-colors">
              Add to Inventory
            </button>
          </form>
        </div>

        {/* Inventory List */}
        <div className="xl:col-span-3 bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center gap-4 bg-muted/20">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search by name, tag, or serial..." className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-border bg-background rounded-lg text-sm font-medium hover:bg-accent transition-colors flex items-center gap-2">
                <MonitorCheck className="h-4 w-4" /> Filter IT
              </button>
              <button className="px-4 py-2 border border-border bg-background rounded-lg text-sm font-medium hover:bg-accent transition-colors flex items-center gap-2">
                <Camera className="h-4 w-4" /> Filter Media
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">Asset Code</th>
                  <th className="px-6 py-4">Equipment</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Condition</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {equipments.length > 0 ? equipments.map(eq => (
                  <tr key={eq.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-xs">{eq.asset_tag}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{eq.name}</p>
                      {eq.serial_number && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">SN: {eq.serial_number}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{eq.Category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{eq.location || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${
                        eq.condition === 'NEW' ? 'bg-blue-500/10 text-blue-600' :
                        eq.condition === 'GOOD' ? 'bg-emerald-500/10 text-emerald-600' :
                        eq.condition === 'BROKEN' ? 'bg-red-500/10 text-red-600' :
                        'bg-amber-500/10 text-amber-600'
                      }`}>
                        {eq.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        eq.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                        eq.status === 'ASSIGNED' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                        eq.status === 'MAINTENANCE' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                        'bg-muted text-muted-foreground border border-border'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${eq.status === 'AVAILABLE' ? 'bg-emerald-500' : eq.status === 'ASSIGNED' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                        {eq.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                      <Laptop className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>Inventory is empty.</p>
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

