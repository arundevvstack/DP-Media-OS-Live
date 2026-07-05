import React from 'react';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, PieChart, Users, DollarSign, Activity, FileJson } from 'lucide-react';
import Link from 'next/link';

export default async function ProjectReportsPage({ params }: { params: { projectId: string } }) {
  const { company_id } = await requireAuth();
  const projectId = (await params).projectId;

  const project = await prisma.project.findUnique({
    where: { id: projectId, company_id }
  });

  if (!project) return notFound();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enterprise Reporting Hub</h2>
          <p className="text-muted-foreground">Generate and export multi-dimensional intelligence reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Executive Report */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-500" />
              Executive Summary
            </CardTitle>
            <CardDescription>High-level health, budget, and timeline.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Aggregates AI COO insights, critical risks, and overall project delivery confidence for C-suite review.</p>
            <div className="flex gap-2">
              <Link href={`/api/v1/intelligence/reports/export?projectId=${projectId}&type=executive&format=csv`} target="_blank">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Financial Report */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Financial Audit
            </CardTitle>
            <CardDescription>Expenses, POs, and burn rate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Detailed line-item breakdown of all approved and pending expenses against the allocated budget.</p>
            <div className="flex gap-2">
              <Link href={`/api/v1/intelligence/reports/export?projectId=${projectId}&type=financial&format=csv`} target="_blank">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Production Report */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Production Metrics
            </CardTitle>
            <CardDescription>DPRs, shoot days, and locations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Comprehensive export of all Daily Production Reports, crew call times, and shooting logistics.</p>
            <div className="flex gap-2">
              <Link href={`/api/v1/intelligence/reports/export?projectId=${projectId}&type=production&format=csv`} target="_blank">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Resource Report */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Resource Allocation
            </CardTitle>
            <CardDescription>Crew utilization and assignments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Breakdown of team hours, department utilization, and freelancer deployment across the project.</p>
            <div className="flex gap-2">
              <Link href={`/api/v1/intelligence/reports/export?projectId=${projectId}&type=resource&format=csv`} target="_blank">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}