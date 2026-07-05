"use client";

import React from 'react';
import { Play } from 'lucide-react';

export function PayrollActions() {
  return (
    <div className="flex gap-2">
      <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
        <Play className="h-4 w-4" />
        Run Payroll Wizard
      </button>
    </div>
  );
}
