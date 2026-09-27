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
      setShowCreateModal(false);
      setFormData({
        login_id: "",
        full_name: "",
        class_id: classes[0]?.id || "",
        roll_number: "",
        email: "",
        phone: "",
      });
      refreshStudents();

      // Show temporary password modal once
      setTempPasswordModal({
        isOpen: true,
        studentName: res.student.full_name,
        loginId: res.student.login_id,
        temporaryPassword: res.temporaryPassword,
        isReset: false,
      });
      toast.success("Student account created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create student.");
    }
  };

  const handleResetPassword = (stu: StudentProfile) => {
    try {
      const newTempPass = portalStorage.resetStudentPassword(stu.id);
      refreshStudents();
      setTempPasswordModal({
        isOpen: true,
        studentName: stu.full_name,
        loginId: stu.login_id,
        temporaryPassword: newTempPass,
        isReset: true,
      });
      toast.success(`Password reset for ${stu.full_name}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password.");
    }
  };

  const handleToggleStatus = (stu: StudentProfile) => {
    const nextStatus = stu.status === "active" ? "disabled" : "active";
    try {
      portalStorage.setStudentStatus(stu.id, nextStatus);
      refreshStudents();
      toast.info(`Student ${stu.full_name} is now ${nextStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  const handleArchive = (stu: StudentProfile) => {
    if (confirm(`Are you sure you want to archive ${stu.full_name}? Historical exam records will be preserved.`)) {
      portalStorage.setStudentStatus(stu.id, "archived");
      refreshStudents();
      toast.info(`Student ${stu.full_name} archived.`);
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
        phone: editStudent.phone,
        email: editStudent.email,
      });
      setEditStudent(null);
      refreshStudents();
      toast.success("Student details updated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update student.");
    }
  };

  const copyCredentials = () => {
    const text = `Physics MCQ Portal Credentials\nStudent: ${tempPasswordModal.studentName}\nLogin ID: ${tempPasswordModal.loginId}\nTemporary Password: ${tempPasswordModal.temporaryPassword}`;
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
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            <span>Student Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Teacher-issued student credentials • Strict RBAC & No Public Registration
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-600/25"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by student name, Login ID (e.g. PHY-001), or roll number..."
            className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={classFilter}
            onChange={(e) => handleFilterChange(statusFilter, e.target.value)}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
            <option value="archived">Archived Only</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs font-mono uppercase text-slate-400">
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
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500 font-mono text-xs">
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                students.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-indigo-400">
                      {stu.login_id}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                          {stu.full_name.charAt(0)}
                        </div>
                        <div>
                          <div>{stu.full_name}</div>
                          {stu.email && <div className="text-[11px] text-slate-500 font-mono">{stu.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      {stu.class_name ? `${stu.class_name} - Sec ${stu.section}` : "Unassigned"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-400">
                      {stu.roll_number || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {stu.status === "active" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      )}
                      {stu.status === "disabled" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          Disabled
                        </span>
                      )}
                      {stu.status === "archived" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono">
                      {stu.force_password_change ? (
                        <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          Must Change
                        </span>
                      ) : (
                        <span className="text-slate-500">Established</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResetPassword(stu)}
                          title="Reset Password"
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setEditStudent(stu)}
                          title="Edit Student"
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(stu)}
                          title={stu.status === "active" ? "Disable Student" : "Enable Student"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            stu.status === "active"
                              ? "text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                              : "text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10"
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
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg text-white">Create New Student Account</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                    Student Login ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.login_id}
                    onChange={(e) => setFormData({ ...formData, login_id: e.target.value.toUpperCase() })}
                    placeholder="e.g. PHY-005"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Unique identifier for student login</p>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                    Class & Section
                  </label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - Section {c.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    placeholder="e.g. 105"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 300 0000000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs text-indigo-300 flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                <span>
                  The system will automatically generate a secure temporary password and require the student to change
                  it on first login.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/30"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white">
              {tempPasswordModal.isReset ? "Student Password Reset" : "Student Credentials Issued"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Please copy these credentials and provide them to the student. For security, this temporary password will
              not be shown again.
            </p>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 font-mono">
              <div>
                <span className="text-[11px] text-slate-500 uppercase block">Student Name</span>
                <span className="text-sm font-semibold text-white">{tempPasswordModal.studentName}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 uppercase block">Student Login ID</span>
                <span className="text-base font-bold text-indigo-400">{tempPasswordModal.loginId}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 uppercase block">Temporary Password</span>
                <span className="text-base font-bold text-emerald-400 tracking-wider">
                  {tempPasswordModal.temporaryPassword}
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={copyCredentials}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Credentials"}</span>
              </button>

              <button
                type="button"
                onClick={() => setTempPasswordModal({ ...tempPasswordModal, isOpen: false })}
                className="py-2.5 px-4 border border-slate-700 hover:bg-slate-800 rounded-xl text-sm text-slate-300"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">Edit Student: {editStudent.login_id}</h3>
              <button onClick={() => setEditStudent(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editStudent.full_name}
                  onChange={(e) => setEditStudent({ ...editStudent, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                    Class & Section
                  </label>
                  <select
                    value={editStudent.class_id || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, class_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - Sec {c.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={editStudent.roll_number || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, roll_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditStudent(null)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all"
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
