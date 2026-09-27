import React from "react";
import { useAuth } from "@/features/auth/auth-context";
import { ThemeToggle } from "@/lib/theme";
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
    { id: "profile", label: "Profile & Settings", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 neu-header backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground neu-btn rounded-xl"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-10 h-10 rounded-xl neu-raised flex items-center justify-center p-1">
            <div className="w-full h-full rounded-lg neu-inset flex items-center justify-center">
              <Atom className="w-5 h-5 text-primary animate-pulse" />
            </div>
          </div>

          <div>
            <h1 className="font-bold text-sm sm:text-base text-foreground tracking-tight flex items-center gap-2">
              Physics MCQ Portal
            </h1>
            <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
              Student Examination Interface
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Neumorphic Theme Switcher */}
          <ThemeToggle />

          <div className="hidden sm:flex flex-col text-right font-mono">
            <span className="text-xs font-semibold text-foreground font-sans">{student?.full_name}</span>
            <span className="text-[11px] text-primary font-bold">{student?.login_id}</span>
          </div>

          <div className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase neu-raised-sm text-emerald-500 font-bold border border-emerald-500/30">
            Active
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 text-muted-foreground hover:text-destructive neu-btn-interactive rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-card border-r border-border p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 neu-raised md:shadow-none ${
            mobileMenuOpen ? "translate-x-0 top-14" : "-translate-x-full"
          }`}
        >
          <div className="space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-mono uppercase text-muted-foreground font-semibold tracking-wider">
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "neu-btn-primary text-white font-semibold"
                      : "text-muted-foreground hover:text-foreground neu-btn-interactive"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-primary"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl neu-inset text-[11px] font-mono text-muted-foreground space-y-1 mt-4">
            <div className="text-emerald-500 font-semibold uppercase text-[10px]">Session Security</div>
            <div className="flex items-center justify-between">
              <span>Authentication:</span>
              <span className="text-emerald-500 font-semibold">Verified</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Exam Engine:</span>
              <span className="text-primary font-semibold">Ready</span>
            </div>
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
