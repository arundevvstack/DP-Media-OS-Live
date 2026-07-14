'use client';
import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';

export function ImportCsvButton() {
  const [importing, setImporting] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const records = results.data.map((row: any) => ({
            emp_code: row.EmpCode || row.emp_code || row.EmployeeCode || '',
            emp_name: row.EmpName || row.emp_name || row.EmployeeName || '',
            date: row.Date || row.date || row.AttDate || row.PunchDate || '',
            in_time: row.InTime || row.in_time || row.InPunch || undefined,
            out_time: row.OutTime || row.out_time || row.OutPunch || undefined,
            status: row.Status || row.status || row.AttStatus || 'P'
          }));

          const res = await fetch('/api/v1/integrations/etimeoffice/sync-punches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records })
          });

          const data = await res.json();
          if (res.ok) {
            alert(`Import complete! Synced: ${data.synced}, Skipped: ${data.skipped}`);
            router.refresh();
          } else {
            alert(data.error || 'Failed to import records.');
          }
        } catch (error) {
          alert('An error occurred during import.');
        } finally {
          setImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: () => {
        alert('Failed to parse CSV file.');
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={importing}
        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
      >
        <Upload className={`h-4 w-4 ${importing ? 'animate-pulse' : ''}`} />
        {importing ? 'Importing...' : 'Import CSV'}
      </button>
    </div>
  );
}
