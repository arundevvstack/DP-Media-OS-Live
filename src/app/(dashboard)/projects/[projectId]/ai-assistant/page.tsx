import React from 'react';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export default async function AiassistantPage({ params }: { params: { projectId: string } }) {
  const { company_id } = await requireAuth();
  const projectId = (await params).projectId;
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ai Assistant</h2>
      {/* TODO: Implement live data integration from existing modules */}
    </div>
  );
}