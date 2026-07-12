import React from "react";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { Role, VehicleReport, DashboardKPIs } from "../types";

interface ReportsViewProps {
  analyticsReport: VehicleReport[];
  kpis: DashboardKPIs;
  activeRole: Role;
}

export default function ReportsView({
  analyticsReport,
  kpis,
  activeRole
}: ReportsViewProps) {
  
  // Calculate aggregate metrics
  const totalDistance = analyticsReport.reduce((acc, curr) => acc + Number(curr.totalDistanceKm || 0), 0);
  const totalFuel = analyticsReport.reduce((acc, curr) => acc + Number(curr.totalFuelLiters || 0), 0);
  const avgFuelEfficiency = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(1) : "0.0";
  
  const totalOperationalCost = analyticsReport.reduce((acc, curr) => acc + Number(curr.operationalCost || 0), 0);
  
  const avgRoi = analyticsReport.length > 0 
    ? (analyticsReport.reduce((acc, curr) => acc + Number(curr.roiPercent || 0), 0) / analyticsReport.length).toFixed(1)
    : "0.0";

  // Chart data
  const revenueData = [...analyticsReport]
    .sort((a, b) => Number(b.totalRevenue || 0) - Number(a.totalRevenue || 0))
    .slice(0, 8)
    .map(v => ({
      name: v.name.length > 12 ? v.name.substring(0, 12) + "…" : v.name,
      revenue: Number(v.totalRevenue || 0),
      regNo: v.registrationNumber
    }));

  const costData = [...analyticsReport]
    .sort((a, b) => Number(b.operationalCost || 0) - Number(a.operationalCost || 0))
    .slice(0, 8)
    .map(v => ({
      name: v.name.length > 12 ? v.name.substring(0, 12) + "…" : v.name,
      fuel: Number(v.fuelCost || 0),
      maintenance: Number(v.maintenanceCost || 0),
      other: Number(v.otherExpenses || 0),
      total: Number(v.operationalCost || 0)
    }));

  const efficiencyData = [...analyticsReport]
    .filter(v => Number(v.fuelEfficiencyKmPerL || 0) > 0)
    .sort((a, b) => Number(b.fuelEfficiencyKmPerL || 0) - Number(a.fuelEfficiencyKmPerL || 0))
    .slice(0, 8)
    .map(v => ({
      name: v.name.length > 12 ? v.name.substring(0, 12) + "…" : v.name,
      efficiency: Number(v.fuelEfficiencyKmPerL || 0)
    }));

  const COLORS = ["#60A5FA", "#34D399", "#FBBF24", "#F87171", "#A78BFA", "#FB923C", "#38BDF8", "#E879F9"];

  const handleExportCSV = () => {
    const token = localStorage.getItem("token");
    fetch("/api/reports/export.csv", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Export failed");
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "fleet_analytics_report.csv";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(err => alert(err.message));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 px-3 py-2 rounded shadow-2xl shadow-black/50 text-xs">
          <p className="text-slate-200 font-semibold mb-1">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} style={{ color: entry.color }} className="capitalize">
              {entry.name}: ₹{Number(entry.value).toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full text-slate-300">
      
      {/* Header with Export */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-200">Fleet Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-slate-200 text-xs font-semibold rounded transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a1a1a] border border-[#333] border-l-4 border-l-green-500 p-4 rounded-sm flex flex-col justify-center h-24 shadow-md">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Fuel Efficiency</p>
          <p className="text-3xl text-slate-200 tracking-wide">{avgFuelEfficiency} <span className="text-xl text-slate-400">km/l</span></p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#333] border-l-4 border-l-blue-500 p-4 rounded-sm flex flex-col justify-center h-24 shadow-md">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Fleet Utilization</p>
          <p className="text-3xl text-slate-200 tracking-wide">{kpis.fleetUtilizationPercent}<span className="text-xl text-slate-400">%</span></p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#333] border-l-4 border-l-orange-500 p-4 rounded-sm flex flex-col justify-center h-24 shadow-md">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Operational Cost</p>
          <p className="text-3xl text-slate-200 tracking-wide">₹{totalOperationalCost.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#333] border-l-4 border-l-emerald-500 p-4 rounded-sm flex flex-col justify-center h-24 shadow-md">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Avg Vehicle ROI</p>
          <p className="text-3xl text-slate-200 tracking-wide">{avgRoi}<span className="text-xl text-slate-400">%</span></p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue by Vehicle */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded p-5">
          <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-bold">Revenue by Vehicle</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={{ stroke: "#334155" }} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {revenueData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-600 text-xs text-center py-16">No revenue data available</p>
          )}
        </div>

        {/* Operational Cost Breakdown */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded p-5">
          <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-bold">Operational Cost by Vehicle</h3>
          {costData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={costData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={{ stroke: "#334155" }} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="fuel" stackId="cost" fill="#F97316" name="Fuel" radius={[0, 0, 0, 0]} />
                <Bar dataKey="maintenance" stackId="cost" fill="#EF4444" name="Maintenance" radius={[0, 0, 0, 0]} />
                <Bar dataKey="other" stackId="cost" fill="#8B5CF6" name="Other" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-600 text-xs text-center py-16">No cost data available</p>
          )}
        </div>

        {/* Fuel Efficiency */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded p-5">
          <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-bold">Fuel Efficiency (km/L)</h3>
          {efficiencyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={efficiencyData} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={{ stroke: "#334155" }} tickLine={false} width={80} />
                <Tooltip content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-800 border border-slate-600 px-3 py-2 rounded shadow-2xl shadow-black/50 text-xs">
                        <p className="text-slate-200 font-semibold">{label}: {payload[0].value} km/L</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar dataKey="efficiency" radius={[0, 4, 4, 0]}>
                  {efficiencyData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-600 text-xs text-center py-16">No efficiency data available</p>
          )}
        </div>

        {/* Vehicle Report Table */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded p-5">
          <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-bold">Vehicle ROI Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-700">
                  <th className="pb-2 font-medium">Vehicle</th>
                  <th className="pb-2 font-medium text-right">Revenue</th>
                  <th className="pb-2 font-medium text-right">Cost</th>
                  <th className="pb-2 font-medium text-right">ROI</th>
                </tr>
              </thead>
              <tbody>
                {[...analyticsReport]
                  .sort((a, b) => Number(b.roiPercent || 0) - Number(a.roiPercent || 0))
                  .slice(0, 6)
                  .map(v => (
                    <tr key={v.vehicleId} className="border-b border-slate-800/50 text-slate-300 hover:bg-slate-800/30">
                      <td className="py-2.5">
                        <div className="font-medium text-slate-200">{v.name}</div>
                        <div className="text-[10px] text-slate-500">{v.registrationNumber}</div>
                      </td>
                      <td className="py-2.5 text-right text-green-400">₹{Number(v.totalRevenue || 0).toLocaleString()}</td>
                      <td className="py-2.5 text-right text-orange-400">₹{Number(v.operationalCost || 0).toLocaleString()}</td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${Number(v.roiPercent || 0) >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {Number(v.roiPercent || 0).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                {analyticsReport.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-600">No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      
    </div>
  );
}
