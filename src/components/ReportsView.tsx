import React, { useState } from "react";
import { Download, FileText, BarChart3, HelpCircle, IndianRupee, Fuel, TrendingUp, Navigation, Scale } from "lucide-react";
import { Role, VehicleReport } from "../types";

interface ReportsViewProps {
  analyticsReport: VehicleReport[];
  activeRole: Role;
}

export default function ReportsView({
  analyticsReport,
  activeRole
}: ReportsViewProps) {
  const [reportType, setReportType] = useState<"EFFICIENCY" | "COST" | "ROI">("EFFICIENCY");

  // Export CSV functionality
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = "";

    if (reportType === "EFFICIENCY") {
      headers = ["Vehicle ID", "Registration Number", "Model Name", "Total Distance (km)", "Total Fuel Consumed (L)", "Fuel Efficiency (km/L)"];
      rows = analyticsReport.map(r => [
        r.vehicleId,
        r.registrationNumber,
        r.name,
        r.totalDistanceKm.toString(),
        r.totalFuelLiters.toString(),
        r.fuelEfficiencyKmPerL.toString()
      ]);
      filename = "transitops_fuel_efficiency.csv";
    } else if (reportType === "COST") {
      headers = ["Vehicle ID", "Registration Number", "Model Name", "Acquisition Cost (₹)", "Fuel Costs (₹)", "Maintenance Costs (₹)", "Other Expenses (₹)", "Total Operational Cost (₹)"];
      rows = analyticsReport.map(r => [
        r.vehicleId,
        r.registrationNumber,
        r.name,
        r.acquisitionCost.toString(),
        r.fuelCost.toString(),
        r.maintenanceCost.toString(),
        r.otherExpenses.toString(),
        r.operationalCost.toString()
      ]);
      filename = "transitops_operational_costs.csv";
    } else {
      headers = ["Vehicle ID", "Registration Number", "Model Name", "Acquisition Cost (₹)", "Total Trips Revenue (₹)", "Operational Expenses (₹)", "Capital ROI (%)"];
      rows = analyticsReport.map(r => [
        r.vehicleId,
        r.registrationNumber,
        r.name,
        r.acquisitionCost.toString(),
        r.totalRevenue.toString(),
        (r.fuelCost + r.maintenanceCost).toString(),
        r.roiPercent.toString()
      ]);
      filename = "transitops_capital_roi.csv";
    }

    // Combine headers and rows
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  const isFinancialOrManager = activeRole === Role.FLEET_MANAGER || activeRole === Role.FINANCIAL_ANALYST;

  return (
    <div className="space-y-6">
      {/* Header and Download Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Logistics Intelligence & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Audit fleet performance reports, operational cost journals, and ROI logs.</p>
        </div>
        <button
          id="export-csv-btn"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export to CSV
        </button>
      </div>

      {/* Report Select Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setReportType("EFFICIENCY")}
          className={`text-left p-5 rounded-2xl border transition-all hover:border-slate-300 flex items-start gap-4 ${
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
          className={`text-left p-5 rounded-2xl border transition-all hover:border-slate-300 flex items-start gap-4 ${
            reportType === "COST" 
              ? "bg-blue-50/20 border-blue-200 text-blue-900 custom-glow" 
              : "bg-white border-slate-100 text-slate-700"
          }`}
        >
          <div className={`p-2.5 rounded-xl border shrink-0 ${reportType === "COST" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Fleet Operational Costs</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">Combined aggregate of fuel refills, general maintenance, and expenses.</p>
          </div>
        </button>

        <button
          onClick={() => setReportType("ROI")}
          className={`text-left p-5 rounded-2xl border transition-all hover:border-slate-300 flex items-start gap-4 ${
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
      </div>

      {/* Highly creative visual analytics bar chart representation */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Visual Distribution Comparison
        </h2>

        <div className="space-y-4">
          {analyticsReport.map((r, i) => {
            // Find ratio for visual representation
            let ratio = 0;
            let displayVal = "";
            let color = "bg-blue-500";

            if (reportType === "EFFICIENCY") {
              // Efficiency: max of 15 km/l for standard scales
              ratio = Math.min((r.fuelEfficiencyKmPerL / 12) * 100, 100);
              displayVal = `${r.fuelEfficiencyKmPerL} km/L`;
              color = "bg-blue-500";
            } else if (reportType === "COST") {
              const maxCost = Math.max(...analyticsReport.map(x => x.operationalCost), 1);
              ratio = (r.operationalCost / maxCost) * 100;
              displayVal = `₹${r.operationalCost.toLocaleString()}`;
              color = "bg-amber-500";
            } else {
              // ROI: scale -50% to 100%
              ratio = Math.max(0, Math.min((r.roiPercent / 20) * 100, 100));
              displayVal = `${r.roiPercent}% ROI`;
              color = r.roiPercent >= 0 ? "bg-violet-500" : "bg-rose-500";
            }

            return (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-700">{r.name} <span className="text-[10px] text-slate-400 font-mono">({r.registrationNumber})</span></span>
                  <span className="font-mono text-slate-900">{displayVal}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${ratio}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Data Table Ledger */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {reportType === "EFFICIENCY" && (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Vehicle Specs</th>
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
                    <td className="px-6 py-4 font-mono text-blue-600 whitespace-nowrap">₹{r.fuelCost.toLocaleString()}</td>
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
                  <th className="px-6 py-4">Vehicle Specs</th>
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
                    <td className="px-6 py-4 font-mono whitespace-nowrap text-amber-600">₹{r.fuelCost.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono whitespace-nowrap text-amber-600">₹{r.maintenanceCost.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono whitespace-nowrap text-slate-600">₹{r.otherExpenses.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold font-mono rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                        ₹{r.operationalCost.toLocaleString()}
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
                  <th className="px-6 py-4">Vehicle Specs</th>
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
                    <td className="px-6 py-4 font-mono whitespace-nowrap">₹{r.acquisitionCost.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-emerald-600 whitespace-nowrap">₹{r.totalRevenue.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono whitespace-nowrap text-rose-500">₹{(r.fuelCost + r.maintenanceCost).toLocaleString()}</td>
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
        </div>
      </div>
    </div>
  );
}
