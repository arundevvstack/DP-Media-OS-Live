// @ts-nocheck
import React from 'react';
import prisma from "@/lib/prisma";
import { Star, Target, MessageSquare, Plus } from "lucide-react";
import { revalidatePath } from "next/cache";
import { User } from '@prisma/client';

export async function EmployeePerformance({ employeeId, companyId }: { employeeId: string, companyId: string }) {
  const reviews = await prisma.employeePerformance.findMany({
    where: { user_id: employeeId },
    orderBy: { created_at: 'desc' },
    include: {
      Reviewer: true
    }
  });

  // Mock fetching reviewers
  const managers = await prisma.user.findMany({
    where: { company_id: companyId, role_id: { in: ['MANAGER', 'ADMIN'] } },
    select: { id: true, fullName: true }
  });

  async function logReview(formData: FormData) {
    'use server';
    const period = formData.get('period') as string;
    const score = parseFloat(formData.get('score') as string);
    const reviewer_id = formData.get('reviewer_id') as string;
    const feedback = formData.get('feedback') as string;

    await prisma.employeePerformance.create({
      data: {
        user_id: employeeId,
        company_id: companyId,
        period,
        score,
        reviewer_id,
        feedback,
        status: 'PUBLISHED'
      }
    });
    revalidatePath(`/hr-ops/hr/employees/${employeeId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Performance Reviews</h3>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Target className="h-4 w-4" /> Add Review
        </h4>
        <form action={logReview} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm">Review Period</label>
              <input type="text" name="period" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="e.g. Q1 2026, Annual 2026" />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm">Score (0-100)</label>
              <input type="number" name="score" min="0" max="100" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="e.g. 95" />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm">Reviewer</label>
              <select name="reviewer_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="">Select Manager</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm">Feedback</label>
            <textarea name="feedback" rows={3} required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="Overall performance comments..."></textarea>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Save Review
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {reviews.length > 0 ? reviews.map(review => (
          <div key={review.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-lg">{review.period} Review</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  By {review.Reviewer?.fullName || 'Unknown'} • {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-primary">{review.score}</span>
                <span className="text-xs text-muted-foreground">Score</span>
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-md border border-border/50 text-sm flex gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <p className="text-foreground/90">{review.feedback}</p>
            </div>
          </div>
        )) : (
          <div className="text-center p-8 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
            No performance reviews found.
          </div>
        )}
      </div>
    </div>
  );
}
