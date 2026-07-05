"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function NewAIAssetPage() {
  const router = useRouter();
  const [productions, setProductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    production_id: "",
    name: "",
    asset_type: "IMAGE",
    url: "",
    prompt_link: ""
  });

  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    try {
      const res = await fetch("/api/v1/media-ops/productions");
      if (!res.ok) throw new Error("Failed to fetch productions");
      const { data } = await res.json();
      setProductions(data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/media-ops/execution/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save asset");
      
      toast({ title: "Success", description: "AI Asset generated and saved successfully!" });
      router.push("/media-ops/execution/assets");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            Generate AI Asset
          </h1>
          <p className="text-muted-foreground mt-1">Submit prompts or save externally generated AI assets</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
            <CardDescription>Link this asset to an active production.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Production</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.production_id}
                onChange={(e) => setFormData({...formData, production_id: e.target.value})}
                required
              >
                <option value="">Select a production...</option>
                {productions.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Asset Name</label>
              <Input 
                placeholder="e.g. Hero Character Concept"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Asset Type</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.asset_type}
                onChange={(e) => setFormData({...formData, asset_type: e.target.value})}
                required
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="AUDIO">Audio</option>
                <option value="3D">3D Model</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Asset URL (Generated or External Link)</label>
              <Input 
                type="url"
                placeholder="https://example.com/asset.png"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt Link / Execution Reference (Optional)</label>
              <Input 
                placeholder="Prompt Template ID or reference..."
                value={formData.prompt_link}
                onChange={(e) => setFormData({...formData, prompt_link: e.target.value})}
              />
            </div>

          </CardContent>
          <div className="p-6 pt-0 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading} className="rounded-[10px]">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Asset
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
