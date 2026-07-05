export const dynamic = 'force-dynamic';
import React from "react";
import prisma from "@/lib/prisma";
import { TrendingUp, Users, ShieldAlert, Award, Search, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function SuccessionPage() {
  const users = await prisma.user.findMany({
    where: { status: 'active' },
    select: { id: true, fullName: true, department: true }
  });

  const matrices = await prisma.talentMatrix.findMany({
    include: { User: { select: { fullName: true, department: true } } },
    orderBy: { evaluated_at: 'desc' }
  });

  async function evaluateTalent(formData: FormData) {
    'use server';
    const user_id = formData.get('user_id') as string;
    const performance = parseInt(formData.get('performance') as string, 10);
    const potential = parseInt(formData.get('potential') as string, 10);
    const risk_of_flight = formData.get('risk_of_flight') as string;
    const company_id = (await prisma.company.findFirst())?.id || 'default';

    // Check if matrix exists for user
    const existing = await prisma.talentMatrix.findFirst({ where: { user_id } });

    if (existing) {
      await prisma.talentMatrix.update({
        where: { id: existing.id },
        data: { performance, potential, risk_of_flight, evaluated_at: new Date() }
      });
    } else {
      await prisma.talentMatrix.create({
        data: { company_id, user_id, performance, potential, risk_of_flight }
      });
    }

    revalidatePath('/hr-ops/hr/performance/succession');
    revalidatePath('/hr-ops/hr/performance/dashboard');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Succession & Talent Matrix</h1>
          <p className="text-muted-foreground mt-1">Map 9-box grids, identify high-potentials, and track retention risks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Assess Talent Form */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" /> Evaluate Talent
          </h2>
          
          <form action={evaluateTalent} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee <span className="text-destructive">*</span></label>
              <select name="user_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="">-- Select Employee --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.department})</option>
                ))}
              </select>
            </div>
            
            <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Performance Rating</span>
                  <span className="text-muted-foreground text-xs">(1-Low, 3-High)</span>
                </label>
                <input type="range" name="performance" min="1" max="3" defaultValue="2" className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground font-medium uppercase">
                  <span>Underperforms</span>
                  <span>Meets</span>
                  <span>Exceeds</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Potential Rating</span>
                  <span className="text-muted-foreground text-xs">(1-Low, 3-High)</span>
                </label>
                <input type="range" name="potential" min="1" max="3" defaultValue="2" className="w-full accent-blue-500" />
                <div className="flex justify-between text-xs text-muted-foreground font-medium uppercase">
                  <span>At capacity</span>
                  <span>Developable</span>
                  <span>High Promotability</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Flight Risk <ShieldAlert className="h-3 w-3 text-amber-500" />
              </label>
              <select name="risk_of_flight" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="LOW">Low (Stable)</option>
                <option value="MEDIUM">Medium (Monitor)</option>
                <option value="HIGH">High (Critical Retention Risk)</option>
              </select>
            </div>

            <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors mt-2">
              Update Talent Matrix
            </button>
          </form>
        </div>

        {/* Matrix List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Succession Pipeline
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">9-Box Placement</th>
                  <th className="px-6 py-4 text-center">Perf (1-3)</th>
                  <th className="px-6 py-4 text-center">Pot (1-3)</th>
                  <th className="px-6 py-4">Flight Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {matrices.length > 0 ? matrices.map(m => {
                  let boxName = 'Solid Pro';
                  let boxColor = 'text-blue-600 bg-blue-500/10';
                  
                  if (m.performance === 3 && m.potential === 3) { boxName = 'High Impact'; boxColor = 'text-emerald-700 bg-emerald-500/20'; }
                  if (m.performance === 3 && m.potential === 2) { boxName = 'High Potential'; boxColor = 'text-blue-700 bg-blue-500/20'; }
                  if (m.performance === 3 && m.potential === 1) { boxName = 'Enigma'; boxColor = 'text-purple-700 bg-purple-500/20'; }
                  
                  if (m.performance === 2 && m.potential === 3) { boxName = 'Core Player'; boxColor = 'text-emerald-600 bg-emerald-500/10'; }
                  if (m.performance === 2 && m.potential === 2) { boxName = 'Solid Pro'; boxColor = 'text-blue-600 bg-blue-500/10'; }
                  if (m.performance === 2 && m.potential === 1) { boxName = 'Effective'; boxColor = 'text-purple-600 bg-purple-500/10'; }
                  
                  if (m.performance === 1 && m.potential === 3) { boxName = 'Inconsistent'; boxColor = 'text-amber-600 bg-amber-500/10'; }
                  if (m.performance === 1 && m.potential === 2) { boxName = 'Dilemma'; boxColor = 'text-amber-700 bg-amber-500/20'; }
                  if (m.performance === 1 && m.potential === 1) { boxName = 'Underperformer'; boxColor = 'text-red-700 bg-red-500/10'; }

                  return (
                    <tr key={m.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        <p className="flex items-center gap-2">
                          {m.performance === 3 && m.potential === 3 && <Award className="h-4 w-4 text-amber-500" />}
                          {m.User.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">{m.User.department}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${boxColor}`}>
                          {boxName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-muted-foreground">{m.performance}</td>
                      <td className="px-6 py-4 text-center font-bold text-muted-foreground">{m.potential}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                          m.risk_of_flight === 'HIGH' ? 'text-red-600' :
                          m.risk_of_flight === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {m.risk_of_flight === 'HIGH' && <ShieldAlert className="h-3.5 w-3.5" />}
                          {m.risk_of_flight}
                        </span>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <BrainCircuit className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>No talent evaluations found.</p>
                      <p className="text-xs mt-1">Assess employees to populate the 9-Box grid.</p>
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

