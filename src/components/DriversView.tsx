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

  const getWireframeBadge = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.AVAILABLE:
        return (
          <span className="inline-flex justify-center w-24 text-xs font-semibold px-2 py-1 rounded-md bg-[#22c55e] text-black border border-transparent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Available
          </span>
        );
      case DriverStatus.ON_TRIP:
        return (
          <span className="inline-flex justify-center w-24 text-xs font-semibold px-2 py-1 rounded-md bg-[#3b82f6] text-black border border-transparent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            On Trip
          </span>
        );
      case DriverStatus.OFF_DUTY:
        return (
          <span className="inline-flex justify-center w-24 text-xs font-semibold px-2 py-1 rounded-md bg-[#6b7280] text-black border border-transparent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Off Duty
          </span>
        );
      case DriverStatus.SUSPENDED:
        return (
          <span className="inline-flex justify-center w-24 text-xs font-semibold px-2 py-1 rounded-md bg-[#f97316] text-black border border-transparent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  const canEdit = activeRole === Role.FLEET_MANAGER || activeRole === Role.SAFETY_OFFICER;
  const canSuspend = activeRole === Role.SAFETY_OFFICER;

  return (
    <div className="bg-[#1a1a1a] min-h-[calc(100vh-4rem)] p-8 text-gray-300 font-sans tracking-wide rounded-lg">
      {/* Header and Add Button */}
      <div className="flex justify-end mb-8">
        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white px-5 py-2 rounded-lg font-bold shadow-md transition"
          >
            + Add Driver
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-500 uppercase text-xs tracking-wider">
              <th className="py-4 px-2 font-medium">DRIVER</th>
              <th className="py-4 px-2 font-medium">LICENSE NO</th>
              <th className="py-4 px-2 font-medium">CATEGOR</th>
              <th className="py-4 px-2 font-medium">EXPIRY</th>
              <th className="py-4 px-2 font-medium">CONTACT</th>
              <th className="py-4 px-2 font-medium">TRIP COMPL.</th>
              <th className="py-4 px-2 font-medium">SAFETY</th>
              <th className="py-4 px-2 font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredDrivers.map(d => (
              <tr key={d.id} className="hover:bg-[#222222] transition-colors cursor-pointer" onClick={() => canEdit && handleOpenEdit(d)}>
                <td className="py-4 px-2 text-white">{d.name}</td>
                <td className="py-4 px-2">{d.licenseNumber}</td>
                <td className="py-4 px-2">{d.licenseCategory}</td>
                <td className="py-4 px-2">
                  <div className="flex items-center gap-2">
                    {d.licenseExpiryDate}
                    {new Date(d.licenseExpiryDate) < new Date() && <span className="text-xs uppercase text-white font-bold">EXPIRE</span>}
                  </div>
                </td>
                <td className="py-4 px-2">{d.contactNumber}</td>
                <td className="py-4 px-2">{d.safetyScore}%</td>
                <td className="py-4 px-2">{getWireframeBadge(d.status)}</td>
                <td className="py-4 px-2">{getWireframeBadge(d.status)}</td>
              </tr>
            ))}
            {filteredDrivers.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  No drivers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Toggle Stat */}
      <div className="mt-12 space-y-4">
        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">TOGGLE STAT</div>
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={() => setFilterStatus("AVAILABLE")} className={`px-4 py-1.5 rounded-lg text-black font-semibold text-sm transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${filterStatus === 'AVAILABLE' || filterStatus === 'ALL' ? 'bg-[#22c55e]' : 'bg-[#22c55e] opacity-50'}`}>Available</button>
          <button onClick={() => setFilterStatus("ON_TRIP")} className={`px-4 py-1.5 rounded-lg text-black font-semibold text-sm transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${filterStatus === 'ON_TRIP' || filterStatus === 'ALL' ? 'bg-[#3b82f6]' : 'bg-[#3b82f6] opacity-50'}`}>On Trip</button>
          <button onClick={() => setFilterStatus("OFF_DUTY")} className={`px-4 py-1.5 rounded-lg text-black font-semibold text-sm transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${filterStatus === 'OFF_DUTY' || filterStatus === 'ALL' ? 'bg-[#6b7280]' : 'bg-[#6b7280] opacity-50'}`}>Off Duty</button>
          <button onClick={() => setFilterStatus("SUSPENDED")} className={`px-4 py-1.5 rounded-lg text-black font-semibold text-sm transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${filterStatus === 'SUSPENDED' || filterStatus === 'ALL' ? 'bg-[#f97316]' : 'bg-[#f97316] opacity-50'}`}>Suspended</button>
          {filterStatus !== "ALL" && (
            <button onClick={() => setFilterStatus("ALL")} className="px-4 py-1.5 rounded-lg text-gray-400 font-semibold border border-gray-700 hover:text-white text-sm">Clear</button>
          )}
        </div>
        <div className="text-[#f97316] text-sm mt-4 font-mono">
          Rule: Expired license or Suspended status → blocked from trip assignment
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e1e1e] rounded-2xl max-w-lg w-full border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-5 border-b border-gray-700 flex justify-between items-center bg-[#252525]">
              <h2 className="text-lg font-bold text-gray-100">
                {modalMode === "ADD" ? "Enroll Fleet Operator" : "Update Operator Credentials"}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-200 text-lg font-bold p-1 rounded-lg hover:bg-gray-700 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg flex gap-2 text-red-400 text-xs font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Full Legal Name</label>
                <input
                  id="modal-driver-name"
                  type="text"
                  required
                  placeholder="e.g. Alex Kamal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-gray-200 focus:outline-none focus:border-[#f97316] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">License # / Reference</label>
                  <input
                    id="modal-driver-license"
                    type="text"
                    required
                    placeholder="e.g. DL-1001"
                    disabled={modalMode === "EDIT"}
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-gray-200 focus:outline-none focus:border-[#f97316] disabled:opacity-50 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">License Category</label>
                  <select
                    id="modal-driver-cat"
                    value={licenseCat}
                    onChange={(e) => setLicenseCat(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-gray-200 focus:outline-none focus:border-[#f97316] transition"
                  >
                    <option value="LMV">LMV (Light Motor Vehicle)</option>
                    <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                    <option value="MC">MC (Motorcycle / Bike)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">License Expiration Date</label>
                  <input
                    id="modal-driver-expiry"
                    type="date"
                    required
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-gray-200 focus:outline-none focus:border-[#f97316] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Operator Contact Phone</label>
                  <input
                    id="modal-driver-phone"
                    type="text"
                    required
                    placeholder="e.g. +1-555-0100"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-gray-200 focus:outline-none focus:border-[#f97316] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Assigned Safety Score (0-100)</label>
                <input
                  id="modal-driver-safety"
                  type="number"
                  min="0"
                  max="100"
                  required
                  placeholder="e.g. 95"
                  value={safetyScore}
                  onChange={(e) => setSafetyScore(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-gray-200 focus:outline-none focus:border-[#f97316] transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="modal-driver-submit"
                  type="submit"
                  className="px-5 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-semibold rounded-xl transition shadow-md cursor-pointer"
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
