import { normalizeLoginId, studentEmailFor } from "./login-id";

export interface StudentProfile {
  id: string;
  login_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  class_id: string | null;
  class_name?: string;
  section?: string;
  roll_number: string | null;
  status: "active" | "disabled" | "archived";
  force_password_change: boolean;
  created_at: string;
}

export interface ClassItem {
  id: string;
  name: string;
  section: string;
  status: "active" | "disabled" | "archived";
  student_count?: number;
  created_at: string;
}

export interface ChapterItem {
  id: string;
  name: string;
  chapter_number: number;
  description: string | null;
  status: "active" | "draft" | "archived";
  display_order: number;
  topic_count?: number;
  mcq_count?: number;
  created_at: string;
}

export interface TopicItem {
  id: string;
  chapter_id: string;
  name: string;
  status: "active" | "draft" | "archived";
  created_at: string;
}

export interface MCQItem {
  id: string;
  chapter_id: string | null;
  chapter_name?: string;
  topic_id: string | null;
  topic_name?: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string | null;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  negative_marks: number;
  status: "active" | "draft" | "archived";
  version: number;
  created_at: string;
  updated_at: string;
}

export interface TestItem {
  id: string;
  title: string;
  description: string | null;
  chapter_id: string | null;
  chapter_name?: string;
  duration_minutes: number;
  passing_percentage: number;
  negative_marking: boolean;
  starts_at: string | null;
  ends_at: string | null;
  max_attempts: number;
  randomize_questions: boolean;
  randomize_options: boolean;
  show_result: boolean;
  show_correct_answers: boolean;
  show_explanations: boolean;
  status: "draft" | "scheduled" | "active" | "expired" | "archived";
  question_ids: string[];
  total_marks: number;
  question_count: number;
  created_at: string;
}

export interface TestAssignmentItem {
  id: string;
  test_id: string;
  test_title?: string;
  student_id: string;
  student_login_id?: string;
  student_name?: string;
  assigned_at: string;
  available_from: string | null;
  available_until: string | null;
  max_attempts: number;
  status: "assigned" | "in_progress" | "completed" | "expired";
}

export interface AttemptItem {
  id: string;
  test_id: string;
  test_title: string;
  student_id: string;
  student_name: string;
  student_login_id: string;
  attempt_number: number;
  status: "in_progress" | "submitted" | "expired";
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  duration_minutes: number;
  negative_marking: boolean;
  show_result: boolean;
  show_correct_answers: boolean;
  show_explanations: boolean;
  questions: AttemptFrozenQuestion[];
  answers: Record<string, "A" | "B" | "C" | "D" | null>;
  created_at: string;
}

export interface AttemptFrozenQuestion {
  tqId: string;
  mcqId: string;
  version: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D"; // hidden on client until submitted & permitted
  explanation: string | null;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  negative_marks: number;
  chapter_name?: string;
}

export interface ResultItem {
  id: string;
  attempt_id: string;
  test_id: string;
  test_title: string;
  student_id: string;
  student_name: string;
  student_login_id: string;
  chapter_name?: string;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  time_taken_seconds: number;
  attempt_number: number;
  submitted_at: string;
}

export interface AuditLogItem {
  id: string;
  user_id: string | null;
  actor_label: string | null;
  action: string;
  resource: string | null;
  resource_id: string | null;
  meta: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}
