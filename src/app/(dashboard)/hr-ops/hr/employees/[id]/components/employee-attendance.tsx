// @ts-nocheck
'use client';
import React, { useState } from 'react';
import { Clock, Calendar as CalendarIcon, MapPin, Pencil, X, Check, Loader2 } from 'lucide-react';

const STATUS_OPTS = ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'LATE', 'WEEKEND', 'HOLIDAY'];
const STATUS_STYLE: Record<string, string> = {
  PRESENT:  'bg-emerald-500/10 text-emerald-600',
  LATE:     'bg-amber-500/10 text-amber-600',
  ABSENT:   'bg-red-500/10 text-red-600',
  ON_LEAVE: 'bg-blue-500/10 text-blue-600',
  HALF_DAY: 'bg-orange-500/10 text-orange-600',
  WEEKEND:  'bg-slate-500/10 text-slate-500',
  HOLIDAY:  'bg-purple-500/10 text-purple-600',
};

function fmtTime(dt: any) {
  if (!dt) return '—';
  try { return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
}

function EditRow({ log, employeeId, onDone }: { log: any; employeeId: string; onDone: () => void }) {
  const toTime = (dt: any) => dt ? new Date(dt).toTimeString().slice(0, 5) : '';
  const [checkIn,  setCheckIn]  = useState(toTime(log.check_in));
  const [checkOut, setCheckOut] = useState(toTime(log.check_out));
  const [status,   setStatus]   = useState(log.status);
  const [saving,   setSaving]   = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/v1/attendance/${log.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ check_in: checkIn, check_out: checkOut, status }),
    });
    setSaving(false);
    onDone();
  }

  return (
    <tr className="bg-primary/5">
      <td className="px-6 py-3 font-medium text-sm">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {new Date(log.date).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-3">
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-2 py-1 text-xs border border-border rounded bg-background w-full">
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </td>
      <td className="px-6 py-3">
        <input type="time" value={checkIn} onChange={e => setCheckIn(e.target.value)}
          className="px-2 py-1 text-xs border border-border rounded bg-background w-28" />
      </td>
      <td className="px-6 py-3">
        <input type="time" value={checkOut} onChange={e => setCheckOut(e.target.value)}
          className="px-2 py-1 text-xs border border-border rounded bg-background w-28" />
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={saving}
            className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          </button>
          <button onClick={onDone}
            className="p-1.5 bg-muted text-muted-foreground rounded hover:bg-accent transition-colors">
            <X className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function EmployeeAttendanceClient({
  initialLogs, employeeId, companyId,
}: {
  initialLogs: any[];
  employeeId: string;
  companyId: string;
}) {
  const [logs, setLogs] = useState(initialLogs);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/v1/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: employeeId,
        company_id: companyId,
        date: fd.get('date'),
        status: fd.get('status'),
        check_in: fd.get('check_in') || null,
        check_out: fd.get('check_out') || null,
        location: 'Office - Head Quarters',
      }),
    });
    const data = await res.json();
    if (data.record) {
      setLogs(prev => {
        // Replace if same date+user exists, else prepend
        const idx = prev.findIndex(l => new Date(l.date).toDateString() === new Date(data.record.date).toDateString());
        if (idx >= 0) { const copy = [...prev]; copy[idx] = data.record; return copy; }
        return [data.record, ...prev];
      });
      setMsg('✅ Record saved.');
    } else {
      setMsg('❌ ' + (data.error || 'Failed'));
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  }

  function refreshRow(updated: any) {
    setLogs(prev => prev.map(l => l.id === updated?.id ? updated : l));
    setEditId(null);
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Attendance Log</h3>

      {/* Manual entry form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" /> Manual Log Entry
          <span className="text-xs text-muted-foreground ml-1">(creates or updates record for that date)</span>
        </h4>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px] space-y-1.5">
            <label className="text-sm font-medium">Date</label>
            <input type="date" name="date" required
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
              defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="flex-1 min-w-[140px] space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <select name="status" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
              {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px] space-y-1.5">
            <label className="text-sm font-medium">Check In</label>
            <input type="time" name="check_in" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
          </div>
          <div className="flex-1 min-w-[140px] space-y-1.5">
            <label className="text-sm font-medium">Check Out</label>
            <input type="time" name="check_out" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
          </div>
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2 whitespace-nowrap">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? 'Saving…' : 'Log Record'}
          </button>
        </form>
        {msg && <p className="mt-3 text-sm">{msg}</p>}
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Check In</th>
              <th className="px-6 py-3 font-medium">Check Out</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {logs.length > 0 ? logs.map(log => (
              editId === log.id ? (
                <EditRow key={log.id} log={log} employeeId={employeeId}
                  onDone={() => { setEditId(null); /* refresh from state */ }} />
              ) : (
                <tr key={log.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      {new Date(log.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[log.status] || 'bg-muted text-muted-foreground'}`}>
                      {log.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`px-6 py-4 ${log.check_in ? 'font-medium' : 'text-muted-foreground'}`}>
                    {fmtTime(log.check_in)}
                  </td>
                  <td className={`px-6 py-4 ${log.check_out ? 'font-medium' : 'text-muted-foreground'}`}>
                    {fmtTime(log.check_out)}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => setEditId(log.id)}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                      title="Edit times">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              )
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No attendance records found. Use the form above to log manually.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
