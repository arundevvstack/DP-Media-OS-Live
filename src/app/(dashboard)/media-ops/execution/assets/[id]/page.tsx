import React from "react";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { ChevronLeft, Image as ImageIcon, Video, Music, Box, CheckCircle, XCircle, AlertCircle, Clock, History, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function AIAssetDetailsPage({ params }: { params: { id: string } }) {
  const { company_id } = await requireAuth();
  const assetId = (await params).id;

  const asset = await prisma.aIAsset.findUnique({
    where: { id: assetId },
    include: {
      Production: true,
      PromptExecution: {
        include: {
          Template: true
        }
      },
      Versions: {
        orderBy: { version: "desc" }
      }
    }
  });

  if (!asset) return notFound();

  const getIcon = (type: string) => {
    switch(type) {
      case 'IMAGE': return <ImageIcon className="h-6 w-6" />;
      case 'VIDEO': return <Video className="h-6 w-6" />;
      case 'AUDIO': return <Music className="h-6 w-6" />;
      case '3D': return <Box className="h-6 w-6" />;
      default: return <ImageIcon className="h-6 w-6" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'GENERATED': return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider"><Clock className="h-3 w-3" /> Generated</span>;
      case 'REVIEW': return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider"><AlertCircle className="h-3 w-3" /> In Review</span>;
      case 'APPROVED': return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider"><CheckCircle className="h-3 w-3" /> Approved</span>;
      case 'REJECTED': return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider"><XCircle className="h-3 w-3" /> Rejected</span>;
      default: return <span className="px-3 py-1 bg-accent text-foreground rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto h-full flex flex-col space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/media-ops/execution/assets" className="p-2 hover:bg-accent rounded-full transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            {getIcon(asset.asset_type)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{asset.name}</h1>
              {getStatusBadge(asset.status)}
            </div>
            <p className="text-muted-foreground mt-1">
              Production: <Link href={`/media-ops/productions/${asset.production_id}`} className="hover:underline font-medium text-foreground">{asset.Production.title}</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/5 dark:bg-black/40 border border-border rounded-xl overflow-hidden shadow-inner flex items-center justify-center min-h-[500px]">
            {asset.asset_type === 'IMAGE' && asset.url.startsWith('http') ? (
              <img src={asset.url} alt={asset.name} className="max-w-full max-h-[600px] object-contain shadow-2xl" />
            ) : (
              <div className="text-center text-muted-foreground flex flex-col items-center">
                {getIcon(asset.asset_type)}
                <p className="mt-4">Media preview not available.</p>
                <a href={asset.url} target="_blank" rel="noreferrer" className="mt-2 text-primary hover:underline text-sm font-medium">Download Asset</a>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" /> Prompt Lineage
            </h3>
            {asset.PromptExecution ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Source Template</p>
                  <Link href={`/media-ops/execution/prompt-library/${asset.PromptExecution.Template.prompt_library_id}`} className="text-primary hover:underline font-medium">
                    {asset.PromptExecution.Template.name} v{asset.PromptExecution.Template.version}
                  </Link>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Executed Prompt</p>
                  <div className="p-4 bg-muted/50 border border-border rounded-lg font-mono text-sm whitespace-pre-wrap">
                    {asset.PromptExecution.Template.template_text}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Execution Metrics</p>
                  <p className="text-sm">Time taken: {asset.PromptExecution.execution_time_ms}ms</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border border-border border-dashed rounded-lg text-muted-foreground">
                <p>No prompt lineage found. Asset may have been generated externally.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Asset Metadata</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Asset ID</span>
                <span className="font-mono text-xs">{asset.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Asset Type</span>
                <span className="font-semibold">{asset.asset_type}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Generated At</span>
                <span>{format(new Date(asset.created_at), "PPp")}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Last Updated</span>
                <span>{format(new Date(asset.updated_at), "PPp")}</span>
              </div>
              {asset.metadata && (
                <div>
                  <span className="text-muted-foreground block mb-1">Technical Metadata</span>
                  <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(asset.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <History className="h-5 w-5" /> Version History
            </h3>
            {asset.Versions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No revisions. This is the original asset.</p>
            ) : (
              <div className="space-y-4">
                {asset.Versions.map(v => (
                  <div key={v.id} className="p-3 border border-border rounded-lg bg-muted/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm">Version {v.version}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(v.created_at), "MMM d, HH:mm")}</span>
                    </div>
                    {v.changes && (
                      <p className="text-xs text-muted-foreground italic mb-2">"{v.changes}"</p>
                    )}
                    <a href={v.url} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline">View File</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
