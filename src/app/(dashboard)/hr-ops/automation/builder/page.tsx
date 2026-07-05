import React from 'react';
import prisma from "@/lib/prisma";
import { Workflow, Play, Settings2, Plus, ArrowRight, Zap, History, Power, Search } from "lucide-react";

async function getAutomationRules() {
  let rules = await prisma.automationRule.findMany({
    take: 20,
    orderBy: { name: 'asc' }
  });

  if (rules.length === 0) {
    const defaultCompany = await prisma.company.findFirst();
    if (defaultCompany) {
      const demoRules = [
        {
          id: crypto.randomUUID(),
          company_id: defaultCompany.id,
          name: "New Employee Onboarding",
          trigger_event: "employee.created",
          conditions: { type: "always" },
          actions: { steps: [{ type: "send_email", template: "welcome" }, { type: "create_task", name: "Setup IT Assets" }] },
          is_active: true
        },
        {
          id: crypto.randomUUID(),
          company_id: defaultCompany.id,
          name: "High Value Lead Alert",
          trigger_event: "lead.created",
          conditions: { type: "field_compare", field: "estimated_budget", operator: "gt", value: 50000 },
          actions: { steps: [{ type: "slack_notify", channel: "#sales-alerts" }] },
          is_active: true
        },
        {
          id: crypto.randomUUID(),
          company_id: defaultCompany.id,
          name: "Invoice Overdue Reminder",
          trigger_event: "invoice.overdue",
          conditions: { type: "always" },
          actions: { steps: [{ type: "send_email", template: "overdue_reminder" }] },
          is_active: false
        }
      ];

      await prisma.automationRule.createMany({ data: demoRules });
      
      rules = await prisma.automationRule.findMany({
        take: 20,
        orderBy: { name: 'asc' }
      });
    }
  }

  return rules;
}

export default async function AutomationBuilderPage() {
  const rules = await getAutomationRules();

  return (
    <div className="p-8 space-y-6 h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automation Engine</h1>
          <p className="text-muted-foreground mt-1">Configure event-driven workflows, webhooks, and AI triggers.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-border bg-card text-foreground rounded-md text-sm font-medium hover:bg-accent transition-colors">
            <History className="h-4 w-4" />
            Execution Logs
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            Create Workflow
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        <div className="col-span-1 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden h-[70vh]">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Find automation..." 
                className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-md text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {rules.map((rule, idx) => (
              <div 
                key={rule.id} 
                className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${idx === 0 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted border border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${rule.is_active ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                    <Workflow className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{rule.name}</h4>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{rule.trigger_event}</p>
                  </div>
                </div>
                {rule.is_active ? (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col h-[70vh]">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{rules[0]?.name || "Select Workflow"}</h3>
              {rules[0]?.is_active && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
                  Active
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="Settings">
                <Settings2 className="h-4 w-4" />
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-border bg-background hover:bg-accent rounded-md text-sm font-medium transition-colors">
                <Play className="h-4 w-4" />
                Test Run
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-dot-pattern bg-[length:20px_20px] p-8 overflow-auto flex flex-col items-center">
            {/* Visual Node Builder Mockup */}
            <div className="w-full max-w-md space-y-6">
              
              {/* Trigger Node */}
              <div className="bg-background border-2 border-primary/40 rounded-xl p-4 shadow-sm relative z-10 group hover:border-primary transition-colors">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary/30">
                  Trigger
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">When an Event Occurs</h4>
                    <p className="text-xs text-muted-foreground font-mono mt-1 bg-muted px-1.5 py-0.5 rounded inline-block">
                      {rules[0]?.trigger_event || "employee.created"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-0.5 h-6 bg-border mx-auto" />

              {/* Condition Node */}
              <div className="bg-background border border-border rounded-xl p-4 shadow-sm relative z-10 hover:border-foreground/30 transition-colors">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-border">
                  Condition
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-foreground">Always Continue</p>
                  <p className="text-xs text-muted-foreground mt-0.5">No conditions applied</p>
                </div>
              </div>

              <div className="w-0.5 h-6 bg-border mx-auto" />

              {/* Action Node 1 */}
              <div className="bg-background border-2 border-emerald-500/30 rounded-xl p-4 shadow-sm relative z-10 hover:border-emerald-500/60 transition-colors">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Action 1
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <Power className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Send Welcome Email</h4>
                    <p className="text-xs text-muted-foreground mt-1">Using template: <span className="font-mono text-foreground">welcome_v2</span></p>
                  </div>
                </div>
              </div>

              <div className="w-0.5 h-6 bg-border mx-auto" />

              {/* Action Node 2 */}
              <div className="bg-background border-2 border-blue-500/30 rounded-xl p-4 shadow-sm relative z-10 hover:border-blue-500/60 transition-colors">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-blue-500/20">
                  Action 2
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Create Setup Task</h4>
                    <p className="text-xs text-muted-foreground mt-1">Assigned to: IT Department</p>
                  </div>
                </div>
              </div>

              <div className="w-0.5 h-6 bg-border mx-auto" />
              
              <button className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors">
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
