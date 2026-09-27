import React, { useState } from "react";
import { useAuth } from "./auth-context";
import { ThemeToggle } from "@/lib/theme";
import { Atom, Shield, User, Lock, ArrowRight, AlertCircle, KeyRound, Sparkles } from "lucide-react";
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
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground selection:bg-primary selection:text-white relative overflow-hidden font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <header className="neu-header px-4 sm:px-8 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl neu-raised flex items-center justify-center p-1">
            <div className="w-full h-full rounded-lg neu-inset flex items-center justify-center">
              <Atom className="w-5 h-5 text-primary animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-foreground tracking-tight flex items-center gap-2">
              Physics MCQ Examination Portal
            </h1>
            <p className="text-xs text-muted-foreground font-mono hidden sm:block">
              Neumorphic Assessment System • Secure & Production Ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono neu-inset-sm px-3 py-1.5 rounded-full text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Strict Role-Based Access</span>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-4 sm:my-8">
        <div className="w-full max-w-md">
          {/* Neumorphic Card Container */}
          <div className="neu-raised-lg rounded-3xl p-6 sm:p-8 relative">
            {/* Soft decorative badge */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Laboratory Portal
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md neu-inset-sm text-primary font-bold">
                v2.0 Neumorphic
              </span>
            </div>

            {/* Recessed Tabs Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl neu-inset mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("student");
                  setStudentError("");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === "student"
                    ? "neu-btn-primary shadow-md"
                    : "text-muted-foreground hover:text-foreground"
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
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === "teacher"
                    ? "neu-btn-emerald shadow-md"
                    : "text-muted-foreground hover:text-foreground"
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
                  <h2 className="text-xl font-bold text-foreground tracking-tight">Student Portal</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the Login ID and password provided by your teacher
                  </p>
                </div>

                {studentError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-2.5 text-xs text-destructive neu-inset-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{studentError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider mb-1.5">
                    Student Login ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground font-mono text-xs font-bold">
                      ID
                    </div>
                    <input
                      type="text"
                      value={studentLoginId}
                      onChange={(e) => setStudentLoginId(e.target.value)}
                      placeholder="e.g. PHY-001"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl neu-inset text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-sm transition-shadow"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl neu-inset text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm font-mono transition-shadow"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={studentLoading}
                  className="w-full mt-3 py-3 px-4 neu-btn-primary font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                >
                  {studentLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Login to Examination Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Demo Credentials helper */}
                <div className="pt-4 border-t border-border/60 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground uppercase mb-2 font-semibold">
                    <KeyRound className="w-3.5 h-3.5 text-primary" />
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
                      className="p-2.5 rounded-xl neu-btn-interactive text-left transition-all cursor-pointer"
                    >
                      <div className="font-mono text-primary font-bold">PHY-001</div>
                      <div className="text-[10px] text-muted-foreground">Muhammad Ali</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentLoginId("PHY-002");
                        setStudentPassword("StudentPass123!");
                        setStudentError("");
                      }}
                      className="p-2.5 rounded-xl neu-btn-interactive text-left transition-all cursor-pointer"
                    >
                      <div className="font-mono text-primary font-bold">PHY-002</div>
                      <div className="text-[10px] text-muted-foreground">Sara Ahmed</div>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Teacher Login Form */}
            {activeTab === "teacher" && (
              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <div className="text-center mb-5">
                  <h2 className="text-xl font-bold text-foreground tracking-tight">Instructor / Admin Portal</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage students, chapters, question bank, and tests
                  </p>
                </div>

                {teacherError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-2.5 text-xs text-destructive neu-inset-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{teacherError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider mb-1.5">
                    Email or Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      placeholder="teacher@physlab.local"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl neu-inset text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm font-mono transition-shadow"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl neu-inset text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm font-mono transition-shadow"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={teacherLoading}
                  className="w-full mt-3 py-3 px-4 neu-btn-emerald font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                >
                  {teacherLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In as Instructor</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Demo Credentials helper */}
                <div className="pt-4 border-t border-border/60 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground uppercase mb-2 font-semibold">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Instructor Credentials (Click to fill)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherEmail("teacher@physlab.local");
                      setTeacherPassword("AdminPass123!");
                      setTeacherError("");
                    }}
                    className="w-full p-2.5 rounded-xl neu-btn-interactive text-left transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-mono text-emerald-500 font-bold">teacher@physlab.local</div>
                      <div className="text-[10px] text-muted-foreground">Prof. Khalid Mehmood</div>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded-md neu-inset-sm">
                      Auto-fill
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Notice */}
          <div className="mt-6 text-center text-xs text-muted-foreground space-y-1">
            <p>Strict Security Policy: Public registration is disabled.</p>
            <p className="font-mono text-[11px]">Physics MCQ Examination Portal • Soft UI Edition</p>
          </div>
        </div>
      </main>

      {/* Subtle Footer Bar */}
      <footer className="neu-header py-3 px-6 text-center text-[11px] text-muted-foreground font-mono">
        All assessment scoring & timers are verified and calculated on the server.
      </footer>
    </div>
  );
}
