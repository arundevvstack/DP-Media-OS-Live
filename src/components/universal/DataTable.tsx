"use client";

import React from "react";
// In a real implementation, this would use @tanstack/react-table
// import { useReactTable, flexRender, getCoreRowModel } from "@tanstack/react-table";

interface DataTableProps<TData, TValue> {
  columns: any[];
  data: TData[];
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  return (
    <div className="rounded-md border border-white/20 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
      <div className="w-full overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="h-10 px-4 text-left font-medium">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((row: any, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-border/50 transition-colors hover:bg-muted/50 ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, j) => (
                    <td key={j} className="p-4 align-middle">
                      {/* Simplified rendering for placeholder */}
                      {row[col.accessorKey] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
