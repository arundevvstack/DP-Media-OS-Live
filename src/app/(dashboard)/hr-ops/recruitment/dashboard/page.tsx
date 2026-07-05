import React from "react";
import prisma from "@/lib/prisma";
import { Users, Briefcase, Calendar, CheckCircle, Clock, Search, ChevronRight, Activity, MapPin } from "lucide-react";
import Link from "next/link";

export default async function RecruitmentDashboardPage() {
  // Aggregate KPIs natively from the DB
  
  const totalOpenRequisitions = await (prisma as any).jobRequisition?.count?.({ where: { status: 'PUBLISHED' } }) || 0;
  const totalCandidates = await (prisma as any).candidate?.count?.() || 0;
  const interviewsTodayCount = await (prisma as any).interview?.count?.({ where: { scheduled_at: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }) || 0;
  const pendingOffers = await (prisma as any).jobOffer?.count?.({ where: { status: 'DRAFT' } }) || 0;
  const recentCandidates = await (prisma as any).candidate?.findMany?.({ take: 5, orderBy: { created_at: 'desc' } }) || [];
  const activeRequisitions = await (prisma as any).jobRequisition?.findMany?.({ take: 4, orderBy: { created_at: 'desc' } }) || [];


  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Talent Acquisition</h1>
          <p className="text-muted-foreground mt-1">Live recruitment pipeline and workforce demand analytics.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/hr-ops/recruitment/jobs/new" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Create Requisition
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Open Positions</p>
              <h3 className="text-3xl font-bold">{totalOpenRequisitions}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Candidates</p>
              <h3 className="text-3xl font-bold">{totalCandidates}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-lg">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Interviews Today</p>
              <h3 className="text-3xl font-bold">{interviewsTodayCount}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pending Offers</p>
              <h3 className="text-3xl font-bold">{pendingOffers}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Active Requisitions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" /> Active Job Requisitions
              </h3>
              <Link href="/hr-ops/recruitment/jobs" className="text-sm text-primary hover:underline font-medium">View All</Link>
            </div>
            <div className="divide-y divide-border">
              {activeRequisitions.length > 0 ? (
                activeRequisitions.map(req => (
                  <div key={req.id} className="p-6 hover:bg-accent/50 transition-colors flex justify-between items-center group cursor-pointer">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{req.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {req.location || 'Remote'}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {req.employment_type}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {req._count?.Applications || 0} Applicants</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-semibold">
                        {req.status}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                  <Briefcase className="h-10 w-10 mb-3 opacity-20" />
                  <p>No active job requisitions found.</p>
                  <p className="text-sm mt-1">Create a new requisition to start hiring.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Candidates & Pipeline */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Pipeline Activity
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {recentCandidates.length > 0 ? (
                recentCandidates.map(candidate => {
                  const latestApp = candidate.Applications[0];
                  return (
                    <div key={candidate.id} className="flex gap-4 items-start pb-4 border-b border-border/50 last:border-0 last:pb-0">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {candidate.first_name[0]}{candidate.last_name[0]}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{candidate.first_name} {candidate.last_name}</h4>
                        {latestApp ? (
                          <div className="text-xs text-muted-foreground mt-1">
                            Applied for <span className="font-medium text-foreground">{latestApp.JobRequisition.title}</span>
                            <div className="mt-1">
                              <span className="px-2 py-0.5 bg-secondary text-foreground rounded-full text-[10px] uppercase font-semibold">
                                {latestApp.stage}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">General Application</p>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No candidates in the pipeline yet.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

