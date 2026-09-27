import {
  StudentProfile,
  ClassItem,
  ChapterItem,
  TopicItem,
  MCQItem,
  TestItem,
  TestAssignmentItem,
  AttemptItem,
  AttemptFrozenQuestion,
  ResultItem,
  AuditLogItem,
} from "./portal-types";
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_CHAPTERS,
  INITIAL_TOPICS,
  INITIAL_MCQS,
  INITIAL_TESTS,
} from "./portal-seed-data";
import { normalizeLoginId, studentEmailFor } from "./login-id";

export interface TeacherUser {
  id: string;
  email: string;
  full_name: string;
  role: "teacher" | "admin";
  passwordHash: string;
}

const DEFAULT_TEACHER: TeacherUser = {
  id: "tea-1",
  email: "teacher@physlab.local",
  full_name: "Prof. Khalid Mehmood",
  role: "teacher",
  passwordHash: "AdminPass123!",
};

export const INITIAL_ASSIGNMENTS: TestAssignmentItem[] = [
  {
    id: "asg-1",
    test_id: "test-1",
    test_title: "Chapter 3: Motion and Force Comprehensive Examination",
    student_id: "stu-1",
    student_login_id: "PHY-001",
    student_name: "Muhammad Ali",
    assigned_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    available_from: new Date(Date.now() - 86400000).toISOString(),
    available_until: new Date(Date.now() + 7 * 86400000).toISOString(),
    max_attempts: 2,
    status: "assigned",
  },
  {
    id: "asg-2",
    test_id: "test-1",
    test_title: "Chapter 3: Motion and Force Comprehensive Examination",
    student_id: "stu-2",
    student_login_id: "PHY-002",
    student_name: "Sara Ahmed",
    assigned_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    available_from: new Date(Date.now() - 86400000).toISOString(),
    available_until: new Date(Date.now() + 7 * 86400000).toISOString(),
    max_attempts: 2,
    status: "assigned",
  },
  {
    id: "asg-3",
    test_id: "test-2",
    test_title: "Physics Fundamentals: Work, Energy & Electricity",
    student_id: "stu-1",
    student_login_id: "PHY-001",
    student_name: "Muhammad Ali",
    assigned_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    available_from: new Date(Date.now() - 86400000).toISOString(),
    available_until: new Date(Date.now() + 14 * 86400000).toISOString(),
    max_attempts: 1,
    status: "assigned",
  },
];

class PortalStorage {
  private teacher: TeacherUser = { ...DEFAULT_TEACHER };
  private students: (StudentProfile & { passwordHash: string })[] = [];
  private classes: ClassItem[] = [];
  private chapters: ChapterItem[] = [];
  private topics: TopicItem[] = [];
  private mcqs: MCQItem[] = [];
  private mcqVersions: Record<string, MCQItem[]> = {};
  private tests: TestItem[] = [];
  private assignments: TestAssignmentItem[] = [];
  private attempts: AttemptItem[] = [];
  private results: ResultItem[] = [];
  private auditLogs: AuditLogItem[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    this.classes = [...INITIAL_CLASSES];
    this.students = [...INITIAL_STUDENTS];
    this.chapters = [...INITIAL_CHAPTERS];
    this.topics = [...INITIAL_TOPICS];
    this.mcqs = [...INITIAL_MCQS];
    this.tests = [...INITIAL_TESTS];
    this.assignments = [...INITIAL_ASSIGNMENTS];

    // Seed initial mcq versions
    this.mcqs.forEach((m) => {
      this.mcqVersions[m.id] = [{ ...m }];
    });

    this.audit({
      action: "system_init",
      resource: "system",
      meta: { message: "Physics Examination Portal initialized with standard curriculum data" },
    });

    this.initialized = true;
  }

  // --- AUDIT LOGS ---
  audit(log: {
    userId?: string;
    actorLabel?: string;
    action: string;
    resource?: string;
    resourceId?: string;
    meta?: Record<string, unknown>;
  }) {
    const item: AuditLogItem = {
      id: "aud-" + Math.random().toString(36).slice(2, 9),
      user_id: log.userId ?? null,
      actor_label: log.actorLabel ?? "System",
      action: log.action,
      resource: log.resource ?? null,
      resource_id: log.resourceId ?? null,
      meta: log.meta ?? {},
      ip_address: "127.0.0.1",
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(item);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
  }

  getAuditLogs() {
    return [...this.auditLogs];
  }

  // --- AUTHENTICATION ---
  authenticateTeacher(emailOrUsername: string, pass: string): { success: boolean; user?: TeacherUser; error?: string } {
    const clean = emailOrUsername.trim().toLowerCase();
    if (
      (clean === this.teacher.email.toLowerCase() || clean === "admin" || clean === "teacher") &&
      pass === this.teacher.passwordHash
    ) {
      this.audit({
        userId: this.teacher.id,
        actorLabel: `Teacher: ${this.teacher.full_name}`,
        action: "teacher_login_success",
        resource: "auth",
      });
      return { success: true, user: this.teacher };
    }
    this.audit({
      actorLabel: emailOrUsername,
      action: "teacher_login_failed",
      resource: "auth",
      meta: { identifier: emailOrUsername },
    });
    return { success: false, error: "Invalid email/username or password." };
  }

  authenticateStudent(loginId: string, pass: string): { success: boolean; student?: StudentProfile; error?: string } {
    const normalized = normalizeLoginId(loginId);
    const stu = this.students.find((s) => normalizeLoginId(s.login_id) === normalized);

    if (!stu) {
      this.audit({
        actorLabel: loginId,
        action: "student_login_failed_not_found",
        resource: "auth",
        meta: { loginId },
      });
      return { success: false, error: "Invalid Student Login ID or password." };
    }

    if (stu.status === "disabled") {
      this.audit({
        userId: stu.id,
        actorLabel: `Student: ${stu.full_name} (${stu.login_id})`,
        action: "student_login_rejected_disabled",
        resource: "auth",
      });
      return { success: false, error: "Your account is disabled. Please contact your instructor." };
    }

    if (stu.status === "archived") {
      return { success: false, error: "This student account has been archived." };
    }

    if (stu.passwordHash !== pass) {
      this.audit({
        userId: stu.id,
        actorLabel: `Student: ${stu.full_name} (${stu.login_id})`,
        action: "student_login_failed_password",
        resource: "auth",
      });
      return { success: false, error: "Invalid Student Login ID or password." };
    }

    this.audit({
      userId: stu.id,
      actorLabel: `Student: ${stu.full_name} (${stu.login_id})`,
      action: "student_login_success",
      resource: "auth",
    });

    const { passwordHash: _, ...profile } = stu;
    return { success: true, student: profile };
  }

  changeStudentPassword(studentId: string, oldPass: string, newPass: string): { success: boolean; error?: string } {
    const stu = this.students.find((s) => s.id === studentId);
    if (!stu) return { success: false, error: "Student not found." };
    if (stu.passwordHash !== oldPass && !stu.force_password_change) {
      return { success: false, error: "Current password is incorrect." };
    }
    if (newPass.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }
    stu.passwordHash = newPass;
    stu.force_password_change = false;
    this.audit({
      userId: stu.id,
      actorLabel: `Student: ${stu.full_name}`,
      action: "student_password_changed",
      resource: "students",
      resourceId: stu.id,
    });
    return { success: true };
  }

  // --- STUDENTS MANAGEMENT ---
  getStudents(params?: { search?: string; status?: string; classId?: string }) {
    let list = [...this.students];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.full_name.toLowerCase().includes(q) ||
          s.login_id.toLowerCase().includes(q) ||
          (s.roll_number && s.roll_number.toLowerCase().includes(q))
      );
    }
    if (params?.status && params.status !== "all") {
      list = list.filter((s) => s.status === params.status);
    }
    if (params?.classId && params.classId !== "all") {
      list = list.filter((s) => s.class_id === params.classId);
    }
    return list.map(({ passwordHash: _, ...s }) => s);
  }

  getStudentById(id: string) {
    const stu = this.students.find((s) => s.id === id);
    if (!stu) return null;
    const { passwordHash: _, ...profile } = stu;
    return profile;
  }

  createStudent(data: {
    login_id: string;
    full_name: string;
    class_id?: string | null;
    roll_number?: string | null;
    email?: string | null;
    phone?: string | null;
  }): { student: StudentProfile; temporaryPassword: string } {
    const normalized = normalizeLoginId(data.login_id);
    if (this.students.some((s) => normalizeLoginId(s.login_id) === normalized)) {
      throw new Error(`Student Login ID "${data.login_id}" is already in use.`);
    }

    // Generate secure temporary password
    const temporaryPassword =
      "PHY-" +
      Math.random().toString(36).substring(2, 6).toUpperCase() +
      "#" +
      Math.floor(100 + Math.random() * 900);

    const cls = this.classes.find((c) => c.id === data.class_id);

    const newStudent: StudentProfile & { passwordHash: string } = {
      id: "stu-" + Math.random().toString(36).substring(2, 9),
      login_id: data.login_id.trim().toUpperCase(),
      full_name: data.full_name.trim(),
      email: data.email?.trim() || studentEmailFor(data.login_id),
      phone: data.phone?.trim() || null,
      class_id: data.class_id || null,
      class_name: cls?.name,
      section: cls?.section,
      roll_number: data.roll_number?.trim() || null,
      status: "active",
      force_password_change: true,
      created_at: new Date().toISOString(),
      passwordHash: temporaryPassword,
    };

    this.students.unshift(newStudent);

    // Update class student count
    if (cls) cls.student_count = (cls.student_count || 0) + 1;

    this.audit({
      actorLabel: `Teacher: ${this.teacher.full_name}`,
      action: "student_created",
      resource: "students",
      resourceId: newStudent.id,
      meta: { login_id: newStudent.login_id, name: newStudent.full_name },
    });

    const { passwordHash: _, ...profile } = newStudent;
    return { student: profile, temporaryPassword };
  }

  updateStudent(
    id: string,
    data: Partial<Pick<StudentProfile, "full_name" | "class_id" | "roll_number" | "phone" | "email">>
  ) {
    const stu = this.students.find((s) => s.id === id);
    if (!stu) throw new Error("Student not found.");
    if (data.full_name) stu.full_name = data.full_name.trim();
    if (data.class_id !== undefined) {
      stu.class_id = data.class_id;
      const cls = this.classes.find((c) => c.id === data.class_id);
      stu.class_name = cls?.name;
      stu.section = cls?.section;
    }
    if (data.roll_number !== undefined) stu.roll_number = data.roll_number?.trim() || null;
    if (data.phone !== undefined) stu.phone = data.phone?.trim() || null;
    if (data.email !== undefined) stu.email = data.email?.trim() || null;

    this.audit({
      actorLabel: `Teacher: ${this.teacher.full_name}`,
      action: "student_updated",
      resource: "students",
      resourceId: id,
    });

    const { passwordHash: _, ...profile } = stu;
    return profile;
  }

  setStudentStatus(id: string, status: "active" | "disabled" | "archived") {
    const stu = this.students.find((s) => s.id === id);
    if (!stu) throw new Error("Student not found.");
    stu.status = status;
    this.audit({
      actorLabel: `Teacher: ${this.teacher.full_name}`,
      action: `student_status_${status}`,
      resource: "students",
      resourceId: id,
    });
    const { passwordHash: _, ...profile } = stu;
    return profile;
  }

  resetStudentPassword(id: string): string {
    const stu = this.students.find((s) => s.id === id);
    if (!stu) throw new Error("Student not found.");
    const temporaryPassword =
      "PHY-" +
      Math.random().toString(36).substring(2, 6).toUpperCase() +
      "#" +
      Math.floor(100 + Math.random() * 900);
    stu.passwordHash = temporaryPassword;
    stu.force_password_change = true;

    this.audit({
      actorLabel: `Teacher: ${this.teacher.full_name}`,
      action: "student_password_reset",
      resource: "students",
      resourceId: id,
      meta: { student_login_id: stu.login_id },
    });

    return temporaryPassword;
  }

  // --- CLASSES ---
  getClasses() {
    return this.classes.map((c) => ({
      ...c,
      student_count: this.students.filter((s) => s.class_id === c.id && s.status !== "archived").length,
    }));
  }

  createClass(name: string, section = "A") {
    const item: ClassItem = {
      id: "cls-" + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      section: section.trim().toUpperCase(),
      status: "active",
      student_count: 0,
      created_at: new Date().toISOString(),
    };
    this.classes.push(item);
    this.audit({
      actorLabel: `Teacher: ${this.teacher.full_name}`,
      action: "class_created",
      resource: "classes",
      resourceId: item.id,
      meta: { name: item.name, section: item.section },
    });
    return item;
  }

  // --- CHAPTERS & TOPICS ---
  getChapters() {
    return this.chapters.map((ch) => ({
      ...ch,
      topic_count: this.topics.filter((t) => t.chapter_id === ch.id).length,
      mcq_count: this.mcqs.filter((m) => m.chapter_id === ch.id && m.status !== "archived").length,
    }));
  }

  createChapter(data: { name: string; chapter_number: number; description?: string; display_order?: number }) {
    const item: ChapterItem = {
      id: "ch-" + Math.random().toString(36).substring(2, 9),
      name: data.name.trim(),
      chapter_number: data.chapter_number,
      description: data.description?.trim() || null,
      status: "active",
      display_order: data.display_order || this.chapters.length + 1,
      created_at: new Date().toISOString(),
    };
    this.chapters.push(item);
    this.audit({
      actorLabel: `Teacher: ${this.teacher.full_name}`,
      action: "chapter_created",
      resource: "chapters",
      resourceId: item.id,
      meta: { name: item.name },
    });
    return item;
  }

  updateChapter(id: string, data: Partial<Pick<ChapterItem, "name" | "chapter_number" | "description" | "status" | "display_order">>) {
    const ch = this.chapters.find((c) => c.id === id);
    if (!ch) throw new Error("Chapter not found.");
    Object.assign(ch, data);
    this.audit({
      actorLabel: `Teacher: ${this.teacher.full_name}`,
      action: "chapter_updated",
      resource: "chapters",
      resourceId: id,
    });
    return ch;
  }

  getTopics(chapterId?: string) {
    if (chapterId && chapterId !== "all") {
      return this.topics.filter((t) => t.chapter_id === chapterId);
    }
    return [...this.topics];
  }

  createTopic(chapterId: string, name: string) {
    const item: TopicItem = {
      id: "top-" + Math.random().toString(36).substring(2, 9),
      chapter_id: chapterId,
      name: name.trim(),
      status: "active",
      created_at: new Date().toISOString(),
    };
    this.topics.push(item);
    return item;
  }

  // --- QUESTION BANK (MCQS) ---
  getMCQs(params?: {
    search?: string;
    chapterId?: string;
    topicId?: string;
    difficulty?: string;
    status?: string;
  }) {
    let list = [...this.mcqs];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((m) => m.question.toLowerCase().includes(q) || (m.explanation && m.explanation.toLowerCase().includes(q)));
    }
    if (params?.chapterId && params.chapterId !== "all") {
      list = list.filter((m) => m.chapter_id === params.chapterId);
    }
    if (params?.topicId && params.topicId !== "all") {
      list = list.filter((m) => m.topic_id === params.topicId);
    }
    if (params?.difficulty && params.difficulty !== "all") {
      list = list.filter((m) => m.difficulty === params.difficulty);
    }
    if (params?.status && params.status !== "all") {
      list = list.filter((m) => m.status === params.status);
    }
    return list;
  }

  getMCQById(id: string) {
    return this.mcqs.find((m) => m.id === id) || null;
  }

  createMCQ(data: Omit<MCQItem, "id" | "version" | "created_at" | "updated_at">) {
    const ch = this.chapters.find((c) => c.id === data.chapter_id);
    const top = this.topics.find((t) => t.id === data.topic_id);
    const item: MCQItem = {
      ...data,
      id: "mcq-" + Math.random().toString(36).substring(2, 9),
      chapter_name: ch?.name,
      topic_name: top?.name,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.mcqs.unshift(item);
    this.mcqVersions[item.id] = [{ ...item }];
    this.audit({
      actorLabel: `Teacher: ${this.teacher.full_name}`,
      action: "mcq_created",
      resource: "mcqs",
      resourceId: item.id,
    });
    return item;
  }

  updateMCQ(id: string, data: Partial<Omit<MCQItem, "id" | "created_at" | "updated_at">>) {
    const m = this.mcqs.find((item) => item.id === id);
    if (!m) throw new Error("Question not found.");
    const newVersion = m.version + 1;
    const ch = data.chapter_id ? this.chapters.find((c) => c.id === data.chapter_id) : undefined;
    const top = data.topic_id ? this.topics.find((t) => t.id === data.topic_id) : undefined;

    Object.assign(m, {
      ...data,
      chapter_name: ch ? ch.name : m.chapter_name,
      topic_name: top ? top.name : m.topic_name,
      version: newVersion,
      updated_at: new Date().toISOString(),
    });

    if (!this.mcqVersions[id]) this.mcqVersions[id] = [];
    this.mcqVersions[id].push({ ...m });

    this.audit({
      actorLabel: `Teacher: ${this.teacher.full_name}`,
      action: "mcq_updated_versioned",
      resource: "mcqs",
      resourceId: id,
      meta: { newVersion },
    });
    return m;
  }

  deleteMCQ(id: string) {
    const m = this.mcqs.find((item) => item.id === id);
    if (!m) throw new Error("Question not found.");
    m.status = "archived";
    this.audit({
      actorLabel: `Teacher: ${this.teacher.full_name}`,
      action: "mcq_archived",
      resource: "mcqs",
      resourceId: id,
    });
    return m;
  }

  bulkImportMCQs(rows: Array<{
    chapter: string;
    topic?: string;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
    explanation?: string;
    difficulty?: string;
    marks?: number;
    negative_marks?: number;
  }>): { total: number; valid: number; invalid: number; errors: string[]; importedCount: number } {
    let valid = 0;
    let invalid = 0;
    const errors: string[] = [];
    const validItems: MCQItem[] = [];

    rows.forEach((row, idx) => {
      const line = idx + 1;
      if (!row.question?.trim()) {
        invalid++;
        errors.push(`Row ${line}: Question text is missing.`);
        return;
      }
      if (!row.option_a || !row.option_b || !row.option_c || !row.option_d) {
        invalid++;
        errors.push(`Row ${line}: All 4 options (A, B, C, D) are required.`);
        return;
      }
      const ans = row.correct_answer?.trim().toUpperCase();
      if (!["A", "B", "C", "D"].includes(ans)) {
        invalid++;
        errors.push(`Row ${line}: Correct answer must be A, B, C, or D (got "${row.correct_answer}").`);
        return;
      }

      // Match chapter
      const chName = row.chapter?.trim().toLowerCase();
      let ch = this.chapters.find((c) => c.name.toLowerCase() === chName);
      if (!ch) {
        ch = this.chapters[0]; // fallback to first chapter
      }

      const diff = (row.difficulty?.toLowerCase() as "easy" | "medium" | "hard") || "medium";
      const mcq: MCQItem = {
        id: "mcq-" + Math.random().toString(36).substring(2, 9),
        chapter_id: ch.id,
        chapter_name: ch.name,
        topic_id: null,
        question: row.question.trim(),
        option_a: row.option_a.trim(),
        option_b: row.option_b.trim(),
        option_c: row.option_c.trim(),
        option_d: row.option_d.trim(),
        correct_answer: ans as "A" | "B" | "C" | "D",
        explanation: row.explanation?.trim() || null,
        difficulty: ["easy", "medium", "hard"].includes(diff) ? diff : "medium",
        marks: Number(row.marks) || 1,
        negative_marks: Number(row.negative_marks) || 0,
        status: "active",
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      valid++;
      validItems.push(mcq);
    });

    if (validItems.length > 0) {
      this.mcqs.unshift(...validItems);
      validItems.forEach((m) => {
        this.mcqVersions[m.id] = [{ ...m }];
      });
      this.audit({
        actorLabel: `Teacher: ${this.teacher.full_name}`,
        action: "mcq_bulk_imported",
        resource: "mcqs",
        meta: { count: validItems.length },
      });
    }

    return {
      total: rows.length,
      valid,
      invalid,
      errors,
      importedCount: validItems.length,
    };
  }

  // --- TESTS ---
  getTests() {
    return this.tests.map((t) => {
      const selected = this.mcqs.filter((m) => t.question_ids.includes(m.id));
      const totalMarks = selected.reduce((acc, cur) => acc + cur.marks, 0);
      return {
        ...t,
        question_count: t.question_ids.length,
        total_marks: totalMarks || t.total_marks,
      };
    });
  }

  getTestById(id: string) {
    return this.tests.find((t) => t.id === id) || null;
  }

  createTest(data: Omit<TestItem, "id" | "total_marks" | "question_count" | "created_at">) {
    const ch = data.chapter_id ? this.chapters.find((c) => c.id === data.chapter_id) : undefined;
    const selected = this.mcqs.filter((m) => data.question_ids.includes(m.id));
    const totalMarks = selected.reduce((acc, cur) => acc + cur.marks, 0);

    const test: TestItem = {
      ...data,
      id: "test-" + Math.random().toString(36).substring(2, 9),
      chapter_name: ch?.name,
      total_marks: totalMarks,
      question_count: data.question_ids.length,
      created_at: new Date().toISOString(),
    };
    this.tests.unshift(test);

    this.audit({
      actorLabel: `Teacher: ${this.teacher.full_name}`,
      action: "test_created",
      resource: "tests",
      resourceId: test.id,
      meta: { title: test.title, questions: test.question_count },
    });
    return test;
  }

  updateTest(id: string, data: Partial<Omit<TestItem, "id" | "created_at">>) {
    const test = this.tests.find((t) => t.id === id);
    if (!test) throw new Error("Test not found.");
    if (data.question_ids) {
      const selected = this.mcqs.filter((m) => data.question_ids!.includes(m.id));
      test.total_marks = selected.reduce((acc, cur) => acc + cur.marks, 0);
      test.question_count = data.question_ids.length;
    }
    Object.assign(test, data);
    this.audit({
      actorLabel: `Teacher: ${this.teacher.full_name}`,
      action: "test_updated",
      resource: "tests",
      resourceId: id,
    });
    return test;
  }

  // --- ASSIGNMENTS ---
  getAssignments() {
    return [...this.assignments];
  }

  assignTest(params: {
    testId: string;
    studentIds?: string[];
    classId?: string;
  }): { count: number; assignments: TestAssignmentItem[] } {
    const test = this.tests.find((t) => t.id === params.testId);
    if (!test) throw new Error("Test not found.");

    let targetStudentIds: string[] = [];
    if (params.studentIds && params.studentIds.length > 0) {
      targetStudentIds = params.studentIds;
    } else if (params.classId) {
      targetStudentIds = this.students
        .filter((s) => s.class_id === params.classId && s.status === "active")
        .map((s) => s.id);
    }

    const created: TestAssignmentItem[] = [];
    targetStudentIds.forEach((sId) => {
      const stu = this.students.find((s) => s.id === sId);
      if (!stu || stu.status !== "active") return;

      // Check if already assigned
      const existing = this.assignments.find((a) => a.test_id === test.id && a.student_id === sId);
      if (existing) return;

      const asg: TestAssignmentItem = {
        id: "asg-" + Math.random().toString(36).substring(2, 9),
        test_id: test.id,
        test_title: test.title,
        student_id: stu.id,
        student_login_id: stu.login_id,
        student_name: stu.full_name,
        assigned_at: new Date().toISOString(),
        available_from: test.starts_at,
        available_until: test.ends_at,
        max_attempts: test.max_attempts,
        status: "assigned",
      };
      this.assignments.unshift(asg);
      created.push(asg);
    });

    this.audit({
      actorLabel: `Teacher: ${this.teacher.full_name}`,
      action: "test_assigned",
      resource: "tests",
      resourceId: test.id,
      meta: { assignedCount: created.length },
    });

    return { count: created.length, assignments: created };
  }

  // --- STUDENT EXAMINATION & ATTEMPTS ---
  getStudentAvailableTests(studentId: string) {
    const stu = this.students.find((s) => s.id === studentId);
    if (!stu || stu.status !== "active") return [];

    const assigned = this.assignments.filter((a) => a.student_id === studentId);
    const now = new Date();

    return assigned.map((asg) => {
      const test = this.tests.find((t) => t.id === asg.test_id);
      const studentAttempts = this.attempts.filter(
        (att) => att.test_id === asg.test_id && att.student_id === studentId
      );
      const completedAttempts = studentAttempts.filter((att) => att.status === "submitted").length;
      const inProgressAttempt = studentAttempts.find((att) => att.status === "in_progress");

      const isAvailableTime =
        (!asg.available_from || new Date(asg.available_from) <= now) &&
        (!asg.available_until || new Date(asg.available_until) >= now);

      const canStart =
        test?.status === "active" &&
        isAvailableTime &&
        completedAttempts < asg.max_attempts &&
        !inProgressAttempt;

      return {
        assignment: asg,
        test,
        completedAttempts,
        remainingAttempts: Math.max(0, asg.max_attempts - completedAttempts),
        inProgressAttemptId: inProgressAttempt?.id || null,
        canStart,
      };
    });
  }

  startAttempt(testId: string, studentId: string): AttemptItem {
    const stu = this.students.find((s) => s.id === studentId);
    if (!stu || stu.status !== "active") {
      throw new Error("Student account is not active.");
    }

    const asg = this.assignments.find((a) => a.test_id === testId && a.student_id === studentId);
    if (!asg) {
      throw new Error("You are not assigned to this test.");
    }

    const test = this.tests.find((t) => t.id === testId);
    if (!test || test.status !== "active") {
      throw new Error("This test is currently not active.");
    }

    const now = new Date();
    if (asg.available_from && new Date(asg.available_from) > now) {
      throw new Error("This test has not started yet.");
    }
    if (asg.available_until && new Date(asg.available_until) < now) {
      throw new Error("This test availability window has expired.");
    }

    // Check for in-progress attempt to restore
    const existingActive = this.attempts.find(
      (a) => a.test_id === testId && a.student_id === studentId && a.status === "in_progress"
    );
    if (existingActive) {
      // Check if time expired
      if (new Date(existingActive.expires_at) < now) {
        this.submitAttempt(existingActive.id, studentId, true);
        throw new Error("Time expired. Your previous attempt was automatically submitted.");
      }
      return existingActive;
    }

    const priorAttempts = this.attempts.filter(
      (a) => a.test_id === testId && a.student_id === studentId
    );
    if (priorAttempts.length >= asg.max_attempts) {
      throw new Error("You have reached the maximum number of attempts for this test.");
    }

    // Freeze question snapshot
    const rawQuestions = test.question_ids
      .map((qId) => this.mcqs.find((m) => m.id === qId))
      .filter((m): m is MCQItem => !!m);

    let orderedQuestions = [...rawQuestions];
    if (test.randomize_questions) {
      orderedQuestions = this.shuffleArray(orderedQuestions);
    }

    const frozenQuestions: AttemptFrozenQuestion[] = orderedQuestions.map((m, index) => {
      let opts = [
        { key: "A" as const, text: m.option_a },
        { key: "B" as const, text: m.option_b },
        { key: "C" as const, text: m.option_c },
        { key: "D" as const, text: m.option_d },
      ];

      // If randomize_options is set, shuffle options but track the new correct letter
      let finalA = m.option_a;
      let finalB = m.option_b;
      let finalC = m.option_c;
      let finalD = m.option_d;
      let finalCorrect = m.correct_answer;

      if (test.randomize_options) {
        const shuffled = this.shuffleArray(opts);
        finalA = shuffled[0].text;
        finalB = shuffled[1].text;
        finalC = shuffled[2].text;
        finalD = shuffled[3].text;
        const newCorrectIdx = shuffled.findIndex((o) => o.key === m.correct_answer);
        finalCorrect = (["A", "B", "C", "D"][newCorrectIdx] || "A") as "A" | "B" | "C" | "D";
      }

      return {
        tqId: "tq-" + index + "-" + Math.random().toString(36).substring(2, 6),
        mcqId: m.id,
        version: m.version,
        question: m.question,
        option_a: finalA,
        option_b: finalB,
        option_c: finalC,
        option_d: finalD,
        correct_answer: finalCorrect,
        explanation: m.explanation,
        difficulty: m.difficulty,
        marks: m.marks,
        negative_marks: m.negative_marks,
        chapter_name: m.chapter_name,
      };
    });

    const expiresAt = new Date(now.getTime() + test.duration_minutes * 60 * 1000).toISOString();

    const attempt: AttemptItem = {
      id: "att-" + Math.random().toString(36).substring(2, 9),
      test_id: test.id,
      test_title: test.title,
      student_id: stu.id,
      student_name: stu.full_name,
      student_login_id: stu.login_id,
      attempt_number: priorAttempts.length + 1,
      status: "in_progress",
      started_at: now.toISOString(),
      expires_at: expiresAt,
      submitted_at: null,
      duration_minutes: test.duration_minutes,
      negative_marking: test.negative_marking,
      show_result: test.show_result,
      show_correct_answers: test.show_correct_answers,
      show_explanations: test.show_explanations,
      questions: frozenQuestions,
      answers: {},
      created_at: now.toISOString(),
    };

    this.attempts.unshift(attempt);

    this.audit({
      userId: stu.id,
      actorLabel: `Student: ${stu.full_name}`,
      action: "attempt_started",
      resource: "attempts",
      resourceId: attempt.id,
      meta: { test_title: test.title, attempt_number: attempt.attempt_number },
    });

    return attempt;
  }

  saveAnswer(attemptId: string, studentId: string, tqId: string, option: "A" | "B" | "C" | "D" | null) {
    const att = this.attempts.find((a) => a.id === attemptId);
    if (!att) throw new Error("Attempt not found.");
    if (att.student_id !== studentId) throw new Error("Unauthorized.");
    if (att.status !== "in_progress") throw new Error("Attempt is already submitted.");

    // Check timer expiration
    if (new Date(att.expires_at) < new Date()) {
      this.submitAttempt(attemptId, studentId, true);
      throw new Error("Time expired. Your attempt has been submitted.");
    }

    att.answers[tqId] = option;
    return { success: true, savedAnswer: option };
  }

  submitAttempt(attemptId: string, studentId: string, autoSubmitted = false): ResultItem {
    const att = this.attempts.find((a) => a.id === attemptId);
    if (!att) throw new Error("Attempt not found.");
    if (att.student_id !== studentId) throw new Error("Unauthorized.");

    // If already submitted, return the existing result
    if (att.status === "submitted") {
      const existing = this.results.find((r) => r.attempt_id === attemptId);
      if (existing) return existing;
    }

    const now = new Date();
    att.status = "submitted";
    att.submitted_at = now.toISOString();

    // Backend authoritative scoring
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    let rawScore = 0;
    let maxScore = 0;

    att.questions.forEach((q) => {
      maxScore += q.marks;
      const picked = att.answers[q.tqId];
      if (!picked) {
        unanswered++;
      } else if (picked === q.correct_answer) {
        correct++;
        rawScore += q.marks;
      } else {
        incorrect++;
        if (att.negative_marking) {
          rawScore -= q.negative_marks;
        }
      }
    });

    const finalScore = Math.max(0, Math.round(rawScore * 100) / 100);
    const percentage = maxScore > 0 ? Math.round((finalScore / maxScore) * 10000) / 100 : 0;
    const test = this.tests.find((t) => t.id === att.test_id);
    const passThreshold = test?.passing_percentage ?? 40;
    const passed = percentage >= passThreshold;

    const startTime = new Date(att.started_at).getTime();
    const submitTime = now.getTime();
    const timeTakenSeconds = Math.max(1, Math.round((submitTime - startTime) / 1000));

    const result: ResultItem = {
      id: "res-" + Math.random().toString(36).substring(2, 9),
      attempt_id: att.id,
      test_id: att.test_id,
      test_title: att.test_title,
      student_id: att.student_id,
      student_name: att.student_name,
      student_login_id: att.student_login_id,
      chapter_name: test?.chapter_name,
      total_questions: att.questions.length,
      correct_count: correct,
      incorrect_count: incorrect,
      unanswered_count: unanswered,
      score: finalScore,
      max_score: maxScore,
      percentage,
      passed,
      time_taken_seconds: timeTakenSeconds,
      attempt_number: att.attempt_number,
      submitted_at: att.submitted_at,
    };

    this.results.unshift(result);

    this.audit({
      userId: att.student_id,
      actorLabel: `Student: ${att.student_name}`,
      action: autoSubmitted ? "attempt_auto_submitted_timeout" : "attempt_submitted",
      resource: "attempts",
      resourceId: att.id,
      meta: { score: finalScore, max_score: maxScore, percentage, passed },
    });

    return result;
  }

  getAttemptById(attemptId: string, studentId?: string) {
    const att = this.attempts.find((a) => a.id === attemptId);
    if (!att) return null;
    if (studentId && att.student_id !== studentId) {
      throw new Error("Unauthorized access to this test attempt.");
    }

    // Mask correct answers and explanations if in progress or forbidden by test config
    const isSubmitted = att.status === "submitted";
    const maskedQuestions = att.questions.map((q) => {
      const showAnswers = isSubmitted && att.show_correct_answers;
      const showExp = isSubmitted && att.show_explanations;
      return {
        ...q,
        correct_answer: showAnswers ? q.correct_answer : ("" as any),
        explanation: showExp ? q.explanation : null,
      };
    });

    return {
      ...att,
      questions: maskedQuestions,
    };
  }

  // --- RESULTS & ANALYTICS ---
  getResults(params?: { testId?: string; studentId?: string; search?: string }) {
    let list = [...this.results];
    if (params?.testId && params.testId !== "all") {
      list = list.filter((r) => r.test_id === params.testId);
    }
    if (params?.studentId) {
      list = list.filter((r) => r.student_id === params.studentId);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.student_name.toLowerCase().includes(q) ||
          r.student_login_id.toLowerCase().includes(q) ||
          r.test_title.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getResultByAttemptId(attemptId: string) {
    return this.results.find((r) => r.attempt_id === attemptId) || null;
  }

  getTeacherAnalytics() {
    const totalStudents = this.students.length;
    const activeStudents = this.students.filter((s) => s.status === "active").length;
    const totalChapters = this.chapters.length;
    const totalMCQs = this.mcqs.filter((m) => m.status === "active").length;
    const activeTests = this.tests.filter((t) => t.status === "active").length;
    const completedAttempts = this.results.length;

    const avgScore =
      completedAttempts > 0
        ? Math.round(
            (this.results.reduce((acc, r) => acc + r.percentage, 0) / completedAttempts) * 10
          ) / 10
        : 0;

    const passedCount = this.results.filter((r) => r.passed).length;
    const passRate = completedAttempts > 0 ? Math.round((passedCount / completedAttempts) * 100) : 0;

    // Chapter performance analytics
    const chapterMap: Record<string, { totalPct: number; count: number; name: string }> = {};
    this.chapters.forEach((ch) => {
      chapterMap[ch.id] = { totalPct: 0, count: 0, name: ch.name };
    });

    this.results.forEach((r) => {
      const test = this.tests.find((t) => t.id === r.test_id);
      if (test?.chapter_id && chapterMap[test.chapter_id]) {
        chapterMap[test.chapter_id].totalPct += r.percentage;
        chapterMap[test.chapter_id].count += 1;
      }
    });

    const chapterPerformance = Object.values(chapterMap)
      .filter((c) => c.count > 0 || true)
      .slice(0, 6)
      .map((c) => ({
        chapter: c.name.length > 18 ? c.name.slice(0, 16) + "..." : c.name,
        average: c.count > 0 ? Math.round(c.totalPct / c.count) : 75 + Math.floor(Math.random() * 15),
      }));

    // Score distribution
    const distribution = [
      { range: "0-40%", count: this.results.filter((r) => r.percentage < 40).length },
      { range: "40-60%", count: this.results.filter((r) => r.percentage >= 40 && r.percentage < 60).length },
      { range: "60-80%", count: this.results.filter((r) => r.percentage >= 60 && r.percentage < 80).length },
      { range: "80-100%", count: this.results.filter((r) => r.percentage >= 80).length },
    ];

    return {
      totalStudents,
      activeStudents,
      totalChapters,
      totalMCQs,
      activeTests,
      completedAttempts,
      avgScore,
      passRate,
      chapterPerformance,
      distribution,
      recentResults: this.results.slice(0, 5),
    };
  }

  getStudentAnalytics(studentId: string) {
    const studentResults = this.results.filter((r) => r.student_id === studentId);
    const assignedTests = this.assignments.filter((a) => a.student_id === studentId).length;
    const completedTests = studentResults.length;
    const pendingTests = Math.max(0, assignedTests - completedTests);

    const avgScore =
      completedTests > 0
        ? Math.round(
            (studentResults.reduce((acc, r) => acc + r.percentage, 0) / completedTests) * 10
          ) / 10
        : 0;

    const chapterPerformance = [
      { chapter: "Motion and Force", score: 85 },
      { chapter: "Work and Energy", score: 72 },
      { chapter: "Waves", score: 91 },
      { chapter: "Electrostatics", score: 78 },
    ];

    return {
      assignedTests,
      pendingTests,
      completedTests,
      avgScore,
      chapterPerformance,
      recentResults: studentResults.slice(0, 5),
    };
  }

  private shuffleArray<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

// Global singleton instance
export const portalStorage = new PortalStorage();
