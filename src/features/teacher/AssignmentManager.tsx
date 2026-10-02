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
  preselectedTestId?: string | undefined;
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
      const params: Parameters<typeof portalStorage.assignTest>[0] = { testId: selectedTestId };
      if (assignMode === "students") {
        params.studentIds = selectedStudentIds;
      } else if (assignMode === "class") {
        params.classId = selectedClassId;
      }
      const res = portalStorage.assignTest(params);

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
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <span>Test Assignments</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Assign tests to individual students or classes • Strict authorization enforcement
          </p>
        </div>

        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 neu-btn-primary rounded-xl text-sm font-semibold cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Assign a Test</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl neu-raised flex items-center gap-3">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search assignments by student name, Login ID, or test title..."
          className="flex-1 bg-transparent border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Assignments Table */}
      <div className="rounded-2xl neu-raised overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="neu-inset-sm border-b border-border/60 text-xs font-mono uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Student Login ID</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Assigned Test</th>
                <th className="px-5 py-3.5">Assigned Date</th>
                <th className="px-5 py-3.5">Max Attempts</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-sans">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground font-mono text-xs">
                    No test assignments recorded.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-primary">
                      {a.student_login_id}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground">{a.student_name}</td>
                    <td className="px-5 py-3.5 text-foreground font-semibold">{a.test_title}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {new Date(a.assigned_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{a.max_attempts}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold neu-inset-sm text-primary">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg neu-raised-lg rounded-3xl p-6 sm:p-7 text-foreground animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">Assign Physics Test</h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-xl neu-btn-interactive cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                  Select Test *
                </label>
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {tests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.question_count} MCQs, {t.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment Mode Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl neu-inset text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setAssignMode("students")}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                    assignMode === "students"
                      ? "neu-btn-primary font-bold shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Specific Students
                </button>
                <button
                  type="button"
                  onClick={() => setAssignMode("class")}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                    assignMode === "class"
                      ? "neu-btn-primary font-bold shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Entire Class / Section
                </button>
              </div>

              {/* Mode 1: Specific Students */}
              {assignMode === "students" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                    <span>Select Students ({selectedStudentIds.length} selected):</span>
                    <button
                      type="button"
                      onClick={selectAllStudents}
                      className="text-primary hover:underline font-bold cursor-pointer"
                    >
                      {selectedStudentIds.length === students.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-2xl neu-inset">
                    {students.map((stu) => {
                      const isChecked = selectedStudentIds.includes(stu.id);
                      return (
                        <div
                          key={stu.id}
                          onClick={() => toggleStudent(stu.id)}
                          className={`p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all ${
                            isChecked
                              ? "neu-raised text-primary font-bold border border-primary/40"
                              : "text-foreground hover:neu-raised-sm"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-md flex items-center justify-center ${
                                isChecked
                                  ? "neu-btn-primary text-white"
                                  : "neu-inset-sm text-transparent"
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                            <span>{stu.full_name}</span>
                          </div>
                          <span className="font-mono text-muted-foreground">
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
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Select Class & Section
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - Section {c.section} ({c.student_count || 0} students)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                    All active students enrolled in this class will immediately receive this test.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2.5 neu-btn rounded-xl text-sm text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 neu-btn-primary rounded-xl text-sm font-semibold cursor-pointer"
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
