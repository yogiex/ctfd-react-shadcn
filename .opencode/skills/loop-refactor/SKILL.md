---
name: loop-refactor
description: |
  6-phase migration protocol for CTFd refactoring (Jinja2 + Alpine.js + Vue 2 → React 18 + shadcn/ui).
  Orchestrates parallel subagents per phase: SCOUT → PLAN → BUILD → REVIEW → FIX → VERIFY.
  Each phase is automated via task() subagent spawning with structured handoffs.
---

# Loop Refactor — CTFd 6-Phase Migration Protocol

Core protocol for migrating one component at a time from the legacy Jinja2/Alpine/Vue
frontend to React 18 + shadcn/ui. Every component goes through exactly 6 phases.
**Backend Flask API never changes.**

## Flowchart

```
START → [SCOUT] → [PLAN] → [BUILD] → [REVIEW] → [FIX] → [VERIFY] → DONE
                              │          ▲         │
                              │          └─────────┘ (if Critical > 0)
                              └── parallel spawn (max 4)
```

## Phase A — SCOUT: Analisis Komponen Lama

**Tujuan:** Pahami template lama, API endpoints, dan semua states sebelum membuat React.

### Parallel Subagents (1-2 agents)

**Agent 1 — Template Analysis:**
```
task({
  subagent_type: "explore",
  prompt: "Read CTFd/themes/{theme}/templates/{page}.html.
          Identify:
          [1] All Jinja2 template variables passed from Flask
          [2] All forms and their fields (WTForms)
          [3] All UI elements (tables, cards, modals, buttons)
          [4] Permission checks ({% if authed %}, {% if admin %})
          [5] All states (loading, empty, error, rate-limited, frozen)
          Return as structured markdown."
})
```

**Agent 2 — JS/API Analysis:**
```
task({
  subagent_type: "explore",
  prompt: "Read CTFd/themes/{theme}/assets/js/{page}.js AND
          CTFd/api/v1/{resource}.py.
          Identify:
          [1] All fetch/API calls with endpoints
          [2] All Alpine.js/Vue component states and data bindings
          [3] Event handlers and their triggers (click, submit, etc.)
          [4] Error handling patterns (try/catch, .catch, error callbacks)
          [5] window.init fields used
          [6] Conditional rendering logic (x-if, x-show, v-if, v-show)
          Return as structured markdown."
})
```

**Output fase A:** `.opencode/plans/{component}-scout.md`

## Phase B — PLAN: Desain Komponen React

**Tujuan:** Tulis plan file berdasarkan hasil SCOUT.

### Steps

1. **Tentukan component tree:**
   - Page component → sub-components
   - Contoh: `ChallengeBoardPage` → `ChallengeCard`, `FlagSubmissionForm`, `HintReveal`, `ChallengeCategoryFilter`
   - Mapping dari template Jinja2 blocks ke React components

2. **Tentukan TypeScript types:**
   - Dari API response → type interfaces (response shape, nested objects)
   - Dari Alpine/Vue state → React state types (useState, useReducer types)
   - Query parameter types
   - Form input types

3. **Tentukan React Query hooks:**
   - `useQuery` untuk setiap GET endpoint
   - `useMutation` untuk setiap POST/PATCH/DELETE
   - Query key convention: `['resource', params]` e.g. `['challenges', {category, page}]`
   - Stale time, cache time, refetch configuration
   - Dependent queries (if data depends on user auth state)

4. **Tentukan routing:**
   - Path baru (React Router v6): `path`, `element`, `loader`
   - Guard: public / auth required / admin only
   - Nested routes jika ada sub-pages

5. **Tentukan states lengkap:**
   - **Data states:** `loading`, `error`, `empty`, `success`
   - **Permission variants:** `unauthed`, `authed`, `admin`
   - **CTF-specific:** `solved`, `unsolved`, `rate_limited`, `frozen`, `paused`
   - **Form states:** `idle`, `submitting`, `validation_error`, `submit_error`, `submit_success`

### Loaded Skills (if needed)

```
skill({name:"ctfd-frontend-design"})  → design tokens, component anatomy, dark mode
skill({name:"ctfd-shadcn"})           → which shadcn components to use, composition patterns
```

**Output:** `.opencode/plans/{component}-plan.md`

## Phase C — BUILD: Implementasi Paralel

**Tujuan:** Spawn max 4 parallel subagents untuk mengimplementasikan komponen.

### Parallel Subagents (max 4)

**Agent 1 — Types + Hooks:**
```
task({
  subagent_type: "general",
  prompt: "Berdasarkan plan di .opencode/plans/{component}-plan.md:
          [1] Buat TypeScript types di frontend/src/features/{feature}/types/
              - API response types, request types, component prop types
              - Export semua types dari index.ts barrel file
          [2] Buat React Query hooks di frontend/src/features/{feature}/hooks/
              - Satu file per hook: use{Resource}Query, use{Resource}Mutation
              - Query keys, error handling, optimistic updates jika perlu
          [3] Buat API client calls di frontend/src/features/{feature}/api/
              - Axios/fetch wrapper menggunakan base URL dari window.init
              - Error interceptor untuk 401 → redirect login
          Gunakan ctfd-shadcn skill untuk component reference.
          Ikuti CODEGUIDE.md conventions strictly.
          TypeScript strict mode — no `any` types."
})
```

**Agent 2 — Components:**
```
task({
  subagent_type: "general",
  prompt: "Berdasarkan plan di .opencode/plans/{component}-plan.md:
          [1] Buat page component di frontend/src/features/{feature}/pages/
              - Default export, named exports untuk sub-components
              - React.lazy compatible
          [2] Buat sub-components di frontend/src/features/{feature}/components/
              - Satu file per component
              - Atomic design: atoms → molecules → organisms
          [3] Gunakan shadcn/ui components dari ctfd-shadcn skill
              - Card, Button, Input, Select, Dialog, etc.
          [4] Handle ALL states:
              - loading → Skeleton/skeleton components
              - error → Alert + retry button
              - empty → EmptyState dengan action CTA
              - success → data render
          [5] Form handling dengan React Hook Form + Zod validation
          [6] Error boundaries untuk setiap page
          Ikuti CODEGUIDE.md + ctfd-frontend-design untuk styling."
})
```

**Agent 3 — Tests:**
```
task({
  subagent_type: "general",
  prompt: "Berdasarkan plan dan komponen di .opencode/plans/{component}-plan.md:
          [1] Component tests (React Testing Library):
              - Render setiap state: loading, error, empty, success
              - User interactions: click, type, submit
              - Mock React Query hooks
          [2] Hook tests (vitest):
              - Test query hooks with mocked API
              - Test mutation hooks (success + error paths)
          [3] Integration tests:
              - Form submission flow
              - Navigation between states
          Cover: loading, error, empty, success states.
          Minimal 80% line coverage untuk komponen ini.
          File naming: {component}.test.tsx, {hook}.test.ts"
})
```

**Agent 4 — Page Integration:**
```
task({
  subagent_type: "general",
  prompt: "Integrasi komponen ke aplikasi React:
          [1] Tambah route di frontend/src/router.tsx:
              - import React.lazy(() => import('./features/{feature}/pages/{Component}Page'));
              - <Route path="{path}" element={<Suspense><{Component}Page /></Suspense>} />
          [2] Tambah guard routes jika perlu:
              - AuthGuard: redirect ke /login jika unauthed
              - AdminGuard: redirect ke / jika bukan admin
          [3] Update Flask views.py untuk serve React (hanya jika page route baru):
              - Pastikan window.INITIAL_DATA dikirim sebagai JSON script tag
              - CSRF token, user info, config settings
          [4] Navbar/Sidebar links update jika ada navigasi baru
          Ikuti MIGRATION.md — jangan hapus template lama.
          React.lazy + Suspense untuk code splitting."
})
```

## File Handoff Pattern
Setelah BUILD, buat task brief + report files untuk handoff ke reviewer:
  - `.opencode/plans/{component}-brief.md`  → task brief untuk reviewer (include plan summary, file list, states coverage)
  - `.opencode/plans/{component}-report.md` → implementation report dari implementer (what was done, tricky parts, decisions)
  - `.opencode/plans/{component}-diff.patch` → `git diff` output untuk reviewer inspection

**Output fase C:**
- Types: `frontend/src/features/{feature}/types/{component}.ts`
- Hooks: `frontend/src/features/{feature}/hooks/use{Component}*.ts`
- API: `frontend/src/features/{feature}/api/{component}.ts`
- Pages: `frontend/src/features/{feature}/pages/{Component}Page.tsx`
- Components: `frontend/src/features/{feature}/components/{SubComponent}.tsx`
- Tests: `frontend/src/features/{feature}/**/*.test.ts{x,}`
- Routes: `frontend/src/router.tsx` (updated)
- Handoff: `.opencode/plans/{component}-brief.md`
- Handoff: `.opencode/plans/{component}-report.md`
- Handoff: `.opencode/plans/{component}-diff.patch`

## Phase D — REVIEW

**Tujuan:** Quality assurance — two-stage review (Superpowers pattern).

### Stage 1 — Spec Compliance Review

```
task({
  subagent_type: "general",
  prompt: "Review implementation terhadap plan requirements di .opencode/plans/{component}-plan.md.
          Apakah semua requirements dari plan terpenuhi?
          Apakah ada extra/unrequested features yang ditambahkan?
          Apakah ada requirements yang misunderstood?
          
          Identifikasi:
          - Missing requirements (dari plan tapi tidak diimplementasi)
          - Extra features (tidak di plan tapi ditambahkan)
          - Misunderstood requirements (implementasi tidak sesuai spec)
          
          Output:
          ✅ Spec compliant — semua requirements terpenuhi, tidak ada extra
          ❌ Issues found — detail missing/extra/misunderstood dengan file:line references"
})
```

### Stage 2 — Code Quality Review

```
skill({name:"ctfd-code-review"})

task({
  subagent_type: "general",
  prompt: "Review code quality untuk semua file baru (frontend/src/features/{feature}/):
          
          CRITICAL CHECKS:
          [1] API compatibility — NO backend changes whatsoever
          [2] UI parity — semua states dari template lama ada di React
          [3] No `any` types — strict TypeScript
          
          IMPORTANT CHECKS:
          [4] Clean separation of concerns? (component, hook, api, types terpisah)
          [5] Error handling — semua catch/try-catch handle error properly
          [6] DRY — tidak ada duplikasi kode yang signifikan
          [7] Edge cases handled — empty data, null values, unexpected input
          [8] Tests verify behavior, not mocks — test real interaction, not mock assertions
          
          MINOR CHECKS:
          [9] No unused imports or variables
          [10] Proper key props in lists
          [11] Accessibility attributes (aria-*, role)
          [12] Console.log / debug code removed
          
          Return:
          - Critical issues (blocking) — count + list with file:line
          - Important issues (should fix) — count + list with file:line
          - Minor issues (nice to have) — count + list with file:line
          - Pass/Fail verdict per check category"
})
```

## Phase E — FIX

**Tujuan:** Resolve semua issues dari REVIEW.

### Rules

| Priority | Action |
|----------|--------|
| **Critical > 0** | Fix SEMUA critical issues → ulang REVIEW (Phase D) |
| **Important > 0** | Fix semua important issues |
| **Minor > 0** | Catat di file notes, fix jika waktu memungkinkan |
| **No issues** | Lanjut ke VERIFY (Phase F) |

### If REVIEW Fails Twice

Jika 2 kali REVIEW gagal (masih ada critical setelah fix):
- Escalate ke human via `question()`
- Sertakan: component name, critical issues list, attempted fixes

### State Update

Setelah fix selesai:
- Update `docs/refactor/loop/STATE.md`:
  - Pindahkan component dari "In Progress" ke "Completed"
  - Update "Last run" timestamp
  - Catat issues fixed dan skipped

## Phase F — VERIFY

**Tujuan:** Final verification sebelum commit.

### Verify Steps

**1. TypeScript Check:**
```
bash("npx tsc --noEmit")
```
→ Wajib 0 errors. Jika ada, fix dulu.

**2. Tests:**
```
bash("npx vitest run --related frontend/src/features/{feature}/")
```
→ Semua test harus pass. Jika gagal, fix dulu.

**3. Lint:**
```
bash("npx eslint frontend/src/features/{feature}/ --max-warnings 0")
```
→ 0 errors, 0 warnings.

**4. Git Commit:**
```
bash("git add .opencode/plans/{component}-*.md frontend/src/features/{feature}/")
bash("git commit -m 'feat: {component} — migrasi dari Jinja2 ke React'")
```

**5. Update State Files:**
- `docs/refactor/loop/STATE.md`:
  - `component`: nama komponen
  - `status`: `completed`
  - `phases`: checklist semua fase
  - `last_run`: timestamp ISO
  - `issues_critical`: jumlah
  - `issues_important`: jumlah
  - `issues_minor`: jumlah

- `docs/refactor/loop/loop-run-log.md`:
  ```markdown
  ## {timestamp} — {component}
  - **Fase:** SCOUT → PLAN → BUILD → REVIEW → FIX → VERIFY
  - **Critical:** {n} → {n}
  - **Important:** {n} → {n}
  - **Minor:** {n} → {n}
  - **Files:** {file_count} files, {lines_added}+ / {lines_deleted}-
  ```

- `docs/refactor/ROADMAP.md`:
  - Centang (`.`) checkbox untuk task component

**6. Cleanup:**
Jika menggunakan git worktree:
```
bash("git worktree remove ../wt-{component}-{timestamp}")
```

## Rules (Wajib)

1. **Batch spawn di BUILD** — jangan spawn agents sequential. Kirim max 4 paralel.
2. **Jangan skip REVIEW phase** — FIX hanya berdasarkan REVIEW output.
3. **Jika 2× REVIEW gagal** → escalate ke human via `question()`.
4. **Backend API TIDAK boleh diubah** — zero backend changes.
5. **File lama JANGAN dihapus** sampai VERIFIED (lihat `MIGRATION.md`).
6. **STATE.md harus update** setiap kali fase berubah.
7. **Setiap subagent dapat konteks minimal** — hanya file yang relevan, bukan session history.
8. **File naming convention:**
   - Types: `PascalCase.types.ts`
   - Hooks: `usePascalCase.ts`
   - Pages: `PascalCasePage.tsx`
   - Components: `PascalCase.tsx`
   - Tests: `PascalCase.test.tsx` atau `usePascalCase.test.ts`
9. **State coverage minimum:** loading, error, empty, success.
10. **Spesifik ke CTFd** — jangan generic. `ChallengesPage`, bukan `DataTablePage`.
