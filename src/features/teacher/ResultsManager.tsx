import React, { useState } from "react";
import { portalStorage } from "@/lib/portal-storage";
import { ResultItem, TestItem, AttemptItem } from "@/lib/portal-types";
import { MathText } from "@/components/MathText";
import {
  Award,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  X,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

export function ResultsManager() {
  const [results, setResults] = useState<ResultItem[]>(portalStorage.getResults());
  const [tests] = useState<TestItem[]>(portalStorage.getTests());

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTestFilter, setSelectedTestFilter] = useState("all");

  // Detailed Attempt Modal
  const [detailedAttempt, setDetailedAttempt] = useState<AttemptItem | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setResults(
      portalStorage.getResults({
        search: e.target.value,
        testId: selectedTestFilter,
      })
    );
  };

  const handleFilterTest = (testId: string) => {
    setSelectedTestFilter(testId);
    setResults(
      portalStorage.getResults({
        search: searchTerm,
        testId,
      })
    );
  };

  const viewAttemptDetails = (res: ResultItem) => {
    const att = portalStorage.getAttemptById(res.attempt_id);
    if (!att) {
      toast.error("Attempt details could not be found.");
      return;
    }
    setDetailedAttempt(att as AttemptItem);
  };

  const exportResultsCsv = () => {
    if (results.length === 0) {
      toast.info("No results to export.");
      return;
    }
    const header = "Student Name,Student Login ID,Test Title,Chapter,Score,Max Score,Percentage,Passed,Correct,Incorrect,Unanswered,Time Taken (sec),Submitted At\n";
    const body = results
      .map(
        (r) =>
          `"${r.student_name}","${r.student_login_id}","${r.test_title.replace(/"/g, '""')}","${r.chapter_name || ""}","${r.score}","${r.max_score}","${r.percentage}%","${r.passed ? "PASS" : "FAIL"}","${r.correct_count}","${r.incorrect_count}","${r.unanswered_count}","${r.time_taken_seconds}","${r.submitted_at}"`
      )
      .join("\n");

    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Physics_Test_Results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exam results exported to CSV");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            <span>Assessment Results & Submissions</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Server-scored results • Immutable attempt grading • Individual attempt audits
          </p>
        </div>

        <button
          onClick={exportResultsCsv}
          className="flex items-center gap-2 px-4 py-2.5 neu-btn text-foreground rounded-xl text-sm font-semibold cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-500" />
          <span>Export Results CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl neu-raised">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by student name, Login ID, or test title..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedTestFilter}
            onChange={(e) => handleFilterTest(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Tests</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-2xl neu-raised overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="neu-inset-sm border-b border-border/60 text-xs font-mono uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Student ID</th>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Test Title</th>
                <th className="px-5 py-3.5">Score</th>
                <th className="px-5 py-3.5">Percentage</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Accuracy</th>
                <th className="px-5 py-3.5">Time Taken</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-sans">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-muted-foreground font-mono text-xs">
                    No submitted exam results found yet.
                  </td>
                </tr>
              ) : (
                results.map((res) => (
                  <tr key={res.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-primary">
                      {res.student_login_id}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground">{res.student_name}</td>
                    <td className="px-5 py-3.5 text-foreground">
                      <div className="font-semibold">{res.test_title}</div>
                      {res.chapter_name && (
                        <div className="text-[11px] text-muted-foreground font-mono">{res.chapter_name}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-foreground">
                      {res.score} / {res.max_score}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-primary">{res.percentage}%</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono uppercase font-bold neu-inset-sm ${
                          res.passed
                            ? "text-emerald-500"
                            : "text-destructive"
                        }`}
                      >
                        {res.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs">
                      <span className="text-emerald-500 font-bold">{res.correct_count}✓</span>{" "}
                      <span className="text-destructive font-bold">{res.incorrect_count}✗</span>{" "}
                      <span className="text-muted-foreground">{res.unanswered_count}—</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {Math.floor(res.time_taken_seconds / 60)}m {res.time_taken_seconds % 60}s
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => viewAttemptDetails(res)}
                        className="px-3 py-1.5 neu-btn text-primary rounded-xl text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED ATTEMPT AUDIT MODAL */}
      {detailedAttempt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl neu-raised-lg rounded-3xl p-6 sm:p-7 text-foreground my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h3 className="font-bold text-lg text-foreground">{detailedAttempt.test_title}</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Attempt by {detailedAttempt.student_name} ({detailedAttempt.student_login_id}) • Attempt #{detailedAttempt.attempt_number}
                </p>
              </div>
              <button
                onClick={() => setDetailedAttempt(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-xl neu-btn-interactive cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions breakdown */}
            <div className="space-y-4 mt-4 max-h-[65vh] overflow-y-auto pr-1">
              {detailedAttempt.questions.map((q, idx) => {
                const studentAnswer = detailedAttempt.answers[q.tqId];
                const isCorrect = studentAnswer === q.correct_answer;
                const isUnanswered = !studentAnswer;

                return (
                  <div
                    key={q.tqId}
                    className={`p-5 rounded-2xl space-y-3 transition-all ${
                      isCorrect
                        ? "neu-raised border border-emerald-500/40"
                        : isUnanswered
                        ? "neu-raised"
                        : "neu-raised border border-destructive/40"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">Q{idx + 1}.</span>
                        <span className="text-muted-foreground">{q.chapter_name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCorrect && (
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{q.marks} pts)
                          </span>
                        )}
                        {!isCorrect && !isUnanswered && (
                          <span className="text-destructive font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect (-{detailedAttempt.negative_marking ? q.negative_marks : 0} pts)
                          </span>
                        )}
                        {isUnanswered && <span className="text-muted-foreground font-medium">Unanswered (0 pts)</span>}
                      </div>
                    </div>

                    <div className="text-foreground text-sm font-medium">
                      <MathText text={q.question} />
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                      {(["A", "B", "C", "D"] as const).map((opt) => {
                        const optText =
                          opt === "A" ? q.option_a : opt === "B" ? q.option_b : opt === "C" ? q.option_c : q.option_d;
                        const isStudentChoice = studentAnswer === opt;
                        const isTheCorrectAnswer = q.correct_answer === opt;

                        let borderBg = "neu-inset text-muted-foreground";
                        if (isTheCorrectAnswer) {
                          borderBg = "neu-raised text-emerald-600 dark:text-emerald-300 border border-emerald-500/50 font-medium";
                        } else if (isStudentChoice) {
                          borderBg = "neu-inset text-destructive border border-destructive/50 font-medium";
                        }

                        return (
                          <div key={opt} className={`p-2.5 rounded-xl flex items-start gap-2 ${borderBg}`}>
                            <span className="font-mono font-bold">{opt}.</span>
                            <div className="flex-1">
                              <MathText text={optText} />
                              {isStudentChoice && (
                                <span className="ml-2 font-mono text-[10px] text-primary uppercase font-bold">
                                  [Student Selected]
                                </span>
                              )}
                              {isTheCorrectAnswer && (
                                <span className="ml-2 font-mono text-[10px] text-emerald-500 uppercase font-bold">
                                  [Correct Answer]
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-3 rounded-xl neu-inset text-xs text-foreground">
                        <span className="font-mono text-[10px] text-primary uppercase font-bold block mb-0.5">
                          Physics Explanation:
                        </span>
                        <MathText text={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-border/60 mt-4">
              <button
                type="button"
                onClick={() => setDetailedAttempt(null)}
                className="px-5 py-2.5 neu-btn text-foreground rounded-xl text-sm font-semibold cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
