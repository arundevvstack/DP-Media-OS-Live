"use client";

import React from "react";

export type ApprovalState = "PENDING" | "APPROVED" | "REJECTED" | "DRAFT" | "ESCALATED";

export function ApprovalBadge({ state }: { state: ApprovalState }) {
  const stateStyles: Record<ApprovalState, string> = {
    DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    REJECTED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    ESCALATED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${stateStyles[state]}`}>
      {state}
    </span>
  );
}
