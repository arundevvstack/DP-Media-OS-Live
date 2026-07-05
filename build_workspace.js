const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'src', 'app', '(dashboard)', 'projects', '[projectId]');

// Create directories
const dirs = [
  'timeline', 'tasks', 'files', 'communication', 'activity', 'ai-assistant',
  'pre-production', 'production', 'post-production', 'procurement', 'finance', 'reports', 'ai-coo'
];

dirs.forEach(dir => {
  const p = path.join(basePath, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  
  // Create basic page.tsx for each
  const content = `import React from 'react';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export default async function ${dir.replace(/-/g, '').replace(/^\w/, c => c.toUpperCase())}Page({ params }: { params: { projectId: string } }) {
  const { company_id } = await requireAuth();
  const projectId = (await params).projectId;
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">${dir.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h2>
      {/* TODO: Implement live data integration from existing modules */}
    </div>
  );
}`;
  fs.writeFileSync(path.join(p, 'page.tsx'), content);
});

// Create layout.tsx
const layoutContent = `import React from 'react';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
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
  const { company_id } = await requireAuth();
  const projectId = (await params).projectId;

  const project = await prisma.project.findUnique({
    where: { id: projectId, company_id },
    include: {
      Client: true,
      Members: { include: { User: true } }
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
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border bg-card px-6 py-4 shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/projects" className="p-2 hover:bg-accent rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.Client?.name || 'Internal'} • {project.status}</p>
          </div>
        </div>
        
        <div className="flex overflow-x-auto no-scrollbar gap-2">
          {tabs.map(tab => (
            <Link key={tab.name} href={\`/projects/\${projectId}\${tab.path}\`} className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent text-sm font-medium whitespace-nowrap">
              <tab.icon className="h-4 w-4" /> {tab.name}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}`;

fs.writeFileSync(path.join(basePath, 'layout.tsx'), layoutContent);

console.log('Project Workspace Scaffolding created.');
