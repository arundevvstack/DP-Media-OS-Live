import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingAttendanceDashboard() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="h-8 w-64 bg-muted rounded-md animate-pulse"></div>
          <div className="h-4 w-96 bg-muted/60 rounded-md animate-pulse mt-2"></div>
        </div>
        <div className="h-10 w-24 bg-muted rounded-lg animate-pulse"></div>
      </div>

      <div className="space-y-5">
        {/* Date Navigator skeleton */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-muted rounded-xl animate-pulse" />
            <div className="h-9 w-[140px] bg-muted rounded-xl animate-pulse" />
            <div className="h-9 w-9 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>

        {/* KPI Cards skeleton */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[90px] rounded-2xl bg-card border border-border p-4 animate-pulse">
              <div className="h-8 w-12 bg-muted rounded mb-2"></div>
              <div className="h-3 w-16 bg-muted/60 rounded"></div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center py-20 text-muted-foreground flex-col gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          <p className="text-sm font-medium">Loading attendance data...</p>
        </div>
      </div>
    </div>
  );
}
