import React, { useState } from "react";
import { Plus, Fuel, DollarSign, Calendar, FileText, Filter, AlertTriangle, Truck, Tag, Navigation, Bookmark } from "lucide-react";
import { Role, FuelLog, Expense, Vehicle } from "../types";
import { useLanguage } from "../LanguageContext";

interface FuelExpensesViewProps {
  fuelLogs: FuelLog[];
  expenses: Expense[];
  vehicles: Vehicle[];
  activeRole: Role;
  onAddFuelLog: (fuel: any) => Promise<void>;
  onAddExpense: (expense: any) => Promise<void>;
}

export default function FuelExpensesView({
  fuelLogs,
  expenses,
  vehicles,
  activeRole,
  onAddFuelLog,
  onAddExpense
}: FuelExpensesViewProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"FUEL" | "EXPENSE">("FUEL");
  const [error, setError] = useState<string | null>(null);

  // Manual Fuel Form state
  const [fuelVehicleId, setFuelVehicleId] = useState("");
  const [fuelLiters, setFuelLiters] = useState("40");
  const [fuelCost, setFuelCost] = useState("85");

  const [isScanning, setIsScanning] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState<string | null>(null);

  const handleReceiptScan = (e: any) => {
    e.preventDefault();
    setIsScanning(true);
    setOcrSuccess(null);

    setTimeout(() => {
      const randomLiters = Math.floor(Math.random() * 30) + 30; // 30 to 60 liters
      const randomCost = Math.floor(randomLiters * 2.25);
      
      setFuelLiters(randomLiters.toString());
      setFuelCost(randomCost.toString());
      
      setIsScanning(false);
      setOcrSuccess(`Parsed receipt successfully: Auto-filled ${randomLiters} Liters and $${randomCost}.`);
    }, 1800);
  };

  // Manual Expense Form state
  const [expVehicleId, setExpVehicleId] = useState("");
  const [expCategory, setExpCategory] = useState<"TOLL" | "MISC" | "MAINTENANCE" | "FUEL" | "OTHER">("TOLL");
  const [expAmount, setExpAmount] = useState("15");
  const [expDesc, setExpDesc] = useState("");

  const isFinancialOrManager = activeRole === Role.FLEET_MANAGER || activeRole === Role.FINANCIAL_ANALYST;

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fuelVehicleId || !fuelLiters || !fuelCost) {
      setError("Please fill out all fuel log entries.");
      return;
    }

    try {
      await onAddFuelLog({
        vehicleId: fuelVehicleId,
        liters: Number(fuelLiters),
        cost: Number(fuelCost)
      });
      // Reset
      setFuelLiters("40");
      setFuelCost("85");
      alert("Manual fuel log recorded successfully (Side effect: recorded matching financial expense too).");
    } catch (err: any) {
      setError(err.message || "Failed to log fuel transaction.");
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!expCategory || !expAmount) {
      setError("Expense category and amount are required.");
      return;
    }

    try {
      await onAddExpense({
        vehicleId: expVehicleId || null,
        tripId: null,
        category: expCategory,
        amount: Number(expAmount),
        description: expDesc || null
      });
      // Reset
      setExpAmount("15");
      setExpDesc("");
      alert("General operational expense log saved successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to log expense ledger entry.");
    }
  };

  // Seed default vehicle selection if empty
  React.useEffect(() => {
    if (vehicles.length > 0) {
      if (!fuelVehicleId) setFuelVehicleId(vehicles[0].id);
      if (!expVehicleId) setExpVehicleId(vehicles[0].id);
    }
  }, [vehicles]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("acc_title")}</h1>
        <p className="text-sm text-slate-500 mt-1">{t("acc_subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1.5">
        <button
          onClick={() => { setActiveTab("FUEL"); setError(null); }}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === "FUEL" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          ⛽ {t("acc_fuel_journal")} ({fuelLogs.length})
        </button>
        <button
          onClick={() => { setActiveTab("EXPENSE"); setError(null); }}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === "EXPENSE" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          💵 {t("acc_expense_journal")} ({expenses.length})
        </button>
      </div>

      {/* Grid Layout: Form on Left (if allowed), Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Forms on Left */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs h-fit">
          <div className="flex items-center gap-2 mb-4">
            {activeTab === "FUEL" ? (
              <>
                <Fuel className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">{t("acc_modal_fuel")}</h2>
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">{t("acc_modal_expense")}</h2>
              </>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex gap-2 text-rose-600 text-xs font-semibold mb-4">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isFinancialOrManager ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
              <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Financial Write Restricted</p>
              <p className="mt-1">
                Your current role is restricted. Only Fleet Managers or Financial Analysts can edit accounting journals.
              </p>
            </div>
          ) : activeTab === "FUEL" ? (
            <div className="space-y-4">
              {/* Drag and drop receipt dropzone */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleReceiptScan}
                className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/50 transition cursor-pointer overflow-hidden group"
              >
                {isScanning ? (
                  <div className="py-4 space-y-3">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-600 animate-pulse">Running OCR Scanner...</p>
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-md shadow-green-500 animate-bounce" style={{ animationDuration: "1.5s" }} />
                  </div>
                ) : (
                  <label className="cursor-pointer block py-2">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      className="hidden" 
                      onChange={handleReceiptScan}
                    />
                    <div className="text-slate-400 group-hover:text-blue-500 transition text-2xl mb-1">📸</div>
                    <p className="text-xs font-bold text-slate-700">Drag receipt here or click to browse</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mock OCR automatically extracts Liters and Cost</p>
                  </label>
                )}
              </div>

              {ocrSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg animate-fade-in-up">
                  ✓ {ocrSuccess}
                </div>
              )}

              <form onSubmit={handleFuelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("acc_label_select_veh")}</label>
                <select
                  id="fuel-select-vehicle"
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} — {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("acc_liters")}</label>
                  <input
                    id="fuel-input-liters"
                    type="number"
                    required
                    min="1"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("acc_amount")}</label>
                  <input
                    id="fuel-input-cost"
                    type="number"
                    required
                    min="1"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <button
                id="submit-fuel-btn"
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-xs smooth-hover cursor-pointer"
              >
                {t("acc_log_fuel_btn")}
              </button>
            </form>
            </div>
          ) : (
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("acc_label_select_veh")}</label>
                <select
                  id="expense-select-vehicle"
                  value={expVehicleId}
                  onChange={(e) => setExpVehicleId(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="">No specific asset</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} — {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("acc_category")}</label>
                  <select
                    id="expense-select-cat"
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                  >
                    <option value="TOLL">Toll Fee</option>
                    <option value="MISC">Miscellaneous</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("acc_label_amount")}</label>
                  <input
                    id="expense-input-amount"
                    type="number"
                    required
                    min="1"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Expense Memo / Description</label>
                <input
                  id="expense-input-desc"
                  type="text"
                  placeholder="e.g. Clean air filters, bridge toll fee..."
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <button
                id="submit-expense-btn"
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-xs smooth-hover cursor-pointer"
              >
                {t("acc_log_expense_btn")}
              </button>
            </form>
          )}
        </div>

        {/* Ledger Lists on Right */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
          {activeTab === "FUEL" ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">{t("veh_details")}</th>
                    <th className="px-6 py-4">{t("acc_liters")}</th>
                    <th className="px-6 py-4">{t("acc_amount")}</th>
                    <th className="px-6 py-4">Trip Link</th>
                    <th className="px-6 py-4">{t("acc_date")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {fuelLogs.map((log) => {
                    const vehicle = vehicles.find(v => v.id === log.vehicleId);

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-slate-900 block">{vehicle?.registrationNumber || "Asset Log"}</span>
                          <span className="text-xs text-slate-400 block mt-0.5">{vehicle?.name || "Manual Log"}</span>
                        </td>
                        <td className="px-6 py-4 font-mono whitespace-nowrap">{log.liters} L</td>
                        <td className="px-6 py-4 font-mono whitespace-nowrap text-blue-600 font-bold">${log.cost}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.tripId ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-sm uppercase font-mono">
                              Trip #{log.tripId}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic font-normal">Manual Log Entry</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                          {new Date(log.date).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}

                  {fuelLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        <Fuel className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                        <p className="text-sm font-semibold">Fuel refill records empty.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">{t("acc_expense_journal")}</th>
                    <th className="px-6 py-4">{t("acc_category")}</th>
                    <th className="px-6 py-4">{t("acc_amount")}</th>
                    <th className="px-6 py-4">Linked Route</th>
                    <th className="px-6 py-4">{t("acc_date")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {expenses.map((exp) => {
                    const vehicle = vehicles.find(v => v.id === exp.vehicleId);

                    return (
                      <tr key={exp.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">
                            {exp.description || "General Fleet Charge"}
                          </span>
                          <span className="text-xs text-slate-400 block mt-0.5">
                            {vehicle ? `Vehicle: ${vehicle.registrationNumber}` : "General Logistics Operations"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200 uppercase font-mono">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono whitespace-nowrap text-emerald-700 font-bold">${exp.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {exp.tripId ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-sm uppercase font-mono">
                              Trip #{exp.tripId}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic font-normal font-sans">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                          {new Date(exp.date).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}

                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        <DollarSign className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                        <p className="text-sm font-semibold">General operational expense ledger empty.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
