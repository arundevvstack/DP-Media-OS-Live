export const dynamic = 'force-dynamic';
// @ts-nocheck
import React from 'react';
import prisma from "@/lib/prisma";
import { Search, Filter, UserPlus, MoreVertical, Building2, UserCircle, Mail, Briefcase, Activity, CheckCircle2, XCircle, Timer, CalendarOff, Minus, CheckCircle, MailCheck, ShieldCheck } from "lucide-react";
import Link from 'next/link';
import { OrganizationUnit } from '@prisma/client';
import { ClientAvatar } from './client-avatar';
import { getUserDetails } from "@/lib/auth";
import { redirect } from 'next/navigation';

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string; icon: any }> = {
  PRESENT:  { label: 'Present',  dot: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle2 },
  LATE:     { label: 'Late',     dot: 'bg-amber-500',   bg: 'bg-amber-500/10',   text: 'text-amber-500',   icon: Timer },
  ABSENT:   { label: 'Absent',   dot: 'bg-red-500',     bg: 'bg-red-500/10',     text: 'text-red-500',     icon: XCircle },
  ON_LEAVE: { label: 'On Leave', dot: 'bg-blue-500',    bg: 'bg-blue-500/10',    text: 'text-blue-500',    icon: CalendarOff },
  HALF_DAY: { label: 'Half Day', dot: 'bg-orange-500',  bg: 'bg-orange-500/10',  text: 'text-orange-500',  icon: Minus },
  WEEKEND:  { label: 'Weekend',  dot: 'bg-slate-500',   bg: 'bg-slate-500/10',   text: 'text-slate-500',   icon: Minus },
  HOLIDAY:  { label: 'Holiday',  dot: 'bg-purple-500',  bg: 'bg-purple-500/10',  text: 'text-purple-500',  icon: Minus },
};

function initials(name: string) {
  if (!name) return '??';
  return name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
}

async function getEmployeesData(companyId: string, userId: string, isEmployee: boolean, searchParams: any) {
  const query = (await searchParams).q || '';
  const departmentId = (await searchParams).department || '';
  const status = (await searchParams).status || '';

  const where: any = {
    company_id: companyId,
    role_id: { notIn: ['CLIENT', 'TALENT'] },
  };

  if (isEmployee) {
    where.id = userId;
  }

  if (query) {
    where.OR = [
      { fullName: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (departmentId) {
    where.organization_unit_id = departmentId;
  }

  if (status) {
    where.status = status;
  }

  const [employees, depts] = await Promise.all([
    prisma.user.findMany({
      where,
      take: 100,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.organizationUnit.findMany({
      where: { company_id: companyId, type: 'DEPARTMENT', is_active: true },
      orderBy: { name: 'asc' }
    })
  ]);

  // Fetch today's attendance
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attendances = await prisma.employeeAttendance.findMany({
    where: {
      company_id: companyId,
      date: { gte: today, lt: tomorrow },
      user_id: { in: employees.map(e => e.id) }
    }
  });

  const attMap = new Map(attendances.map(a => [a.user_id, a]));

  return { employees, depts, attMap };
}

export default async function EmployeeDirectoryPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { userId, companyId, roleId } = await getUserDetails();
  if (!userId || !companyId) redirect('/login');

  const isEmployee = roleId === 'EMPLOYEE';
  const { employees, depts, attMap } = await getEmployeesData(companyId, userId, isEmployee, searchParams);

  return (
    <div className="p-8 space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Directory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage personnel, roles, and departmental assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/hr-ops/hr/employees/new" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <UserPlus className="h-4 w-4" /> Add Employee
          </Link>
        </div>
      </div>

      <form className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="search" 
            name="q" 
            placeholder="Search employees by name, email, or role..." 
            className="w-full pl-9 pr-4 py-2 border border-border bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
        <select name="department" className="px-3 py-2 border border-border bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
          <option value="">All Departments</option>
          {depts.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select name="status" className="px-3 py-2 border border-border bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit" className="px-4 py-2 border border-border rounded-lg bg-card hover:bg-accent text-sm font-medium transition-colors flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </form>

      {employees.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-2xl p-12 bg-card/30 text-center">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">No employees found</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Get started by adding employees to your organization. You can add them individually or import via CSV.
          </p>
          <Link href="/hr-ops/hr/employees/new" className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
            <UserPlus className="h-4 w-4" />
            Add First Employee
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {employees.map((employee: any) => {
            const att = attMap.get(employee.id);
            const attCfg = att?.status ? STATUS_CONFIG[att.status] : null;

            return (
              <Link href={`/hr-ops/hr/employees/${employee.id}`} key={employee.id} 
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/40 hover:shadow-md transition-all relative group flex flex-col h-full">
                
                {/* Header: Menu + Status Badge */}
                <div className="flex items-start justify-between w-full mb-3">
                  <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    employee.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                    employee.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                    'bg-muted text-muted-foreground border-border'
                  }`}>
                    {employee.status}
                  </div>
                  <div className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent p-1.5 rounded-lg -mr-2 -mt-2">
                    <MoreVertical className="h-4 w-4" />
                  </div>
                </div>

                {/* Avatar & Info */}
                <div className="flex flex-col items-center text-center space-y-3 flex-1">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full flex items-center justify-center overflow-hidden border-[3px] border-background shadow-sm bg-gradient-to-br from-primary/20 to-primary/5">
                      <ClientAvatar src={employee.avatar} name={employee.fullName} initials={initials(employee.fullName)} />
                    </div>
                    {employee.role_id === 'SUPER_ADMIN' && (
                      <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-primary text-primary-foreground rounded-full border-[3px] border-card flex items-center justify-center shadow-sm" title="Super Admin">
                        <ShieldCheck className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg leading-tight line-clamp-1">{employee.fullName}</h3>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1.5 font-medium">
                      <Briefcase className="h-3.5 w-3.5 opacity-70" />
                      {employee.organization_unit?.name || employee.department || 'Unassigned'}
                    </p>
                  </div>
                </div>
                
                {/* Footer: Live Status & Metrics */}
                <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col items-center p-2.5 rounded-xl bg-accent/50 group-hover:bg-accent transition-colors">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Today</span>
                    {attCfg ? (
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${attCfg.text}`}>
                        <attCfg.icon className="h-3.5 w-3.5" />
                        {attCfg.label}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Minus className="h-3.5 w-3.5 opacity-50" />
                        No Record
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center p-2.5 rounded-xl bg-accent/50 group-hover:bg-accent transition-colors">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Office</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground capitalize">
                      <Building2 className="h-3.5 w-3.5 opacity-50" />
                      {(employee.availability || 'available').replace('_', ' ')}
                    </div>
                  </div>
                </div>

              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

