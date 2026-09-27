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
          className="inline-flex items-center gap-1.5 px-4 py-2 neu-btn rounded-xl text-xs font-mono text-foreground cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Main Score Card */}
      <div className="p-6 sm:p-10 rounded-3xl neu-raised text-center space-y-6 relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center neu-inset text-primary">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase text-muted-foreground font-semibold tracking-wider">
            Assessment Result
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1">{result.test_title}</h2>
          {result.chapter_name && <p className="text-xs text-primary font-mono mt-1 font-semibold">{result.chapter_name}</p>}
        </div>

        {/* Big Score Display */}
        <div className="py-2">
          <div className="text-5xl sm:text-6xl font-black text-foreground font-mono tracking-tight">
            {result.score} <span className="text-2xl text-muted-foreground font-normal">/ {result.max_score}</span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="text-2xl font-bold text-primary font-mono">{result.percentage}%</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-bold tracking-wider ${
                result.passed
                  ? "neu-inset text-emerald-500"
                  : "neu-inset text-destructive"
              }`}
            >
              {result.passed ? "Passed" : "Failed"}
            </span>
          </div>
        </div>

        {/* Detailed Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl neu-inset font-mono text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Correct</span>
            <span className="text-lg font-bold text-emerald-500">{result.correct_count}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Incorrect</span>
            <span className="text-lg font-bold text-destructive">{result.incorrect_count}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Unanswered</span>
            <span className="text-lg font-bold text-muted-foreground">{result.unanswered_count}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Time Taken</span>
            <span className="text-lg font-bold text-primary">
              {minutes}m {seconds}s
            </span>
          </div>
        </div>
      </div>

      {/* PERMITTED QUESTION REVIEW */}
      {canReview && attempt && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div>
              <h3 className="text-lg font-bold text-foreground tracking-tight">Examination Review</h3>
              <p className="text-xs text-muted-foreground font-mono">
                Permitted answer breakdown with explanations
              </p>
            </div>
            <span className="text-xs font-mono text-primary neu-inset-sm px-2.5 py-1 rounded-lg font-semibold">
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
                  className={`p-6 rounded-2xl space-y-4 transition-all ${
                    isCorrect
                      ? "neu-raised border border-emerald-500/40"
                      : isUnanswered
                      ? "neu-raised"
                      : "neu-raised border border-destructive/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-foreground">Question {idx + 1}</span>
                    <div>
                      {isCorrect && (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{q.marks} pts)
                        </span>
                      )}
                      {!isCorrect && !isUnanswered && (
                        <span className="text-destructive font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                      {isUnanswered && <span className="text-muted-foreground">Unanswered</span>}
                    </div>
                  </div>

                  <div className="text-foreground text-base font-medium">
                    <MathText text={q.question} />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-sans">
                    {(["A", "B", "C", "D"] as const).map((opt) => {
                      const text =
                        opt === "A" ? q.option_a : opt === "B" ? q.option_b : opt === "C" ? q.option_c : q.option_d;
                      const isStudentChoice = studentChoice === opt;
                      const isCorrectAnswer = q.correct_answer === opt;

                      let style = "neu-inset text-muted-foreground";
                      if (isCorrectAnswer) {
                        style = "neu-raised text-emerald-600 dark:text-emerald-400 border border-emerald-500/50 font-semibold";
                      } else if (isStudentChoice) {
                        style = "neu-inset text-destructive border border-destructive/50 font-semibold";
                      }

                      return (
                        <div key={opt} className={`p-3 rounded-xl flex items-start gap-2.5 ${style}`}>
                          <span className="font-mono font-bold">{opt}.</span>
                          <div className="flex-1">
                            <MathText text={text} />
                            {isStudentChoice && (
                              <span className="ml-2 font-mono text-[10px] uppercase font-bold text-primary">
                                [Your Pick]
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span className="ml-2 font-mono text-[10px] uppercase font-bold text-emerald-500">
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
                    <div className="p-3.5 rounded-xl neu-inset text-xs text-foreground space-y-1">
                      <span className="font-mono text-[10px] text-primary uppercase font-bold block">
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
        <div className="p-4 rounded-2xl neu-inset text-center text-xs text-muted-foreground font-mono">
          Detailed question review has been disabled for this test by the instructor.
        </div>
      )}

      <div className="text-center pt-2">
        <button
          onClick={onReturn}
          className="px-6 py-2.5 neu-btn-primary rounded-xl text-sm font-semibold cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
