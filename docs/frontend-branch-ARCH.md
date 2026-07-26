# Frontend Branch Architecture & Refactoring Checkpoint

> **Branch**: `frontend`
> **Target**: Static React site deployed to GitHub Pages
> **Base Branch**: `react-shadcn` (SPA with Flask backend integration)
> **Created**: 2026-07-26

---

## 1. Arsitektur Dua Mode

Proyek CTFd React memiliki dua mode operasi:

| Aspek | `react-shadcn` (SPA) | `frontend` (Static Site) |
|-------|---------------------|--------------------------|
| **Target Deploy** | Flask backend integration | GitHub Pages |
| **Backend** | CTFd Flask API di :4000 | None (mock data) |
| **API Client** | `@/lib/api/client` (real HTTP) | `@/lib/api/client` (mock) |
| **Auth** | Login/register via API | Static mock (unauthenticated) |
| **Admin Panel** | Full CRUD | Tidak tersedia |
| **Routing** | Semua routes (auth, public, admin) | Public routes only |
| **Build Output** | `frontend/dist/` | `frontend/dist/` |
| **Base Path** | `/` | `/ctfd-react-shadcn/` atau env |

### Diagram Alir

```
react-shadcn (main):
  React SPA → Flask API (:4000) → Database

frontend (branch):
  React SPA → Mock API Client → Static JSON/Fixtures
                                      ↓
                              GitHub Pages (static)
```

---

## 2. Struktur Branch

```
frontend/                    # Root React project
├── public/
│   ├── 404.html            # SPA fallback untuk GitHub Pages
│   └── .nojekyll           # Nonaktifkan Jekyll
├── src/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts   # Mock API client (get/post/patch/delete/upload)
│   │   │   └── mock-data.ts# Semua fixture data statis
│   │   ├── constants.ts    # QUERY_KEYS, ROUTES, API_BASE
│   │   └── utils.ts        # cn(), formatDate(), formatScore()
│   ├── contexts/
│   │   └── AuthContext.tsx  # Mock auth (user: null, isAuthenticated: false)
│   ├── features/
│   │   ├── challenges/     ✅ Aktif (mock data)
│   │   ├── scoreboard/     ✅ Aktif (mock data)
│   │   ├── teams/          ✅ Aktif (mock data, view-only)
│   │   ├── users/          ✅ Aktif (mock data, view-only)
│   │   ├── notifications/  ✅ Aktif (mock data)
│   │   ├── auth/           ⛔ Non-aktif (login/register tidak relevan)
│   │   ├── setup/          ⛔ Non-aktif (static site already setup)
│   │   └── admin/          ⛔ Non-aktif (admin panel tidak relevan)
│   ├── router.tsx          # Public routes only
│   └── App.tsx             # Tanpa preloadInitData blocking
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions deploy
├── vite.config.ts          # base path, no proxy
├── .env.example            # VITE_BASE_PATH
└── vitest.config.ts        # Test config
docs/
└── frontend-branch-ARCH.md # File ini
```

---

## 3. Mock Data Layer

### `@/lib/api/client.ts`
Mock implementation of the API client. Semua method mengembalikan data statis tanpa HTTP request.

**Methods:**
- `api.get<T>(url, config?)` → return mock data based on URL pattern
- `api.post<T>(url, data?)` → return mock submission response
- `api.patch<T>(url, data?)` → return empty success
- `api.put<T>(url, data?)` → return empty success
- `api.delete(url)` → return void
- `api.upload<T>(url, formData)` → return empty success

**Helpers:**
- `getInitData(): InitialData` → return static init data (unauthenticated)
- `getCsrfNonce(): string` → return static nonce
- `preloadInitData(): Promise<void>` → lightweight delay, no real fetch

### `@/lib/api/mock-data.ts`
Fixture data mencakup:
- 8 challenges (Web, Binary, Forensics, Reverse, Crypto, OSINT, Misc)
- 5 scoreboard entries
- 7 users
- 4 teams
- 3 notifications
- 3 static pages (About, Rules, Privacy)
- Config defaults
- Flag & challenge type registries

---

## 4. Checkpoint Tracker

Setiap selesai mengerjakan task, update tabel di bawah.

| # | Date | Task | Files Changed | Status | Verifier |
|---|------|------|--------------|--------|----------|
| 1 | 2026-07-26 | Mock data layer | `src/lib/utils.ts`, `src/lib/constants.ts`, `src/lib/api/client.ts`, `src/lib/api/mock-data.ts` | ✅ Done | tsc -b |
| 2 | 2026-07-26 | Build config GH Pages | `vite.config.ts`, `public/404.html`, `public/.nojekyll`, `.github/workflows/deploy.yml`, `.env.example` | ✅ Done | npm run build |
| 3 | 2026-07-26 | Router refactor | `src/router.tsx` | ✅ Done | tsc -b |
| 4 | 2026-07-26 | AuthContext refactor | `src/contexts/AuthContext.tsx` | ✅ Done | tsc -b |
| 5 | 2026-07-26 | App.tsx refactor | `src/App.tsx` | ✅ Done | tsc -b |
| 6 | 2026-07-26 | Dokumentasi | `docs/frontend-branch-ARCH.md` | ✅ Done | review |
| 7 | 2026-07-26 | Full build verification | - | ⏳ Pending | npm run build |
| 8 | TBD | Deploy ke GitHub Pages | - | ⏳ Pending | URL check |

---

## 5. Perbedaan dengan react-shadcn Branch

### Yang DIHAPUS dari routing:
- ✅ `/login`, `/register`, `/confirm`, `/reset-password` (auth not needed)
- ✅ `/setup` (static site is already set up)
- ✅ `/admin/*` (admin panel not relevant)
- ✅ `/settings` (no settings to save)

### Yang DIUBAH:
- Mock API client instead of real HTTP
- AuthContext: hardcoded `isAuthenticated: false`, `isAdmin: false`
- vite.config.ts: removed proxy, added configurable base path
- App.tsx: removed `preloadInitData` await (non-blocking init)

### Yang TETAP SAMA:
- Semua komponen UI (shadcn/ui)
- ThemeContext, ErrorBoundary
- Types & interfaces
- Test infrastructure
- i18n stub

---

## 6. Panduan Development

### Setup Lokal
```bash
cd frontend
npm install
npm run dev        # Dev server di :5173
```

### Build
```bash
cd frontend
npm run build      # Output di frontend/dist/
npm run preview    # Preview build lokal
```

### Type Check
```bash
cd frontend
npx tsc --noEmit   # TypeScript check
```

### Test
```bash
cd frontend
npx vitest run     # Unit tests
```

### Deploy ke GitHub Pages
Push ke branch `frontend` → GitHub Actions otomatis build & deploy.
Atau manual:
```bash
cd frontend
VITE_BASE_PATH=/ctfd-react-shadcn/ npm run build
# Upload frontend/dist/ ke GitHub Pages
```

---

## 7. Catatan Arsitektur

### Kenapa Mock API Client?
Static site tidak punya backend. Dengan mock API client yang mengembalikan data statis:
- Semua komponen React berfungsi tanpa perubahan
- Loading/error/empty states tetap terlihat (misal: simulated delay, rate limiting)
- Developer bisa melihat UI dalam berbagai kondisi
- Transisi ke mode SPA dengan backend nyata hanya perlu ganti `client.ts`

### Kenapa AuthContext Tetap Ada?
Komponen seperti `MainLayout`, `ScoreboardTable`, dan `ChallengeBoard` menggunakan `useAuth()`. AuthContext tetap ada tapi dengan state statis:
- `isAuthenticated: false`
- `isAdmin: false`
- `user: null`
- `team: null`

### Yang Tidak Bisa Ditampilkan di Static Site
- Admin panel (CRUD operations)
- Login/register (requires real auth)
- Flag submission real-time verification
- Plugin challenge rendering (needs backend for templates)
- Email confirmation flows
- Team management (join, create, invite)

---

## 8. Keamanan (Static Site Context)

Meskipun static site tidak memiliki backend, beberapa praktik tetap diterapkan:

| Praktik | Status | Keterangan |
|---------|--------|------------|
| DOMPurify untuk HTML | ✅ | HintPanel, StaticPage, ChallengeDescriptionRenderer |
| CSP headers | ⏳ Via Vite plugin | Direncanakan |
| No secrets in code | ✅ | Semua data dummy |
| Safe dependency versions | ✅ | package.json |
| Source maps production | ❌ Dinonaktifkan | `sourcemap: false` di vite.config |

---

## 9. Referensi

- [CTFd Original](https://github.com/ctfd/ctfd)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query)
- [GitHub Pages SPA](https://github.com/rafgraph/spa-github-pages)
