import React, { useState } from "react";
import { portalStorage } from "@/lib/portal-storage";
import { StudentProfile, ClassItem } from "@/lib/portal-types";
import {
  UserPlus,
  Search,
  Filter,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Archive,
  Copy,
  Check,
  User,
  GraduationCap,
  Mail,
  Phone,
  Edit2,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export function StudentManagement() {
  const [students, setStudents] = useState<StudentProfile[]>(portalStorage.getStudents());
  const [classes] = useState<ClassItem[]>(portalStorage.getClasses());

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  // Create Student Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    login_id: "",
    full_name: "",
    class_id: classes[0]?.id || "",
    roll_number: "",
    email: "",
    phone: "",
  });

  // Temporary password display modal
  const [tempPasswordModal, setTempPasswordModal] = useState<{
    isOpen: boolean;
    studentName: string;
    loginId: string;
    temporaryPassword: string;
    isReset?: boolean;
  }>({
    isOpen: false,
    studentName: "",
    loginId: "",
    temporaryPassword: "",
  });
  const [copied, setCopied] = useState(false);

  // Edit Modal
  const [editStudent, setEditStudent] = useState<StudentProfile | null>(null);

  const refreshStudents = () => {
    setStudents(
      portalStorage.getStudents({
        search: searchTerm,
        status: statusFilter,
        classId: classFilter,
      })
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setStudents(
      portalStorage.getStudents({
        search: e.target.value,
        status: statusFilter,
        classId: classFilter,
      })
    );
  };

  const handleFilterChange = (status: string, classId: string) => {
    setStatusFilter(status);
    setClassFilter(classId);
    setStudents(
      portalStorage.getStudents({
        search: searchTerm,
        status,
        classId,
      })
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.login_id.trim() || !formData.full_name.trim()) {
      toast.error("Student Login ID and Full Name are required.");
      return;
    }

    try {
      const res = portalStorage.createStudent(formData);
      toast.success(`Student ${res.student.login_id} created successfully!`);
      setShowCreateModal(false);
      setFormData({
        login_id: "",
        full_name: "",
        class_id: classes[0]?.id || "",
        roll_number: "",
        email: "",
        phone: "",
      });

      // Show temporary credentials modal
      setTempPasswordModal({
        isOpen: true,
        studentName: res.student.full_name,
        loginId: res.student.login_id,
        temporaryPassword: res.temporaryPassword,
        isReset: false,
      });

      refreshStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to create student.");
    }
  };

  const handleResetPassword = (student: StudentProfile) => {
    if (!window.confirm(`Reset password for student ${student.full_name} (${student.login_id})?`)) {
      return;
    }

    try {
      const res = portalStorage.resetStudentPassword(student.id);
      toast.success("Password reset successfully!");
      setTempPasswordModal({
        isOpen: true,
        studentName: student.full_name,
        loginId: student.login_id,
        temporaryPassword: res.temporaryPassword,
        isReset: true,
      });
      refreshStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password.");
    }
  };

  const handleToggleStatus = (student: StudentProfile) => {
    const newStatus = student.status === "active" ? "disabled" : "active";
    try {
      portalStorage.updateStudent(student.id, { status: newStatus });
      toast.success(`Student status updated to ${newStatus}`);
      refreshStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  const handleArchive = (student: StudentProfile) => {
    if (!window.confirm(`Archive student ${student.full_name}? They will no longer be able to log in.`)) {
      return;
    }
    try {
      portalStorage.updateStudent(student.id, { status: "archived" });
      toast.success("Student moved to archive.");
      refreshStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to archive student.");
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;

    try {
      portalStorage.updateStudent(editStudent.id, {
        full_name: editStudent.full_name,
        class_id: editStudent.class_id,
        roll_number: editStudent.roll_number,
      });
      toast.success("Student updated successfully.");
      setEditStudent(null);
      refreshStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to update student.");
    }
  };

  const copyCredentials = () => {
    const text = `Physics MCQ Portal Login Credentials:\nLogin ID: ${tempPasswordModal.loginId}\nPassword: ${tempPasswordModal.temporaryPassword}\nStudent: ${tempPasswordModal.studentName}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span>Student Management</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Teacher-issued student credentials • Strict RBAC & No Public Registration
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 neu-btn-primary px-4 py-2.5 rounded-xl font-semibold text-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl neu-raised">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by student name, Login ID (e.g. PHY-001)..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={classFilter}
            onChange={(e) => handleFilterChange(statusFilter, e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - Sec {c.section}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value, classFilter)}
            className="w-full py-2.5 px-3 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
            <option value="archived">Archived Only</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl neu-raised overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="neu-inset-sm border-b border-border/60 text-xs font-mono uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Student Login ID</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Class / Section</th>
                <th className="px-5 py-3.5">Roll No</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Password State</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-sans">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground font-mono text-xs">
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                students.map((stu) => (
                  <tr key={stu.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-primary">
                      {stu.login_id}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl neu-inset flex items-center justify-center text-xs font-bold text-primary">
                          {stu.full_name.charAt(0)}
                        </div>
                        <div>
                          <div>{stu.full_name}</div>
                          {stu.email && <div className="text-[11px] text-muted-foreground font-mono">{stu.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {stu.class_name ? `${stu.class_name} - Sec ${stu.section}` : "Unassigned"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {stu.roll_number || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {stu.status === "active" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold neu-inset-sm text-emerald-500">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      )}
                      {stu.status === "disabled" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold neu-inset-sm text-destructive">
                          <span className="w-2 h-2 rounded-full bg-destructive" />
                          Disabled
                        </span>
                      )}
                      {stu.status === "archived" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium neu-inset-sm text-muted-foreground">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono">
                      {stu.force_password_change ? (
                        <span className="text-amber-500 neu-inset-sm px-2 py-0.5 rounded font-semibold">
                          Must Change
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Established</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResetPassword(stu)}
                          title="Reset Password"
                          className="p-2 neu-btn rounded-xl text-muted-foreground hover:text-amber-500 cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setEditStudent(stu)}
                          title="Edit Student"
                          className="p-2 neu-btn rounded-xl text-muted-foreground hover:text-primary cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(stu)}
                          title={stu.status === "active" ? "Disable Student" : "Enable Student"}
                          className={`p-2 neu-btn rounded-xl cursor-pointer ${
                            stu.status === "active"
                              ? "text-muted-foreground hover:text-destructive"
                              : "text-muted-foreground hover:text-emerald-500"
                          }`}
                        >
                          {stu.status === "active" ? (
                            <ShieldAlert className="w-4 h-4" />
                          ) : (
                            <ShieldCheck className="w-4 h-4" />
                          )}
                        </button>

                        {stu.status !== "archived" && (
                          <button
                            onClick={() => handleArchive(stu)}
                            title="Archive Student"
                            className="p-2 neu-btn rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE STUDENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg neu-raised-lg rounded-3xl p-6 sm:p-7 text-foreground animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">Create New Student Account</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl neu-btn-interactive cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Student Login ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.login_id}
                    onChange={(e) => setFormData({ ...formData, login_id: e.target.value.toUpperCase() })}
                    placeholder="e.g. PHY-005"
                    className="w-full px-3.5 py-2 rounded-xl neu-inset text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">Unique identifier for student login</p>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full px-3.5 py-2 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Class & Section
                  </label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - Section {c.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    placeholder="e.g. 105"
                    className="w-full px-3.5 py-2 rounded-xl neu-inset text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 300 0000000"
                    className="w-full px-3.5 py-2 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl neu-inset text-xs text-primary flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  The system will automatically generate a secure temporary password and require the student to change
                  it on first login.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 neu-btn rounded-xl text-sm text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 neu-btn-primary rounded-xl text-sm font-semibold cursor-pointer"
                >
                  Create Student & Issue Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONE-TIME TEMPORARY PASSWORD DISPLAY MODAL */}
      {tempPasswordModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md neu-raised-lg rounded-3xl p-6 sm:p-7 text-foreground animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 neu-inset text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground">
              {tempPasswordModal.isReset ? "Student Password Reset" : "Student Credentials Issued"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Please copy these credentials and provide them to the student. For security, this temporary password will
              not be shown again.
            </p>

            <div className="p-4.5 rounded-2xl neu-inset space-y-3 font-mono">
              <div>
                <span className="text-[11px] text-muted-foreground uppercase block">Student Name</span>
                <span className="text-sm font-semibold text-foreground">{tempPasswordModal.studentName}</span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground uppercase block">Student Login ID</span>
                <span className="text-base font-bold text-primary">{tempPasswordModal.loginId}</span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground uppercase block">Temporary Password</span>
                <span className="text-base font-bold text-emerald-500 tracking-wider">
                  {tempPasswordModal.temporaryPassword}
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={copyCredentials}
                className="flex-1 py-3 px-4 neu-btn-emerald rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Credentials"}</span>
              </button>

              <button
                type="button"
                onClick={() => setTempPasswordModal({ ...tempPasswordModal, isOpen: false })}
                className="py-3 px-5 neu-btn rounded-xl text-sm text-foreground font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg neu-raised-lg rounded-3xl p-6 sm:p-7 text-foreground animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h3 className="font-bold text-lg text-foreground">Edit Student: {editStudent.login_id}</h3>
              <button
                onClick={() => setEditStudent(null)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl neu-btn-interactive cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editStudent.full_name}
                  onChange={(e) => setEditStudent({ ...editStudent, full_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Class & Section
                  </label>
                  <select
                    value={editStudent.class_id || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, class_id: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - Sec {c.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={editStudent.roll_number || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, roll_number: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl neu-inset text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditStudent(null)}
                  className="px-4 py-2.5 neu-btn rounded-xl text-sm text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 neu-btn-primary rounded-xl text-sm font-semibold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
