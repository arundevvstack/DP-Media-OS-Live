"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Loader2, Calendar, Film, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ProductionsPage() {
  const router = useRouter();
  const [productions, setProductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNING": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "PRE_PRODUCTION": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "IN_PRODUCTION": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "POST_PRODUCTION": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "COMPLETED": return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const filteredProductions = productions.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.Project?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Film className="h-8 w-8 text-primary" />
            Media Productions
          </h1>
          <p className="text-muted-foreground mt-1">Manage film, video, and media productions</p>
        </div>
        <Button onClick={() => router.push("/media-ops/productions/new")} className="rounded-[10px] shadow-lg">
          <Plus className="mr-2 h-4 w-4" /> New Production
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search productions..." 
            className="pl-9 bg-white/50 dark:bg-slate-900/50 rounded-[10px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-[10px] shrink-0">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProductions.length === 0 ? (
        <Card className="border-dashed bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Film className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-bold">No Productions Found</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Get started by creating a new production. Productions are linked to your projects.
            </p>
            <Button onClick={() => router.push("/media-ops/productions/new")} className="mt-6 rounded-[10px]" variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Create Production
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProductions.map((prod) => (
            <Card key={prod.id} className="group overflow-hidden rounded-[16px] transition-all hover:shadow-xl hover:border-primary/50 cursor-pointer" onClick={() => router.push(`/media-ops/productions/${prod.id}`)}>
              <div className="h-2 w-full bg-gradient-to-r from-primary to-primary/50" />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className={getStatusColor(prod.status)}>
                    {prod.status.replace("_", " ")}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push(`/media-ops/productions/${prod.id}`)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/media-ops/productions/${prod.id}/call-sheets`)}>Call Sheets</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/media-ops/productions/${prod.id}/crew`)}>Crew Assignments</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-xl font-bold mt-2 line-clamp-1">{prod.name}</CardTitle>
                <CardDescription className="line-clamp-1">
                  Project: {prod.Project?.title || "No Linked Project"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4 opacity-70" />
                    {prod.start_date ? format(new Date(prod.start_date), "MMM d, yyyy") : "TBD"} 
                    {" - "}
                    {prod.end_date ? format(new Date(prod.end_date), "MMM d, yyyy") : "TBD"}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 dark:bg-slate-800/50 py-3 mt-auto">
                <div className="w-full flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Phases: {prod.Phases?.length || 0}</span>
                  <span className="font-semibold">{prod.budget ? `$${prod.budget.toLocaleString()}` : "Budget TBD"}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
