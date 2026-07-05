export const dynamic = 'force-dynamic';
import React from "react";
import prisma from "@/lib/prisma";
import { Laptop, AlertTriangle, Briefcase, Activity, CalendarClock, ShieldAlert, Cpu } from "lucide-react";
import Link from "next/link";

export default async function AssetsDashboardPage() {
  const totalAssets = 0;
  const assignedAssets = 0;
  const availableAssets = 0;
  const maintenanceAssets = 0;

  const activeAssignments = 0;
  
  const recentAssignments: any[] = [];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Command Center</h1>
          <p className="text-muted-foreground mt-1">Enterprise Asset, Device & Facilities Management (Module 7)</p>
        </div>
        <div className="flex gap-3">
          <Link href="/hr-ops/assets/inventory" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 shadow-sm">
            View Master Inventory
          </Link>
          <Link href="/hr-ops/assets/assignments" className="px-4 py-2 bg-background border border-border text-foreground rounded-lg text-sm font-medium hover:bg-accent shadow-sm">
            Deploy Equipment
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Fleet</p>
              <h3 className="text-3xl font-bold mt-2">{totalAssets}</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Laptop className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
            <span className="text-emerald-500 font-medium">All registered</span> equipment.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Currently Assigned</p>
              <h3 className="text-3xl font-bold mt-2 text-blue-600">{assignedAssets}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-lg">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
            <span className="font-medium">Active employee liabilities.</span>
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available Stock</p>
              <h3 className="text-3xl font-bold mt-2 text-emerald-600">{availableAssets}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
            Ready for deployment or booking.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Maintenance</p>
              <h3 className="text-3xl font-bold mt-2 text-amber-600">{maintenanceAssets}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
            Unavailable / Needs repair.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* AI Insight Engine */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-background border border-primary/20 rounded-xl p-6 shadow-sm xl:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" /> AI Resource Optimizer
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-primary/10 text-primary rounded-md">Live Analysis</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg bg-card/50">
              <h4 className="font-semibold text-sm mb-2 text-amber-600 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Idle Asset Alert
              </h4>
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">{availableAssets} devices</strong> remain unassigned. Recommend consolidating inventory or reassigning IT equipment to upcoming hires.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg bg-card/50">
              <h4 className="font-semibold text-sm mb-2 text-red-600 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" /> Liability Risk Detected
              </h4>
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">{activeAssignments} assets</strong> are currently active. Ensure recent offboardings properly retrieved access cards and laptops via the clearance workflow.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" /> Recent Deployments
            </h3>
          </div>
          <div className="divide-y divide-border">
            {recentAssignments.length > 0 ? recentAssignments.map(a => (
              <div key={a.id} className="p-4 flex justify-between items-center hover:bg-accent/30 transition-colors">
                <div>
                  <p className="font-medium text-sm">{a.User.fullName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.Equipment.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{a.Equipment.asset_tag}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(a.assigned_at).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-muted-foreground">
                <Briefcase className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No recent deployments.</p>
              </div>
            )}
          </div>
          {recentAssignments.length > 0 && (
            <div className="p-4 border-t border-border bg-muted/20">
              <Link href="/hr-ops/assets/assignments" className="text-xs font-semibold text-primary hover:underline flex justify-center w-full">
                View All Assignments &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

