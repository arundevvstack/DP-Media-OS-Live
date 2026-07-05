'use client';

import { useState } from 'react';
import { Fingerprint, RefreshCw, CheckCircle, XCircle, Loader2, CalendarRange } from 'lucide-react';

export function EtimeofficeSettingsCard() {
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string; url?: string } | null>(null);
  const [syncResult, setSyncResult] = useState<{ synced: number; skipped: number } | null>(null);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [customUrl, setCustomUrl] = useState('');

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/v1/integrations/etimeoffice/test-connection', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ customUrl: customUrl || undefined }) });
      const data = await res.json();
      setTestResult({ ok: data.success, msg: data.message || data.error, url: data.url_tested });
    } catch {
      setTestResult({ ok: false, msg: 'Network error' });
    }
    setTesting(false);
  }

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/v1/integrations/etimeoffice/sync-punches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_date: fromDate, to_date: toDate })
      });
      const data = await res.json();
      if (data.success) {
        setSyncResult({ synced: data.synced, skipped: data.skipped });
      } else {
        setTestResult({ ok: false, msg: data.error || 'Sync failed' });
      }
    } catch {
      setTestResult({ ok: false, msg: 'Network error during sync' });
    }
    setSyncing(false);
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Fingerprint className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">eTimeOffice Biometric Sync</h3>
          <p className="text-xs text-muted-foreground">Two-way attendance and leave integration</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Custom URL override */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">API Base URL</label>
          <input
            type="url"
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
            placeholder="https://api.etimeoffice.com/api/ (or your company subdomain)"
            className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
          />
          <p className="text-[11px] text-muted-foreground">Leave blank to use value from .env. Try: <code className="bg-muted px-1 rounded">https://[your-corp].etimeoffice.com/api/</code></p>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Connection Status</span>
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
          >
            {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Test Connection
          </button>
        </div>

        {testResult && (
          <div className={`text-xs p-3 rounded-lg space-y-1.5 ${testResult.ok ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
            <div className="flex items-center gap-2">
              {testResult.ok ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
              {testResult.msg}
            </div>
            {testResult.url && (
              <div className="font-mono text-[10px] opacity-70 pl-6 break-all">Tested: {testResult.url}</div>
            )}
          </div>
        )}

        {/* Manual Sync */}
        <div className="pt-2 border-t border-border space-y-3">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <CalendarRange className="h-3.5 w-3.5" /> Manual Attendance Sync
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">To</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-background"
              />
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {syncing ? 'Syncing…' : 'Sync Punches Now'}
          </button>

          {syncResult && (
            <div className="bg-emerald-500/10 text-emerald-600 p-3 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Sync complete — {syncResult.synced} records imported, {syncResult.skipped} skipped
            </div>
          )}
        </div>

        {/* Config hint */}
        <p className="text-xs text-muted-foreground pt-1 border-t border-border">
          Set <code className="bg-muted px-1 py-0.5 rounded text-xs">ETIMEOFFICE_CORP_ID</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">ETIMEOFFICE_USERNAME</code>, and <code className="bg-muted px-1 py-0.5 rounded text-xs">ETIMEOFFICE_PASSWORD</code> in your <code className="bg-muted px-1 py-0.5 rounded text-xs">.env</code> file.
        </p>
      </div>
    </div>
  );
}
