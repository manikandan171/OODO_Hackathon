import React from "react";

export interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  cellClass?: string;
  headerClass?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export default function DataTable<T>({ data, columns, emptyMessage = "No records matched.", emptyIcon }: DataTableProps<T>) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-slate-800 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#111] border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 ${col.headerClass || ""}`}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-400">
            {data.map((item, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-[#111]/50 transition">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 ${col.cellClass || ""}`}>{col.render(item)}</td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 animate-pulse">
                  {emptyIcon && <div className="mb-2">{emptyIcon}</div>}
                  <p className="text-sm font-semibold">{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
