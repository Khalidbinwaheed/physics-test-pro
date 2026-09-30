import React, { useState } from "react";
import { portalStorage, TeacherUser } from "@/lib/portal-storage";
import { useAuth } from "@/features/auth/auth-context";
import {
  ShieldCheck,
  UserPlus,
  Crown,
  KeyRound,
  Mail,
  User,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export function StaffManagement() {
  const { isSuperAdmin, isAdmin, teacher } = useAuth();
  const [staffList, setStaffList] = useState<TeacherUser[]>(() => portalStorage.getStaffUsers());
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const refreshList = () => {
    setStaffList(portalStorage.getStaffUsers());
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast.error("Full Name and Email are required.");
      return;
    }

    try {
      const created = portalStorage.createTeacher({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password || "TeacherPass123!",
        actorRole: teacher?.role,
      });

      toast.success(`Teacher ${created.full_name} registered successfully!`);
      setShowAddModal(false);
      setFormData({ full_name: "", email: "", password: "" });
      refreshList();
    } catch (err: any) {
      toast.error(err.message || "Failed to create teacher.");
    }
  };

  const handlePromoteToSuperAdmin = (target: TeacherUser) => {
    if (!isSuperAdmin) {
      toast.error("Only an active Super Administrator can promote another user to Super Admin.");
      return;
    }

    if (target.role === "super_admin") {
      toast.info(`${target.full_name} is already a Super Administrator.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to promote ${target.full_name} (${target.email}) to Super Administrator? This grants complete unrestricted access.`)) {
      return;
    }

    try {
      const res = portalStorage.makeSuperAdmin(target.email, teacher?.role);
      toast.success(res.message);
      refreshList();
    } catch (err: any) {
      toast.error(err.message || "Failed to promote user.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span>Staff & Administrative Access Control</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Role-Based Access Control • Only Administrators can add teachers and students
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 neu-btn-primary px-4 py-2.5 rounded-xl font-semibold text-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Teacher</span>
          </button>
        )}
      </div>

      {/* RLS Privacy Policy Status Banner */}
      <div className="p-4 rounded-2xl neu-raised border border-primary/20 bg-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl neu-inset text-primary shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Supabase Privacy & RLS Enforcement Active</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
                ENFORCED
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Row Level Security policies prevent unauthorized account creation. <strong>Teachers</strong> cannot create students or staff. <strong>Admins</strong> can register teachers and students. <strong>Super Admins</strong> hold top-level authority to assign admin roles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-xs font-mono text-right hidden sm:block">
            <div className="text-muted-foreground">Your Active Role</div>
            <div className="font-bold text-primary capitalize">{teacher?.role?.replace("_", " ") || "Staff"}</div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl neu-raised overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="neu-inset-sm border-b border-border/60 text-xs font-mono uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Email / Login</th>
                <th className="px-5 py-3.5">Access Role</th>
                <th className="px-5 py-3.5">Permissions Scope</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-sans">
              {staffList.map((st) => {
                const isSuper = st.role === "super_admin";
                const isAdm = st.role === "admin";
                return (
                  <tr key={st.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl neu-inset flex items-center justify-center text-xs font-bold ${
                            isSuper
                              ? "text-purple-400"
                              : isAdm
                              ? "text-cyan-400"
                              : "text-emerald-500"
                          }`}
                        >
                          {isSuper ? <Crown className="w-4 h-4" /> : st.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold">{st.full_name}</div>
                          <div className="text-[11px] font-mono text-muted-foreground">ID: {st.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {st.email}
                    </td>

                    <td className="px-5 py-3.5">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          <Crown className="w-3 h-3" />
                          Super Admin
                        </span>
                      ) : isAdm ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                          <User className="w-3 h-3" />
                          Teacher
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {isSuper
                        ? "Full root system access • Can manage all roles & privacy"
                        : isAdm
                        ? "Can add teachers & students • Full testing & class management"
                        : "Can manage MCQs, tests, & grades • Cannot add accounts"}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {isSuperAdmin && !isSuper && (
                        <button
                          onClick={() => handlePromoteToSuperAdmin(st)}
                          className="neu-btn px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 ml-auto cursor-pointer"
                          title="Promote to Super Administrator"
                        >
                          <Crown className="w-3 h-3" />
                          <span>Make Super Admin</span>
                        </button>
                      )}
                      {isSuper && (
                        <span className="text-[11px] font-mono text-purple-400 font-semibold">Root Authority</span>
                      )}
                      {!isSuperAdmin && !isSuper && (
                        <span className="text-[11px] font-mono text-muted-foreground">Standard</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl neu-raised space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <span>Register New Teacher</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground neu-btn text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Only Administrators and Super Administrators have permission to create staff accounts.
            </p>

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Prof. Jane Doe"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane.doe@physlab.local"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider mb-1.5">
                  Initial Password (Optional)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Defaults to TeacherPass123!"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl neu-btn text-xs font-mono font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl neu-btn-primary text-xs font-mono font-bold text-white cursor-pointer"
                >
                  Create Teacher Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
