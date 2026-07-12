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
  const { t, language } = useLanguage();

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
      value: kpis.activeVehicles.toString(),
      sub: `Available: ${kpis.availableVehicles}`,
      icon: Truck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100"
    },
    {
      title: t("kpi_vehicles_in_shop"),
      value: kpis.vehiclesInShop.toString(),
      sub: "Downtime active",
      icon: Wrench,
      color: "text-amber-600 bg-amber-50 border-amber-100"
    },
    {
      title: t("kpi_active_trips"),
      value: kpis.activeTrips.toString(),
      sub: `Queued: ${kpis.pendingTrips}`,
      icon: Navigation,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100"
    },
    {
      title: t("kpi_drivers_on_duty"),
      value: kpis.driversOnDuty.toString(),
      sub: "Verified operators",
      icon: UserCheck,
      color: "text-violet-600 bg-violet-50 border-violet-100"
    }
  ];

  // Helper translations for alerts
  const getAlertText = (type: "EXP_TITLE" | "EXP_DESC" | "EXP_BTN" | "SUSP_TITLE" | "SUSP_DESC" | "SUSP_BTN" | "SAFE_TITLE" | "SAFE_DESC" | "ODO_TITLE" | "ODO_DESC" | "ODO_BTN", data?: any) => {
    const isTa = language === "ta";
    const isEs = language === "es";

    switch (type) {
      case "EXP_TITLE":
        return isTa ? "முக்கியமானது: ஓட்டுநர் உரிமம் காலாவதியானது" : isEs ? "Crítico: Licencia de Operador Vencida" : "Critical: Expired Operator License";
      case "EXP_DESC":
        return isTa 
          ? `ஓட்டுநர் ${data.name} காலாவதியான உரிமத்தைப் பயன்படுத்துகிறார் (காலாவதி: ${data.date}). அவர் தற்காலிகமாக பணி செய்ய தடை செய்யப்பட்டுள்ளார்.` 
          : isEs 
            ? `El conductor ${data.name} está utilizando una licencia vencida (Vencimiento: ${data.date}). Está bloqueado del grupo de despacho.` 
            : `Driver ${data.name} is using an expired license (Expired: ${data.date}). They are hard-blocked from dispatch pool.`;
      case "EXP_BTN":
        return isTa ? "உரிமத் தகவல்களைப் புதுப்பிக்கவும் →" : isEs ? "Actualizar Credenciales →" : "Update License Credentials →";
      
      case "SUSP_TITLE":
        return isTa ? "எச்சரிக்கை: ஓட்டுநர் பணி இடைநீக்கம்" : isEs ? "Alerta: Operador Suspendido" : "Alert: Operator Suspended";
      case "SUSP_DESC":
        return isTa 
          ? `ஓட்டுநர் ${data.name} (உரிமம்: ${data.lic}) தற்காலிகமாக பணி இடைநீக்கம் செய்யப்பட்டுள்ளார். இது பயணங்களை முடக்குகிறது.` 
          : isEs 
            ? `El conductor ${data.name} (Licencia: ${data.lic}) está actualmente suspendido por seguridad. Bloquea rutas activas.` 
            : `Driver ${data.name} (License: ${data.lic}) is currently suspended by Safety. Blocks active routing.`;
      case "SUSP_BTN":
        return isTa ? "மீண்டும் பணியில் சேர்க்கவும் →" : isEs ? "Reincorporar Conductor →" : "Reinstate Driver →";

      case "SAFE_TITLE":
        return isTa ? "எச்சரிக்கை: ஆபத்தான பாதுகாப்பு மதிப்பீடு" : isEs ? "Advertencia: Puntaje de Seguridad de Alto Riesgo" : "Warning: High-Risk Safety Score";
      case "SAFE_DESC":
        return isTa 
          ? `ஓட்டுநர் ${data.name} பாதுகாப்பு மதிப்பீடு ${data.score}/100 பெற்றுள்ளார். இவருக்கு இணக்க ஆலோசனை தேவை.` 
          : isEs 
            ? `El conductor ${data.name} tiene un índice de seguridad de ${data.score}/100. Requiere asesoría de cumplimiento.` 
            : `Driver ${data.name} has a safety rating of ${data.score}/100. Requires compliance counseling.`;

      case "ODO_TITLE":
        return isTa ? "அறிவுரை: வாகன பராமரிப்பு சோதனை தேவை" : isEs ? "Asesoría: Odómetro de Control de Mantenimiento" : "Advisory: Maintenance Checkup Odometer";
      case "ODO_DESC":
        return isTa 
          ? `சொத்து ${data.name} (${data.reg}) ${data.odo} கிமீ கடந்துள்ளது. ஆய்வு செய்ய பரிந்துரைக்கப்படுகிறது.` 
          : isEs 
            ? `El vehículo ${data.name} (${data.reg}) ha cruzado los ${data.odo} km. Se aconseja inspección.` 
            : `Fleet vehicle ${data.name} (${data.reg}) has crossed ${data.odo} km. Advise inspection.`;
      case "ODO_BTN":
        return isTa ? "வாகனத்தை பராமரிப்புக்கு அனுப்பவும் →" : isEs ? "Enviar a Taller Ahora →" : "Dispatch to Shop Now →";
      
      default:
        return "";
    }
  };

  // Helper translations for permissions
  const getPermissionLabel = (key: string) => {
    const isTa = language === "ta";
    const isEs = language === "es";

    const mapping: Record<string, {en: string, ta: string, es: string}> = {
      "Enroll Assets": { en: "Enroll Assets", ta: "சொத்துக்களைப் பதிவு செய்தல்", es: "Registrar Activos" },
      "Odometer Completion": { en: "Odometer Completion", ta: "ஓடோமீட்டர் சரிபார்ப்பு", es: "Registro de Odómetro" },
      "Read Registry": { en: "Read Registry", ta: "பதிவேட்டைப் படித்தல்", es: "Leer Registro" },
      "Plan Routes": { en: "Plan Routes", ta: "சரக்கு வழிகள் திட்டமிடல்", es: "Planificar Rutas" },
      "Suspend Operators": { en: "Suspend Operators", ta: "பணி இடைநீக்கம்", es: "Suspender Operadores" },
      "Edit Safety Rating": { en: "Edit Safety Rating", ta: "பாதுகாப்பு திருத்தம்", es: "Editar Calificación" },
      "License Audits": { en: "License Audits", ta: "உரிமத் தணிக்கை", es: "Auditorías de Licencia" },
      "Cost & Fuel Audits": { en: "Cost & Fuel Audits", ta: "செலவு & எரிபொருள் தணிக்கை", es: "Auditorías de Costo" },
      "ROI Reporting": { en: "ROI Reporting", ta: "வருவாய் அறிக்கை", es: "Informes de ROI" },
      "Expense Logs": { en: "Expense Logs", ta: "செலவுப் பதிவுகள்", es: "Registro de Gastos" }
    };

    const record = mapping[key];
    if (!record) return key;
    return isTa ? record.ta : isEs ? record.es : record.en;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("db_overview")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("db_overview_sub")}</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-xs text-xs font-semibold text-slate-500 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>UTC: 2026-07-12</span>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition custom-glow glass-panel smooth-hover">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div className={`p-2 rounded-xl border shrink-0 ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{card.value}</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Double Column Info section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Role and Security permissions */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">{t("active_role")}</h2>
            <p className="text-xs text-slate-400 font-semibold mb-4">Cryptographic token role permissions mapping</p>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Security Context Identity</span>
                <span className="font-bold text-blue-600 text-sm mt-1 block">
                  {activeRole === Role.FLEET_MANAGER && t("role_fleet_manager")}
                  {activeRole === Role.DISPATCHER && t("role_dispatcher")}
                  {activeRole === Role.SAFETY_OFFICER && t("role_safety_officer")}
                  {activeRole === Role.FINANCIAL_ANALYST && t("role_financial_analyst")}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Granted Write Enforcements</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeRole === Role.FLEET_MANAGER && (
                    <>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{getPermissionLabel("Enroll Assets")}</span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{getPermissionLabel("Odometer Completion")}</span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{getPermissionLabel("Read Registry")}</span>
                    </>
                  )}
                  {activeRole === Role.DISPATCHER && (
                    <>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{getPermissionLabel("Plan Routes")}</span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{getPermissionLabel("Odometer Completion")}</span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{getPermissionLabel("Read Registry")}</span>
                    </>
                  )}
                  {activeRole === Role.SAFETY_OFFICER && (
                    <>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">{getPermissionLabel("Suspend Operators")}</span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">{getPermissionLabel("Edit Safety Rating")}</span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">{getPermissionLabel("License Audits")}</span>
                    </>
                  )}
                  {activeRole === Role.FINANCIAL_ANALYST && (
                    <>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{getPermissionLabel("Cost & Fuel Audits")}</span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{getPermissionLabel("ROI Reporting")}</span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{getPermissionLabel("Expense Logs")}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6 text-xs text-slate-400 leading-relaxed font-medium">
            Permissions are enforced at the network protocol layer on both the client dashboard and database transactions.
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
                    <h3 className="text-sm font-semibold text-slate-800">{getAlertText("EXP_TITLE")}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {getAlertText("EXP_DESC", { name: d.name, date: d.licenseExpiryDate })}
                    </p>
                    <button onClick={() => onNavigate("drivers")} className="text-xs font-semibold text-rose-700 hover:underline mt-1.5 inline-block cursor-pointer">
                      {getAlertText("EXP_BTN")}
                    </button>
                  </div>
                </div>
              ))}

              {suspendedDrivers.map((d, idx) => (
                <div key={`susp-${idx}`} className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{getAlertText("SUSP_TITLE")}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {getAlertText("SUSP_DESC", { name: d.name, lic: d.licenseNumber })}
                    </p>
                    {activeRole === Role.SAFETY_OFFICER && (
                      <button onClick={() => onNavigate("drivers")} className="text-xs font-semibold text-slate-600 hover:underline mt-1.5 inline-block cursor-pointer">
                        {getAlertText("SUSP_BTN")}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {lowSafetyDrivers.map((d, idx) => (
                <div key={`saf-${idx}`} className="flex gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{getAlertText("SAFE_TITLE")}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {getAlertText("SAFE_DESC", { name: d.name, score: d.safetyScore })}
                    </p>
                  </div>
                </div>
              ))}

              {highOdoVehicles.map((v, idx) => (
                <div key={`odo-${idx}`} className="flex gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{getAlertText("ODO_TITLE")}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {getAlertText("ODO_DESC", { name: v.name, reg: v.registrationNumber, odo: v.odometerKm.toLocaleString() })}
                    </p>
                    {activeRole === Role.FLEET_MANAGER && (
                      <button onClick={() => onNavigate("maintenance")} className="text-xs font-semibold text-blue-700 hover:underline mt-1.5 inline-block cursor-pointer">
                        {getAlertText("ODO_BTN")}
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
