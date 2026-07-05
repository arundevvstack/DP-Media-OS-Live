export const dynamic = 'force-dynamic';
import React from "react";
import prisma from "@/lib/prisma";
import { Plus, BookOpen, Play, CheckCircle, GraduationCap } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function TrainingPage() {
  const users = await prisma.user.findMany({
    where: { status: 'active' },
    select: { id: true, fullName: true, department: true }
  });

  const courses = await prisma.trainingCourse.findMany({
    orderBy: { created_at: 'desc' },
    include: { _count: { select: { Enrollments: true } } }
  });

  const enrollments = await prisma.trainingEnrollment.findMany({
    include: { 
      User: { select: { fullName: true, department: true } },
      Course: true
    },
    orderBy: { created_at: 'desc' },
    take: 50 // Limit for display
  });

  async function createCourse(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const points = parseInt(formData.get('points') as string, 10) || 0;
    const company_id = (await prisma.company.findFirst())?.id || 'default';

    await prisma.trainingCourse.create({
      data: { company_id, title, description, type, points, status: 'ACTIVE' }
    });

    revalidatePath('/hr-ops/hr/performance/training');
  }

  async function assignTraining(formData: FormData) {
    'use server';
    const user_id = formData.get('user_id') as string;
    const course_id = formData.get('course_id') as string;

    await prisma.trainingEnrollment.create({
      data: { user_id, course_id, status: 'ENROLLED' }
    });

    revalidatePath('/hr-ops/hr/performance/training');
  }

  async function completeTraining(formData: FormData) {
    'use server';
    const enrollment_id = formData.get('enrollment_id') as string;

    await prisma.trainingEnrollment.update({
      where: { id: enrollment_id },
      data: { status: 'COMPLETED', completed_at: new Date() }
    });

    revalidatePath('/hr-ops/hr/performance/training');
    revalidatePath('/hr-ops/hr/performance/dashboard');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training & Development</h1>
          <p className="text-muted-foreground mt-1">Manage corporate learning, course enrollments, and certifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Forms Col */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Create Course
            </h3>
            <form action={createCourse} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Title</label>
                <input type="text" name="title" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="e.g. Advanced Leadership" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Mode</label>
                <select name="type" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                  <option value="ONLINE">Online Module</option>
                  <option value="IN_PERSON">In-Person Workshop</option>
                  <option value="ASSIGNMENT">Project Assignment</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reward Points</label>
                <input type="number" name="points" defaultValue="10" min="0" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea name="description" rows={2} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-none"></textarea>
              </div>
              <button type="submit" className="w-full py-2 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-secondary/80">
                Publish Course
              </button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm border-t-4 border-t-primary">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" /> Assign Training
            </h3>
            {courses.length > 0 ? (
              <form action={assignTraining} className="space-y-4">
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
                  <label className="text-sm font-medium text-muted-foreground">Course</label>
                  <select name="course_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                    <option value="">-- Select --</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                  Enroll Employee
                </button>
              </form>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                Publish courses first.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Course Enrollments */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" /> Active Enrollments
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {enrollments.length > 0 ? enrollments.map(en => (
                    <tr key={en.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        <p>{en.User.fullName}</p>
                        <p className="text-xs text-muted-foreground">{en.User.department}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold">{en.Course.title}</td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold tracking-wider uppercase bg-muted px-2 py-1 rounded-md">
                          {en.Course.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          en.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' :
                          en.status === 'ENROLLED' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-amber-500/10 text-amber-600'
                        }`}>
                          {en.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {en.status !== 'COMPLETED' ? (
                          <form action={completeTraining}>
                            <input type="hidden" name="enrollment_id" value={en.id} />
                            <button type="submit" className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors" title="Mark Completed">
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          </form>
                        ) : (
                          <span className="text-muted-foreground text-xs font-medium">Done</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No active training enrollments.</p>
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

