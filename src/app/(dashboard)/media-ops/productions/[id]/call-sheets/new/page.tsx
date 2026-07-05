"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function NewCallSheetPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    call_time: "",
    wrap_time: "",
    special_notes: "",
    weather_notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.call_time) {
      toast({ variant: "destructive", title: "Validation Error", description: "Date and Call Time are required" });
      return;
    }
    setSaving(true);
    try {
      // Combine date and time for ISO strings
      const callDateTime = new Date(`${formData.date}T${formData.call_time}`);
      const wrapDateTime = formData.wrap_time ? new Date(`${formData.date}T${formData.wrap_time}`) : null;

      const payload = {
        date: new Date(formData.date).toISOString(),
        call_time: callDateTime.toISOString(),
        wrap_time: wrapDateTime ? wrapDateTime.toISOString() : null,
        special_notes: formData.special_notes,
        weather_notes: formData.weather_notes,
      };

      const res = await fetch(`/api/v1/media-ops/productions/${params.id}/call-sheets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const { data, error } = await res.json();
      if (!res.ok) throw new Error(error || "Failed to create call sheet");

      toast({ title: "Success", description: "Call Sheet generated successfully." });
      router.push(`/media-ops/productions/${params.id}`);
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
          <Button variant="ghost" size="icon" onClick={() => router.push(`/media-ops/productions/${params.id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Generate Call Sheet
            </h1>
            <p className="text-muted-foreground text-sm">Schedule a shoot day and notify the crew</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving} className="rounded-[10px] shadow-lg">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Generate & Notify
        </Button>
      </div>

      <Card className="rounded-[16px] shadow-sm border-white/20 dark:border-slate-800/50">
        <CardHeader>
          <CardTitle>Shoot Day Details</CardTitle>
          <CardDescription>Enter the date, time, and logistics for this call sheet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Shoot Date <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900"
              />
            </div>
            
            <div className="space-y-2">
              <Label>General Call Time <span className="text-destructive">*</span></Label>
              <Input
                type="time"
                value={formData.call_time}
                onChange={(e) => setFormData({ ...formData, call_time: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label>Estimated Wrap Time</Label>
              <Input
                type="time"
                value={formData.wrap_time}
                onChange={(e) => setFormData({ ...formData, wrap_time: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Weather Notes & Forecast</Label>
            <Input
              placeholder="e.g. 75°F, Sunny, High UV index"
              value={formData.weather_notes}
              onChange={(e) => setFormData({ ...formData, weather_notes: e.target.value })}
              className="bg-slate-50 dark:bg-slate-900"
            />
          </div>

          <div className="space-y-2">
            <Label>Special Instructions / Nearest Hospital</Label>
            <Textarea
              placeholder="Enter parking instructions, health & safety notes, etc."
              value={formData.special_notes}
              onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
              className="bg-slate-50 dark:bg-slate-900 min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
