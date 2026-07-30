# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Centro" — a Spanish-language personal organization PWA (Today view, Calendar,
Tasks, Goals, Habits, Notes, Reminders, Routines, Focus/Pomodoro mode, and a
rule-based Spanish-language assistant). All UI text and in-app copy is in
Spanish; keep new UI strings in Spanish to match.

The actual app lives in `app/` — always `cd app` before running any command.

## Commands

Run from `app/`:

```bash
npm install
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # tsc -b (typecheck) && vite build -> dist/
npm run lint      # oxlint
npm run preview   # preview the production build
```

There is no test suite configured in this repo. Typecheck via `npm run build`
(it runs `tsc -b` first and will fail the build on type errors) and lint via
`npm run lint`. There is no separate `typecheck` script.

## Architecture

**Stack**: React 19 + TypeScript + Vite, Tailwind CSS v4, Zustand, react-router-dom,
@dnd-kit (drag-and-drop), recharts (stats), vite-plugin-pwa.

**Local-first with one optional backend.** All personal data (tasks, events,
habits, goals, notes, reminders, routines) lives in a single Zustand store
persisted to `localStorage` (`src/store/store.ts`, key `centro-organizacion-store-v1`).
The app must work fully offline with zero backend configuration. The *only*
feature that talks to a network backend is the shared couple calendar
("Pareja" section), backed by Supabase (Postgres + Auth + Realtime):

- `src/lib/supabaseClient.ts` creates the client only if `VITE_SUPABASE_URL`
  and `VITE_SUPABASE_ANON_KEY` are set; otherwise `supabase` is `null` and
  `isSupabaseConfigured` is `false`. Every Supabase-touching call site must
  check this and degrade gracefully (the Pareja page just shows a "not
  enabled" notice) — never assume `supabase` is non-null.
- `src/store/authStore.ts` — Supabase auth (sign up/in/out), couple space
  creation/joining via invite code, partner profile lookup.
- `src/store/sharedEventsStore.ts` — CRUD + a Realtime `postgres_changes`
  subscription for `shared_events`, scoped to the current couple.
- `src/components/SharedDataSync.tsx` — mounted once in `AppShell`; just an
  effect that (un)subscribes the shared-events channel when the couple id
  changes.
- `app/supabase/schema.sql` is the source of truth for the Supabase schema
  (tables, RLS policies, realtime setup) — apply it manually via the Supabase
  SQL editor; there's no migration tooling. Update this file whenever the
  shared-calendar schema changes.

Everything else (tasks, events, habits, goals, notes, reminders, routines,
categories, profile/settings) is local-only and must never depend on
Supabase being configured.

**Store shape** (`src/store/store.ts`): one flat Zustand store with
per-domain slices (tasks, events, habits, habitLogs, goals, reminders, notes,
routines, categories, inboxItem, dailyOrder, profile). Mutators follow a
consistent `add*` (returns new id) / `update*` (patch) / `delete*` pattern.
Recurring items (`recurrence.freq !== 'none'`) don't use `status` directly —
per-date completion/skip state is tracked via `completedDates`/`skippedDates`
arrays and read through the `taskStatusOnDate`/`eventStatusOnDate` helpers
exported alongside the store. Use `tasksOnDate`/`eventsOnDate` (also exported
from `store.ts`) rather than filtering `date ===` directly, since recurring
items need `occursOnDate` (in `src/lib/date.ts`) to resolve whether they land
on a given day.

**`src/lib/` is pure logic, decoupled from React/UI:**
- `date.ts` — date/time formatting helpers and the recurrence-expansion
  logic (`occursOnDate`) that both the store selectors and the calendar
  views depend on.
- `nlp.ts` — `parseQuickAdd`: a rule-based (not ML) Spanish parser that pulls
  date/time/duration/priority out of free-text like "Estudiar electricidad
  mañana de 10 a 12". Used by quick-add and by the assistant's free-form
  task creation.
- `assistant.ts` — `interpretCommand`: rule-based intent matching for the
  assistant command bar (fixed Spanish intents: "¿qué tengo que hacer hoy?",
  "organízame el día", "muéveme X al jueves", "quiero ..."). Any intent that
  mutates data must return an `AssistantAction` the user explicitly confirms
  by pressing a button — the assistant must never silently mutate state.
- `scheduler.ts` — `buildDayPlan`: a greedy heuristic that fills gaps between
  fixed events/routines with pending tasks (sorted by priority) plus meal
  windows and breaks after long work streaks. Intentionally simple, not a
  general-purpose solver — keep changes here easy to reason about.
- `goals.ts`, `habitStats.ts`, `stats.ts`, `taskGroups.ts`, `today.ts` —
  derived-data helpers for their respective pages (progress %, streaks,
  grouping).
- `inviteCode.ts` — generates the couple invite code used by `authStore`.

**Routing** (`src/App.tsx`): all routes are nested under a single
`AppShell` layout route. Top-level pages: `/` (Today), `/calendario`,
`/tareas`, `/objetivos`, `/mas` (More, with sub-routes for habits, notes,
inbox, reminders, routines, stats, settings, couple), and `/foco[/:taskId]`
(Focus/Pomodoro).

**Editors as sheets**: entities are created/edited via bottom-sheet-style
modal components in `src/components/editors/` (`TaskEditorSheet`,
`EventEditorSheet`, `GoalEditorSheet`, `HabitEditorSheet`, `NoteEditorSheet`),
opened by setting the corresponding `editing*Id` in `src/store/uiStore.ts`
(a separate Zustand store for transient UI state — panel/modal open state,
not persisted). `QuickAddSheet` and `GlobalSearch` (Cmd/Ctrl+K) follow the
same pattern.

**Data model** (`src/types.ts`): single source of truth for all domain
types (`Task`, `CalendarEvent`, `Habit`, `Goal`, `Reminder`, `Note`,
`Routine`, `Category`, plus the Supabase-backed `Profile`/`Couple`/
`SharedEvent`). Note the naming split: local types are camelCase field names
matching the TS convention directly; Supabase-backed types (`SharedEvent`)
are mapped from snake_case DB rows to camelCase in the store layer (see
`mapRow`/`mapProfile` in `sharedEventsStore.ts`/`authStore.ts`) — never leak
snake_case row shapes past that boundary.

## Conventions

- Lint rules are minimal (`.oxlintrc.json`): `react/rules-of-hooks` as an
  error is the main one enforced beyond defaults.
- TypeScript is strict-ish: `noUnusedLocals`, `noUnusedParameters`,
  `noFallthroughCasesInSwitch`, `verbatimModuleSyntax` are all on — unused
  vars/params and non-type-only imports of types will fail the build.
- Deploys are static (Vercel/Netlify-style SPA rewrite in `vercel.json`) —
  no server-side code in this repo.
