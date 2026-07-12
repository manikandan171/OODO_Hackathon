import React, { useState, useEffect } from "react";
import { Plus, Search, Truck, Filter, MapPin, Scale, Gauge, DollarSign, Eye, ShieldAlert, Trash2, Edit } from "lucide-react";
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

    const trimmedRegNo = regNo.trim();
    if (!trimmedRegNo || !name || !type || !capacity || !odometer || !cost || !region) {
      setError("Please fill out all fields before enrolling.");
      return;
    }

    // Frontend uniqueness check to give fast feedback
    if (modalMode === "ADD") {
      const isDuplicate = vehicles.some(
        (v) => v.registrationNumber.toLowerCase() === trimmedRegNo.toLowerCase()
      );
      if (isDuplicate) {
        setError(`A vehicle with registration number '${trimmedRegNo}' already exists.`);
        return;
      }
    }

    const payload = {
      registrationNumber: trimmedRegNo,
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
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Available
          </span>
        );
      case VehicleStatus.ON_TRIP:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> On Trip
          </span>
        );
      case VehicleStatus.IN_SHOP:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> In Shop
          </span>
        );
      case VehicleStatus.RETIRED:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Retired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fleet Asset Registry</h1>
          <p className="text-sm text-slate-500 mt-1">Enroll, audit, and transition status of vehicles across regions.</p>
        </div>
        {activeRole === Role.FLEET_MANAGER && (
          <button
            id="enroll-vehicle-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Enroll New Vehicle
          </button>
        )}
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            id="vehicle-search"
            type="text"
            placeholder="Search name or plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="vehicle-filter-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full text-sm py-2 px-3 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
          >
            <option value="ALL">All Asset Types</option>
            <option value="Van">Vans</option>
            <option value="Truck">Trucks</option>
            <option value="Bus">Buses</option>
            <option value="Car">Cars</option>
            <option value="Bike">Bikes</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="vehicle-filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-sm py-2 px-3 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available Only</option>
            <option value="ON_TRIP">Out on Trip</option>
            <option value="IN_SHOP">Under Maintenance</option>
            <option value="RETIRED">Retired Asset</option>
          </select>
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="vehicle-filter-region"
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="w-full text-sm py-2 px-3 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
          >
            <option value="ALL">All Regions</option>
            <option value="North">North Hub</option>
            <option value="South">South Hub</option>
            <option value="East">East Hub</option>
            <option value="West">West Hub</option>
          </select>
        </div>
      </div>

      {/* Asset Table / Grid View */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Asset Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Odometer</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Valuation</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/50 shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{v.name}</span>
                        <span className="text-xs font-mono font-medium text-slate-400 block mt-0.5">{v.registrationNumber} • {v.type}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(v.status)}</td>
                  <td className="px-6 py-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                    {v.odometerKm.toLocaleString()} <span className="text-xs font-sans text-slate-400">km</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Scale className="w-4 h-4 text-slate-400" />
                      <span>{v.maxLoadCapacityKg.toLocaleString()} kg</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-slate-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{v.region}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                    <div className="flex items-center text-slate-600 font-medium">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 -mr-0.5" />
                      <span>{v.acquisitionCost.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1.5">
                      {activeRole === Role.FLEET_MANAGER && v.status !== VehicleStatus.RETIRED && (
                        <>
                          <button
                            id={`edit-vehicle-${v.id}`}
                            onClick={() => handleOpenEdit(v)}
                            title="Edit vehicle details"
                            className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg border border-transparent hover:border-blue-100 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            id={`retire-vehicle-${v.id}`}
                            onClick={() => handleRetire(v)}
                            title="Permanently retire vehicle"
                            disabled={v.status === VehicleStatus.ON_TRIP}
                            className={`p-1.5 rounded-lg border border-transparent transition ${
                              v.status === VehicleStatus.ON_TRIP 
                                ? "text-slate-200 cursor-not-allowed" 
                                : "hover:bg-rose-50 text-slate-500 hover:text-rose-600 hover:border-rose-100"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {activeRole !== Role.FLEET_MANAGER && (
                        <span className="text-xs text-slate-400 font-medium font-mono px-2 py-1">READ ONLY</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Truck className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm font-semibold">No assets found matching filters.</p>
                    <p className="text-xs text-slate-400 mt-1">Check search string or ease filter requirements.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">
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
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Vehicle Classification</label>
                  <select
                    id="modal-vehicle-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
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
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
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
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
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
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Acquisition Cost ($)</label>
                  <input
                    id="modal-vehicle-cost"
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 25000"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Assigned Region</label>
                  <select
                    id="modal-vehicle-region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  >
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="modal-vehicle-submit"
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
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
