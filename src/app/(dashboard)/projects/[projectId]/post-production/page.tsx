export const dynamic = 'force-dynamic';
import React from 'react';
import prisma from '@/lib/prisma';
import { getUserDetails } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Scissors, FileCheck, CheckSquare, UploadCloud, ArrowRight, MessageSquare } from 'lucide-react';

export default async function ProjectPostProductionPage({ params }: { params: { projectId: string } }) {
  const { companyId: company_id } = await getUserDetails();
  const projectId = (await params).projectId;

  const project = await prisma.project.findFirst({
    where: { id: projectId, company_id },
    include: {
      ReviewSessions: true,
      RevisionRequests: true,
      ExportJobs: true
    }
  });

  if (!project) return notFound();

  const activeReviews = project.ReviewSessions.filter(r => r.status !== 'APPROVED' && r.status !== 'ARCHIVED');
  const openRevisions = project.RevisionRequests.filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Post-Production & Review</h2>
          <p className="text-muted-foreground">Manage client reviews, internal feedback, and asset delivery.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Review Center */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              Enterprise Review Center
            </CardTitle>
            <CardDescription>Frame-accurate annotation and approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">Active Sessions</span>
                <Badge variant={activeReviews.length > 0 ? "default" : "secondary"}>{activeReviews.length}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Sessions</span>
                <span className="font-medium">{project.ReviewSessions.length}</span>
              </div>
            </div>
            <Link 
              href={`/media-ops/review?project_id=${projectId}`} 
              className="inline-flex items-center justify-center w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Open Review Center <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Revisions Manager */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-emerald-500" />
              Revisions & Tasks
            </CardTitle>
            <CardDescription>Track editorial and VFX tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">Open Revisions</span>
                <Badge variant={openRevisions.length > 0 ? "destructive" : "secondary"}>{openRevisions.length}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Revisions</span>
                <span className="font-medium">{project.RevisionRequests.length}</span>
              </div>
            </div>
            <Link 
              href={`/media-ops/execution/revisions?project_id=${projectId}`} 
              className="inline-flex items-center justify-center w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Manage Revisions <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Deliverables & Exports */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-rose-500" />
              Deliverables & Exports
            </CardTitle>
            <CardDescription>Final assets and render queue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">Export Jobs</span>
                <Badge variant="secondary">{project.ExportJobs.length}</Badge>
              </div>
            </div>
            <Link 
              href={`/media-ops/execution/deliverables?project_id=${projectId}`} 
              className="inline-flex items-center justify-center w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              View Deliverables <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
      
      {activeReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" /> Active Review Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeReviews.map(review => (
                <div key={review.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <h4 className="font-semibold text-sm">{review.name}</h4>
                    <p className="text-xs text-muted-foreground">{review.description || 'No description provided.'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                    <Badge variant={review.status === 'CLIENT_REVIEW' ? 'default' : 'outline'}>{review.status}</Badge>
                    <Link href={`/media-ops/review/session/${review.id}`} className="text-primary text-sm hover:underline">
                      Join
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}