export const dynamic = 'force-dynamic';
import React from "react";
import prisma from "@/lib/prisma";
import { ArrowLeft, Calendar, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PolicyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const policy = await prisma.leaveType.findUnique({
    where: { id },
    include: {
      _count: { select: { LeaveRequest: true } }
    }
  });

  if (!policy) {
    notFound();
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex items-center gap-4">
        <Link href="/hr-ops/hr/leave/policies" className="p-2 border border-border bg-card rounded-md hover:bg-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{policy.name} Policy</h1>
          <p className="text-muted-foreground mt-1">Rules and guidelines for this leave type.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{policy.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {policy._count.LeaveRequest} Total Requests Processed
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
              <Info className="h-4 w-4" /> Policy Description & Rules
            </h3>
            <div className="bg-background rounded-lg p-4 border border-border text-sm leading-relaxed whitespace-pre-wrap">
              {policy.description ? (
                <p>{policy.description}</p>
              ) : (
                <p className="text-muted-foreground italic">No specific rules or description configured for this policy.</p>
              )}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 p-4 rounded-lg flex gap-3 text-sm">
            <Info className="h-5 w-5 shrink-0" />
            <p>
              This is the current active policy. When applying for {policy.name}, please ensure you read the rules above. Accrual logic and advanced conditions are managed by the HR Administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
