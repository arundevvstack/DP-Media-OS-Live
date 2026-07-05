"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Play, Users, MessageSquare, Plus, CheckCircle2, MoreVertical, Layers, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReviewWorkspacePage({ params }: { params: { productionId: string } }) {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/v1/media-ops/review/${params.productionId}`);
      if (!res.ok) throw new Error("Failed to load review workspace");
      const { data } = await res.json();
      setSessionData(data);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!sessionData) return <div>No review session found.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/media-ops/review/productions")} className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">{sessionData.Production?.name} Review</h1>
              <Badge variant={sessionData.status === "APPROVED" ? "default" : "outline"}>{sessionData.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{sessionData.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-[10px]">
            <Users className="h-4 w-4 mr-2" /> Share
          </Button>
          <Button className="rounded-[10px] shadow-lg">
            <CheckCircle2 className="h-4 w-4 mr-2" /> Submit Decision
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Assets List */}
        <aside className="w-80 border-r bg-background overflow-y-auto">
          <Tabs defaultValue="frames" className="w-full">
            <TabsList className="w-full rounded-none border-b h-12 bg-transparent justify-start px-4">
              <TabsTrigger value="frames" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Frames ({sessionData.Frames?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="assets" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Assets ({sessionData.Assets?.length || 0})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="frames" className="p-0 m-0">
              <div className="p-4 space-y-3">
                {sessionData.Frames?.map((rf: any) => (
                  <Card key={rf.id} className="cursor-pointer hover:border-primary transition-colors">
                    <div className="aspect-video bg-muted relative rounded-t-xl overflow-hidden flex items-center justify-center">
                      <Camera className="h-8 w-8 text-muted-foreground/30" />
                      {rf.Frame?.description && (
                         <div className="absolute inset-0 p-2 text-xs opacity-50 bg-black/50 text-white overflow-hidden">
                           {rf.Frame.description}
                         </div>
                      )}
                    </div>
                    <CardContent className="p-3 pb-2">
                      <div className="flex justify-between items-center">
                        <div className="font-semibold text-sm">Scene {rf.Frame?.scene_number} / Shot {rf.Frame?.shot_number}</div>
                        <Badge variant={rf.status === "APPROVED" ? "default" : "secondary"}>{rf.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {sessionData.Frames?.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    No frames imported. Storyboard must be APPROVED to import frames.
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="assets" className="p-0 m-0">
               <div className="p-4 text-center text-muted-foreground text-sm">
                 No AI Assets uploaded to this review session yet.
               </div>
            </TabsContent>
          </Tabs>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 relative flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden">
          {/* Canvas Toolbar */}
          <div className="h-12 border-b bg-background flex items-center px-4 gap-2 justify-center">
             <Button variant="ghost" size="sm"><Play className="h-4 w-4 mr-2" /> Play All</Button>
             <div className="w-px h-6 bg-border mx-2"></div>
             <Button variant="outline" size="sm" className="rounded-full"><Layers className="h-4 w-4 mr-2" /> Annotate</Button>
             <Button variant="outline" size="sm" className="rounded-full"><MessageSquare className="h-4 w-4 mr-2" /> Comment</Button>
          </div>
          
          <div className="flex-1 overflow-auto flex items-center justify-center p-8">
            <div className="text-center text-muted-foreground">
              <Layers className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Select a frame or asset from the sidebar to review.</p>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Comments & Metadata */}
        <aside className="w-80 border-l bg-background overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Thread
            </h3>
          </div>
          <div className="p-4 text-center text-sm text-muted-foreground py-10">
            Select an item to view comments and annotations.
          </div>
        </aside>
      </div>
    </div>
  );
}
