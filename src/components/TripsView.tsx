import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Navigation, AlertTriangle, ShieldCheck, CheckCircle, 
  XCircle, ArrowRight, Scale, Gauge, IndianRupee, Calendar, Eye, Fuel 
} from "lucide-react";
import { Role, Trip, TripStatus, Vehicle, Driver } from "../types";

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
    setCargoWeight("350");
    setDistance("85");
    setRevenue("1500");
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !distance || !revenue) {
      setError("Please fill in all routing fields.");
      return;
    }

    // Capacity checking on the client side
    const targetVehicle = vehicles.find(v => v.id === vehicleId);
    if (targetVehicle && Number(cargoWeight) > targetVehicle.maxLoadCapacityKg) {
      setError(`Cannot create route: Cargo weight (${cargoWeight} kg) exceeds maximum weight limit of selected vehicle ${targetVehicle.registrationNumber} (${targetVehicle.maxLoadCapacityKg} kg).`);
      return;
    }

    const payload = {
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeightKg: Number(cargoWeight),
      plannedDistanceKm: Number(distance),
      revenue: Number(revenue)
    };

    try {
      await onAddTrip(payload);
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message || "Route validation failed.");
    }
  };

  const handleOpenComplete = (trip: Trip) => {
    setCompletingTrip(trip);
    setCompleteError(null);
    // Suggest next odometer
    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    const startOdo = trip.startOdometerKm ?? vehicle?.odometerKm ?? 0;
    setEndOdo((startOdo + trip.plannedDistanceKm).toString());
    setFuelConsumed("25");
    setFuelCost("55");
    setActualRevenue((trip.revenue ?? 1000).toString());
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompleteError(null);

    if (!completingTrip) return;

    if (!endOdo || fuelConsumed === undefined || fuelCost === undefined || !actualRevenue) {
      setCompleteError("All completion entries are required.");
      return;
    }

    const startOdo = completingTrip.startOdometerKm ?? 0;
    if (Number(endOdo) < startOdo) {
      setCompleteError(`Ending odometer (${endOdo} km) cannot be less than starting odometer (${startOdo} km).`);
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
      setCompleteError(err.message || "Failed to complete route order.");
    }
  };

  const handleDispatch = async (trip: Trip) => {
    if (window.confirm(`Confirm dispatch for Route #${trip.id} from ${trip.source} to ${trip.destination}? This will lock the assigned vehicle and operator.`)) {
      try {
        await onDispatchTrip(trip.id);
      } catch (err: any) {
        alert(err.message || "Dispatch transaction failed.");
      }
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
            Draft
          </span>
        );
      case TripStatus.DISPATCHED:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase font-mono">
            Dispatched
          </span>
        );
      case TripStatus.COMPLETED:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-mono">
            Completed
          </span>
        );
      case TripStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase font-mono">
            Cancelled
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Route Assignment Control</h1>
          <p className="text-sm text-slate-500 mt-1">Draft, dispatch, and track trips, validating cargo and certifications atomically.</p>
        </div>
        {isDispatcher && (
          <button
            id="draft-trip-btn"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Draft Route Assignment
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
            placeholder="Search source, destination, asset, driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="trip-filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-sm py-2 px-3 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
          >
            <option value="ALL">All Trip Statuses</option>
            <option value="DRAFT">Draft Routes Only</option>
            <option value="DISPATCHED">Dispatched / Out on Route</option>
            <option value="COMPLETED">Completed Trips</option>
            <option value="CANCELLED">Cancelled Routes</option>
          </select>
        </div>
      </div>

      {/* Trips Timeline Listing - highly visual layout */}
      <div className="space-y-4">
        {filteredTrips.map((t) => {
          const vehicle = vehicles.find(v => v.id === t.vehicleId);
          const driver = drivers.find(d => d.id === t.driverId);

          return (
            <div 
              key={t.id} 
              className={`bg-white rounded-2xl border p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 transition hover:border-slate-300 shadow-xs custom-glow ${
                t.status === TripStatus.DISPATCHED ? "border-blue-200 bg-blue-50/5" : "border-slate-100"
              }`}
            >
              {/* Destination / Source Route Path with dynamic visual lines */}
              <div className="space-y-3 shrink-0 w-full lg:w-1/3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-sm">
                    Route #{t.id}
                  </span>
                  {getStatusBadge(t.status)}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="font-bold text-slate-800 text-base">{t.source}</div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="font-bold text-blue-600 text-base">{t.destination}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-slate-400" /> Cargo: {t.cargoWeightKg.toLocaleString()} kg
                  </span>
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-slate-400" /> Distance: {t.plannedDistanceKm.toLocaleString()} km
                  </span>
                </div>
              </div>

              {/* Asset Assignment Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-1/3">
                {/* Vehicle card block */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Vehicle</span>
                  <span className="font-bold text-slate-800 text-sm block mt-1">
                    {vehicle?.name || "Unknown Asset"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    {vehicle?.registrationNumber || t.vehicleId} • Odo: {t.startOdometerKm ?? vehicle?.odometerKm ?? 0} km
                  </span>
                </div>

                {/* Driver card block */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Operator</span>
                  <span className="font-bold text-slate-800 text-sm block mt-1">
                    {driver?.name || "Unknown Operator"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    Lic: {driver?.licenseNumber || t.driverId} • Rating: {driver?.safetyScore ?? 100}/100
                  </span>
                </div>
              </div>

              {/* Cost / Completed Data or Dispatch buttons */}
              <div className="flex flex-col sm:flex-row items-stretch lg:items-center justify-end gap-3 w-full lg:w-1/4">
                {/* Completed Details section */}
                {t.status === TripStatus.COMPLETED && (
                  <div className="text-right w-full font-mono text-xs text-slate-500 space-y-1 bg-emerald-50/20 border border-emerald-100/50 p-3 rounded-xl">
                    <div className="font-bold text-emerald-800 font-sans text-sm flex items-center justify-end gap-1 mb-1">
                      <IndianRupee className="w-4 h-4 text-emerald-600 -mr-1" />
                      ₹{t.revenue?.toLocaleString()} <span className="text-xs font-normal text-slate-400">Revenue</span>
                    </div>
                    <div>Fuel: <span className="font-bold text-slate-700">{t.fuelConsumedL}L</span> logged</div>
                    <div>Odo final: <span className="font-bold text-slate-700">{t.endOdometerKm} km</span></div>
                  </div>
                )}

                {/* Cancelled state details */}
                {t.status === TripStatus.CANCELLED && (
                  <div className="text-right w-full text-xs text-slate-400 italic py-2">
                    Assignment cancelled. Asset locks released.
                  </div>
                )}

                {/* Dispatch / complete actions */}
                {isDispatcher && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    {t.status === TripStatus.DRAFT && (
                      <>
                        <button
                          id={`dispatch-btn-${t.id}`}
                          onClick={() => handleDispatch(t)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2.5 rounded-lg transition text-center shadow-xs cursor-pointer"
                        >
                          Dispatch Route
                        </button>
                        <button
                          id={`cancel-draft-btn-${t.id}`}
                          onClick={() => handleCancel(t)}
                          className="w-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-bold px-3 py-2.5 rounded-lg border border-slate-200 hover:border-rose-200 transition text-center cursor-pointer"
                        >
                          Cancel Draft
                        </button>
                      </>
                    )}

                    {t.status === TripStatus.DISPATCHED && (
                      <>
                        <button
                          id={`complete-btn-${t.id}`}
                          onClick={() => handleOpenComplete(t)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2.5 rounded-lg transition text-center shadow-xs cursor-pointer"
                        >
                          Complete Route
                        </button>
                        <button
                          id={`cancel-active-btn-${t.id}`}
                          onClick={() => handleCancel(t)}
                          className="w-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-bold px-3 py-2.5 rounded-lg border border-slate-200 hover:border-rose-200 transition text-center cursor-pointer"
                        >
                          Abort Route
                        </button>
                      </>
                    )}
                  </div>
                )}

                {!isDispatcher && (t.status === TripStatus.DRAFT || t.status === TripStatus.DISPATCHED) && (
                  <span className="text-xs text-slate-400 font-medium font-mono border border-slate-200 bg-slate-50 px-2 py-1.5 rounded-lg block text-center w-full">
                    ACTIVE ROUTE
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredTrips.length === 0 && (
          <div className="py-16 bg-white border border-slate-100 rounded-2xl text-center text-slate-400 shadow-xs">
            <Navigation className="w-12 h-12 text-slate-200 mx-auto mb-2" />
            <p className="text-sm font-semibold">No route assignments created.</p>
            <p className="text-xs text-slate-400 mt-1">Toggle status filter or query fields.</p>
          </div>
        )}
      </div>

      {/* Dispatch Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Draft Route Assignment</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-200 transition"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Start Origin Hub</label>
                  <input
                    id="modal-trip-source"
                    type="text"
                    required
                    placeholder="e.g. Logistics Hub Alpha"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Destination Target</label>
                  <input
                    id="modal-trip-dest"
                    type="text"
                    required
                    placeholder="e.g. Downtown Outlet"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Assets Allocation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Select Available Vehicle</label>
                  <select
                    id="modal-trip-vehicle"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  >
                    {availableVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} ({v.type} - Max: {v.maxLoadCapacityKg}kg)
                      </option>
                    ))}
                    {availableVehicles.length === 0 && (
                      <option value="" disabled>⚠️ No Available Vehicles!</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Select Available Operator</label>
                  <select
                    id="modal-trip-driver"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  >
                    {availableDrivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.licenseCategory} - Score: {d.safetyScore})
                      </option>
                    ))}
                    {availableDrivers.length === 0 && (
                      <option value="" disabled>⚠️ No Available Drivers!</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Load Overload dynamic alert */}
              {isCargoOverload && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 text-amber-700 text-xs font-semibold">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                  <span>Cargo weight exceeds vehicle's max capacity ({selectedVehicle?.maxLoadCapacityKg} kg)! You will be blocked from saving.</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Cargo Weight (kg)</label>
                  <input
                    id="modal-trip-cargo"
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 450"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Route Distance (km)</label>
                  <input
                    id="modal-trip-distance"
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 42"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Est. Revenue (₹)</label>
                  <input
                    id="modal-trip-revenue"
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 1200"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="modal-trip-submit"
                  type="submit"
                  disabled={isCargoOverload || availableVehicles.length === 0 || availableDrivers.length === 0}
                  className={`px-5 py-2 text-white text-sm font-semibold rounded-xl transition shadow-xs ${
                    isCargoOverload || availableVehicles.length === 0 || availableDrivers.length === 0
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  }`}
                >
                  Draft Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompleteModal && completingTrip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
              <h2 className="text-lg font-bold text-emerald-900">Complete Dispatched Route #{completingTrip.id}</h2>
              <button 
                onClick={() => setShowCompleteModal(false)}
                className="text-emerald-600 hover:text-emerald-800 text-lg font-bold p-1 rounded-lg hover:bg-emerald-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4">
              {completeError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex gap-2 text-rose-600 text-xs font-semibold">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                  <span>{completeError}</span>
                </div>
              )}

              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs text-slate-700">
                <span className="font-bold text-emerald-800">Operational Log Check:</span>
                <p className="mt-1">
                  Assigned Vehicle starting odometer was <span className="font-bold">{completingTrip.startOdometerKm} km</span>. Ending odometer must be equal or larger.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Final Odometer Reading (km)</label>
                  <input
                    id="modal-complete-odo"
                    type="number"
                    required
                    min={completingTrip.startOdometerKm ?? 0}
                    placeholder="e.g. 12085"
                    value={endOdo}
                    onChange={(e) => setEndOdo(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Fuel Consumed (Liters)</label>
                  <input
                    id="modal-complete-fuel"
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 25"
                    value={fuelConsumed}
                    onChange={(e) => setFuelConsumed(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Fuel Purchase Cost (₹)</label>
                  <input
                    id="modal-complete-fuelcost"
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 55"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Final Transaction Revenue (₹)</label>
                  <input
                    id="modal-complete-revenue"
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 1500"
                    value={actualRevenue}
                    onChange={(e) => setActualRevenue(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="modal-complete-submit"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Finalize Trip Logs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
