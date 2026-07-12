import React from "react";
import { 
  Truck, 
  CheckCircle, 
  Wrench, 
  Navigation, 
  FileText, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Calendar,
  UserCheck,
  ShieldAlert
} from "lucide-react";
import { Role, DashboardKPIs, Vehicle, Driver, Trip } from "../types";
import { useLanguage } from "../LanguageContext";

interface DashboardViewProps {
  kpis: DashboardKPIs;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  activeRole: Role;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({
  kpis,
  vehicles,
  drivers,
  trips,
  activeRole,
  onNavigate
}: DashboardViewProps) {
  const { t } = useLanguage();

  // Analyze alerts
  const expiredDrivers = drivers.filter(d => new Date(d.licenseExpiryDate) < new Date());
  const lowSafetyDrivers = drivers.filter(d => d.safetyScore < 75);
  const suspendedDrivers = drivers.filter(d => d.status === "SUSPENDED");
  const highOdoVehicles = vehicles.filter(v => v.odometerKm > 50000 && v.status !== "RETIRED");

  const cards = [
    {
      title: t("kpi_fleet_utilization"),
      value: `${kpis.fleetUtilizationPercent}%`,
      sub: t("trip_status_dispatched"),
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50 border-blue-100"
    },
    {
      title: t("kpi_active_vehicles"),
      value: kpis.activeVehicles,
      sub: `${t("veh_status_available")}: ${kpis.availableVehicles}`,
      icon: Truck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100"
    },
    {
      title: t("kpi_vehicles_in_shop"),
      value: kpis.vehiclesInShop,
      sub: t("veh_status_inshop"),
      icon: Wrench,
      color: "text-amber-600 bg-amber-50 border-amber-100"
    },
    {
      title: t("kpi_active_trips"),
      value: kpis.activeTrips,
      sub: `${t("trip_status_draft")}: ${kpis.pendingTrips}`,
      icon: Navigation,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100"
    },
    {
      title: t("kpi_drivers_on_duty"),
      value: kpis.driversOnDuty,
      sub: t("drv_status_available"),
      icon: Users,
      color: "text-violet-600 bg-violet-50 border-violet-100"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 custom-glow">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("db_overview")}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("db_overview_sub")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>UTC: {new Date().toISOString().split("T")[0]}</span>
        </div>
      </div>

      {/* KPI Cards Grid - Frosted Glass panel design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-panel rounded-xl p-5 flex flex-col justify-between transition-all hover:border-slate-300 hover:-translate-y-0.5 shadow-xs smooth-hover">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{card.title}</span>
                <div className={`p-2 rounded-lg border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">{card.value}</span>
                <p className="text-xs text-slate-400 mt-1 font-semibold">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Workflows</h2>
          <div className="space-y-2.5">
            {activeRole === Role.FLEET_MANAGER && (
              <>
                <button
                  id="qa-new-vehicle"
                  onClick={() => onNavigate("vehicles")}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-blue-50/40 text-left text-sm font-semibold text-slate-700 hover:text-blue-700 transition smooth-hover cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-500" /> {t("veh_enroll_btn")}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">→</span>
                </button>
                <button
                  id="qa-new-maint"
                  onClick={() => onNavigate("maintenance")}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-amber-100 hover:bg-amber-50/40 text-left text-sm font-semibold text-slate-700 hover:text-amber-700 transition smooth-hover cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-500" /> {t("maint_add_btn")}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">→</span>
                </button>
              </>
            )}

            {activeRole === Role.DISPATCHER && (
              <>
                <button
                  id="qa-new-trip"
                  onClick={() => onNavigate("trips")}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50 text-left text-sm font-semibold text-indigo-800 transition smooth-hover cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-indigo-600" /> {t("trip_add_btn")}
                  </span>
                  <span className="text-xs text-indigo-400 font-mono">→</span>
                </button>
                <button
                  id="qa-view-active-trips"
                  onClick={() => onNavigate("trips")}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-left text-sm font-semibold text-slate-700 transition smooth-hover cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-slate-500" /> {t("tab_trips")}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">→</span>
                </button>
              </>
            )}

            {activeRole === Role.SAFETY_OFFICER && (
              <>
                <button
                  id="qa-audit-drivers"
                  onClick={() => onNavigate("drivers")}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-violet-100 hover:bg-violet-50/40 text-left text-sm font-semibold text-slate-700 hover:text-violet-700 transition smooth-hover cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-violet-500" /> {t("tab_drivers")}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">→</span>
                </button>
                <button
                  id="qa-manage-credentials"
                  onClick={() => onNavigate("drivers")}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-rose-100 hover:bg-rose-50/40 text-left text-sm font-semibold text-slate-700 hover:text-rose-700 transition smooth-hover cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500" /> {t("drv_license_expiry")}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">→</span>
                </button>
              </>
            )}

            {activeRole === Role.FINANCIAL_ANALYST && (
              <>
                <button
                  id="qa-view-reports"
                  onClick={() => onNavigate("reports")}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-violet-100 bg-violet-50/40 hover:bg-violet-50 text-left text-sm font-semibold text-violet-800 transition smooth-hover cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-violet-600" /> {t("tab_reports")}
                  </span>
                  <span className="text-xs text-violet-400 font-mono">→</span>
                </button>
                <button
                  id="qa-new-expense"
                  onClick={() => onNavigate("fuel-expenses")}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/40 text-left text-sm font-semibold text-slate-700 hover:text-emerald-700 transition smooth-hover cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> {t("acc_log_expense_btn")}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">→</span>
                </button>
              </>
            )}

            {/* General Actions available for all */}
            <button
              id="qa-view-all-trips"
              onClick={() => onNavigate("trips")}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-left text-sm font-semibold text-slate-700 transition smooth-hover cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-slate-400" /> {t("tab_trips")}
              </span>
              <span className="text-xs text-slate-400 font-mono">→</span>
            </button>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">My Permissions</h3>
            <div className="flex flex-wrap gap-1.5">
              {activeRole === Role.FLEET_MANAGER && (
                <>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">Vehicle CRUD</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">Maintenance Write</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">Driver Write</span>
                </>
              )}
              {activeRole === Role.DISPATCHER && (
                <>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">Trip Dispatch</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">Odometer Completion</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">Read Registry</span>
                </>
              )}
              {activeRole === Role.SAFETY_OFFICER && (
                <>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">Suspend Operators</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">Edit Safety Rating</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">License Audits</span>
                </>
              )}
              {activeRole === Role.FINANCIAL_ANALYST && (
                <>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Cost & Fuel Audits</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">ROI Reporting</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Expense Logs</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Incident & Alerts Control Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">{t("db_recent_alerts")}</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                {expiredDrivers.length + lowSafetyDrivers.length + suspendedDrivers.length + highOdoVehicles.length} Flagged Issues
              </span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {expiredDrivers.map((d, idx) => (
                <div key={`exp-${idx}`} className="flex gap-3 p-3 bg-rose-50/50 border border-rose-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Critical: Expired Operator License</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Driver <span className="font-semibold text-slate-800">{d.name}</span> is using an expired license (Expired: {d.licenseExpiryDate}). They are hard-blocked from dispatch pool.
                    </p>
                    <button onClick={() => onNavigate("drivers")} className="text-xs font-semibold text-rose-700 hover:underline mt-1.5 inline-block cursor-pointer">
                      Update License Credentials →
                    </button>
                  </div>
                </div>
              ))}

              {suspendedDrivers.map((d, idx) => (
                <div key={`susp-${idx}`} className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Alert: Operator Suspended</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Driver <span className="font-semibold text-slate-800">{d.name}</span> (License: {d.licenseNumber}) is currently suspended by Safety. Blocks active routing.
                    </p>
                    {activeRole === Role.SAFETY_OFFICER && (
                      <button onClick={() => onNavigate("drivers")} className="text-xs font-semibold text-slate-600 hover:underline mt-1.5 inline-block cursor-pointer">
                        Reinstate Driver →
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {lowSafetyDrivers.map((d, idx) => (
                <div key={`saf-${idx}`} className="flex gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Warning: High-Risk Safety Score</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Driver <span className="font-semibold text-slate-800">{d.name}</span> has a safety rating of <span className="font-semibold text-amber-700">{d.safetyScore}/100</span>. Requires compliance counseling.
                    </p>
                  </div>
                </div>
              ))}

              {highOdoVehicles.map((v, idx) => (
                <div key={`odo-${idx}`} className="flex gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Advisory: Maintenance Checkup Odometer</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fleet vehicle <span className="font-semibold text-slate-800">{v.name}</span> ({v.registrationNumber}) has crossed <span className="font-semibold text-slate-800">{v.odometerKm.toLocaleString()} km</span>. Advise inspection.
                    </p>
                    {activeRole === Role.FLEET_MANAGER && (
                      <button onClick={() => onNavigate("maintenance")} className="text-xs font-semibold text-blue-700 hover:underline mt-1.5 inline-block cursor-pointer">
                        Dispatch to Shop Now →
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {expiredDrivers.length === 0 && lowSafetyDrivers.length === 0 && suspendedDrivers.length === 0 && highOdoVehicles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mb-2" />
                  <p className="text-sm font-semibold">All systems normal. 100% compliant.</p>
                  <p className="text-xs text-slate-400 mt-1">Zero immediate compliance alerts flagged.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 p-5 rounded-b-xl flex justify-between items-center text-xs text-slate-500">
            <span>Fleet database synced locally: <span className="font-mono text-slate-700 font-medium">db.json</span></span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Live Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}
