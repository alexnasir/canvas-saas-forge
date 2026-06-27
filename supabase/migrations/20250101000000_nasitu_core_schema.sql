-- ============================================================
-- NasiTu Builder - Core Schema Migration
-- Multi-tenant SaaS Builder Platform
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES TABLE
-- Extends auth.users with application-specific user data
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('super_admin', 'admin', 'developer', 'member')),
  onboarded BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. ORGANIZATIONS TABLE
-- Multi-tenant workspace support
-- ============================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_plan ON public.organizations(plan);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 3. MEMBERSHIPS TABLE
-- Links users to organizations with roles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'developer', 'member', 'viewer')),
  invited_by UUID REFERENCES public.profiles(id),
  invited_email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_org ON public.memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON public.memberships(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_memberships_updated_at ON public.memberships;
CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 4. PROJECTS TABLE
-- SaaS builder projects
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'deployed')),
  template_id TEXT,
  domain TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  env_variables JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_org ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON public.projects(updated_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 5. ELEMENTS TABLE
-- Visual builder canvas elements (tree structure)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.elements(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'container', 'button', 'text', 'input', 'card', 'image', 
    'chart', 'navbar', 'footer', 'form', 'table', 'list',
    'tabs', 'accordion', 'carousel', 'modal', 'sidebar',
    'grid', 'flex', 'columns', 'heading', 'paragraph',
    'link', 'icon', 'divider', 'spacer', 'video', 'map',
    'calendar', 'rich_text', 'markdown'
  )),
  props JSONB NOT NULL DEFAULT '{}',
  styles JSONB NOT NULL DEFAULT '{}',
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_elements_project ON public.elements(project_id);
CREATE INDEX IF NOT EXISTS idx_elements_parent ON public.elements(parent_id);
CREATE INDEX IF NOT EXISTS idx_elements_order ON public.elements(project_id, parent_id, order_index);
CREATE INDEX IF NOT EXISTS idx_elements_type ON public.elements(type);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_elements_updated_at ON public.elements;
CREATE TRIGGER update_elements_updated_at
  BEFORE UPDATE ON public.elements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 6. PROJECT VERSIONS TABLE
-- Version history for undo/redo and snapshots
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  name TEXT,
  snapshot JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  is_autosave BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_versions_project ON public.project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_versions_created ON public.project_versions(created_at DESC);

-- ============================================================
-- 7. ACTIVITY LOG TABLE
-- Track user actions for audit trail
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_org ON public.activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_project ON public.activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_logs(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES RLS
-- Users can read all profiles (for collaboration), update only their own
-- ============================================================
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- ORGANIZATIONS RLS
-- Users can access organizations they are members of
-- ============================================================
CREATE POLICY organizations_select ON public.organizations
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM public.memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR owner_id = auth.uid()
  );

CREATE POLICY organizations_insert ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY organizations_update ON public.organizations
  FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM public.memberships 
      WHERE user_id = auth.uid() AND status = 'active' 
      AND role IN ('owner', 'admin')
    )
    OR owner_id = auth.uid()
  );

CREATE POLICY organizations_delete ON public.organizations
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ============================================================
-- MEMBERSHIPS RLS
-- Members can see their org's memberships; admins can manage
-- ============================================================
CREATE POLICY memberships_select ON public.memberships
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships m2
      WHERE m2.user_id = auth.uid() AND m2.status = 'active'
    )
  );

CREATE POLICY memberships_insert ON public.memberships
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.memberships m2
      WHERE m2.user_id = auth.uid() AND m2.status = 'active'
      AND m2.role IN ('owner', 'admin')
    )
    OR 
    -- Allow inserting yourself (auto-join via invite)
    (user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY memberships_update ON public.memberships
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships m2
      WHERE m2.user_id = auth.uid() AND m2.status = 'active'
      AND m2.role IN ('owner', 'admin')
    )
  );

CREATE POLICY memberships_delete ON public.memberships
  FOR DELETE TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships m2
      WHERE m2.user_id = auth.uid() AND m2.status = 'active'
      AND m2.role IN ('owner', 'admin')
    )
    OR user_id = auth.uid()  -- Can remove yourself
  );

-- ============================================================
-- PROJECTS RLS
-- Accessible by organization members
-- ============================================================
CREATE POLICY projects_select ON public.projects
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR owner_id = auth.uid()
  );

CREATE POLICY projects_insert ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.memberships
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'admin', 'developer')
    )
  );

CREATE POLICY projects_update ON public.projects
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'admin', 'developer')
    )
  );

CREATE POLICY projects_delete ON public.projects
  FOR DELETE TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'admin')
    )
    OR owner_id = auth.uid()
  );

-- ============================================================
-- ELEMENTS RLS
-- Cascading access from projects
-- ============================================================
CREATE POLICY elements_select ON public.elements
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.memberships
        WHERE user_id = auth.uid() AND status = 'active'
      )
      OR owner_id = auth.uid()
    )
  );

CREATE POLICY elements_insert ON public.elements
  FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.memberships
        WHERE user_id = auth.uid() AND status = 'active'
        AND role IN ('owner', 'admin', 'developer')
      )
    )
  );

CREATE POLICY elements_update ON public.elements
  FOR UPDATE TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.memberships
        WHERE user_id = auth.uid() AND status = 'active'
        AND role IN ('owner', 'admin', 'developer')
      )
    )
  );

CREATE POLICY elements_delete ON public.elements
  FOR DELETE TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.memberships
        WHERE user_id = auth.uid() AND status = 'active'
        AND role IN ('owner', 'admin', 'developer')
      )
    )
  );

-- ============================================================
-- PROJECT VERSIONS RLS
-- Same access as projects
-- ============================================================
CREATE POLICY versions_select ON public.project_versions
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.memberships
        WHERE user_id = auth.uid() AND status = 'active'
      )
      OR owner_id = auth.uid()
    )
  );

CREATE POLICY versions_insert ON public.project_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.memberships
        WHERE user_id = auth.uid() AND status = 'active'
        AND role IN ('owner', 'admin', 'developer')
      )
    )
  );

CREATE POLICY versions_delete ON public.project_versions
  FOR DELETE TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.memberships
        WHERE user_id = auth.uid() AND status = 'active'
        AND role IN ('owner', 'admin')
      )
    )
  );

-- ============================================================
-- ACTIVITY LOGS RLS
-- Readable by org members, insertable by authenticated users
-- ============================================================
CREATE POLICY activity_select ON public.activity_logs
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY activity_insert ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to check if user is org member with specific role
CREATE OR REPLACE FUNCTION public.is_org_member(
  p_org_id UUID,
  p_user_id UUID,
  p_roles TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships
    WHERE organization_id = p_org_id
    AND user_id = p_user_id
    AND status = 'active'
    AND (p_roles IS NULL OR role = ANY(p_roles))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get user's organizations
CREATE OR REPLACE FUNCTION public.get_user_organizations(p_user_id UUID)
RETURNS TABLE (
  organization_id UUID,
  org_name TEXT,
  org_slug TEXT,
  membership_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.organization_id,
    o.name AS org_name,
    o.slug AS org_slug,
    m.role AS membership_role
  FROM public.memberships m
  JOIN public.organizations o ON o.id = m.organization_id
  WHERE m.user_id = p_user_id AND m.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- SEED: Create a default organization for new users
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_default_organization()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Create default organization
  INSERT INTO public.organizations (name, slug, owner_id, description)
  VALUES (
    COALESCE(NEW.full_name || '''s Workspace', 'My Workspace'),
    'default-' || NEW.id::text,
    NEW.id,
    'Your default workspace'
  )
  RETURNING id INTO org_id;
  
  -- Add user as owner
  INSERT INTO public.memberships (organization_id, user_id, role, status)
  VALUES (org_id, NEW.id, 'owner', 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_organization();
