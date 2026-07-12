import React from "react";
import { ShieldAlert } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-500">
      <ShieldAlert className="w-16 h-16 mb-4 text-red-500/80" />
      <h2 className="text-2xl font-bold text-slate-200 mb-2">Access Denied</h2>
      <p className="text-sm">You do not have the required permissions to view this page.</p>
    </div>
  );
}
