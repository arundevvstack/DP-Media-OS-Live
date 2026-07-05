import React from "react";
import prisma from "@/lib/prisma";
import { getUserDetails } from '@/lib/auth';
import { BookOpen, Sparkles, Folder, Play, Plus, Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function PromptLibraryDashboard() {
  const { companyId: company_id } = await getUserDetails();

  const libraries: any[] = [];
  const totalTemplates = 0;
  const totalExecutions = 0;

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
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg text-primary"><BookOpen className="h-6 w-6" /></div>
          <div><p className="text-sm font-medium text-muted-foreground">Active Libraries</p><h3 className="text-2xl font-bold">{libraries.length}</h3></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg text-primary"><Folder className="h-6 w-6" /></div>
          <div><p className="text-sm font-medium text-muted-foreground">Prompt Templates</p><h3 className="text-2xl font-bold">{totalTemplates}</h3></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg text-primary"><Sparkles className="h-6 w-6" /></div>
          <div><p className="text-sm font-medium text-muted-foreground">Total Executions</p><h3 className="text-2xl font-bold">{totalExecutions}</h3></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
        <div className="p-0 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-medium">Library Name</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Templates</th>
                <th className="px-6 py-4 font-medium">Last Updated</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {libraries.map(lib => (
                <tr key={lib.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <Link href={`/media-ops/execution/prompt-library/${lib.id}`} className="hover:underline flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" /> {lib.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground line-clamp-1">{lib.description}</td>
                  <td className="px-6 py-4">{lib.Templates?.length || 0}</td>
                  <td className="px-6 py-4 text-muted-foreground">{format(new Date(lib.updated_at), "MMM d, yyyy")}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/media-ops/execution/prompt-library/${lib.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-md text-xs font-medium hover:bg-accent transition-colors">
                      View Templates
                    </Link>
                  </td>
                </tr>
              ))}
              {libraries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p>No prompt libraries found. Create your first library to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
