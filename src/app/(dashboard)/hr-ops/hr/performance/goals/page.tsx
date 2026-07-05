export const dynamic = 'force-dynamic';
import React from "react";
import prisma from "@/lib/prisma";
import { Plus, Target, CheckCircle, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function GoalsPage() {
  const users = await prisma.user.findMany({
    where: { status: 'active' },
    select: { id: true, fullName: true, department: true }
  });

  const activeCycles = await prisma.performanceCycle.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { start_date: 'desc' }
  });

  const goals = await prisma.goal.findMany({
    include: { 
      User: { select: { fullName: true, department: true } },
      Cycle: { select: { name: true } },
      KeyResults: true
    },
    orderBy: { created_at: 'desc' }
  });

  async function createGoal(formData: FormData) {
    'use server';
    const user_id = formData.get('user_id') as string;
    const cycle_id = formData.get('cycle_id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const weight = parseFloat(formData.get('weight') as string || '1');
    const company_id = (await prisma.company.findFirst())?.id || 'default';

    const goal = await prisma.goal.create({
      data: {
        company_id,
        user_id,
        cycle_id,
        title,
        description,
        weight,
        status: 'ON_TRACK'
      },
      include: { User: true }
    });

    await prisma.activityLog.create({
      data: {
        company_id,
        user_id,
        user_name: goal.User.fullName,
        action: `Assigned new performance goal: ${title}`
      }
    });

    revalidatePath('/hr-ops/hr/performance/goals');
    revalidatePath('/hr-ops/hr/performance/dashboard');
  }

  async function updateProgress(formData: FormData) {
    'use server';
    const goal_id = formData.get('goal_id') as string;
    const progress = parseFloat(formData.get('progress') as string);
    const status = formData.get('status') as string;

    await prisma.goal.update({
      where: { id: goal_id },
      data: { progress, status }
    });

    revalidatePath('/hr-ops/hr/performance/goals');
    revalidatePath('/hr-ops/hr/performance/dashboard');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Objectives & Key Results (OKRs)</h1>
          <p className="text-muted-foreground mt-1">Assign, track, and align individual goals with corporate objectives.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Assign Goal Form */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Assign Goal
          </h2>
          
          <form action={createGoal} className="space-y-4">
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
              <label className="text-sm font-medium">Performance Cycle <span className="text-destructive">*</span></label>
              <select name="cycle_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="">-- Select Cycle --</option>
                {activeCycles.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Objective Title <span className="text-destructive">*</span></label>
              <input type="text" name="title" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="e.g. Increase Q3 Revenue by 15%" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea name="description" rows={3} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-y" placeholder="Brief details..."></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Weightage (Multiplier)</label>
              <input type="number" step="0.1" name="weight" defaultValue="1" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            </div>

            <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors mt-2" disabled={activeCycles.length === 0}>
              {activeCycles.length > 0 ? "Assign Goal" : "No Active Cycles"}
            </button>
          </form>
        </div>

        {/* Goals List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Tracking Matrix
            </h3>
          </div>

          {goals.length > 0 ? (
            goals.map(goal => (
              <div key={goal.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xl">{goal.description}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                    goal.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' :
                    goal.status === 'AT_RISK' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-blue-500/10 text-blue-600'
                  }`}>
                    {goal.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs font-medium mb-0.5">Assignee</p>
                    <p className="font-semibold truncate">{goal.User.fullName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium mb-0.5">Department</p>
                    <p className="font-semibold truncate">{goal.User.department}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium mb-0.5">Cycle</p>
                    <p className="font-semibold truncate">{goal.Cycle.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium mb-0.5">Weight</p>
                    <p className="font-semibold truncate">{goal.weight}x</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-muted-foreground">Progress Completion</span>
                    <span className="font-bold">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${goal.progress === 100 ? 'bg-emerald-500' : goal.progress > 50 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>

                  <form action={updateProgress} className="mt-4 flex gap-2">
                    <input type="hidden" name="goal_id" value={goal.id} />
                    <input type="number" name="progress" min="0" max="100" defaultValue={goal.progress} className="w-20 px-2 py-1.5 border border-border rounded-md bg-background text-sm" />
                    <select name="status" defaultValue={goal.status} className="px-2 py-1.5 border border-border rounded-md bg-background text-sm">
                      <option value="ON_TRACK">On Track</option>
                      <option value="AT_RISK">At Risk</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                    <button type="submit" className="px-3 py-1.5 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-secondary/80">
                      Update
                    </button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground shadow-sm">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground mb-1">No Goals Tracked</h3>
              <p>Assign goals to employees to track performance progression.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

