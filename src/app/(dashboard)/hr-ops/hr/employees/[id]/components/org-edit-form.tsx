'use client';
import React, { useState } from 'react';
import { Pencil, Check, X, Loader2, Building2, UserCheck, Users } from 'lucide-react';

interface OrgUser { id: string; fullName: string; department: string; }

interface Props {
  employeeId: string;
  initialDepartment: string;
  initialFunctionalManagerId: string | null;
  initialFunctionalManagerName: string | null;
  initialHrManagerId: string | null;
  initialHrManagerName: string | null;
  allUsers: OrgUser[];
  departments: string[];
}

export function OrgEditForm({
  employeeId,
  initialDepartment,
  initialFunctionalManagerId,
  initialFunctionalManagerName,
  initialHrManagerId,
  initialHrManagerName,
  allUsers,
  departments,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [department, setDepartment] = useState(initialDepartment || '');
  const [functionalManagerId, setFunctionalManagerId] = useState(initialFunctionalManagerId || '');
  const [hrManagerId, setHrManagerId] = useState(initialHrManagerId || '');

  const [displayDept, setDisplayDept] = useState(initialDepartment || '');
  const [displayFmName, setDisplayFmName] = useState(initialFunctionalManagerName || '');
  const [displayHmName, setDisplayHmName] = useState(initialHrManagerName || '');

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/v1/users/${employeeId}/org`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department, functional_manager_id: functionalManagerId || null, hr_manager_id: hrManagerId || null }),
    });
    const data = await res.json();
    if (data.success) {
      setDisplayDept(data.user.department || '');
      setDisplayFmName(data.user.functional_manager_name || '');
      setDisplayHmName(data.user.hr_manager_name || '');
      setEditing(false);
    }
    setSaving(false);
  }

  function cancel() {
    setDepartment(displayDept);
    setFunctionalManagerId(initialFunctionalManagerId || '');
    setHrManagerId(initialHrManagerId || '');
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="grid grid-cols-2 gap-y-5 text-sm">
        <div>
          <p className="text-muted-foreground text-xs mb-1">Functional Manager</p>
          <p className="font-medium flex items-center gap-1.5">
            {displayFmName
              ? <><UserCheck className="h-3.5 w-3.5 text-primary" />{displayFmName}</>
              : <span className="text-muted-foreground italic">Unassigned</span>}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">HR Manager</p>
          <p className="font-medium flex items-center gap-1.5">
            {displayHmName
              ? <><Users className="h-3.5 w-3.5 text-blue-500" />{displayHmName}</>
              : <span className="text-muted-foreground italic">Unassigned</span>}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Department</p>
          <p className="font-medium flex items-center gap-1.5">
            {displayDept
              ? <><Building2 className="h-3.5 w-3.5 text-emerald-500" />{displayDept}</>
              : <span className="text-muted-foreground italic">Unassigned</span>}
          </p>
        </div>
        <div className="flex items-end">
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-accent hover:border-primary/40 transition-colors text-muted-foreground hover:text-foreground">
            <Pencil className="h-3 w-3" /> Edit Assignment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Functional Manager */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <UserCheck className="h-3 w-3" /> Functional Manager
          </label>
          <select value={functionalManagerId} onChange={e => setFunctionalManagerId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">— Unassigned —</option>
            {allUsers.filter(u => u.id !== employeeId).map(u => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>
        </div>

        {/* HR Manager */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" /> HR Manager
          </label>
          <select value={hrManagerId} onChange={e => setHrManagerId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">— Unassigned —</option>
            {allUsers.filter(u => u.id !== employeeId).map(u => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" /> Department
          </label>
          <select value={department} onChange={e => setDepartment(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">— Select Department —</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={cancel}
          className="flex items-center gap-1.5 px-4 py-1.5 border border-border rounded-lg text-sm hover:bg-accent transition-colors">
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}
