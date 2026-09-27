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
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-400" />
          <span>My Assigned Examinations</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Physics examinations assigned to Student ID {student.login_id}
        </p>
      </div>

      <div className="space-y-4">
        {availableTests.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-500 font-mono text-xs">
            No examinations currently assigned.
          </div>
        ) : (
          availableTests.map(({ test, assignment, canStart, inProgressAttemptId, remainingAttempts, completedAttempts }) => {
            if (!test) return null;

            return (
              <div
                key={assignment.id}
                className="p-5 bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {test.chapter_name || "Physics Test"}
                    </span>
                    {test.negative_marking && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950/40 text-red-300 border border-red-800/40">
                        Negative Marking
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">{test.title}</h3>
                  {test.description && <p className="text-xs text-slate-400">{test.description}</p>}

                  <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
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

                <div className="flex flex-col md:items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-xs font-mono text-slate-400">
                    Attempts: <strong className="text-white">{completedAttempts}</strong> / {assignment.max_attempts}
                  </div>

                  {inProgressAttemptId ? (
                    <button
                      onClick={() => onStartExam(test.id)}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Resume In-Progress Exam</span>
                    </button>
                  ) : canStart ? (
                    <button
                      onClick={() => onStartExam(test.id)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Examination</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-slate-950 text-slate-500 rounded-xl text-xs font-mono border border-slate-800">
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
