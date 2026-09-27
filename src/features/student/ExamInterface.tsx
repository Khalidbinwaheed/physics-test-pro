import React, { useState, useEffect, useRef } from "react";
import { portalStorage } from "@/lib/portal-storage";
import { AttemptItem, ResultItem } from "@/lib/portal-types";
import { MathText } from "@/components/MathText";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  RotateCcw,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

interface ExamInterfaceProps {
  attemptId: string;
  studentId: string;
  onSubmitted: (result: ResultItem) => void;
  onExit: () => void;
}

export function ExamInterface({ attemptId, studentId, onSubmitted, onExit }: ExamInterfaceProps) {
  const [attempt, setAttempt] = useState<AttemptItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, "A" | "B" | "C" | "D" | null>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load and restore attempt
  useEffect(() => {
    try {
      const att = portalStorage.getAttemptById(attemptId, studentId);
      if (!att) {
        toast.error("Examination attempt not found.");
        onExit();
        return;
      }

      if (att.status === "submitted") {
        const res = portalStorage.getResultByAttemptId(attemptId);
        if (res) {
          onSubmitted(res);
          return;
        }
      }

      setAttempt(att as AttemptItem);
      setSelectedAnswers(att.answers || {});

      // Calculate server authoritative remaining seconds
      const expiresTime = new Date(att.expires_at).getTime();
      const nowTime = Date.now();
      const diffSecs = Math.max(0, Math.floor((expiresTime - nowTime) / 1000));
      setSecondsRemaining(diffSecs);

      if (diffSecs <= 0) {
        handleAutoSubmit();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load examination.");
      onExit();
    }
  }, [attemptId, studentId]);

  // Server authoritative countdown timer
  useEffect(() => {
    if (secondsRemaining <= 0 && attempt && attempt.status === "in_progress") {
      handleAutoSubmit();
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [secondsRemaining, attempt?.status]);

  const handleSelectOption = (option: "A" | "B" | "C" | "D") => {
    if (!attempt) return;
    const currentQ = attempt.questions[currentIndex];
    if (!currentQ) return;

    // Optimistically update local state
    const newAnswers = { ...selectedAnswers, [currentQ.tqId]: option };
    setSelectedAnswers(newAnswers);
    setAutosaveStatus("saving");

    try {
      // Authoritatively persist answer to server database
      portalStorage.saveAnswer(attempt.id, studentId, currentQ.tqId, option);
      setTimeout(() => setAutosaveStatus("saved"), 250);
      setTimeout(() => setAutosaveStatus("idle"), 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to autosave answer.");
    }
  };

  const handleClearAnswer = () => {
    if (!attempt) return;
    const currentQ = attempt.questions[currentIndex];
    if (!currentQ) return;

    const newAnswers = { ...selectedAnswers, [currentQ.tqId]: null };
    setSelectedAnswers(newAnswers);
    portalStorage.saveAnswer(attempt.id, studentId, currentQ.tqId, null);
    toast.info("Answer cleared.");
  };

  const handleManualSubmit = () => {
    setShowConfirmModal(true);
  };

  const confirmSubmit = () => {
    if (!attempt || isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const result = portalStorage.submitAttempt(attempt.id, studentId, false);
      toast.success("Exam submitted successfully!");
      onSubmitted(result);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit exam.");
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    if (!attempt || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = portalStorage.submitAttempt(attempt.id, studentId, true);
      toast.warning("Time expired! Your exam was automatically submitted.");
      onSubmitted(result);
    } catch {
      onExit();
    }
  };

  if (!attempt) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 font-mono text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing exam session...</span>
        </div>
      </div>
    );
  }

  const currentQ = attempt.questions[currentIndex];
  const totalQuestions = attempt.questions.length;
  const answeredCount = Object.values(selectedAnswers).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Format timer
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isTimeCritical = secondsRemaining < 120; // Under 2 minutes

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* EXAM HEADER - FIXED AT TOP */}
      <header className="sticky top-0 z-30 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-xs sm:max-w-md">
            {attempt.test_title}
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
            <span>
              Question <strong className="text-white">{currentIndex + 1}</strong> of {totalQuestions}
            </span>
            <span>•</span>
            <span className="text-indigo-400">{answeredCount} answered</span>
          </div>
        </div>

        {/* Server Authoritative Countdown Timer & Submit Button */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base tracking-wider transition-colors ${
              isTimeCritical
                ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                : "bg-slate-950 text-indigo-400 border-slate-800"
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimeCritical ? "text-red-400" : "text-indigo-400"}`} />
            <span>{formattedTime}</span>
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Exam</span>
          </button>
        </div>
      </header>

      {/* MAIN EXAM BODY */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Question Sheet */}
        <main className="lg:col-span-8 flex flex-col justify-between space-y-6">
          <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-6">
            {/* Question Badge & Autosave status */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-bold">
                  Question {currentIndex + 1}
                </span>
                {currentQ.chapter_name && (
                  <span className="text-slate-400 font-sans">{currentQ.chapter_name}</span>
                )}
                <span className="text-slate-500">• +{currentQ.marks} mark</span>
                {attempt.negative_marking && currentQ.negative_marks > 0 && (
                  <span className="text-red-400">• -{currentQ.negative_marks} neg</span>
                )}
              </div>

              <div>
                {autosaveStatus === "saving" && (
                  <span className="text-amber-400 text-[11px] animate-pulse">Saving answer...</span>
                )}
                {autosaveStatus === "saved" && (
                  <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Autosaved
                  </span>
                )}
              </div>
            </div>

            {/* Question Text with KaTeX formulas */}
            <div className="text-white text-lg sm:text-xl font-medium leading-relaxed">
              <MathText text={currentQ.question} />
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {(["A", "B", "C", "D"] as const).map((optKey) => {
                const optText =
                  optKey === "A"
                    ? currentQ.option_a
                    : optKey === "B"
                    ? currentQ.option_b
                    : optKey === "C"
                    ? currentQ.option_c
                    : currentQ.option_d;

                const isSelected = selectedAnswers[currentQ.tqId] === optKey;

                return (
                  <button
                    key={optKey}
                    type="button"
                    onClick={() => handleSelectOption(optKey)}
                    className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                        : "bg-slate-950/70 border-slate-800/90 text-slate-300 hover:border-slate-700 hover:bg-slate-950"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {optKey}
                    </span>
                    <div className="flex-1 text-sm sm:text-base pt-0.5">
                      <MathText text={optText} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls Bar */}
          <div className="flex items-center justify-between p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 rounded-xl text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {selectedAnswers[currentQ.tqId] && (
              <button
                onClick={handleClearAnswer}
                className="text-xs font-mono text-slate-400 hover:text-red-400 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Selection</span>
              </button>
            )}

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/30"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleManualSubmit}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-emerald-600/30"
              >
                <span>Review & Submit</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>

        {/* Right Column: Question Navigator */}
        <aside className="lg:col-span-4 p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Question Navigator</h3>
              <span className="text-xs font-mono text-slate-400">
                {answeredCount}/{totalQuestions} Answered
              </span>
            </div>

            {/* Navigator Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 pt-4">
              {attempt.questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!selectedAnswers[q.tqId];

                return (
                  <button
                    key={q.tqId}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl font-mono text-xs font-bold transition-all relative flex items-center justify-center ${
                      isCurrent
                        ? "ring-2 ring-indigo-400 bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105 z-10"
                        : isAnswered
                        ? "bg-emerald-600/25 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/40"
                        : "bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-6 border-t border-slate-800/80 mt-6 space-y-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600/30 border border-emerald-500/60" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-800" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-indigo-600 ring-2 ring-indigo-400" />
                <span>Current Question</span>
              </div>
            </div>
          </div>

          {/* Quick Submit CTA */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleManualSubmit}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Examination</span>
            </button>
          </div>
        </aside>
      </div>

      {/* CONFIRM SUBMISSION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-4">
              <Send className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white">Submit Examination?</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Once submitted, your responses will be locked and authoritatively graded by the backend. You cannot
              modify your answers after submission.
            </p>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Questions:</span>
                <span className="font-bold text-white">{totalQuestions}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Answered:</span>
                <span className="font-bold">{answeredCount}</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Unanswered:</span>
                  <span className="font-bold">{unansweredCount}</span>
                </div>
              )}
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-300 mb-5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  You still have {unansweredCount} unanswered questions. Are you sure you want to finish now?
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 border border-slate-700 hover:bg-slate-800 rounded-xl text-sm text-slate-300 font-medium"
              >
                Continue Exam
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Yes, Submit Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
