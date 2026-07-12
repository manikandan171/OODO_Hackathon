import React, { useState } from "react";
import { Download, FileText, BarChart3, HelpCircle, DollarSign, Fuel, TrendingUp, Navigation, Scale, Leaf } from "lucide-react";
import { Role, VehicleReport } from "../types";
import { useLanguage } from "../LanguageContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ReportsViewProps {
  analyticsReport: VehicleReport[];
  activeRole: Role;
}

export default function ReportsView({
  analyticsReport,
  activeRole
}: ReportsViewProps) {
  const { t } = useLanguage();
  const [reportType, setReportType] = useState<"EFFICIENCY" | "COST" | "ROI" | "SUSTAINABILITY">("EFFICIENCY");

  // Export CSV functionality
  const handleExportCSV = () => {
    // Direct backend CSV download to satisfy /api/reports/export.csv
    const link = document.createElement("a");
    link.setAttribute("href", "/api/reports/export.csv");
    link.setAttribute("download", "fleet_analytics_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Download Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("rep_title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("rep_subtitle")}</p>
        </div>
        <button
          id="export-csv-btn"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-xs smooth-hover cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export to CSV
        </button>
      </div>

      {/* Report Select Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setReportType("EFFICIENCY")}
          className={`text-left p-5 rounded-2xl border transition-all smooth-hover cursor-pointer flex items-start gap-4 ${
            reportType === "EFFICIENCY" 
              ? "bg-blue-50/20 border-blue-200 text-blue-900 custom-glow" 
              : "bg-white border-slate-100 text-slate-700"
          }`}
        >
          <div className={`p-2.5 rounded-xl border shrink-0 ${reportType === "EFFICIENCY" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Fuel Efficiency Index</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">Distance traveled compared to fuel gallons consumed per vehicle.</p>
          </div>
        </button>

        <button
          onClick={() => setReportType("COST")}
          className={`text-left p-5 rounded-2xl border transition-all smooth-hover cursor-pointer flex items-start gap-4 ${
            reportType === "COST" 
              ? "bg-blue-50/20 border-blue-200 text-blue-900 custom-glow" 
              : "bg-white border-slate-100 text-slate-700"
          }`}
        >
          <div className={`p-2.5 rounded-xl border shrink-0 ${reportType === "COST" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Fleet Operational Costs</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">Combined aggregate of fuel refills, general maintenance, and expenses.</p>
          </div>
        </button>

        <button
          onClick={() => setReportType("ROI")}
          className={`text-left p-5 rounded-2xl border transition-all smooth-hover cursor-pointer flex items-start gap-4 ${
            reportType === "ROI" 
              ? "bg-blue-50/20 border-blue-200 text-blue-900 custom-glow" 
              : "bg-white border-slate-100 text-slate-700"
          }`}
        >
          <div className={`p-2.5 rounded-xl border shrink-0 ${reportType === "ROI" ? "bg-violet-50 text-violet-600 border-violet-100" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Capital Asset ROI %</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">Asset valuation payback score based on routes completed vs expenses.</p>
          </div>
        </button>

        <button
          onClick={() => setReportType("SUSTAINABILITY")}
          className={`text-left p-5 rounded-2xl border transition-all smooth-hover cursor-pointer flex items-start gap-4 ${
            reportType === "SUSTAINABILITY" 
              ? "bg-blue-50/20 border-blue-200 text-blue-900 custom-glow" 
              : "bg-white border-slate-100 text-slate-700"
          }`}
        >
          <div className={`p-2.5 rounded-xl border shrink-0 ${reportType === "SUSTAINABILITY" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Sustainability Index</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">Carbon footprint emissions tracking computed from diesel logs.</p>
          </div>
        </button>
      </div>

      {/* Highly creative visual analytics bar chart representation using Recharts */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs animate-fade-in-up">
        <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          {reportType === "EFFICIENCY" 
            ? "Fuel Efficiency Index (km/L)" 
            : reportType === "COST" 
              ? "Total Operational Cost ($)" 
              : reportType === "ROI"
                ? "Capital Payback ROI (%)"
                : "Carbon Footprint (kg CO2)"}
        </h2>

        <div className="h-80 w-full font-mono text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analyticsReport.map(r => ({
                name: r.registrationNumber,
                value: reportType === "EFFICIENCY" 
                  ? r.fuelEfficiencyKmPerL 
                  : reportType === "COST" 
                    ? r.operationalCost 
                    : reportType === "ROI" 
                      ? r.roiPercent 
                      : Number((r.totalFuelLiters * 2.68).toFixed(1)),
                model: r.name
              }))}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.95)", 
                  border: "1px solid #e2e8f0", 
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
                }}
                formatter={(value: any) => [
                  reportType === "EFFICIENCY" 
                    ? `${value} km/L` 
                    : reportType === "COST" 
                      ? `$${value}` 
                      : reportType === "ROI" 
                        ? `${value}%` 
                        : `${value} kg CO2`,
                  reportType === "EFFICIENCY" 
                    ? "Efficiency" 
                    : reportType === "COST" 
                      ? "Cost" 
                      : reportType === "ROI" 
                        ? "ROI" 
                        : "CO2 Footprint"
                ]}
              />
              <Bar 
                dataKey="value" 
                fill={
                  reportType === "EFFICIENCY" 
                    ? "#3b82f6" 
                    : reportType === "COST" 
                      ? "#f59e0b" 
                      : reportType === "ROI" 
                        ? "#8b5cf6" 
                        : "#10b981"
                } 
                radius={[8, 8, 0, 0]} 
                barSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics Data Table Ledger */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {reportType === "EFFICIENCY" && (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">{t("veh_details")}</th>
                  <th className="px-6 py-4">Total Distance Tripped</th>
                  <th className="px-6 py-4">Total Fuel Consumption</th>
                  <th className="px-6 py-4">Refill Invoices</th>
                  <th className="px-6 py-4">Fuel Efficiency Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {analyticsReport.map((r) => (
                  <tr key={r.vehicleId} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{r.name}</span>
                      <span className="text-xs font-mono font-medium text-slate-400 block mt-0.5">{r.registrationNumber} • {r.type}</span>
                    </td>
                    <td className="px-6 py-4 font-mono whitespace-nowrap">{r.totalDistanceKm.toLocaleString()} km</td>
                    <td className="px-6 py-4 font-mono whitespace-nowrap">{r.totalFuelLiters.toLocaleString()} L</td>
                    <td className="px-6 py-4 font-mono text-blue-600 whitespace-nowrap">${r.fuelCost.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold font-mono rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                        {r.fuelEfficiencyKmPerL} km/L
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "COST" && (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">{t("veh_details")}</th>
                  <th className="px-6 py-4">Fuel Refills</th>
                  <th className="px-6 py-4">Service maintenance</th>
                  <th className="px-6 py-4">General Expenses</th>
                  <th className="px-6 py-4">Total Operational Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {analyticsReport.map((r) => (
                  <tr key={r.vehicleId} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{r.name}</span>
                      <span className="text-xs font-mono font-medium text-slate-400 block mt-0.5">{r.registrationNumber} • {r.type}</span>
                    </td>
                    <td className="px-6 py-4 font-mono whitespace-nowrap text-amber-600">${r.fuelCost.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono whitespace-nowrap text-amber-600">${r.maintenanceCost.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono whitespace-nowrap text-slate-600">${r.otherExpenses.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold font-mono rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                        ${r.operationalCost.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "ROI" && (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">{t("veh_details")}</th>
                  <th className="px-6 py-4">Asset Capital Value</th>
                  <th className="px-6 py-4">Trips Completed Revenue</th>
                  <th className="px-6 py-4">Direct Repair & Fuel Cost</th>
                  <th className="px-6 py-4">Valuation Payback ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {analyticsReport.map((r) => (
                  <tr key={r.vehicleId} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{r.name}</span>
                      <span className="text-xs font-mono font-medium text-slate-400 block mt-0.5">{r.registrationNumber} • {r.type}</span>
                    </td>
                    <td className="px-6 py-4 font-mono whitespace-nowrap">${r.acquisitionCost.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-emerald-600 whitespace-nowrap">${r.totalRevenue.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono whitespace-nowrap text-rose-500">${(r.fuelCost + r.maintenanceCost).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold font-mono rounded-lg border ${
                        r.roiPercent >= 0 
                          ? "bg-violet-50 text-violet-700 border-violet-100" 
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}>
                        {r.roiPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "SUSTAINABILITY" && (
            <table className="w-full border-collapse text-left animate-fade-in-up">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">{t("veh_details")}</th>
                  <th className="px-6 py-4">Fuel Refills (L)</th>
                  <th className="px-6 py-4">Carbon Footprint (kg CO2)</th>
                  <th className="px-6 py-4">Efficiency Indicator</th>
                  <th className="px-6 py-4">Sustainability Badging</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {analyticsReport.map((r) => {
                  const co2Kg = Number((r.totalFuelLiters * 2.68).toFixed(1));
                  const isEcoFriendly = r.fuelEfficiencyKmPerL > 8.0 || r.totalFuelLiters === 0;
                  return (
                    <tr key={r.vehicleId} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{r.name}</span>
                        <span className="text-xs font-mono font-medium text-slate-400 block mt-0.5">{r.registrationNumber} • {r.type}</span>
                      </td>
                      <td className="px-6 py-4 font-mono whitespace-nowrap">{r.totalFuelLiters.toLocaleString()} L</td>
                      <td className="px-6 py-4 font-mono text-emerald-600 whitespace-nowrap">{co2Kg.toLocaleString()} kg</td>
                      <td className="px-6 py-4 font-mono whitespace-nowrap">{r.fuelEfficiencyKmPerL} km/L</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEcoFriendly ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                            🍃 Green Certified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
                            🌿 Eco-Efficient
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
