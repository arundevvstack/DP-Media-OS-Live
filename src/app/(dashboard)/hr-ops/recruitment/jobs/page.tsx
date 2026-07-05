import React from 'react';
import prisma from "@/lib/prisma";
import { Search, Plus, MapPin, Users, Briefcase, ChevronRight, Filter } from "lucide-react";
import Link from 'next/link';

export default async function JobRequisitionsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const search = searchParams.q as string || '';
  const statusFilter = searchParams.status as string || '';

  const whereClause: any = {};
  if (search) {
    whereClause.title = { contains: search, mode: 'insensitive' };
  }
  if (statusFilter) {
    whereClause.status = statusFilter;
  }

  const jobs = await prisma.jobRequisition.findMany({
    where: whereClause,
    include: {
      HiringManager: true,
      _count: { select: { Applications: true } }
    },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Requisitions</h1>
          <p className="text-muted-foreground mt-1">Manage open positions and track applicant pipelines.</p>
        </div>
        <Link href="/hr-ops/recruitment/jobs/new" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Requisition
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center justify-between">
          <form className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              name="q"
              defaultValue={search}
              placeholder="Search job titles..." 
              className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          </form>
          <div className="flex gap-2">
            <Link href="?status=PUBLISHED" className={`px-3 py-1.5 border border-border rounded-md text-sm font-medium transition-colors ${statusFilter === 'PUBLISHED' ? 'bg-primary/10 text-primary' : 'bg-background hover:bg-accent'}`}>
              Published
            </Link>
            <Link href="?status=DRAFT" className={`px-3 py-1.5 border border-border rounded-md text-sm font-medium transition-colors ${statusFilter === 'DRAFT' ? 'bg-primary/10 text-primary' : 'bg-background hover:bg-accent'}`}>
              Drafts
            </Link>
            <Link href="/hr-ops/recruitment/jobs" className={`px-3 py-1.5 border border-border rounded-md text-sm font-medium transition-colors ${!statusFilter ? 'bg-primary/10 text-primary' : 'bg-background hover:bg-accent'}`}>
              All
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Hiring Manager</th>
                <th className="px-6 py-4">Location & Mode</th>
                <th className="px-6 py-4">Candidates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.length > 0 ? jobs.map(job => (
                <tr key={job.id} className="hover:bg-accent/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-semibold">{job.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{job.department || 'General'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {job.HiringManager?.fullName?.[0] || 'U'}
                      </div>
                      <span>{job.HiringManager ? job.HiringManager.fullName : 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-muted-foreground" /> {job.location || 'Not specified'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 ml-4.5">{job.work_mode}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{job._count.Applications}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      job.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-600' :
                      job.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/hr-ops/recruitment/jobs/${job.id}`} className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <Briefcase className="h-10 w-10 mb-3 opacity-20" />
                      <p>No job requisitions found matching your criteria.</p>
                      {search || statusFilter ? (
                        <Link href="/hr-ops/recruitment/jobs" className="text-primary hover:underline text-sm mt-2">Clear Filters</Link>
                      ) : (
                        <Link href="/hr-ops/recruitment/jobs/new" className="text-primary hover:underline text-sm mt-2">Create your first requisition</Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

