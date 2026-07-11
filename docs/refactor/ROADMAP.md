# CTFd Frontend Refactoring — Timeline & Progress

> 20-week refactoring plan: Minggu 1–20.
> Total tasks: ~105 across 5 phases.
> Legacy templates: 18 core + 68 admin = 86 pages to migrate.

---

## ASCII Timeline

```
Minggu       1    2    3    4    5    6    7    8    9    10   11   12   13   14   15   16   17   18   19   20
            ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
Phase 0     ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  0.1       ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  0.2       ░░░░████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  0.3       ░░░░░░░░░░██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  0.4       ░░░░░░░░░░░░░░████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  0.5       ░░░░░░░░░░░░░░░░████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 1     ░░░░░░░░░░░░░░░░░░████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  1.1 Auth  ░░░░░░░░░░░░░░░░░░██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  1.2 Static░░░░░░░░░░░░░░░░░░░░░░████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  1.3 Setup ░░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 2     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  2.1 Board ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  2.2 Score ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  2.3 Prof. ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  2.4 Sett. ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 3     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████████████████████████░░░░░░░░
  3.1 Admin ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  3.2 Chal. ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██████████░░░░░░░░░░░░░░░░░░░░░░░░
  3.3 USR/TM░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████░░░░░░░░░░░░░░░░░░░░░░
  3.4 Config░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██████████░░░░░░░░░░
Phase 4     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░░░
Phase 5     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██████

KEY: ██ active work  ░░ idle
```

---

## Week-by-Week Breakdown

### Phase 0: Foundation — Minggu 1–2

#### Minggu 1 — Scaffold & Tooling Setup

- [ ] **0.1.1** Create `CTFd/frontend/` with Vite + React 18 + TypeScript
- [ ] **0.1.2** Configure Tailwind CSS v4 + PostCSS
- [ ] **0.1.3** Init shadcn/ui; create `components.json`
- [ ] **0.1.4** Install Radix, lucide-react, class-variance-authority, tailwind-merge, clsx
- [ ] **0.1.5** TypeScript strict mode + `@/` path alias
- [ ] **0.1.6** ESLint + Prettier config for `frontend/`
- [ ] **0.1.7** Vitest + @testing-library/react + jsdom
- [ ] **0.1.8** Playwright config + CI smoke test
- [ ] **0.1.9** Sentry/Rollbar setup
- [ ] **0.1.10** MSW (Mock Service Worker) for API mocking
- [ ] **0.2.1** Makefile targets for frontend
- [ ] **0.2.2** Flask ↔ Vite integration (proxy or static serve)
- [ ] **0.2.3** CI workflow for frontend
- [ ] **0.2.4** `yarn verify` script (build + git diff)
- [ ] **0.2.5** Env vars via `.env` files
- [ ] **0.2.6** Bundle analyzer

#### Minggu 2 — Routing, Shell, Shared Components, Data Layer

- [ ] **0.3.1** React Router v7 + route definitions
- [ ] **0.3.2** Full route tree
- [ ] **0.3.3** `App.tsx` root with providers
- [ ] **0.3.4** Layouts: Public, Auth, Participant, Admin
- [ ] **0.3.5** Providers: Theme, Auth, SSE
- [ ] **0.3.6** CSRF token handling
- [ ] **0.3.7** Route guards and redirects
- [ ] **0.3.8** Error boundary + 404 page
- [ ] **0.4.1** shadcn/ui base components (Button, Card, Input, Label, Badge)
- [ ] **0.4.2** Nav components (Sheet, DropdownMenu, Tabs)
- [ ] **0.4.3** Data components (Table, Dialog, Alert, Toast)
- [ ] **0.4.4** Form components (Select, Checkbox, RadioGroup, Switch)
- [ ] **0.4.5** Custom wrappers: Countdown, Markdown, SyntaxHighlighter, FlagInput
- [ ] **0.4.6** ThemeSwitcher
- [ ] **0.4.7** Navbar (shared top bar)
- [ ] **0.4.8** Sidebar (admin)
- [ ] **0.4.9** CommandPalette ⌘K
- [ ] **0.4.10** SSEToast notifications
- [ ] **0.5.1** TypeScript API types
- [ ] **0.5.2** API client (Axios instance)
- [ ] **0.5.3** TanStack Query hooks
- [ ] **0.5.4** Zustand stores
- [ ] **0.5.5** Utility functions

> **Milestone M0** — Foundation complete: Vite dev server running, shadcn/ui added, routing working, API client functional, CI green.

---

### Phase 1: Auth & Public Pages — Minggu 3–5

#### Minggu 3 — Authentication Pages

- [ ] **1.1.1** Login page (`/login`)
- [ ] **1.1.2** Register page (`/register`)
- [ ] **1.1.3** Reset password (`/reset`) — multi-step
- [ ] **1.1.4** Email confirm (`/confirm`)
- [ ] **1.1.5** OAuth2 social login buttons

#### Minggu 4 — Static Pages + Setup Wizard Start

- [ ] **1.2.1** Page renderer (`/page/:id`)
- [ ] **1.2.2** Landing/home page
- [ ] **1.2.3** Notifications page + SSE
- [ ] **1.2.4** Error pages (401, 403, 404, 500, 502)
- [ ] **1.3.1** Setup detection & redirect
- [ ] **1.3.2** Setup Step 1: Admin user creation
- [ ] **1.3.3** Setup Step 2: CTF configuration

#### Minggu 5 — Setup Wizard Complete + QA

- [ ] **1.3.4** Setup Step 3: Theme selection
- [ ] **1.3.5** Setup Step 4: Confirmation
- [ ] **1.3.6** Wizard progress bar + validation wiring
- [ ] Auth pages QA pass
- [ ] Setup wizard QA pass
- [ ] **Review gate** — code review all Phase 1 pages via `ctfd-code-review` skill

> **Milestone M1** — Auth complete: login, register, reset, confirm, setup wizard working; static pages rendering.

---

### Phase 2: Participant Features — Minggu 6–9

#### Minggu 6 — Challenge Board (Part 1)

- [ ] **2.1.1** Category grid layout
- [ ] **2.1.2** Challenge card component
- [ ] **2.1.3** Search/filter bar
- [ ] **2.1.4** Challenge detail modal (description, files, solves)

#### Minggu 7 — Challenge Board (Part 2) + Scoreboard Start

- [ ] **2.1.5** Flag submission with feedback
- [ ] **2.1.6** Hint system with cost reveal
- [ ] **2.1.7** File attachments
- [ ] **2.1.8** Solves list in modal
- [ ] **2.1.9** Comments section
- [ ] **2.1.10** Mobile responsive pass
- [ ] **2.2.1** Scoreboard table
- [ ] **2.2.2** Top 3 podium

#### Minggu 8 — Scoreboard + Profile Start

- [ ] **2.2.3** Solve graph (user/team breakdown)
- [ ] **2.2.4** Auto-poll or manual refresh toggle
- [ ] **2.2.5** Bracket filtering
- [ ] **2.2.6** Score history chart
- [ ] **2.3.1** User profile page (`/users/:id`)
- [ ] **2.3.2** User solve table
- [ ] **2.3.3** User awards

#### Minggu 9 — Profiles + Settings + QA

- [ ] **2.3.4** Team profile (`/teams/:id`)
- [ ] **2.3.5** Team member list
- [ ] **2.3.6** Team join/leave/create forms
- [ ] **2.3.7** Team captaincy transfer
- [ ] **2.3.8** User/team search
- [ ] **2.4.1** Profile settings
- [ ] **2.4.2** Password change
- [ ] **2.4.3** Email change
- [ ] **2.4.4** API tokens
- [ ] **2.4.5** Theme selection per user
- [ ] **2.4.6** Account deletion
- [ ] Challenge Board QA pass
- [ ] Scoreboard QA pass
- [ ] Profile/Settings QA pass
- [ ] **Review gate** — code review all Phase 2 pages

> **Milestone M2** — Participant features complete: challenge board with flag submission; scoreboard with podium; user/team profiles; settings.

---

### Phase 3: Admin Panel — Minggu 10–17

#### Minggu 10 — Admin Layout & Dashboard

- [ ] **3.1.1** Admin layout with collapsible sidebar + top bar + breadcrumbs
- [ ] **3.1.2** Admin dashboard with stats cards
- [ ] **3.1.3** Full sidebar navigation
- [ ] **3.1.4** Statistics page with charts

#### Minggu 11 — Challenge Admin (Part 1)

- [ ] **3.2.1** Challenge list table with search/filter/sort
- [ ] **3.2.2** Challenge create form (basic fields + description editor)
- [ ] **3.2.3** Challenge editor
- [ ] **3.2.4** Challenge type selector

> **Milestone M3** — Admin layout + dashboard + challenge list working.

#### Minggu 12 — Challenge Admin (Part 2)

- [ ] **3.2.5** Flag management in challenge editor
- [ ] **3.2.6** Hint management
- [ ] **3.2.7** File upload with drag-and-drop
- [ ] **3.2.8** Tag management
- [ ] **3.2.9** Topic management

#### Minggu 13 — Challenge Admin (Part 3) + User/Team Admin Start

- [ ] **3.2.10** Requirement chaining / unlock tree
- [ ] **3.2.11** Submissions page with filters
- [ ] **3.2.12** Submission detail view
- [ ] **3.3.1** User list
- [ ] **3.3.2** User detail/edit

#### Minggu 14 — User/Team Admin + QA

- [ ] **3.3.3** Team list
- [ ] **3.3.4** Team detail/edit
- [ ] **3.3.5** Bulk user operations (CSV import, bulk award)
- [ ] Challenge Admin QA pass
- [ ] User/Team Admin QA pass
- [ ] **Review gate** — code review all Phase 3.2–3.3 pages

> **Milestone M4** — Challenge admin CRUD complete.
> **Milestone M5** — User/team admin CRUD complete.

#### Minggu 15 — Config Pages (Part 1)

- [ ] **3.4.1** Config page layout with tabs
- [ ] **3.4.2** Application tab
- [ ] **3.4.3** Theme tab (logo, banner, CSS injection)
- [ ] **3.4.4** Email/SMTP tab
- [ ] **3.4.5** Bracket tab

#### Minggu 16 — Config Pages (Part 2)

- [ ] **3.4.6** Legal tab (ToS, privacy policy)
- [ ] **3.4.7** Pages management (CRUD + Markdown editor)
- [ ] **3.4.8** Editor page (custom CSS/JS)
- [ ] **3.4.9** Import/Export

#### Minggu 17 — Misc Admin + QA

- [ ] **3.4.10** Integrations page (OAuth2, SSO)
- [ ] **3.4.11** Notifications admin
- [ ] **3.4.12** Scoreboard admin (preview + reset)
- [ ] **3.4.13** Reset/wipe with confirmation
- [ ] **3.4.14** Backup page
- [ ] Full admin panel QA pass
- [ ] **Review gate** — code review all Phase 3.4 pages

> **Milestone M6** — Config pages, pages editor, import/export, reset, integrations all complete.

---

### Phase 4: Plugin System — Minggu 18–19

#### Minggu 18 — Plugin API Design & Loader

- [ ] **4.1** Plugin API design: define React plugin interface + TypeScript manifest types
- [ ] **4.2** Plugin loader: dynamic import + slot mounting
- [ ] **4.3** Plugin SDK: `@ctfdio/plugin-sdk` npm package

#### Minggu 19 — Plugin Integration + Docs

- [ ] **4.4** Challenge type plugin integration
- [ ] **4.5** Flag type plugin integration
- [ ] **4.6** Plugin development guide (`docs/plugins/`)
- [ ] **4.7** Backward compatibility with old Jinja2 plugins
- [ ] Plugin system QA pass
- [ ] **Review gate** — code review all Phase 4

> **Milestone M7** — Plugin SDK published, plugin loader working, dev guide written.

---

### Phase 5: Testing & Polish — Minggu 20

#### Minggu 20 — Full QA Sprint

- [ ] **5.1** Unit tests — ≥80% coverage
- [ ] **5.2** Integration tests — full page flows
- [ ] **5.3** E2E tests (Playwright) — critical journeys
- [ ] **5.4** API contract tests
- [ ] **5.5** Accessibility audit (WCAG 2.1 AA)
- [ ] **5.6** Performance budget: Lighthouse ≥90, bundle <200KB gzip
- [ ] **5.7** Dark mode QA
- [ ] **5.8** Responsive QA (320px→1440px+)
- [ ] **5.9** Old theme deprecation notice
- [ ] **5.10** Bundle optimization (code split + lazy load)
- [ ] **5.11** Load testing (500 concurrent users)
- [ ] **5.12** i18n verification (Babel + locale switching)
- [ ] **5.13** SSE/real-time verification
- [ ] **5.14** Security scan (XSS, CSRF, open redirect)
- [ ] Final QA sign-off
- [ ] **Review gate** — final comprehensive review

> **Milestone M8** — Full release: ≥80% test coverage, Lighthouse ≥90, bundle <200KB, E2E tests passing.

---

## Progress Tracking

### Global Checklist

- [ ] **Phase 0**: Foundation (Minggu 1–2) — 37 tasks
- [ ] **Phase 1**: Auth & Public Pages (Minggu 3–5) — 15 tasks
- [ ] **Phase 2**: Participant Features (Minggu 6–9) — 25 tasks
- [ ] **Phase 3**: Admin Panel (Minggu 10–17) — 30 tasks
- [ ] **Phase 4**: Plugin System (Minggu 18–19) — 7 tasks
- [ ] **Phase 5**: Testing & Polish (Minggu 20) — 14 tasks
- [ ] **Total**: ~105 tasks

### Milestone Checklist

| Milestone                | Date      | Status | Sign-off |
| ------------------------ | --------- | ------ | -------- |
| M0: Foundation complete  | Minggu 2  | ❌     | —        |
| M1: Auth & public pages  | Minggu 5  | ❌     | —        |
| M2: Participant features | Minggu 9  | ❌     | —        |
| M3: Admin layout + core  | Minggu 11 | ❌     | —        |
| M4: Challenge admin      | Minggu 14 | ❌     | —        |
| M5: User/team admin      | Minggu 14 | ❌     | —        |
| M6: Config & misc admin  | Minggu 17 | ❌     | —        |
| M7: Plugin system        | Minggu 19 | ❌     | —        |
| M8: Testing & polish     | Minggu 20 | ❌     | —        |

---

## Key Metrics

| Metric                        | Target             | Baseline (Legacy)  | Current | Minggu 10 | Minggu 20 |
| ----------------------------- | ------------------ | ------------------ | ------- | --------- | --------- |
| **TypeScript coverage**       | 100% (strict)      | 0%                 | 0%      | —         | —         |
| **Unit test coverage**        | ≥80%               | ~15% (Python)      | ~15%    | —         | —         |
| **E2E test coverage**         | All critical paths | 0                  | 0       | —         | —         |
| **Lighthouse Performance**    | ≥90                | ~70 (legacy theme) | —       | —         | —         |
| **Lighthouse Accessibility**  | ≥90                | ~65                | —       | —         | —         |
| **Lighthouse Best Practices** | ≥95                | ~80                | —       | —         | —         |
| **Bundle size (JS gzip)**     | <200KB             | ~400KB (legacy)    | —       | —         | —         |
| **First load JS**             | <150KB             | ~300KB             | —       | —         | —         |
| **Pages migrated**            | 86/86              | 0/86               | 0/86    | —         | —         |
| **API endpoints covered**     | 22/22              | —                  | —       | —         | —         |
| **WCAG 2.1 AA**               | Pass               | Fail               | —       | —         | —         |

---

## Review Gates

Each review gate triggers the `ctfd-code-review` skill. Review scope:

| Gate | Phase     | Trigger         | Reviewer Focus                                                               |
| ---- | --------- | --------------- | ---------------------------------------------------------------------------- |
| G1   | Phase 1   | After Minggu 5  | Auth flows, form validation, API compatibility, CSRF handling                |
| G2   | Phase 2   | After Minggu 9  | Challenge board UX, scoreboard data flow, real-time updates, profile privacy |
| G3   | Phase 3.2 | After Minggu 14 | Admin CRUD patterns, Markdown editor, file upload, bulk operations           |
| G4   | Phase 3.4 | After Minggu 17 | Config state management, import/export security, reset safety                |
| G5   | Phase 4   | After Minggu 19 | Plugin API design, dynamic loading, backward compatibility                   |
| G6   | Phase 5   | After Minggu 20 | Final comprehensive — all criteria                                           |

---

## Team Roles & RACI

| Role                | Responsible                  | Accountable            | Consulted     | Informed     |
| ------------------- | ---------------------------- | ---------------------- | ------------- | ------------ |
| **Frontend Lead**   | Phase 0–5 execution          | Architecture decisions | Backend team  | PM           |
| **Backend Lead**    | API contract, plugin compat  | Backend API changes    | Frontend lead | PM           |
| **Design Lead**     | UI tokens, component anatomy | Design system          | Frontend lead | All          |
| **QA Engineer**     | Tests, performance, a11y     | Quality gate           | All           | PM           |
| **Product Manager** | Priority, timeline, budget   | Delivery               | All           | Stakeholders |

---

## Post-MVP Roadmap (Beyond Minggu 20)

| Feature                                     | Priority | Est. Effort |
| ------------------------------------------- | -------- | ----------- |
| Dark mode system-level with persistence     | P3       | 3 days      |
| Real-time collaboration on challenge solves | P3       | 5 days      |
| Offline mode with service worker            | P3       | 5 days      |
| Challenge submission queue with retry       | P3       | 3 days      |
| Advanced scoreboard graphs (time series)    | P3       | 3 days      |
| Mobile app via React Native (shares API)    | P4       | 4 weeks     |
| User achievement badges (gamification)      | P4       | 2 weeks     |
| Plugin marketplace/registry                 | P4       | 4 weeks     |
