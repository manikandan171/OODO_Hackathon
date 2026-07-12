import React, { useState, useEffect } from "react";
import { Plus, Search, User, ShieldCheck, ShieldAlert, Award, Calendar, Phone, Mail, ToggleLeft, ToggleRight, Edit, AlertTriangle, Gauge } from "lucide-react";
import { Role, Driver, DriverStatus } from "../types";
import { useLanguage } from "../LanguageContext";

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
  const { t } = useLanguage();
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
      setError(t("drv_err_fill_all"));
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
      setError(err.message || "An unexpected error occurred.");
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
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-rose-100 text-rose-700 border border-rose-200 uppercase font-mono">
          Expired! ({expiryStr})
        </span>
      );
    } else if (diffDays <= 30) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-amber-100 text-amber-700 border border-amber-200 uppercase font-mono">
          Expiring in {diffDays}d
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200 font-mono">
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
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t("drv_status_available")}
          </span>
        );
      case DriverStatus.ON_TRIP:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {t("drv_status_ontrip")}
          </span>
        );
      case DriverStatus.OFF_DUTY:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> {t("drv_status_offduty")}
          </span>
        );
      case DriverStatus.SUSPENDED:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase font-mono tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> {t("drv_status_suspended")}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("drv_title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("drv_subtitle")}</p>
        </div>
        {(activeRole === Role.FLEET_MANAGER || activeRole === Role.SAFETY_OFFICER) && (
          <button
            id="register-driver-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-xs smooth-hover cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {t("drv_add_btn")}
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
            placeholder={t("drv_search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="driver-filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-sm py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            <option value="ALL">{t("drv_filter_all_statuses")}</option>
            <option value="AVAILABLE">{t("drv_status_available")}</option>
            <option value="ON_TRIP">{t("drv_status_ontrip")}</option>
            <option value="OFF_DUTY">{t("drv_status_offduty")}</option>
            <option value="SUSPENDED">{t("drv_status_suspended")}</option>
          </select>
        </div>
      </div>

      {/* Table grid layout */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">{t("drv_details")}</th>
                <th className="px-6 py-4">{t("drv_status")}</th>
                <th className="px-6 py-4">{t("drv_license_category")}</th>
                <th className="px-6 py-4">{t("drv_license_expiry")}</th>
                <th className="px-6 py-4">{t("drv_safety_score")}</th>
                <th className="px-6 py-4 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredDrivers.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/50 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{d.name}</span>
                        <span className="text-xs font-mono font-medium text-slate-400 block mt-0.5">{d.contactNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(d.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-700 font-mono">{d.licenseCategory}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-slate-700 font-semibold">{d.licenseNumber}</span>
                      {getLicenseBadge(d.licenseExpiryDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {d.safetyScore >= 85 ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      ) : d.safetyScore >= 70 ? (
                        <Award className="w-4 h-4 text-amber-500" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                      )}
                      <span className={`font-mono font-bold ${
                        d.safetyScore >= 85 ? "text-emerald-700" : d.safetyScore >= 70 ? "text-amber-700" : "text-rose-700"
                      }`}>{d.safetyScore} / 100</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1.5">
                      {/* Safety Officer special suspend toggle */}
                      {activeRole === Role.SAFETY_OFFICER && (
                        <button
                          id={`suspend-driver-${d.id}`}
                          onClick={() => handleToggleSuspend(d)}
                          title={d.status === DriverStatus.SUSPENDED ? t("drv_action_unsuspend") : t("drv_action_suspend")}
                          className={`p-1.5 rounded-lg border border-transparent transition smooth-hover cursor-pointer ${
                            d.status === DriverStatus.SUSPENDED
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                          }`}
                        >
                          {d.status === DriverStatus.SUSPENDED ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                      )}

                      {/* Edit operator details */}
                      {(activeRole === Role.FLEET_MANAGER || activeRole === Role.SAFETY_OFFICER) && (
                        <button
                          id={`edit-driver-${d.id}`}
                          onClick={() => handleOpenEdit(d)}
                          title={t("edit")}
                          className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg border border-transparent hover:border-blue-100 transition smooth-hover cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {activeRole !== Role.FLEET_MANAGER && activeRole !== Role.SAFETY_OFFICER && (
                        <span className="text-xs text-slate-400 font-medium font-mono px-2 py-1">{t("read_only")}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 animate-pulse">
                    <User className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm font-semibold">No operators found matching filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register/Edit Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">
                {modalMode === "ADD" ? t("drv_modal_add") : t("drv_modal_edit")}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-200 transition cursor-pointer"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("drv_label_name")}</label>
                <input
                  id="modal-driver-name"
                  type="text"
                  required
                  placeholder="e.g. Samuel Holden"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("drv_label_license_no")}</label>
                  <input
                    id="modal-driver-license"
                    type="text"
                    required
                    placeholder="e.g. DL-9090"
                    disabled={modalMode === "EDIT"}
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 disabled:bg-slate-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("drv_label_license_cat")}</label>
                  <select
                    id="modal-driver-license-cat"
                    value={licenseCat}
                    onChange={(e) => setLicenseCat(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                  >
                    <option value="LMV">LMV (Light Motor)</option>
                    <option value="HMV">HMV (Heavy Motor)</option>
                    <option value="MCWG">MCWG (Motorcycles)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("drv_label_license_expiry")}</label>
                  <input
                    id="modal-driver-expiry"
                    type="date"
                    required
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("drv_label_contact")}</label>
                  <input
                    id="modal-driver-contact"
                    type="text"
                    required
                    placeholder="+1-555-0199"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("drv_label_safety_score")}</label>
                <input
                  id="modal-driver-safety"
                  type="number"
                  required
                  min="0"
                  max="100"
                  placeholder="100"
                  value={safetyScore}
                  onChange={(e) => setSafetyScore(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button
                  id="modal-driver-submit"
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
                >
                  {modalMode === "ADD" ? t("drv_btn_register") : t("drv_btn_apply")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
