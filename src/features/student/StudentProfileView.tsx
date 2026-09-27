import React, { useState } from "react";
import { useAuth } from "../auth/auth-context";
import { User, KeyRound, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function StudentProfileView() {
  const { student, changePassword, logout } = useAuth();
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!student) return null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPass.trim() || newPass.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPass !== confirmPass) {
      setError("New password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(currentPass, newPass);
      if (res.success) {
        toast.success("Password changed successfully!");
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        setError(res.error || "Failed to update password.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-400" />
          <span>Student Profile & Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Credential overview and password management
        </p>
      </div>

      {/* Profile Details Card */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight pb-3 border-b border-slate-800">
          Account Credentials
        </h3>

        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <span className="text-slate-500 uppercase block">Student Login ID</span>
            <span className="text-base font-bold text-indigo-400">{student.login_id}</span>
          </div>

          <div>
            <span className="text-slate-500 uppercase block">Full Name</span>
            <span className="text-sm font-semibold text-white font-sans">{student.full_name}</span>
          </div>

          <div>
            <span className="text-slate-500 uppercase block">Class & Section</span>
            <span className="text-sm font-semibold text-white font-sans">
              {student.class_name ? `${student.class_name} - Sec ${student.section}` : "Standard"}
            </span>
          </div>

          <div>
            <span className="text-slate-500 uppercase block">Roll Number</span>
            <span className="text-sm font-semibold text-white">{student.roll_number || "—"}</span>
          </div>

          <div>
            <span className="text-slate-500 uppercase block">Email Address</span>
            <span className="text-xs text-slate-300">{student.email || "—"}</span>
          </div>

          <div>
            <span className="text-slate-500 uppercase block">Account Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold uppercase text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {student.status}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 pb-3 border-b border-slate-800">
          <KeyRound className="w-4 h-4 text-indigo-400" />
          <span>Change Password</span>
        </h3>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="pt-2 text-center">
        <button
          onClick={logout}
          className="text-xs font-mono text-red-400 hover:text-red-300 hover:underline"
        >
          Sign Out of Examination Portal
        </button>
      </div>
    </div>
  );
}
