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
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
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
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      title: "Question Bank",
      value: analytics.totalMCQs,
      sub: `${analytics.totalChapters} chapters covered`,
      icon: HelpCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Active Tests",
      value: analytics.activeTests,
      sub: "Available for students",
      icon: FileText,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Completed Attempts",
      value: analytics.completedAttempts,
      sub: `Avg score: ${analytics.avgScore}%`,
      icon: Award,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="p-6 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-indigo-400 font-semibold tracking-wider">
            Instructor Control Center
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">Physics Examination Portal</h2>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative examination engine with KaTeX mathematical formulas, server timers, and immutable snapshot grading.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigateTab("students")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-all shadow-md shadow-indigo-600/30"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
          <button
            onClick={() => onNavigateTab("mcqs")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add MCQ</span>
          </button>
          <button
            onClick={() => onNavigateTab("tests")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
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
              className="p-5 bg-slate-900/80 border border-slate-800/90 rounded-2xl shadow-lg relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400">{s.title}</span>
                <div className={`p-2 rounded-xl border ${s.bg} ${s.border} ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-white tracking-tight font-mono">{s.value}</span>
                <span className="block text-xs text-slate-400 mt-1">{s.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chapter Performance Bar Chart */}
        <div className="lg:col-span-8 p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Chapter Mastery & Average Scores</span>
              </h3>
              <p className="text-xs text-slate-400">Mean student assessment scores grouped by chapter</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Pass Rate: {analytics.passRate}%
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.chapterPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="chapter"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val}%`, "Average Score"]}
                />
                <Bar dataKey="average" radius={[6, 6, 0, 0]}>
                  {analytics.chapterPerformance.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.average >= 70 ? "#6366f1" : entry.average >= 50 ? "#eab308" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution Chart */}
        <div className="lg:col-span-4 p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Score Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">Student score brackets across all attempts</p>
          </div>

          <div className="space-y-3 py-2 font-mono text-xs">
            {analytics.distribution.map((dist, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>{dist.range}</span>
                  <span className="font-bold text-white">{dist.count} attempts</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      i === 3 ? "bg-emerald-500" : i === 2 ? "bg-indigo-500" : i === 1 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{
                      width: `${analytics.completedAttempts > 0 ? (dist.count / analytics.completedAttempts) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-400">
            <span className="text-white font-medium">Curriculum Standards:</span> All questions are aligned with
            national and secondary physics assessment frameworks.
          </div>
        </div>
      </div>

      {/* Recent Activity & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Results */}
        <div className="lg:col-span-7 p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Recent Test Submissions</span>
            </h3>
            <button
              onClick={() => onNavigateTab("results")}
              className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {analytics.recentResults.length === 0 ? (
              <p className="text-slate-500 text-xs py-6 text-center font-mono">No recent submissions yet.</p>
            ) : (
              analytics.recentResults.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white">
                      {r.student_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{r.student_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {r.student_login_id} • {r.test_title}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-white">
                      {r.score}/{r.max_score} ({r.percentage}%)
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold ${
                        r.passed ? "text-emerald-400" : "text-red-400"
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
        <div className="lg:col-span-5 p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Security & Audit Stream</span>
            </h3>
            <button
              onClick={() => onNavigateTab("audit")}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <span>Audit Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 bg-slate-950/70 border border-slate-800/70 rounded-xl text-xs space-y-1 font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 font-medium">{log.action}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] font-sans truncate">{log.actor_label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
