import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import LoginView from "./components/LoginView";
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Navigation, 
  Wrench, 
  IndianRupee, 
  BarChart3, 
  ShieldAlert, 
  ShieldCheck, 
  Menu, 
  X,
  ChevronRight,
  User,
  Power,
  RefreshCw,
  Search,
  LogOut,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
import AccessDenied from "./components/AccessDenied";
import TrackingMapView from "./components/TrackingMapView";

export default function App() {
  const { user, token, logout, isLoading: authLoading } = useAuth();
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
  const loadData = async (isSilent = false) => {
    if (!token) return;
    if (!isSilent) setIsLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${token}` };

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
      if (!isSilent) setIsLoading(false);
    }
  };

  // Synchronize database upon role shifts or action completions
  useEffect(() => {
    loadData();
    
    // Polling interval for realtime data
    const intervalId = setInterval(() => {
      loadData(true); // silent fetch
    }, 5000);
    
    // Set default tab based on role when they log in
    if (user) {
      if (user.role === Role.DISPATCHER) {
        setActiveTab("trips");
      } else if (user.role === Role.FINANCIAL_ANALYST) {
        setActiveTab("reports");
      } else {
        setActiveTab("dashboard");
      }
    }

    return () => clearInterval(intervalId);
  }, [user, token]);

  // --- API INTERACTION METHODS ---

  const handleAddVehicle = async (vehiclePayload: any) => {
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
      headers: { "Authorization": `Bearer ${token}` }
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
      headers: { "Authorization": `Bearer ${token}` }
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
      headers: { "Authorization": `Bearer ${token}` }
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(expensePayload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save operational expense.");
    }
    await loadData();
  };

  // --- RENDERING ROUTE NAVIGATION SIDEBAR ---

  const allNavigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "vehicles", label: "Fleet", icon: Truck, roles: [Role.FLEET_MANAGER, Role.DISPATCHER] },
    { id: "drivers", label: "Drivers", icon: Users, roles: [Role.SAFETY_OFFICER, Role.FLEET_MANAGER, Role.DISPATCHER] },
    { id: "trips", label: "Trips", icon: Navigation, roles: [Role.DISPATCHER] },
    { id: "live-tracking", label: "Live Tracking", icon: MapPin, roles: [Role.DISPATCHER, Role.FLEET_MANAGER] },
    { id: "maintenance", label: "Maintenance", icon: Wrench, roles: [Role.FLEET_MANAGER] },
    { id: "fuel-expenses", label: "Fuel & Expenses", icon: IndianRupee, roles: [Role.FINANCIAL_ANALYST, Role.FLEET_MANAGER] },
    { id: "reports", label: "Analytics", icon: BarChart3, roles: [Role.FINANCIAL_ANALYST] }
  ];

  const navigationItems = user 
    ? allNavigationItems.filter(item => !item.roles || item.roles.includes(user.role))
    : [];

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Truck className="w-6 h-6 text-slate-200" />
          </div>
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
          <p className="text-sm text-slate-500 tracking-wider uppercase">Loading TransitOps</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <LoginView />
      </motion.div>
    );
  }

  // Role-specific accent colors
  const roleAccent = {
    [Role.FLEET_MANAGER]: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", dot: "bg-blue-400" },
    [Role.DISPATCHER]: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400" },
    [Role.SAFETY_OFFICER]: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", dot: "bg-amber-400" },
    [Role.FINANCIAL_ANALYST]: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", dot: "bg-purple-400" },
  };
  const accent = roleAccent[user.role] || roleAccent[Role.FLEET_MANAGER];

  return (
    <div className="min-h-screen flex bg-[#111111] text-slate-300 font-sans">
      {/* 1. Sidebar Left */}
      <aside className={`bg-[#0d0d0d] border-r border-slate-800/50 text-slate-400 w-60 flex flex-col transition-all shrink-0 ${sidebarOpen ? "block" : "hidden md:block"}`}>
        <div className="p-5 pb-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              <Truck className="w-4 h-4 text-slate-200" />
            </div>
            <span className="font-semibold text-lg text-slate-200 tracking-tight">TransitOps</span>
          </motion.div>
          <p className="text-[10px] text-slate-600 mt-1 ml-11 tracking-wider uppercase">Fleet Platform</p>
        </div>

        <div className="px-4 py-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${accent.bg} border ${accent.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${accent.dot} animate-pulse`}></span>
            <span className={`text-[10px] font-bold tracking-wider uppercase ${accent.text}`}>{user.role.replace(/_/g, " ")}</span>
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navigationItems.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                id={`nav-${item.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActiveTab(item.id);
                  setSearchQuery("");
                  setGlobalSearchQuery("");
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition cursor-pointer ${
                  isSelected
                    ? "bg-[#1a1a1a]/[0.07] text-slate-200 font-semibold shadow-sm"
                    : "text-slate-500 hover:bg-[#1a1a1a]/[0.04] hover:text-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-blue-400" : ""}`} />
                <span>{item.label}</span>
                {isSelected && <ChevronRight className="w-3 h-3 ml-auto text-slate-600" />}
              </motion.button>
            );
          })}
        </nav>

        {/* Connected indicator */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-slate-500 font-medium">MySQL Connected • Real-time Sync</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area Right */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#0d0d0d] border-b border-slate-800/50 px-6 py-3 flex justify-between items-center z-40"
        >
          
          <div className="relative flex-1 max-w-md" id="global-search-container">
            <Search className="absolute left-3 top-2 w-4 h-4 text-slate-600" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search vehicles, drivers, trips..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="w-full bg-[#1a1a1a]/[0.04] text-slate-100 placeholder-slate-600 text-sm pl-10 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-slate-600 focus:bg-[#1a1a1a]/[0.06] transition"
            />
            
            {showDropdown && searchQuery.trim() !== "" && (() => {
              const query = searchQuery.trim().toLowerCase();
              const matchedVehicles = vehicles.filter(v => v.id.toLowerCase().includes(query) || v.name.toLowerCase().includes(query) || v.registrationNumber.toLowerCase().includes(query));
              const matchedDrivers = drivers.filter(d => d.id.toLowerCase().includes(query) || d.name.toLowerCase().includes(query) || d.licenseNumber.toLowerCase().includes(query));
              const matchedTrips = trips.filter(t => t.id.toLowerCase().includes(query) || t.source.toLowerCase().includes(query) || t.destination.toLowerCase().includes(query));
              const totalMatches = matchedVehicles.length + matchedDrivers.length + matchedTrips.length;

              return (
                <div id="global-search-dropdown" className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-slate-800 rounded-lg shadow-2xl shadow-black/50 max-h-96 overflow-y-auto z-50 p-2 text-left">
                  {totalMatches === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No matches for "{searchQuery}"</div>
                  ) : (
                    <div className="space-y-1">
                      {matchedVehicles.length > 0 && matchedVehicles.slice(0, 3).map(v => (
                        <button key={v.id} onMouseDown={() => { setActiveTab("vehicles"); setGlobalSearchQuery(v.registrationNumber); setShowDropdown(false); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-[#1a1a1a]/[0.06] text-xs flex items-center gap-2"><Truck className="w-3 h-3 text-blue-400" />{v.name} <span className="text-slate-600">({v.registrationNumber})</span></button>
                      ))}
                      {matchedDrivers.length > 0 && matchedDrivers.slice(0, 3).map(d => (
                        <button key={d.id} onMouseDown={() => { setActiveTab("drivers"); setGlobalSearchQuery(d.name); setShowDropdown(false); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-[#1a1a1a]/[0.06] text-xs flex items-center gap-2"><Users className="w-3 h-3 text-emerald-400" />{d.name} <span className="text-slate-600">({d.licenseNumber})</span></button>
                      ))}
                      {matchedTrips.length > 0 && matchedTrips.slice(0, 3).map(t => (
                        <button key={t.id} onMouseDown={() => { setActiveTab("trips"); setGlobalSearchQuery(t.source); setShowDropdown(false); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-[#1a1a1a]/[0.06] text-xs flex items-center gap-2"><Navigation className="w-3 h-3 text-amber-400" />{t.source} → {t.destination}</button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="flex items-center gap-3 ml-6">
            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              onClick={() => loadData()}
              className="p-2 rounded-lg hover:bg-[#1a1a1a]/[0.04] text-slate-500 hover:text-slate-300 transition cursor-pointer"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </motion.button>
            <div className="h-5 w-px bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-slate-200 shadow-md">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <span className="text-xs text-slate-400 font-medium hidden md:block">{user.name}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Logout</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Primary Views Stage canvas */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#111111]">
          {isLoading && vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm">Loading Data...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="max-w-7xl mx-auto"
              >
                {(activeTab === "dashboard" || (!allNavigationItems.some(i => i.id === activeTab))) && (
                  <DashboardView
                    kpis={kpis}
                    vehicles={vehicles}
                    drivers={drivers}
                    trips={trips}
                    activeRole={user.role}
                    onNavigate={setActiveTab}
                  />
                )}

                {allNavigationItems.some(i => i.id === activeTab) && !navigationItems.some(i => i.id === activeTab) && activeTab !== "dashboard" && (
                  <AccessDenied />
                )}

                {activeTab === "vehicles" && (
                  <VehiclesView
                    vehicles={vehicles}
                    activeRole={user.role}
                    onAddVehicle={handleAddVehicle}
                    onUpdateVehicle={handleUpdateVehicle}
                    onRetireVehicle={handleRetireVehicle}
                    globalSearchQuery={globalSearchQuery}
                  />
                )}

                {activeTab === "drivers" && (
                  <DriversView
                    drivers={drivers}
                    activeRole={user.role}
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
                    activeRole={user.role}
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
                    activeRole={user.role}
                    onOpenMaintenance={handleOpenMaintenance}
                    onCloseMaintenance={handleCloseMaintenance}
                  />
                )}

                {activeTab === "fuel-expenses" && (
                  <FuelExpensesView
                    fuelLogs={fuelLogs}
                    expenses={expenses}
                    vehicles={vehicles}
                    activeRole={user.role}
                    onAddFuelLog={handleAddFuelLog}
                    onAddExpense={handleAddExpense}
                  />
                )}

                {activeTab === "reports" && (
                  <ReportsView
                    analyticsReport={analyticsReport}
                    kpis={kpis}
                    activeRole={user.role}
                  />
                )}

                {activeTab === "live-tracking" && (
                  <TrackingMapView
                    vehicles={vehicles}
                    drivers={drivers}
                    trips={trips}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
