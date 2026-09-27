import React, { useState } from "react";
import { portalStorage } from "@/lib/portal-storage";
import { TestItem, ChapterItem, MCQItem } from "@/lib/portal-types";
import { MathText } from "@/components/MathText";
import {
  FileText,
  Plus,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  Shuffle,
  Eye,
  Edit2,
  X,
  Check,
  Search,
  Filter,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface TestBuilderProps {
  onAssignTest?: (testId: string) => void;
}

export function TestBuilder({ onAssignTest }: TestBuilderProps) {
  const [tests, setTests] = useState<TestItem[]>(portalStorage.getTests());
  const [chapters] = useState<ChapterItem[]>(portalStorage.getChapters());
  const [mcqs] = useState<MCQItem[]>(portalStorage.getMCQs());

  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState<TestItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    chapter_id: chapters[0]?.id || "",
    duration_minutes: 15,
    passing_percentage: 50,
    negative_marking: true,
    starts_at: new Date().toISOString().slice(0, 16),
    ends_at: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    max_attempts: 1,
    randomize_questions: true,
    randomize_options: true,
    show_result: true,
    show_correct_answers: true,
    show_explanations: true,
    status: "active" as TestItem["status"],
    question_ids: [] as string[],
  });

  // Question Picker Drawer inside Modal
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerChapter, setPickerChapter] = useState("all");

  const refreshTests = () => {
    setTests(portalStorage.getTests());
  };

  const openCreateModal = () => {
    setEditingTest(null);
    setFormData({
      title: "",
      description: "",
      chapter_id: chapters[0]?.id || "",
      duration_minutes: 15,
      passing_percentage: 50,
      negative_marking: true,
      starts_at: new Date().toISOString().slice(0, 16),
      ends_at: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
      max_attempts: 1,
      randomize_questions: true,
      randomize_options: true,
      show_result: true,
      show_correct_answers: true,
      show_explanations: true,
      status: "active",
      question_ids: mcqs.slice(0, 5).map((m) => m.id),
    });
    setShowModal(true);
  };

  const openEditModal = (t: TestItem) => {
    setEditingTest(t);
    setFormData({
      title: t.title,
      description: t.description || "",
      chapter_id: t.chapter_id || chapters[0]?.id || "",
      duration_minutes: t.duration_minutes,
      passing_percentage: t.passing_percentage,
      negative_marking: t.negative_marking,
      starts_at: t.starts_at ? new Date(t.starts_at).toISOString().slice(0, 16) : "",
      ends_at: t.ends_at ? new Date(t.ends_at).toISOString().slice(0, 16) : "",
      max_attempts: t.max_attempts,
      randomize_questions: t.randomize_questions,
      randomize_options: t.randomize_options,
      show_result: t.show_result,
      show_correct_answers: t.show_correct_answers,
      show_explanations: t.show_explanations,
      status: t.status,
      question_ids: t.questions.map((q) => q.mcq_id),
    });
    setShowModal(true);
  };

  const toggleQuestionSelection = (mcqId: string) => {
    setFormData((prev) => {
      const exists = prev.question_ids.includes(mcqId);
      const newIds = exists
        ? prev.question_ids.filter((id) => id !== mcqId)
        : [...prev.question_ids, mcqId];
      return { ...prev, question_ids: newIds };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Test title is required.");
      return;
    }
    if (formData.question_ids.length === 0) {
      toast.error("Please select at least 1 question for the examination.");
      return;
    }

    try {
      if (editingTest) {
        portalStorage.updateTest(editingTest.id, {
          ...formData,
          starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
          ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null,
        });
        toast.success("Test configuration updated.");
      } else {
        portalStorage.createTest({
          ...formData,
          starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
          ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null,
        });
        toast.success("New test created and published.");
      }
      setShowModal(false);
      refreshTests();
    } catch (err: any) {
      toast.error(err.message || "Failed to save test.");
    }
  };

  const selectedMCQs = mcqs.filter((m) => formData.question_ids.includes(m.id));
  const calculatedMarks = selectedMCQs.reduce((acc, cur) => acc + cur.marks, 0);

  const filteredPickerMCQs = mcqs.filter((m) => {
    if (pickerChapter !== "all" && m.chapter_id !== pickerChapter) return false;
    if (pickerSearch) {
      const q = pickerSearch.toLowerCase();
      return m.question.toLowerCase().includes(q) || (m.chapter_name && m.chapter_name.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <span>Test Builder & Exam Creator</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Configure test parameters • Select MCQs • Server-authoritative timing & scoring rules
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 neu-btn-primary rounded-xl text-sm font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Test</span>
        </button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-2xl neu-raised hover:neu-raised-lg transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-primary font-bold uppercase">
                  {t.chapter_name || "Physics Test"}
                </span>
                <h3 className="text-lg font-bold text-foreground tracking-tight mt-0.5">{t.title}</h3>
                {t.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>}
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono uppercase font-bold neu-inset-sm ${
                  t.status === "active"
                    ? "text-emerald-500"
                    : t.status === "draft"
                    ? "text-muted-foreground"
                    : "text-amber-500"
                }`}
              >
                {t.status}
              </span>
            </div>

            {/* Test Stats */}
            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl neu-inset text-xs font-mono">
              <div>
                <span className="text-muted-foreground block text-[11px]">Questions</span>
                <span className="text-sm font-bold text-foreground">{t.question_count} MCQs</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Duration</span>
                <span className="text-sm font-bold text-primary">{t.duration_minutes} min</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Total Marks</span>
                <span className="text-sm font-bold text-emerald-500">{t.total_marks} pts</span>
              </div>
            </div>

            {/* Settings pills */}
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              <span className="px-2.5 py-0.5 neu-raised-sm rounded-lg text-foreground">
                Pass: {t.passing_percentage}%
              </span>
              {t.negative_marking ? (
                <span className="px-2.5 py-0.5 neu-raised-sm text-destructive font-bold rounded-lg">
                  Negative Marking: Yes
                </span>
              ) : (
                <span className="px-2.5 py-0.5 neu-raised-sm text-muted-foreground rounded-lg">
                  No Negative Marks
                </span>
              )}
              {t.randomize_questions && (
                <span className="px-2.5 py-0.5 neu-raised-sm text-primary font-bold rounded-lg">
                  Random Questions
                </span>
              )}
              {t.randomize_options && (
                <span className="px-2.5 py-0.5 neu-raised-sm text-primary font-bold rounded-lg">
                  Random Options
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <div className="text-[11px] text-muted-foreground font-mono">
                {t.max_attempts} max {t.max_attempts === 1 ? "attempt" : "attempts"}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAssignTest?.(t.id)}
                  className="px-3.5 py-1.5 neu-btn text-primary rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Assign Test</span>
                </button>

                <button
                  onClick={() => openEditModal(t)}
                  className="px-3.5 py-1.5 neu-btn text-foreground rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Config</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT TEST MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl neu-raised-lg rounded-3xl p-6 sm:p-7 text-foreground my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">
                  {editingTest ? "Edit Test Configuration" : "Build New Physics Test"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-xl neu-btn-interactive cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Test Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Chapter 3: Motion and Force Examination"
                    className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Physics Chapter
                  </label>
                  <select
                    value={formData.chapter_id}
                    onChange={(e) => setFormData({ ...formData, chapter_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        Chapter {c.chapter_number}: {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                  Description / Instructions for Students
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Read each question carefully. Formulas must be verified. Negative marking applies."
                  className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-sans"
                />
              </div>

              {/* Timing & Scoring Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl neu-inset">
                <div>
                  <label className="block text-[11px] font-mono text-muted-foreground uppercase mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    required
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg neu-inset text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted-foreground uppercase mb-1">Passing %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.passing_percentage}
                    onChange={(e) => setFormData({ ...formData, passing_percentage: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg neu-inset text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted-foreground uppercase mb-1">Max Attempts</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.max_attempts}
                    onChange={(e) => setFormData({ ...formData, max_attempts: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg neu-inset text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted-foreground uppercase mb-1">Test Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl neu-inset text-xs">
                <label className="flex items-center gap-2 text-foreground cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.negative_marking}
                    onChange={(e) => setFormData({ ...formData, negative_marking: e.target.checked })}
                    className="rounded text-primary focus:ring-primary/40 w-4 h-4 cursor-pointer"
                  />
                  <span>Negative Marking</span>
                </label>

                <label className="flex items-center gap-2 text-foreground cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.randomize_questions}
                    onChange={(e) => setFormData({ ...formData, randomize_questions: e.target.checked })}
                    className="rounded text-primary focus:ring-primary/40 w-4 h-4 cursor-pointer"
                  />
                  <span>Randomize Question Order</span>
                </label>

                <label className="flex items-center gap-2 text-foreground cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.randomize_options}
                    onChange={(e) => setFormData({ ...formData, randomize_options: e.target.checked })}
                    className="rounded text-primary focus:ring-primary/40 w-4 h-4 cursor-pointer"
                  />
                  <span>Randomize Option Order</span>
                </label>
              </div>

              {/* Result Permission Toggles */}
              <div className="p-3.5 rounded-2xl neu-inset text-xs space-y-2">
                <span className="font-mono uppercase text-primary font-bold block text-[10px]">
                  Student Result Permissions
                </span>
                <div className="flex flex-wrap gap-4 text-foreground">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={formData.show_result}
                      onChange={(e) => setFormData({ ...formData, show_result: e.target.checked })}
                      className="rounded text-primary focus:ring-primary/40 w-4 h-4 cursor-pointer"
                    />
                    <span>Show Instant Result</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={formData.show_correct_answers}
                      onChange={(e) => setFormData({ ...formData, show_correct_answers: e.target.checked })}
                      className="rounded text-primary focus:ring-primary/40 w-4 h-4 cursor-pointer"
                    />
                    <span>Show Correct Answers</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={formData.show_explanations}
                      onChange={(e) => setFormData({ ...formData, show_explanations: e.target.checked })}
                      className="rounded text-primary focus:ring-primary/40 w-4 h-4 cursor-pointer"
                    />
                    <span>Show Explanations</span>
                  </label>
                </div>
              </div>

              {/* QUESTION SELECTION SECTION */}
              <div className="rounded-2xl p-4 neu-inset space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Select MCQs for this Test</h4>
                    <p className="text-xs text-muted-foreground font-mono">
                      Selected: <span className="text-primary font-bold">{formData.question_ids.length}</span> questions |
                      Total Marks: <span className="text-emerald-500 font-bold">{calculatedMarks}</span> | Duration:{" "}
                      <span className="text-amber-500 font-bold">{formData.duration_minutes} min</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="text"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Search questions..."
                      className="px-3 py-1.5 rounded-lg neu-inset text-foreground text-xs placeholder:text-muted-foreground"
                    />
                    <select
                      value={pickerChapter}
                      onChange={(e) => setPickerChapter(e.target.value)}
                      className="px-3 py-1.5 rounded-lg neu-inset text-foreground text-xs"
                    >
                      <option value="all">All Chapters</option>
                      {chapters.map((c) => (
                        <option key={c.id} value={c.id}>
                          Ch {c.chapter_number}: {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* MCQs picker list */}
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {filteredPickerMCQs.map((m, i) => {
                    const isSelected = formData.question_ids.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => toggleQuestionSelection(m.id)}
                        className={`p-3 rounded-xl flex items-start gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? "neu-inset text-foreground border border-primary/50"
                            : "neu-raised hover:neu-raised-lg text-foreground"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? "neu-btn-primary text-white"
                              : "neu-inset-sm text-transparent"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1 text-xs space-y-1">
                          <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                            <span>#{i + 1}</span>
                            <span>{m.chapter_name}</span>
                            <span className="capitalize">• {m.difficulty}</span>
                            <span className="text-emerald-500">• {m.marks} mark</span>
                          </div>
                          <div className="font-medium text-foreground">
                            <MathText text={m.question} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 neu-btn rounded-xl text-sm text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 neu-btn-primary rounded-xl text-sm font-semibold cursor-pointer"
                >
                  {editingTest ? "Update Test" : "Create and Publish Test"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
