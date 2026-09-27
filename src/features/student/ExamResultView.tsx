import React from "react";
import { ResultItem } from "@/lib/portal-types";
import { portalStorage } from "@/lib/portal-storage";
import { MathText } from "@/components/MathText";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  HelpCircle,
  Check,
  AlertCircle,
} from "lucide-react";

interface ExamResultViewProps {
  result: ResultItem;
  onReturn: () => void;
}

export function ExamResultView({ result, onReturn }: ExamResultViewProps) {
  const attempt = portalStorage.getAttemptById(result.attempt_id, result.student_id);

  const minutes = Math.floor(result.time_taken_seconds / 60);
  const seconds = result.time_taken_seconds % 60;

  const canReview = attempt && (attempt.show_correct_answers || attempt.show_explanations);

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6 font-sans">
      {/* Return button */}
      <div>
        <button
          onClick={onReturn}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-mono transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Main Score Card */}
      <div className="p-6 sm:p-10 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl text-center space-y-6 relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border shadow-xl shadow-indigo-500/10 bg-indigo-500/10 border-indigo-500/30 text-indigo-400">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">
            Assessment Result
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">{result.test_title}</h2>
          {result.chapter_name && <p className="text-xs text-indigo-400 font-mono mt-1">{result.chapter_name}</p>}
        </div>

        {/* Big Score Display */}
        <div className="py-2">
          <div className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
            {result.score} <span className="text-2xl text-slate-500 font-normal">/ {result.max_score}</span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="text-2xl font-bold text-indigo-300 font-mono">{result.percentage}%</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-bold tracking-wider ${
                result.passed
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {result.passed ? "Passed" : "Failed"}
            </span>
          </div>
        </div>

        {/* Detailed Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl font-mono text-xs">
          <div>
            <span className="text-slate-500 block">Correct</span>
            <span className="text-lg font-bold text-emerald-400">{result.correct_count}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Incorrect</span>
            <span className="text-lg font-bold text-red-400">{result.incorrect_count}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Unanswered</span>
            <span className="text-lg font-bold text-slate-400">{result.unanswered_count}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Time Taken</span>
            <span className="text-lg font-bold text-indigo-300">
              {minutes}m {seconds}s
            </span>
          </div>
        </div>
      </div>

      {/* PERMITTED QUESTION REVIEW */}
      {canReview && attempt && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Examination Review</h3>
              <p className="text-xs text-slate-400 font-mono">
                Permitted answer breakdown with explanations
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Teacher Permitted Review
            </span>
          </div>

          <div className="space-y-4">
            {attempt.questions.map((q, idx) => {
              const studentChoice = attempt.answers[q.tqId];
              const isCorrect = studentChoice === q.correct_answer;
              const isUnanswered = !studentChoice;

              return (
                <div
                  key={q.tqId}
                  className={`p-5 rounded-2xl border space-y-3 ${
                    isCorrect
                      ? "bg-slate-900/90 border-emerald-500/40"
                      : isUnanswered
                      ? "bg-slate-900/90 border-slate-800"
                      : "bg-slate-900/90 border-red-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white">Question {idx + 1}</span>
                    <div>
                      {isCorrect && (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{q.marks} pts)
                        </span>
                      )}
                      {!isCorrect && !isUnanswered && (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                      {isUnanswered && <span className="text-slate-500">Unanswered</span>}
                    </div>
                  </div>

                  <div className="text-white text-base font-medium">
                    <MathText text={q.question} />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                    {(["A", "B", "C", "D"] as const).map((opt) => {
                      const text =
                        opt === "A" ? q.option_a : opt === "B" ? q.option_b : opt === "C" ? q.option_c : q.option_d;
                      const isStudentChoice = studentChoice === opt;
                      const isCorrectAnswer = q.correct_answer === opt;

                      let style = "bg-slate-950/60 border-slate-800/80 text-slate-400";
                      if (isCorrectAnswer) {
                        style = "bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-medium";
                      } else if (isStudentChoice) {
                        style = "bg-red-950/40 border-red-500/60 text-red-200 font-medium";
                      }

                      return (
                        <div key={opt} className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${style}`}>
                          <span className="font-mono font-bold">{opt}.</span>
                          <div className="flex-1">
                            <MathText text={text} />
                            {isStudentChoice && (
                              <span className="ml-2 font-mono text-[10px] text-indigo-400 uppercase font-semibold">
                                [Your Pick]
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span className="ml-2 font-mono text-[10px] text-emerald-400 uppercase font-semibold">
                                [Correct]
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Physics Explanation */}
                  {q.explanation && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
                      <span className="font-mono text-[10px] text-indigo-400 uppercase font-semibold block">
                        Explanation:
                      </span>
                      <MathText text={q.explanation} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* If review not permitted notice */}
      {!canReview && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400 font-mono">
          Detailed question review has been disabled for this test by the instructor.
        </div>
      )}

      <div className="text-center pt-2">
        <button
          onClick={onReturn}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/30"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
