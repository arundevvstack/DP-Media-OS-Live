export const dynamic = 'force-dynamic';
import React from 'react';
import prisma from '@/lib/prisma';
import { getUserDetails } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BrainCircuit, AlertTriangle, TrendingDown, Target, Zap, Activity, Clock, Users, DollarSign } from 'lucide-react';
import { HealthEngine } from '@/core/services/intelligence/health.engine';
import { TimelineEngine } from '@/core/services/intelligence/timeline.engine';
import { ResourceEngine } from '@/core/services/intelligence/resource.engine';
import { BudgetEngine } from '@/core/services/intelligence/budget.engine';
import { RiskEngine } from '@/core/services/intelligence/risk.engine';

export default async function ProjectAiCooPage({ params }: { params: { projectId: string } }) {
  const { companyId: company_id } = await getUserDetails();
  const projectId = (await params).projectId;

  const project = await prisma.project.findUnique({
    where: { id: projectId, company_id }
  });

  if (!project) return notFound();

  // Run intelligence engines live
  const healthScore = await HealthEngine.calculateOverallHealth(projectId, company_id);
  const timeline = await TimelineEngine.analyzeTimeline(projectId);
  const resource = await ResourceEngine.analyzeResources(projectId);
  const budget = await BudgetEngine.analyzeBudget(projectId);
  const risks = await RiskEngine.detectRisks(projectId);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI COO Dashboard (Project Brain)</h2>
          <p className="text-muted-foreground">Live intelligence analysis powered by DP Media OS Brain.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivery Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">{healthScore.delivery_confidence}%</div>
              <Target className={`h-6 w-6 ${healthScore.delivery_confidence > 80 ? 'text-green-500' : healthScore.delivery_confidence > 50 ? 'text-yellow-500' : 'text-red-500'}`} />
            </div>
            <Progress value={healthScore.delivery_confidence} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">{healthScore.budget_health}%</div>
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
            <Progress value={healthScore.budget_health} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Schedule Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">{healthScore.schedule_health}%</div>
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <Progress value={healthScore.schedule_health} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resource Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">{healthScore.resource_health}%</div>
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <Progress value={healthScore.resource_health} className="mt-4" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-indigo-500" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              The project is currently operating with a delivery confidence of {healthScore.delivery_confidence}%. 
              {timeline.late_deliverables > 0 ? ` There are ${timeline.late_deliverables} late deliverables impacting the critical path.` : ' Schedule is tracking nicely without major delays.'}
              {budget?.is_overrun ? ' The forecast cost has exceeded the allocated budget limit.' : ' Budget burn is within expected parameters.'}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">TIMELINE</h4>
                <div className="text-sm">Total Milestones: {timeline.total_milestones}</div>
                <div className="text-sm">Schedule Drift: {timeline.schedule_drift_days} days</div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">RESOURCES</h4>
                <div className="text-sm">Total Crew: {resource.total_crew}</div>
                <div className="text-sm">Departments: {resource.roles_utilized.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthScore.ai_recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}