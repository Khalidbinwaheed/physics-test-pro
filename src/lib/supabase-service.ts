import { supabase } from "@/integrations/supabase/client";
import {
  ClassItem,
  ChapterItem,
  TopicItem,
  MCQItem,
  TestItem,
  TestAssignmentItem,
  AttemptItem,
  ResultItem,
  AuditLogItem,
  StudentProfile,
} from "./portal-types";

class SupabaseService {
  private isConnected: boolean | null = null;

  async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from("classes").select("id").limit(1);
      this.isConnected = !error;
      return !error;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  // --- CLASSES ---
  async getClasses(): Promise<ClassItem[]> {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data) return [];
      return data.map((d) => ({
        id: d.id,
        name: d.name,
        section: d.section || "A",
        status: (d.status as "active" | "disabled" | "archived") || "active",
        created_at: d.created_at,
        student_count: 0,
      }));
    } catch {
      return [];
    }
  }

  async insertClass(cls: Omit<ClassItem, "id" | "created_at" | "student_count">): Promise<ClassItem | null> {
    try {
      const { data, error } = await supabase
        .from("classes")
        .insert({
          name: cls.name,
          section: cls.section,
          status: cls.status,
        })
        .select()
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        name: data.name,
        section: data.section,
        status: data.status,
        created_at: data.created_at,
        student_count: 0,
      };
    } catch {
      return null;
    }
  }

  async updateClass(id: string, updates: Partial<{ name: string; section: string; status: "active" | "disabled" | "archived" }>): Promise<boolean> {
    try {
      const { error } = await supabase.from("classes").update(updates).eq("id", id);
      return !error;
    } catch {
      return false;
    }
  }

  async deleteClass(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      return !error;
    } catch {
      return false;
    }
  }

  // --- CHAPTERS & TOPICS ---
  async getChapters(): Promise<ChapterItem[]> {
    try {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .order("display_order", { ascending: true });

      if (error || !data) return [];
      return data.map((d) => ({
        id: d.id,
        name: d.name,
        chapter_number: d.chapter_number,
        description: d.description || "",
        status: (d.status as "active" | "draft" | "archived") || "active",
        display_order: d.display_order,
        topics_count: 0,
        questions_count: 0,
        created_at: d.created_at,
      }));
    } catch {
      return [];
    }
  }

  async insertChapter(ch: { name: string; chapter_number: number; description?: string }): Promise<ChapterItem | null> {
    try {
      const { data, error } = await supabase
        .from("chapters")
        .insert({
          name: ch.name,
          chapter_number: ch.chapter_number,
          description: ch.description || null,
          status: "active",
          display_order: ch.chapter_number,
        })
        .select()
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        name: data.name,
        chapter_number: data.chapter_number,
        description: data.description || "",
        status: data.status,
        display_order: data.display_order,
        topic_count: 0,
        mcq_count: 0,
        created_at: data.created_at,
      };
    } catch {
      return null;
    }
  }

  async getTopics(): Promise<TopicItem[]> {
    try {
      const { data, error } = await supabase.from("topics").select("*").order("name");
      if (error || !data) return [];
      return data.map((d) => ({
        id: d.id,
        chapter_id: d.chapter_id,
        name: d.name,
        status: (d.status as "active" | "draft" | "archived") || "active",
        created_at: d.created_at,
      }));
    } catch {
      return [];
    }
  }

  async insertTopic(tp: { chapter_id: string; name: string }): Promise<TopicItem | null> {
    try {
      const { data, error } = await supabase
        .from("topics")
        .insert({
          chapter_id: tp.chapter_id,
          name: tp.name,
          status: "active",
        })
        .select()
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        chapter_id: data.chapter_id,
        name: data.name,
        status: data.status,
        created_at: data.created_at,
      };
    } catch {
      return null;
    }
  }

  // --- MCQS (QUESTION BANK) ---
  async getMCQs(): Promise<MCQItem[]> {
    try {
      const { data, error } = await supabase
        .from("mcqs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data) return [];
      return data.map((d) => ({
        id: d.id,
        chapter_id: d.chapter_id || "",
        topic_id: d.topic_id || "",
        question: d.question,
        option_a: d.option_a,
        option_b: d.option_b,
        option_c: d.option_c,
        option_d: d.option_d,
        correct_answer: d.correct_answer as "A" | "B" | "C" | "D",
        explanation: d.explanation || "",
        difficulty: d.difficulty as "easy" | "medium" | "hard",
        marks: Number(d.marks) || 1,
        negative_marks: Number(d.negative_marks) || 0,
        status: (d.status as "active" | "draft" | "archived") || "active",
        version: d.version || 1,
        created_at: d.created_at,
        updated_at: d.updated_at,
      }));
    } catch {
      return [];
    }
  }

  async insertMCQ(mcq: Omit<MCQItem, "id" | "created_at" | "updated_at">): Promise<MCQItem | null> {
    try {
      const { data, error } = await supabase
        .from("mcqs")
        .insert({
          chapter_id: mcq.chapter_id || null,
          topic_id: mcq.topic_id || null,
          question: mcq.question,
          option_a: mcq.option_a,
          option_b: mcq.option_b,
          option_c: mcq.option_c,
          option_d: mcq.option_d,
          correct_answer: mcq.correct_answer,
          explanation: mcq.explanation || null,
          difficulty: mcq.difficulty,
          marks: mcq.marks,
          negative_marks: mcq.negative_marks,
          status: mcq.status,
          version: 1,
        })
        .select()
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        chapter_id: data.chapter_id || "",
        topic_id: data.topic_id || "",
        question: data.question,
        option_a: data.option_a,
        option_b: data.option_b,
        option_c: data.option_c,
        option_d: data.option_d,
        correct_answer: data.correct_answer as "A" | "B" | "C" | "D",
        explanation: data.explanation || "",
        difficulty: data.difficulty as "easy" | "medium" | "hard",
        marks: Number(data.marks),
        negative_marks: Number(data.negative_marks),
        status: data.status as "active" | "draft" | "archived",
        version: data.version,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch {
      return null;
    }
  }

  // --- TESTS ---
  async getTests(): Promise<TestItem[]> {
    try {
      const { data, error } = await supabase
        .from("tests")
        .select("*, test_questions(mcq_id)")
        .order("created_at", { ascending: false });

      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        title: d.title,
        description: d.description || "",
        chapter_id: d.chapter_id || "",
        duration_minutes: d.duration_minutes,
        passing_percentage: Number(d.passing_percentage),
        negative_marking: d.negative_marking,
        starts_at: d.starts_at,
        ends_at: d.ends_at,
        max_attempts: d.max_attempts,
        randomize_questions: d.randomize_questions,
        randomize_options: d.randomize_options,
        show_result: d.show_result,
        show_correct_answers: d.show_correct_answers,
        show_explanations: d.show_explanations,
        status: d.status as "draft" | "active" | "scheduled" | "expired" | "archived",
        question_count: d.test_questions?.length || 0,
        total_marks: (d.test_questions?.length || 0) * 1,
        question_ids: (d.test_questions || []).map((tq: any) => tq.mcq_id),
        created_at: d.created_at,
      }));
    } catch {
      return [];
    }
  }

  async insertTest(test: TestItem): Promise<boolean> {
    try {
      const { error } = await supabase.from("tests").insert({
        id: test.id,
        title: test.title,
        description: test.description || null,
        chapter_id: test.chapter_id || null,
        duration_minutes: test.duration_minutes,
        passing_percentage: test.passing_percentage,
        negative_marking: test.negative_marking,
        starts_at: test.starts_at || null,
        ends_at: test.ends_at || null,
        max_attempts: test.max_attempts,
        randomize_questions: test.randomize_questions,
        randomize_options: test.randomize_options,
        show_result: test.show_result,
        show_correct_answers: test.show_correct_answers,
        show_explanations: test.show_explanations,
        status: test.status,
      });

      if (error) {
        console.error("Supabase insertTest error:", error);
        return false;
      }
      
      if (test.question_ids && test.question_ids.length > 0) {
        const tqInserts = test.question_ids.map((mcqId, index) => ({
          test_id: test.id,
          mcq_id: mcqId,
          position: index + 1,
          marks: 1, // Defaulting marks here for simplicity
          negative_marks: test.negative_marking ? 0.25 : 0,
        }));
        const { error: tqError } = await supabase.from("test_questions").insert(tqInserts);
        if (tqError) console.error("Supabase test_questions insert error:", tqError);
      }
      
      return true;
    } catch (e) {
      console.error("Supabase insertTest catch error:", e);
      return false;
    }
  }

  // --- ASSIGNMENTS ---
  async getAssignments(): Promise<TestAssignmentItem[]> {
    try {
      const { data, error } = await supabase
        .from("test_assignments")
        .select("*, tests(title), profiles(login_id, full_name)");

      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        test_id: d.test_id,
        test_title: d.tests?.title,
        student_id: d.student_id,
        student_login_id: d.profiles?.login_id,
        student_name: d.profiles?.full_name,
        assigned_at: d.assigned_at,
        available_from: d.available_from,
        available_until: d.available_until,
        max_attempts: d.max_attempts,
        status: d.status as "assigned" | "in_progress" | "completed" | "expired",
      }));
    } catch {
      return [];
    }
  }

  async insertAssignment(assignment: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("test_assignments").insert({
        id: assignment.id,
        test_id: assignment.test_id,
        student_id: assignment.student_id,
        assigned_at: assignment.assigned_at,
        available_from: assignment.available_from || null,
        available_until: assignment.available_until || null,
        max_attempts: assignment.max_attempts,
        status: assignment.status,
      });
      return !error;
    } catch {
      return false;
    }
  }

  // --- ATTEMPTS & RESULTS ---
  async getAttempts(): Promise<AttemptItem[]> {
    try {
      const { data, error } = await supabase.from("attempts").select("*");
      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        test_id: d.test_id,
        test_title: "", // We can mock this or fetch it
        student_id: d.student_id,
        student_name: "",
        student_login_id: "",
        attempt_number: d.attempt_number,
        status: d.status,
        started_at: d.started_at,
        expires_at: d.expires_at,
        submitted_at: d.submitted_at,
        duration_minutes: 0,
        negative_marking: false,
        show_result: true,
        show_correct_answers: false,
        show_explanations: false,
        questions: d.questions || [],
        answers: {}, // would need attempt_answers table sync
        created_at: d.created_at,
      }));
    } catch {
      return [];
    }
  }

  async insertAttempt(attempt: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("attempts").insert({
        id: attempt.id,
        test_id: attempt.test_id,
        student_id: attempt.student_id,
        attempt_number: attempt.attempt_number,
        status: attempt.status,
        started_at: attempt.started_at || null,
        expires_at: attempt.expires_at || null,
        submitted_at: attempt.submitted_at || null,
        questions: attempt.questions,
      });
      if (error) console.error("Supabase insertAttempt error:", error);
      return !error;
    } catch (e) {
      console.error("Supabase insertAttempt catch:", e);
      return false;
    }
  }

  async updateAttempt(attemptId: string, updates: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("attempts").update(updates).eq("id", attemptId);
      if (error) console.error("Supabase updateAttempt error:", error);
      return !error;
    } catch (e) {
      console.error("Supabase updateAttempt catch:", e);
      return false;
    }
  }

  async getResults(): Promise<ResultItem[]> {
    try {
      const { data, error } = await supabase
        .from("results")
        .select("*, tests(title), profiles(full_name, login_id)");
      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        attempt_id: d.attempt_id,
        test_id: d.test_id,
        test_title: d.tests?.title,
        student_id: d.student_id,
        student_name: d.profiles?.full_name,
        student_login_id: d.profiles?.login_id,
        total_questions: d.total_questions,
        correct_count: d.correct_count,
        incorrect_count: d.incorrect_count,
        unanswered_count: d.unanswered_count,
        score: d.score,
        max_score: d.max_score,
        percentage: d.percentage,
        passed: d.passed,
        time_taken_seconds: d.time_taken_seconds,
        attempt_number: d.attempt_number,
        submitted_at: d.submitted_at,
      }));
    } catch {
      return [];
    }
  }

  async insertResult(result: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("results").insert({
        id: result.id,
        attempt_id: result.attempt_id,
        test_id: result.test_id,
        student_id: result.student_id,
        total_questions: result.total_questions,
        correct_count: result.correct_count,
        incorrect_count: result.incorrect_count,
        unanswered_count: result.unanswered_count,
        score: result.score,
        max_score: result.max_score,
        percentage: result.percentage,
        passed: result.passed,
        time_taken_seconds: result.time_taken_seconds,
        attempt_number: result.attempt_number,
        submitted_at: result.submitted_at,
      });
      if (error) console.error("Supabase insertResult error:", error);
      return !error;
    } catch (e) {
      console.error("Supabase insertResult catch:", e);
      return false;
    }
  }

  // --- PROFILES / STUDENTS ---
  async getStudents(): Promise<StudentProfile[]> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, classes(name, section)")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        login_id: d.login_id || "",
        full_name: d.full_name,
        email: d.email || "",
        phone: d.phone || null,
        class_id: d.class_id,
        class_name: d.classes?.name,
        section: d.classes?.section,
        roll_number: d.roll_number,
        status: d.status as "active" | "disabled" | "archived",
        force_password_change: d.force_password_change,
        created_at: d.created_at,
      }));
    } catch {
      return [];
    }
  }

  async insertStudent(profile: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("profiles").insert({
        id: profile.id,
        login_id: profile.login_id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        class_id: profile.class_id,
        roll_number: profile.roll_number,
        status: profile.status,
        force_password_change: profile.force_password_change,
        role: "student",
      });
      return !error;
    } catch {
      return false;
    }
  }

  async updateStudent(id: string, updates: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("profiles").update(updates).eq("id", id);
      return !error;
    } catch {
      return false;
    }
  }

  // --- AUDIT LOGS ---
  async logAudit(log: {
    userId?: string;
    actorLabel?: string;
    action: string;
    resource?: string;
    resourceId?: string;
    meta?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await supabase.from("audit_logs").insert({
        user_id: log.userId || null,
        actor_label: log.actorLabel || "System",
        action: log.action,
        resource: log.resource || null,
        resource_id: log.resourceId || null,
        meta: (log.meta || {}) as any,
      });
    } catch {
      // Ignore background audit errors
    }
  }
}

export const supabaseService = new SupabaseService();
