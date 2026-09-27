import React from "react";
import { portalStorage } from "@/lib/portal-storage";
import {
  Users,
  BookOpen,
  HelpCircle,
  FileText,
  Award,
  TrendingUp,
  Activity,
  Plus,
  Send,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Atom,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface TeacherDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export function TeacherDashboard({ onNavigateTab }: TeacherDashboardProps) {
  const analytics = portalStorage.getTeacherAnalytics();
  const auditLogs = portalStorage.getAuditLogs().slice(0, 6);

  const stats = [
    {
      title: "Total Students",
      value: analytics.totalStudents,
      sub: `${analytics.activeStudents} active accounts`,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Question Bank",
      value: analytics.totalMCQs,
      sub: `${analytics.totalChapters} chapters covered`,
      icon: HelpCircle,
      color: "text-emerald-500",
    },
    {
      title: "Active Tests",
      value: analytics.activeTests,
      sub: "Available for students",
      icon: FileText,
      color: "text-amber-500",
    },
    {
      title: "Completed Attempts",
      value: analytics.completedAttempts,
      sub: `Avg score: ${analytics.avgScore}%`,
      icon: Award,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="p-6 rounded-3xl neu-raised flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-primary font-bold tracking-wider flex items-center gap-1.5">
            <Atom className="w-4 h-4 animate-spin-slow" />
            Instructor Control Center
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">Physics Examination Portal</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Authoritative examination engine with KaTeX mathematical formulas, server timers, and immutable snapshot grading.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigateTab("students")}
            className="flex items-center gap-1.5 px-4 py-2.5 neu-btn-primary rounded-xl text-xs font-semibold cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
          <button
            onClick={() => onNavigateTab("mcqs")}
            className="flex items-center gap-1.5 px-4 py-2.5 neu-btn text-foreground rounded-xl text-xs font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span>Add MCQ</span>
          </button>
          <button
            onClick={() => onNavigateTab("tests")}
            className="flex items-center gap-1.5 px-4 py-2.5 neu-btn text-foreground rounded-xl text-xs font-medium cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>Build Test</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl neu-raised relative overflow-hidden transition-all hover:neu-raised-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-muted-foreground font-semibold">{s.title}</span>
                <div className={`p-2.5 rounded-xl neu-inset ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-foreground tracking-tight font-mono">{s.value}</span>
                <span className="block text-xs text-muted-foreground mt-1 font-medium">{s.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chapter Performance Bar Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl neu-raised space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Chapter Mastery & Average Scores</span>
              </h3>
              <p className="text-xs text-muted-foreground">Mean student assessment scores grouped by chapter</p>
            </div>
            <span className="text-xs font-mono text-emerald-500 neu-inset-sm px-2.5 py-1 rounded-lg font-bold">
              Pass Rate: {analytics.passRate}%
            </span>
          </div>

          {analytics.chapterPerformance.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center neu-inset rounded-2xl p-6 text-center text-muted-foreground">
              <TrendingUp className="w-8 h-8 opacity-40 mb-2 text-primary" />
              <p className="text-sm font-semibold text-foreground">No Chapter Assessment Data Yet</p>
              <p className="text-xs max-w-sm mt-1">Once students complete tests, real chapter-by-chapter mastery analytics and distributions will automatically display here.</p>
            </div>
          ) : (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.chapterPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="chapter"
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={11}
                    domain={[0, 100]}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--neu-surface)",
                      borderColor: "var(--neu-border)",
                      boxShadow: "6px 6px 16px var(--neu-shadow-dark), -6px -6px 16px var(--neu-shadow-light)",
                      borderRadius: "16px",
                      color: "var(--foreground)",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`${val}%`, "Average Score"]}
                  />
                  <Bar dataKey="average" radius={[8, 8, 0, 0]}>
                    {analytics.chapterPerformance.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.average >= 70 ? "#4f46e5" : entry.average >= 50 ? "#f59e0b" : "#ef4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Score Distribution Chart */}
        <div className="lg:col-span-4 p-6 rounded-2xl neu-raised space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Score Distribution</span>
            </h3>
            <p className="text-xs text-muted-foreground">Student score brackets across all attempts</p>
          </div>

          <div className="space-y-3 py-2 font-mono text-xs">
            {analytics.distribution.map((dist, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-foreground">
                  <span className="font-medium">{dist.range}</span>
                  <span className="font-bold">{dist.count} attempts</span>
                </div>
                <div className="w-full h-2.5 rounded-full neu-inset-sm overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      i === 3 ? "bg-emerald-500" : i === 2 ? "bg-primary" : i === 1 ? "bg-amber-500" : "bg-destructive"
                    }`}
                    style={{
                      width: `${analytics.completedAttempts > 0 ? (dist.count / analytics.completedAttempts) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl neu-inset text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">Curriculum Standards:</span> All questions are aligned with
            national and secondary physics assessment frameworks.
          </div>
        </div>
      </div>

      {/* Recent Activity & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Results */}
        <div className="lg:col-span-7 p-6 rounded-2xl neu-raised space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span>Recent Test Submissions</span>
            </h3>
            <button
              onClick={() => onNavigateTab("results")}
              className="text-xs font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {analytics.recentResults.length === 0 ? (
              <p className="text-muted-foreground text-xs py-6 text-center font-mono neu-inset rounded-xl">
                No recent submissions yet.
              </p>
            ) : (
              analytics.recentResults.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl neu-btn-interactive flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl neu-inset flex items-center justify-center font-bold text-primary">
                      {r.student_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{r.student_name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {r.student_login_id} • {r.test_title}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-foreground">
                      {r.score}/{r.max_score} ({r.percentage}%)
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold ${
                        r.passed ? "text-emerald-500" : "text-destructive"
                      }`}
                    >
                      {r.passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Audit Feed */}
        <div className="lg:col-span-5 p-6 rounded-2xl neu-raised space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Security & Audit Stream</span>
            </h3>
            <button
              onClick={() => onNavigateTab("audit")}
              className="text-xs font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Audit Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl neu-inset text-xs space-y-1 font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">{log.action}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="text-muted-foreground text-[11px] font-sans truncate">{log.actor_label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
