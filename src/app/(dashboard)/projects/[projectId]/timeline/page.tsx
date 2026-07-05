export const dynamic = 'force-dynamic';
import React from 'react';
import prisma from '@/lib/prisma';
import { getUserDetails } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function TimelinePage({ params }: { params: { projectId: string } }) {
  const { companyId: company_id } = await getUserDetails();
  const projectId = (await params).projectId;
  
  // Fetch unified chronological feed directly from ActivityLog
  const timelineEvents = await prisma.activityLog.findMany({
    where: {
      company_id,
      project_id: projectId
    },
    orderBy: {
      created_at: 'desc'
    },
    take: 100
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Timeline</h2>
        <span className="text-sm text-gray-500">Unified Activity Feed</span>
      </div>
      
      <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3">
        {timelineEvents.length === 0 ? (
            <div className="pl-6 py-4 text-gray-500">No events recorded in this project's timeline yet.</div>
        ) : (
            timelineEvents.map((event) => (
            <div key={event.id} className="mb-8 ml-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                <svg className="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                </svg>
                </span>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="py-3">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-md font-semibold">{event.action}</CardTitle>
                            <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
                                {event.created_at.toLocaleString()}
                            </time>
                        </div>
                    </CardHeader>
                    <CardContent className="py-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>{event.details || "System event recorded."}</p>
                        <p className="mt-2 text-xs font-semibold text-gray-500">Triggered by: {event.user_name}</p>
                    </CardContent>
                </Card>
            </div>
            ))
        )}
      </div>
    </div>
  );
}