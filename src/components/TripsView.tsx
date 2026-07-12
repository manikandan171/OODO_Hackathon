import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Navigation, AlertTriangle, ShieldCheck, CheckCircle, 
  XCircle, ArrowRight, Scale, Gauge, DollarSign, Calendar, Eye, Fuel 
} from "lucide-react";
import { Role, Trip, TripStatus, Vehicle, Driver } from "../types";
import { useLanguage } from "../LanguageContext";

interface TripsViewProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  activeRole: Role;
  onAddTrip: (trip: any) => Promise<void>;
  onDispatchTrip: (id: string) => Promise<void>;
  onCompleteTrip: (id: string, completionData: any) => Promise<void>;
  onCancelTrip: (id: string) => Promise<void>;
  globalSearchQuery?: string;
}

export default function TripsView({
  trips,
  vehicles,
  drivers,
  activeRole,
  onAddTrip,
  onDispatchTrip,
  onCompleteTrip,
  onCancelTrip,
  globalSearchQuery
}: TripsViewProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setSearch(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  // Dynamic lists of available assets for creation dropdowns
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);

  // Create Form modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create fields
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [distance, setDistance] = useState("");
  const [revenue, setRevenue] = useState("");

  // Complete Form modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);

  // Complete fields
  const [endOdo, setEndOdo] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [actualRevenue, setActualRevenue] = useState("");

  // Load available assets when modal is opened
  useEffect(() => {
    if (showCreateModal) {
      // Available vehicles are those currently AVAILABLE
      const avVehicles = vehicles.filter(v => v.status === "AVAILABLE");
      setAvailableVehicles(avVehicles);
      if (avVehicles.length > 0) setVehicleId(avVehicles[0].id);

      // Available drivers are those AVAILABLE, with license not expired, and not suspended
      const today = new Date();
      const avDrivers = drivers.filter(d => {
        const isAvailable = d.status === "AVAILABLE";
        const notExpired = new Date(d.licenseExpiryDate) >= today;
        return isAvailable && notExpired;
      });
      setAvailableDrivers(avDrivers);
      if (avDrivers.length > 0) setDriverId(avDrivers[0].id);
    }
  }, [showCreateModal, vehicles, drivers]);

  // Handle cargo warning check dynamically
  const selectedVehicle = vehicles.find(v => v.id === vehicleId);
  const isCargoOverload = selectedVehicle && cargoWeight && Number(cargoWeight) > selectedVehicle.maxLoadCapacityKg;

  // Filter trips
  const filteredTrips = trips.filter(t => {
    const v = vehicles.find(vec => vec.id === t.vehicleId);
    const d = drivers.find(drv => drv.id === t.driverId);
    const searchString = `${t.source} ${t.destination} ${v?.name || ""} ${d?.name || ""} ${t.id}`.toLowerCase();
    
    const matchesSearch = searchString.includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setError(null);
    setSource("");
    setDestination("");
    setCargoWeight("800");
    setDistance("120");
    setRevenue("450");
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !distance) {
      setError("Please fill out all mandatory trip fields.");
      return;
    }

    try {
      await onAddTrip({
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeightKg: Number(cargoWeight),
        plannedDistanceKm: Number(distance),
        revenue: revenue ? Number(revenue) : 0
      });
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to book trip.");
    }
  };

  const handleDispatch = async (trip: Trip) => {
    if (window.confirm(`Are you ready to dispatch route #${trip.id}? The assigned vehicle and operator will be locked in 'ON_TRIP' state.`)) {
      try {
        await onDispatchTrip(trip.id);
      } catch (err: any) {
        alert(err.message || "Dispatch operation failed.");
      }
    }
  };

  const handleOpenComplete = (trip: Trip) => {
    setCompletingTrip(trip);
    setCompleteError(null);
    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    const currentOdo = vehicle?.odometerKm ?? 0;
    
    // Autofill values based on planned stats for quick dev workflows
    setEndOdo((currentOdo + trip.plannedDistanceKm).toString());
    setFuelConsumed(Math.round(trip.plannedDistanceKm * 0.25).toString()); // 4 km per liter mock avg
    setFuelCost(Math.round(trip.plannedDistanceKm * 0.25 * 2.2).toString()); // $2.2 per L avg
    setActualRevenue(trip.revenue?.toString() ?? "0");
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompleteError(null);

    if (!completingTrip || !endOdo || !fuelConsumed || !fuelCost) {
      setCompleteError("Missing fuel and ending odometer completion fields.");
      return;
    }

    try {
      await onCompleteTrip(completingTrip.id, {
        endOdometerKm: Number(endOdo),
        fuelConsumedL: Number(fuelConsumed),
        fuelCost: Number(fuelCost),
        revenue: Number(actualRevenue)
      });
      setShowCompleteModal(false);
      setCompletingTrip(null);
    } catch (err: any) {
      setCompleteError(err.message || "Failed to resolve route completion details.");
    }
  };

  const handleCancel = async (trip: Trip) => {
    const msg = trip.status === TripStatus.DISPATCHED 
      ? `Confirm cancellation of active route #${trip.id}? The vehicle and operator will be immediately freed back to AVAILABLE.` 
      : `Are you sure you want to cancel Draft route #${trip.id}?`;

    if (window.confirm(msg)) {
      try {
        await onCancelTrip(trip.id);
      } catch (err: any) {
        alert(err.message || "Trip cancellation failed.");
      }
    }
  };

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case TripStatus.DRAFT:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 uppercase font-mono">
            {t("trip_status_draft")}
          </span>
        );
      case TripStatus.DISPATCHED:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase font-mono">
            {t("trip_status_dispatched")}
          </span>
        );
      case TripStatus.COMPLETED:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-mono">
            {t("trip_status_completed")}
          </span>
        );
      case TripStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase font-mono">
            {t("trip_status_cancelled")}
          </span>
        );
      default:
        return null;
    }
  };

  const isDispatcher = activeRole === Role.DISPATCHER;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("trip_title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("trip_subtitle")}</p>
        </div>
        {isDispatcher && (
          <button
            id="draft-trip-btn"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-xs smooth-hover cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {t("trip_add_btn")}
          </button>
        )}
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            id="trip-search"
            type="text"
            placeholder={t("trip_search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="trip-filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-sm py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            <option value="ALL">{t("trip_filter_all_statuses")}</option>
            <option value="DRAFT">{t("trip_status_draft")}</option>
            <option value="DISPATCHED">{t("trip_status_dispatched")}</option>
            <option value="COMPLETED">{t("trip_status_completed")}</option>
            <option value="CANCELLED">{t("trip_status_cancelled")}</option>
          </select>
        </div>
      </div>

      {/* Trips Timeline Listing */}
      <div className="space-y-4">
        {filteredTrips.map((trip) => {
          const vehicle = vehicles.find(v => v.id === trip.vehicleId);
          const driver = drivers.find(d => d.id === trip.driverId);

          return (
            <div 
              key={trip.id} 
              className={`bg-white rounded-2xl border p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 transition hover:border-slate-300 shadow-xs custom-glow smooth-hover ${
                trip.status === TripStatus.DISPATCHED ? "border-blue-200 bg-blue-50/5" : "border-slate-100"
              }`}
            >
              {/* Destination / Source Route Path */}
              <div className="space-y-3 shrink-0 w-full lg:w-1/3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-sm">
                    Route #{trip.id}
                  </span>
                  {getStatusBadge(trip.status)}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="font-bold text-slate-800 text-base">{trip.source}</div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="font-bold text-blue-600 text-base">{trip.destination}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-slate-400" /> {t("trip_cargo_load")}: {trip.cargoWeightKg.toLocaleString()} kg
                  </span>
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-slate-400" /> {t("trip_planned_dist")}: {trip.plannedDistanceKm.toLocaleString()} km
                  </span>
                </div>
              </div>

              {/* Asset Assignment Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-1/3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t("trip_assigned_assets")} (Vehicle)</span>
                  <span className="font-bold text-slate-800 text-sm block mt-1">
                    {vehicle?.name || "Unknown Asset"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    {vehicle?.registrationNumber || trip.vehicleId} • Odo: {trip.startOdometerKm ?? vehicle?.odometerKm ?? 0} km
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t("trip_assigned_assets")} (Operator)</span>
                  <span className="font-bold text-slate-800 text-sm block mt-1">
                    {driver?.name || "Unknown Operator"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    Lic: {driver?.licenseNumber || trip.driverId} • Rating: {driver?.safetyScore ?? 100}/100
                  </span>
                </div>
              </div>

              {/* Cost / Completed Data or Dispatch buttons */}
              <div className="flex flex-col sm:flex-row items-stretch lg:items-center justify-end gap-3 w-full lg:w-1/4">
                {trip.status === TripStatus.COMPLETED && (
                  <div className="text-right w-full font-mono text-xs text-slate-500 space-y-1 bg-emerald-50/20 border border-emerald-100/50 p-3 rounded-xl">
                    <div className="font-bold text-emerald-800 font-sans text-sm flex items-center justify-end gap-1 mb-1">
                      <DollarSign className="w-4 h-4 text-emerald-600 -mr-1" />
                      {trip.revenue?.toLocaleString()} <span className="text-xs font-normal text-slate-400">{t("trip_financials")}</span>
                    </div>
                    <div>Fuel: <span className="font-bold text-slate-700">{trip.fuelConsumedL}L</span> logged</div>
                    <div>Odo final: <span className="font-bold text-slate-700">{trip.endOdometerKm} km</span></div>
                  </div>
                )}

                {trip.status === TripStatus.CANCELLED && (
                  <div className="text-right w-full text-xs text-slate-400 italic py-2">
                    Assignment cancelled. Asset locks released.
                  </div>
                )}

                {isDispatcher && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    {trip.status === TripStatus.DRAFT && (
                      <>
                        <button
                          id={`dispatch-btn-${trip.id}`}
                          onClick={() => handleDispatch(trip)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2.5 rounded-lg transition text-center shadow-xs smooth-hover cursor-pointer"
                        >
                          {t("trip_action_dispatch")}
                        </button>
                        <button
                          id={`cancel-draft-btn-${trip.id}`}
                          onClick={() => handleCancel(trip)}
                          className="w-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-bold px-3 py-2.5 rounded-lg border border-slate-200 hover:border-rose-200 transition text-center smooth-hover cursor-pointer"
                        >
                          {t("trip_action_cancel")}
                        </button>
                      </>
                    )}

                    {trip.status === TripStatus.DISPATCHED && (
                      <>
                        <button
                          id={`complete-btn-${trip.id}`}
                          onClick={() => handleOpenComplete(trip)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2.5 rounded-lg transition text-center shadow-xs smooth-hover cursor-pointer"
                        >
                          {t("trip_action_complete")}
                        </button>
                        <button
                          id={`cancel-active-btn-${trip.id}`}
                          onClick={() => handleCancel(trip)}
                          className="w-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-bold px-3 py-2.5 rounded-lg border border-slate-200 hover:border-rose-200 transition text-center smooth-hover cursor-pointer"
                        >
                          {t("trip_action_cancel")}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {!isDispatcher && (trip.status === TripStatus.DRAFT || trip.status === TripStatus.DISPATCHED) && (
                  <span className="text-xs text-slate-400 font-medium font-mono border border-slate-200 bg-slate-50 px-2 py-1.5 rounded-lg block text-center w-full">
                    ACTIVE ROUTE
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredTrips.length === 0 && (
          <div className="py-16 bg-white border border-slate-100 rounded-2xl text-center text-slate-400 shadow-xs animate-pulse">
            <Navigation className="w-12 h-12 text-slate-200 mx-auto mb-2" />
            <p className="text-sm font-semibold">No route assignments created.</p>
          </div>
        )}
      </div>

      {/* Dispatch Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{t("trip_modal_add")}</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex gap-2 text-rose-600 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("trip_label_source")}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai Hub"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("trip_label_dest")}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune City Outlet"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("trip_label_select_veh")}</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                  >
                    <option value="">-- Choose --</option>
                    {availableVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} — {v.name} (Cap: {v.maxLoadCapacityKg} kg)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("trip_label_select_drv")}</label>
                  <select
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                  >
                    <option value="">-- Choose --</option>
                    {availableDrivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} (Rating: {d.safetyScore}/100)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isCargoOverload && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-2 text-amber-700 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Warning: Cargo load exceeds selected vehicle's certified maximum capacity limit!</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("trip_label_cargo")}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 800"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("trip_label_dist")}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 150"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("trip_label_revenue")}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 450"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
                >
                  {t("trip_btn_book")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Route Modal */}
      {showCompleteModal && completingTrip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{t("trip_modal_complete")}</h2>
              <button 
                onClick={() => { setShowCompleteModal(false); setCompletingTrip(null); }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4">
              {completeError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex gap-2 text-rose-600 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{completeError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Route Path</span>
                  <span className="font-bold text-slate-800 text-sm">{completingTrip.source} → {completingTrip.destination}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Vehicle Certified Odometer</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">
                    {vehicles.find(v => v.id === completingTrip.vehicleId)?.odometerKm.toLocaleString()} km
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("trip_label_end_odo")}</label>
                <input
                  type="number"
                  required
                  value={endOdo}
                  onChange={(e) => setEndOdo(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("trip_label_fuel_consumed")}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={fuelConsumed}
                    onChange={(e) => setFuelConsumed(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("trip_label_fuel_cost")}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Final Actual Revenue ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={actualRevenue}
                  onChange={(e) => setActualRevenue(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowCompleteModal(false); setCompletingTrip(null); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
                >
                  {t("trip_btn_resolve")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
