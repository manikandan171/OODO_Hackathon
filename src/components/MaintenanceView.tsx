import React, { useState } from "react";
import { Plus, Search, Wrench, AlertTriangle, ShieldCheck, IndianRupee, Calendar, Clock, Gauge, Filter, Eye } from "lucide-react";
import { Role, MaintenanceLog, MaintenanceStatus, Vehicle } from "../types";

interface MaintenanceViewProps {
  maintenanceLogs: MaintenanceLog[];
  vehicles: Vehicle[];
  activeRole: Role;
  onOpenMaintenance: (maintenance: any) => Promise<void>;
  onCloseMaintenance: (id: string, cost: number) => Promise<void>;
}

export default function MaintenanceView({
  maintenanceLogs,
  vehicles,
  activeRole,
  onOpenMaintenance,
  onCloseMaintenance
}: MaintenanceViewProps) {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterVehicle, setFilterVehicle] = useState("ALL");

  // Open Maintenance modal state
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [description, setDescription] = useState("");
  const [estCost, setEstCost] = useState("250");

  // Close Maintenance modal state
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingLog, setClosingLog] = useState<MaintenanceLog | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [actualCost, setActualCost] = useState("");

  const handleOpenOpenModal = () => {
    setOpenError(null);
    setDescription("");
    setEstCost("250");
    const avVehicles = vehicles.filter(v => v.status === "AVAILABLE");
    if (avVehicles.length > 0) {
      setSelectedVehicleId(avVehicles[0].id);
    } else {
      setSelectedVehicleId("");
    }
    setShowOpenModal(true);
  };

  const handleOpenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpenError(null);

    if (!selectedVehicleId || !description || !estCost) {
      setOpenError("Please fill out all work order fields.");
      return;
    }

    try {
      await onOpenMaintenance({
        vehicleId: selectedVehicleId,
        description,
        cost: Number(estCost)
      });
      setShowOpenModal(false);
    } catch (err: any) {
      setOpenError(err.message || "Failed to initiate work order.");
    }
  };

  const handleOpenCloseModal = (log: MaintenanceLog) => {
    setClosingLog(log);
    setCloseError(null);
    setActualCost(log.cost.toString());
    setShowCloseModal(true);
  };

  const handleCloseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloseError(null);

    if (!closingLog || !actualCost) {
      setCloseError("Actual cost is required.");
      return;
    }

    try {
      await onCloseMaintenance(closingLog.id, Number(actualCost));
      setShowCloseModal(false);
      setClosingLog(null);
    } catch (err: any) {
      setCloseError(err.message || "Failed to resolve work order.");
    }
  };

  // Filter maintenance records
  const filteredLogs = maintenanceLogs.filter(log => {
    const matchesStatus = filterStatus === "ALL" || log.status === filterStatus;
    const matchesVehicle = filterVehicle === "ALL" || log.vehicleId === filterVehicle;
    return matchesStatus && matchesVehicle;
  });

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.OPEN:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-200 uppercase font-mono">
            Active / Open
          </span>
        );
      case MaintenanceStatus.CLOSED:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-mono">
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  const isFleetManager = activeRole === Role.FLEET_MANAGER;
  const availableVehiclesForMaintenance = vehicles.filter(v => v.status === "AVAILABLE");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Maintenance & Work Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Initiate and resolve repair orders, logging parts and operational downtime costs.</p>
        </div>
        {isFleetManager && (
          <button
            id="open-maint-btn"
            onClick={handleOpenOpenModal}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Open Maintenance Order
          </button>
        )}
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="maint-filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-sm py-2 px-3 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
          >
            <option value="ALL">All Order States</option>
            <option value="OPEN">Open Work Orders</option>
            <option value="CLOSED">Completed & Resolved</option>
          </select>
        </div>

        {/* Vehicle Filter */}
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="maint-filter-vehicle"
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="w-full text-sm py-2 px-3 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
          >
            <option value="ALL">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.registrationNumber} - {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Maintenance Logs List */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Asset Under Repair</th>
                <th className="px-6 py-4">Service Description</th>
                <th className="px-6 py-4">Order Status</th>
                <th className="px-6 py-4">Opened At</th>
                <th className="px-6 py-4">Closed At</th>
                <th className="px-6 py-4">Service Invoice Cost</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.map((log) => {
                const vehicle = vehicles.find(v => v.id === log.vehicleId);

                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {vehicle?.name || "Unknown Asset"}
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-400 mt-0.5">
                          {vehicle?.registrationNumber || log.vehicleId} • Region: {vehicle?.region || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 max-w-xs truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(log.status)}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.openedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {log.closedAt ? new Date(log.closedAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                      <div className="flex items-center text-slate-600 font-medium">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400 -mr-0.5" />
                        <span>₹{log.cost.toLocaleString()}</span>
                        {log.status === MaintenanceStatus.OPEN && (
                          <span className="text-[10px] text-slate-400 font-sans font-normal ml-1">(Est.)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {isFleetManager && log.status === MaintenanceStatus.OPEN ? (
                        <button
                          id={`close-maint-btn-${log.id}`}
                          onClick={() => handleOpenCloseModal(log)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-xs cursor-pointer"
                        >
                          Resolve Order
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium font-mono px-2">READ ONLY</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Wrench className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm font-semibold">No maintenance records matched.</p>
                    <p className="text-xs text-slate-400 mt-1">Check search parameters or filter options.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Maintenance Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Open Service / Repair Order</h2>
              <button 
                onClick={() => setShowOpenModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOpenSubmit} className="p-6 space-y-4">
              {openError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex gap-2 text-rose-600 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{openError}</span>
                </div>
              )}

              {availableVehiclesForMaintenance.length === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 text-amber-700 text-xs font-semibold">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                  <span>There are currently zero AVAILABLE vehicles in the yard to service! You must wait until active route assignments complete.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Select Available Vehicle</label>
                <select
                  id="modal-maint-vehicle"
                  value={selectedVehicleId}
                  disabled={availableVehiclesForMaintenance.length === 0}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition disabled:bg-slate-100"
                >
                  {availableVehiclesForMaintenance.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} — {v.name} (Odo: {v.odometerKm.toLocaleString()} km)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Repair Description / Service Task</label>
                <textarea
                  id="modal-maint-desc"
                  required
                  rows={3}
                  placeholder="e.g. Full engine oil and oil filter replacement, checking transmission seals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Estimated Invoiced Cost (₹)</label>
                <input
                  id="modal-maint-cost"
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 250"
                  value={estCost}
                  onChange={(e) => setEstCost(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="modal-maint-submit"
                  type="submit"
                  disabled={availableVehiclesForMaintenance.length === 0}
                  className={`px-5 py-2 text-white text-sm font-semibold rounded-xl transition shadow-xs ${
                    availableVehiclesForMaintenance.length === 0
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  }`}
                >
                  Dispatch to Shop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Maintenance Modal */}
      {showCloseModal && closingLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
              <h2 className="text-lg font-bold text-emerald-900">Resolve Repair Order #{closingLog.id}</h2>
              <button 
                onClick={() => setShowCloseModal(false)}
                className="text-emerald-600 hover:text-emerald-800 text-lg font-bold p-1 rounded-lg hover:bg-emerald-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCloseSubmit} className="p-6 space-y-4">
              {closeError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex gap-2 text-rose-600 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{closeError}</span>
                </div>
              )}

              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs text-slate-700">
                <span className="font-bold text-emerald-800">Operational Notice:</span>
                <p className="mt-1">
                  Completing this service will log a permanent maintenance expense and return the vehicle back to the <span className="font-semibold text-emerald-700">AVAILABLE</span> pool.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Final Invoiced Cost (₹)</label>
                <input
                  id="modal-resolve-cost"
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 280"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="modal-resolve-submit"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Resolve Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
