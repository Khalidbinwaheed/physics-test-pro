import React, { useState } from "react";
import { useAuth } from "./auth-context";
import { Atom, Shield, User, Lock, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";

interface LoginViewProps {
  onSuccess?: () => void;
}

export function LoginView({ onSuccess }: LoginViewProps) {
  const { loginStudent, loginTeacher } = useAuth();
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");

  // Student form state
  const [studentLoginId, setStudentLoginId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState("");

  // Teacher form state
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherError, setTeacherError] = useState("");

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError("");
    if (!studentLoginId.trim() || !studentPassword.trim()) {
      setStudentError("Please enter both Student Login ID and Password.");
      return;
    }
    setStudentLoading(true);
    try {
      const res = await loginStudent(studentLoginId, studentPassword);
      if (res.success) {
        toast.success("Welcome to Physics Examination Portal");
        onSuccess?.();
      } else {
        setStudentError(res.error || "Invalid Login ID or password.");
      }
    } catch (err: any) {
      setStudentError(err?.message || "Login failed. Please check credentials.");
    } finally {
      setStudentLoading(false);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError("");
    if (!teacherEmail.trim() || !teacherPassword.trim()) {
      setTeacherError("Please enter both email and password.");
      return;
    }
    setTeacherLoading(true);
    try {
      const res = await loginTeacher(teacherEmail, teacherPassword);
      if (res.success) {
        toast.success("Teacher authenticated successfully");
        onSuccess?.();
      } else {
        setTeacherError(res.error || "Invalid credentials.");
      }
    } catch (err: any) {
      setTeacherError(err?.message || "Login failed.");
    } finally {
      setTeacherLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Atom className="w-5 h-5 text-indigo-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
              Physics MCQ Examination Portal
            </h1>
            <p className="text-xs text-slate-400 font-mono">Academic Assessment System • Secure & Production Ready</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-full text-slate-300">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Strict Role-Based Access • Public Registration Disabled</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("student");
                  setStudentError("");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "student"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Student Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("teacher");
                  setTeacherError("");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "teacher"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Teacher / Admin</span>
              </button>
            </div>

            {/* Student Login Form */}
            {activeTab === "student" && (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div className="text-center mb-5">
                  <h2 className="text-xl font-bold text-white tracking-tight">Student Portal</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter the Login ID and password provided by your teacher
                  </p>
                </div>

                {studentError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{studentError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    Student Login ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
                      ID
                    </div>
                    <input
                      type="text"
                      value={studentLoginId}
                      onChange={(e) => setStudentLoginId(e.target.value)}
                      placeholder="e.g. PHY-001"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={studentLoading}
                  className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {studentLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Login to Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Demo Credentials helper */}
                <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 uppercase mb-2">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Quick Demo Credentials (Click to fill)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStudentLoginId("PHY-001");
                        setStudentPassword("StudentPass123!");
                        setStudentError("");
                      }}
                      className="p-2 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left transition-colors"
                    >
                      <div className="font-mono text-indigo-400 font-semibold">PHY-001</div>
                      <div className="text-[10px] text-slate-400">Muhammad Ali</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentLoginId("PHY-002");
                        setStudentPassword("StudentPass123!");
                        setStudentError("");
                      }}
                      className="p-2 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left transition-colors"
                    >
                      <div className="font-mono text-indigo-400 font-semibold">PHY-002</div>
                      <div className="text-[10px] text-slate-400">Sara Ahmed</div>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Teacher Login Form */}
            {activeTab === "teacher" && (
              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <div className="text-center mb-5">
                  <h2 className="text-xl font-bold text-white tracking-tight">Instructor / Admin Portal</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage students, chapters, question bank, and tests
                  </p>
                </div>

                {teacherError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{teacherError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    Email or Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      placeholder="teacher@physlab.local"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={teacherLoading}
                  className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {teacherLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In as Teacher</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Demo Credentials helper */}
                <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 uppercase mb-2">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Instructor Credentials (Click to fill)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherEmail("teacher@physlab.local");
                      setTeacherPassword("AdminPass123!");
                      setTeacherError("");
                    }}
                    className="w-full p-2 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono text-emerald-400 font-semibold">teacher@physlab.local</div>
                      <div className="text-[10px] text-slate-400">Prof. Khalid Mehmood</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      Auto-fill
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Notice */}
          <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
            <p>Strict Security Policy: No public registration is permitted.</p>
            <p className="font-mono text-[11px]">Physics MCQ Examination Portal • Version 2.0</p>
          </div>
        </div>
      </main>

      {/* Subtle Footer Bar */}
      <footer className="border-t border-slate-900 bg-slate-950/60 px-6 py-3 text-center text-[11px] text-slate-600 font-mono">
        All assessment scoring & timers are verified and calculated on the server.
      </footer>
    </div>
  );
}
