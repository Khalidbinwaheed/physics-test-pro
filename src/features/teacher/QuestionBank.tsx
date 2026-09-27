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

  const openEditModal = (item: MCQItem) => {
    setEditingMCQ(item);
    setFormData({
      chapter_id: item.chapter_id || chapters[0]?.id || "",
      topic_id: item.topic_id || "",
      question: item.question,
      option_a: item.option_a,
      option_b: item.option_b,
      option_c: item.option_c,
      option_d: item.option_d,
      correct_answer: item.correct_answer,
      explanation: item.explanation || "",
      difficulty: item.difficulty,
      marks: item.marks,
      negative_marks: item.negative_marks,
      status: item.status,
    });
    setShowEditorModal(true);
  };

  const insertFormulaSnippet = (snippet: string) => {
    setFormData((prev) => ({
      ...prev,
      question: prev.question + " " + snippet,
    }));
  };

  const handleEditorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      toast.error("Question text is required.");
      return;
    }
    if (!formData.option_a.trim() || !formData.option_b.trim() || !formData.option_c.trim() || !formData.option_d.trim()) {
      toast.error("All 4 options (A, B, C, D) are required.");
      return;
    }

    try {
      if (editingMCQ) {
        portalStorage.updateMCQ(editingMCQ.id, formData);
        toast.success(`Question updated (New version created to preserve past attempts).`);
      } else {
        portalStorage.createMCQ(formData);
        toast.success("New MCQ added to Question Bank.");
      }
      setShowEditorModal(false);
      refreshList();
    } catch (err: any) {
      toast.error(err.message || "Failed to save question.");
    }
  };

  const handleDelete = (item: MCQItem) => {
    if (confirm("Are you sure you want to archive this question? Past test attempts will retain their frozen snapshot.")) {
      portalStorage.deleteMCQ(item.id);
      refreshList();
      toast.info("Question archived.");
    }
  };

  // CSV Parsing & Validation
  const handleValidateCsv = () => {
    if (!importCsvText.trim()) {
      toast.error("Please enter or paste CSV content.");
      return;
    }

    const lines = importCsvText.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      toast.error("CSV must contain a header row and at least one data row.");
      return;
    }

    // Skip header
    const rows = lines.slice(1).map((line) => {
      // Simple CSV split (handles quotes roughly or comma-separated)
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
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-400" />
            <span>Centralized Question Bank</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            KaTeX mathematical equations • Immutable attempt snapshot versioning • Bulk CSV import/export
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Bulk CSV Import</span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add MCQ</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search questions or formula text..."
            className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={chapterFilter}
            onChange={(e) => handleFilterChange(e.target.value, difficultyFilter, statusFilter)}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-500 font-mono text-xs">
            No questions found matching the selected criteria.
          </div>
        ) : (
          mcqs.map((m, idx) => (
            <div
              key={m.id}
              className="p-5 bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl shadow-md transition-all space-y-3"
            >
              {/* Question header info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 px-2 py-0.5 rounded font-semibold">
                    MCQ #{idx + 1}
                  </span>
                  <span className="text-slate-400 font-sans font-medium">{m.chapter_name || "General"}</span>
                  {m.topic_name && <span className="text-slate-500">• {m.topic_name}</span>}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded capitalize ${
                      m.difficulty === "easy"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : m.difficulty === "medium"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {m.difficulty}
                  </span>

                  <span className="text-slate-400">
                    +{m.marks} / -{m.negative_marks} marks
                  </span>

                  <span className="text-slate-500">v{m.version}</span>

                  <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                    <button
                      onClick={() => openEditModal(m)}
                      title="Edit MCQ"
                      className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m)}
                      title="Archive MCQ"
                      className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Text with KaTeX */}
              <div className="text-white text-base font-medium leading-relaxed">
                <MathText text={m.question} />
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-sans text-sm">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const text =
                    opt === "A" ? m.option_a : opt === "B" ? m.option_b : opt === "C" ? m.option_c : m.option_d;
                  const isCorrect = m.correct_answer === opt;

                  return (
                    <div
                      key={opt}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-colors ${
                        isCorrect
                          ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-200"
                          : "bg-slate-950/60 border-slate-800/80 text-slate-300"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                          isCorrect ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
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
                <div className="p-3 bg-slate-950/80 border border-slate-800/90 rounded-xl text-xs text-slate-400 space-y-1">
                  <span className="font-mono uppercase text-indigo-400 font-semibold block text-[10px]">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg text-white">
                  {editingMCQ ? `Edit MCQ (creates version ${editingMCQ.version + 1})` : "Create Physics MCQ"}
                </h3>
              </div>
              <button onClick={() => setShowEditorModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditorSubmit} className="space-y-4 mt-4">
              {/* Formula Toolbar */}
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-400">
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
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 rounded-md transition-colors"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chapter & Topic Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">Chapter *</label>
                  <select
                    value={formData.chapter_id}
                    onChange={(e) => setFormData({ ...formData, chapter_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        Chapter {c.chapter_number}: {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value as "easy" | "medium" | "hard" })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                  Question Text (KaTeX formulas enclosed in $...$) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. A mass $m = 5\\text{ kg}$ is accelerated by a force $F = 25\\text{ N}$..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* Live Preview Box */}
              {formData.question && (
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold block mb-1">
                    Live Formula Render:
                  </span>
                  <div className="text-white text-sm">
                    <MathText text={formData.question} />
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-medium text-slate-300 uppercase">
                  Options (A, B, C, D) *
                </label>
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const key = `option_${opt.toLowerCase()}` as keyof typeof formData;
                  return (
                    <div key={opt} className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-slate-400 shrink-0">
                        {opt}
                      </span>
                      <input
                        type="text"
                        required
                        value={formData[key] as string}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        placeholder={`Option ${opt} text or formula (e.g. $5.0\\text{ m/s}^2$)`}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Correct Answer & Marks */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                    Correct Answer *
                  </label>
                  <select
                    value={formData.correct_answer}
                    onChange={(e) =>
                      setFormData({ ...formData, correct_answer: e.target.value as "A" | "B" | "C" | "D" })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                    Marks Awarded
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                    Negative Marks
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.negative_marks}
                    onChange={(e) => setFormData({ ...formData, negative_marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                  Explanation (Supports KaTeX formulas)
                </label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="e.g. Using Newton's Second Law $a = \\frac{F}{m} = \\frac{25}{5} = 5\\text{ m/s}^2$."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditorModal(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/30"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg text-white">Bulk CSV Import for MCQs</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono space-y-1">
                <div className="text-indigo-400 font-semibold uppercase">Expected CSV Format (12 columns):</div>
                <div className="overflow-x-auto text-[11px] text-slate-300">
                  chapter,topic,question,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,marks,negative_marks
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                  Paste CSV Text
                </label>
                <textarea
                  rows={8}
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  placeholder={`chapter,topic,question,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,marks,negative_marks
Motion and Force,Newton's Laws,Force is given by?,F = ma,F = mv,F = m/a,F = a/m,A,By second law,easy,1,0.25`}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Validation errors summary */}
              {importValidation && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-300">Total: {importValidation.total}</span>
                    <span className="text-emerald-400">Valid: {importValidation.valid}</span>
                    <span className="text-red-400">Invalid: {importValidation.invalid}</span>
                  </div>
                  {importValidation.errors.length > 0 && (
                    <div className="max-h-28 overflow-y-auto space-y-1 text-red-400 font-mono text-[11px]">
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

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleValidateCsv}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
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
