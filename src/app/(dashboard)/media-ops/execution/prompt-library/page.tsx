import React from "react";
import prisma from "@/lib/prisma";
import { getCompanyId, requireAuth } from "@/lib/auth";
import { BookOpen, Sparkles, Folder, Play, Plus, Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function PromptLibraryDashboard() {
  const { company_id } = await requireAuth();

  const libraries = await prisma.promptLibrary.findMany({
    where: { company_id },
    include: {
      Templates: {
        include: {
          Executions: true
        }
      }
    },
    orderBy: { created_at: "desc" }
  });

  const totalTemplates = libraries.reduce((sum, lib) => sum + lib.Templates.length, 0);
  const totalExecutions = libraries.reduce((sum, lib) => 
    sum + lib.Templates.reduce((tSum, temp) => tSum + temp.Executions.length, 0)
  , 0);

  return (
    <div className="p-8 max-w-[1400px] mx-auto h-full flex flex-col space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Prompt Library</h1>
          <p className="text-muted-foreground mt-1">Manage AI instructions, negative prompts, and standard operating templates for production.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/media-ops/execution/prompt-library/new" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Library
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Libraries</p>
              <h3 className="text-3xl font-bold">{libraries.length}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Folder className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Templates</p>
              <h3 className="text-3xl font-bold">{totalTemplates}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Prompt Executions</p>
              <h3 className="text-3xl font-bold">{totalExecutions}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
        <div className="p-4 border-b border-border bg-muted/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search libraries or categories..." 
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="divide-y divide-border overflow-y-auto">
          {libraries.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-4 opacity-20" />
              <p>No prompt libraries found. Create your first category to get started.</p>
            </div>
          ) : (
            libraries.map(lib => (
              <div key={lib.id} className="p-6 hover:bg-accent/50 transition-colors flex justify-between items-center group">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-primary/10 rounded-lg shrink-0">
                    <Folder className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Link href={`/media-ops/execution/prompt-library/${lib.id}`}>
                      <h4 className="font-semibold text-lg hover:underline cursor-pointer">{lib.name}</h4>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xl line-clamp-1">{lib.description || "No description provided."}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 bg-accent rounded-full font-medium">{lib.category}</span>
                      <span>•</span>
                      <span>{lib.Templates.length} Templates</span>
                      <span>•</span>
                      <span>Created {format(new Date(lib.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Link href={`/media-ops/execution/prompt-library/${lib.id}`} className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-accent flex items-center gap-2">
                    Manage <Play className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
