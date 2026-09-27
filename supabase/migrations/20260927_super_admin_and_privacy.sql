-- ============================================================================
-- MIGRATION: SUPER ADMIN & RESTRICTED PRIVACY POLICIES (RLS)
-- ============================================================================
-- Description:
-- 1. Adds 'super_admin' to public.app_role enum.
-- 2. Sets up strict Row Level Security (RLS) so that ONLY Admins and Super Admins
--    can create teachers and students.
-- 3. Regular teachers and students are blocked from creating user accounts.
-- 4. Creates a default Super Admin account and provides helper function
--    `public.make_super_admin(p_identifier text)` to promote any user.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENUM UPDATE: Add 'super_admin' to public.app_role
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'super_admin'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'super_admin' BEFORE 'admin';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. PERFORMANCE INDEXES FOR RBAC & RLS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_roles_lookup ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, status);

-- ----------------------------------------------------------------------------
-- 3. RBAC HELPER FUNCTIONS (Optimized for RLS with search_path protection)
-- ----------------------------------------------------------------------------

-- Check if a specific user (or auth.uid()) is a Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'super_admin'
    UNION
    SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'super_admin'
  );
$$;

-- Check if a specific user (or auth.uid()) is an Admin or Super Admin
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role IN ('admin', 'super_admin')
    UNION
    SELECT 1 FROM public.profiles WHERE id = p_user_id AND role IN ('admin', 'super_admin')
  );
$$;

-- Check if a specific user is a Teacher, Admin, or Super Admin
CREATE OR REPLACE FUNCTION public.is_teacher_or_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role IN ('teacher', 'admin', 'super_admin')
    UNION
    SELECT 1 FROM public.profiles WHERE id = p_user_id AND role IN ('teacher', 'admin', 'super_admin')
  );
$$;

-- ----------------------------------------------------------------------------
-- 4. FUNCTION TO PROMOTE A USER TO SUPER ADMIN
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.make_super_admin(p_identifier text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
  v_found boolean := false;
BEGIN
  -- Search by UUID, email, or login_id
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE id::text = p_identifier
     OR lower(trim(email)) = lower(trim(p_identifier))
     OR upper(trim(login_id)) = upper(trim(p_identifier))
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('No user found matching identifier: %s', p_identifier)
    );
  END IF;

  -- Update profiles table
  UPDATE public.profiles
  SET role = 'super_admin', updated_at = now()
  WHERE id = v_user_id;

  -- Upsert into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Also log to audit_logs
  INSERT INTO public.audit_logs (action, resource, resource_id, meta)
  VALUES (
    'role_promoted_super_admin',
    'profiles',
    v_user_id::text,
    jsonb_build_object('identifier', p_identifier, 'promoted_at', now())
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'message', format('User %s successfully promoted to Super Admin.', p_identifier)
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. FUNCTION: ADMIN / SUPER ADMIN CREATE TEACHER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_create_teacher(
  p_full_name text,
  p_login_id text,
  p_email text,
  p_password text DEFAULT 'TeacherPass123!',
  p_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_new_id uuid;
  v_profile public.profiles%ROWTYPE;
BEGIN
  -- Security check: caller MUST be admin or super_admin (or service_role)
  IF current_user <> 'postgres' AND (SELECT auth.role()) <> 'service_role' THEN
    IF NOT public.is_admin(v_caller) THEN
      RAISE EXCEPTION 'Access Denied: Only administrators can create teacher accounts.';
    END IF;
  END IF;

  INSERT INTO public.profiles (
    role,
    full_name,
    login_id,
    email,
    phone,
    password_hash,
    status,
    force_password_change,
    created_by
  ) VALUES (
    'teacher',
    trim(p_full_name),
    upper(trim(p_login_id)),
    lower(trim(p_email)),
    p_phone,
    p_password,
    'active',
    true,
    v_caller
  ) RETURNING * INTO v_profile;

  -- Add to user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_profile.id, 'teacher')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Log action
  INSERT INTO public.audit_logs (user_id, actor_label, action, resource, resource_id, meta)
  VALUES (
    v_caller,
    'Administrator',
    'teacher_created',
    'profiles',
    v_profile.id::text,
    jsonb_build_object('login_id', v_profile.login_id, 'full_name', v_profile.full_name)
  );

  RETURN jsonb_build_object(
    'success', true,
    'teacher', row_to_json(v_profile)
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. FUNCTION: ADMIN / SUPER ADMIN CREATE STUDENT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_create_student(
  p_login_id text,
  p_full_name text,
  p_class_id uuid DEFAULT NULL,
  p_roll_number text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_temporary_password text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_password text;
  v_profile public.profiles%ROWTYPE;
BEGIN
  -- Security check: caller MUST be admin or super_admin (or service_role)
  IF current_user <> 'postgres' AND (SELECT auth.role()) <> 'service_role' THEN
    IF NOT public.is_admin(v_caller) THEN
      RAISE EXCEPTION 'Access Denied: Only administrators can create student accounts.';
    END IF;
  END IF;

  -- Generate temporary password if not provided
  IF p_temporary_password IS NULL OR length(trim(p_temporary_password)) = 0 THEN
    v_password := 'PHY-' || upper(substr(md5(random()::text), 1, 5)) || '#' || floor(100 + random() * 899)::text;
  ELSE
    v_password := p_temporary_password;
  END IF;

  INSERT INTO public.profiles (
    role,
    full_name,
    login_id,
    email,
    phone,
    class_id,
    roll_number,
    password_hash,
    status,
    force_password_change,
    created_by
  ) VALUES (
    'student',
    trim(p_full_name),
    upper(trim(p_login_id)),
    p_email,
    p_phone,
    p_class_id,
    p_roll_number,
    v_password,
    'active',
    true,
    v_caller
  ) RETURNING * INTO v_profile;

  -- Add to user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_profile.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Log action
  INSERT INTO public.audit_logs (user_id, actor_label, action, resource, resource_id, meta)
  VALUES (
    v_caller,
    'Administrator',
    'student_created',
    'profiles',
    v_profile.id::text,
    jsonb_build_object('login_id', v_profile.login_id, 'full_name', v_profile.full_name)
  );

  RETURN jsonb_build_object(
    'success', true,
    'student', row_to_json(v_profile),
    'temporary_password', v_password
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES ON PROFILES ("PRIVACY")
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clean up older unrestricted policies
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- [A] SELECT POLICY:
-- Super Admin / Admin: can see all profiles.
-- Teachers: can see student profiles and their own profile.
-- Students: can see only their own profile.
-- Anon: can read for initial authentication lookup.
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT
TO authenticated, anon
USING (
  -- Super Admin and Admin can see all users
  public.is_admin((SELECT auth.uid()))
  -- Teachers can see all students and their own profile
  OR (public.is_teacher_or_admin((SELECT auth.uid())) AND (role = 'student' OR id = (SELECT auth.uid())))
  -- Students can only see their own profile
  OR (id = (SELECT auth.uid()))
  -- Allow anon to lookup login credentials
  OR ((SELECT auth.role()) = 'anon')
);

-- [B] INSERT POLICY: ONLY ADMIN & SUPER ADMIN CAN ADD TEACHERS & STUDENTS!
-- Teachers cannot insert. Students cannot insert.
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Super admin can create any role
  public.is_super_admin((SELECT auth.uid()))
  OR (
    -- Admin can ONLY create teachers and students
    public.is_admin((SELECT auth.uid()))
    AND role IN ('teacher', 'student')
  )
);

-- [C] UPDATE POLICY:
-- Super admin can update any profile.
-- Admin can update teacher & student profiles.
-- Users can update their own profile (cannot alter role).
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE
TO authenticated
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

-- [D] DELETE POLICY:
-- Super Admin can delete any profile.
-- Admin can delete teacher and student profiles only.
CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE
TO authenticated
USING (
  public.is_super_admin((SELECT auth.uid()))
  OR (public.is_admin((SELECT auth.uid())) AND role IN ('teacher', 'student'))
);

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES ON USER_ROLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
CREATE POLICY "user_roles_select_policy" ON public.user_roles
FOR SELECT TO authenticated
USING (
  public.is_admin((SELECT auth.uid()))
  OR user_id = (SELECT auth.uid())
);

DROP POLICY IF EXISTS "user_roles_manage_policy" ON public.user_roles;
CREATE POLICY "user_roles_manage_policy" ON public.user_roles
FOR ALL TO authenticated
USING (
  public.is_super_admin((SELECT auth.uid()))
  OR (public.is_admin((SELECT auth.uid())) AND role IN ('teacher', 'student'))
)
WITH CHECK (
  public.is_super_admin((SELECT auth.uid()))
  OR (public.is_admin((SELECT auth.uid())) AND role IN ('teacher', 'student'))
);

-- ----------------------------------------------------------------------------
-- 9. INITIAL SUPER ADMIN ACCOUNT BOOTSTRAP
-- ----------------------------------------------------------------------------
-- Creates Super Admin account if not already present
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
)
ON CONFLICT (login_id) DO UPDATE SET
  role = 'super_admin',
  status = 'active';

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Grant execution rights on functions
GRANT EXECUTE ON FUNCTION public.is_super_admin TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_teacher_or_admin TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.make_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_teacher TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_student TO authenticated;
