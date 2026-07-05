export const dynamic = 'force-dynamic';
import React from 'react';
import prisma from '@/lib/prisma';
import { getUserDetails } from '@/lib/auth';

export default async function AiassistantPage({ params }: { params: { projectId: string } }) {
  const { companyId: company_id } = await getUserDetails();
  const projectId = (await params).projectId;
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ai Assistant</h2>
      {/* TODO: Implement live data integration from existing modules */}
    </div>
  );
}