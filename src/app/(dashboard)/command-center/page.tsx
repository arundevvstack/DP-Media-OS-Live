"use client";

import React from 'react';
import { DashboardWidget } from '@/components/universal/DashboardWidget';

export default function ExecutiveCommandCenter() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight">Executive Command Center</h1>
        <p className="text-muted-foreground font-medium mt-2">Unified Enterprise Health Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget 
          title="Company Health Index" 
          value="94%" 
          trend={{ direction: 'UP', percentage: 2.1 }}
          alertStatus="NORMAL" 
        />
        <DashboardWidget 
          title="Active Productions" 
          value="18" 
          trend={{ direction: 'UP', percentage: 12 }} 
        />
        <DashboardWidget 
          title="At-Risk Deliverables" 
          value="3" 
          alertStatus="WARNING" 
        />
        <DashboardWidget 
          title="Employee Burnout Risk" 
          value="Critical" 
          alertStatus="CRITICAL" 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Placeholder for DataTables and Timelines */}
        <div className="border border-border rounded-xl p-6 bg-muted/20">
          <h2 className="font-bold mb-4">Live Activity Feed (Event Bus)</h2>
          <div className="text-sm text-muted-foreground italic">Connects to Universal Timeline Component...</div>
        </div>
        <div className="border border-border rounded-xl p-6 bg-muted/20">
          <h2 className="font-bold mb-4">Pending Exec Approvals</h2>
          <div className="text-sm text-muted-foreground italic">Connects to Universal Approval Panel...</div>
        </div>
      </div>
    </div>
  );
}
