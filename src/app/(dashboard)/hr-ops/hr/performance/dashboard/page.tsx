import React from "react";
import prisma from "@/lib/prisma";
import { Target, TrendingUp, Users, Award, BookOpen, AlertCircle, BarChart3, Star, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function PerformanceDashboardPage() {
  const [
    activeCycles,
    totalGoals,
    completedGoals,
    atRiskGoals,
    pendingReviews,
    trainingEnrollments,
    completedTraining,
    talentMatrices,
    topPerformers
  ] = await Promise.all([
    prisma.performanceCycle.count({ where: { status: 'ACTIVE' } }),
    prisma.goal.count(),
    prisma.goal.count({ where: { status: 'COMPLETED' } }),
    prisma.goal.count({ where: { status: 'AT_RISK' } }),
    prisma.performanceReview.count({ where: { status: 'PENDING' } }),
    prisma.trainingEnrollment.count(),
    prisma.trainingEnrollment.count({ where: { status: 'COMPLETED' } }),
    prisma.talentMatrix.findMany({ include: { User: { select: { fullName: true, department: true } } } }),
    prisma.talentMatrix.findMany({
      where: { performance: 3, potential: 3 },
      include: { User: { select: { fullName: true, department: true } } },
      take: 5
    })
  ]);

  // Aggregate Talent Matrix (9 Box Grid data)
  const nineBox = {
    highHigh: talentMatrices.filter(t => t.performance === 3 && t.potential === 3).length,
    highMed: talentMatrices.filter(t => t.performance === 3 && t.potential === 2).length,
    highLow: talentMatrices.filter(t => t.performance === 3 && t.potential === 1).length,
    medHigh: talentMatrices.filter(t => t.performance === 2 && t.potential === 3).length,
    medMed: talentMatrices.filter(t => t.performance === 2 && t.potential === 2).length,
    medLow: talentMatrices.filter(t => t.performance === 2 && t.potential === 1).length,
    lowHigh: talentMatrices.filter(t => t.performance === 1 && t.potential === 3).length,
    lowMed: talentMatrices.filter(t => t.performance === 1 && t.potential === 2).length,
    lowLow: talentMatrices.filter(t => t.performance === 1 && t.potential === 1).length,
  };

  const highFlightRiskCount = talentMatrices.filter(t => t.risk_of_flight === 'HIGH').length;
  const trainingCompletionRate = trainingEnrollments > 0 ? Math.round((completedTraining / trainingEnrollments) * 100) : 0;
  const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance & Talent Dashboard</h1>
          <p className="text-muted-foreground mt-1">Live metrics across goals, appraisals, skills, and succession planning.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/hr-ops/hr/performance/goals" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Target className="h-4 w-4" /> Manage Goals
          </Link>
          <Link href="/hr-ops/hr/performance/appraisals" className="px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-secondary/80 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Launch Review Cycle
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Goal Attainment</p>
              <h3 className="text-3xl font-bold">{goalCompletionRate}%</h3>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-emerald-500 font-medium">{completedGoals}</span> of {totalGoals} Completed
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Goals At Risk</p>
              <h3 className="text-3xl font-bold">{atRiskGoals}</h3>
              <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Requires attention
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pending Reviews</p>
              <h3 className="text-3xl font-bold">{pendingReviews}</h3>
              <p className="text-xs text-muted-foreground mt-1">Self, Peer, & Manager</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Training Completion</p>
              <h3 className="text-3xl font-bold">{trainingCompletionRate}%</h3>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-emerald-500 font-medium">{completedTraining}</span> / {trainingEnrollments} Enrolled
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 9-Box Talent Matrix Distribution */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> 9-Box Talent Matrix Distribution
            </h3>
            <Link href="/hr-ops/hr/performance/succession" className="text-sm text-primary hover:underline font-medium">View Talent Matrix</Link>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-2 aspect-[2/1] w-full max-w-2xl mx-auto text-sm text-center font-medium">
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex flex-col items-center justify-center p-4">
                <span className="text-xs text-emerald-700 mb-1 uppercase tracking-wider">High Impact</span>
                <span className="text-2xl font-bold text-emerald-900">{nineBox.highHigh}</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex flex-col items-center justify-center p-4">
                <span className="text-xs text-emerald-600 mb-1 uppercase tracking-wider">Core Player</span>
                <span className="text-2xl font-bold text-emerald-800">{nineBox.medHigh}</span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg flex flex-col items-center justify-center p-4">
                <span className="text-xs text-amber-600 mb-1 uppercase tracking-wider">Inconsistent</span>
                <span className="text-2xl font-bold text-amber-800">{nineBox.lowHigh}</span>
              </div>
              
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg flex flex-col items-center justify-center p-4">
                <span className="text-xs text-blue-700 mb-1 uppercase tracking-wider">High Potential</span>
                <span className="text-2xl font-bold text-blue-900">{nineBox.highMed}</span>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg flex flex-col items-center justify-center p-4">
                <span className="text-xs text-blue-600 mb-1 uppercase tracking-wider">Solid Pro</span>
                <span className="text-2xl font-bold text-blue-800">{nineBox.medMed}</span>
              </div>
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg flex flex-col items-center justify-center p-4">
                <span className="text-xs text-amber-700 mb-1 uppercase tracking-wider">Dilemma</span>
                <span className="text-2xl font-bold text-amber-900">{nineBox.lowMed}</span>
              </div>

              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg flex flex-col items-center justify-center p-4">
                <span className="text-xs text-purple-700 mb-1 uppercase tracking-wider">Enigma</span>
                <span className="text-2xl font-bold text-purple-900">{nineBox.highLow}</span>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg flex flex-col items-center justify-center p-4">
                <span className="text-xs text-purple-600 mb-1 uppercase tracking-wider">Effective</span>
                <span className="text-2xl font-bold text-purple-800">{nineBox.medLow}</span>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg flex flex-col items-center justify-center p-4">
                <span className="text-xs text-red-600 mb-1 uppercase tracking-wider">Underperformer</span>
                <span className="text-2xl font-bold text-red-800">{nineBox.lowLow}</span>
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground font-medium uppercase tracking-widest mt-4 max-w-2xl mx-auto px-4">
              <span>Low Performance</span>
              <span>Med Performance</span>
              <span>High Performance</span>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" /> Star Performers (Top 5)
            </h3>
          </div>
          <div className="divide-y divide-border">
            {topPerformers.length > 0 ? topPerformers.map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{t.User.fullName}</h4>
                    <p className="text-xs text-muted-foreground">{t.User.department}</p>
                  </div>
                </div>
                <Link href={`/hr-ops/hr/performance/succession`} className="text-xs text-primary hover:underline font-medium">Promote</Link>
              </div>
            )) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No high-high performers mapped yet.
              </div>
            )}
          </div>
        </div>

        {/* AI COO Performance Insights */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col border-t-4 border-t-purple-500">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="text-purple-500 text-xl">✨</span> AI COO Talent Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
              <h4 className="text-sm font-semibold text-purple-700 mb-1 flex items-center gap-1.5"><ShieldAlert className="h-4 w-4" /> Flight Risk Warning</h4>
              <p className="text-xs text-muted-foreground"><strong>{highFlightRiskCount}</strong> key employees are marked at HIGH risk of flight based on market benchmarking and appraisal lag. Recommend scheduling 1:1 retention meetings.</p>
            </div>
            <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
              <h4 className="text-sm font-semibold text-blue-700 mb-1 flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> Skills Gap Analysis</h4>
              <p className="text-xs text-muted-foreground">Engineering department shows a 30% gap in AI integration competencies. Suggest enrolling targeted groups in advanced certification courses.</p>
            </div>
            <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
              <h4 className="text-sm font-semibold text-emerald-700 mb-1 flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Goal Velocity</h4>
              <p className="text-xs text-muted-foreground">Sales division OKRs are progressing 15% faster than Q2. Projecting early completion of Q3 revenue targets.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
