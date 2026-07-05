"use client";

import React, { useState, useEffect } from "react";
import { 
  PlayCircle, FileImage, ClipboardList, BrainCircuit, 
  Eye, Package, Settings2, Loader2, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function ProductionExecutionDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    activeProductions: 0,
    pendingReviews: 0,
    queuedRenders: 0,
    aiAssetsGenerated: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, we'd fetch metrics from the PES API
    setLoading(false);
  }, []);

  const modules = [
    {
      title: "Storyboards",
      description: "Manage visual scene planning and frame sequencing",
      icon: <FileImage className="h-6 w-6 text-blue-500" />,
      url: "/media-ops/execution/storyboards",
      stats: "12 active"
    },
    {
      title: "Shot Lists",
      description: "Detailed breakdown of camera angles and setups",
      icon: <ClipboardList className="h-6 w-6 text-emerald-500" />,
      url: "/media-ops/execution/shots",
      stats: "45 pending shots"
    },
    {
      title: "Prompt Library",
      description: "Centralized AI prompts for asset generation",
      icon: <Settings2 className="h-6 w-6 text-orange-500" />,
      url: "/media-ops/execution/prompts",
      stats: "128 templates"
    },
    {
      title: "AI Assets",
      description: "Manage AI generated images, video and audio",
      icon: <BrainCircuit className="h-6 w-6 text-purple-500" />,
      url: "/media-ops/execution/assets",
      stats: "8 generating"
    },
    {
      title: "Client Reviews",
      description: "External feedback cycles and frame annotations",
      icon: <Eye className="h-6 w-6 text-pink-500" />,
      url: "/media-ops/execution/client-review",
      stats: "3 pending approval"
    },
    {
      title: "Delivery Packages",
      description: "Final exports, metadata, and client handoff",
      icon: <Package className="h-6 w-6 text-indigo-500" />,
      url: "/media-ops/execution/delivery",
      stats: "2 packages preparing"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <PlayCircle className="h-8 w-8 text-primary" />
            Production Execution System (PES)
          </h1>
          <p className="text-muted-foreground mt-1">
            Operational core for scene execution, AI assets, reviews, and delivery.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Active Productions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{metrics.activeProductions}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-pink-50/50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-pink-600 dark:text-pink-400 uppercase tracking-wider">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{metrics.pendingReviews}</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">Queued Renders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{metrics.queuedRenders}</div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">AI Assets Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{metrics.aiAssetsGenerated}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">Execution Modules</h2>
      
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
                Enter Module <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

