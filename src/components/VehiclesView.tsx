import React, { useState, useEffect } from "react";
import { Plus, Search, Truck, Filter, MapPin, Scale, Gauge, IndianRupee, Eye, ShieldAlert, Trash2, Edit } from "lucide-react";
import { Role, Vehicle, VehicleStatus } from "../types";

interface VehiclesViewProps {
  vehicles: Vehicle[];
  activeRole: Role;
  onAddVehicle: (vehicle: any) => Promise<void>;
  onUpdateVehicle: (id: string, updates: any) => Promise<void>;
  onRetireVehicle: (id: string) => Promise<void>;
  globalSearchQuery?: string;
}

export default function VehiclesView({
  vehicles,
  activeRole,
  onAddVehicle,
  onUpdateVehicle,
  onRetireVehicle,
  globalSearchQuery
}: VehiclesViewProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterRegion, setFilterRegion] = useState("ALL");

  useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setSearch(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [regNo, setRegNo] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("Van");
  const [capacity, setCapacity] = useState("");
  const [odometer, setOdometer] = useState("");
  const [cost, setCost] = useState("");
  const [region, setRegion] = useState("North");

  // Filtering vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "ALL" || v.type === filterType;
    const matchesStatus = filterStatus === "ALL" || v.status === filterStatus;
    const matchesRegion = filterRegion === "ALL" || v.region === filterRegion;

    return matchesSearch && matchesType && matchesStatus && matchesRegion;
  });

  const handleOpenAdd = () => {
    setModalMode("ADD");
    setError(null);
    setRegNo("");
    setName("");
    setType("Van");
    setCapacity("1000");
    setOdometer("15000");
    setCost("32000");
    setRegion("North");
    setShowModal(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setModalMode("EDIT");
    setSelectedVehicleId(v.id);
    setError(null);
    setRegNo(v.registrationNumber);
    setName(v.name);
    setType(v.type);
    setCapacity(v.maxLoadCapacityKg.toString());
    setOdometer(v.odometerKm.toString());
    setCost(v.acquisitionCost.toString());
    setRegion(v.region);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regNo || !name || !type || !capacity || !odometer || !cost || !region) {
      setError("Please fill out all fields before enrolling.");
      return;
    }

    const payload = {
      registrationNumber: regNo,
      name,
      type,
      maxLoadCapacityKg: Number(capacity),
      odometerKm: Number(odometer),
      acquisitionCost: Number(cost),
      region
    };

    try {
      if (modalMode === "ADD") {
        await onAddVehicle(payload);
      } else if (modalMode === "EDIT" && selectedVehicleId) {
        await onUpdateVehicle(selectedVehicleId, payload);
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || "An unexpected validation error occurred.");
    }
  };

  const handleRetire = async (v: Vehicle) => {
    if (window.confirm(`Are you absolutely sure you want to permanently RETIRE vehicle ${v.registrationNumber}? This is a terminal state transition.`)) {
      try {
        await onRetireVehicle(v.id);
      } catch (err: any) {
        alert(err.message || "Failed to retire vehicle.");
      }
    }
  };

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.AVAILABLE:
        return (
          <span className="inline-flex justify-center w-24 text-xs font-semibold px-2 py-1.5 rounded-md bg-[#22c55e] text-black">
            Available
          </span>
        );
      case VehicleStatus.ON_TRIP:
        return (
          <span className="inline-flex justify-center w-24 text-xs font-semibold px-2 py-1.5 rounded-md bg-[#3b82f6] text-black">
            On Trip
          </span>
        );
      case VehicleStatus.IN_SHOP:
        return (
          <span className="inline-flex justify-center w-24 text-xs font-semibold px-2 py-1.5 rounded-md bg-[#f59e0b] text-black">
            In Shop
          </span>
        );
      case VehicleStatus.RETIRED:
        return (
          <span className="inline-flex justify-center w-24 text-xs font-semibold px-2 py-1.5 rounded-md bg-[#fb7185] text-black">
            Retired
          </span>
        );
      default:
        return null;
    }
  };


  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Type Filter */}
          <div className="flex items-center">
            <select
              id="vehicle-filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm py-1.5 px-3 rounded-lg bg-transparent border border-slate-800 text-slate-300 focus:outline-hidden focus:border-slate-500 transition"
            >
              <option value="ALL">Type: All</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Bus">Bus</option>
              <option value="Car">Car</option>
              <option value="Bike">Bike</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center">
            <select
              id="vehicle-filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm py-1.5 px-3 rounded-lg bg-transparent border border-slate-800 text-slate-300 focus:outline-hidden focus:border-slate-500 transition"
            >
              <option value="ALL">Status: All</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="IN_SHOP">In Shop</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              id="vehicle-search"
              type="text"
              placeholder="Search reg. no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 text-sm px-3 py-1.5 rounded-lg bg-transparent border border-slate-800 text-slate-300 placeholder-slate-600 focus:outline-hidden focus:border-slate-500 transition"
            />
          </div>
        </div>

        {activeRole === Role.FLEET_MANAGER && (
          <button
            id="enroll-vehicle-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-[#d97706] hover:bg-[#b45309] text-slate-200 text-sm font-semibold px-5 py-2 rounded-lg transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        )}
      </div>

      {/* Asset Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800/50">
              <th className="px-4 py-3 font-medium">Reg. No. (Unique)</th>
              <th className="px-4 py-3 font-medium">Name/Model</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Capacity</th>
              <th className="px-4 py-3 font-medium">Odometer</th>
              <th className="px-4 py-3 font-medium">Acq. Cost</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-300">
            {filteredVehicles.map((v) => (
              <tr key={v.id} className="border-b border-slate-800/30 hover:bg-[#1a1a1a]/5 transition">
                <td className="px-4 py-4 whitespace-nowrap">{v.registrationNumber}</td>
                <td className="px-4 py-4 whitespace-nowrap uppercase text-slate-400 font-medium">{v.name}</td>
                <td className="px-4 py-4 whitespace-nowrap">{v.type}</td>
                <td className="px-4 py-4 whitespace-nowrap">{v.maxLoadCapacityKg.toLocaleString()} kg</td>
                <td className="px-4 py-4 whitespace-nowrap">{v.odometerKm.toLocaleString()}</td>
                <td className="px-4 py-4 whitespace-nowrap">{v.acquisitionCost.toLocaleString()}</td>
                <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(v.status)}</td>
                <td className="px-4 py-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2 opacity-0 hover:opacity-100 focus-within:opacity-100">
                    {activeRole === Role.FLEET_MANAGER && v.status !== VehicleStatus.RETIRED && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(v)}
                          title="Edit vehicle"
                          className="p-1 text-slate-500 hover:text-blue-400 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRetire(v)}
                          title="Retire vehicle"
                          disabled={v.status === VehicleStatus.ON_TRIP}
                          className={`p-1 transition ${v.status === VehicleStatus.ON_TRIP
                              ? "text-slate-400 cursor-not-allowed"
                              : "text-slate-500 hover:text-rose-400"
                            }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredVehicles.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  <p className="text-sm">No vehicles found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[#d97706] text-xs font-mono">
        Rule: Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher
      </p>

      {/* Enroll/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] rounded-2xl max-w-lg w-full border border-slate-800 shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-[#111]">
              <h2 className="text-lg font-bold text-slate-200">
                {modalMode === "ADD" ? "Enroll Fleet Asset" : "Update Fleet Asset Specs"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex gap-2 text-rose-600 text-xs font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Plate / Registration #</label>
                  <input
                    id="modal-vehicle-reg"
                    type="text"
                    required
                    placeholder="e.g. Van-05"
                    disabled={modalMode === "EDIT"}
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-slate-200 border-slate-700 focus:border-blue-500 text-sm px-3 py-2 rounded-lg border border-slate-700 focus:outline-hidden focus:border-blue-500 disabled:bg-[#1a1a1a] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Vehicle Classification</label>
                  <select
                    id="modal-vehicle-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-slate-200 border-slate-700 focus:border-blue-500 text-sm px-3 py-2 rounded-lg border border-slate-700 focus:outline-hidden focus:border-blue-500 transition"
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Bus">Bus</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Make / Model Name</label>
                <input
                  id="modal-vehicle-name"
                  type="text"
                  required
                  placeholder="e.g. Ford Transit Custom (Van-05)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1a1a1a] text-slate-200 border-slate-700 focus:border-blue-500 text-sm px-3 py-2 rounded-lg border border-slate-700 focus:outline-hidden focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Max Load Capacity (kg)</label>
                  <input
                    id="modal-vehicle-capacity"
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 500"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-slate-200 border-slate-700 focus:border-blue-500 text-sm px-3 py-2 rounded-lg border border-slate-700 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Current Odometer (km)</label>
                  <input
                    id="modal-vehicle-odo"
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 12000"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-slate-200 border-slate-700 focus:border-blue-500 text-sm px-3 py-2 rounded-lg border border-slate-700 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Acquisition Cost (₹)</label>
                  <input
                    id="modal-vehicle-cost"
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 25000"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-slate-200 border-slate-700 focus:border-blue-500 text-sm px-3 py-2 rounded-lg border border-slate-700 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Assigned Region</label>
                  <select
                    id="modal-vehicle-region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-slate-200 border-slate-700 focus:border-blue-500 text-sm px-3 py-2 rounded-lg border border-slate-700 focus:outline-hidden focus:border-blue-500 transition"
                  >
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-600 text-sm font-semibold rounded-xl hover:bg-[#111] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="modal-vehicle-submit"
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-slate-200 text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
                >
                  {modalMode === "ADD" ? "Enroll Asset" : "Apply Specs"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
