import React from "react";

interface StatusBadgeProps {
  status: string;
  colors: Record<string, string>;
}

export default function StatusBadge({ status, colors }: StatusBadgeProps) {
  const badgeClass = colors[status] || "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${badgeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {status}
    </span>
  );
}
