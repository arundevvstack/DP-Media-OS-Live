import React from 'react';
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { 
  Building2, Users, UserCheck, Clock, CalendarDays, 
  Activity, CheckCircle2, AlertCircle, Sparkles, UserPlus,
  ArrowUpRight, HeartPulse
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';
import { HRQuickActions } from './components/hr-quick-actions';
import { redirect } from 'next/navigation';
import { getUserDetails } from '@/lib/auth';

// Live fetch from Prisma
async function getHRMetrics(companyId: string) {
  const employeeCount = await prisma.user.count({
    where: { company_id: companyId, status: { not: 'archived' }, role_id: { in: ['EMPLOYEE', 'SUPER_ADMIN'] } }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const dateObj = new Date(todayStr + 'T00:00:00.000Z');
  const nextDay = new Date(dateObj); nextDay.setDate(nextDay.getDate() + 1);

  const todaysAttendance = await prisma.employeeAttendance.findMany({
    where: { company_id: companyId, date: { gte: dateObj, lt: nextDay } },
    select: { status: true, user_id: true }
  });

  // Deduplicate by user_id, taking the most recent status if there are multiples
  const uniqueAttendance = new Map();
  for (const record of todaysAttendance) {
    uniqueAttendance.set(record.user_id, record.status);
  }
  const attendanceValues = Array.from(uniqueAttendance.values());

  const presentToday = attendanceValues.filter(status => status === 'PRESENT').length;
  const late = attendanceValues.filter(status => status === 'LATE').length;
  const absent = attendanceValues.filter(status => status === 'ABSENT').length;
  const onLeave = attendanceValues.filter(status => status === 'ON_LEAVE').length;

  const pendingApprovals = await prisma.approvalRequest.count({
    where: { company_id: companyId, status: 'Pending' }
  }).catch(() => 0);

  const recruitmentPipeline = await prisma.marketLead.count({
    where: { company_id: companyId, status: { not: 'closed' } }
  }).catch(() => 0); 

  const depts = await prisma.user.groupBy({
    by: ['department'],
    _count: { id: true },
    where: { company_id: companyId, status: { not: 'archived' } }
  });

  const departmentDistribution = depts.map(d => ({
    name: d.department || 'Unassigned',
    count: d._count.id
  }));

  const openWorkOrders = await prisma.objective.count({
    where: { company_id: companyId, status: 'In Progress' }
  }).catch(() => 0);

  const recentActivity = await prisma.activityLog.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    where: { company_id: companyId, action: { in: ['EMPLOYEE_CREATED', 'LEAVE_REQUESTED', 'PAYROLL_PROCESSED', 'WORK_ORDER_COMPLETED', 'WORK_ORDER_CREATED'] } }
  });

  // Calculate dynamic health
  let companyHealth = 100;
  if (employeeCount > 0) {
    const attendanceRate = presentToday / employeeCount;
    if (attendanceRate < 0.8) companyHealth -= 10;
    if (pendingApprovals > 5) companyHealth -= 5;
    if (onLeave > (employeeCount * 0.2)) companyHealth -= 5;
  } else {
    companyHealth = 0;
  }

  return {
    employeeCount,
    presentToday: presentToday + late, // Group late with present for the main counter
    absent,
    late,
    onLeave,
    recruitmentPipeline,
    pendingApprovals,
    openWorkOrders,
    companyHealth, 
    departmentDistribution,
    recentActivity
  };
}

export default async function HRDashboardPage() {
  const { roleId, companyId } = await getUserDetails();
  
  if (roleId === 'EMPLOYEE' || roleId === 'TALENT' || roleId === 'CLIENT') {
    redirect('/hr-ops/hr/leave/dashboard');
  }

  if (!companyId) return null;

  const metrics = await getHRMetrics(companyId);

  return (
    <div className="p-8 space-y-8 w-full font-body">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground">
              HR <span className="text-primary">Command Center</span>
            </h1>
          </div>
          <p className="text-sm font-medium text-muted-foreground max-w-xl">
            Enterprise overview of your workforce. Monitor attendance, manage approvals, and track operational health in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/hr-ops/hr/reports">
            <button className="h-10 px-6 bg-card border border-border rounded-xl text-sm font-bold text-foreground shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 group">
              Generate Report
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </Link>
          <Link href="/hr-ops/hr/employees">
            <button className="h-10 px-6 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Member
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-none shadow-premium rounded-[20px] bg-card overflow-hidden relative group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="h-16 w-16 text-primary" />
          </div>
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">Total Workforce</p>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-black text-foreground">{metrics.employeeCount}</h2>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md mb-1">+Active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-premium rounded-[20px] bg-card overflow-hidden relative group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <UserCheck className="h-16 w-16 text-emerald-500" />
          </div>
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">Present Today</p>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-black text-foreground">{metrics.presentToday}</h2>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md mb-1">
                {metrics.employeeCount > 0 ? ((metrics.presentToday / metrics.employeeCount) * 100).toFixed(0) : '0'}% Rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-premium rounded-[20px] bg-card overflow-hidden relative group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarDays className="h-16 w-16 text-blue-500" />
          </div>
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">On Leave</p>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-black text-foreground">{metrics.onLeave}</h2>
              <span className="text-xs font-bold text-blue-600 bg-blue-500/10 px-2 py-1 rounded-md mb-1">Approved</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-premium rounded-[20px] bg-card overflow-hidden relative group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="h-16 w-16 text-red-500" />
          </div>
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">Pending Approvals</p>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-black text-foreground">{metrics.pendingApprovals}</h2>
              {metrics.pendingApprovals === 0 ? (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md mb-1">Caught Up!</span>
              ) : (
                <span className="text-xs font-bold text-red-600 bg-red-500/10 px-2 py-1 rounded-md mb-1">Action Required</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI Health & Alerts */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card className="border-none shadow-premium rounded-[24px] bg-card overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <HeartPulse className="h-40 w-40 text-emerald-500" />
            </div>
            <CardHeader className="p-8 pb-4 relative z-10">
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                AI Operational Health
              </CardTitle>
              <CardDescription className="text-xs font-medium">Real-time analysis of workforce engagement and operational efficiency.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 relative z-10 space-y-8">
              
              <div className="flex items-center gap-6">
                <div className={`flex items-center justify-center h-24 w-24 rounded-full border-4 shadow-lg ${metrics.companyHealth >= 80 ? 'bg-emerald-500/10 border-emerald-500 shadow-emerald-500/20' : 'bg-red-500/10 border-red-500 shadow-red-500/20'}`}>
                  <span className={`text-3xl font-black ${metrics.companyHealth >= 80 ? 'text-emerald-500' : 'text-red-500'}`}>{metrics.companyHealth}<span className="text-xl">%</span></span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-foreground">Overall Health Index</span>
                    <span className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded-md ${metrics.companyHealth >= 90 ? 'text-emerald-500 bg-emerald-500/10' : metrics.companyHealth >= 70 ? 'text-primary bg-primary/10' : 'text-red-500 bg-red-500/10'}`}>
                      {metrics.companyHealth >= 90 ? 'Excellent' : metrics.companyHealth >= 70 ? 'Good' : 'Needs Attention'}
                    </span>
                  </div>
                  <Progress value={metrics.companyHealth} className={`h-3 rounded-full ${metrics.companyHealth >= 80 ? 'bg-emerald-500/20 [&>div]:bg-emerald-500' : 'bg-red-500/20 [&>div]:bg-red-500'}`} />
                  <p className="text-xs text-muted-foreground font-medium mt-2">Workforce metrics are monitored in real-time based on activity.</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Smart Recommendations
                </h3>
                
                {metrics.employeeCount === 0 ? (
                  <div className="p-6 bg-muted rounded-xl text-sm font-medium text-muted-foreground text-center border border-dashed border-border">
                    AI analysis will begin once crew members are added to the system.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {metrics.companyHealth < 100 && (
                      <div className="flex gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 group hover:border-red-500/40 transition-colors">
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <Activity className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-red-600 dark:text-red-400">Health Score Impact Detected</h4>
                          <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1 font-medium leading-relaxed">
                            Attendance rates or pending approvals have caused a drop in the operational health score. Review workforce allocations.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group hover:border-emerald-500/40 transition-colors">
                      <div className="h-8 w-8 shrink-0 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Hiring Pipeline Optimized</h4>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-medium leading-relaxed">
                          Recruitment pipeline is healthy with {metrics.recruitmentPipeline} active candidates. No critical staffing shortages projected.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Departments & Quick Actions */}
        <div className="col-span-1 space-y-6 flex flex-col">
          
          {/* Department Distribution */}
          <Card className="border-none shadow-premium rounded-[24px] bg-card flex-1 flex flex-col">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Department Spread
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4 flex-1 flex flex-col">
              {metrics.departmentDistribution.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-8">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                    <Building2 className="h-6 w-6 opacity-40" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">No Data Yet</span>
                </div>
              ) : (
                <div className="space-y-5">
                  {metrics.departmentDistribution.map((dept, i) => {
                    const percentage = metrics.employeeCount > 0 ? (dept.count / metrics.employeeCount) * 100 : 0;
                    
                    return (
                      <div key={dept.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-foreground flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            {dept.name}
                          </span>
                          <span className="text-xs font-black text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                            {dept.count} <span className="text-[9px] uppercase tracking-widest font-bold">Crew</span>
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2 bg-secondary [&>div]:bg-primary" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* HR Quick Actions Component (Client Side) */}
          <HRQuickActions />

        </div>
      </div>
      
      {/* Recent Activity Footer */}
      <Card className="border-none shadow-premium rounded-[24px] bg-card">
        <CardHeader className="p-6 border-b border-border/50">
          <CardTitle className="text-base font-black flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Enterprise Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {metrics.employeeCount === 0 || metrics.recentActivity.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-muted-foreground border-t border-border">
              <Activity className="h-8 w-8 opacity-20 mb-3" />
              <p className="text-sm font-medium">Activity feed will populate as events occur.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {metrics.recentActivity.map(activity => {
                let formattedDetails = activity.details || '';
                try {
                  if (formattedDetails.startsWith('{')) {
                    const parsed = JSON.parse(formattedDetails);
                    formattedDetails = Object.entries(parsed)
                      .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                      .join(' • ');
                  }
                } catch (e) {
                  // fallback to raw string
                }

                return (
                  <div key={activity.id} className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-primary/10 text-primary border border-primary/20">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground uppercase tracking-wide">{activity.action.toLowerCase().replace(/_/g, ' ')}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">
                          <span className="text-foreground/80 font-bold">{activity.user_name}</span> 
                          {formattedDetails && <span className="mx-2 opacity-30">|</span>}
                          {formattedDetails}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg group-hover:bg-border transition-colors">
                      {new Date(activity.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
}
