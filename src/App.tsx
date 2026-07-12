import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Navigation, 
  Wrench, 
  DollarSign, 
  BarChart3, 
  ShieldAlert, 
  ShieldCheck, 
  Menu, 
  X,
  ChevronRight,
  User,
  Power,
  RefreshCw,
  Search
} from "lucide-react";
import { 
  Role, 
  Vehicle, 
  Driver, 
  Trip, 
  MaintenanceLog, 
  FuelLog, 
  Expense, 
  DashboardKPIs, 
  VehicleReport 
} from "./types";

// Import custom views
import DashboardView from "./components/DashboardView";
import VehiclesView from "./components/VehiclesView";
import DriversView from "./components/DriversView";
import TripsView from "./components/TripsView";
import MaintenanceView from "./components/MaintenanceView";
import FuelExpensesView from "./components/FuelExpensesView";
import ReportsView from "./components/ReportsView";
import { useLanguage } from "./LanguageContext";


export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [activeRole, setActiveRole] = useState<Role>(Role.FLEET_MANAGER);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Global search and navigation filter query state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>("");

  // Core operational datasets
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Analytical outputs
  const [kpis, setKpis] = useState<DashboardKPIs>({
    activeVehicles: 0,
    availableVehicles: 0,
    vehiclesInShop: 0,
    activeTrips: 0,
    pendingTrips: 0,
    driversOnDuty: 0,
    fleetUtilizationPercent: 0
  });
  const [analyticsReport, setAnalyticsReport] = useState<VehicleReport[]>([]);

  // Fetch all core resources
  const loadData = async () => {
    setIsLoading(true);
    try {
      const headers = { "x-user-role": activeRole };

      const [vRes, dRes, tRes, mRes, fRes, eRes, kRes, rRes] = await Promise.all([
        fetch("/api/vehicles", { headers }),
        fetch("/api/drivers", { headers }),
        fetch("/api/trips", { headers }),
        fetch("/api/maintenance", { headers }),
        fetch("/api/fuel-logs", { headers }),
        fetch("/api/expenses", { headers }),
        fetch("/api/reports/dashboard", { headers }),
        fetch("/api/reports/analytics", { headers })
      ]);

      if (vRes.ok) setVehicles(await vRes.json());
      if (dRes.ok) setDrivers(await dRes.json());
      if (tRes.ok) setTrips(await tRes.json());
      if (mRes.ok) setMaintenanceLogs(await mRes.json());
      if (fRes.ok) setFuelLogs(await fRes.json());
      if (eRes.ok) setExpenses(await eRes.json());
      if (kRes.ok) setKpis(await kRes.json());
      if (rRes.ok) setAnalyticsReport(await rRes.json());

    } catch (err) {
      console.error("Failed to synchronize with TransitOps server:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronize database upon role shifts or action completions
  useEffect(() => {
    loadData();
  }, [activeRole]);

  // Adjust active screen to suit role's primary workflow focus
  const handleRoleChange = (role: Role) => {
    setActiveRole(role);
    setSearchQuery("");
    setGlobalSearchQuery("");
    if (role === Role.DISPATCHER) {
      setActiveTab("trips");
    } else if (role === Role.FINANCIAL_ANALYST) {
      setActiveTab("reports");
    } else {
      setActiveTab("dashboard");
    }
  };

  // --- API INTERACTION METHODS ---

  const handleAddVehicle = async (vehiclePayload: any) => {
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-role": activeRole },
      body: JSON.stringify(vehiclePayload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create vehicle asset.");
    }
    await loadData();
  };

  const handleUpdateVehicle = async (id: string, updatesPayload: any) => {
    const res = await fetch(`/api/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-role": activeRole },
      body: JSON.stringify(updatesPayload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to edit vehicle asset.");
    }
    await loadData();
  };

  const handleRetireVehicle = async (id: string) => {
    const res = await fetch(`/api/vehicles/${id}/retire`, {
      method: "POST",
      headers: { "x-user-role": activeRole }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to retire vehicle.");
    }
    await loadData();
  };

  const handleAddDriver = async (driverPayload: any) => {
    const res = await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-role": activeRole },
      body: JSON.stringify(driverPayload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to register operator profile.");
    }
    await loadData();
  };

  const handleUpdateDriver = async (id: string, updatesPayload: any) => {
    const res = await fetch(`/api/drivers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-role": activeRole },
      body: JSON.stringify(updatesPayload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to edit driver specs.");
    }
    await loadData();
  };

  const handleSuspendDriver = async (id: string, suspend: boolean) => {
    const res = await fetch(`/api/drivers/${id}/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-role": activeRole },
      body: JSON.stringify({ suspend })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to alter driver suspension status.");
    }
    await loadData();
  };

  const handleAddTrip = async (tripPayload: any) => {
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-role": activeRole },
      body: JSON.stringify(tripPayload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Trip booking failed.");
    }
    await loadData();
  };

  const handleDispatchTrip = async (id: string) => {
    const res = await fetch(`/api/trips/${id}/dispatch`, {
      method: "POST",
      headers: { "x-user-role": activeRole }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Dispatch failed.");
    }
    await loadData();
  };

  const handleCompleteTrip = async (id: string, completionData: any) => {
    const res = await fetch(`/api/trips/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-role": activeRole },
      body: JSON.stringify(completionData)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Completion failed.");
    }
    await loadData();
  };

  const handleCancelTrip = async (id: string) => {
    const res = await fetch(`/api/trips/${id}/cancel`, {
      method: "POST",
      headers: { "x-user-role": activeRole }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Abortion failed.");
    }
    await loadData();
  };

  const handleOpenMaintenance = async (maintPayload: any) => {
    const res = await fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-role": activeRole },
      body: JSON.stringify(maintPayload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to open maintenance order.");
    }
    await loadData();
  };

  const handleCloseMaintenance = async (id: string, cost: number) => {
    const res = await fetch(`/api/maintenance/${id}/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-role": activeRole },
      body: JSON.stringify({ cost })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to resolve maintenance order.");
    }
    await loadData();
  };

  const handleAddFuelLog = async (fuelPayload: any) => {
    const res = await fetch("/api/fuel-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-role": activeRole },
      body: JSON.stringify(fuelPayload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to log fuel refill.");
    }
    await loadData();
  };

  const handleAddExpense = async (expensePayload: any) => {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-role": activeRole },
      body: JSON.stringify(expensePayload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save operational expense.");
    }
    await loadData();
  };

  // --- RENDERING ROUTE NAVIGATION SIDEBAR ---

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "vehicles", label: "Vehicles Registry", icon: Truck },
    { id: "drivers", label: "Operators Manifest", icon: Users },
    { id: "trips", label: "Route Assignment", icon: Navigation },
    { id: "maintenance", label: "Work Orders", icon: Wrench },
    { id: "fuel-expenses", label: "Accounting Journals", icon: DollarSign },
    { id: "reports", label: "Logistics Intelligence", icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* 1. Global Interactive Role Switcher Header bar */}
      <div className="sticky top-0 bg-slate-900 text-white z-40 px-4 py-2.5 flex flex-col md:flex-row justify-between items-center gap-3 border-b border-slate-800 shadow-lg">
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md animate-pulse">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight font-display block">{t("app_title")}</span>
            <span className="text-[10px] text-slate-400 block font-medium">{t("app_subtitle")}</span>
          </div>
        </div>

        {/* Global search bar that allows users to quickly filter vehicles, drivers, or trips by ID or name */}
        <div className="relative flex-1 max-w-sm w-full md:mx-4" id="global-search-container">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="global-search-input"
              type="text"
              placeholder={t("trip_search_placeholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                // Give a small delay so selection click can fire first
                setTimeout(() => setShowDropdown(false), 200);
              }}
              className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
            {searchQuery && (
              <button
                id="clear-global-search"
                onClick={() => {
                  setSearchQuery("");
                  setGlobalSearchQuery("");
                }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categorized Dropdown Overlay */}
          {showDropdown && searchQuery.trim() !== "" && (() => {
            const query = searchQuery.trim().toLowerCase();
            const matchedVehicles = vehicles.filter(
              v =>
                v.id.toLowerCase().includes(query) ||
                v.name.toLowerCase().includes(query) ||
                v.registrationNumber.toLowerCase().includes(query)
            );
            const matchedDrivers = drivers.filter(
              d =>
                d.id.toLowerCase().includes(query) ||
                d.name.toLowerCase().includes(query) ||
                d.licenseNumber.toLowerCase().includes(query)
            );
            const matchedTrips = trips.filter(
              t =>
                t.id.toLowerCase().includes(query) ||
                t.source.toLowerCase().includes(query) ||
                t.destination.toLowerCase().includes(query)
            );
            const totalMatches = matchedVehicles.length + matchedDrivers.length + matchedTrips.length;

            return (
              <div 
                id="global-search-dropdown" 
                className="absolute top-full left-0 right-0 mt-2 bg-slate-950 text-slate-300 border border-slate-800 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50 p-2 text-left animate-in fade-in slide-in-from-top-1 duration-150"
              >
                {totalMatches === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching records for <span className="font-semibold text-slate-300">"{searchQuery}"</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Vehicles Section */}
                    {matchedVehicles.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900/50 rounded-lg flex justify-between items-center">
                          <span>Vehicles</span>
                          <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full text-[9px] font-mono">{matchedVehicles.length}</span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {matchedVehicles.slice(0, 5).map(v => (
                            <button
                              key={v.id}
                              onMouseDown={() => {
                                setActiveTab("vehicles");
                                setGlobalSearchQuery(v.registrationNumber);
                                setShowDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-900 hover:text-white transition flex justify-between items-center cursor-pointer"
                            >
                              <div>
                                <span className="font-bold text-slate-100 block">{v.name}</span>
                                <span className="text-slate-400 block font-mono text-[10px]">{v.registrationNumber} • {v.type}</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Drivers Section */}
                    {matchedDrivers.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900/50 rounded-lg flex justify-between items-center">
                          <span>Drivers</span>
                          <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full text-[9px] font-mono">{matchedDrivers.length}</span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {matchedDrivers.slice(0, 5).map(d => (
                            <button
                              key={d.id}
                              onMouseDown={() => {
                                setActiveTab("drivers");
                                setGlobalSearchQuery(d.name);
                                setShowDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-900 hover:text-white transition flex justify-between items-center cursor-pointer"
                            >
                              <div>
                                <span className="font-bold text-slate-100 block">{d.name}</span>
                                <span className="text-slate-400 block font-mono text-[10px]">{d.licenseNumber} • {d.status}</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trips Section */}
                    {matchedTrips.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900/50 rounded-lg flex justify-between items-center">
                          <span>Trips</span>
                          <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full text-[9px] font-mono">{matchedTrips.length}</span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {matchedTrips.slice(0, 5).map(t => (
                            <button
                              key={t.id}
                              onMouseDown={() => {
                                setActiveTab("trips");
                                setGlobalSearchQuery(t.id);
                                setShowDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-900 hover:text-white transition flex justify-between items-center cursor-pointer"
                            >
                              <div>
                                <span className="font-bold text-slate-100 block">{t.source} → {t.destination}</span>
                                <span className="text-slate-400 block font-mono text-[10px]">ID: {t.id} • Status: {t.status}</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Role Select Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1 hidden lg:inline">{t("persona_switcher")}</span>
          
          <button
            id="role-mgr"
            onClick={() => handleRoleChange(Role.FLEET_MANAGER)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all smooth-hover cursor-pointer ${
              activeRole === Role.FLEET_MANAGER
                ? "bg-blue-600 text-white border-blue-500 shadow-md scale-102"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
            }`}
          >
            💼 {t("role_fleet_manager")}
          </button>

          <button
            id="role-disp"
            onClick={() => handleRoleChange(Role.DISPATCHER)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all smooth-hover cursor-pointer ${
              activeRole === Role.DISPATCHER
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md scale-102"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
            }`}
          >
            🧭 {t("role_dispatcher")}
          </button>

          <button
            id="role-safety"
            onClick={() => handleRoleChange(Role.SAFETY_OFFICER)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all smooth-hover cursor-pointer ${
              activeRole === Role.SAFETY_OFFICER
                ? "bg-violet-600 text-white border-violet-500 shadow-md scale-102"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
            }`}
          >
            🛡️ {t("role_safety_officer")}
          </button>

          <button
            id="role-finance"
            onClick={() => handleRoleChange(Role.FINANCIAL_ANALYST)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all smooth-hover cursor-pointer ${
              activeRole === Role.FINANCIAL_ANALYST
                ? "bg-emerald-600 text-white border-emerald-500 shadow-md scale-102"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
            }`}
          >
            📊 {t("role_financial_analyst")}
          </button>

          {/* Language Switcher */}
          <div className="relative ml-1 flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 select-none">
            <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">🌐</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer hover:text-white transition"
            >
              <option value="en" className="bg-slate-900 text-white">EN</option>
              <option value="ta" className="bg-slate-900 text-white">தமிழ்</option>
              <option value="es" className="bg-slate-900 text-white">ES</option>
            </select>
          </div>

          <button
            onClick={loadData}
            title={t("sync_db")}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 border border-slate-700 rounded-lg transition shrink-0 ml-1 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Main Sidebar & Content Canvas Area */}
      <div className="flex-1 flex">
        {/* Dynamic Sidebar */}
        <aside className={`bg-slate-900 border-r border-slate-800 text-slate-400 w-64 flex flex-col transition-all shrink-0 ${sidebarOpen ? "block" : "hidden md:block"}`}>
            <nav className="flex-1 px-3 py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSearchQuery("");
                    setGlobalSearchQuery("");
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all smooth-hover cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md scale-102 font-bold"
                      : "hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{t("tab_" + item.id)}</span>
                </button>
              );
            })}
          </nav>

          {/* Connected Database Footer in Sidebar */}
          <div className="p-4 border-t border-slate-800 text-xs flex flex-col gap-2 bg-slate-950/20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-300">{t("connected_server")}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              {t("server_details")}
            </p>
          </div>
        </aside>

        {/* Primary Views Stage canvas */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {isLoading && vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 animate-pulse">
              <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-sm font-semibold">{t("syncing_db")}</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto animate-fade-in-up">
              {activeTab === "dashboard" && (
                <DashboardView
                  kpis={kpis}
                  vehicles={vehicles}
                  drivers={drivers}
                  trips={trips}
                  activeRole={activeRole}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === "vehicles" && (
                <VehiclesView
                  vehicles={vehicles}
                  activeRole={activeRole}
                  onAddVehicle={handleAddVehicle}
                  onUpdateVehicle={handleUpdateVehicle}
                  onRetireVehicle={handleRetireVehicle}
                  globalSearchQuery={globalSearchQuery}
                />
              )}

              {activeTab === "drivers" && (
                <DriversView
                  drivers={drivers}
                  activeRole={activeRole}
                  onAddDriver={handleAddDriver}
                  onUpdateDriver={handleUpdateDriver}
                  onSuspendDriver={handleSuspendDriver}
                  globalSearchQuery={globalSearchQuery}
                />
              )}

              {activeTab === "trips" && (
                <TripsView
                  trips={trips}
                  vehicles={vehicles}
                  drivers={drivers}
                  activeRole={activeRole}
                  onAddTrip={handleAddTrip}
                  onDispatchTrip={handleDispatchTrip}
                  onCompleteTrip={handleCompleteTrip}
                  onCancelTrip={handleCancelTrip}
                  globalSearchQuery={globalSearchQuery}
                />
              )}

              {activeTab === "maintenance" && (
                <MaintenanceView
                  maintenanceLogs={maintenanceLogs}
                  vehicles={vehicles}
                  activeRole={activeRole}
                  onOpenMaintenance={handleOpenMaintenance}
                  onCloseMaintenance={handleCloseMaintenance}
                />
              )}

              {activeTab === "fuel-expenses" && (
                <FuelExpensesView
                  fuelLogs={fuelLogs}
                  expenses={expenses}
                  vehicles={vehicles}
                  activeRole={activeRole}
                  onAddFuelLog={handleAddFuelLog}
                  onAddExpense={handleAddExpense}
                />
              )}

              {activeTab === "reports" && (
                <ReportsView
                  analyticsReport={analyticsReport}
                  activeRole={activeRole}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
