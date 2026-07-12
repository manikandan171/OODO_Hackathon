import React from "react";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subText?: string;
  icon: LucideIcon;
  colorClass?: string;
  onClick?: () => void;
}

export default function KpiCard({ title, value, subText, icon: Icon, colorClass = "text-blue-600 bg-blue-50 border-blue-100", onClick }: KpiCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between glass-panel dashboard-card ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl border shrink-0 icon-box ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{value}</h3>
        {subText && <p className="text-xs text-slate-400 font-semibold mt-1">{subText}</p>}
      </div>
    </div>
  );
}
