import React, { useState } from "react";
import { motion } from "motion/react";
import { Role, DashboardKPIs, Vehicle, Driver, Trip, TripStatus, VehicleStatus } from "../types";

interface DashboardViewProps {
  kpis: DashboardKPIs;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  activeRole: Role;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({
  kpis,
  vehicles,
  drivers,
  trips,
  activeRole,
  onNavigate
}: DashboardViewProps) {
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRegion, setFilterRegion] = useState("All");

  const cards = [
    { title: "ACTIVE VEHICLES", value: kpis.activeVehicles, color: "border-blue-500" },
    { title: "AVAILABLE VEHICLES", value: kpis.availableVehicles, color: "border-green-500" },
    { title: "VEHICLES IN MAINTENANCE", value: kpis.vehiclesInShop, color: "border-orange-500" },
    { title: "ACTIVE TRIPS", value: kpis.activeTrips, color: "border-blue-500" },
    { title: "PENDING TRIPS", value: kpis.pendingTrips, color: "border-slate-500" },
    { title: "DRIVERS ON DUTY", value: kpis.driversOnDuty, color: "border-slate-500" },
    { title: "FLEET UTILIZATION", value: `${kpis.fleetUtilizationPercent}%`, color: "border-green-500" },
  ];

  // Helper to format trip ID
  const formatTripId = (id: string) => {
    // Generate a short ID if it's a long UUID
    if (id.length > 8) return `TR-${id.substring(0, 4).toUpperCase()}`;
    return id.toUpperCase();
  };

  // Helper for Status Pill colors
  const getTripStatusPill = (status: TripStatus) => {
    switch (status) {
      case TripStatus.DISPATCHED:
        return <span className="inline-block px-4 py-1 rounded bg-[#60A5FA] text-black text-xs font-semibold w-24 text-center">On Trip</span>;
      case TripStatus.COMPLETED:
        return <span className="inline-block px-4 py-1 rounded bg-[#84CC16] text-black text-xs font-semibold w-24 text-center">Completed</span>;
      case TripStatus.DRAFT:
        return <span className="inline-block px-4 py-1 rounded bg-[#94A3B8] text-black text-xs font-semibold w-24 text-center">Draft</span>;
      case TripStatus.CANCELLED:
        return <span className="inline-block px-4 py-1 rounded bg-[#F87171] text-black text-xs font-semibold w-24 text-center">Cancelled</span>;
      default:
        return <span className="inline-block px-4 py-1 rounded bg-slate-500 text-black text-xs font-semibold w-24 text-center">{status}</span>;
    }
  };

  // Recent trips for table (take last 5)
  const recentTrips = [...trips].reverse().slice(0, 5);

  // Vehicle Status Percentages for Bars
  const totalVehicles = vehicles.length || 1; // prevent div by zero
  const getPercent = (count: number) => `${Math.round((count / totalVehicles) * 100)}%`;

  const availableCount = vehicles.filter(v => v.status === VehicleStatus.AVAILABLE).length;
  const onTripCount = vehicles.filter(v => v.status === VehicleStatus.ON_TRIP).length;
  const inShopCount = vehicles.filter(v => v.status === VehicleStatus.IN_SHOP).length;
  const retiredCount = vehicles.filter(v => v.status === VehicleStatus.RETIRED).length;

  return (
    <div className="space-y-8 bg-[#111111] min-h-[calc(100vh-100px)]">
      
      {/* Filters Row */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-widest">Filters</h3>
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-[#1A1A1A] text-slate-300 text-xs px-4 py-2 pr-8 rounded border border-slate-700 focus:outline-none w-48 cursor-pointer"
            >
              <option value="All">Vehicle Type: All</option>
              <option value="Van">Vehicle Type: Van</option>
              <option value="Truck">Vehicle Type: Truck</option>
            </select>
            <span className="absolute right-3 top-2.5 text-slate-500 text-[10px]">▼</span>
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-[#1A1A1A] text-slate-300 text-xs px-4 py-2 pr-8 rounded border border-slate-700 focus:outline-none w-48 cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="Available">Status: Available</option>
              <option value="On Trip">Status: On Trip</option>
            </select>
            <span className="absolute right-3 top-2.5 text-slate-500 text-[10px]">▼</span>
          </div>
          <div className="relative">
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="appearance-none bg-[#1A1A1A] text-slate-300 text-xs px-4 py-2 pr-8 rounded border border-slate-700 focus:outline-none w-48 cursor-pointer"
            >
              <option value="All">Region: All</option>
              <option value="North">Region: North</option>
              <option value="South">Region: South</option>
            </select>
            <span className="absolute right-3 top-2.5 text-slate-500 text-[10px]">▼</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="flex flex-wrap gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`bg-[#1A1A1A] border border-slate-800 border-l-4 rounded-sm p-4 w-40 h-28 flex flex-col justify-between cursor-default shadow-lg hover:shadow-xl hover:shadow-black/50 ${card.color}`}
          >
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase leading-tight">{card.title}</span>
            <span className="text-3xl font-light text-white">{card.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Lower Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
        
        {/* Left Col: Recent Trips Table */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Recent Trips</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800">
                  <th className="pb-3 font-medium">Trip</th>
                  <th className="pb-3 font-medium">Vehicle</th>
                  <th className="pb-3 font-medium">Driver</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">ETA</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip, idx) => {
                  const v = vehicles.find(v => v.id === trip.vehicleId);
                  const d = drivers.find(d => d.id === trip.driverId);
                  let eta = "—";
                  if (trip.status === TripStatus.DISPATCHED) eta = "45 min";
                  else if (trip.status === TripStatus.DRAFT) eta = "Awaiting vehicle";

                  return (
                    <motion.tr
                      key={trip.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ backgroundColor: "rgba(30, 41, 59, 0.5)" }}
                      className="border-b border-slate-800/50 text-slate-300"
                    >
                      <td className="py-3 pr-4">{formatTripId(trip.id)}</td>
                      <td className="py-3 pr-4">{v ? v.name : "—"}</td>
                      <td className="py-3 pr-4">{d ? d.name : "—"}</td>
                      <td className="py-3 pr-4">{getTripStatusPill(trip.status)}</td>
                      <td className="py-3 font-medium text-slate-400">{eta}</td>
                    </motion.tr>
                  );
                })}
                {recentTrips.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-600 text-xs">No recent trips available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Vehicle Status */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Vehicle Status</h3>
          <div className="space-y-6 pt-2">
            
            {/* Available */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300 w-20 shrink-0">Available</span>
              <div className="flex-1 bg-[#222] h-3">
                <div className="bg-[#22C55E] h-full" style={{ width: getPercent(availableCount) }}></div>
              </div>
            </div>
            
            {/* On Trip */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300 w-20 shrink-0">On Trip</span>
              <div className="flex-1 bg-[#222] h-3">
                <div className="bg-[#60A5FA] h-full" style={{ width: getPercent(onTripCount) }}></div>
              </div>
            </div>
            
            {/* In Shop */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300 w-20 shrink-0">In Shop</span>
              <div className="flex-1 bg-[#222] h-3">
                <div className="bg-[#F97316] h-full" style={{ width: getPercent(inShopCount) }}></div>
              </div>
            </div>
            
            {/* Retired */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300 w-20 shrink-0">Retired</span>
              <div className="flex-1 bg-[#222] h-3">
                <div className="bg-[#F472B6] h-full" style={{ width: getPercent(retiredCount) }}></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
