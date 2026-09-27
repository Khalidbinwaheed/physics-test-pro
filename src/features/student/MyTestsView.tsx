import React from "react";
import { useAuth } from "../auth/auth-context";
import { portalStorage } from "@/lib/portal-storage";
import { FileText, Clock, Play, AlertCircle, CheckCircle2 } from "lucide-react";

interface MyTestsViewProps {
  onStartExam: (testId: string) => void;
}

export function MyTestsView({ onStartExam }: MyTestsViewProps) {
  const { student } = useAuth();
  if (!student) return null;

  const availableTests = portalStorage.getStudentAvailableTests(student.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          <span>My Assigned Examinations</span>
        </h2>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Physics examinations assigned to Student ID {student.login_id}
        </p>
      </div>

      <div className="space-y-4">
        {availableTests.length === 0 ? (
          <div className="p-12 text-center neu-inset rounded-2xl text-muted-foreground font-mono text-xs">
            No examinations currently assigned.
          </div>
        ) : (
          availableTests.map(({ test, assignment, canStart, inProgressAttemptId, remainingAttempts, completedAttempts }) => {
            if (!test) return null;

            return (
              <div
                key={assignment.id}
                className="p-6 rounded-2xl neu-raised hover:neu-raised-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold neu-inset-sm text-primary">
                      {test.chapter_name || "Physics Test"}
                    </span>
                    {test.negative_marking && (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono neu-raised-sm text-destructive font-bold">
                        Negative Marking
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-foreground tracking-tight">{test.title}</h3>
                  {test.description && <p className="text-xs text-muted-foreground">{test.description}</p>}

                  <div className="flex flex-wrap gap-4 text-xs font-mono text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{test.duration_minutes} minutes duration</span>
                    </span>
                    <span>•</span>
                    <span>{test.question_count} Questions</span>
                    <span>•</span>
                    <span>Total Marks: {test.total_marks}</span>
                    <span>•</span>
                    <span>Pass: {test.passing_percentage}%</span>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/60">
                  <div className="text-xs font-mono text-muted-foreground">
                    Attempts: <strong className="text-foreground">{completedAttempts}</strong> / {assignment.max_attempts}
                  </div>

                  {inProgressAttemptId ? (
                    <button
                      onClick={() => onStartExam(test.id)}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Resume In-Progress Exam</span>
                    </button>
                  ) : canStart ? (
                    <button
                      onClick={() => onStartExam(test.id)}
                      className="px-5 py-2.5 neu-btn-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Examination</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 neu-inset rounded-xl text-xs font-mono text-muted-foreground">
                      All Attempts Used
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
