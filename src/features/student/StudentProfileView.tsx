import React, { useState } from "react";
import { useAuth } from "../auth/auth-context";
import { ThemeSegmentedControl } from "@/lib/theme";
import { User, KeyRound, Lock, CheckCircle2, AlertCircle, Palette } from "lucide-react";
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
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          <span>Student Profile & Settings</span>
        </h2>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Credential overview, theme appearance, and security
        </p>
      </div>

      {/* Theme & Appearance Section */}
      <div className="p-6 rounded-2xl neu-raised space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-base font-bold text-foreground">Theme & Appearance</h3>
              <p className="text-xs text-muted-foreground">Select your preferred Neumorphic interface mode</p>
            </div>
          </div>
          <ThemeSegmentedControl />
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="p-6 rounded-2xl neu-raised space-y-4">
        <h3 className="text-base font-bold text-foreground tracking-tight pb-3 border-b border-border/60">
          Account Credentials
        </h3>

        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <span className="text-muted-foreground uppercase block text-[11px]">Student Login ID</span>
            <span className="text-base font-bold text-primary">{student.login_id}</span>
          </div>

          <div>
            <span className="text-muted-foreground uppercase block text-[11px]">Full Name</span>
            <span className="text-sm font-semibold text-foreground font-sans">{student.full_name}</span>
          </div>

          <div>
            <span className="text-muted-foreground uppercase block text-[11px]">Class & Section</span>
            <span className="text-sm font-semibold text-foreground font-sans">
              {student.class_name ? `${student.class_name} - Sec ${student.section}` : "Standard"}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground uppercase block text-[11px]">Roll Number</span>
            <span className="text-sm font-semibold text-foreground">{student.roll_number || "—"}</span>
          </div>

          <div>
            <span className="text-muted-foreground uppercase block text-[11px]">Email Address</span>
            <span className="text-xs text-foreground">{student.email || "—"}</span>
          </div>

          <div>
            <span className="text-muted-foreground uppercase block text-[11px]">Account Status</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-500 font-bold uppercase text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {student.status}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="p-6 rounded-2xl neu-raised space-y-4">
        <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2 pb-3 border-b border-border/60">
          <KeyRound className="w-4 h-4 text-primary" />
          <span>Change Password</span>
        </h3>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 text-xs text-destructive neu-inset-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1.5">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 neu-btn-primary rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
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
          className="text-xs font-mono text-destructive hover:underline cursor-pointer"
        >
          Sign Out of Examination Portal
        </button>
      </div>
    </div>
  );
}
