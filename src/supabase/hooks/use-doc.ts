import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabase/client';

export function useSupabaseDoc<T = any>(table: string, id: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [prevId, setPrevId] = useState<string | null>(null);

  const fetchDoc = useCallback(async (active: boolean = true) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const { data: doc, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) {
        console.error(`Supabase doc fetch error [${table}:${id}]:`, fetchError);
        if (active) setError(fetchError);
      } else {
        if (active) setData(doc);
      }
    } catch (err: any) {
      if (active) setError(err);
    } finally {
      if (active) setIsLoading(false);
    }
  }, [table, id]);

  // Synchronously reset loading state during render when id changes to prevent race conditions
  if (id !== prevId) {
    setPrevId(id);
    setIsLoading(id ? true : false);
    setData(null);
  }

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setData(null);
      return;
    }

    let active = true;
    fetchDoc(active);

    // Set up real-time subscription with a unique channel name per hook instance
    const channelId = `${table}_${id}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: `id=eq.${id}`,
        },
        (payload) => {
          if (!active) return;
          if (payload.eventType === 'DELETE') {
            setData(null);
          } else {
            setData(payload.new as T);
          }
        }
      )
      .subscribe();

    // Global broadcast: refetch when any code calls broadcastTableUpdate(table)
    const handleBroadcast = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.table === table && active) {
        if (detail.optimisticData && (detail.optimisticData.id === id || !detail.optimisticData.id)) {
           setData(prev => ({ ...prev, ...detail.optimisticData } as T));
        }
        fetchDoc(active);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('dp:table-update', handleBroadcast);
    }

    return () => {
      active = false;
      supabase.removeChannel(channel);
      if (typeof window !== 'undefined') {
        window.removeEventListener('dp:table-update', handleBroadcast);
      }
    };
  }, [table, id, fetchDoc]);

  return { data, isLoading, error, refetch: () => fetchDoc(true) };
}
