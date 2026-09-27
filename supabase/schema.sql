-- ============================================================================
-- PHYSICS MCQ EXAMINATION PORTAL - COMPLETE SUPABASE DATABASE SCHEMA
-- ============================================================================
-- This script is idempotent and can be safely executed in the Supabase SQL Editor.
-- It creates all required types, tables, relationships, indexes, triggers,
-- row-level security (RLS) policies, and helper functions.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMS
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'teacher', 'student');
EXCEPTION WHEN duplicate_object THEN
  BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin' BEFORE 'admin';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

DO $$ BEGIN
  CREATE TYPE public.account_status AS ENUM ('active', 'disabled', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.content_status AS ENUM ('draft', 'active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.test_status AS ENUM ('draft', 'scheduled', 'active', 'expired', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.attempt_status AS ENUM ('in_progress', 'submitted', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.assignment_status AS ENUM ('assigned', 'in_progress', 'completed', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- 2. UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 3. CORE TABLES
-- ============================================================================

-- Classes (e.g., Class 11, Class 12, Batch 2026)
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  section text NOT NULL DEFAULT 'A',
  status public.account_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_class_name_section UNIQUE (name, section)
);

-- User Profiles (Linked with auth.users if Supabase Auth is used, or standalone)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL DEFAULT 'student',
  full_name text NOT NULL,
  login_id text UNIQUE,
  email text,
  phone text,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  roll_number text,
  status public.account_status NOT NULL DEFAULT 'active',
  force_password_change boolean NOT NULL DEFAULT false,
  password_hash text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User Roles Table (for fine-grained RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_roles UNIQUE (user_id, role)
);

-- Chapters (e.g., Chapter 1: Measurements, Chapter 2: Vectors)
CREATE TABLE IF NOT EXISTS public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  chapter_number integer NOT NULL DEFAULT 1,
  description text,
  status public.content_status NOT NULL DEFAULT 'active',
  display_order integer NOT NULL DEFAULT 1,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Topics under Chapters
CREATE TABLE IF NOT EXISTS public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  name text NOT NULL,
  status public.content_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_chapter_topic UNIQUE (chapter_id, name)
);

-- MCQs (Physics Question Bank)
CREATE TABLE IF NOT EXISTS public.mcqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer char(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation text,
  difficulty public.difficulty_level NOT NULL DEFAULT 'medium',
  marks numeric(6,2) NOT NULL DEFAULT 1,
  negative_marks numeric(6,2) NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'active',
  version integer NOT NULL DEFAULT 1,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- MCQ Versions (Snapshots to preserve historic examination integrity)
CREATE TABLE IF NOT EXISTS public.mcq_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mcq_id uuid NOT NULL REFERENCES public.mcqs(id) ON DELETE CASCADE,
  version integer NOT NULL,
  snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_mcq_version UNIQUE (mcq_id, version)
);

-- Tests / Examinations
CREATE TABLE IF NOT EXISTS public.tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  duration_minutes integer NOT NULL DEFAULT 20,
  passing_percentage numeric(5,2) NOT NULL DEFAULT 40,
  negative_marking boolean NOT NULL DEFAULT false,
  starts_at timestamptz,
  ends_at timestamptz,
  max_attempts integer NOT NULL DEFAULT 1,
  randomize_questions boolean NOT NULL DEFAULT false,
  randomize_options boolean NOT NULL DEFAULT false,
  show_result boolean NOT NULL DEFAULT true,
  show_correct_answers boolean NOT NULL DEFAULT false,
  show_explanations boolean NOT NULL DEFAULT false,
  status public.test_status NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Test Questions Mapping
CREATE TABLE IF NOT EXISTS public.test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  mcq_id uuid NOT NULL REFERENCES public.mcqs(id) ON DELETE RESTRICT,
  mcq_version integer NOT NULL DEFAULT 1,
  position integer NOT NULL DEFAULT 1,
  marks numeric(6,2) NOT NULL DEFAULT 1,
  negative_marks numeric(6,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_test_mcq UNIQUE (test_id, mcq_id)
);

-- Test Assignments to Students
CREATE TABLE IF NOT EXISTS public.test_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  available_from timestamptz,
  available_until timestamptz,
  max_attempts integer NOT NULL DEFAULT 1,
  status public.assignment_status NOT NULL DEFAULT 'assigned',
  CONSTRAINT uq_test_assignment UNIQUE (test_id, student_id)
);

-- Exam Attempts (Live Exam Session)
CREATE TABLE IF NOT EXISTS public.attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL DEFAULT 1,
  status public.attempt_status NOT NULL DEFAULT 'in_progress',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  submitted_at timestamptz,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_attempt_student UNIQUE (test_id, student_id, attempt_number)
);

-- Autosaved Student Answers
CREATE TABLE IF NOT EXISTS public.attempt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  test_question_id uuid NOT NULL,
  selected_option char(1) CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_attempt_question UNIQUE (attempt_id, test_question_id)
);

-- Evaluated Exam Results
CREATE TABLE IF NOT EXISTS public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL UNIQUE REFERENCES public.attempts(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_questions integer NOT NULL,
  correct_count integer NOT NULL,
  incorrect_count integer NOT NULL,
  unanswered_count integer NOT NULL,
  score numeric(8,2) NOT NULL,
  max_score numeric(8,2) NOT NULL,
  percentage numeric(5,2) NOT NULL,
  passed boolean NOT NULL,
  time_taken_seconds integer NOT NULL DEFAULT 0,
  attempt_number integer NOT NULL DEFAULT 1,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Security & Activity Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  actor_label text,
  action text NOT NULL,
  resource text,
  resource_id text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Login Throttle & Tracking
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, status);
CREATE INDEX IF NOT EXISTS idx_profiles_class ON public.profiles(class_id);
CREATE INDEX IF NOT EXISTS idx_profiles_login_id ON public.profiles(login_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_chapter ON public.topics(chapter_id);
CREATE INDEX IF NOT EXISTS idx_mcqs_chapter ON public.mcqs(chapter_id);
CREATE INDEX IF NOT EXISTS idx_mcqs_topic ON public.mcqs(topic_id);
CREATE INDEX IF NOT EXISTS idx_mcqs_status ON public.mcqs(status);
CREATE INDEX IF NOT EXISTS idx_mcqs_difficulty ON public.mcqs(difficulty);
CREATE INDEX IF NOT EXISTS idx_tests_status ON public.tests(status);
CREATE INDEX IF NOT EXISTS idx_tests_chapter ON public.tests(chapter_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_test ON public.test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_mcq ON public.test_questions(mcq_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON public.test_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_test ON public.test_assignments(test_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON public.attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_test ON public.attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON public.attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_results_student ON public.results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_test ON public.results(test_id);
CREATE INDEX IF NOT EXISTS idx_results_submitted ON public.results(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ident ON public.login_attempts(identifier, created_at DESC);

-- ============================================================================
-- 5. AUTOMATIC TIMESTAMP TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS trg_classes_updated ON public.classes;
CREATE TRIGGER trg_classes_updated BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_chapters_updated ON public.chapters;
CREATE TRIGGER trg_chapters_updated BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_topics_updated ON public.topics;
CREATE TRIGGER trg_topics_updated BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_mcqs_updated ON public.mcqs;
CREATE TRIGGER trg_mcqs_updated BEFORE UPDATE ON public.mcqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_tests_updated ON public.tests;
CREATE TRIGGER trg_tests_updated BEFORE UPDATE ON public.tests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 6. RBAC HELPER FUNCTIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
    UNION
    SELECT 1 FROM public.profiles WHERE id = _user_id AND role = _role
  );
$$;

-- Check if a specific user (or auth.uid()) is a Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'super_admin'
    UNION
    SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'super_admin'
  );
$$;

-- Check if a specific user (or auth.uid()) is an Admin or Super Admin
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role IN ('admin', 'super_admin')
    UNION
    SELECT 1 FROM public.profiles WHERE id = p_user_id AND role IN ('admin', 'super_admin')
  );
$$;

-- Check if a specific user is a Teacher, Admin, or Super Admin
CREATE OR REPLACE FUNCTION public.is_teacher_or_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role IN ('teacher', 'admin', 'super_admin')
    UNION
    SELECT 1 FROM public.profiles WHERE id = p_user_id AND role IN ('teacher', 'admin', 'super_admin')
  );
$$;

-- Function to promote a user to Super Admin
CREATE OR REPLACE FUNCTION public.make_super_admin(p_identifier text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE id::text = p_identifier
     OR lower(trim(email)) = lower(trim(p_identifier))
     OR upper(trim(login_id)) = upper(trim(p_identifier))
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', format('No user found for: %s', p_identifier));
  END IF;

  UPDATE public.profiles SET role = 'super_admin', updated_at = now() WHERE id = v_user_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.audit_logs (action, resource, resource_id, meta)
  VALUES ('role_promoted_super_admin', 'profiles', v_user_id::text, jsonb_build_object('identifier', p_identifier));

  RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
END;
$$;

-- Function for Admin/Super Admin to create a teacher
CREATE OR REPLACE FUNCTION public.admin_create_teacher(
  p_full_name text,
  p_login_id text,
  p_email text,
  p_password text DEFAULT 'TeacherPass123!',
  p_phone text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_profile public.profiles%ROWTYPE;
BEGIN
  IF current_user <> 'postgres' AND (SELECT auth.role()) <> 'service_role' THEN
    IF NOT public.is_admin(v_caller) THEN
      RAISE EXCEPTION 'Access Denied: Only administrators can create teacher accounts.';
    END IF;
  END IF;

  INSERT INTO public.profiles (
    role, full_name, login_id, email, phone, password_hash, status, force_password_change, created_by
  ) VALUES (
    'teacher', trim(p_full_name), upper(trim(p_login_id)), lower(trim(p_email)), p_phone, p_password, 'active', true, v_caller
  ) RETURNING * INTO v_profile;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_profile.id, 'teacher')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.audit_logs (user_id, actor_label, action, resource, resource_id, meta)
  VALUES (v_caller, 'Administrator', 'teacher_created', 'profiles', v_profile.id::text, jsonb_build_object('login_id', v_profile.login_id));

  RETURN jsonb_build_object('success', true, 'teacher', row_to_json(v_profile));
END;
$$;

-- Function for Admin/Super Admin to create a student
CREATE OR REPLACE FUNCTION public.admin_create_student(
  p_login_id text,
  p_full_name text,
  p_class_id uuid DEFAULT NULL,
  p_roll_number text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_temporary_password text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_password text;
  v_profile public.profiles%ROWTYPE;
BEGIN
  IF current_user <> 'postgres' AND (SELECT auth.role()) <> 'service_role' THEN
    IF NOT public.is_admin(v_caller) THEN
      RAISE EXCEPTION 'Access Denied: Only administrators can create student accounts.';
    END IF;
  END IF;

  IF p_temporary_password IS NULL OR length(trim(p_temporary_password)) = 0 THEN
    v_password := 'PHY-' || upper(substr(md5(random()::text), 1, 5)) || '#' || floor(100 + random() * 899)::text;
  ELSE
    v_password := p_temporary_password;
  END IF;

  INSERT INTO public.profiles (
    role, full_name, login_id, email, phone, class_id, roll_number, password_hash, status, force_password_change, created_by
  ) VALUES (
    'student', trim(p_full_name), upper(trim(p_login_id)), p_email, p_phone, p_class_id, p_roll_number, v_password, 'active', true, v_caller
  ) RETURNING * INTO v_profile;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_profile.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.audit_logs (user_id, actor_label, action, resource, resource_id, meta)
  VALUES (v_caller, 'Administrator', 'student_created', 'profiles', v_profile.id::text, jsonb_build_object('login_id', v_profile.login_id));

  RETURN jsonb_build_object('success', true, 'student', row_to_json(v_profile), 'temporary_password', v_password);
END;
$$;

-- Function to safely authenticate a student via Login ID and password
CREATE OR REPLACE FUNCTION public.authenticate_student(p_login_id text, p_password text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE upper(trim(login_id)) = upper(trim(p_login_id));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid Student Login ID or password.');
  END IF;

  IF v_profile.status = 'disabled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Your account is disabled. Please contact your instructor.');
  END IF;

  IF v_profile.status = 'archived' THEN
    RETURN jsonb_build_object('success', false, 'error', 'This student account has been archived.');
  END IF;

  IF v_profile.password_hash IS NOT NULL AND v_profile.password_hash <> p_password THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid Student Login ID or password.');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'student', row_to_json(v_profile)
  );
END;
$$;

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcq_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Grant standard permissions to roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

GRANT EXECUTE ON FUNCTION public.authenticate_student TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_teacher_or_admin TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.make_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_teacher TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_student TO authenticated;

-- ----------------------------------------------------------------------------
-- STRICT PRIVACY POLICIES FOR PROFILES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- [A] SELECT Policy:
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated, anon
USING (
  public.is_admin((SELECT auth.uid()))
  OR (public.is_teacher_or_admin((SELECT auth.uid())) AND (role = 'student' OR id = (SELECT auth.uid())))
  OR (id = (SELECT auth.uid()))
  OR ((SELECT auth.role()) = 'anon')
);

-- [B] INSERT Policy: ONLY Admin & Super Admin can add teachers and students!
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  public.is_super_admin((SELECT auth.uid()))
  OR (
    public.is_admin((SELECT auth.uid()))
    AND role IN ('teacher', 'student')
  )
);

-- [C] UPDATE Policy:
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  public.is_super_admin((SELECT auth.uid()))
  OR (public.is_admin((SELECT auth.uid())) AND role IN ('teacher', 'student'))
  OR (id = (SELECT auth.uid()))
)
WITH CHECK (
  public.is_super_admin((SELECT auth.uid()))
  OR (public.is_admin((SELECT auth.uid())) AND role IN ('teacher', 'student'))
  OR (
    id = (SELECT auth.uid())
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
  )
);

-- [D] DELETE Policy:
CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE TO authenticated
USING (
  public.is_super_admin((SELECT auth.uid()))
  OR (public.is_admin((SELECT auth.uid())) AND role IN ('teacher', 'student'))
);

-- ----------------------------------------------------------------------------
-- POLICIES FOR USER_ROLES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
CREATE POLICY "user_roles_select_policy" ON public.user_roles
FOR SELECT TO authenticated, anon
USING (
  public.is_admin((SELECT auth.uid()))
  OR user_id = (SELECT auth.uid())
);

DROP POLICY IF EXISTS "user_roles_manage_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_policy" ON public.user_roles;
CREATE POLICY "user_roles_insert_policy" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (
  public.is_super_admin((SELECT auth.uid()))
  OR (public.is_admin((SELECT auth.uid())) AND role IN ('teacher', 'student'))
);

DROP POLICY IF EXISTS "user_roles_update_policy" ON public.user_roles;
CREATE POLICY "user_roles_update_policy" ON public.user_roles
FOR UPDATE TO authenticated
USING (
  public.is_super_admin((SELECT auth.uid()))
  OR (public.is_admin((SELECT auth.uid())) AND role IN ('teacher', 'student'))
)
WITH CHECK (
  public.is_super_admin((SELECT auth.uid()))
  OR (public.is_admin((SELECT auth.uid())) AND role IN ('teacher', 'student'))
);

DROP POLICY IF EXISTS "user_roles_delete_policy" ON public.user_roles;
CREATE POLICY "user_roles_delete_policy" ON public.user_roles
FOR DELETE TO authenticated
USING (
  public.is_super_admin((SELECT auth.uid()))
  OR (public.is_admin((SELECT auth.uid())) AND role IN ('teacher', 'student'))
);

-- Policies for Classes
DROP POLICY IF EXISTS "classes_policy" ON public.classes;
CREATE POLICY "classes_policy" ON public.classes FOR ALL USING (true);

-- Policies for Chapters
DROP POLICY IF EXISTS "chapters_policy" ON public.chapters;
CREATE POLICY "chapters_policy" ON public.chapters FOR ALL USING (true);

-- Policies for Topics
DROP POLICY IF EXISTS "topics_policy" ON public.topics;
CREATE POLICY "topics_policy" ON public.topics FOR ALL USING (true);

-- Policies for MCQs
DROP POLICY IF EXISTS "mcqs_policy" ON public.mcqs;
CREATE POLICY "mcqs_policy" ON public.mcqs FOR ALL USING (true);

-- Policies for MCQ Versions
DROP POLICY IF EXISTS "mcq_versions_policy" ON public.mcq_versions;
CREATE POLICY "mcq_versions_policy" ON public.mcq_versions FOR ALL USING (true);

-- Policies for Tests
DROP POLICY IF EXISTS "tests_policy" ON public.tests;
CREATE POLICY "tests_policy" ON public.tests FOR ALL USING (true);

-- Policies for Test Questions
DROP POLICY IF EXISTS "test_questions_policy" ON public.test_questions;
CREATE POLICY "test_questions_policy" ON public.test_questions FOR ALL USING (true);

-- Policies for Test Assignments
DROP POLICY IF EXISTS "test_assignments_policy" ON public.test_assignments;
CREATE POLICY "test_assignments_policy" ON public.test_assignments FOR ALL USING (true);

-- Policies for Attempts
DROP POLICY IF EXISTS "attempts_policy" ON public.attempts;
CREATE POLICY "attempts_policy" ON public.attempts FOR ALL USING (true);

-- Policies for Attempt Answers
DROP POLICY IF EXISTS "attempt_answers_policy" ON public.attempt_answers;
CREATE POLICY "attempt_answers_policy" ON public.attempt_answers FOR ALL USING (true);

-- Policies for Results
DROP POLICY IF EXISTS "results_policy" ON public.results;
CREATE POLICY "results_policy" ON public.results FOR ALL USING (true);

-- Policies for Audit Logs
DROP POLICY IF EXISTS "audit_logs_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_policy" ON public.audit_logs FOR ALL USING (true);

-- Policies for Login Attempts
DROP POLICY IF EXISTS "login_attempts_policy" ON public.login_attempts;
CREATE POLICY "login_attempts_policy" ON public.login_attempts FOR ALL USING (true);

-- ============================================================================
-- 8. INITIAL ADMIN/TEACHER ACCOUNT SEED (Optional initial bootstrap)
-- ============================================================================
-- 1. Initial Super Admin Profile
INSERT INTO public.profiles (
  id,
  role,
  full_name,
  login_id,
  email,
  status,
  force_password_change,
  password_hash
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'super_admin',
  'Super Administrator',
  'SUPERADMIN-01',
  'superadmin@physlab.local',
  'active',
  false,
  'SuperAdminPass123!'
) ON CONFLICT (login_id) DO UPDATE SET
  role = 'super_admin',
  status = 'active';

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Initial Teacher Profile
INSERT INTO public.profiles (
  id,
  role,
  full_name,
  login_id,
  email,
  status,
  force_password_change,
  password_hash
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'teacher',
  'Lead Physics Instructor',
  'TEACHER-01',
  'teacher@physlab.local',
  'active',
  false,
  'AdminPass123!'
) ON CONFLICT (login_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'teacher')
ON CONFLICT (user_id, role) DO NOTHING;

-- Schema setup completed successfully!
