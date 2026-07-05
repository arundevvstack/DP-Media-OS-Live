"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Save, Loader2, Image as ImageIcon, Camera, 
  Lightbulb, Palette, FileText, BrainCircuit, MessageSquare, Plus,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function FrameEditorPage({ params }: { params: { frameId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = params.frameId === 'new';
  const storyboardId = searchParams.get('storyboardId');
  
  const [frame, setFrame] = useState<any>({
    storyboard_id: storyboardId || "",
    scene_number: 1,
    shot_number: 1,
    frame_number: 1,
    description: "",
    image_url: "",
    dialogue: "",
    CameraSetup: { angle: "", height: "", movement: "", lens: "", focal_length: "" },
    LightingSetup: { key_light: "", mood: "", color_temp: "" },
    ArtDirection: { set_design: "", wardrobe: "", props: "" }
  });
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!isNew) fetchFrame();
  }, [params.frameId]);

  const fetchFrame = async () => {
    try {
      const res = await fetch(`/api/v1/media-ops/storyboard/frame/${params.frameId}`);
      if (!res.ok) throw new Error("Failed to fetch frame");
      const { data } = await res.json();
      setFrame({
        ...data,
        CameraSetup: data.CameraSetup || { angle: "", height: "", movement: "", lens: "", focal_length: "" },
        LightingSetup: data.LightingSetup || { key_light: "", mood: "", color_temp: "" },
        ArtDirection: data.ArtDirection || { set_design: "", wardrobe: "", props: "" }
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(`/api/v1/media-ops/storyboard/frame/${params.frameId}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(frame)
      });
      if (!res.ok) throw new Error("Failed to save frame");
      const { data } = await res.json();
      toast({ title: "Success", description: "Frame saved successfully." });
      if (isNew) {
        router.push(`/media-ops/storyboard/frame/${data.id}`);
      } else {
        setFrame(prev => ({...prev, ...data}));
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const requestAiSuggestions = () => {
    setAiLoading(true);
    // Simulate AI suggestion process
    setTimeout(() => {
      setFrame((prev: any) => ({
        ...prev,
        CameraSetup: { ...prev.CameraSetup, angle: "Low Angle", movement: "Slow Push-In", lens: "35mm Prime" },
        LightingSetup: { ...prev.LightingSetup, key_light: "High Contrast", mood: "Cinematic, Tense", color_temp: "Cool (5600K)" },
        ArtDirection: { ...prev.ArtDirection, set_design: "Gritty urban textures", wardrobe: "Dark tones, practical" }
      }));
      setAiLoading(false);
      toast({ title: "AI Suggestions Applied", description: "Camera, lighting, and art direction optimized." });
    }, 1500);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              Frame Editor
              {isNew ? <Badge>NEW</Badge> : <Badge variant="secondary">FRAME {frame.frame_number}</Badge>}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={requestAiSuggestions} disabled={aiLoading} className="rounded-[10px] bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400">
            {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
            AI Assist
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-[10px] shadow-lg">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Frame
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image & Core Info */}
        <div className="space-y-6">
          <Card>
            <div className="aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
              {frame.image_url ? (
                <img src={frame.image_url} alt="Frame" className="object-cover w-full h-full" />
              ) : (
                <div className="text-center text-muted-foreground p-6">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No Image/Sketch</p>
                  <Button variant="link" size="sm" className="mt-2 text-primary">Upload Reference</Button>
                </div>
              )}
            </div>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase">Scene</label>
                  <Input type="number" value={frame.scene_number} onChange={e => setFrame({...frame, scene_number: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase">Shot</label>
                  <Input type="number" value={frame.shot_number} onChange={e => setFrame({...frame, shot_number: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase">Frame</label>
                  <Input type="number" value={frame.frame_number} onChange={e => setFrame({...frame, frame_number: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase">Image URL (Ref/AI)</label>
                <Input value={frame.image_url} onChange={e => setFrame({...frame, image_url: e.target.value})} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs for Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="action" className="w-full">
            <TabsList className="w-full justify-start rounded-[10px] overflow-x-auto h-auto py-1">
              <TabsTrigger value="action" className="rounded-lg"><FileText className="h-4 w-4 mr-2"/> Action</TabsTrigger>
              <TabsTrigger value="camera" className="rounded-lg"><Camera className="h-4 w-4 mr-2"/> Camera</TabsTrigger>
              <TabsTrigger value="lighting" className="rounded-lg"><Lightbulb className="h-4 w-4 mr-2"/> Lighting</TabsTrigger>
              <TabsTrigger value="art" className="rounded-lg"><Palette className="h-4 w-4 mr-2"/> Art Dir</TabsTrigger>
              <TabsTrigger value="notes" className="rounded-lg"><MessageSquare className="h-4 w-4 mr-2"/> Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="action" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Action / Visual Description</label>
                    <Textarea 
                      className="min-h-[120px]" 
                      placeholder="Describe what happens in this frame..."
                      value={frame.description || ""}
                      onChange={e => setFrame({...frame, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Dialogue</label>
                    <Textarea 
                      className="min-h-[80px]" 
                      placeholder="Character dialogue..."
                      value={frame.dialogue || ""}
                      onChange={e => setFrame({...frame, dialogue: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="camera" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Angle</label>
                    <Input value={frame.CameraSetup?.angle || ""} onChange={e => setFrame({...frame, CameraSetup: {...frame.CameraSetup, angle: e.target.value}})} placeholder="e.g. Low Angle" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Movement</label>
                    <Input value={frame.CameraSetup?.movement || ""} onChange={e => setFrame({...frame, CameraSetup: {...frame.CameraSetup, movement: e.target.value}})} placeholder="e.g. Pan Right" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Lens / Focal Length</label>
                    <Input value={frame.CameraSetup?.lens || ""} onChange={e => setFrame({...frame, CameraSetup: {...frame.CameraSetup, lens: e.target.value}})} placeholder="e.g. 50mm Prime" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Height</label>
                    <Input value={frame.CameraSetup?.height || ""} onChange={e => setFrame({...frame, CameraSetup: {...frame.CameraSetup, height: e.target.value}})} placeholder="e.g. Eye Level" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lighting" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Mood / Atmosphere</label>
                    <Input value={frame.LightingSetup?.mood || ""} onChange={e => setFrame({...frame, LightingSetup: {...frame.LightingSetup, mood: e.target.value}})} placeholder="e.g. Tense, High Contrast" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Key Light</label>
                    <Input value={frame.LightingSetup?.key_light || ""} onChange={e => setFrame({...frame, LightingSetup: {...frame.LightingSetup, key_light: e.target.value}})} placeholder="e.g. Hard Light from Left" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Color Temperature</label>
                    <Input value={frame.LightingSetup?.color_temp || ""} onChange={e => setFrame({...frame, LightingSetup: {...frame.LightingSetup, color_temp: e.target.value}})} placeholder="e.g. 5600K (Daylight)" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="art" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4 grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Set Design</label>
                    <Input value={frame.ArtDirection?.set_design || ""} onChange={e => setFrame({...frame, ArtDirection: {...frame.ArtDirection, set_design: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Wardrobe / Styling</label>
                    <Input value={frame.ArtDirection?.wardrobe || ""} onChange={e => setFrame({...frame, ArtDirection: {...frame.ArtDirection, wardrobe: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Key Props</label>
                    <Input value={frame.ArtDirection?.props || ""} onChange={e => setFrame({...frame, ArtDirection: {...frame.ArtDirection, props: e.target.value}})} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-orange-600">Director Notes</label>
                    <Textarea value={frame.director_notes || ""} onChange={e => setFrame({...frame, director_notes: e.target.value})} className="min-h-[100px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-blue-600">Client Notes</label>
                    <Textarea value={frame.client_notes || ""} onChange={e => setFrame({...frame, client_notes: e.target.value})} className="min-h-[100px]" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-green-600">Production / Setup Notes</label>
                    <Textarea value={frame.production_notes || ""} onChange={e => setFrame({...frame, production_notes: e.target.value})} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}
