import React, { useState, useEffect, useRef } from "react";
import { portalStorage } from "@/lib/portal-storage";
import { AttemptItem, ResultItem } from "@/lib/portal-types";
import { MathText } from "@/components/MathText";
import { ThemeToggle } from "@/lib/theme";
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

    // Save progress to portal storage
    setAutosaveStatus("saving");
    try {
      portalStorage.recordAnswer(attempt.id, currentQ.tqId, option);
      setTimeout(() => setAutosaveStatus("saved"), 300);
      setTimeout(() => setAutosaveStatus("idle"), 2500);
    } catch (err) {
      setAutosaveStatus("idle");
    }
  };

  const handleClearAnswer = () => {
    if (!attempt) return;
    const currentQ = attempt.questions[currentIndex];
    if (!currentQ) return;

    const newAnswers = { ...selectedAnswers, [currentQ.tqId]: null };
    setSelectedAnswers(newAnswers);

    setAutosaveStatus("saving");
    try {
      portalStorage.recordAnswer(attempt.id, currentQ.tqId, null);
      setTimeout(() => setAutosaveStatus("saved"), 300);
      setTimeout(() => setAutosaveStatus("idle"), 2500);
    } catch (err) {
      setAutosaveStatus("idle");
    }
  };

  const handleManualSubmit = () => {
    setShowConfirmModal(true);
  };

  const handleAutoSubmit = () => {
    if (isSubmitting) return;
    toast.warning("Time limit expired. Automatically submitting examination...");
    confirmSubmit();
  };

  const confirmSubmit = () => {
    if (!attempt || isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const result = portalStorage.submitAttempt(attempt.id);
      toast.success("Examination submitted and scored successfully!");
      onSubmitted(result);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit examination.");
      setIsSubmitting(false);
    }
  };

  if (!attempt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-mono text-sm">
        <div className="p-6 rounded-2xl neu-raised flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing exam session...</span>
        </div>
      </div>
    );
  }

  const currentQ = attempt.questions[currentIndex];
  if (!currentQ) return null;
  const totalQuestions = attempt.questions.length;
  const answeredCount = Object.values(selectedAnswers).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Format timer
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isTimeCritical = secondsRemaining < 120; // Under 2 minutes

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      {/* EXAM HEADER - FIXED AT TOP */}
      <header className="sticky top-0 z-30 neu-header backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate max-w-xs sm:max-w-md">
            {attempt.test_title}
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-0.5">
            <span>
              Question <strong className="text-foreground">{currentIndex + 1}</strong> of {totalQuestions}
            </span>
            <span>•</span>
            <span className="text-primary font-semibold">{answeredCount} answered</span>
          </div>
        </div>

        {/* Server Authoritative Countdown Timer & Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-sm sm:text-base tracking-wider transition-all ${
              isTimeCritical
                ? "bg-destructive/20 text-destructive border border-destructive/40 animate-pulse"
                : "neu-inset text-primary"
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimeCritical ? "text-destructive" : "text-primary"}`} />
            <span>{formattedTime}</span>
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 neu-btn-emerald rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
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
          <div className="p-6 sm:p-8 rounded-3xl neu-raised space-y-6 relative overflow-hidden">
            {/* Question Badge & Autosave status */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg neu-inset text-primary font-bold">
                  Question {currentIndex + 1}
                </span>
                {currentQ.chapter_name && (
                  <span className="text-muted-foreground font-sans">{currentQ.chapter_name}</span>
                )}
                <span className="text-muted-foreground">• +{currentQ.marks} mark</span>
                {attempt.negative_marking && currentQ.negative_marks > 0 && (
                  <span className="text-destructive">• -{currentQ.negative_marks} neg</span>
                )}
              </div>

              <div>
                {autosaveStatus === "saving" && (
                  <span className="text-amber-500 text-[11px] animate-pulse">Saving answer...</span>
                )}
                {autosaveStatus === "saved" && (
                  <span className="text-emerald-500 text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Autosaved
                  </span>
                )}
              </div>
            </div>

            {/* Question Text with KaTeX formulas */}
            <div className="text-foreground text-lg sm:text-xl font-medium leading-relaxed neu-ruled p-3 rounded-xl">
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
                    className={`w-full p-4 rounded-2xl text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? "neu-inset border border-primary/50 text-foreground"
                        : "neu-raised hover:neu-raised-lg text-foreground"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 transition-all ${
                        isSelected
                          ? "neu-btn-primary text-white"
                          : "neu-inset-sm text-muted-foreground"
                      }`}
                    >
                      {optKey}
                    </span>
                    <div className="flex-1 text-sm sm:text-base pt-0.5 font-medium">
                      <MathText text={optText} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl neu-raised">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 neu-btn rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {selectedAnswers[currentQ.tqId] && (
              <button
                onClick={handleClearAnswer}
                className="text-xs font-mono text-muted-foreground hover:text-destructive flex items-center gap-1 px-3 py-1.5 rounded-lg neu-btn-interactive cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Selection</span>
              </button>
            )}

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="flex items-center gap-1.5 px-5 py-2.5 neu-btn-primary rounded-xl text-sm font-semibold cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleManualSubmit}
                className="flex items-center gap-1.5 px-5 py-2.5 neu-btn-emerald rounded-xl text-sm font-semibold cursor-pointer"
              >
                <span>Review & Submit</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>

        {/* Right Column: Question Navigator */}
        <aside className="lg:col-span-4 p-6 rounded-3xl neu-raised flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-bold text-foreground text-sm">Question Navigator</h3>
              <span className="text-xs font-mono text-muted-foreground font-semibold">
                {answeredCount}/{totalQuestions} Answered
              </span>
            </div>

            {/* Navigator Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5 pt-4">
              {attempt.questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!selectedAnswers[q.tqId];

                return (
                  <button
                    key={q.tqId}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl font-mono text-xs font-bold transition-all relative flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? "neu-btn-primary ring-2 ring-primary scale-105 z-10"
                        : isAnswered
                        ? "neu-raised text-emerald-500 border border-emerald-500/40"
                        : "neu-inset text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-6 border-t border-border/60 mt-6 space-y-2 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-lg neu-raised text-emerald-500 border border-emerald-500/40 inline-block" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-lg neu-inset inline-block" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-lg neu-btn-primary inline-block" />
                <span>Current Question</span>
              </div>
            </div>
          </div>

          {/* Quick Submit CTA */}
          <div className="pt-4 border-t border-border/60">
            <button
              onClick={handleManualSubmit}
              className="w-full py-3 px-4 neu-btn-emerald font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Examination</span>
            </button>
          </div>
        </aside>
      </div>

      {/* CONFIRM SUBMISSION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md neu-raised-lg rounded-3xl p-6 sm:p-7 text-foreground animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 neu-inset rounded-2xl text-primary flex items-center justify-center mb-4">
              <Send className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground">Submit Examination?</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Once submitted, your responses will be locked and authoritatively graded by the backend. You cannot
              modify your answers after submission.
            </p>

            <div className="p-4 rounded-2xl neu-inset space-y-2 font-mono text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Questions:</span>
                <span className="font-bold text-foreground">{totalQuestions}</span>
              </div>
              <div className="flex justify-between text-emerald-500 font-bold">
                <span>Answered:</span>
                <span>{answeredCount}</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex justify-between text-amber-500 font-bold">
                  <span>Unanswered:</span>
                  <span>{unansweredCount}</span>
                </div>
              )}
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2 text-xs text-amber-500 mb-5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <span>
                  You still have {unansweredCount} unanswered questions. Are you sure you want to finish now?
                </span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 neu-btn rounded-xl text-sm text-foreground font-medium cursor-pointer"
              >
                Continue Exam
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 neu-btn-emerald rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
