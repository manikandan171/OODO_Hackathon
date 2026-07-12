import React, { useState } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const { login } = useAuth();

  const isLocked = failedAttempts >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        if (newAttempts >= 5) {
          throw new Error("Invalid credentials.\nAccount locked after 5 failed attempts.");
        } else {
          throw new Error(data.error || "Invalid credentials.");
        }
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Pane - Light Theme */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#cbd5e1] p-12 flex-col justify-between relative">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-600 rounded grid grid-cols-4 grid-rows-4 gap-0.5 p-1 shadow-sm">
               {/* Pattern for logo */}
               {Array.from({ length: 16 }).map((_, i) => (
                 <div key={i} className="bg-amber-400/50 rounded-sm" />
               ))}
            </div>
            <h1 className="text-3xl font-medium text-slate-800 tracking-tight">TransitOps</h1>
          </div>
          <p className="text-slate-500 text-sm tracking-wide ml-[52px]">Smart Transport Operations Platform</p>
        </div>

        <div className="space-y-4 text-slate-700 ml-2">
          <h2 className="text-lg font-medium mb-4">One login, four roles:</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>Fleet Manager</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>Dispatcher</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>Safety Officer</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>Financial Analyst</span>
            </li>
          </ul>
        </div>

        <div className="text-xs text-slate-400 uppercase tracking-widest font-medium ml-2">
          TRANSITOPS © 2026 - RBAC ENABLED
        </div>
      </div>

      {/* Right Pane - Dark Theme */}
      <div className="w-full lg:w-1/2 bg-[#111111] text-slate-200 flex flex-col justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-medium text-white mb-2" style={{ fontFamily: "cursive, sans-serif" }}>Sign in to your account</h2>
            <p className="text-slate-400 text-sm">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={isLocked}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1a1a] text-slate-300 px-4 py-3 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-600 transition text-sm"
                placeholder="ravenk@transitops.in"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                disabled={isLocked}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] text-slate-300 px-4 py-3 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-600 transition text-sm tracking-widest"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2" htmlFor="role">
                Role (RBAC)
              </label>
              <div className="relative">
                <select
                  id="role"
                  disabled={isLocked}
                  className="w-full bg-[#1a1a1a] text-slate-300 px-4 py-3 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-600 transition appearance-none text-sm cursor-pointer"
                >
                  <option>Dispatcher</option>
                  <option>Fleet Manager</option>
                  <option>Safety Officer</option>
                  <option>Financial Analyst</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-3.5 pointer-events-none" />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm flex flex-col gap-1 border border-red-500/30 border-dashed rounded-xl p-4 bg-[#1a0f14] relative right-0 lg:-right-32 w-full lg:w-[calc(100%+8rem)] lg:absolute lg:top-1/2 lg:-translate-y-1/2 mt-4 lg:mt-0 shadow-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="font-semibold text-xs uppercase tracking-wider mb-1">Error state</p>
                </div>
                {error.split('\n').map((line, i) => (
                  <p key={i} className="text-sm ml-6">{line}</p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-[#1a1a1a] text-amber-600 focus:ring-amber-600 focus:ring-offset-slate-900" />
                <span className="text-sm text-slate-300">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-500 hover:text-blue-400 transition">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className={`w-full py-3 rounded-lg font-medium text-white transition mt-4 ${
                loading || isLocked ? "bg-amber-700/50 cursor-not-allowed text-white/50" : "bg-amber-600 hover:bg-amber-500"
              }`}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="mt-10 space-y-1 pt-6 border-t border-slate-800/50">
            <p className="text-xs text-slate-500 mb-3">Access is scoped by role after login:</p>
            <ul className="text-xs text-slate-400 space-y-1.5 ml-1">
              <li>• Fleet Manager → Fleet, Maintenance</li>
              <li>• Dispatcher → Dashboard, Trips</li>
              <li>• Safety Officer → Drivers, Compliance</li>
              <li>• Financial Analyst → Fuel & Expenses, Analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
