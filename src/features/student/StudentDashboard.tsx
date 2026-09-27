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
  GraduationCap,
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
      <div className="p-6 rounded-3xl neu-raised flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-primary font-bold tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            Student Assessment Portal
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">Welcome, {student.full_name}</h2>
          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground mt-1">
            <span>
              Student ID: <strong className="text-primary">{student.login_id}</strong>
            </span>
            <span>•</span>
            <span>{student.class_name ? `${student.class_name} - Sec ${student.section}` : "Physics Lab Standard"}</span>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab("tests")}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 neu-btn-primary rounded-xl text-xs font-semibold cursor-pointer"
        >
          <span>View All Tests</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
        <div className="p-5 rounded-2xl neu-raised">
          <span className="text-[11px] text-muted-foreground uppercase font-semibold">Assigned Tests</span>
          <div className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{analytics.assignedTests}</div>
          <span className="text-[10px] text-muted-foreground font-sans mt-0.5 block">Total allocated exams</span>
        </div>

        <div className="p-5 rounded-2xl neu-raised">
          <span className="text-[11px] text-muted-foreground uppercase font-semibold">Pending Tests</span>
          <div className="text-2xl sm:text-3xl font-bold text-amber-500 mt-1">{analytics.pendingTests}</div>
          <span className="text-[10px] text-muted-foreground font-sans mt-0.5 block">Waiting to be attempted</span>
        </div>

        <div className="p-5 rounded-2xl neu-raised">
          <span className="text-[11px] text-muted-foreground uppercase font-semibold">Completed</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-500 mt-1">{analytics.completedTests}</div>
          <span className="text-[10px] text-muted-foreground font-sans mt-0.5 block">Finished & scored</span>
        </div>

        <div className="p-5 rounded-2xl neu-raised">
          <span className="text-[11px] text-muted-foreground uppercase font-semibold">Average Score</span>
          <div className="text-2xl sm:text-3xl font-bold text-primary mt-1">{analytics.avgScore}%</div>
          <span className="text-[10px] text-muted-foreground font-sans mt-0.5 block">Overall performance</span>
        </div>
      </div>

      {/* Available Tests Section */}
      <div className="p-6 rounded-2xl neu-raised space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Available Examinations</span>
            </h3>
            <p className="text-xs text-muted-foreground">Tests currently assigned and ready for your attempt</p>
          </div>
        </div>

        {availableTests.length === 0 ? (
          <div className="p-8 text-center neu-inset rounded-2xl text-muted-foreground font-mono text-xs">
            No active tests currently assigned to your account.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTests.map(({ test, assignment, canStart, inProgressAttemptId, remainingAttempts }) => {
              if (!test) return null;
              return (
                <div
                  key={assignment.id}
                  className="p-5 rounded-2xl neu-raised hover:neu-raised-lg flex flex-col justify-between space-y-3 transition-all"
                >
                  <div>
                    <span className="text-[11px] font-mono text-primary font-bold uppercase">
                      {test.chapter_name || "Physics Test"}
                    </span>
                    <h4 className="text-base font-bold text-foreground tracking-tight mt-0.5">{test.title}</h4>
                    {test.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{test.description}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-mono text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{test.duration_minutes} min</span>
                    </span>
                    <span>•</span>
                    <span>{test.question_count} MCQs</span>
                    <span>•</span>
                    <span>{remainingAttempts} attempt(s) remaining</span>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Pass: {test.passing_percentage}%
                    </span>

                    {inProgressAttemptId ? (
                      <button
                        onClick={() => onStartExam(test.id)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Resume Exam</span>
                      </button>
                    ) : canStart ? (
                      <button
                        onClick={() => onStartExam(test.id)}
                        className="px-4 py-2 neu-btn-primary rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Examination</span>
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-muted-foreground">Completed / Expired</span>
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
        <div className="lg:col-span-6 p-6 rounded-2xl neu-raised space-y-4">
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Chapter Mastery</span>
            </h3>
            <p className="text-xs text-muted-foreground">Personal performance across physics chapters</p>
          </div>

          <div className="space-y-3 font-sans">
            {analytics.chapterPerformance.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl neu-inset space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{item.chapter}</span>
                  <span className="font-mono font-bold text-primary">{item.score}%</span>
                </div>
                <div className="w-full h-2.5 neu-inset-sm rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.score >= 80 ? "bg-emerald-500" : item.score >= 60 ? "bg-primary" : "bg-amber-500"
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Results */}
        <div className="lg:col-span-6 p-6 rounded-2xl neu-raised space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span>Recent Exam Results</span>
              </h3>
              <p className="text-xs text-muted-foreground">Your latest assessment scores</p>
            </div>
            <button
              onClick={() => onNavigateTab("results")}
              className="text-xs font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {analytics.recentResults.length === 0 ? (
              <p className="text-muted-foreground text-xs py-8 text-center font-mono neu-inset rounded-xl">
                You have not completed any examinations yet.
              </p>
            ) : (
              analytics.recentResults.map((r) => (
                <div
                  key={r.id}
                  onClick={() => onViewResult(r.attempt_id)}
                  className="p-3.5 rounded-xl neu-btn-interactive flex items-center justify-between text-xs cursor-pointer transition-all"
                >
                  <div>
                    <div className="font-semibold text-foreground">{r.test_title}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {new Date(r.submitted_at).toLocaleDateString()}
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
      </div>
    </div>
  );
}
