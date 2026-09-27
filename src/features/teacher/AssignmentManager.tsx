import React, { useState } from "react";
import { portalStorage } from "@/lib/portal-storage";
import { TestItem, TestAssignmentItem, StudentProfile, ClassItem } from "@/lib/portal-types";
import {
  Users,
  Send,
  CheckCircle,
  Clock,
  Search,
  Filter,
  GraduationCap,
  Calendar,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface AssignmentManagerProps {
  preselectedTestId?: string;
}

export function AssignmentManager({ preselectedTestId }: AssignmentManagerProps) {
  const [assignments, setAssignments] = useState<TestAssignmentItem[]>(portalStorage.getAssignments());
  const [tests] = useState<TestItem[]>(portalStorage.getTests());
  const [students] = useState<StudentProfile[]>(portalStorage.getStudents({ status: "active" }));
  const [classes] = useState<ClassItem[]>(portalStorage.getClasses());

  const [showAssignModal, setShowAssignModal] = useState(!!preselectedTestId);
  const [selectedTestId, setSelectedTestId] = useState(preselectedTestId || tests[0]?.id || "");
  const [assignMode, setAssignMode] = useState<"students" | "class">("students");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");

  const [searchTerm, setSearchTerm] = useState("");

  const refreshAssignments = () => {
    setAssignments(portalStorage.getAssignments());
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestId) {
      toast.error("Please select a test.");
      return;
    }

    if (assignMode === "students" && selectedStudentIds.length === 0) {
      toast.error("Please select at least one student.");
      return;
    }

    if (assignMode === "class" && !selectedClassId) {
      toast.error("Please select a class.");
      return;
    }

    try {
      const res = portalStorage.assignTest({
        testId: selectedTestId,
        studentIds: assignMode === "students" ? selectedStudentIds : undefined,
        classId: assignMode === "class" ? selectedClassId : undefined,
      });

      if (res.count === 0) {
        toast.info("Selected student(s) already have this test assigned.");
      } else {
        toast.success(`Test assigned to ${res.count} student(s) successfully!`);
      }
      setShowAssignModal(false);
      setSelectedStudentIds([]);
      refreshAssignments();
    } catch (err: any) {
      toast.error(err.message || "Failed to assign test.");
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const selectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        (a.student_name && a.student_name.toLowerCase().includes(q)) ||
        (a.student_login_id && a.student_login_id.toLowerCase().includes(q)) ||
        (a.test_title && a.test_title.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Test Assignments</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Assign tests to individual students or classes • Strict authorization enforcement
          </p>
        </div>

        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/30"
        >
          <Send className="w-4 h-4" />
          <span>Assign a Test</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search assignments by student name, Login ID, or test title..."
          className="flex-1 bg-transparent border-0 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Assignments Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs font-mono uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Student Login ID</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Assigned Test</th>
                <th className="px-5 py-3.5">Assigned Date</th>
                <th className="px-5 py-3.5">Max Attempts</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500 font-mono text-xs">
                    No test assignments recorded.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-indigo-400">
                      {a.student_login_id}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-white">{a.student_name}</td>
                    <td className="px-5 py-3.5 text-slate-200 font-medium">{a.test_title}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-400">
                      {new Date(a.assigned_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-300">{a.max_attempts}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSIGN MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg text-white">Assign Physics Test</h3>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                  Select Test *
                </label>
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {tests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.question_count} MCQs, {t.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment Mode Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setAssignMode("students")}
                  className={`py-2 px-3 rounded-lg transition-all ${
                    assignMode === "students"
                      ? "bg-indigo-600 text-white font-semibold shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Specific Students
                </button>
                <button
                  type="button"
                  onClick={() => setAssignMode("class")}
                  className={`py-2 px-3 rounded-lg transition-all ${
                    assignMode === "class"
                      ? "bg-indigo-600 text-white font-semibold shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Entire Class / Section
                </button>
              </div>

              {/* Mode 1: Specific Students */}
              {assignMode === "students" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Select Students ({selectedStudentIds.length} selected):</span>
                    <button
                      type="button"
                      onClick={selectAllStudents}
                      className="text-indigo-400 hover:underline"
                    >
                      {selectedStudentIds.length === students.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                    {students.map((stu) => {
                      const isChecked = selectedStudentIds.includes(stu.id);
                      return (
                        <div
                          key={stu.id}
                          onClick={() => toggleStudent(stu.id)}
                          className={`p-2 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-indigo-950/50 text-white border border-indigo-500/40"
                              : "text-slate-300 hover:bg-slate-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center ${
                                isChecked
                                  ? "bg-indigo-600 border-indigo-500 text-white"
                                  : "border-slate-700 bg-slate-900"
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                            <span className="font-semibold">{stu.full_name}</span>
                          </div>
                          <span className="font-mono text-slate-400">
                            {stu.login_id} {stu.class_name ? `(${stu.class_name}-${stu.section})` : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mode 2: Entire Class */}
              {assignMode === "class" && (
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                    Select Class & Section
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - Section {c.section} ({c.student_count || 0} students)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    All active students enrolled in this class will immediately receive this test.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/30"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
