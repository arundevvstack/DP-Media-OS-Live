// @ts-nocheck
import React from 'react';
import prisma from "@/lib/prisma";
import { ArrowLeft, Edit, MapPin, Users, Briefcase, Mail, Phone, ChevronRight } from "lucide-react";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function JobDetailPipelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const job = await prisma.jobRequisition.findUnique({
    where: { id },
    include: {
      HiringManager: true,
      Recruiter: true,
      Applications: {
        include: { Candidate: true },
        orderBy: { applied_at: 'desc' }
      }
    }
  });

  if (!job) {
    notFound();
  }

  // Group applications by stage
  const STAGES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];
  
  const pipeline = STAGES.reduce((acc, stage) => {
    acc[stage] = job.Applications.filter(app => app.stage === stage && app.status === 'ACTIVE');
    return acc;
  }, {} as Record<string, typeof job.Applications>);

  pipeline['REJECTED'] = job.Applications.filter(app => app.status === 'REJECTED');

  async function advanceStage(formData: FormData) {
    'use server';
    const applicationId = formData.get('application_id') as string;
    const currentStage = formData.get('current_stage') as string;
    
    let nextStage = 'APPLIED';
    const idx = STAGES.indexOf(currentStage);
    if (idx !== -1 && idx < STAGES.length - 2) {
      nextStage = STAGES[idx + 1];
    }
    
    if (nextStage === 'HIRED') {
      const application = await prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: { Candidate: true, JobRequisition: true }
      });
      
      if (application && application.Candidate && !application.Candidate.converted_to_id) {
        // AUTOMATION: Create Employee using existing foundation
        const newEmployee = await prisma.user.create({
          data: {
            company_id: application.company_id,
            email: application.Candidate.email,
            fullName: `${application.Candidate.first_name} ${application.Candidate.last_name}`,
            role_id: 'Staff',
            status: 'active',
            department: application.JobRequisition.department || 'Production',
            organization_unit_id: application.JobRequisition.organization_unit_id,
            functional_manager_id: application.JobRequisition.hiring_manager_id
          }
        });

        // Link candidate to employee profile to prevent duplication
        await prisma.candidate.update({
          where: { id: application.candidate_id },
          data: { converted_to_id: newEmployee.id }
        });

        // Create Activity timeline using EventBus approach in DB
        await prisma.activityLog.create({
          data: {
            company_id: application.company_id,
            user_id: newEmployee.id,
            user_name: 'System Automation',
            action: 'Employee Profile Created via Recruitment Pipeline'
          }
        });
      }
    }

    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { stage: nextStage }
    });
    
    revalidatePath(`/hr-ops/recruitment/jobs/${id}`);
  }

  async function rejectCandidate(formData: FormData) {
    'use server';
    const applicationId = formData.get('application_id') as string;
    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' }
    });
    revalidatePath(`/hr-ops/recruitment/jobs/${id}`);
  }

  return (
    <div className="p-8 space-y-8 h-full flex flex-col min-w-max">
      {/* Header section */}
      <div className="flex justify-between items-start max-w-7xl">
        <div className="flex items-center gap-4">
          <Link href="/hr-ops/recruitment/jobs" className="p-2 border border-border bg-card rounded-md hover:bg-accent transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {job.department || 'General'}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location || 'Remote'} ({job.work_mode})</span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-semibold">{job.status}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/hr-ops/recruitment/jobs/${id}/edit`} className="flex items-center gap-2 px-4 py-2 border border-border bg-card text-foreground rounded-md text-sm font-medium hover:bg-accent transition-colors">
            <Edit className="h-4 w-4" /> Edit Requisition
          </Link>
        </div>
      </div>

      {/* Kanban Pipeline Board */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 min-w-max h-full items-start">
          {STAGES.map((stage) => (
            <div key={stage} className="w-80 flex flex-col h-[70vh] bg-muted/30 rounded-xl border border-border/50">
              <div className="p-4 border-b border-border/50 flex justify-between items-center bg-card rounded-t-xl">
                <h3 className="font-semibold text-sm">{stage}</h3>
                <span className="px-2 py-0.5 bg-secondary text-xs font-bold rounded-full">
                  {pipeline[stage].length}
                </span>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                {pipeline[stage].map(app => (
                  <div key={app.id} className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group">
                    <h4 className="font-semibold">{app.Candidate.first_name} {app.Candidate.last_name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 truncate">
                      <Mail className="h-3 w-3" /> {app.Candidate.email}
                    </p>
                    {app.Candidate.phone && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {app.Candidate.phone}
                      </p>
                    )}
                    
                    <div className="mt-4 pt-3 border-t border-border flex justify-between gap-2">
                      {stage !== 'REJECTED' && stage !== 'HIRED' && (
                        <>
                          <form action={rejectCandidate}>
                            <input type="hidden" name="application_id" value={app.id} />
                            <button type="submit" className="text-xs font-medium text-destructive hover:underline p-1">
                              Reject
                            </button>
                          </form>
                          <form action={advanceStage}>
                            <input type="hidden" name="application_id" value={app.id} />
                            <input type="hidden" name="current_stage" value={stage} />
                            <button type="submit" className="text-xs font-medium text-primary hover:underline flex items-center p-1">
                              Advance <ChevronRight className="h-3 w-3 ml-0.5" />
                            </button>
                          </form>
                        </>
                      )}
                      {stage === 'HIRED' && (
                        <span className="text-xs font-semibold text-emerald-600">Employee Created</span>
                      )}
                      {stage === 'REJECTED' && (
                        <span className="text-xs font-semibold text-destructive">Rejected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
