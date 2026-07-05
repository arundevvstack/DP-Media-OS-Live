import React from 'react';
import prisma from "@/lib/prisma";
import { ArrowLeft, Save, Briefcase, MapPin, DollarSign } from "lucide-react";
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CreateJobRequisitionPage() {
  const users = await prisma.user.findMany({
    select: { id: true, fullName: true, role_id: true }
  });

  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  
  if (companies.length === 0) {
    throw new Error("No companies exist in the system to assign the requisition to.");
  }
  const defaultCompanyId = companies[0].id;

  async function createRequisition(formData: FormData) {
    'use server';
    
    const title = formData.get('title') as string;
    const department = formData.get('department') as string;
    const employment_type = formData.get('employment_type') as string;
    const work_mode = formData.get('work_mode') as string;
    const location = formData.get('location') as string;
    const vacancy_count = parseInt(formData.get('vacancy_count') as string || '1');
    const hiring_manager_id = formData.get('hiring_manager_id') as string;
    const recruiter_id = formData.get('recruiter_id') as string;
    const description = formData.get('description') as string;
    const qualifications = formData.get('qualifications') as string;
    const status = formData.get('status') as string;

    const requisition = await prisma.jobRequisition.create({
      data: {
        company_id: defaultCompanyId,
        title,
        department,
        employment_type,
        work_mode,
        location,
        vacancy_count,
        hiring_manager_id: hiring_manager_id || null,
        recruiter_id: recruiter_id || null,
        description,
        qualifications,
        status,
        currency: 'USD'
      }
    });

    redirect(`/hr-ops/recruitment/jobs/${requisition.id}`);
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex items-center gap-4">
        <Link href="/hr-ops/recruitment/jobs" className="p-2 border border-border bg-card rounded-md hover:bg-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Create Job Requisition</h1>
          <p className="text-muted-foreground mt-1">Define position requirements and publish to the careers portal.</p>
        </div>
      </div>

      <form action={createRequisition} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">
          
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
              <Briefcase className="h-5 w-5 text-primary" /> Role Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Title <span className="text-destructive">*</span></label>
                <input type="text" name="title" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="e.g. Senior Software Engineer" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <input type="text" name="department" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="e.g. Engineering" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Employment Type <span className="text-destructive">*</span></label>
                <select name="employment_type" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vacancy Count</label>
                <input type="number" name="vacancy_count" min="1" defaultValue="1" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
              <MapPin className="h-5 w-5 text-primary" /> Logistics & Assignment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Mode</label>
                <select name="work_mode" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                  <option value="ONSITE">Onsite</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <input type="text" name="location" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="e.g. New York, NY" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hiring Manager</label>
                <select name="hiring_manager_id" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                  <option value="">-- Select Manager --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Recruiter</label>
                <select name="recruiter_id" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                  <option value="">-- Select Recruiter --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
              <DollarSign className="h-5 w-5 text-primary" /> Description
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Description <span className="text-destructive">*</span></label>
                <textarea name="description" required rows={6} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-y" placeholder="Describe the responsibilities and scope of the role..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Qualifications & Requirements</label>
                <textarea name="qualifications" rows={4} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-y" placeholder="List required skills, education, and experience..." />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
              Publishing
            </h2>
            <div className="space-y-2 max-w-sm">
              <label className="text-sm font-medium">Initial Status</label>
              <select name="status" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="DRAFT">Draft (Internal Only)</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="PUBLISHED">Published (Live on Portal)</option>
              </select>
            </div>
          </section>

        </div>
        <div className="px-6 py-4 bg-muted/50 border-t border-border flex justify-end gap-3">
          <Link href="/hr-ops/recruitment/jobs" className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors">
            Cancel
          </Link>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Requisition
          </button>
        </div>
      </form>
    </div>
  );
}

