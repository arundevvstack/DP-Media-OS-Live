import React from 'react';
import prisma from "@/lib/prisma";
import { Plus, Search, Filter, LayoutGrid, List as ListIcon, Clock, AlertCircle, CheckCircle2, Play, CheckCircle, Briefcase, Calendar, ChevronRight, Activity } from "lucide-react";
import { revalidatePath } from "next/cache";

async function getWorkOrders() {
  const objectives = await prisma.objective.findMany({
    take: 50,
    orderBy: { created_at: 'desc' },
    include: {
      Project: true,
      User_Objective_assignee_idToUser: true
    }
  });
  return objectives;
}

export default async function OperationsHubPage() {
  const workOrders = await getWorkOrders();
  const projects = await prisma.project.findMany({
    where: { status: 'Active' },
    select: { id: true, project_name: true }
  });

  const getStatusIndicator = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': 
        return <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="h-2 w-2 rounded-full bg-emerald-500"></span><span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs uppercase tracking-wider">{status}</span></span>;
      case 'in progress': 
        return <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="h-2 w-2 rounded-full bg-blue-500"></span><span className="text-blue-600 dark:text-blue-400 font-medium text-xs uppercase tracking-wider">{status}</span></span>;
      case 'pending': 
        return <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="h-2 w-2 rounded-full bg-amber-500"></span><span className="text-amber-600 dark:text-amber-400 font-medium text-xs uppercase tracking-wider">{status}</span></span>;
      default: 
        return <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="h-2 w-2 rounded-full bg-gray-400"></span><span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">{status}</span></span>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'low': return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  async function createWorkOrder(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    const project_id = formData.get('project_id') as string;
    const priority = formData.get('priority') as string;
    const department = formData.get('department') as string;
    const estimated_hours_raw = formData.get('estimated_hours') as string;
    const estimated_hours = estimated_hours_raw ? parseInt(estimated_hours_raw, 10) : null;
    
    const company = await prisma.company.findFirst();

    if (title && project_id && company) {
      await prisma.objective.create({
        data: {
          id: crypto.randomUUID(),
          title,
          project_id,
          priority,
          department,
          estimated_hours,
          status: 'Pending'
        }
      });
      revalidatePath('/ops/command-center');
    }
  }

  async function updateStatus(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;
    
    if (id && status) {
      await prisma.objective.update({
        where: { id },
        data: { status }
      });
      revalidatePath('/ops/command-center');
    }
  }

  return (
    <div className="p-8 space-y-8 w-full max-w-full mx-auto h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Operations Hub
            </h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Orchestrate resources and tasks with precision.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Create Work Order Form - 4 Columns */}
        <div className="lg:col-span-4 sticky top-8">
          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                New Order
              </h2>
            </div>
            
            <form action={createWorkOrder} className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">Task Title <span className="text-destructive">*</span></label>
                <input type="text" name="title" required 
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm outline-none" 
                  placeholder="e.g. Render final cut" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">Project <span className="text-destructive">*</span></label>
                <select name="project_id" required 
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm outline-none">
                  <option value="">-- Select Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.project_name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <select name="priority" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm outline-none">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Est. Hours</label>
                  <input type="number" name="estimated_hours" defaultValue={4} min={1} required 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Department</label>
                <select name="department" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm outline-none">
                  <option value="Operations">Operations</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Media">Media</option>
                  <option value="Design">Design</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>

              <button type="submit" className="w-full py-2.5 mt-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2">
                Dispatch Order <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Work Orders List - 8 Columns */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Orders', count: workOrders.length, color: 'text-primary' },
              { label: 'Critical', count: workOrders.filter(w => w.priority === 'Critical').length, color: 'text-red-500' },
              { label: 'In Progress', count: workOrders.filter(w => w.status === 'In Progress').length, color: 'text-blue-500' },
              { label: 'Completed', count: workOrders.filter(w => w.status === 'Completed').length, color: 'text-emerald-500' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search active orders..." 
                  className="pl-9 pr-4 py-1.5 bg-background border border-border rounded-md text-sm outline-none w-full"
                />
              </div>
            </div>

            <div className="overflow-auto max-h-[700px]">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-xs text-muted-foreground uppercase sticky top-0 z-10 bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Task / Dept</th>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {workOrders.length > 0 ? workOrders.map(order => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="font-medium text-foreground mb-0.5">{order.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {[order.department, order.estimated_hours ? `${order.estimated_hours}h` : null]
                            .filter(Boolean)
                            .join(' • ')}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="truncate max-w-[150px] inline-block">{order.Project?.project_name || 'Unknown'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          {getPriorityIcon(order.priority)}
                          <span className="capitalize text-xs font-medium">{order.priority}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusIndicator(order.status)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {order.status === 'Pending' && (
                            <form action={updateStatus}>
                              <input type="hidden" name="id" value={order.id} />
                              <input type="hidden" name="status" value="In Progress" />
                              <button type="submit" className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors" title="Start Progress">
                                <Play className="h-4 w-4" />
                              </button>
                            </form>
                          )}
                          {(order.status === 'Pending' || order.status === 'In Progress') && (
                            <form action={updateStatus}>
                              <input type="hidden" name="id" value={order.id} />
                              <input type="hidden" name="status" value="Completed" />
                              <button type="submit" className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors" title="Mark Complete">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </form>
                          )}
                          {order.status === 'Completed' && (
                            <span className="text-muted-foreground text-xs font-medium">Done</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <CheckCircle2 className="h-12 w-12 mb-4 opacity-20" />
                          <p className="text-lg font-medium text-foreground">Inbox Zero</p>
                          <p className="text-sm mt-1">No work orders found. Create one to get started.</p>
                        </div>
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
