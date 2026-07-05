import React from "react";
import prisma from "@/lib/prisma";
import { Plus, Book, Star, ShieldAlert, CheckCircle } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function SkillsPage() {
  const users = await prisma.user.findMany({
    where: { status: 'active' },
    select: { id: true, fullName: true, department: true }
  });

  const skills = await prisma.skill.findMany({
    orderBy: { category: 'asc' },
    include: { _count: { select: { EmployeeSkills: true } } }
  });

  const employeeSkills = await prisma.employeeSkill.findMany({
    include: { 
      User: { select: { fullName: true, department: true } },
      Skill: true
    },
    orderBy: { proficiency: 'desc' },
    take: 50 // Limit for display
  });

  async function createSkill(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const company_id = (await prisma.company.findFirst())?.id || 'default';

    await prisma.skill.create({
      data: { company_id, name, category }
    });

    revalidatePath('/hr-ops/hr/performance/skills');
  }

  async function assessEmployee(formData: FormData) {
    'use server';
    const user_id = formData.get('user_id') as string;
    const skill_id = formData.get('skill_id') as string;
    const proficiency = parseInt(formData.get('proficiency') as string, 10);

    // Upsert employee skill
    await prisma.employeeSkill.upsert({
      where: {
        user_id_skill_id: { user_id, skill_id }
      },
      update: { proficiency, last_assessed: new Date() },
      create: { user_id, skill_id, proficiency }
    });

    revalidatePath('/hr-ops/hr/performance/skills');
    revalidatePath('/hr-ops/hr/performance/dashboard');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills & Competencies Matrix</h1>
          <p className="text-muted-foreground mt-1">Define organization skill taxonomy and map employee proficiency.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Forms Col */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" /> Add Skill Taxonomy
            </h3>
            <form action={createSkill} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Skill Name</label>
                <input type="text" name="name" required placeholder="e.g. React.js, Negotiation" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select name="category" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                  <option value="TECHNICAL">Technical / Hard Skill</option>
                  <option value="SOFTSKILL">Soft Skill</option>
                  <option value="LEADERSHIP">Leadership</option>
                  <option value="DOMAIN">Domain Knowledge</option>
                  <option value="LANGUAGE">Language</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-secondary/80">
                Add to Library
              </button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm border-t-4 border-t-emerald-500">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-emerald-500" /> Assess Proficiency
            </h3>
            {skills.length > 0 ? (
              <form action={assessEmployee} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Employee</label>
                  <select name="user_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                    <option value="">-- Select --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.fullName} ({u.department})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Skill</label>
                  <select name="skill_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                    <option value="">-- Select --</option>
                    {skills.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Proficiency Level (1-5)</label>
                  <input type="range" name="proficiency" min="1" max="5" defaultValue="3" className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Novice</span>
                    <span>Expert</span>
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Save Assessment
                </button>
              </form>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                Add skills to the library first.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Matrices */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" /> Employee Skill Heatmap
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Skill Focus</th>
                    <th className="px-6 py-4">Proficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {employeeSkills.length > 0 ? employeeSkills.map(es => (
                    <tr key={es.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{es.User.fullName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{es.User.department}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{es.Skill.name}</p>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{es.Skill.category}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(lvl => (
                            <div key={lvl} className={`h-2 w-6 rounded-sm ${lvl <= es.proficiency ? 'bg-primary' : 'bg-muted'}`}></div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        <Star className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No employee skills assessed yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
             <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Book className="h-5 w-5 text-primary" /> Enterprise Skill Library
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <div key={s.id} className="px-3 py-1.5 bg-accent border border-border rounded-md text-sm flex items-center gap-2">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs bg-background px-1.5 py-0.5 rounded text-muted-foreground">{s._count.EmployeeSkills} Maps</span>
                </div>
              ))}
              {skills.length === 0 && <span className="text-sm text-muted-foreground">Library is empty.</span>}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
