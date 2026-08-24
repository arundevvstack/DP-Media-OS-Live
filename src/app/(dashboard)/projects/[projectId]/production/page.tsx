export const dynamic = 'force-dynamic';
import React from 'react';
import prisma from '@/lib/prisma';
import { getUserDetails } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Video, Camera, ListVideo, Layers, ArrowRight, PlayCircle } from 'lucide-react';

export default async function ProjectProductionPage({ params }: { params: { projectId: string } }) {
  const { companyId: company_id } = await getUserDetails();
  const projectId = (await params).projectId;

  const project = await prisma.project.findFirst({
    where: { id: projectId, company_id },
    include: {
      ShotLists: true,
      DailyProductionLogs: { orderBy: { date: 'desc' }, take: 3 }
    }
  });

  if (!project) return notFound();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Production Operations</h2>
          <p className="text-muted-foreground">Manage shot lists, call sheets, and daily production reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Shot Lists & Scene Breakdowns */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListVideo className="h-5 w-5 text-indigo-500" />
              Shot Lists & Breakdowns
            </CardTitle>
            <CardDescription>Track shooting progress and setups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">Total Shot Lists</span>
                <Badge variant="secondary">{project.ShotLists.length}</Badge>
              </div>
            </div>
            <Link 
              href={`/media-ops/production/shot-lists?project_id=${projectId}`} 
              className="inline-flex items-center justify-center w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Open Shot Lists <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Call Sheets & Crew */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-emerald-500" />
              Call Sheets & Logistics
            </CardTitle>
            <CardDescription>Daily crew dispatch and schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Generate and distribute call sheets based on project schedules and team assignments.
              </p>
            </div>
            <Link 
              href={`/media-ops/production/call-sheets?project_id=${projectId}`} 
              className="inline-flex items-center justify-center w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Manage Call Sheets <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Daily Production Reports */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-rose-500" />
              Daily Production Logs (DPR)
            </CardTitle>
            <CardDescription>End of day reporting and wrap logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">Recent DPRs</span>
                <Badge variant="secondary">{project.DailyProductionLogs.length}</Badge>
              </div>
            </div>
            <Link 
              href={`/media-ops/production/dpr?project_id=${projectId}`} 
              className="inline-flex items-center justify-center w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              View Daily Reports <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {project.DailyProductionLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" /> Recent Production Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.DailyProductionLogs.map(log => (
                <div key={log.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-sm">Day {log.shoot_day}: {log.unit}</h4>
                    <span className="text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-2 text-muted-foreground">
                    <div>Location: {log.location || 'N/A'}</div>
                    <div>Call Time: {log.call_time ? new Date(log.call_time).toLocaleTimeString() : 'N/A'}</div>
                    <div>Wrap Time: {log.wrap_time ? new Date(log.wrap_time).toLocaleTimeString() : 'N/A'}</div>
                  </div>
                  <p className="text-sm border-l-2 border-primary/20 pl-3">{log.notes || 'No general notes.'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}