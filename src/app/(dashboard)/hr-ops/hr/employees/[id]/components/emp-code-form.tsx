'use client';

import { useState } from 'react';
import { Fingerprint, CheckCircle, Loader2, Save } from 'lucide-react';

interface Props {
  employeeId: string;
  currentCode: string;
}

export function EmpCodeForm({ employeeId, currentCode }: Props) {
  const [code, setCode] = useState(currentCode);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch(`/api/v1/users/${employeeId}/emp-code`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emp_code: code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. EMP001"
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save Code'}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <CheckCircle className="h-4 w-4" /> eTimeOffice Employee Code saved successfully!
        </div>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        This code is the employee's ID in the eTimeOffice biometric attendance system (e.g. <code className="bg-muted px-1 rounded">EMP001</code>). It is used to sync punch-in/out records and push approved leaves to eTimeOffice automatically.
      </p>
    </div>
  );
}
