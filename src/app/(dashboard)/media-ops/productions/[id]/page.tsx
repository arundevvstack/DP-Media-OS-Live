"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Film, Calendar, DollarSign, Loader2, PlaySquare, FileText, CheckCircle2, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ProductionDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [production, setProduction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduction();
  }, [params.id]);

  const fetchProduction = async () => {
    try {
      const res = await fetch(`/api/v1/media-ops/productions/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch production");
      const { data } = await res.json();
      setProduction(data);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
      router.push("/media-ops/productions");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!production) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/media-ops/productions")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight">{production.name}</h1>
              <Badge variant="secondary" className="uppercase">{production.status.replace("_", " ")}</Badge>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Film className="h-4 w-4" /> Project: {production.Project?.title || "None"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-[10px]">
            <Edit className="mr-2 h-4 w-4" /> Edit Details
          </Button>
          <Button className="rounded-[10px]" onClick={() => router.push(`/media-ops/productions/${production.id}/call-sheets/new`)}>
            <FileText className="mr-2 h-4 w-4" /> New Call Sheet
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4">Overview</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Schedule
                </p>
                <p className="font-medium mt-1">
                  {production.start_date ? format(new Date(production.start_date), "MMM d, yyyy") : "TBD"} 
                  {" - "}
                  {production.end_date ? format(new Date(production.end_date), "MMM d, yyyy") : "TBD"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Budget
                </p>
                <p className="font-medium mt-1 text-emerald-600 dark:text-emerald-400">
                  {production.budget ? `$${production.budget.toLocaleString()}` : "Not Set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Milestones
                </p>
                <p className="font-medium mt-1">{production.Milestones?.length || 0} Milestones Tracked</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="phases" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
              <TabsTrigger value="phases" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3">Phases</TabsTrigger>
              <TabsTrigger value="crew" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3">Crew Assignments</TabsTrigger>
              <TabsTrigger value="call-sheets" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3">Call Sheets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="phases" className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl">Production Phases</h3>
                <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" /> Add Phase</Button>
              </div>
              {production.Phases?.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-[12px] border border-dashed">
                  <PlaySquare className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground">No phases added yet. E.g. Pre-Production, Shoot, Post.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Phase List Component will go here */}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="crew" className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl">Crew Assignments</h3>
                <Button variant="outline" size="sm" onClick={() => router.push(`/media-ops/productions/${production.id}/crew/new`)}>
                  <Users className="h-4 w-4 mr-2" /> Assign Crew
                </Button>
              </div>
              {(!production.CrewAssignments || production.CrewAssignments.length === 0) ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-[12px] border border-dashed">
                  <p className="text-muted-foreground">No crew assigned to this production.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {production.CrewAssignments.map((assignment: any) => (
                    <div key={assignment.id} className="p-4 border rounded-[12px] flex justify-between items-center bg-white dark:bg-slate-900">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {assignment.User?.first_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold">{assignment.User?.first_name} {assignment.User?.last_name}</p>
                          <p className="text-sm text-muted-foreground">{assignment.role}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{assignment.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="call-sheets" className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl">Call Sheets</h3>
                <Button variant="outline" size="sm" onClick={() => router.push(`/media-ops/productions/${production.id}/call-sheets/new`)}>
                  <FileText className="h-4 w-4 mr-2" /> Generate
                </Button>
              </div>
              <div className="space-y-4">
                {(!production.CallSheets || production.CallSheets.length === 0) ? (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-[12px] border border-dashed">
                    <p className="text-muted-foreground">No call sheets created yet.</p>
                  </div>
                ) : (
                  production.CallSheets.map((sheet: any) => (
                    <div key={sheet.id} className="p-4 border rounded-[12px] flex justify-between items-center">
                      <div>
                        <p className="font-bold">Call Sheet v{sheet.version}</p>
                        <p className="text-sm text-muted-foreground">{sheet.status}</p>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
