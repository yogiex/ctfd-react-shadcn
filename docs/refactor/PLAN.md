# CTFd Frontend Refactoring — Master Plan

## Project Overview

**Goal**: Replace three legacy frontend themes (Alpine.js+Bootstrap, Vue 2+Bootstrap, telkom-university) with a single React 18 + TypeScript + shadcn/ui + Tailwind CSS SPA at `CTFd/frontend/`.

**Backend API**: Flask 2.1 at `CTFd/api/v1/` (22 flask-restx namespaces). The new SPA consumes these APIs via `@ctfdio/ctfd-js`. Old themes remain in-tree until Phase 5 removal.

**Scope**: ~18 core templates + ~68 admin templates + plugin system → ~86 total pages/components to migrate.

**Target stack**:
- React 18, TypeScript 5, Vite 6
- React Router v7 (file-based or config-based)
- shadcn/ui (Radix primitives + Tailwind CSS v4)
- lucide-react icons
- TanStack Query for server state
- Zustand for client state (theme, sidebar, auth)
- React Hook Form + Zod for validation
- Vitest + React Testing Library + Playwright

---

## Phase 0: Foundation (Minggu 1–2) — P1

### 0.1 Scaffold & Tooling (Minggu 1)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 0.1.1 | Create `CTFd/frontend/` with Vite + React 18 + TS template | P1 | — | 0.5 |
| 0.1.2 | Configure Tailwind CSS v4, PostCSS, autoprefixer | P1 | 0.1.1 | 0.5 |
| 0.1.3 | Add shadcn/ui via CLI; init `components.json` pointing to `@/components/ui` | P1 | 0.1.2 | 0.5 |
| 0.1.4 | Install Radix deps + lucide-react + class-variance-authority + tailwind-merge + clsx | P1 | 0.1.3 | 0.5 |
| 0.1.5 | Set up TypeScript strict mode, path aliases (`@/` → `src/`) | P1 | 0.1.1 | 0.5 |
| 0.1.6 | Configure ESLint flat config + Prettier for `frontend/` | P2 | 0.1.1 | 0.5 |
| 0.1.7 | Add Vitest + @testing-library/react + jsdom config | P1 | 0.1.1 | 0.5 |
| 0.1.8 | Add Playwright config + CI smoke test | P2 | 0.1.1 | 1 |
| 0.1.9 | Set up Sentry/Rollbar for frontend error tracking | P3 | 0.1.1 | 0.5 |
| 0.1.10 | Configure MSW (Mock Service Worker) for API mocking in tests | P2 | 0.1.7 | 1 |

### 0.2 Build & CI Integration (Minggu 1–2)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 0.2.1 | Add `Makefile` targets: `make frontend-dev`, `make frontend-build`, `make frontend-test`, `make frontend-lint` | P1 | 0.1.1 | 0.5 |
| 0.2.2 | Configure Flask to serve SPA build from `CTFd/frontend/dist/` in dev & production (or proxy to Vite dev server) | P1 | 0.1.1 | 1 |
| 0.2.3 | Add CI workflow step: build frontend, lint, typecheck, test | P1 | 0.2.1 | 1 |
| 0.2.4 | Add `yarn verify` script that builds + `git diff --exit-code` to enforce committed build | P1 | 0.2.1 | 0.5 |
| 0.2.5 | Set up env vars: `VITE_API_URL`, `VITE_CSRF_ENABLED`, `VITE_SSE_ENABLED` via `.env` files | P1 | 0.1.1 | 0.5 |
| 0.2.6 | Configure bundle analysis tool (`vite-plugin-visualizer`) | P2 | 0.1.1 | 0.5 |

### 0.3 Routing & Shell (Minggu 2)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 0.3.1 | Install React Router v7; create `src/router.tsx` with route definitions | P1 | 0.1.1 | 0.5 |
| 0.3.2 | Define route tree: `/login`, `/register`, `/reset`, `/confirm`, `/setup`, `/challenges`, `/scoreboard`, `/users/:id`, `/teams/:id`, `/settings`, `/admin/*` | P1 | 0.3.1 | 0.5 |
| 0.3.3 | Create `App.tsx` root with `<RouterProvider>` + `QueryClientProvider` + `ThemeProvider` | P1 | 0.3.1 | 0.5 |
| 0.3.4 | Build `src/layouts/` — `PublicLayout`, `AuthLayout`, `ParticipantLayout`, `AdminLayout` | P1 | 0.3.3 | 1 |
| 0.3.5 | Create `src/providers/` — `ThemeProvider` (dark mode), `AuthProvider`, `SSEProvider` | P1 | 0.3.3 | 1 |
| 0.3.6 | Set up CSRF token injection: read from `<meta>` tag or `window.init.csrfNonce`, attach to all fetch/XHR | P1 | 0.1.1 | 0.5 |
| 0.3.7 | Implement route guards (`ProtectedRoute`, `AdminRoute`, `GuestRoute`) based on `window.init` | P1 | 0.3.1 | 0.5 |
| 0.3.8 | Build error boundary + 404 catch-all page | P1 | 0.3.1 | 0.5 |

### 0.4 Shared Components (Minggu 2)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 0.4.1 | Add shadcn/ui base components: Button, Card, Input, Label, Badge, Separator, Avatar, Tooltip | P1 | 0.1.3 | 0.5 |
| 0.4.2 | Add shadcn/ui navigation components: Sheet, DropdownMenu, Tabs, Accordion, Breadcrumb | P1 | 0.1.3 | 0.5 |
| 0.4.3 | Add shadcn/ui data components: Table, Dialog, Alert, Toast, Sonner (toaster) | P1 | 0.1.3 | 0.5 |
| 0.4.4 | Add shadcn/ui form components: Select, Checkbox, RadioGroup, Switch, Textarea | P2 | 0.1.3 | 0.5 |
| 0.4.5 | Build `src/components/ui/` custom wrappers: `Countdown`, `Markdown`, `SyntaxHighlighter`, `FlagInput`, `SolveIcon` | P1 | 0.4.1 | 1 |
| 0.4.6 | Build `ThemeSwitcher` component (light/dark/system) with persist to localStorage | P2 | 0.4.1 | 0.5 |
| 0.4.7 | Build `Navbar` (shared top bar with user menu, theme toggle) | P1 | 0.4.1, 0.4.2 | 1 |
| 0.4.8 | Build `Sidebar` (admin navigation) | P1 | 0.4.2 | 1 |
| 0.4.9 | Build `CommandPalette` (⌘K quick search for challenges/pages) | P3 | 0.4.1 | 1 |
| 0.4.10 | Build `SSEToast` component for real-time notifications | P2 | 0.4.3 | 1 |

### 0.5 Data Layer (Minggu 2)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 0.5.1 | Generate TypeScript types from OpenAPI/Swagger spec or manually for all 22 API endpoints | P1 | — | 2 |
| 0.5.2 | Create `src/lib/api-client.ts` — Axios instance with CSRF, base URL, interceptors for 401 → redirect login | P1 | 0.3.6 | 0.5 |
| 0.5.3 | Create `src/hooks/` — `useAuth`, `useChallenges`, `useScoreboard`, `useUsers`, `useTeams`, `useConfig`, `useNotifications` via TanStack Query | P1 | 0.5.1, 0.5.2 | 2 |
| 0.5.4 | Create `src/stores/` — Zustand stores: `useThemeStore`, `useSidebarStore`, `useAuthStore` | P1 | 0.3.5 | 0.5 |
| 0.5.5 | Create `src/lib/utils.ts` — `cn()` helper, date formatting, flag parsing, scoring helpers | P1 | — | 0.5 |

---

## Phase 1: Auth & Public Pages (Minggu 3–5) — P1

### 1.1 Authentication Pages (Minggu 3)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 1.1.1 | **Login** — `/login`: form with username/email + password, validation, error states, redirect to `/challenges` on success | P1 | 0.3.7, 0.4.4 | 1 |
| 1.1.2 | **Register** — `/register`: form with username, email, password, confirm password, optional team invite code; validation | P1 | 0.3.7, 0.4.4 | 1 |
| 1.1.3 | **Reset Password** — `/reset`: email form → token entry → new password form; multi-step | P1 | 0.3.7, 0.4.4 | 1 |
| 1.1.4 | **Confirm** — `/confirm`: email confirmation page with resend button | P1 | 0.3.7 | 0.5 |
| 1.1.5 | **OAuth2 integration** — social login buttons (Google, GitHub, etc.) via existing `/sso/*` routes | P2 | 1.1.1 | 1 |

### 1.2 Static Pages (Minggu 4)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 1.2.1 | **Page renderer** — `/page/:id` dynamic page component that fetches page content via `/api/v1/pages` and renders Markdown/HTML | P1 | 0.5.3 | 1 |
| 1.2.2 | **Landing/Home page** — `/` redirect or render configured landing page | P1 | 1.2.1 | 0.5 |
| 1.2.3 | **Notifications** — `/notifications` list page + real-time SSE updates | P2 | 0.5.3, 0.4.10 | 1 |
| 1.2.4 | **Error pages** — styled 401, 403, 404, 500, 502 pages | P1 | 0.3.8 | 0.5 |

### 1.3 Setup Wizard (Minggu 4–5)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 1.3.1 | **Setup detection** — redirect to `/setup` if no admin user exists (check `/api/v1/config` or dedicated endpoint) | P1 | 0.3.7, 0.5.2 | 0.5 |
| 1.3.2 | **Step 1: Admin user creation** — form for username, email, password | P1 | 1.3.1, 0.4.4 | 0.5 |
| 1.3.3 | **Step 2: CTF configuration** — event name, description, logo, user mode (teams/individuals) | P1 | 1.3.2, 0.4.4 | 0.5 |
| 1.3.4 | **Step 3: Theme selection** — theme picker from available themes (later, default to new React theme) | P2 | 1.3.3 | 0.5 |
| 1.3.5 | **Step 4: Confirmation + redirect** — summary page then redirect to admin dashboard | P1 | 1.3.4 | 0.5 |
| 1.3.6 | Multi-step wizard UI with progress bar, back/next navigation, validation per step | P1 | 1.3.1–5 | 1 |

---

## Phase 2: Participant Features (Minggu 6–9) — P1

### 2.1 Challenge Board (Minggu 6–7)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 2.1.1 | **Category grid** — fetch `/api/v1/challenges`, group by category, render expandable columns/cards | P1 | 0.5.3, 0.4.1 | 2 |
| 2.1.2 | **Challenge card** — title, category badge, point value, solve count, solved indicator (green/red), lock icon if hidden | P1 | 2.1.1 | 1 |
| 2.1.3 | **Search/filter** — search by name, filter by category, sort by value/solves/name | P1 | 2.1.1 | 1 |
| 2.1.4 | **Challenge detail modal** — `/challenges/:id`: full description (Markdown rendered), file attachments, hints (with cost), solve button, flag input, comments | P1 | 2.1.1, 0.4.5 | 2 |
| 2.1.5 | **Flag submission** — text input + submit; show correct/incorrect feedback with debounce/cooldown; respect ratelimit headers | P1 | 2.1.4 | 1 |
| 2.1.6 | **Hints** — reveal with point cost; UI for "buying" hint (deducts points); show hint text after purchase | P1 | 2.1.4 | 0.5 |
| 2.1.7 | **File attachments** — download links for challenge files | P1 | 2.1.4 | 0.5 |
| 2.1.8 | **Solves list** — list of users/teams who solved within the challenge detail modal | P2 | 2.1.4 | 0.5 |
| 2.1.9 | **Comments** — threaded or flat comment section on challenge (if config enabled) | P2 | 2.1.4 | 1 |
| 2.1.10 | **Responsive challenge board** — mobile-friendly card layout that works on phones | P2 | 2.1.1 | 0.5 |

### 2.2 Scoreboard (Minggu 7–8)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 2.2.1 | **Scoreboard table** — `/scoreboard`: fetch `/api/v1/scoreboard`, render ranked table with position, name, score, solve count, last solve time | P1 | 0.5.3, 0.4.3 | 1 |
| 2.2.2 | **Top 3 podium** — visual highlight for 1st/2nd/3rd place with gold/silver/bronze styling | P1 | 2.2.1 | 1 |
| 2.2.3 | **Solve graph** — click a user/team to expand solve breakdown (which challenges, when, point values) | P1 | 2.2.1 | 1 |
| 2.2.4 | **Scoreboard update toggle** — manual refresh vs auto-polling interval; show "last updated" timestamp | P2 | 2.2.1 | 0.5 |
| 2.2.5 | **Bracket filtering** — filter scoreboard by bracket (if brackets enabled in config) | P2 | 2.2.1, 0.5.3 | 1 |
| 2.2.6 | **Score history chart** — line chart showing score progression over time per team/user | P2 | 2.2.1 | 1.5 |

### 2.3 User & Team Profiles (Minggu 8–9)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 2.3.1 | **User profile** — `/users/:id`: username, affiliation, country, website, bio, score, rank, solve list, award list | P1 | 0.5.3, 0.4.1 | 1.5 |
| 2.3.2 | **User solve table** — sortable list of challenges solved by this user | P1 | 2.3.1 | 0.5 |
| 2.3.3 | **User awards** — displayed badges/medals on profile | P2 | 2.3.1 | 0.5 |
| 2.3.4 | **Team profile** — `/teams/:id`: team name, motto, logo, members, score, rank, invite code (captain only) | P1 | 0.5.3 | 1.5 |
| 2.3.5 | **Team member list** — avatar, username, score for each member | P1 | 2.3.4 | 0.5 |
| 2.3.6 | **Team join/leave/create** — forms for team management (if team mode enabled) | P1 | 2.3.4, 0.4.4 | 1 |
| 2.3.7 | **Team captaincy transfer** — UI for captain to transfer ownership | P2 | 2.3.6 | 0.5 |
| 2.3.8 | **User/team search** — searchable list at `/users` and `/teams` | P2 | 2.3.1, 2.3.4 | 1 |

### 2.4 User Settings (Minggu 9)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 2.4.1 | **Profile settings** — `/settings`: edit username, email, affiliation, country, website, bio, avatar (Gravatar or custom) | P1 | 0.5.3, 0.4.4 | 1 |
| 2.4.2 | **Password change** — current password + new password form | P1 | 2.4.1 | 0.5 |
| 2.4.3 | **Email change** — new email form + confirmation flow | P1 | 2.4.1 | 0.5 |
| 2.4.4 | **API tokens** — list/generate/revoke personal API tokens (`/api/v1/tokens`) | P1 | 2.4.1 | 1 |
| 2.4.5 | **Theme selection** — override the global theme (light/dark/system) per user session | P2 | 2.4.1 | 0.5 |
| 2.4.6 | **Account deletion** — confirmation flow with password verification | P2 | 2.4.1 | 0.5 |

---

## Phase 3: Admin Panel (Minggu 10–17) — P2

### Sub-phase 3.1: Admin Layout & Core (Minggu 10–11)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 3.1.1 | **Admin layout** — sidebar navigation (collapsible) + top bar + breadcrumbs; routes under `/admin/*` | P1 | 0.3.4, 0.4.8 | 1 |
| 3.1.2 | **Admin Dashboard** — `/admin/`: stats cards (users, teams, challenges, solves, submissions), recent activity feed, system health | P1 | 0.5.3 | 1.5 |
| 3.1.3 | **Admin navigation** — full sidebar menu with all sections (Challenges, Users, Teams, Pages, Scoreboard, Config, Submissions, etc.) | P1 | 3.1.1 | 1 |
| 3.1.4 | **Statistics page** — `/admin/statistics`: charts for solves over time, score distribution, category breakdown, user registration timeline | P2 | 0.5.3 | 1.5 |

### Sub-phase 3.2: Challenge Management (Minggu 12–14)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 3.2.1 | **Challenge list** — `/admin/challenges`: table of all challenges with search/filter/sort; status indicators (visible/hidden/locked); bulk actions | P1 | 0.5.3 | 1.5 |
| 3.2.2 | **Challenge create** — multi-step form: name, category, description (Markdown editor + preview), value/type (standard, dynamic), flags, hints, files, tags, topics, requirements | P1 | 3.2.1, 0.4.4 | 2 |
| 3.2.3 | **Challenge edit** — edit all fields from create; add/remove flags, hints, files, tags; visibility toggle | P1 | 3.2.2 | 1 |
| 3.2.4 | **Challenge type selector** — dropdown/radio to pick challenge type (standard, dynamic); show type-specific fields | P1 | 3.2.2 | 0.5 |
| 3.2.5 | **Flag management** — add/remove/edit flags within challenge editor; flag type selector (static, regex, etc.) | P1 | 3.2.2 | 1 |
| 3.2.6 | **Hint management** — add/remove/edit hints; set cost (points); preview hint content | P1 | 3.2.2 | 0.5 |
| 3.2.7 | **File upload** — upload files to challenge; manage existing files; drag-and-drop support | P1 | 3.2.2 | 1 |
| 3.2.8 | **Tag management** — add/remove tags; tag autocomplete/suggestions | P2 | 3.2.2 | 0.5 |
| 3.2.9 | **Topic management** — add/remove topics | P2 | 3.2.2 | 0.5 |
| 3.2.10 | **Requirement chaining** — challenge unlock requirements (must solve X first); tree visualization | P1 | 3.2.2 | 1 |
| 3.2.11 | **Submissions page** — `/admin/submissions`: table of all submissions; filter by user, challenge, type (correct/incorrect); bulk delete | P1 | 0.5.3, 0.4.3 | 1 |
| 3.2.12 | **Submission detail** — view full submission details; mark as correct/incorrect | P2 | 3.2.11 | 0.5 |

### Sub-phase 3.3: User & Team Admin (Minggu 13–14)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 3.3.1 | **User list** — `/admin/users`: table with search/filter/sort; show verified status, admin status, email, score, team affiliation | P1 | 0.5.3 | 1 |
| 3.3.2 | **User detail/edit** — `/admin/users/:id`: edit username, email, password, affiliation; toggle verified/admin/banned; view solves, submissions, awards | P1 | 3.3.1 | 1.5 |
| 3.3.3 | **Team list** — `/admin/teams`: table with search/filter/sort; show captain, member count, score | P1 | 0.5.3 | 1 |
| 3.3.4 | **Team detail/edit** — `/admin/teams/:id`: edit name, motto, captain; add/remove members; disband team | P1 | 3.3.3 | 1 |
| 3.3.5 | **Bulk user operations** — batch create users (CSV import), bulk award, bulk ban | P2 | 3.3.1 | 1.5 |

### Sub-phase 3.4: Configuration & Misc Admin (Minggu 15–17)

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 3.4.1 | **Config page** — `/admin/config`: tabbed interface for application settings | P1 | 0.5.3 | 2 |
| 3.4.2 | **Application tab** — CTF name, description, user mode, registration visibility, challenge visibility, score visibility, account visibility | P1 | 3.4.1 | 1 |
| 3.4.3 | **Theme tab** — theme selection, logo upload, banner/favicon/stylesheet customization | P2 | 3.4.1 | 0.5 |
| 3.4.4 | **Email tab** — SMTP settings, email verification toggle, email provider selection | P2 | 3.4.1 | 0.5 |
| 3.4.5 | **Bracket tab** — manage brackets (groups/divisions within the CTF) | P2 | 3.4.1 | 0.5 |
| 3.4.6 | **Legal tab** — terms of service, privacy policy | P2 | 3.4.1 | 0.5 |
| 3.4.7 | **Pages management** — `/admin/pages`: list/create/edit/delete static pages; Markdown editor with preview | P1 | 0.5.3 | 1.5 |
| 3.4.8 | **Editor page** — `/admin/editor`: custom CSS/JS injection editor | P1 | 3.4.1 | 0.5 |
| 3.4.9 | **Import/Export** — `/admin/import` + `/admin/export`: CSV/JSON import of challenges, users; export entire CTF as archive | P1 | 0.5.3 | 1 |
| 3.4.10 | **Integrations** — `/admin/integrations`: OAuth2 client management, SSO settings | P2 | 3.4.1 | 1 |
| 3.4.11 | **Notifications admin** — `/admin/notifications`: send broadcast notifications; list sent notifications | P2 | 0.5.3 | 0.5 |
| 3.4.12 | **Scoreboard admin** — `/admin/scoreboard`: preview + reset functionality | P2 | 0.5.3 | 0.5 |
| 3.4.13 | **Reset/wipe** — `/admin/reset`: partial or full CTF reset with confirmation dialogs | P1 | 3.4.1 | 0.5 |
| 3.4.14 | **Backup** — database backup download; schedule backups | P3 | 3.4.1 | 0.5 |

---

## Phase 4: Plugin System (Minggu 18–19) — P2

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 4.1 | **Plugin API design** — define React plugin interface: register routes, nav items, pages into the SPA; define TypeScript types for plugin manifest | P1 | 3.1.1 | 2 |
| 4.2 | **Plugin loader** — dynamic import of plugin bundles; mount plugin components in designated slots (sidebar, admin menu, challenge type) | P1 | 4.1 | 1.5 |
| 4.3 | **Plugin SDK** — create `@ctfdio/plugin-sdk` npm package: hooks, API client, UI components, types | P2 | 4.1 | 2 |
| 4.4 | **Challenge type plugin** — integrate `CTFd/plugins/challenges/` types into the React frontend; dynamic challenge detail rendering per plugin | P1 | 4.1 | 1.5 |
| 4.5 | **Flag type plugin** — integrate `CTFd/plugins/flags/` editing UI in challenge admin | P2 | 4.1 | 1 |
| 4.6 | **Plugin development guide** — document in `docs/plugins/` how to build frontend plugins | P2 | 4.1–5 | 0.5 |
| 4.7 | **Backward compat** — ensure old Jinja2-based plugins still work; provide migration guide | P1 | 4.1 | 1 |

---

## Phase 5: Testing & Polish (Minggu 20) — P1

| # | Task | Priority | Depends On | Est. Days |
|---|------|----------|------------|-----------|
| 5.1 | **Unit tests** — achieve ≥80% coverage on all new React components; focus on forms, hooks, utilities | P1 | All Phases 0–4 | 3 |
| 5.2 | **Integration tests** — test full page flows: login → browse challenges → submit flag → view scoreboard | P1 | 5.1 | 2 |
| 5.3 | **E2E tests (Playwright)** — critical user journeys: registration, admin CRUD, challenge solving, setup wizard | P1 | 5.2 | 2 |
| 5.4 | **API contract tests** — verify all API calls match backend behavior; catch regressions | P1 | 5.3 | 1 |
| 5.5 | **Accessibility audit** — WCAG 2.1 AA compliance: keyboard nav, screen reader, color contrast | P2 | 5.1 | 1 |
| 5.6 | **Performance budget** — Lighthouse score ≥90 for all categories; bundle size <200KB gzipped; first load JS <150KB | P1 | 5.1 | 1 |
| 5.7 | **Dark mode QA** — verify all pages in both light and dark themes; check contrast, readability, visuals | P2 | 5.1 | 0.5 |
| 5.8 | **Responsive QA** — test on 320px (mobile), 768px (tablet), 1024px+, 1440px+ | P2 | 5.1 | 0.5 |
| 5.9 | **Old theme deprecation** — add deprecation notice to legacy themes; remove old build scripts | P2 | 5.1 | 0.5 |
| 5.10 | **Bundle optimization** — code splitting by route; lazy load admin sections; tree-shaking | P1 | 5.6 | 1 |
| 5.11 | **Load testing** — simulate 500 concurrent users; fix performance bottlenecks | P3 | 5.6 | 1 |
| 5.12 | **i18n verification** — ensure Babel translations still work; test locale switching | P2 | 5.1 | 0.5 |
| 5.13 | **SSE/real-time verification** — test notification delivery under load | P2 | 5.1 | 0.5 |
| 5.14 | **Security scan** — check for XSS, CSRF, open redirect in new React code | P1 | 5.1 | 0.5 |

---

## Dependencies Graph

```
Phase 0 ──────────────────────────────────────────────┐
  ├─ 0.1 Scaffold & Tooling ─┐                        │
  ├─ 0.2 Build & CI ─────────┤                        │
  ├─ 0.3 Routing & Shell ────┤                        │
  ├─ 0.4 Shared Components ──┤                        │
  └─ 0.5 Data Layer ─────────┘                        │
                                                      │
Phase 1 ──────────────────────────────────────────────┤
  ├─ 1.1 Auth Pages (depends on 0.3, 0.4) ───────────┤
  ├─ 1.2 Static Pages (depends on 0.5) ──────────────┤
  └─ 1.3 Setup Wizard (depends on 1.1, 1.2) ────────┤
                                                      │
Phase 2 ──────────────────────────────────────────────┤
  ├─ 2.1 Challenge Board (depends on 0.3–0.5) ───────┤
  ├─ 2.2 Scoreboard (depends on 0.3–0.5) ────────────┤
  ├─ 2.3 User/Team Profiles (depends on 0.3–0.5) ───┤
  └─ 2.4 User Settings (depends on 0.3–0.5) ────────┤
                                                      │
Phase 3 ──────────────────────────────────────────────┤
  ├─ 3.1 Admin Layout & Core (depends on 0.3–0.5) ───┤
  ├─ 3.2 Challenge Mgmt (depends on 3.1) ────────────┤
  ├─ 3.3 User/Team Admin (depends on 3.1) ───────────┤
  └─ 3.4 Config & Misc (depends on 3.1) ────────────┤
                                                      │
Phase 4 (depends on 3.1) ─────────────────────────────┤
Phase 5 (depends on all) ─────────────────────────────┘
```

---

## Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Backend API missing endpoints needed by React SPA | Medium | High | Parallel API audit in Phase 0; add flask-restx endpoints as needed |
| R2 | CSRF token handling breaks in SPA compared to Jinja2 | Low | High | Dedicated CSRF work in 0.3.6; test all mutation endpoints |
| R3 | Plugin system backward compatibility breaks | Medium | High | Phase 4 keeps old themes until Phase 5; provide migration helpers |
| R4 | Bundle size grows beyond budget | Medium | Medium | Route-level code splitting; analyze with vite-plugin-visualizer |
| R5 | Dark mode design inconsistencies across 86 pages | Medium | Medium | Design system tokens in Phase 0; enforce via Tailwind theme |
| R6 | Real-time SSE/notifications complex to replicate in SPA | Low | Medium | Shared SSE hook in 0.5; reuse across components |
| R7 | Third-party plugin authors can't upgrade | Medium | High | Plugin SDK in Phase 4; clear migration docs |
| R8 | Test coverage slips as delivery pressure increases | High | Medium | CI gate on coverage; mandate tests in PR review |
| R9 | Markdown rendering differences between Jinja2 and React | Low | Medium | Use same marked/DOMPurify pipeline; snapshot test old outputs |
| R10 | Auth session handling (cookie-based) causes issues with SPA routing | Low | High | Use existing session cookie; handle 401 globally in API client |

---

## Milestones & Delivery Dates

| Milestone | Phase | Target Minggu | Deliverable |
|-----------|-------|---------------|-------------|
| M0 | Phase 0 | Minggu 2 | Vite dev server running; shadcn/ui added; routing working; API client functional; CI green |
| M1 | Phase 1 | Minggu 5 | Login, register, reset, confirm, setup wizard working; static pages rendering |
| M2 | Phase 2 | Minggu 9 | Challenge board with flag submission; scoreboard with podium; user/team profiles; settings |
| M3 | Phase 3.1 | Minggu 11 | Admin layout with sidebar; dashboard with stats; navigation working |
| M4 | Phase 3.2 | Minggu 14 | Admin CRUD for challenges, flags, hints, files, tags, submissions |
| M5 | Phase 3.3 | Minggu 14 | Admin CRUD for users/teams; bulk operations |
| M6 | Phase 3.4 | Minggu 17 | Config pages; pages editor; import/export; reset; integrations |
| M7 | Phase 4 | Minggu 19 | Plugin SDK published; plugin loader working; plugin dev guide written |
| M8 | Phase 5 | Minggu 20 | ≥80% test coverage; Lighthouse ≥90; bundle <200KB; E2E tests passing |

---

## Priority Mapping

| Priority | Description | Count |
|----------|-------------|-------|
| **P1** | Must-have for MVP launch; blocks other work | ~70 tasks |
| **P2** | Important but can ship as patch after MVP | ~30 tasks |
| **P3** | Nice-to-have; defer to v2 | ~5 tasks |

P1 tasks cover: auth, challenge solving, scoreboard, basic admin (challenges, users, teams, pages, config, reset), foundation (build, routing, shared components), testing.

P2 tasks cover: OAuth2, comments, solve charts, brackets, bulk operations, theme customization, email config, plugin SDK, accessibility audit, dark mode QA.

P3 tasks cover: Sentry, Command Palette, load testing, backup scheduling.
