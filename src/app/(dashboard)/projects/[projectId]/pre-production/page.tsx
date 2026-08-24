export const dynamic = 'force-dynamic';
import React from 'react';
import prisma from '@/lib/prisma';
import { getUserDetails } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Film, Image as ImageIcon, BookOpen, PenTool, BrainCircuit, ArrowRight } from 'lucide-react';

export default async function ProjectPreProductionPage({ params }: { params: { projectId: string } }) {
  const { companyId: company_id } = await getUserDetails();
  const projectId = (await params).projectId;

  const project = await prisma.project.findFirst({
    where: { id: projectId, company_id },
    include: {
      Storyboards: {
        include: { Frames: true }
      },
      AIAssets: {
        where: { stage: 'PRE_PRODUCTION' }
      },
      ProductionScripts: true
    }
  });

  if (!project) return notFound();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pre-Production Workspace</h2>
          <p className="text-muted-foreground">Manage scripts, storyboards, and AI concept art.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Storyboard Studio Module */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5 text-blue-500" />
              Storyboard Studio
            </CardTitle>
            <CardDescription>Visual planning and shot progression</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">Active Storyboards</span>
                <Badge variant="secondary">{project.Storyboards.length}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Frames</span>
                <span className="font-medium">{project.Storyboards.reduce((acc, sb) => acc + sb.Frames.length, 0)}</span>
              </div>
            </div>
            <Link 
              href={`/media-ops/storyboard/dashboard?project_id=${projectId}`} 
              className="inline-flex items-center justify-center w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Open Storyboard Studio <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* AI Concept Assets Module */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              AI Concept Framework
            </CardTitle>
            <CardDescription>Generative art and visual references</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">Generated Assets</span>
                <Badge variant="secondary">{project.AIAssets.length}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Approved Concepts</span>
                <span className="font-medium">{project.AIAssets.filter(a => a.status === 'APPROVED').length}</span>
              </div>
            </div>
            <Link 
              href={`/media-ops/execution/assets?project_id=${projectId}`} 
              className="inline-flex items-center justify-center w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Open Asset Library <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Scripting Engine */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-500" />
              Script & Narrative
            </CardTitle>
            <CardDescription>Screenplays, treatments, and VOs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">Active Scripts</span>
                <Badge variant="secondary">{project.ProductionScripts ? 1 : 0}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Latest Version</span>
                <span className="font-medium">{project.ProductionScripts ? `v${project.ProductionScripts.version}` : 'N/A'}</span>
              </div>
            </div>
            <Link 
              href={`/media-ops/scripting?project_id=${projectId}`} 
              className="inline-flex items-center justify-center w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Open Script Editor <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

      </div>
      
      {/* Latest Pre-Production Assets Preview */}
      {project.AIAssets.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5" /> Recent Concept Art
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {project.AIAssets.slice(0, 4).map(asset => (
              <div key={asset.id} className="group relative rounded-md overflow-hidden border bg-muted aspect-video">
                {asset.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.thumbnail_url} alt={asset.title} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8 opacity-20" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-background/80 backdrop-blur-sm p-2 text-xs truncate">
                  {asset.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}