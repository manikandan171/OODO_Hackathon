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
import AccessDenied from "./components/AccessDenied";

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
  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  // Synchronize database upon role shifts or action completions
  useEffect(() => {
    loadData();
    
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
  }, [user]);

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
    { id: "maintenance", label: "Maintenance", icon: Wrench, roles: [Role.FLEET_MANAGER] },
    { id: "fuel-expenses", label: "Fuel & Expenses", icon: IndianRupee, roles: [Role.FINANCIAL_ANALYST, Role.FLEET_MANAGER] },
    { id: "reports", label: "Analytics", icon: BarChart3, roles: [Role.FINANCIAL_ANALYST] },
    { id: "settings", label: "Settings", icon: Truck } // Mockup shows Settings tab, though non-functional for now
  ];

  const navigationItems = user 
    ? allNavigationItems.filter(item => !item.roles || item.roles.includes(user.role))
    : [];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        <RefreshCw className="w-12 h-12 animate-spin mb-4" />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex bg-[#111111] text-slate-300 font-sans">
      {/* 1. Sidebar Left */}
      <aside className={`bg-[#111111] border-r border-slate-800 text-slate-400 w-64 flex flex-col transition-all shrink-0 ${sidebarOpen ? "block" : "hidden md:block"}`}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <span className="font-medium text-xl text-slate-200 tracking-tight" style={{ fontFamily: "cursive, sans-serif" }}>TransitOps</span>
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 px-4 py-2 space-y-1">
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
                className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm transition cursor-pointer ${
                  isSelected
                    ? "border border-amber-600/50 text-amber-500 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {/* No icon in mockup sidebar, keeping text clean */}
                <span className={isSelected ? "font-semibold" : "font-medium"}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 2. Main Content Area Right */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#111111] border-b border-slate-800 p-4 flex justify-between items-center z-40">
          
          <div className="relative flex-1 max-w-sm" id="global-search-container">
            <input
              id="global-search-input"
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="w-full bg-transparent text-slate-100 placeholder-slate-600 text-sm px-4 py-1.5 rounded-md border border-slate-700 focus:outline-none focus:border-slate-500 transition"
            />
            
            {showDropdown && searchQuery.trim() !== "" && (() => {
              const query = searchQuery.trim().toLowerCase();
              const matchedVehicles = vehicles.filter(v => v.id.toLowerCase().includes(query) || v.name.toLowerCase().includes(query) || v.registrationNumber.toLowerCase().includes(query));
              const matchedDrivers = drivers.filter(d => d.id.toLowerCase().includes(query) || d.name.toLowerCase().includes(query) || d.licenseNumber.toLowerCase().includes(query));
              const matchedTrips = trips.filter(t => t.id.toLowerCase().includes(query) || t.source.toLowerCase().includes(query) || t.destination.toLowerCase().includes(query));
              const totalMatches = matchedVehicles.length + matchedDrivers.length + matchedTrips.length;

              return (
                <div id="global-search-dropdown" className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50 p-2 text-left">
                  {totalMatches === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No matches for "{searchQuery}"</div>
                  ) : (
                    <div className="space-y-2">
                      {matchedVehicles.length > 0 && matchedVehicles.slice(0, 3).map(v => (
                        <button key={v.id} onMouseDown={() => { setActiveTab("vehicles"); setGlobalSearchQuery(v.registrationNumber); setShowDropdown(false); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 text-xs">Vehicles: {v.name}</button>
                      ))}
                      {matchedDrivers.length > 0 && matchedDrivers.slice(0, 3).map(d => (
                        <button key={d.id} onMouseDown={() => { setActiveTab("drivers"); setGlobalSearchQuery(d.name); setShowDropdown(false); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 text-xs">Drivers: {d.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 font-medium">{user.name}</span>
            <div className="flex items-center gap-2 border border-slate-700 rounded-full pl-3 pr-1 py-1">
              <span className="text-xs text-slate-400">{user.role.replace("_", " ")}</span>
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
            </div>
            <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 ml-2">Logout</button>
          </div>
        </div>

        {/* Primary Views Stage canvas */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#111111]">
          {isLoading && vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm">Loading Data...</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
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
                  activeRole={user.role}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
