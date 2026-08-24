import React from 'react';
import prisma from '@/lib/prisma';
import { getUserDetails } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, LayoutDashboard, Calendar, CheckSquare, Folder, MessageSquare, Activity, Bot, Film, Video, Scissors, ShoppingCart, DollarSign, BarChart, BrainCircuit } from 'lucide-react';

export default async function ProjectWorkspaceLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const { companyId: company_id } = await getUserDetails();
  const projectId = (await params).projectId;

  const project = await prisma.project.findFirst({
    where: { id: projectId, company_id },
    include: {
      Client: true,
      ProjectMember: { include: { User: true } }
    }
  });

  if (!project) return notFound();

  const tabs = [
    { name: 'Overview', path: '', icon: LayoutDashboard },
    { name: 'Timeline', path: '/timeline', icon: Calendar },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Files', path: '/files', icon: Folder },
    { name: 'Communication', path: '/communication', icon: MessageSquare },
    { name: 'Activity', path: '/activity', icon: Activity },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'Pre-Production', path: '/pre-production', icon: Film },
    { name: 'Production', path: '/production', icon: Video },
    { name: 'Post-Production', path: '/post-production', icon: Scissors },
    { name: 'Procurement', path: '/procurement', icon: ShoppingCart },
    { name: 'Finance', path: '/finance', icon: DollarSign },
    { name: 'Reports', path: '/reports', icon: BarChart },
    { name: 'AI COO', path: '/ai-coo', icon: BrainCircuit },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex-1 w-full relative">
        {children}
      </div>
    </div>
  );
}