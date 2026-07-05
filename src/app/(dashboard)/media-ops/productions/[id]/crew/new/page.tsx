"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Users } from "lucide-react";
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

export default function NewCrewAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    user_id: "",
    role: "",
    status: "CONFIRMED",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/v1/team");
      if (res.ok) {
        const { data } = await res.json();
        setUsers(data || []);
      }
    } catch (e) {
      
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_id || !formData.role) {
      toast({ variant: "destructive", title: "Validation Error", description: "User and Role are required" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/media-ops/productions/${params.id}/crew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const { data, error } = await res.json();
      if (!res.ok) throw new Error(error || "Failed to assign crew");

      toast({ title: "Success", description: "Crew member assigned successfully." });
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
              <Users className="h-6 w-6 text-primary" />
              Assign Crew Member
            </h1>
            <p className="text-muted-foreground text-sm">Add a team member to this production</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving} className="rounded-[10px] shadow-lg">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Assign Crew
        </Button>
      </div>

      <Card className="rounded-[16px] shadow-sm border-white/20 dark:border-slate-800/50">
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>Select the team member and specify their role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <Label>Team Member <span className="text-destructive">*</span></Label>
              <Select value={formData.user_id} onValueChange={(val) => setFormData({ ...formData, user_id: val })}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.first_name} {u.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role / Position <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Director of Photography"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending Acceptance</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="TENTATIVE">Tentative (On Hold)</SelectItem>
                  <SelectItem value="DECLINED">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
