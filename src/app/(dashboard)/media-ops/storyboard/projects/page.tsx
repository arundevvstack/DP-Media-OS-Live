"use client";

import React, { useState, useEffect } from "react";
import { Film, ArrowRight, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function StoryboardProjectsPage() {
  const router = useRouter();
  const [productions, setProductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <ImageIcon className="h-8 w-8 text-primary" />
          Storyboard Projects
        </h1>
        <p className="text-muted-foreground mt-1">Select a production to open its storyboard studio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {productions.map((prod) => (
          <Card key={prod.id} className="group hover:border-primary transition-colors cursor-pointer" onClick={() => router.push(`/media-ops/storyboard/${prod.id}`)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 transition-all">
                  <Film className="h-6 w-6 text-primary" />
                </div>
                <Badge variant={prod.status === "ACTIVE" ? "default" : "secondary"}>{prod.status}</Badge>
              </div>
              <CardTitle className="mt-4">{prod.name}</CardTitle>
              <CardDescription className="text-sm mt-1">{prod.format} • {prod.genre}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-0 flex justify-end">
              <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                Open Studio <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

