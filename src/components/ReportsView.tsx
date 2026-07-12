import React from "react";
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

  // Top Costliest Vehicles
  const costliestVehicles = [...analyticsReport]
    .sort((a, b) => Number(b.operationalCost || 0) - Number(a.operationalCost || 0))
    .slice(0, 3);
    
  const maxCost = Math.max(...costliestVehicles.map(v => Number(v.operationalCost || 0)), 1);

  // Revenue by Vehicle (Mocking Monthly Revenue per mockup)
  const topRevenueVehicles = [...analyticsReport]
    .sort((a, b) => Number(b.totalRevenue || 0) - Number(a.totalRevenue || 0))
    .slice(0, 6);
    
  const maxRev = Math.max(...topRevenueVehicles.map(v => Number(v.totalRevenue || 0)), 1);

  // Helper colors for top costliest
  const getCostBarColor = (index: number) => {
    if (index === 0) return "bg-red-400";
    if (index === 1) return "bg-orange-500";
    return "bg-blue-500";
  };

  return (
    <div className="w-full h-full text-slate-300 font-sans" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', cursive, sans-serif" }}>
      
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-2">
        {/* Fuel Efficiency */}
        <div className="bg-[#1a1a1a] border border-[#333] border-l-4 border-l-green-500 p-4 rounded-sm flex flex-col justify-center h-24 shadow-md">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-sans font-bold">Fuel Efficiency</p>
          <p className="text-3xl text-white tracking-wide">{avgFuelEfficiency} <span className="text-xl">km/l</span></p>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-[#1a1a1a] border border-[#333] border-l-4 border-l-green-500 p-4 rounded-sm flex flex-col justify-center h-24 shadow-md">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-sans font-bold">Fleet Utilization</p>
          <p className="text-3xl text-white tracking-wide">{kpis.fleetUtilizationPercent}%</p>
        </div>

        {/* Operational Cost */}
        <div className="bg-[#1a1a1a] border border-[#333] border-l-4 border-l-orange-500 p-4 rounded-sm flex flex-col justify-center h-24 shadow-md">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-sans font-bold">Operational Cost</p>
          <p className="text-3xl text-white tracking-wide">{totalOperationalCost.toLocaleString()}</p>
        </div>

        {/* Vehicle ROI */}
        <div className="bg-[#1a1a1a] border border-[#333] border-l-4 border-l-green-500 p-4 rounded-sm flex flex-col justify-center h-24 shadow-md">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-sans font-bold">Vehicle ROI</p>
          <p className="text-3xl text-white tracking-wide">{avgRoi}%</p>
        </div>
      </div>

      {/* Formula Text */}
      <div className="mb-12">
        <p className="text-xs text-gray-500 tracking-wider">ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost</p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* Left: Monthly Revenue (Bar Chart) */}
        <div>
          <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-6 font-sans font-bold">Monthly Revenue</h3>
          
          <div className="flex items-end h-40 gap-2 border-b border-gray-600 pb-1">
            {topRevenueVehicles.map((vehicle, idx) => {
              const rev = Number(vehicle.totalRevenue || 0);
              const heightPercent = maxRev > 0 ? (rev / maxRev) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                  <div 
                    className="w-full bg-[#5d8fc2] border border-[#48719c] rounded-t-sm transition-all duration-500 hover:bg-[#6fa0d1]"
                    style={{ height: `${Math.max(heightPercent, 5)}%` }}
                  ></div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition bg-black px-2 py-1 rounded text-xs text-white pointer-events-none whitespace-nowrap z-10 border border-gray-700">
                    {vehicle.name}: ₹{rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
              );
            })}
            
            {/* Fill empty slots if less than 6 vehicles */}
            {Array.from({ length: Math.max(0, 6 - topRevenueVehicles.length) }).map((_, idx) => (
              <div key={`empty-${idx}`} className="flex-1 h-full"></div>
            ))}
          </div>
        </div>

        {/* Right: Top Costliest Vehicles (Horizontal Bars) */}
        <div>
          <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-6 font-sans font-bold">Top Costliest Vehicles</h3>
          
          <div className="flex flex-col gap-6 mt-4">
            {costliestVehicles.map((vehicle, idx) => {
              const cost = Number(vehicle.operationalCost || 0);
              const widthPercent = maxCost > 0 ? (cost / maxCost) * 100 : 0;
              
              return (
                <div key={vehicle.vehicleId} className="flex items-center gap-4 group relative">
                  <div className="w-24 shrink-0 text-xs text-gray-400 tracking-wider uppercase truncate">
                    {vehicle.name}
                  </div>
                  
                  <div className="flex-1 h-4 bg-[#2a2a2a] rounded-sm overflow-hidden border border-[#333]">
                    <div 
                      className={`h-full ${getCostBarColor(idx)} transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.max(widthPercent, 5)}%` }}
                    ></div>
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute right-0 -top-8 opacity-0 group-hover:opacity-100 transition bg-black px-2 py-1 rounded text-xs text-white pointer-events-none z-10 border border-gray-700">
                    ₹{cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      
    </div>
  );
}
