# Implementation Plan - NasiTu Builder (Supabase Integrated)

NasiTu is a visual SaaS builder. Since the database is now connected, we will migrate from `localStorage` mock-persistence to a real Supabase backend. This plan covers the schema design, real authentication, and AI-powered generation hooks.

## Auth & RLS model
**Auth in scope:** yes
**Model:** supabase_auth
**RLS strategy:**
- `users`: Authenticated users can read/update their own profile.
- `organizations`: Users can access organizations they are members of.
- `projects`: Access restricted to organization members or project owners.
- `elements`: Cascading access from projects.
**Frontend implication:** Replace `useAuthStore` with `supabase.auth` listeners.

## Migration baseline
**Local migrations in project:** none
**User confirmed proceed on connected DB:** yes

## Scope Summary
- **Backend (Supabase):** Schema for Organizations, Projects, Canvas Elements, and Assets.
- **AI Integration:** Edge function skeleton for "Natural Language to App" logic.
- **Visual Builder:** Sync canvas state to Supabase in real-time.
- **Auth:** Full signup/login using Supabase Auth.

## Phases

### Phase 1: Database Schema & RLS
- Define tables: `profiles`, `organizations`, `memberships`, `projects`, `elements`.
- Enable RLS on all tables with specific policies for collaborative building.
- **Owner:** supabase_engineer

### Phase 2: Supabase Client & Auth Migration
- Install `@supabase/supabase-js`.
- Initialize `src/integrations/supabase/client.ts`.
- Update `useAuthStore` to wrap Supabase Auth.
- Create Login/Signup UI.
- **Owner:** frontend_engineer

### Phase 3: Project Persistence Logic
- Update `useProjectStore` and `useCanvasStore` to sync with Supabase tables instead of `localStorage`.
- Implement debounced "auto-save" for the builder canvas.
- **Owner:** frontend_engineer

### Phase 4: AI Builder Edge Function
- Create a Supabase Edge Function `generate-app` to handle OpenAI calls.
- Implement the "Natural Language" input in the Builder UI.
- **Owner:** supabase_engineer

### Phase 5: Multi-tenancy & Collaboration
- Implement Organization management (invite members, switch workspaces).
- Ensure RLS handles multi-user project access correctly.
- **Owner:** supabase_engineer

### Phase 6: Assets & File Management
- Set up Supabase Storage buckets for project thumbnails and user assets.
- Integrate file upload in the Builder sidebar.
- **Owner:** frontend_engineer

## Execution Handoff

**Plan status:** ready

**Dispatch order:**
1. supabase_engineer — Schema and RLS (Phase 1)
2. frontend_engineer — Auth migration and Supabase client setup (Phase 2)
3. supabase_engineer — Edge Functions (Phase 4, 5)
4. frontend_engineer — Persistence and Assets (Phase 3, 6)

**Per-agent instructions:**

### 1. supabase_engineer
- **Phases:** 1, 4, 5
- **Scope:** Create migrations for the SaaS multi-tenant schema. Set up RLS. Create Edge functions for AI generation.
- **Files:** `supabase/migrations/*.sql`, `supabase/functions/generate-app/index.ts`
- **Depends on:** none
- **Acceptance criteria:** Tables exist in Supabase; RLS prevents unauthorized data access; Edge function responds to test triggers.

### 2. frontend_engineer
- **Phases:** 2, 3, 6
- **Scope:** Auth UI, Supabase client integration, and builder state syncing.
- **Files:** `src/integrations/supabase/client.ts`, `src/store/*.ts`, `src/pages/Auth.tsx`
- **Depends on:** Phase 1
- **Acceptance criteria:** User can login via Supabase; Projects created in UI are saved to the database; Canvas elements persist across reloads.
