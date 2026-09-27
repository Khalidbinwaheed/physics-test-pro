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
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-400" />
            <span>Assessment Results & Submissions</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Server-scored results • Immutable attempt grading • Individual attempt audits
          </p>
        </div>

        <button
          onClick={exportResultsCsv}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition-all shadow"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Results CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by student name, Login ID, or test title..."
            className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedTestFilter}
            onChange={(e) => handleFilterTest(e.target.value)}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs font-mono uppercase text-slate-400">
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
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-500 font-mono text-xs">
                    No submitted exam results found yet.
                  </td>
                </tr>
              ) : (
                results.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-indigo-400">
                      {res.student_login_id}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-white">{res.student_name}</td>
                    <td className="px-5 py-3.5 text-slate-200">
                      <div className="font-medium">{res.test_title}</div>
                      {res.chapter_name && (
                        <div className="text-[11px] text-slate-500 font-mono">{res.chapter_name}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-white">
                      {res.score} / {res.max_score}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-indigo-300">{res.percentage}%</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono uppercase font-bold ${
                          res.passed
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {res.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-400">
                      <span className="text-emerald-400">{res.correct_count}✓</span>{" "}
                      <span className="text-red-400">{res.incorrect_count}✗</span>{" "}
                      <span className="text-slate-500">{res.unanswered_count}—</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-400">
                      {Math.floor(res.time_taken_seconds / 60)}m {res.time_taken_seconds % 60}s
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => viewAttemptDetails(res)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-white">{detailedAttempt.test_title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Attempt by {detailedAttempt.student_name} ({detailedAttempt.student_login_id}) • Attempt #{detailedAttempt.attempt_number}
                </p>
              </div>
              <button onClick={() => setDetailedAttempt(null)} className="text-slate-400 hover:text-white p-1">
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
                    className={`p-4 rounded-xl border space-y-3 ${
                      isCorrect
                        ? "bg-emerald-950/20 border-emerald-500/30"
                        : isUnanswered
                        ? "bg-slate-950/50 border-slate-800"
                        : "bg-red-950/20 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Q{idx + 1}.</span>
                        <span className="text-slate-400">{q.chapter_name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCorrect && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{q.marks} pts)
                          </span>
                        )}
                        {!isCorrect && !isUnanswered && (
                          <span className="text-red-400 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect (-{detailedAttempt.negative_marking ? q.negative_marks : 0} pts)
                          </span>
                        )}
                        {isUnanswered && <span className="text-slate-500 font-medium">Unanswered (0 pts)</span>}
                      </div>
                    </div>

                    <div className="text-white text-sm font-medium">
                      <MathText text={q.question} />
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                      {(["A", "B", "C", "D"] as const).map((opt) => {
                        const optText =
                          opt === "A" ? q.option_a : opt === "B" ? q.option_b : opt === "C" ? q.option_c : q.option_d;
                        const isStudentChoice = studentAnswer === opt;
                        const isTheCorrectAnswer = q.correct_answer === opt;

                        let borderBg = "border-slate-800 bg-slate-950/60 text-slate-400";
                        if (isTheCorrectAnswer) {
                          borderBg = "border-emerald-500/60 bg-emerald-500/10 text-emerald-200 font-medium";
                        } else if (isStudentChoice) {
                          borderBg = "border-red-500/60 bg-red-500/10 text-red-200 font-medium";
                        }

                        return (
                          <div key={opt} className={`p-2 rounded-lg border flex items-start gap-2 ${borderBg}`}>
                            <span className="font-mono font-bold">{opt}.</span>
                            <div className="flex-1">
                              <MathText text={optText} />
                              {isStudentChoice && (
                                <span className="ml-2 font-mono text-[10px] text-indigo-400 uppercase">
                                  [Student Selected]
                                </span>
                              )}
                              {isTheCorrectAnswer && (
                                <span className="ml-2 font-mono text-[10px] text-emerald-400 uppercase">
                                  [Correct Answer]
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400">
                        <span className="font-mono text-[10px] text-indigo-400 uppercase font-semibold block mb-0.5">
                          Physics Explanation:
                        </span>
                        <MathText text={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setDetailedAttempt(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium"
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
