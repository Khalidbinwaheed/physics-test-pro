import React from "react";
import { useAuth } from "@/features/auth/auth-context";
import {
  Atom,
  LayoutDashboard,
  FileText,
  Award,
  User,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface StudentLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export function StudentLayout({ currentTab, onSelectTab, children }: StudentLayoutProps) {
  const { student, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tests", label: "My Examinations", icon: FileText },
    { id: "results", label: "Assessment Results", icon: Award },
    { id: "profile", label: "Profile & Password", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 flex items-center justify-center shadow shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Atom className="w-4 h-4 text-indigo-400" />
            </div>
          </div>

          <div>
            <h1 className="font-bold text-sm sm:text-base text-white tracking-tight">
              Physics MCQ Portal
            </h1>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              Student Examination Interface
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right font-mono">
            <span className="text-xs font-semibold text-white font-sans">{student?.full_name}</span>
            <span className="text-[11px] text-indigo-400 font-bold">{student?.login_id}</span>
          </div>

          <div className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-slate-900/95 border-r border-slate-800 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0 top-14" : "-translate-x-full"
          }`}
        >
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
              Student Portal
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-emerald-400 font-semibold uppercase text-[10px]">Session Security</div>
            <div>Auth: Verified</div>
            <div>Timer: Authoritative</div>
          </div>
        </aside>

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
