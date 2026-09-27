-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','teacher','student');
CREATE TYPE public.account_status AS ENUM ('active','disabled','archived');
CREATE TYPE public.difficulty_level AS ENUM ('easy','medium','hard');
CREATE TYPE public.content_status AS ENUM ('draft','active','archived');
CREATE TYPE public.test_status AS ENUM ('draft','scheduled','active','expired','archived');
CREATE TYPE public.attempt_status AS ENUM ('in_progress','submitted','expired');
CREATE TYPE public.assignment_status AS ENUM ('assigned','in_progress','completed','expired');

-- ============ UPDATED_AT HELPER ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ CLASSES ============
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  section text NOT NULL DEFAULT 'A',
  status public.account_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, section)
);
GRANT ALL ON public.classes TO service_role;
GRANT SELECT ON public.classes TO authenticated;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  role public.app_role NOT NULL DEFAULT 'student',
  full_name text NOT NULL,
  login_id text UNIQUE,
  email text,
  phone text,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  roll_number text,
  status public.account_status NOT NULL DEFAULT 'active',
  force_password_change boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_class ON public.profiles(class_id);
CREATE INDEX idx_profiles_login_id ON public.profiles(login_id);
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ============ CHAPTERS / TOPICS ============
CREATE TABLE public.chapters (
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
GRANT ALL ON public.chapters TO service_role;
GRANT SELECT ON public.chapters TO authenticated;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_chapters_updated BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  name text NOT NULL,
  status public.content_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chapter_id, name)
);
CREATE INDEX idx_topics_chapter ON public.topics(chapter_id);
GRANT ALL ON public.topics TO service_role;
GRANT SELECT ON public.topics TO authenticated;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- ============ MCQS ============
CREATE TABLE public.mcqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer char(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
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
CREATE INDEX idx_mcqs_chapter ON public.mcqs(chapter_id);
CREATE INDEX idx_mcqs_topic ON public.mcqs(topic_id);
CREATE INDEX idx_mcqs_status ON public.mcqs(status);
CREATE INDEX idx_mcqs_difficulty ON public.mcqs(difficulty);
GRANT ALL ON public.mcqs TO service_role;
ALTER TABLE public.mcqs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_mcqs_updated BEFORE UPDATE ON public.mcqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.mcq_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mcq_id uuid NOT NULL REFERENCES public.mcqs(id) ON DELETE CASCADE,
  version integer NOT NULL,
  snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mcq_id, version)
);
GRANT ALL ON public.mcq_versions TO service_role;
ALTER TABLE public.mcq_versions ENABLE ROW LEVEL SECURITY;

-- ============ TESTS ============
CREATE TABLE public.tests (
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
CREATE INDEX idx_tests_status ON public.tests(status);
CREATE INDEX idx_tests_chapter ON public.tests(chapter_id);
GRANT ALL ON public.tests TO service_role;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_tests_updated BEFORE UPDATE ON public.tests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  mcq_id uuid NOT NULL REFERENCES public.mcqs(id) ON DELETE RESTRICT,
  mcq_version integer NOT NULL DEFAULT 1,
  position integer NOT NULL DEFAULT 1,
  marks numeric(6,2) NOT NULL DEFAULT 1,
  negative_marks numeric(6,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (test_id, mcq_id)
);
CREATE INDEX idx_test_questions_test ON public.test_questions(test_id);
GRANT ALL ON public.test_questions TO service_role;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

-- ============ ASSIGNMENTS ============
CREATE TABLE public.test_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  available_from timestamptz,
  available_until timestamptz,
  max_attempts integer NOT NULL DEFAULT 1,
  status public.assignment_status NOT NULL DEFAULT 'assigned',
  UNIQUE (test_id, student_id)
);
CREATE INDEX idx_assignments_student ON public.test_assignments(student_id);
CREATE INDEX idx_assignments_test ON public.test_assignments(test_id);
GRANT ALL ON public.test_assignments TO service_role;
ALTER TABLE public.test_assignments ENABLE ROW LEVEL SECURITY;

-- ============ ATTEMPTS ============
CREATE TABLE public.attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  attempt_number integer NOT NULL DEFAULT 1,
  status public.attempt_status NOT NULL DEFAULT 'in_progress',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  submitted_at timestamptz,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (test_id, student_id, attempt_number)
);
CREATE INDEX idx_attempts_student ON public.attempts(student_id);
CREATE INDEX idx_attempts_test ON public.attempts(test_id);
GRANT ALL ON public.attempts TO service_role;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.attempt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  test_question_id uuid NOT NULL,
  selected_option char(1) CHECK (selected_option IN ('A','B','C','D')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, test_question_id)
);
CREATE INDEX idx_answers_attempt ON public.attempt_answers(attempt_id);
GRANT ALL ON public.attempt_answers TO service_role;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;

-- ============ RESULTS ============
CREATE TABLE public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL UNIQUE REFERENCES public.attempts(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
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
CREATE INDEX idx_results_student ON public.results(student_id);
CREATE INDEX idx_results_test ON public.results(test_id);
CREATE INDEX idx_results_submitted ON public.results(submitted_at DESC);
GRANT ALL ON public.results TO service_role;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- ============ AUDIT LOGS ============
CREATE TABLE public.audit_logs (
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
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============ LOGIN THROTTLE ============
CREATE TABLE public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_login_attempts_ident ON public.login_attempts(identifier, created_at DESC);
GRANT ALL ON public.login_attempts TO service_role;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
