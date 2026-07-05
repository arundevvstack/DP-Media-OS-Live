"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Plus, Image as ImageIcon, Video, 
  Settings2, Loader2, CheckCircle2, MessageSquare, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

export default function StoryboardEditorPage({ params }: { params: { productionId: string } }) {
  const router = useRouter();
  const [storyboard, setStoryboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoryboard();
  }, [params.productionId]);

  const fetchStoryboard = async () => {
    try {
      const res = await fetch(`/api/v1/media-ops/storyboard/${params.productionId}`);
      if (!res.ok) throw new Error("Failed to fetch storyboard");
      const { data } = await res.json();
      setStoryboard(data);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const createFrame = async () => {
    toast({ title: "Info", description: "Redirecting to frame editor..." });
    // In a real implementation we'd hit POST /api/v1/media-ops/storyboard/frame first
    router.push(`/media-ops/storyboard/frame/new?storyboardId=${storyboard.id}`);
  };

  const handleApprove = async () => {
    toast({ title: "Processing", description: "Automating production artifacts..." });
    try {
      const res = await fetch(`/api/v1/media-ops/storyboard/${params.productionId}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Approval failed");
      toast({ title: "Approved", description: "Shot List, Prompts and Checklists generated." });
      fetchStoryboard(); // refresh
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!storyboard) return <div>No storyboard found.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight">{storyboard.Production?.name}</h1>
              <Badge variant={storyboard.status === "APPROVED" ? "default" : "secondary"}>{storyboard.status}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Storyboard Studio • V{storyboard.version} • {storyboard.Frames?.length || 0} Frames
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {storyboard.status !== "APPROVED" && (
            <Button variant="outline" className="rounded-[10px]" onClick={handleApprove}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Approve & Automate
            </Button>
          )}
          <Button onClick={createFrame} className="rounded-[10px] shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Add Frame
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {storyboard.Frames?.length === 0 ? (
          <Card className="col-span-full border-dashed bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-bold">No Frames Yet</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                Start visualizing your scene by adding the first frame.
              </p>
              <Button onClick={createFrame} className="mt-6 rounded-[10px]" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add First Frame
              </Button>
            </CardContent>
          </Card>
        ) : (
          storyboard.Frames?.map((frame: any) => (
            <Card key={frame.id} className="overflow-hidden hover:border-primary transition-colors cursor-pointer group" onClick={() => router.push(`/media-ops/storyboard/frame/${frame.id}`)}>
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative w-full overflow-hidden flex items-center justify-center">
                {frame.image_url ? (
                  <img src={frame.image_url} alt={`Frame ${frame.frame_number}`} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                ) : (
                   <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                )}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-black/50 text-white backdrop-blur-md border-0">Frame {frame.frame_number}</Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm truncate">Scene {frame.scene_number || "-"} • Shot {frame.shot_number || "-"}</h3>
                  <div className="flex gap-1">
                    {frame.CameraSetup && <Video className="h-3 w-3 text-muted-foreground" title="Camera Configured" />}
                    {frame.ArtDirection && <Settings2 className="h-3 w-3 text-muted-foreground" title="Art Configured" />}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {frame.description || "No description provided"}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
