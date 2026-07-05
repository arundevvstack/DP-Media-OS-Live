import React from "react";
import prisma from "@/lib/prisma";
import { getCompanyId, getUserDetails } from '@/lib/auth';
import { Image as ImageIcon, Video, Music, Box, Search, Filter, Play, CheckCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AIAssetsDashboard() {
  const { companyId: company_id } = await getUserDetails();

  const assets = await prisma.asset.findMany({
    include: {
      Project: true
    },
    orderBy: { created_at: "desc" },
    take: 100
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'IMAGE': return <ImageIcon className="h-5 w-5" />;
      case 'VIDEO': return <Video className="h-5 w-5" />;
      case 'AUDIO': return <Music className="h-5 w-5" />;
      case '3D': return <Box className="h-5 w-5" />;
      default: return <ImageIcon className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'GENERATED': return 'bg-blue-500/10 text-blue-600';
      case 'REVIEW': return 'bg-amber-500/10 text-amber-600';
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-600';
      case 'REJECTED': return 'bg-red-500/10 text-red-600';
      default: return 'bg-accent text-foreground';
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto h-full flex flex-col space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise AI Asset Framework</h1>
          <p className="text-muted-foreground mt-1">Central repository for all generated media, revisions, and prompt lineages.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['IMAGE', 'VIDEO', 'AUDIO', '3D'].map(type => (
          <div key={type} className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                {getIcon(type)}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{type} Assets</p>
                <h3 className="text-2xl font-bold">{assets.filter(a => (a.file_type || 'IMAGE') === type).length}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
        <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search assets by name or production..." 
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button className="px-4 py-2 bg-background border border-border rounded-md text-sm font-medium flex items-center gap-2 hover:bg-accent">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
        
        <div className="p-0 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-medium">Asset Name</th>
                <th className="px-6 py-4 font-medium">Production</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Versions</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Generated Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assets.map(asset => (
                <tr key={asset.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-md overflow-hidden flex items-center justify-center shrink-0 border border-border">
                        {(asset.file_type || 'IMAGE') === 'IMAGE' && asset.url.startsWith('http') ? (
                          <img src={asset.url} alt={asset.name} className="h-full w-full object-cover" />
                        ) : (
                          getIcon(asset.file_type || 'IMAGE')
                        )}
                      </div>
                      <span className="line-clamp-1">{asset.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {asset.Project?.project_name || 'Unknown Project'}
                  </td>
                  <td className="px-6 py-4">{asset.file_type || 'IMAGE'}</td>
                  <td className="px-6 py-4 text-center">1</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getStatusColor('APPROVED')}`}>
                      APPROVED
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {format(new Date(asset.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/media-ops/execution/assets/${asset.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-md text-xs font-medium hover:bg-accent transition-colors"
                    >
                      <Play className="h-3 w-3" /> View Asset
                    </Link>
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <Box className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p>No AI generated assets found.</p>
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
