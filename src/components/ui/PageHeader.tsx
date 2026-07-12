import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actionSlot?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actionSlot }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
      {actionSlot && <div className="shrink-0">{actionSlot}</div>}
    </div>
  );
}
