'use client';

import * as React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

type SearchResult = {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  link: string;
};

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  React.useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (error) {
        
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-64 lg:w-80"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="inline-flex">Search Enterprise...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search projects, clients, assets, reviews..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? (
              <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            ) : (
              "No results found."
            )}
          </CommandEmpty>
          
          {Object.entries(groupedResults).map(([type, items]) => (
            <CommandGroup key={type} heading={type}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.subtitle}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(item.link);
                  }}
                  className="flex flex-col items-start gap-1 py-3"
                >
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
