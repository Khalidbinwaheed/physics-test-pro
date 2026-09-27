import React from "react";
import { useAuth } from "../auth/auth-context";
import { portalStorage } from "@/lib/portal-storage";
import {
  FileText,
  Clock,
  Award,
  TrendingUp,
  ArrowRight,
  Play,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface StudentDashboardProps {
  onStartExam: (testId: string) => void;
  onViewResult: (attemptId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export function StudentDashboard({ onStartExam, onViewResult, onNavigateTab }: StudentDashboardProps) {
  const { student } = useAuth();
  if (!student) return null;

  const analytics = portalStorage.getStudentAnalytics(student.id);
  const availableTests = portalStorage.getStudentAvailableTests(student.id);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-indigo-400 font-semibold tracking-wider">
            Student Assessment Portal
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">Welcome, {student.full_name}</h2>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
            <span>
              Student ID: <strong className="text-indigo-400">{student.login_id}</strong>
            </span>
            <span>•</span>
            <span>{student.class_name ? `${student.class_name} - Sec ${student.section}` : "Standard Class"}</span>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab("tests")}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-600/30"
        >
          <span>View All Tests</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 uppercase">Assigned Tests</span>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{analytics.assignedTests}</div>
          <span className="text-[10px] text-slate-500 font-sans mt-0.5 block">Total allocated exams</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 uppercase">Pending Tests</span>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1">{analytics.pendingTests}</div>
          <span className="text-[10px] text-slate-500 font-sans mt-0.5 block">Waiting to be attempted</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 uppercase">Completed</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">{analytics.completedTests}</div>
          <span className="text-[10px] text-slate-500 font-sans mt-0.5 block">Finished & scored</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 uppercase">Average Score</span>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-300 mt-1">{analytics.avgScore}%</div>
          <span className="text-[10px] text-slate-500 font-sans mt-0.5 block">Overall performance</span>
        </div>
      </div>

      {/* Available Tests Section */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Available Examinations</span>
            </h3>
            <p className="text-xs text-slate-400">Tests currently assigned and ready for your attempt</p>
          </div>
        </div>

        {availableTests.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-xl text-slate-500 font-mono text-xs">
            No active tests currently assigned to your account.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableTests.map(({ test, assignment, canStart, inProgressAttemptId, remainingAttempts }) => {
              if (!test) return null;
              return (
                <div
                  key={assignment.id}
                  className="p-4 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between space-y-3 transition-colors"
                >
                  <div>
                    <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase">
                      {test.chapter_name || "Physics Test"}
                    </span>
                    <h4 className="text-base font-bold text-white tracking-tight mt-0.5">{test.title}</h4>
                    {test.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{test.description}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{test.duration_minutes} min</span>
                    </span>
                    <span>•</span>
                    <span>{test.question_count} MCQs</span>
                    <span>•</span>
                    <span>{remainingAttempts} attempt(s) remaining</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      Pass requirement: {test.passing_percentage}%
                    </span>

                    {inProgressAttemptId ? (
                      <button
                        onClick={() => onStartExam(test.id)}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Resume In-Progress</span>
                      </button>
                    ) : canStart ? (
                      <button
                        onClick={() => onStartExam(test.id)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow shadow-indigo-600/20"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Examination</span>
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-slate-500">Completed or Expired</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chapter Performance & Recent Results Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chapter Performance Cards */}
        <div className="lg:col-span-6 p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Chapter Mastery</span>
            </h3>
            <p className="text-xs text-slate-400">Personal performance across physics chapters</p>
          </div>

          <div className="space-y-3 font-sans">
            {analytics.chapterPerformance.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{item.chapter}</span>
                  <span className="font-mono font-bold text-indigo-400">{item.score}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      item.score >= 80 ? "bg-emerald-500" : item.score >= 60 ? "bg-indigo-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Results */}
        <div className="lg:col-span-6 p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>Recent Exam Results</span>
              </h3>
              <p className="text-xs text-slate-400">Your latest assessment scores</p>
            </div>
            <button
              onClick={() => onNavigateTab("results")}
              className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {analytics.recentResults.length === 0 ? (
              <p className="text-slate-500 text-xs py-8 text-center font-mono">
                You have not completed any examinations yet.
              </p>
            ) : (
              analytics.recentResults.map((r) => (
                <div
                  key={r.id}
                  onClick={() => onViewResult(r.attempt_id)}
                  className="p-3 bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-semibold text-white">{r.test_title}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {new Date(r.submitted_at).toLocaleDateString()}
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
      </div>
    </div>
  );
}
