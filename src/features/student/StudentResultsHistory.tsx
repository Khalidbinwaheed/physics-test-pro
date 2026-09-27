import React from "react";
import { useAuth } from "../auth/auth-context";
import { portalStorage } from "@/lib/portal-storage";
import { ResultItem } from "@/lib/portal-types";
import { Award, Eye, Calendar, Clock } from "lucide-react";

interface StudentResultsHistoryProps {
  onViewResult: (attemptId: string) => void;
}

export function StudentResultsHistory({ onViewResult }: StudentResultsHistoryProps) {
  const { student } = useAuth();
  if (!student) return null;

  const results = portalStorage.getResults({ studentId: student.id });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" />
          <span>My Assessment History</span>
        </h2>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Historical examination records for {student.full_name} ({student.login_id})
        </p>
      </div>

      <div className="neu-raised rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="neu-inset-sm border-b border-border/60 text-xs font-mono uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Test Title</th>
                <th className="px-5 py-3.5">Chapter</th>
                <th className="px-5 py-3.5">Score</th>
                <th className="px-5 py-3.5">Percentage</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Time Taken</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-sans">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground font-mono text-xs">
                    You have not completed any examinations yet.
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">{r.test_title}</td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs font-mono">{r.chapter_name || "General"}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-foreground">
                      {r.score} / {r.max_score}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-primary">{r.percentage}%</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono uppercase font-bold neu-inset-sm ${
                          r.passed
                            ? "text-emerald-500"
                            : "text-destructive"
                        }`}
                      >
                        {r.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {Math.floor(r.time_taken_seconds / 60)}m {r.time_taken_seconds % 60}s
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {new Date(r.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onViewResult(r.attempt_id)}
                        className="px-3 py-1.5 neu-btn text-primary rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Result</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
