import React, { createContext, useContext, useState, useEffect } from "react";
import { portalStorage, TeacherUser } from "@/lib/portal-storage";
import { StudentProfile } from "@/lib/portal-types";

export type UserRole = "super_admin" | "admin" | "teacher" | "student" | null;

interface AuthContextType {
  role: UserRole;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  teacher: TeacherUser | null;
  student: StudentProfile | null;
  isLoading: boolean;
  loginTeacher: (emailOrUsername: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginStudent: (loginId: string, pass: string) => Promise<{ success: boolean; error?: string; forcePasswordChange?: boolean }>;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "physics_portal_session_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [teacher, setTeacher] = useState<TeacherUser | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if ((parsed.role === "teacher" || parsed.role === "admin" || parsed.role === "super_admin") && parsed.teacher) {
          setRole(parsed.teacher.role || parsed.role);
          setTeacher(parsed.teacher);
          portalStorage.setCurrentStaff(parsed.teacher);
        } else if (parsed.role === "student" && parsed.student) {
          // Re-fetch current student state to respect disable/archive
          const current = portalStorage.getStudentById(parsed.student.id);
          if (current && current.status === "active") {
            setRole("student");
            setStudent(current);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginTeacher = async (emailOrUsername: string, pass: string) => {
    const res = await portalStorage.authenticateTeacher(emailOrUsername, pass);
    if (res.success && res.user) {
      setRole(res.user.role);
      setTeacher(res.user);
      portalStorage.setCurrentStaff(res.user);
      setStudent(null);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: res.user.role, teacher: res.user }));
      return { success: true };
    }
    return { success: false, error: res.error || "Login failed" };
  };

  const loginStudent = async (loginId: string, pass: string) => {
    const res = await portalStorage.authenticateStudent(loginId, pass);
    if (res.success && res.student) {
      setRole("student");
      setStudent(res.student);
      setTeacher(null);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: "student", student: res.student }));
      return {
        success: true,
        forcePasswordChange: res.student.force_password_change,
      };
    }
    return { success: false, error: res.error || "Login failed" };
  };

  const logout = () => {
    if (role === "teacher" && teacher) {
      portalStorage.audit({
        userId: teacher.id,
        actorLabel: `Teacher: ${teacher.full_name}`,
        action: "teacher_logout",
      });
    } else if (role === "student" && student) {
      portalStorage.audit({
        userId: student.id,
        actorLabel: `Student: ${student.full_name}`,
        action: "student_logout",
      });
    }
    setRole(null);
    setTeacher(null);
    setStudent(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    if (role !== "student" || !student) {
      return { success: false, error: "Only student passwords can be changed here." };
    }
    const res = portalStorage.changeStudentPassword(student.id, oldPass, newPass);
    if (res.success) {
      const updated = portalStorage.getStudentById(student.id);
      if (updated) {
        setStudent(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: "student", student: updated }));
      }
    }
    return res;
  };

  const isSuperAdmin = teacher?.role === "super_admin";
  const isAdmin = teacher?.role === "admin" || teacher?.role === "super_admin";
  const isTeacher = teacher?.role === "teacher";

  return (
    <AuthContext.Provider
      value={{
        role,
        isSuperAdmin,
        isAdmin,
        isTeacher,
        teacher,
        student,
        isLoading,
        loginTeacher,
        loginStudent,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
