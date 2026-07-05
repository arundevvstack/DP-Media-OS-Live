"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Search, Play, FileText, Image as ImageIcon, Users, MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function ReviewDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/v1/media-ops/review/dashboard");
      if (!res.ok) throw new Error("Failed to load review metrics");
      const { data } = await res.json();
      setMetrics(data);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Review Center</h1>
          <p className="text-muted-foreground mt-1">Enterprise collaboration, annotation, and final approval gateway.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/media-ops/review/productions')} className="rounded-[10px] shadow-lg">
            <Play className="mr-2 h-4 w-4" /> Start Review
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-[16px] shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Pending Reviews</CardDescription>
            <CardTitle className="text-3xl font-black">{metrics?.pendingReviews || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Sessions awaiting internal feedback</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[16px] shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Client Action Required</CardDescription>
            <CardTitle className="text-3xl font-black text-amber-500">{metrics?.pendingClientFeedback || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Pending client approvals</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[16px] shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Open Revisions</CardDescription>
            <CardTitle className="text-3xl font-black text-red-500">{metrics?.openRevisions || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Active revision requests</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[16px] shadow-sm bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary-foreground/80">Approval Progress</CardDescription>
            <CardTitle className="text-3xl font-black">{metrics?.approvalProgress || 0}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-primary-foreground/80">Overall production readiness</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2 rounded-[16px]">
          <CardHeader>
            <CardTitle>Recent Review Sessions</CardTitle>
            <CardDescription>Latest collaboration threads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No active sessions. Start a review to collaborate.</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push('/media-ops/review/productions')}>Browse Productions</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[16px]">
          <CardHeader>
            <CardTitle>AI Review Assistant</CardTitle>
            <CardDescription>Automated insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Badge>Brand Consistency</Badge>
              </div>
              <p className="text-sm text-muted-foreground">AI detected 3 frames in Scene 4 that deviate from the primary color palette.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Continuity</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Lighting setup mismatch between Frame 12 and Frame 13. Review suggested.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
