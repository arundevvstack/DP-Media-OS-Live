'use client';
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  async function handleSync() {
    try {
      setSyncing(true);
      const res = await fetch('/api/v1/integrations/etimeoffice/sync-punches', {
        method: 'POST',
      });
      if (res.ok) {
        // Refresh the page data to show new attendance records
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to sync with the biometric machine.');
      }
    } catch (error) {
      alert('Error syncing with the machine.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? 'Syncing...' : 'Sync with Machine'}
    </button>
  );
}
