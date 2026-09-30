import React, { useState } from "react";
import { portalStorage } from "@/lib/portal-storage";
import { MCQItem, ChapterItem, TopicItem } from "@/lib/portal-types";
import { MathText } from "@/components/MathText";
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Eye,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export function QuestionBank() {
  const [mcqs, setMCQs] = useState<MCQItem[]>(portalStorage.getMCQs());
  const [chapters] = useState<ChapterItem[]>(portalStorage.getChapters());
  const [topics] = useState<TopicItem[]>(portalStorage.getTopics());

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [chapterFilter, setChapterFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  // Create / Edit MCQ Modal
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingMCQ, setEditingMCQ] = useState<MCQItem | null>(null);
  const [formData, setFormData] = useState<{
    chapter_id: string;
    topic_id: string;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: "A" | "B" | "C" | "D";
    explanation: string;
    difficulty: "easy" | "medium" | "hard";
    marks: number;
    negative_marks: number;
    status: "active" | "draft" | "archived";
  }>({
    chapter_id: chapters[0]?.id || "",
    topic_id: "",
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    explanation: "",
    difficulty: "medium",
    marks: 1,
    negative_marks: 0.25,
    status: "active",
  });

  // Bulk CSV Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState("");
  const [importValidation, setImportValidation] = useState<{
    tested: boolean;
    total: number;
    valid: number;
    invalid: number;
    errors: string[];
  } | null>(null);

  const refreshList = () => {
    setMCQs(
      portalStorage.getMCQs({
        search: searchTerm,
        chapterId: chapterFilter,
        difficulty: difficultyFilter,
        status: statusFilter,
      })
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setMCQs(
      portalStorage.getMCQs({
        search: e.target.value,
        chapterId: chapterFilter,
        difficulty: difficultyFilter,
        status: statusFilter,
      })
    );
  };

  const handleFilterChange = (ch: string, diff: string, st: string) => {
    setChapterFilter(ch);
    setDifficultyFilter(diff);
    setStatusFilter(st);
    setMCQs(
      portalStorage.getMCQs({
        search: searchTerm,
        chapterId: ch,
        difficulty: diff,
        status: st,
      })
    );
  };

  const openCreateModal = () => {
    setEditingMCQ(null);
    setFormData({
      chapter_id: chapters[0]?.id || "",
      topic_id: "",
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "A",
      explanation: "",
      difficulty: "medium",
      marks: 1,
      negative_marks: 0.25,
      status: "active",
    });
    setShowEditorModal(true);
  };

  const openEditModal = (m: MCQItem) => {
    setEditingMCQ(m);
    setFormData({
      chapter_id: m.chapter_id || "",
      topic_id: m.topic_id || "",
      question: m.question,
      option_a: m.option_a,
      option_b: m.option_b,
      option_c: m.option_c,
      option_d: m.option_d,
      correct_answer: m.correct_answer,
      explanation: m.explanation || "",
      difficulty: m.difficulty,
      marks: m.marks,
      negative_marks: m.negative_marks,
      status: m.status,
    });
    setShowEditorModal(true);
  };

  const insertFormulaSnippet = (formula: string) => {
    setFormData((prev) => ({
      ...prev,
      question: prev.question ? `${prev.question} ${formula}` : formula,
    }));
  };

  const handleEditorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.option_a.trim() || !formData.option_b.trim()) {
      toast.error("Question text and at least options A & B are required.");
      return;
    }

    try {
      if (editingMCQ) {
        portalStorage.updateMCQ(editingMCQ.id, formData);
        toast.success(`MCQ updated (now version ${editingMCQ.version + 1})`);
      } else {
        portalStorage.createMCQ(formData);
        toast.success("Physics MCQ saved to Question Bank.");
      }
      setShowEditorModal(false);
      refreshList();
    } catch (err: any) {
      toast.error(err.message || "Failed to save MCQ.");
    }
  };

  const handleDelete = (m: MCQItem) => {
    if (!window.confirm("Archive this MCQ from active question bank?")) return;
    try {
      portalStorage.deleteMCQ(m.id);
      toast.success("MCQ archived.");
      refreshList();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete MCQ.");
    }
  };

  const handleValidateCsv = () => {
    if (!importCsvText.trim()) {
      toast.error("Please paste CSV data.");
      return;
    }

    const lines = importCsvText.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      toast.error("CSV must contain a header row and at least one data row.");
      return;
    }

    // Skip header
    const rows = lines.slice(1).map((line) => {
      const cols = line.split(",").map((c) => c.replace(/^["']|["']$/g, "").trim());
      return {
        chapter: cols[0] || "",
        topic: cols[1] || "",
        question: cols[2] || "",
        option_a: cols[3] || "",
        option_b: cols[4] || "",
        option_c: cols[5] || "",
        option_d: cols[6] || "",
        correct_answer: cols[7] || "",
        explanation: cols[8] || "",
        difficulty: cols[9] || "medium",
        marks: Number(cols[10]) || 1,
        negative_marks: Number(cols[11]) || 0,
      };
    });

    const check = portalStorage.bulkImportMCQs(rows);
    setImportValidation({
      tested: true,
      total: check.total,
      valid: check.valid,
      invalid: check.invalid,
      errors: check.errors,
    });
    if (check.invalid === 0) {
      toast.success(`All ${check.valid} rows valid and imported!`);
      setShowImportModal(false);
      setImportCsvText("");
      setImportValidation(null);
      refreshList();
    } else {
      toast.error(`Found ${check.invalid} invalid rows. Please review below.`);
    }
  };

  const exportCsv = () => {
    const header = "chapter,topic,question,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,marks,negative_marks\n";
    const body = mcqs
      .map(
        (m) =>
          `"${m.chapter_name || ""}","${m.topic_name || ""}","${m.question.replace(/"/g, '""')}","${m.option_a.replace(/"/g, '""')}","${m.option_b.replace(/"/g, '""')}","${m.option_c.replace(/"/g, '""')}","${m.option_d.replace(/"/g, '""')}","${m.correct_answer}","${(m.explanation || "").replace(/"/g, '""')}","${m.difficulty}",${m.marks},${m.negative_marks}`
      )
      .join("\n");

    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Physics_Question_Bank_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Question bank exported as CSV");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" />
            <span>Centralized Question Bank</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            KaTeX mathematical equations • Immutable attempt snapshot versioning • Bulk CSV import/export
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 neu-btn rounded-xl text-xs font-semibold cursor-pointer text-foreground"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Bulk CSV Import</span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 neu-btn rounded-xl text-xs font-semibold cursor-pointer text-foreground"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 neu-btn-primary rounded-xl text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add MCQ</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl neu-raised">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search questions or formula text..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={chapterFilter}
            onChange={(e) => handleFilterChange(e.target.value, difficultyFilter, statusFilter)}
            className="w-full py-2.5 px-3 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Chapters</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                Ch {c.chapter_number}: {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={difficultyFilter}
            onChange={(e) => handleFilterChange(chapterFilter, e.target.value, statusFilter)}
            className="w-full py-2.5 px-3 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(chapterFilter, difficultyFilter, e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* MCQs List */}
      <div className="space-y-4">
        {mcqs.length === 0 ? (
          <div className="p-12 text-center neu-inset rounded-2xl text-muted-foreground font-mono text-xs">
            No questions found matching the selected criteria.
          </div>
        ) : (
          mcqs.map((m, idx) => (
            <div
              key={m.id}
              className="p-6 rounded-2xl neu-raised hover:neu-raised-lg transition-all space-y-3"
            >
              {/* Question header info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/60 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="neu-inset-sm text-primary px-2.5 py-0.5 rounded-lg font-bold">
                    MCQ #{idx + 1}
                  </span>
                  <span className="text-foreground font-sans font-semibold">{m.chapter_name || "General"}</span>
                  {m.topic_name && <span className="text-muted-foreground">• {m.topic_name}</span>}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md neu-inset-sm capitalize font-bold ${
                      m.difficulty === "easy"
                        ? "text-emerald-500"
                        : m.difficulty === "medium"
                        ? "text-amber-500"
                        : "text-destructive"
                    }`}
                  >
                    {m.difficulty}
                  </span>

                  <span className="text-muted-foreground font-semibold">
                    +{m.marks} / -{m.negative_marks} marks
                  </span>

                  <span className="text-muted-foreground">v{m.version}</span>

                  <div className="flex items-center gap-1.5 pl-2 border-l border-border/60">
                    <button
                      onClick={() => openEditModal(m)}
                      title="Edit MCQ"
                      className="p-1.5 neu-btn rounded-xl text-muted-foreground hover:text-primary cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m)}
                      title="Archive MCQ"
                      className="p-1.5 neu-btn rounded-xl text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Text with KaTeX */}
              <div className="text-foreground text-base font-medium leading-relaxed neu-ruled p-3 rounded-xl">
                <MathText text={m.question} />
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 font-sans text-sm">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const text =
                    opt === "A" ? m.option_a : opt === "B" ? m.option_b : opt === "C" ? m.option_c : m.option_d;
                  const isCorrect = m.correct_answer === opt;

                  return (
                    <div
                      key={opt}
                      className={`p-3 rounded-xl flex items-start gap-2.5 transition-all ${
                        isCorrect
                          ? "neu-raised border border-emerald-500/50 text-emerald-600 dark:text-emerald-300 font-semibold"
                          : "neu-inset text-foreground"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                          isCorrect ? "neu-btn-emerald text-white" : "neu-inset-sm text-muted-foreground"
                        }`}
                      >
                        {opt}
                      </span>
                      <div className="flex-1">
                        <MathText text={text} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation (if present) */}
              {m.explanation && (
                <div className="p-3.5 rounded-xl neu-inset text-xs text-foreground space-y-1">
                  <span className="font-mono uppercase text-primary font-bold block text-[10px]">
                    Explanation:
                  </span>
                  <div>
                    <MathText text={m.explanation} />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MCQ MODAL */}
      {showEditorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl neu-raised-lg rounded-3xl p-6 sm:p-7 text-foreground my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">
                  {editingMCQ ? `Edit MCQ (creates version ${editingMCQ.version + 1})` : "Create Physics MCQ"}
                </h3>
              </div>
              <button
                onClick={() => setShowEditorModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-xl neu-btn-interactive cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditorSubmit} className="space-y-4 mt-4">
              {/* Formula Toolbar */}
              <div className="p-3 rounded-2xl neu-inset space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-primary font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>KaTeX Formula Quick Inserts (Click to append):</span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                  {[
                    { label: "$F = ma$", code: "$F = ma$" },
                    { label: "$\\lambda = \\frac{h}{p}$", code: "$\\lambda = \\frac{h}{p}$" },
                    { label: "$E = mc^2$", code: "$E = mc^2$" },
                    { label: "$v = u + at$", code: "$v = u + at$" },
                    { label: "$V = IR$", code: "$V = IR$" },
                    { label: "Fraction $\\frac{a}{b}$", code: "$\\frac{a}{b}$" },
                    { label: "Sqrt $\\sqrt{x}$", code: "$\\sqrt{x}$" },
                    { label: "$\\theta$", code: "$\\theta$" },
                    { label: "$\\mu_s$", code: "$\\mu_s$" },
                    { label: "$\\Delta t$", code: "$\\Delta t$" },
                    { label: "$\\text{m/s}^2$", code: "$\\text{m/s}^2$" },
                    { label: "$\\Omega$", code: "$\\Omega$" },
                  ].map((btn, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => insertFormulaSnippet(btn.code)}
                      className="px-2.5 py-1 neu-btn rounded-lg text-foreground transition-all cursor-pointer font-semibold"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chapter & Topic Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">Chapter *</label>
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

                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value as "easy" | "medium" | "hard" })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                  Question Text (KaTeX formulas enclosed in $...$) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. A mass $m = 5\\text{ kg}$ is accelerated by a force $F = 25\\text{ N}$..."
                  className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                />
              </div>

              {/* Live Preview Box */}
              {formData.question && (
                <div className="p-3.5 rounded-2xl neu-inset">
                  <span className="text-[10px] font-mono text-primary uppercase font-bold block mb-1">
                    Live Formula Render:
                  </span>
                  <div className="text-foreground text-sm font-medium">
                    <MathText text={formData.question} />
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-medium text-foreground uppercase">
                  Options (A, B, C, D) *
                </label>
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const key = `option_${opt.toLowerCase()}` as keyof typeof formData;
                  return (
                    <div key={opt} className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl neu-inset flex items-center justify-center font-mono text-xs font-bold text-primary shrink-0">
                        {opt}
                      </span>
                      <input
                        type="text"
                        required
                        value={formData[key] as string}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        placeholder={`Option ${opt} text or formula (e.g. $5.0\\text{ m/s}^2$)`}
                        className="flex-1 px-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Correct Answer & Marks */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Correct Answer *
                  </label>
                  <select
                    value={formData.correct_answer}
                    onChange={(e) =>
                      setFormData({ ...formData, correct_answer: e.target.value as "A" | "B" | "C" | "D" })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm font-bold text-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Marks Awarded
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Negative Marks
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.negative_marks}
                    onChange={(e) => setFormData({ ...formData, negative_marks: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                  Explanation (Supports KaTeX formulas)
                </label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="e.g. Using Newton's Second Law $a = \\frac{F}{m} = \\frac{25}{5} = 5\\text{ m/s}^2$."
                  className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditorModal(false)}
                  className="px-4 py-2.5 neu-btn rounded-xl text-sm text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 neu-btn-primary rounded-xl text-sm font-semibold cursor-pointer"
                >
                  {editingMCQ ? "Update Question Version" : "Save to Question Bank"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK CSV IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl neu-raised-lg rounded-3xl p-6 sm:p-7 text-foreground animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-lg text-foreground">Bulk CSV Import for MCQs</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-xl neu-btn-interactive cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div className="p-3.5 rounded-2xl neu-inset text-xs text-muted-foreground font-mono space-y-1">
                <div className="text-primary font-bold uppercase">Expected CSV Format (12 columns):</div>
                <div className="overflow-x-auto text-[11px] text-foreground">
                  chapter,topic,question,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,marks,negative_marks
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                  Paste CSV Text
                </label>
                <textarea
                  rows={8}
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  placeholder={`chapter,topic,question,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,marks,negative_marks
Motion and Force,Newton's Laws,Force is given by?,F = ma,F = mv,F = m/a,F = a/m,A,By second law,easy,1,0.25`}
                  className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {/* Validation errors summary */}
              {importValidation && (
                <div className="p-3.5 rounded-2xl neu-inset space-y-2 text-xs">
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-foreground">Total: {importValidation.total}</span>
                    <span className="text-emerald-500 font-bold">Valid: {importValidation.valid}</span>
                    <span className="text-destructive font-bold">Invalid: {importValidation.invalid}</span>
                  </div>
                  {importValidation.errors.length > 0 && (
                    <div className="max-h-28 overflow-y-auto space-y-1 text-destructive font-mono text-[11px]">
                      {importValidation.errors.map((err, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{err}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2.5 neu-btn rounded-xl text-sm text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleValidateCsv}
                  className="px-5 py-2.5 neu-btn-emerald rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Validate & Import CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
