// @ts-nocheck
import React from "react";
import prisma from "@/lib/prisma";
import { Users, Calendar, AlertTriangle, FileText, CheckCircle, Activity, Clock } from "lucide-react";
import Link from "next/link";

import { getUserDetails } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function LeaveDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { userId, roleId } = await getUserDetails();
  const isEmployee = roleId === 'EMPLOYEE' || roleId === 'TALENT' || roleId === 'CLIENT';
  const userFilter = isEmployee ? { user_id: userId as string } : {};

  // Run all dashboard aggregation queries in parallel
  const [
    pendingRequests,
    approvedRequests,
    employeesOnLeaveToday,
    upcomingLeaves,
    leaveTypes
  ] = await Promise.all([
    prisma.leaveRequest.count({ where: { status: 'PENDING', ...userFilter } }),
    prisma.leaveRequest.count({ where: { status: 'APPROVED', ...userFilter } }),
    prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        start_date: { lte: today },
        end_date: { gte: today },
        ...userFilter
      },
      include: { User: { select: { id: true, fullName: true, department: true } } }
    }),
    prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        start_date: { gte: tomorrow },
        ...userFilter
      },
      take: 5,
      orderBy: { start_date: 'asc' },
      include: { User: { select: { id: true, fullName: true, department: true } }, LeaveType: true }
    }),
    prisma.leaveType.findMany()
  ]);

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave & Absence</h1>
          <p className="text-muted-foreground mt-1">Live metrics and workforce availability.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/hr-ops/hr/leave/requests/new" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <FileText className="h-4 w-4" /> Apply Leave
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">On Leave Today</p>
              <h3 className="text-3xl font-bold">{employeesOnLeaveToday.length}</h3>
              <p className="text-xs text-muted-foreground mt-1">Approved absences</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors">
          {isEmployee ? (
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">My Pending Requests</p>
                <h3 className="text-3xl font-bold">{pendingRequests}</h3>
                <p className="text-xs text-muted-foreground mt-1 text-amber-600">Awaiting approval</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          ) : (
            <Link href="/hr-ops/hr/leave/approvals">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pending Requests</p>
                  <h3 className="text-3xl font-bold">{pendingRequests}</h3>
                  <p className="text-xs text-muted-foreground mt-1 text-primary hover:underline">Requires approval</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </Link>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Approved Leaves</p>
              <h3 className="text-3xl font-bold">{approvedRequests}</h3>
              <p className="text-xs text-muted-foreground mt-1">Total approved history</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors">
          <Link href="/hr-ops/hr/leave/policies">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Policies</p>
                <h3 className="text-3xl font-bold">{leaveTypes.length}</h3>
                <p className="text-xs text-muted-foreground mt-1">Configured leave types</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* On Leave Today */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Away Today
            </h3>
            <Link href="/hr-ops/hr/leave/calendar" className="text-sm text-primary hover:underline font-medium">View Calendar</Link>
          </div>
          <div className="divide-y divide-border">
            {employeesOnLeaveToday.length > 0 ? (
              employeesOnLeaveToday.map(leave => (
                <div key={leave.id} className="p-6 hover:bg-accent/50 transition-colors flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {leave.User.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold">{leave.User.fullName}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{leave.User.department}</span>
                        <span>•</span>
                        <span>{leave.start_date.toLocaleDateString()} to {leave.end_date.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600">
                      On Leave
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p>No employees are on leave today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Leaves */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Upcoming Absences
          </h3>
          <div className="space-y-4 flex-1">
            {upcomingLeaves.length > 0 ? (
              upcomingLeaves.map(leave => (
                <div key={leave.id} className="flex gap-4 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex flex-col items-center justify-center bg-muted/50 rounded-md p-2 min-w-[50px] text-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase">{leave.start_date.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-lg font-bold">{leave.start_date.getDate()}</span>
                  </div>
                  <div>
                    <p className="font-medium">{leave.User.fullName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{leave.LeaveType?.name || 'Leave'}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{leave.days} Day(s)</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Calendar className="h-6 w-6 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No upcoming leaves scheduled.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
