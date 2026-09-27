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
        topics_count: 0,
        questions_count: 0,
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
