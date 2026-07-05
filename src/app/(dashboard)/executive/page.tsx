import React from 'react';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BrainCircuit, Target, AlertTriangle, Activity, DollarSign, Users, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { HealthEngine } from '@/core/services/intelligence/health.engine';

export default async function ExecutiveDashboardPage() {
  const { company_id } = await requireAuth();

  // Fetch all active projects for the enterprise portfolio
  const projects = await prisma.project.findMany({
    where: { company_id, status: 'ACTIVE' },
    include: { Budget: true, ProjectHealthScore: true }
  });

  // Calculate global portfolio metrics
  let totalDeliveryConfidence = 0;
  let totalBudgetHealth = 0;
  let criticalRisks = 0;
  
  // To avoid hitting the DB aggressively per project in a map, we'd normally batch this.
  // For the purpose of the Intelligence Layer MVP, we iterate.
  const portfolioScores = await Promise.all(projects.map(p => HealthEngine.calculateOverallHealth(p.id, company_id)));

  portfolioScores.forEach(score => {
    totalDeliveryConfidence += score.delivery_confidence;
    totalBudgetHealth += score.budget_health;
    if (score.delivery_confidence < 50 || score.budget_health < 50) criticalRisks++;
  });

  const avgDelivery = projects.length > 0 ? Math.round(totalDeliveryConfidence / projects.length) : 0;
  const avgBudget = projects.length > 0 ? Math.round(totalBudgetHealth / projects.length) : 0;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Executive Intelligence Portfolio</h2>
        <p className="text-muted-foreground">Cross-project analytics and global enterprise health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between text-indigo-700">
              Active Projects
              <Briefcase className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-700">{projects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Avg. Delivery Confidence
              <Target className={`h-4 w-4 ${avgDelivery > 80 ? 'text-green-500' : 'text-amber-500'}`} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgDelivery}%</div>
            <Progress value={avgDelivery} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Global Budget Health
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgBudget}%</div>
            <Progress value={avgBudget} className="mt-2" />
          </CardContent>
        </Card>

        <Card className={criticalRisks > 0 ? 'border-red-500/50 bg-red-500/5' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Critical Risks Detected
              <AlertTriangle className={`h-4 w-4 ${criticalRisks > 0 ? 'text-red-500' : 'text-green-500'}`} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{criticalRisks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CEO / COO View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              CEO / COO Briefing
            </CardTitle>
            <CardDescription>Top-level operational and financial risks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active projects to analyze.</p>
              ) : (
                projects.map((project, idx) => (
                  <div key={project.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <Link href={`/projects/${project.id}`} className="font-semibold text-sm hover:underline">{project.title}</Link>
                      <div className="text-xs text-muted-foreground mt-1">
                        Confidence: {portfolioScores[idx].delivery_confidence}% | Budget: {portfolioScores[idx].budget_health}%
                      </div>
                    </div>
                    <Badge variant={portfolioScores[idx].delivery_confidence < 50 ? 'destructive' : 'secondary'}>
                      {portfolioScores[idx].delivery_confidence < 50 ? 'AT RISK' : 'ON TRACK'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Production Director View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Production Director Briefing
            </CardTitle>
            <CardDescription>Resource and schedule bottlenecks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project, idx) => {
                const score = portfolioScores[idx];
                if (score.burnout_risk_score > 60 || score.schedule_health < 70) {
                  return (
                    <div key={project.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">{project.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {score.burnout_risk_score > 60 ? 'High resource burnout risk. ' : ''}
                          {score.schedule_health < 70 ? 'Schedule drift detected.' : ''}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
              {projects.every((_, idx) => portfolioScores[idx].burnout_risk_score <= 60 && portfolioScores[idx].schedule_health >= 70) && (
                <p className="text-sm text-muted-foreground">All production schedules and resources are stable.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
