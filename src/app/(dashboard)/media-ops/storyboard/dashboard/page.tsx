"use client";

import React, { useState, useEffect } from "react";
import { 
  Film, Image as ImageIcon, MessageSquare, ShieldCheck, 
  Settings2, Loader2, ArrowRight, BrainCircuit, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function StoryboardDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    activeStoryboards: 0,
    approvedStoryboards: 0,
    totalFrames: 0,
    framesCompleted: 0,
    framesPending: 0,
    revisionRequests: 0,
    clientFeedback: 0,
    directorFeedback: 0,
    productionReadiness: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/v1/media-ops/storyboard/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
      const { data } = await res.json();
      setMetrics(data);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      title: "Projects",
      description: "Manage storyboards across all productions",
      icon: <Film className="h-6 w-6 text-blue-500" />,
      url: "/media-ops/storyboard/projects",
      stats: `${metrics.activeStoryboards} active`
    },
    {
      title: "Review Center",
      description: "Manage frame annotations and client feedback",
      icon: <MessageSquare className="h-6 w-6 text-pink-500" />,
      url: "/media-ops/storyboard/review",
      stats: `${metrics.revisionRequests} revisions`
    },
    {
      title: "Templates",
      description: "Reusable storyboard structures and defaults",
      icon: <Settings2 className="h-6 w-6 text-orange-500" />,
      url: "/media-ops/storyboard/templates",
      stats: "Manage"
    },
    {
      title: "AI Studio",
      description: "Generate frames and get creative suggestions",
      icon: <BrainCircuit className="h-6 w-6 text-purple-500" />,
      url: "/media-ops/execution/assets",
      stats: "Automated"
    },
    {
      title: "Collaboration",
      description: "Team assignments, mentions, and notifications",
      icon: <Users className="h-6 w-6 text-emerald-500" />,
      url: "/media-ops/storyboard/review",
      stats: "Live"
    },
    {
      title: "Reports",
      description: "Progress tracking and production readiness",
      icon: <ShieldCheck className="h-6 w-6 text-indigo-500" />,
      url: "/media-ops/storyboard/reports",
      stats: `${metrics.productionReadiness}% ready`
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <ImageIcon className="h-8 w-8 text-primary" />
            Storyboard Studio
          </h1>
          <p className="text-muted-foreground mt-1">
            The single source of truth for visual execution and production readiness.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Production Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mb-2">{metrics.productionReadiness}%</div>
            <Progress value={metrics.productionReadiness} className="h-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Frames Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{metrics.framesCompleted} <span className="text-lg text-emerald-600/50">/ {metrics.totalFrames}</span></div>
          </CardContent>
        </Card>

        <Card className="bg-pink-50/50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-pink-600 dark:text-pink-400 uppercase tracking-wider">Pending Revisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{metrics.revisionRequests}</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">Client & Director Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{metrics.clientFeedback + metrics.directorFeedback}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">Studio Modules</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod, idx) => (
          <Card key={idx} className="group hover:border-primary transition-colors cursor-pointer" onClick={() => router.push(mod.url)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                  {mod.icon}
                </div>
                <Badge variant="secondary" className="font-mono text-xs">{mod.stats}</Badge>
              </div>
              <CardTitle className="mt-4">{mod.title}</CardTitle>
              <CardDescription className="text-sm mt-1">{mod.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-0 flex justify-end">
              <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                Enter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

