"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function NewProductionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    project_id: "",
    status: "PLANNING",
    start_date: "",
    end_date: "",
    budget: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/v1/projects");
      if (res.ok) {
        const { data } = await res.json();
        setProjects(data || []);
      }
    } catch (e) {
      
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.project_id) {
      toast({ variant: "destructive", title: "Validation Error", description: "Name and Project are required" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      };

      const res = await fetch("/api/v1/media-ops/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const { data, error } = await res.json();
      if (!res.ok) throw new Error(error || "Failed to create production");

      toast({ title: "Success", description: "Production created successfully." });
      router.push(`/media-ops/productions/${data.id}`);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/media-ops/productions")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Film className="h-6 w-6 text-primary" />
              New Production
            </h1>
            <p className="text-muted-foreground text-sm">Create a new media production</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving} className="rounded-[10px] shadow-lg">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Create Production
        </Button>
      </div>

      <Card className="rounded-[16px] shadow-sm border-white/20 dark:border-slate-800/50">
        <CardHeader>
          <CardTitle>Production Details</CardTitle>
          <CardDescription>Enter the foundational information for this production.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Production Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Summer Campaign Shoot"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Linked Project <span className="text-destructive">*</span></Label>
              <Select value={formData.project_id} onValueChange={(val) => setFormData({ ...formData, project_id: val })}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="PRE_PRODUCTION">Pre-Production</SelectItem>
                  <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
                  <SelectItem value="POST_PRODUCTION">Post-Production</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estimated Budget</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

