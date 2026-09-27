import React from "react";
import { useAuth } from "@/features/auth/auth-context";
import {
  Atom,
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  HelpCircle,
  FileText,
  Send,
  Award,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface TeacherLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export function TeacherLayout({ currentTab, onSelectTab, children }: TeacherLayoutProps) {
  const { teacher, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users },
    { id: "classes", label: "Classes", icon: School },
    { id: "chapters", label: "Chapters & Topics", icon: BookOpen },
    { id: "mcqs", label: "Question Bank", icon: HelpCircle },
    { id: "tests", label: "Test Builder", icon: FileText },
    { id: "assignments", label: "Assignments", icon: Send },
    { id: "results", label: "Assessment Results", icon: Award },
    { id: "audit", label: "Audit Logs", icon: ShieldCheck },
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
              Instructor / Administrative Workspace
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-white">{teacher?.full_name || "Instructor"}</span>
            <span className="text-[10px] font-mono text-emerald-400">Teacher / Administrator</span>
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
        {/* Sidebar for Desktop & Mobile Overlay */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-slate-900/95 border-r border-slate-800 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0 top-14" : "-translate-x-full"
          }`}
        >
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
              Management Modules
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
            <div className="text-indigo-400 font-semibold uppercase text-[10px]">Physics Lab Status</div>
            <div>Database: Connected</div>
            <div>KaTeX: Ready</div>
          </div>
        </aside>

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
