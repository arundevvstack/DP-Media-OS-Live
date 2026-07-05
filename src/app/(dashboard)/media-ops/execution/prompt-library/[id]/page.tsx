import React from "react";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { ChevronLeft, Plus, Save, Trash, Play, Info } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function PromptLibraryDetailsPage({ params }: { params: { id: string } }) {
  const { company_id } = await requireAuth();
  const libraryId = (await params).id;

  const library = await prisma.promptLibrary.findUnique({
    where: { id: libraryId, company_id },
    include: {
      Templates: {
        include: {
          Executions: true
        },
        orderBy: { version: "desc" }
      }
    }
  });

  if (!library) return notFound();

  return (
    <div className="p-8 max-w-[1400px] mx-auto h-full flex flex-col space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/media-ops/execution/prompt-library" className="p-2 hover:bg-accent rounded-full transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{library.name}</h1>
            <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs font-semibold rounded-full uppercase tracking-wider">
              {library.category}
            </span>
          </div>
          <p className="text-muted-foreground mt-1">{library.description || "No description provided."}</p>
        </div>
        <div className="ml-auto flex gap-3">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {library.Templates.length === 0 ? (
            <div className="p-12 border border-border border-dashed rounded-xl text-center text-muted-foreground">
              <Info className="h-10 w-10 mx-auto mb-4 opacity-20" />
              <p>No templates created yet. Add a new standard operating template.</p>
            </div>
          ) : (
            library.Templates.map(template => (
              <div key={template.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {template.name}
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-xs font-bold rounded-md">
                        v{template.version}
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">Provider: {template.ai_provider} • Model: {template.model}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 border border-border rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                      <Play className="h-4 w-4" />
                    </button>
                    <button className="p-2 border border-border rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                      <Save className="h-4 w-4" />
                    </button>
                    <button className="p-2 border border-red-500/20 bg-red-500/5 text-red-600 rounded-md hover:bg-red-500/10 transition-colors">
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Prompt Template</label>
                    <div className="p-4 bg-muted/50 border border-border rounded-lg font-mono text-sm whitespace-pre-wrap">
                      {template.template_text}
                    </div>
                  </div>

                  {template.negative_prompts && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Negative Prompts</label>
                      <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-600/90 rounded-lg font-mono text-sm whitespace-pre-wrap">
                        {template.negative_prompts}
                      </div>
                    </div>
                  )}

                  {template.variables && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Required Variables</label>
                      <div className="flex flex-wrap gap-2">
                        {(template.variables as string[]).map(v => (
                          <span key={v} className="px-2 py-1 bg-accent border border-border rounded-md text-xs font-medium">
                            {'{'}{v}{'}'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-6 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground flex justify-between">
                  <span>Created: {format(new Date(template.created_at), "MMM d, yyyy")}</span>
                  <span>Executions: {template.Executions.length}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Library Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">ID</span>
                <span className="font-mono text-xs">{library.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Total Templates</span>
                <span className="font-semibold">{library.Templates.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Created At</span>
                <span>{format(new Date(library.created_at), "PPp")}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Updated At</span>
                <span>{format(new Date(library.updated_at), "PPp")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
