// @ts-nocheck
import React from 'react';
import prisma from "@/lib/prisma";
import { BookOpen, Award, Plus, CheckCircle2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export async function EmployeeTraining({ employeeId, companyId }: { employeeId: string, companyId: string }) {
  const trainings = await prisma.employeeTraining.findMany({
    where: { user_id: employeeId },
    orderBy: { created_at: 'desc' }
  });

  async function addTraining(formData: FormData) {
    'use server';
    const course_name = formData.get('course_name') as string;
    const status = formData.get('status') as string;
    const scoreStr = formData.get('score') as string;
    
    const data: any = {
      user_id: employeeId,
      company_id: companyId,
      course_name,
      status
    };

    if (scoreStr) data.score = parseFloat(scoreStr);
    if (status === 'COMPLETED') data.completed_at = new Date();

    await prisma.employeeTraining.create({ data });
    revalidatePath(`/hr-ops/hr/employees/${employeeId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Training & Certifications</h3>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Add Training Record
        </h4>
        <form action={addTraining} className="flex gap-4 items-end">
          <div className="flex-[2] space-y-2">
            <label className="text-sm">Course / Certification Name</label>
            <input type="text" name="course_name" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="e.g. Advanced Leadership, AWS Certified Architect" />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm">Status</label>
            <select name="status" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
              <option value="ENROLLED">Enrolled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm">Score / Grade (Optional)</label>
            <input type="number" name="score" min="0" max="100" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="e.g. 98" />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trainings.length > 0 ? trainings.map(training => (
          <div key={training.id} className="flex p-5 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow gap-4">
            <div className={`p-3 rounded-full flex-shrink-0 h-12 w-12 flex items-center justify-center ${
              training.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
            }`}>
              {training.status === 'COMPLETED' ? <Award className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{training.course_name}</h4>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  training.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' :
                  training.status === 'EXPIRED' ? 'bg-red-500/10 text-red-600' :
                  'bg-amber-500/10 text-amber-600'
                }`}>
                  {training.status.replace('_', ' ')}
                </span>
                {training.score && (
                  <span className="text-xs font-medium px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">
                    Score: {training.score}
                  </span>
                )}
              </div>
              {training.completed_at && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed {new Date(training.completed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center p-8 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
            No training records found.
          </div>
        )}
      </div>
    </div>
  );
}
