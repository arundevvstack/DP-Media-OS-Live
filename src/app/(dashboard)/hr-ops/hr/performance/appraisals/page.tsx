import React from "react";
import prisma from "@/lib/prisma";
import { Plus, BarChart3, Clock, CheckCircle, Users } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function AppraisalsPage() {
  const users = await prisma.user.findMany({
    where: { status: 'active' },
    select: { id: true, fullName: true, department: true }
  });

  const cycles = await prisma.performanceCycle.findMany({
    orderBy: { start_date: 'desc' },
    include: { _count: { select: { Reviews: true, Goals: true } } }
  });

  const activeCycle = cycles.find(c => c.status === 'ACTIVE' || c.status === 'REVIEW_PHASE');

  const reviews = activeCycle ? await prisma.performanceReview.findMany({
    where: { cycle_id: activeCycle.id },
    include: { 
      User: { select: { fullName: true, department: true } },
      Reviewer: { select: { fullName: true } }
    },
    orderBy: { created_at: 'desc' }
  }) : [];

  async function createCycle(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const s = new Date(formData.get('start_date') as string);
    const e = new Date(formData.get('end_date') as string);
    const company_id = (await prisma.company.findFirst())?.id || 'default';

    await prisma.performanceCycle.create({
      data: { company_id, name, start_date: s, end_date: e, status: 'ACTIVE' }
    });

    revalidatePath('/hr-ops/hr/performance/appraisals');
  }

  async function initializeReview(formData: FormData) {
    'use server';
    const user_id = formData.get('user_id') as string;
    const reviewer_id = formData.get('reviewer_id') as string;
    const type = formData.get('type') as string;
    const cycle_id = formData.get('cycle_id') as string;
    const company_id = (await prisma.company.findFirst())?.id || 'default';

    await prisma.performanceReview.create({
      data: {
        company_id,
        cycle_id,
        user_id,
        reviewer_id: reviewer_id || null,
        type,
        status: 'PENDING'
      }
    });

    revalidatePath('/hr-ops/hr/performance/appraisals');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appraisals & Reviews</h1>
          <p className="text-muted-foreground mt-1">Manage performance cycles, peer reviews, and 360 feedback loops.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Col: Setup & Config */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Create Cycle
            </h3>
            <form action={createCycle} className="space-y-4">
              <input type="text" name="name" required placeholder="e.g. H2 2026 Annual Review" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" name="start_date" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
                <input type="date" name="end_date" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
              <button type="submit" className="w-full py-2 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-secondary/80">
                Launch Cycle
              </button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm border-t-4 border-t-primary">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Request Review
            </h3>
            {activeCycle ? (
              <form action={initializeReview} className="space-y-4">
                <input type="hidden" name="cycle_id" value={activeCycle.id} />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Target Employee</label>
                  <select name="user_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                    <option value="">-- Target --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Review Type</label>
                  <select name="type" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                    <option value="SELF">Self Assessment</option>
                    <option value="MANAGER">Manager Review</option>
                    <option value="PEER">Peer 360 Review</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Reviewer (if not self)</label>
                  <select name="reviewer_id" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                    <option value="">-- Target (Self) --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.fullName}</option>
                    ))}
                  </select>
                </div>
                
                <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
                  Queue Assessment
                </button>
              </form>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No active performance cycle found.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Active Cycle and Reviews */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Cycle Header */}
          {activeCycle ? (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">Active Cycle</span>
                <h2 className="text-2xl font-bold">{activeCycle.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeCycle.start_date.toLocaleDateString()} — {activeCycle.end_date.toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-background/80 px-4 py-2 rounded-lg border border-border text-center">
                  <p className="text-2xl font-bold">{activeCycle._count.Reviews}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Reviews</p>
                </div>
                <div className="bg-background/80 px-4 py-2 rounded-lg border border-border text-center">
                  <p className="text-2xl font-bold">{activeCycle._count.Goals}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Goals Map</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Reviews List */}
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Active Review Queues
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Reviewer</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reviews.length > 0 ? reviews.map(review => (
                    <tr key={review.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        <p>{review.User.fullName}</p>
                        <p className="text-xs text-muted-foreground">{review.User.department}</p>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {review.Reviewer ? review.Reviewer.fullName : 'Self'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md ${
                          review.type === 'SELF' ? 'bg-blue-500/10 text-blue-600' :
                          review.type === 'PEER' ? 'bg-purple-500/10 text-purple-600' :
                          'bg-amber-500/10 text-amber-600'
                        }`}>
                          {review.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {review.overall_score !== null ? `${review.overall_score}/5` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          review.status === 'COMPLETED' || review.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {review.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No reviews assigned for the active cycle.</p>
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
