export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attempt_answers: {
        Row: {
          attempt_id: string
          id: string
          selected_option: string | null
          test_question_id: string
          updated_at: string
        }
        Insert: {
          attempt_id: string
          id?: string
          selected_option?: string | null
          test_question_id: string
          updated_at?: string
        }
        Update: {
          attempt_id?: string
          id?: string
          selected_option?: string | null
          test_question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          attempt_number: number
          created_at: string
          expires_at: string
          id: string
          questions: Json
          started_at: string
          status: Database["public"]["Enums"]["attempt_status"]
          student_id: string
          submitted_at: string | null
          test_id: string
        }
        Insert: {
          attempt_number?: number
          created_at?: string
          expires_at: string
          id?: string
          questions?: Json
          started_at?: string
          status?: Database["public"]["Enums"]["attempt_status"]
          student_id: string
          submitted_at?: string | null
          test_id: string
        }
        Update: {
          attempt_number?: number
          created_at?: string
          expires_at?: string
          id?: string
          questions?: Json
          started_at?: string
          status?: Database["public"]["Enums"]["attempt_status"]
          student_id?: string
          submitted_at?: string | null
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_label: string | null
          created_at: string
          id: string
          ip_address: string | null
          meta: Json
          resource: string | null
          resource_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          actor_label?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          meta?: Json
          resource?: string | null
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_label?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          meta?: Json
          resource?: string | null
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chapters: {
        Row: {
          chapter_number: number
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          id: string
          name: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          chapter_number?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          name: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          chapter_number?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string
          id: string
          name: string
          section: string
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          section?: string
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          section?: string
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string
          id: string
          identifier: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
          ip_address?: string | null
          success?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
          ip_address?: string | null
          success?: boolean
        }
        Relationships: []
      }
      mcq_versions: {
        Row: {
          created_at: string
          id: string
          mcq_id: string
          snapshot: Json
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          mcq_id: string
          snapshot: Json
          version: number
        }
        Update: {
          created_at?: string
          id?: string
          mcq_id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "mcq_versions_mcq_id_fkey"
            columns: ["mcq_id"]
            isOneToOne: false
            referencedRelation: "mcqs"
            referencedColumns: ["id"]
          },
        ]
      }
      mcqs: {
        Row: {
          chapter_id: string | null
          correct_answer: string
          created_at: string
          created_by: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          explanation: string | null
          id: string
          marks: number
          negative_marks: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          status: Database["public"]["Enums"]["content_status"]
          topic_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          chapter_id?: string | null
          correct_answer: string
          created_at?: string
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          marks?: number
          negative_marks?: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          status?: Database["public"]["Enums"]["content_status"]
          topic_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          chapter_id?: string | null
          correct_answer?: string
          created_at?: string
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          marks?: number
          negative_marks?: number
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          status?: Database["public"]["Enums"]["content_status"]
          topic_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "mcqs_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcqs_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          class_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          force_password_change: boolean
          full_name: string
          id: string
          login_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          roll_number: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          force_password_change?: boolean
          full_name: string
          id: string
          login_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          roll_number?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          force_password_change?: boolean
          full_name?: string
          id?: string
          login_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          roll_number?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          attempt_id: string
          attempt_number: number
          correct_count: number
          created_at: string
          id: string
          incorrect_count: number
          max_score: number
          passed: boolean
          percentage: number
          score: number
          student_id: string
          submitted_at: string
          test_id: string
          time_taken_seconds: number
          total_questions: number
          unanswered_count: number
        }
        Insert: {
          attempt_id: string
          attempt_number?: number
          correct_count: number
          created_at?: string
          id?: string
          incorrect_count: number
          max_score: number
          passed: boolean
          percentage: number
          score: number
          student_id: string
          submitted_at?: string
          test_id: string
          time_taken_seconds?: number
          total_questions: number
          unanswered_count: number
        }
        Update: {
          attempt_id?: string
          attempt_number?: number
          correct_count?: number
          created_at?: string
          id?: string
          incorrect_count?: number
          max_score?: number
          passed?: boolean
          percentage?: number
          score?: number
          student_id?: string
          submitted_at?: string
          test_id?: string
          time_taken_seconds?: number
          total_questions?: number
          unanswered_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "results_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: true
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          available_from: string | null
          available_until: string | null
          id: string
          max_attempts: number
          status: Database["public"]["Enums"]["assignment_status"]
          student_id: string
          test_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          available_from?: string | null
          available_until?: string | null
          id?: string
          max_attempts?: number
          status?: Database["public"]["Enums"]["assignment_status"]
          student_id: string
          test_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          available_from?: string | null
          available_until?: string | null
          id?: string
          max_attempts?: number
          status?: Database["public"]["Enums"]["assignment_status"]
          student_id?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_assignments_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_questions: {
        Row: {
          created_at: string
          id: string
          marks: number
          mcq_id: string
          mcq_version: number
          negative_marks: number
          position: number
          test_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          marks?: number
          mcq_id: string
          mcq_version?: number
          negative_marks?: number
          position?: number
          test_id: string
        }
        Update: {
          created_at?: string
          id?: string
          marks?: number
          mcq_id?: string
          mcq_version?: number
          negative_marks?: number
          position?: number
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_mcq_id_fkey"
            columns: ["mcq_id"]
            isOneToOne: false
            referencedRelation: "mcqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          chapter_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number
          ends_at: string | null
          id: string
          max_attempts: number
          negative_marking: boolean
          passing_percentage: number
          randomize_options: boolean
          randomize_questions: boolean
          show_correct_answers: boolean
          show_explanations: boolean
          show_result: boolean
          starts_at: string | null
          status: Database["public"]["Enums"]["test_status"]
          title: string
          updated_at: string
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          ends_at?: string | null
          id?: string
          max_attempts?: number
          negative_marking?: boolean
          passing_percentage?: number
          randomize_options?: boolean
          randomize_questions?: boolean
          show_correct_answers?: boolean
          show_explanations?: boolean
          show_result?: boolean
          starts_at?: string | null
          status?: Database["public"]["Enums"]["test_status"]
          title: string
          updated_at?: string
        }
        Update: {
          chapter_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          ends_at?: string | null
          id?: string
          max_attempts?: number
          negative_marking?: boolean
          passing_percentage?: number
          randomize_options?: boolean
          randomize_questions?: boolean
          show_correct_answers?: boolean
          show_explanations?: boolean
          show_result?: boolean
          starts_at?: string | null
          status?: Database["public"]["Enums"]["test_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "active" | "disabled" | "archived"
      app_role: "admin" | "teacher" | "student"
      assignment_status: "assigned" | "in_progress" | "completed" | "expired"
      attempt_status: "in_progress" | "submitted" | "expired"
      content_status: "draft" | "active" | "archived"
      difficulty_level: "easy" | "medium" | "hard"
      test_status: "draft" | "scheduled" | "active" | "expired" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "disabled", "archived"],
      app_role: ["admin", "teacher", "student"],
      assignment_status: ["assigned", "in_progress", "completed", "expired"],
      attempt_status: ["in_progress", "submitted", "expired"],
      content_status: ["draft", "active", "archived"],
      difficulty_level: ["easy", "medium", "hard"],
      test_status: ["draft", "scheduled", "active", "expired", "archived"],
    },
  },
} as const
