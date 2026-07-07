# CTFd — React + shadcn/ui Refactoring

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **Capture The Flag** platform for Telkom University — Direktorat Pusat Teknologi Informasi (PuTI)

Proyek ini merupakan refactoring total frontend [CTFd](https://github.com/CTFd/CTFd) dari arsitektur Jinja2 + Alpine.js + Vue 2 menjadi **React 18 + TypeScript + shadcn/ui + Tailwind CSS**.

Backend Flask Python tetap dipertahankan tanpa perubahan API.

---

## 🏗️ Arsitektur

```
CTFd/
├── frontend/              ← React SPA (Vite build)
│   ├── src/
│   │   ├── features/      ← Fitur aplikasi (auth, challenges, admin, dll)
│   │   ├── components/ui/ ← shadcn/ui components
│   │   ├── contexts/      ← AuthContext, ThemeContext
│   │   ├── layouts/       ← PublicLayout, MainLayout, AdminLayout
│   │   └── lib/api/       ← API client (CSRF-aware)
│   └── dist/              ← Build output
├── CTFd/                  ← Backend Flask (tidak berubah)
├── conf/nginx/            ← Nginx config untuk SPA
├── docker-compose.yml     ← MariaDB + Redis + CTFd + Nginx
└── .opencode/             ← OpenCode engineering loop
    ├── skills/            ← 12 skills untuk agent-driven development
    └── rules/             ← AGENTS.md
```

### Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 18, TypeScript (strict), Vite |
| **UI** | shadcn/ui, Tailwind CSS, Radix UI |
| **State** | React Query, React Context |
| **Forms** | React Hook Form + Zod |
| **Charts** | ECharts |
| **Routing** | React Router v6 |
| **Icons** | lucide-react |
| **Backend** | Flask 2.1, Python 3.11 (unchanged) |
| **Database** | MariaDB 10.11 (prod), SQLite (dev) |
| **Cache** | Redis 7 |
| **Proxy** | Nginx (SPA + reverse proxy) |

---

## 🚀 Quick Start

### Docker (Production)

```sh
docker compose up --build
# Akses: http://localhost:8000
```

### Development (Frontend only)

```sh
# Terminal 1: Backend Flask
pip install -r requirements.txt
python serve.py

# Terminal 2: Frontend dev server (HMR)
cd frontend
npm install
npm run dev
# Akses: http://localhost:5173 (proxy ke Flask :4000)
```

### Frontend Build

```sh
cd frontend
npm run build      # Build produksi
npm run dev        # Dev server dengan HMR
npm run test       # Vitest
npm run typecheck  # TypeScript check
```

---

## 🎨 Color Palette — Telkom University

| Role | Light Theme | Dark Theme |
|------|-------------|------------|
| **Primary** 🔴 | `#ED1E28` | `#FF4D54` |
| **Background** | `#F8F9FA` | `#121212` |
| **Card** | `#FFFFFF` | `#1E1E1E` |
| **Text** | `#1A1A1A` | `#FFFFFF` |
| **Border** | `#E5E5E5` | `#383838` |
| **Success** ✅ | `#12863C` | `#1EAD52` |
| **Warning** ⚠️ | `#9C6506` | `#D99E1A` |

- Typography: **Inter** (sans) + **JetBrains Mono** (mono)

---

## 📦 Status Migrasi Frontend

| Halaman | Status | Route |
|---------|--------|-------|
| **Auth** (Login, Register, Reset, Confirm) | ✅ | `/login`, `/register`, dll |
| **Challenge Board** + Modal + Flag Submission | ✅ | `/challenges` |
| **Scoreboard** + Grafik ECharts | ✅ | `/scoreboard` |
| **User/Team Profiles** (public + private) | ✅ | `/users`, `/teams` |
| **Settings** + API Tokens | ✅ | `/settings` |
| **Setup Wizard** | ✅ | `/setup` |
| **Admin Dashboard** | ✅ | `/admin` |
| **Admin Users/Teams** (CRUD) | ✅ | `/admin/users`, `/teams` |
| **Admin Challenges** (11 tabs editor) | ✅ | `/admin/challenges` |
| **Admin Config** (19 tabs) | ✅ | `/admin/config` |
| **Admin Submissions, Scoreboard, Statistics** | ✅ | `/admin/*` |
| **Admin Pages, Notifications, Reset** | ✅ | `/admin/*` |
| **Plugin System** (backward compat) | ✅ | Dinamis |

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
| `LOOP.md` | Konfigurasi loop — gates, worktree, failsafe |
| `loop-budget.md` | Token & subagent budget |
| `loop-run-log.md` | Riwayat run |

### Skills (`.opencode/skills/`)

| Skill | Fungsi |
|-------|--------|
| `loop-triage` | Triage progress, output next component |
| `loop-refactor` | 6-phase component migration |
| `ctfd-frontend-design` | UI/UX design guidance |
| `ctfd-shadcn` | shadcn/ui component usage |
| `ctfd-code-review` | Two-stage code review |

---

## 🐳 Docker Services

| Service | Image | Port | Fungsi |
|---------|-------|------|--------|
| `nginx` | nginx:stable-alpine | `:8000` → 80 | SPA + reverse proxy |
| `ctfd` | Custom build | internal | Flask app (gunicorn) |
| `db` | mariadb:10.11 | internal | Database |
| `cache` | redis:7-alpine | internal | Session & cache |

---

## 📚 Dokumentasi

Semua dokumen perencanaan ada di `docs/refactor/`:

| Dokumen | Bahasa | Isi |
|---------|--------|-----|
| `PRD.md` | EN | Product Requirement Document |
| `SRS.md` | EN | Software Requirements Specification |
| `SKPL.md` | ID | Spesifikasi Kebutuhan Perangkat Lunak |
| `PLAN.md` | ID | Master plan refactoring |
| `ROADMAP.md` | ID | Timeline & progress |
| `CODEGUIDE.md` | ID | Coding standards |
| `MIGRATION.md` | ID | Migration strategy |
| `TESTPLAN.md` | ID | Testing strategy |

---

## 📄 Lisensi

MIT — Lihat [LICENSE](LICENSE) untuk detail.

---

*CTFd React Refactoring — Telkom University PuTI Security*
