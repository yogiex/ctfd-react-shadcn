---
name: writing-plans
description: |
  Implementation plan generation for CTFd component migration. Takes a design document
  from brainstorming and produces executable plans with bite-sized 2-5 minute tasks.
  Each task specifies exact file paths, complete code blocks, and verification steps.
  No placeholders. Output: plan file at .opencode/plans/ + execution approach.
---

# CTFd Writing Plans — Implementation Plan Generator

Mengubah design document menjadi implementation plan dengan task-task kecil (2-5 menit per task) yang bisa dieksekusi oleh subagent atau inline. Tidak ada placeholder, tidak ada "TBD", tidak ada "fill in later".

## Input

Design document di `.opencode/designs/{component}.design.md` (dari brainstorming skill).

```
skill({name:"brainstorming"})
```

## Flow

### Step 1: Load Design Document

Baca file design:
```
task({
  subagent_type: "explore",
  prompt: "Read .opencode/designs/{component}.design.md.
          Ekstrak:
          - Component tree
          - TypeScript types
          - API endpoints
          - States
          - Permission gates
          Return structured summary."
})
```

### Step 2: Decompose into Bite-Sized Tasks

Setiap task harus memenuhi kriteria:
- **Duration:** 2-5 menit (bukan 30 menit)
- **Atomic:** melakukan SATU hal
- **Verifiable:** punya cara untuk verify
- **Exact paths:** path file LENGKAP, bukan "create a file"
- **Complete code:** code blocks LENGKAP, bukan pseudocode

Format setiap task:

```
## Task N: {verb} {object}

### Files
- **CREATE** `frontend/src/features/{feature}/types/{component}.types.ts`
- **EDIT** `frontend/src/features/{feature}/index.ts`

### Implementation
\`\`\`typescript
// COMPLETE code — tidak ada placeholder
export interface ChallengeResponse {
  id: number;
  name: string;
  category: string;
  value: number;
  solves: number;
  solved_by_me: boolean;
}
\`\`\`

### Verification
1. `npx tsc --noEmit` — 0 errors
2. File exports the interface
3. Barrel file re-exports it
```

### Step 3: Order Tasks

Urutkan berdasarkan dependency (test dulu baru implementasi):

```
## Task Order (Wajib)

### Layer 1: Foundation
1. Types (interfaces, enums, response shapes)
2. API client functions
3. React Query hooks

### Layer 2: Components
4. Sub-components (atomik, reusable)
5. Page component (menggabungkan sub-components)
6. Route integration

### Layer 3: Quality
7. Tests (component, hook, integration)
8. Error boundaries
9. Loading/empty states

### Layer 4: Polish
10. Dark mode verification
11. Mobile responsive
12. Accessibility audit
```

### Step 4: Write Plan File

Tulis plan ke `.opencode/plans/{component}.plan.md`:

```
# {Component} — Implementation Plan

## Prerequisites
- [ ] Brainstorming completed: design doc at .opencode/designs/{component}.design.md
- [ ] Git worktree active: `git worktree list`
- [ ] Dependencies installed: `npm install` in worktree

## Task 1: Create TypeScript Types
...
## Task 2: Create API Client
...
## Task N: ...
```

### Step 5: Choose Execution Method

Tulis di akhir plan file:

```
## Execution

### Option A: Subagent-Driven (Recommended for complex components)
\`\`\`
skill({name:"loop-refactor"})
\`\`\`
Phases SCOUT → PLAN → BUILD → REVIEW → FIX → VERIFY.
Spawn max 4 parallel subagents di BUILD phase.

### Option B: Inline Execution (Simple components, <50 lines)
Execute tasks 1-{N} sequentially.
Each task: implement → verify → proceed.
No subagent spawning needed.
```

## Task Categories

### Types Tasks
```
CREATE frontend/src/features/{feature}/types/{Component}.types.ts
- API response interface (dari Flask API response shape)
- Request interface (untuk mutations)
- Component props interface
- Enum untuk states (loading, error, empty, success)
```

### API Client Tasks
```
CREATE frontend/src/features/{feature}/api/{component}.ts
- GET function: api.get('/api/v1/{resource}')
- POST function: api.post('/api/v1/{resource}', data)
- Error handling dengan csrf-token header
```

### Hook Tasks
```
CREATE frontend/src/features/{feature}/hooks/use{Component}.ts
- useQuery: data fetching dengan query keys
- useMutation: create/update/delete dengan optimistic updates
- Error handling, retry logic
```

### Component Tasks
```
CREATE frontend/src/features/{feature}/components/{SubComponent}.tsx
- All states: loading → Skeleton, error → Alert, empty → EmptyState, success → data
- shadcn/ui components: Button, Card, Dialog, etc.
- TypeScript props, cn() utility for classes
```

### Test Tasks
```
CREATE frontend/src/features/{feature}/__tests__/{Component}.test.tsx
- Render every state (loading, error, empty, success)
- User interactions (click, type, submit)
- Mock React Query hooks
```

## CTFd-Specific Plan Rules

1. **No placeholder code** — setiap code block harus lengkap, compilable, dan runnable
2. **Verification steps wajib** — setiap task punya cara untuk verify
3. **No backend changes** — semua API call harus menggunakan existing Flask API
4. **State coverage** — loading, error, empty, success minimal; ratelimited/frozen jika relevan
5. **Permission coverage** — unauthed, authed, admin jika relevan
6. **File path HARUS exact** — bukan `frontend/src/features/*/types/*.ts`
7. **Setiap task 2-5 menit** — jika lebih dari 5 menit, pecah jadi task yang lebih kecil
8. **Dark mode** — semua komponen harus menggunakan CSS variables, bukan hardcoded colors
9. **CSRF-Token** — semua non-GET request wajib mengirim CSRF-Token header
10. **lucide-react** — semua ikon dari lucide-react, bukan Font Awesome atau SVG inline

## Plan File Format

```
# {Component} — Implementation Plan

## Prerequisites
{checklist}

## Tasks

### Task 1: ...
{Files, Implementation, Verification}

### Task 2: ...
{Files, Implementation, Verification}

...

## Execution
{Option A atau B}
```
