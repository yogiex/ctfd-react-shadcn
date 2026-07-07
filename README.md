# CTFd — React + shadcn/ui Refactoring

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **Capture The Flag** platform for Telkom University — Direktorat Pusat Teknologi Informasi (PuTI)

Proyek ini merupakan refactoring total frontend [CTFd](https://github.com/CTFd/CTFd) dari arsitektur Jinja2 + Alpine.js + Vue 2 menjadi **React 18 + TypeScript + shadcn/ui + Tailwind CSS**. Backend Flask Python tetap dipertahankan tanpa perubahan API signifikan — hanya ditambah endpoint `/init-data` untuk SPA integration.

---

## 🏗️ Arsitektur

```
CTFd/
├── frontend/                     ← React SPA (Vite build)
│   ├── src/
│   │   ├── features/             ← Fitur aplikasi (auth, challenges, admin, dll)
│   │   │   ├── auth/             ← Login, Register, Reset, Confirm (2-column layout)
│   │   │   ├── challenges/       ← Board, Card, Modal, Flag Submission, Hints
│   │   │   ├── scoreboard/       ← Table + ECharts Graph + Bracket Filter
│   │   │   ├── users/            ← List, Public Profile, Private Profile, Settings
│   │   │   ├── teams/            ← List, Public Profile, Private Dashboard
│   │   │   ├── home/             ← Landing page (Red Team + Blue Team)
│   │   │   ├── setup/            ← 2-step Setup Wizard (admin + CTF config)
│   │   │   ├── admin/            ← Full admin panel (13 routes)
│   │   │   │   ├── challenges/   ← CRUD + 11-tab editor (Flags, Hints, Files, dll)
│   │   │   │   ├── users/        ← List + Detail + CRUD
│   │   │   │   ├── teams/        ← List + Detail + CRUD
│   │   │   │   ├── config/       ← 19 tab config (General, Theme, Email, dll)
│   │   │   │   ├── submissions/  ← Filterable table
│   │   │   │   ├── scoreboard/   ← Admin scoreboard view
│   │   │   │   ├── statistics/   ← ECharts charts
│   │   │   │   ├── pages/        ← CMS page editor
│   │   │   │   ├── notifications/← CRUD
│   │   │   │   ├── reset/        ← CTF reset
│   │   │   │   └── plugin/       ← Legacy plugin backward compat
│   │   ├── components/ui/        ← 28 shadcn/ui components (Button, Card, Dialog, etc.)
│   │   ├── contexts/             ← AuthContext, ThemeContext
│   │   ├── layouts/              ← PublicLayout, MainLayout (with Admin link), AdminLayout
│   │   ├── lib/api/              ← CSRF-aware API client with `/init-data` caching
│   │   └── types/                ← TypeScript interfaces (Challenge, User, Team, API)
│   └── dist/                     ← Build output (di-serve oleh nginx)
├── CTFd/                         ← Backend Flask (dengan tambahan endpoint `/init-data`)
├── conf/nginx/
│   └── http.conf                 ← Nginx config: SPA + reverse proxy + auth routing
├── docker-compose.yml            ← MariaDB 10.11 + Redis 7 + CTFd + Nginx
├── Dockerfile                    ← Multi-stage build (3 stages)
├── AGENTS.md                     ← OpenCode agent instructions
├── opencode.json                 ← OpenCode config + agent definitions
└── .opencode/
    ├── skills/                   ← 12 skills (loop-triage, loop-refactor, frontend-design, etc.)
    └── rules/AGENTS.md          ← Agent guide (redundan dengan root AGENTS.md)
```

### Alur Login & CSRF

Karena SPA di-serve oleh nginx sebagai static file (bukan melalui Jinja2 template), `window.INITIAL_DATA` tidak tersedia. Solusinya:

1. **SPA startup** → `preloadInitData()` fetch `GET /init-data` → Flask set session cookie + return CSRF nonce
2. **User login** → `POST /login` dengan `nonce` di form body → Flask CSRF check pass → set session auth
3. **Auth state** → `AuthContext` baca dari cache `/init-data` (bukan `window.INITIAL_DATA`)
4. **Admin check** → `isAdmin` dari `/init-data` → navbar tampilkan "Admin" link

### Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 18, TypeScript (strict), Vite 5 |
| **UI** | shadcn/ui, Tailwind CSS 3, Radix UI |
| **State** | React Query 5, React Context |
| **Forms** | React Hook Form + Zod |
| **Charts** | ECharts 5 |
| **Routing** | React Router v6 |
| **Icons** | lucide-react |
| **Backend** | Flask 2.1, Python 3.11 |
| **Database** | MariaDB 10.11 (prod), SQLite (dev) |
| **Cache** | Redis 7 |
| **Proxy** | Nginx stable (SPA + reverse proxy) |

---

## 🚀 Quick Start

### Docker (Full Stack)

```sh
# Build & start semua services
docker-compose up --build

# Setup CTFd via browser
# Buka http://localhost:8000/setup
# Isi: admin / admin@ctfd.local / admin123
# Setelah setup sukses, login di http://localhost:8000/login

# Admin panel
# http://localhost:8000/admin/challenges
```

### Development (Hot Reload)

```sh
# Terminal 1: Backend Flask
pip install -r requirements.txt
python serve.py
# Flask running at :4000

# Terminal 2: Frontend Vite (HMR)
cd frontend
npm install
npm run dev
# Vite dev server at :5173 (proxy ke Flask :4000)
```

### Frontend Commands

```sh
npm run build       # Build produksi ke dist/
npm run dev         # Dev server dengan HMR
npm run test        # Vitest
npm run typecheck   # npx tsc --noEmit
npm run lint        # ESLint
```

---

## 🎨 Color Palette — Telkom University

Berdasarkan analisis dari website [it.telkomuniversity.ac.id](https://it.telkomuniversity.ac.id) dan UI/UX design review, warna mengacu pada brand guidelines Telkom University dengan merah sebagai primary.

| Role | Light Theme | Dark Theme | WCAG AA |
|------|-------------|------------|---------|
| **Primary** 🔴 | `#ED1E28` hsl(357, 85%, 52%) | `#FF4D54` hsl(358, 100%, 65%) | ✅ 5.37:1 |
| **Background** | `#F8F9FA` | `#121212` | — |
| **Card** | `#FFFFFF` | `#1E1E1E` | — |
| **Text** | `#1A1A1A` | `#FFFFFF` | ✅ 15.88:1 |
| **Border** | `#E5E5E5` | `#383838` | (decorative) |
| **Success** ✅ | `#12863C` hsl(142, 76%, 30%) | `#1EAD52` | ✅ 4.67:1 |
| **Warning** ⚠️ | `#9C6506` hsl(38, 92%, 32%) | `#D99E1A` | ✅ 4.91:1 |

**Typography:** Inter (sans) + JetBrains Mono (mono) — via Google Fonts.

---

## 📦 Status Migrasi Frontend — 26 Routes

### Public Pages

| Halaman | Route | Status | Component |
|---------|-------|--------|-----------|
| Landing Page | `/` | ✅ | HomePage (Red Team + Blue Team info) |
| Login | `/login` | ✅ | LoginPage (2-column, PuTI branding) |
| Register | `/register` | ✅ | RegisterPage (2-column, PuTI branding) |
| Reset Password | `/reset_password` | ✅ | ResetPasswordPage (2-step) |
| Confirm Email | `/confirm` | ✅ | ConfirmPage |
| Challenge Board | `/challenges` | ✅ | ChallengeBoard + Modal + Card + Flag Form + Hints |
| Scoreboard | `/scoreboard` | ✅ | ScoreboardPage + Graph (ECharts) + Bracket Filter |
| Users List | `/users` | ✅ | UsersListPage (search + pagination) |
| User Profile | `/users/:id` | ✅ | UserPublicProfile (solves + awards + graph) |
| My Profile | `/profile` | ✅ | UserPrivateProfile |
| Teams List | `/teams` | ✅ | TeamsListPage (search + pagination) |
| Team Profile | `/teams/:id` | ✅ | TeamPublicProfile (members + solves) |
| My Team | `/team` | ✅ | TeamPrivatePage (captain dashboard) |
| Settings | `/settings` | ✅ | SettingsPage (profile + API tokens) |
| Notifications | `/notifications` | ✅ | NotificationsPage |
| Static Pages | `/pages/:route` | ✅ | StaticPage (CMS pages) |
| Setup Wizard | `/setup` | ✅ | SetupPage (2-step, admin + CTF config) |

### Admin Pages

| Halaman | Route | Status | Component |
|---------|-------|--------|-----------|
| Dashboard | `/admin` | ✅ | AdminDashboard (4 stat cards) |
| Challenges List | `/admin/challenges` | ✅ | AdminChallengesListPage (search table) |
| Create Challenge | `/admin/challenges/new` | ✅ | AdminChallengeCreatePage (type selector + plugin form) |
| Challenge Detail | `/admin/challenges/:id` | ✅ | AdminChallengeDetailPage (11 tabs) |
| Users List | `/admin/users` | ✅ | AdminUsersListPage (search + pagination) |
| User Detail | `/admin/users/:id` | ✅ | AdminUserDetailPage (edit + solves/fails/awards) |
| Teams List | `/admin/teams` | ✅ | AdminTeamsListPage (search + pagination) |
| Team Detail | `/admin/teams/:id` | ✅ | AdminTeamDetailPage (members + edit) |
| Scoreboard | `/admin/scoreboard` | ✅ | AdminScoreboardPage |
| Statistics | `/admin/statistics` | ✅ | AdminStatisticsPage (ECharts charts) |
| Submissions | `/admin/submissions` | ✅ | AdminSubmissionsPage (filter table) |
| Config | `/admin/config` | ✅ | AdminConfigPage (19 tabs) |
| Pages | `/admin/pages` | ✅ | AdminPagesListPage + EditorPage |
| Notifications | `/admin/notifications` | ✅ | AdminNotificationsPage (CRUD) |
| Reset | `/admin/reset` | ✅ | AdminResetPage (confirmation) |

### Admin Challenge Detail — 11 Tabs

| Tab | Component | Fungsi |
|-----|-----------|--------|
| Detail | Form | Nama, kategori, nilai, deskripsi, state |
| Flags | AdminFlagForm | CRUD flags (static/regex/token) |
| Hints | AdminHintForm | CRUD hints + cost + prerequisites |
| Files | AdminFileUpload | Upload + list + delete |
| Tags | AdminTagInput | Enter-to-add, badge display |
| Topics | AdminTopicManager | Search + add/remove |
| Requirements | AdminRequirementsEditor | Prerequisite checkboxes |
| Solution | AdminSolutionEditor | Markdown + visibility state |
| Next | Select | Next challenge dropdown |
| Comments | AdminCommentThread | Thread + post |
| Ratings | AdminRatingsTable | Up/down rating paginated |

### Admin Config — 19 Tabs

General, Theme, Accounts, Brackets, Challenges, Time, Email, Legal, Social, Backup, Logo, Visibility, Localization, Fields, Registration Code, MLC, Pause, Robots, Sanitize.

---

## 🔧 Nginx Routing

Nginx dikonfigurasi dengan dual routing untuk auth endpoints:

```
GET /login  → SPA (React)
POST /login → Flask (auth handler)

GET /setup  → SPA (React)
POST /setup → Flask (setup handler)
```

Pattern ini memungkinkan React SPA menangani UI sementara Flask menangani logika autentikasi/setup.

---

## 🔧 OpenCode Engineering Loop

Proyek ini menggunakan **loop engineering** (Cobus Greyling methodology) — subagent-driven development dengan file-based state management.

```sh
# Run a triage cycle
opencode run "Read STATE.md, load loop-triage skill, output next component"

# Run a refactor cycle
opencode run "Read STATE.md, load loop-refactor skill, execute SCOUT→PLAN→BUILD→REVIEW→FIX→VERIFY"
```

### State Files (`docs/refactor/loop/`)

| File | Fungsi |
|------|--------|
| `STATE.md` | Memory spine — phase, priorities, blockers |
| `LOOP.md` | Loop configuration — gates, worktree, failsafe |
| `loop-budget.md` | Token & subagent budget |
| `loop-run-log.md` | Run history ledger |

### Skills (`.opencode/skills/`)

| Skill | Fungsi | Load |
|-------|--------|------|
| `loop-triage` | Triage progress, output next component | `skill({name:"loop-triage"})` |
| `loop-refactor` | 6-phase component migration | `skill({name:"loop-refactor"})` |
| `ctfd-frontend-design` | UI/UX design guidance | `skill({name:"ctfd-frontend-design"})` |
| `ctfd-shadcn` | shadcn/ui component usage | `skill({name:"ctfd-shadcn"})` |
| `ctfd-code-review` | Two-stage code review | `skill({name:"ctfd-code-review"})` |
| `brainstorming` | Design exploration | `skill({name:"brainstorming"})` |
| `writing-plans` | Implementation plans | `skill({name:"writing-plans"})` |
| `test-driven-development` | RED-GREEN-REFACTOR | `skill({name:"test-driven-development"})` |
| `using-git-worktrees` | Isolated workspace | `skill({name:"using-git-worktrees"})` |
| +3 more (verification, debugging, finishing branches) | | |

---

## 🐳 Docker Services

| Service | Image | Port | Fungsi | Healthcheck |
|---------|-------|------|--------|-------------|
| `nginx` | nginx:stable-alpine | `:8000` → 80 | SPA serve + reverse proxy ke Flask | — |
| `ctfd` | Custom (multi-stage) | internal | Flask (gunicorn + gevent) | ✅ port 8000 |
| `db` | mariadb:10.11 | internal | Database MySQL | ✅ innodb_initialized |
| `cache` | redis:7-alpine | internal | Session & cache | ✅ redis ping |

Volume: `logs`, `uploads`, `mariadb`, `redis` — named volumes (bukan bind mount `.data/*`).

---

## 📚 Dokumentasi Perencanaan

Semua dokumen perencanaan ada di `docs/refactor/`:

| Dokumen | Bahasa | Isi |
|---------|--------|-----|
| `PRD.md` | EN | Product Requirement Document |
| `SRS.md` | EN | Software Requirements Specification |
| `SKPL.md` | ID | Spesifikasi Kebutuhan Perangkat Lunak |
| `PLAN.md` | ID | Master plan refactoring (6 fase, 20 minggu) |
| `ROADMAP.md` | ID | Timeline + progress tracking |
| `CODEGUIDE.md` | ID | Coding standards & conventions |
| `MIGRATION.md` | ID | Incremental migration strategy |
| `TESTPLAN.md` | ID | Testing strategy (Vitest + Playwright) |

---

## 📄 Lisensi

MIT — Lihat [LICENSE](LICENSE) untuk detail.

---

*CTFd React Refactoring — Telkom University PuTI Security*
