"use client";

import React, { useState, useEffect } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from 'cmdk';
import { Search, Plus, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-background/80 backdrop-blur-sm">
      <Command className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput 
            placeholder="Type a command or search... (Global Integration Hub)" 
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            autoFocus
          />
        </div>
        <CommandList className="max-h-[60vh] overflow-y-auto p-2">
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Quick Actions (Platform Services)">
            <CommandItem className="flex items-center p-2 cursor-pointer rounded-md hover:bg-muted">
              <Plus className="mr-2 h-4 w-4" />
              <span>Create New Form Template</span>
            </CommandItem>
            <CommandItem className="flex items-center p-2 cursor-pointer rounded-md hover:bg-muted">
              <FileText className="mr-2 h-4 w-4" />
              <span>Generate Report</span>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="AI Intelligence">
            <CommandItem className="flex items-center p-2 cursor-pointer rounded-md hover:bg-muted">
              <Settings className="mr-2 h-4 w-4" />
              <span>Ask AI COO for Health Summary</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};
