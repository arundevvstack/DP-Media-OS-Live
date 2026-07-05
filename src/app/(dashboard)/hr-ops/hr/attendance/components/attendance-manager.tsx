'use client';
import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Pencil, Check, X,
  Loader2, Fingerprint, TrendingUp, Users, Clock,
  CheckCircle2, XCircle, CalendarOff, Timer, Minus, Moon
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface EmployeeRow {
  id: string;
  fullName: string;
  department: string;
  avatar: string | null;
  attendance: {
    id: string | null;
    status: string | null;
    check_in: string | null;
    check_out: string | null;
    location: string | null;
  };
}

interface Props {
  date: string;
  employees: EmployeeRow[];
  companyId: string;
  trend: { date: string; present: number; total: number }[];
}

// ─── Status Config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; dot: string; chip: string; icon: any }> = {
  PRESENT:  { label: 'Present',  dot: 'bg-emerald-500', chip: 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20', icon: CheckCircle2 },
  LATE:     { label: 'Late',     dot: 'bg-amber-500',   chip: 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20',   icon: Timer },
  ABSENT:   { label: 'Absent',   dot: 'bg-red-500',     chip: 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20',         icon: XCircle },
  ON_LEAVE: { label: 'On Leave', dot: 'bg-blue-500',    chip: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',      icon: CalendarOff },
  HALF_DAY: { label: 'Half Day', dot: 'bg-orange-500',  chip: 'bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20',icon: Minus },
  WEEKEND:  { label: 'Weekend',  dot: 'bg-slate-500',   chip: 'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20',   icon: Moon },
};
const STATUS_OPTS = Object.keys(STATUS_CONFIG);

function fmtTime(iso: string | null) {
  if (!iso) return null;
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return null; }
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function toTimeStr(iso: string | null) {
  if (!iso) return '';
  try { return new Date(iso).toTimeString().slice(0, 5); } catch { return ''; }
}

// ─── Inline Edit Row ─────────────────────────────────────────────────────────
function EditRow({ emp, date, companyId, onSave, onCancel }: {
  emp: EmployeeRow; date: string; companyId: string;
  onSave: (rec: EmployeeRow['attendance']) => void;
  onCancel: () => void;
}) {
  const [status,   setStatus]   = useState(emp.attendance.status   || 'PRESENT');
  const [checkIn,  setCheckIn]  = useState(toTimeStr(emp.attendance.check_in));
  const [checkOut, setCheckOut] = useState(toTimeStr(emp.attendance.check_out));
  const [saving,   setSaving]   = useState(false);

  async function save() {
    setSaving(true);
    const isUpdate = Boolean(emp.attendance.id);
    const url  = isUpdate ? `/api/v1/attendance/${emp.attendance.id}` : '/api/v1/attendance';
    const body = isUpdate
      ? { status, check_in: checkIn || null, check_out: checkOut || null }
      : { user_id: emp.id, company_id: companyId, date, status, check_in: checkIn || null, check_out: checkOut || null, location: 'Office' };
    const res = await fetch(url, { method: isUpdate ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);
    if (data.record) onSave({ id: data.record.id, status: data.record.status, check_in: data.record.check_in, check_out: data.record.check_out, location: data.record.location });
    else onCancel();
  }

  return (
    <tr className="bg-primary/5 border-y-2 border-primary/30">
      {/* Employee */}
      <td className="pl-6 pr-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {initials(emp.fullName)}
          </div>
          <div>
            <p className="font-semibold text-sm">{emp.fullName}</p>
            <p className="text-xs text-muted-foreground">{emp.department}</p>
          </div>
        </div>
      </td>
      {/* Status */}
      <td className="px-4 py-4">
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border border-primary/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium">
          {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>
      </td>
      {/* Check In */}
      <td className="px-4 py-4">
        <input type="time" value={checkIn} onChange={e => setCheckIn(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border border-primary/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-[110px]" />
      </td>
      {/* Check Out */}
      <td className="px-4 py-4">
        <input type="time" value={checkOut} onChange={e => setCheckOut(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border border-primary/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-[110px]" />
      </td>
      {/* Hours */}
      <td className="px-4 py-4 text-muted-foreground text-sm">—</td>
      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg font-medium hover:bg-primary/90 transition-colors">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            Save
          </button>
          <button onClick={onCancel}
            className="px-3 py-1.5 border border-border text-xs rounded-lg hover:bg-accent transition-colors">
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function AttendanceManager({ date: initialDate, employees: init, companyId, trend }: Props) {
  const [date,      setDate]      = useState(initialDate);
  const [employees, setEmployees] = useState(init);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [search,    setSearch]    = useState('');
  const [dept,      setDept]      = useState('ALL');
  const [statusF,   setStatusF]   = useState('ALL');
  const [loading,   setLoading]   = useState(false);

  async function loadDate(d: string) {
    setLoading(true); setEditId(null);
    try {
      const res = await fetch(`/api/v1/attendance/by-date?date=${d}`);
      const data = await res.json();
      setDate(d); setEmployees(data.employees || []);
    } finally { setLoading(false); }
  }
  const shift = (n: number) => { const d = new Date(date); d.setDate(d.getDate() + n); loadDate(d.toISOString().split('T')[0]); };

  const stats = useMemo(() => {
    const present  = employees.filter(e => ['PRESENT','LATE'].includes(e.attendance.status || '')).length;
    const absent   = employees.filter(e => e.attendance.status === 'ABSENT').length;
    const onLeave  = employees.filter(e => e.attendance.status === 'ON_LEAVE').length;
    const late     = employees.filter(e => e.attendance.status === 'LATE').length;
    const noRecord = employees.filter(e => !e.attendance.status).length;
    const rate     = employees.length > 0 ? Math.round((present / employees.length) * 100) : 0;
    return { present, absent, onLeave, late, noRecord, rate, total: employees.length };
  }, [employees]);

  const depts = useMemo(() => ['ALL', ...new Set(employees.map(e => e.department).filter(Boolean)).values()].sort(), [employees]);

  const rows = useMemo(() => employees.filter(e => {
    if (search && !e.fullName.toLowerCase().includes(search.toLowerCase())) return false;
    if (dept !== 'ALL' && e.department !== dept) return false;
    if (statusF === 'NO_RECORD') return !e.attendance.status;
    if (statusF !== 'ALL' && e.attendance.status !== statusF) return false;
    return true;
  }), [employees, search, dept, statusF]);

  function onSaved(empId: string, rec: EmployeeRow['attendance']) {
    setEmployees(p => p.map(e => e.id === empId ? { ...e, attendance: rec } : e));
    setEditId(null);
  }

  const isToday = date === new Date().toISOString().split('T')[0];
  const fmtDate = new Date(date + 'T12:00:00').toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // KPI cards config
  const kpis = [
    { key: 'ALL',       label: 'Total Staff',   value: stats.total,    color: 'from-slate-600 to-slate-500',   ring: 'ring-slate-500/20',  bg: 'bg-slate-500/10' },
    { key: 'PRESENT',   label: 'Present',       value: stats.present,  color: 'from-emerald-600 to-emerald-500', ring: 'ring-emerald-500/20', bg: 'bg-emerald-500/10' },
    { key: 'ABSENT',    label: 'Absent',        value: stats.absent,   color: 'from-red-600 to-red-500',       ring: 'ring-red-500/20',    bg: 'bg-red-500/10' },
    { key: 'LATE',      label: 'Late',          value: stats.late,     color: 'from-amber-600 to-amber-500',   ring: 'ring-amber-500/20',  bg: 'bg-amber-500/10' },
    { key: 'ON_LEAVE',  label: 'On Leave',      value: stats.onLeave,  color: 'from-blue-600 to-blue-500',     ring: 'ring-blue-500/20',   bg: 'bg-blue-500/10' },
    { key: 'NO_RECORD', label: 'No Record',     value: stats.noRecord, color: 'from-purple-600 to-purple-500', ring: 'ring-purple-500/20', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-5">

      {/* ── Date Navigator ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => shift(-1)} disabled={loading}
            className="h-9 w-9 flex items-center justify-center border border-border rounded-xl hover:bg-accent transition-colors disabled:opacity-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="relative">
            <input type="date" value={date} onChange={e => loadDate(e.target.value)}
              className="h-9 pl-4 pr-10 text-sm font-semibold bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer" />
            {loading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-primary" />}
          </div>
          <button onClick={() => shift(1)} disabled={loading}
            className="h-9 w-9 flex items-center justify-center border border-border rounded-xl hover:bg-accent transition-colors disabled:opacity-50">
            <ChevronRight className="h-4 w-4" />
          </button>
          {!isToday && (
            <button onClick={() => loadDate(new Date().toISOString().split('T')[0])}
              className="h-9 px-3 text-xs font-medium border border-border rounded-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
              Today
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground hidden lg:block">{fmtDate}</p>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(k => (
          <button key={k.key} onClick={() => setStatusF(statusF === k.key ? 'ALL' : k.key)}
            className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all border ${
              statusF === k.key
                ? `${k.bg} ${k.ring} ring-2 border-transparent`
                : 'bg-card border-border hover:border-primary/30'
            }`}>
            <p className="text-3xl font-black tabular-nums">{k.value}</p>
            <p className="text-[11px] font-medium text-muted-foreground mt-1">{k.label}</p>
            {statusF === k.key && (
              <div className={`absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b ${k.color} opacity-70`} />
            )}
          </button>
        ))}
      </div>

      {/* ── 7-Day Trend + Rate ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Rate card */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attendance Rate</p>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-5xl font-black text-primary mt-3">{stats.rate}<span className="text-2xl">%</span></p>
            <p className="text-xs text-muted-foreground mt-1">{stats.present} present · {stats.total} total</p>
          </div>
          <div className="mt-4">
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full transition-all duration-700"
                style={{ width: `${stats.rate}%` }} />
            </div>
          </div>
        </div>

        {/* Trend bars */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">7-Day Trend</p>
          <div className="flex items-end gap-2 h-20">
            {trend.map(t => {
              const pct = t.total > 0 ? Math.round((t.present / t.total) * 100) : 0;
              const isSelected = t.date === date;
              const d = new Date(t.date + 'T12:00:00');
              const dow = d.toLocaleString('default', { weekday: 'short' });
              return (
                <button key={t.date} onClick={() => loadDate(t.date)}
                  className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-[9px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{pct}%</span>
                  <div className="w-full rounded-t-lg transition-all duration-300 relative overflow-hidden"
                    style={{ height: `${Math.max(6, pct * 0.6)}px` }}>
                    <div className={`absolute inset-0 ${isSelected ? 'bg-primary' : 'bg-primary/25 group-hover:bg-primary/50'} transition-colors`} />
                  </div>
                  <span className={`text-[9px] font-semibold transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>{dow}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Filters bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search crew…"
            className="w-full h-9 pl-9 pr-4 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={dept} onChange={e => setDept(e.target.value)}
          className="h-9 px-3 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20">
          {depts.map(d => <option key={d} value={d}>{d === 'ALL' ? 'All Departments' : d}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{rows.length}/{employees.length} shown</span>
          {statusF !== 'ALL' && (
            <button onClick={() => setStatusF('ALL')} className="text-xs text-primary hover:underline">Clear filter</button>
          )}
        </div>
      </div>

      {/* ── Attendance Table ────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="pl-6 pr-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Employee</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Check In</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Check Out</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Hours</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-muted-foreground text-sm">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                No records match your filters.
              </td></tr>
            ) : rows.map(emp => {
              if (editId === emp.id) return (
                <EditRow key={emp.id} emp={emp} date={date} companyId={companyId}
                  onSave={rec => onSaved(emp.id, rec)}
                  onCancel={() => setEditId(null)} />
              );

              const att = emp.attendance;
              const cfg = att.status ? STATUS_CONFIG[att.status] : null;
              const inTime  = fmtTime(att.check_in);
              const outTime = fmtTime(att.check_out);

              // Calculate hours worked
              let hours: string | null = null;
              if (att.check_in && att.check_out) {
                const diff = (new Date(att.check_out).getTime() - new Date(att.check_in).getTime()) / 3600000;
                hours = diff > 0 ? `${diff.toFixed(1)}h` : null;
              }

              return (
                <tr key={emp.id} className="hover:bg-accent/30 transition-colors group">
                  <td className="pl-6 pr-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xs">
                          {initials(emp.fullName)}
                        </div>
                        {cfg && (
                          <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${cfg.dot}`} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{emp.fullName}</p>
                        <p className="text-xs text-muted-foreground">{emp.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {cfg ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.chip}`}>
                        <cfg.icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted/60 text-muted-foreground ring-1 ring-border">
                        <Minus className="h-3 w-3" />
                        No Record
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {inTime
                      ? <span className="flex items-center gap-1.5 text-sm font-medium"><Clock className="h-3.5 w-3.5 text-emerald-500" />{inTime}</span>
                      : <span className="text-muted-foreground text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    {outTime
                      ? <span className="flex items-center gap-1.5 text-sm font-medium"><Clock className="h-3.5 w-3.5 text-red-400" />{outTime}</span>
                      : <span className="text-muted-foreground text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    {hours
                      ? <span className="text-sm font-bold tabular-nums text-primary">{hours}</span>
                      : <span className="text-muted-foreground text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => setEditId(emp.id)}
                      className="h-7 w-7 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                      <Pencil className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
