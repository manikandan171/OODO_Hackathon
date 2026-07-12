import React, { useState, useEffect } from "react";
import { Plus, Search, User, ShieldCheck, ShieldAlert, Award, Calendar, Phone, Mail, ToggleLeft, ToggleRight, Edit, AlertTriangle } from "lucide-react";
import { Role, Driver, DriverStatus } from "../types";

interface DriversViewProps {
  drivers: Driver[];
  activeRole: Role;
  onAddDriver: (driver: any) => Promise<void>;
  onUpdateDriver: (id: string, updates: any) => Promise<void>;
  onSuspendDriver: (id: string, suspend: boolean) => Promise<void>;
  globalSearchQuery?: string;
}

export default function DriversView({
  drivers,
  activeRole,
  onAddDriver,
  onUpdateDriver,
  onSuspendDriver,
  globalSearchQuery
}: DriversViewProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setSearch(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [licenseCat, setLicenseCat] = useState("LMV");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [contact, setContact] = useState("");
  const [safetyScore, setSafetyScore] = useState("100");

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                          d.licenseNumber.toLowerCase().includes(search.toLowerCase()) ||
                          d.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setModalMode("ADD");
    setError(null);
    setName("");
    setLicenseNo("");
    setLicenseCat("LMV");
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setLicenseExpiry(nextYear.toISOString().split("T")[0]);
    setContact("+1-555-");
    setSafetyScore("100");
    setShowModal(true);
  };

  const handleOpenEdit = (d: Driver) => {
    setModalMode("EDIT");
    setSelectedDriverId(d.id);
    setError(null);
    setName(d.name);
    setLicenseNo(d.licenseNumber);
    setLicenseCat(d.licenseCategory);
    setLicenseExpiry(d.licenseExpiryDate);
    setContact(d.contactNumber);
    setSafetyScore(d.safetyScore.toString());
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !licenseNo || !licenseCat || !licenseExpiry || !contact) {
      setError("Please fill out all mandatory fields.");
      return;
    }

    const payload = {
      name,
      licenseNumber: licenseNo,
      licenseCategory: licenseCat,
      licenseExpiryDate: licenseExpiry,
      contactNumber: contact,
      safetyScore: Number(safetyScore)
    };

    try {
      if (modalMode === "ADD") {
        await onAddDriver(payload);
      } else if (modalMode === "EDIT" && selectedDriverId) {
        await onUpdateDriver(selectedDriverId, payload);
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || "An unexpected validation error occurred.");
    }
  };

  const handleToggleSuspend = async (d: Driver) => {
    const isSuspending = d.status !== DriverStatus.SUSPENDED;
    const confirmMsg = isSuspending
      ? `Are you absolutely sure you want to SUSPEND operator ${d.name}? They will be completely blocked from dispatch assignments.`
      : `Are you sure you want to REINSTATE operator ${d.name} back to active duty?`;

    if (window.confirm(confirmMsg)) {
      try {
        await onSuspendDriver(d.id, isSuspending);
      } catch (err: any) {
        alert(err.message || "Failed to alter driver suspension status.");
      }
    }
  };

  // Expiry check styling
  const getLicenseBadge = (expiryStr: string) => {
    const expiry = new Date(expiryStr);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-sm bg-rose-100 text-rose-700 border border-rose-200 uppercase font-mono">
          Expired! ({expiryStr})
        </span>
      );
    } else if (diffDays <= 30) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-sm bg-amber-100 text-amber-700 border border-amber-200 uppercase font-mono">
          Expiring in {diffDays}d
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200 font-mono">
          Expires: {expiryStr}
        </span>
      );
    }
  };

  const getStatusBadge = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.AVAILABLE:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Available
          </span>
        );
      case DriverStatus.ON_TRIP:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> On Route
          </span>
        );
      case DriverStatus.OFF_DUTY:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Off Duty
          </span>
        );
      case DriverStatus.SUSPENDED:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase font-mono tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Suspended
          </span>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 75) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const canEdit = activeRole === Role.FLEET_MANAGER || activeRole === Role.SAFETY_OFFICER;
  const canSuspend = activeRole === Role.SAFETY_OFFICER;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operator Manifest</h1>
          <p className="text-sm text-slate-500 mt-1">Audit certifications, verify safety metrics, and guard active shift rosters.</p>
        </div>
        {canEdit && (
          <button
            id="register-driver-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Enroll New Operator
          </button>
        )}
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            id="driver-search"
            type="text"
            placeholder="Search operator name or license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="driver-filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-sm py-2 px-3 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
          >
            <option value="ALL">All Manifest Statuses</option>
            <option value="AVAILABLE">Available Only</option>
            <option value="ON_TRIP">Out on Active Route</option>
            <option value="OFF_DUTY">Off Duty / Off Roster</option>
            <option value="SUSPENDED">Suspended / Restricted</option>
          </select>
        </div>
      </div>

      {/* Grid of Operators - Bento layout for creative unique feel! */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((d) => (
          <div key={d.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col justify-between hover:border-slate-200 transition-all custom-glow">
            {/* Top Identity bar */}
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase shrink-0">
                    {d.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 leading-tight">{d.name}</h2>
                    <span className="text-xs font-mono font-medium text-slate-400 mt-1 block">ID: {d.id}</span>
                  </div>
                </div>
                {getStatusBadge(d.status)}
              </div>

              {/* Stats/Metas Bento Section */}
              <div className="mt-5 grid grid-cols-2 gap-3.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Safety Score</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded-md border ${getScoreColor(d.safetyScore)}`}>
                      {d.safetyScore}/100
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classification</span>
                  <div className="flex items-center gap-1.5 mt-1.5 text-sm font-bold text-slate-700">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono text-xs">
                      {d.licenseCategory}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Info */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{d.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-500 font-mono">Lic: {d.licenseNumber}</span>
                    {getLicenseBadge(d.licenseExpiryDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions section */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                {canSuspend && (
                  <button
                    id={`suspend-btn-${d.id}`}
                    onClick={() => handleToggleSuspend(d)}
                    disabled={d.status === DriverStatus.ON_TRIP}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                      d.status === DriverStatus.SUSPENDED
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:text-emerald-800"
                        : d.status === DriverStatus.ON_TRIP
                        ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                        : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100 hover:text-rose-800"
                    }`}
                  >
                    {d.status === DriverStatus.SUSPENDED ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> Reinstate Driver
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" /> Suspend Driver
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex gap-1">
                {canEdit && (
                  <button
                    id={`edit-driver-${d.id}`}
                    onClick={() => handleOpenEdit(d)}
                    title="Edit operator profile"
                    className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-blue-600 rounded-lg border border-transparent hover:border-slate-200 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredDrivers.length === 0 && (
          <div className="col-span-full py-16 bg-white border border-slate-100 rounded-2xl text-center text-slate-400 shadow-xs">
            <User className="w-12 h-12 text-slate-200 mx-auto mb-2" />
            <p className="text-sm font-semibold">No operators registered.</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Verify spelling or change active manifest filter.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">
                {modalMode === "ADD" ? "Enroll Fleet Operator" : "Update Operator Credentials"}
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Legal Name</label>
                <input
                  id="modal-driver-name"
                  type="text"
                  required
                  placeholder="e.g. Alex Kamal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">License # / Reference</label>
                  <input
                    id="modal-driver-license"
                    type="text"
                    required
                    placeholder="e.g. DL-1001"
                    disabled={modalMode === "EDIT"}
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">License Category</label>
                  <select
                    id="modal-driver-cat"
                    value={licenseCat}
                    onChange={(e) => setLicenseCat(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  >
                    <option value="LMV">LMV (Light Motor Vehicle)</option>
                    <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                    <option value="MC">MC (Motorcycle / Bike)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">License Expiration Date</label>
                  <input
                    id="modal-driver-expiry"
                    type="date"
                    required
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Operator Contact Phone</label>
                  <input
                    id="modal-driver-phone"
                    type="text"
                    required
                    placeholder="e.g. +1-555-0100"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Assigned Safety Score (0-100)</label>
                <input
                  id="modal-driver-safety"
                  type="number"
                  min="0"
                  max="100"
                  required
                  placeholder="e.g. 95"
                  value={safetyScore}
                  onChange={(e) => setSafetyScore(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 transition"
                />
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
                  id="modal-driver-submit"
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
                >
                  {modalMode === "ADD" ? "Register Operator" : "Apply Credentials"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
