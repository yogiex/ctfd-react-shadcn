# CTFd Frontend Refactoring — Software Requirements Specification

> **Version**: 1.0  
> **Status**: Draft  
> **Target Stack**: React 18 + TypeScript + shadcn/ui + Tailwind CSS  
> **Backend**: CTFd 3.8.6 — Flask 2.1 / Python 3.11 — REST API at `CTFd/api/v1/`

---

## 1. System Architecture

### 1.1 High-Level Architecture (ASCII Diagram)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (SPA)                               │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                React 18 Application                          │  │
│  │                                                              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │  │
│  │  │  Public  │ │  Admin   │ │  Auth    │ │  Shared       │  │  │
│  │  │  Layout  │ │  Layout  │ │  Routes  │ │  Components   │  │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ │  (shadcn/ui)  │  │  │
│  │       │            │            │        └───────────────┘  │  │
│  │  ┌────┴────────────┴────────────┴──────────────────────┐   │  │
│  │  │                React Router 6                        │   │  │
│  │  └────────────────────┬─────────────────────────────────┘   │  │
│  │                       │                                      │  │
│  │  ┌────────────────────┴─────────────────────────────────┐   │  │
│  │  │            API Client Layer                          │   │  │
│  │  │  (@ctfdio/ctfd-js + fetch wrapper)                   │   │  │
│  │  └────────────────────┬─────────────────────────────────┘   │  │
│  │                       │                                      │  │
│  │  ┌────────────────────┴─────────────────────────────────┐   │  │
│  │  │   State Management (React Query + Context)           │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  HTTP (CSRF-Token header)   SSE (EventSource)   File Upload        │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
┌─────────────────────────────────┴───────────────────────────────────┐
│                     Flask Backend (unchanged)                        │
│                                                                     │
│  ┌──────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │  REST API    │  │  SSE Events Endpoint │  │  File Serving    │  │
│  │  /api/v1/*   │  │  GET /events         │  │  /files/*        │  │
│  └──────┬───────┘  └──────────────────────┘  └──────────────────┘  │
│         │                                                           │
│  ┌──────┴───────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │  SQLAlchemy  │  │  Redis (cache/SSE)   │  │  File Storage    │  │
│  │  + DB        │  │  + Session Store     │  │  (local/S3)      │  │
│  └──────────────┘  └──────────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Tree (Frontend)

```
src/
├── App.tsx                          # Root: Providers, Router
├── main.tsx                         # Entry: ReactDOM.createRoot
├── routes/
│   ├── index.tsx                    # Route definitions
│   ├── ProtectedRoute.tsx           # Auth guard wrapper
│   ├── AdminRoute.tsx               # Admin role guard
│   └── SetupGuard.tsx               # Setup wizard guard
│
├── layouts/
│   ├── PublicLayout.tsx             # Public navbar + footer
│   ├── AdminLayout.tsx              # Admin sidebar + topbar
│   ├── AuthLayout.tsx               # Minimal (login/register)
│   └── SetupLayout.tsx              # Setup wizard steps
│
├── features/
│   ├── auth/                        # Login, register, confirm, reset-password
│   ├── challenges/                  # Challenge board, challenge detail, submission
│   ├── scoreboard/                  # Standings, score graph
│   ├── users/                       # Profile, settings, solves
│   ├── teams/                       # Create, join, manage, public profile
│   ├── pages/                       # Static markdown pages
│   ├── notifications/               # SSE listener, notification center
│   ├── admin/
│   │   ├── dashboard/              # Overview stats
│   │   ├── challenges/             # CRUD, flags, hints, files, tags
│   │   ├── users/                  # List, edit, ban
│   │   ├── teams/                  # List, edit, merge
│   │   ├── submissions/            # Submission log
│   │   ├── config/                 # All config sub-pages
│   │   ├── pages/                  # Pages CMS
│   │   ├── notifications/          # Send/manage
│   │   ├── statistics/             # Charts
│   │   └── export/                 # Import/export
│   └── plugins/                    # Plugin component registry
│
├── components/
│   ├── ui/                         # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── ChallengeCard.tsx
│   ├── ChallengeCategoryTabs.tsx
│   ├── SolveBadge.tsx
│   ├── ScoreboardTable.tsx
│   ├── ScoreGraph.tsx
│   ├── UserAvatar.tsx
│   ├── TeamMemberList.tsx
│   ├── MarkdownRenderer.tsx
│   ├── FileDownload.tsx
│   ├── NotificationToast.tsx
│   └── ... (shared components)
│
├── hooks/
│   ├── useAuth.ts
│   ├── useChallenges.ts
│   ├── useScoreboard.ts
│   ├── useSSE.ts
│   ├── useTheme.ts
│   └── ...
│
├── lib/
│   ├── api-client.ts               # Fetch wrapper, CSRF injection
│   ├── ctfd-client.ts              # @ctfdio/ctfd-js wrapper
│   ├── utils.ts                    # cn(), formatDate(), etc.
│   └── constants.ts                # Route paths, API endpoints
│
├── stores/
│   ├── auth-store.ts               # Auth state (React Context)
│   ├── theme-store.ts              # Dark mode state
│   └── notification-store.ts       # SSE notification queue
│
├── types/
│   ├── api.ts                      # API response types
│   ├── challenge.ts
│   ├── user.ts
│   ├── team.ts
│   ├── submission.ts
│   ├── config.ts
│   └── plugin.ts
│
├── i18n/
│   ├── index.ts
│   ├── en.json
│   └── id.json
│
└── test/                           # Vitest + React Testing Library
    ├── setup.ts
    ├── features/
    └── components/
```

---

## 2. Data Flow

### 2.1 Initial Page Load

```
1. User requests GET / (or /challenges, /scoreboard, etc.)
2. Flask renders minimal shell: index.html with <div id="root">
3. Flask injects <script>window.init = { ... }</script> with:
   - urlRoot, csrfNonce, userMode, userId, userName, userEmail,
     userVerified, teamId, teamName, start, end, themeSettings
4. Browser loads React bundle
5. App reads window.init for initial state
6. App fetches additional data (challenges, scoreboard) via API
7. React Router handles client-side navigation
```

### 2.2 Authenticated Request Flow

```
1. User fills form (e.g., flag submission)
2. React validates input client-side
3. API client attaches CSRF-Token header from window.init.csrfNonce
4. Request sent to Flask API (session cookie auto-attached)
5. Flask validates session + CSRF
6. Response returned (200 success / 400 error / 429 rate-limit)
7. React Query updates cache, re-renders UI optimistically
8. On 401, redirect to login
```

### 2.3 SSE Event Flow

```
1. App subscribes to GET /events via EventSource API
2. Flask sends events: notification, challenge_update, scoreboard_update
3. App dispatches to relevant React Query invalidation
4. Notification toast shown via notification-store
5. Scoreboard/Challenge list refetched automatically
```

### 2.4 File Upload Flow

```
1. Admin selects file in challenge editor
2. POST /api/v1/files with multipart/form-data
3. Server returns file metadata { id, location, url }
4. App displays uploaded file with download link
```

---

## 3. Functional Requirements

### FR-01: Authentication

| Requirement | Details |
|-------------|---------|
| Login | Email + password, session-based, redirect to previous page |
| Register | Form with name/email/password/optional team invite code |
| Email Confirmation | Show confirmation banner; resend confirmation email |
| Password Reset | Request reset via email; set new password from token link |
| Logout | Clear session; redirect to home |
| Session Check | On mount, verify session validity; redirect to login if expired |
| CSRF | Inject `CSRF-Token` header on all state-changing requests |

**API Endpoints:**
- `POST /api/v1/users/me` — login (sets session cookie)
- `POST /api/v1/logout` — logout
- `POST /api/v1/register` — register
- `POST /api/v1/confirm` — confirm email
- `POST /api/v1/reset_password` — request reset
- `PATCH /api/v1/reset_password` — execute reset

### FR-02: Challenge Board

| Requirement | Details |
|-------------|---------|
| List Challenges | Grouped by category, cards show name/category/value/solves |
| Filter | By category, by solved/unsolved status |
| Challenge Detail | Modal or side panel showing description, files, hints, submit form |
| Flag Submission | Input + submit button; immediate feedback (correct/incorrect/already solved) |
| Hints | Unlockable; cost shown; confirm before deducting points |
| Files | Download links for challenge attachments |
| Solved State | Visual indicator (checkmark, color change) on solved challenges |
| Real-time Updates | SSE-triggered re-fetch when challenges change |

**API Endpoints:**
- `GET /api/v1/challenges` — list (visibility-filtered)
- `GET /api/v1/challenges/{id}` — single challenge detail
- `POST /api/v1/challenges/attempt` — submit flag
- `GET /api/v1/hints/{id}` — get hint detail
- `POST /api/v1/unlocks` — unlock hint
- `GET /api/v1/files/{id}` — download file

### FR-03: Scoreboard

| Requirement | Details |
|-------------|---------|
| Standings Table | Rank, name, score, last solve time; paginated |
| Score Graph | Line chart of top 10 teams over time |
| Bracket Filter | Filter by bracket if enabled |
| Freeze | Frozen scores indicated visually; no new data after freeze time |
| Responsive | Table collapses on mobile |

**API Endpoints:**
- `GET /api/v1/scoreboard` — top teams
- `GET /api/v1/scoreboard/top/{count}` — top N teams
- `GET /api/v1/statistics/teams` — team score timeseries

### FR-04: User Profile & Settings

| Requirement | Details |
|-------------|---------|
| Public Profile | Username, join date, affiliation, country, website, solves list, awards, score |
| Settings | Edit profile fields, change password, change email |
| Solves History | Table: challenge name, category, value, solve time |
| Awards | Badges/medals visible on public profile |

**API Endpoints:**
- `GET /api/v1/users/{id}` — public profile
- `GET /api/v1/users/{id}/solves` — user's solves
- `GET /api/v1/users/{id}/awards` — user's awards
- `GET /api/v1/users/{id}/submissions` — user's submissions
- `PATCH /api/v1/users/me` — update own profile
- `PATCH /api/v1/users/me/integration` — update social links

### FR-05: Team Management

| Requirement | Details |
|-------------|---------|
| Create Team | Name, password, optional invite code |
| Join Team | By name + password, or invite link |
| Leave Team | Confirm; captain must transfer first |
| Invite Members | Generate invite link or send by email |
| Captain Transfer | Assign new captain; confirm |
| Team Public Profile | Members, score, solves |

**API Endpoints:**
- `GET /api/v1/teams` — list teams
- `POST /api/v1/teams` — create team
- `GET /api/v1/teams/{id}` — team detail
- `PATCH /api/v1/teams/{id}` — update team
- `POST /api/v1/teams/join` — join team
- `POST /api/v1/teams/leave` — leave team
- `POST /api/v1/teams/captain` — transfer captain
- `GET /api/v1/teams/invite` — get invite info
- `POST /api/v1/teams/invite` — use invite

### FR-06: Admin Challenges

| Requirement | Details |
|-------------|---------|
| List All | Table with name, category, value, type, state, solves count |
| Create | Wizard: type selection → configuration form |
| Edit | Tabs: details, flags, hints, files, tags, topics, requirements |
| Flags | Add/remove static, regex, or custom flag types |
| Hints | Add/remove hints with cost and content |
| Files | Upload/download/delete challenge files |
| Tags | Add/remove text tags |
| Topics | Add/remove topic associations |
| Requirements | Set prerequisite challenges |
| Preview | Preview challenge as player would see it |

**API Endpoints:**
- `GET /api/v1/challenges` — list all (admin sees all)
- `POST /api/v1/challenges` — create
- `PATCH /api/v1/challenges/{id}` — update
- `DELETE /api/v1/challenges/{id}` — delete
- `POST /api/v1/challenges/{id}/flags` — add flag
- `DELETE /api/v1/flags/{id}` — remove flag
- `POST /api/v1/challenges/{id}/hints` — add hint
- `DELETE /api/v1/hints/{id}` — remove hint
- `POST /api/v1/files` — upload file
- `DELETE /api/v1/files/{id}` — delete file
- `POST /api/v1/challenges/{id}/tags` — add tag
- `DELETE /api/v1/tags/{id}` — remove tag
- `POST /api/v1/challenges/{id}/topics` — add topic
- `DELETE /api/v1/topics/{id}` — remove topic

### FR-07: Admin Users

| Requirement | Details |
|-------------|---------|
| List | Table with name, email, verified, banned, team, score |
| Search | By name or email |
| Edit | Form: name, email, password, affiliation, country, verified, banned |
| Delete | Confirm + delete cascade |
| Awards | Add/remove awards for a user |
| Addresses | View IP addresses used by user |

**API Endpoints:**
- `GET /api/v1/users` — list users (admin)
- `POST /api/v1/users` — create user
- `PATCH /api/v1/users/{id}` — update user
- `DELETE /api/v1/users/{id}` — delete user
- `POST /api/v1/awards` — create award
- `DELETE /api/v1/awards/{id}` — delete award

### FR-08: Admin Teams

| Requirement | Details |
|-------------|---------|
| List | Table with name, captain, member count, score |
| Search | By name |
| Edit | Form: name, password, captain |
| Delete | Confirm + delete (disband) |
| Merge | Merge two teams, keeping members and solves |

**API Endpoints:**
- `GET /api/v1/teams` — list teams (admin)
- `POST /api/v1/teams` — create team
- `PATCH /api/v1/teams/{id}` — update team
- `DELETE /api/v1/teams/{id}` — delete team

### FR-09: CTF Configuration

| Requirement | Details |
|-------------|---------|
| General | CTF name, description, user mode (users/teams), division |
| Visibility | Challenge/scoreboard/registration/accounts visibility toggles |
| Time | Start/end time, freeze time, timezone |
| Email | SMTP settings, mailgun integration, email confirmation toggle |
| Social | OAuth providers registration |
| Theme | Logo, small icon, theme color, theme header/footer injection |
| Legal | Terms of Service, privacy policy URLs |
| Backup | Download/upload backup archive |
| Banners | Pause banner message, announcement banners |
| Bracket | Bracket management (divisions) |
| Fields | Custom user/team fields definition |

**API Endpoints:**
- `GET /api/v1/config` — list configs
- `PATCH /api/v1/config/{key}` — update config
- `GET /api/v1/brackets` — list brackets
- `POST /api/v1/brackets` — create bracket
- `PATCH /api/v1/brackets/{id}` — update bracket
- `DELETE /api/v1/brackets/{id}` — delete bracket

### FR-10: Admin Pages CMS

| Requirement | Details |
|-------------|---------|
| List Pages | Table: title, route, draft/published, auth required |
| Create | Title, route, content (Markdown), draft toggle, auth toggle |
| Edit | Same as create, preview |
| Delete | Confirm + delete |

**API Endpoints:**
- `GET /api/v1/pages` — list all
- `POST /api/v1/pages` — create
- `PATCH /api/v1/pages/{id}` — update
- `DELETE /api/v1/pages/{id}` — delete

### FR-11: Notifications

| Requirement | Details |
|-------------|---------|
| SSE Listener | Persistent EventSource connection to `GET /events` |
| Toast Display | Non-intrusive toast for each notification |
| Notification Center | List of all notifications received this session |
| Admin Send | Form: title, content, optional link; POST to create |

**API Endpoints:**
- `GET /events` — SSE stream
- `POST /api/v1/notifications` — create notification (admin)
- `DELETE /api/v1/notifications/{id}` — delete notification

### FR-12: Import/Export

| Requirement | Details |
|-------------|---------|
| Export | Download CTFd data as ZIP archive |
| Import | Upload ZIP archive to restore CTF |

**API Endpoints:**
- `GET /api/v1/exports/export` — download export
- `POST /api/v1/exports/import` — upload import

---

## 4. External Interface Requirements

### 4.1 REST API Interface

- **Base URL**: `<window.init.urlRoot>/api/v1/`
- **Format**: JSON (request body and response)
- **Authentication**: Session cookie (HttpOnly) + `CSRF-Token` header
- **Versioning**: URL-prefixed (`/api/v1/`), no Accept header versioning
- **Error Format**: `{ success: false, errors: { field: ["error msg"] } }`

### 4.2 Initial Data Injection

```typescript
// window.init — available on initial page load
interface WindowInit {
  urlRoot: string;          // e.g., '' or '/ctfd'
  csrfNonce: string;        // random nonce for CSRF-Token header
  userMode: 'users' | 'teams';
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  userVerified: boolean;
  teamId: number | null;
  teamName: string | null;
  start: string | null;     // ISO 8601
  end: string | null;       // ISO 8601
  themeSettings: string;    // JSON string or null
}
```

### 4.3 SSE Event Stream

- **URL**: `GET <urlRoot>/events`
- **Transport**: Server-Sent Events (EventSource API)
- **Events**: `notification`, `challenge-update`, `scoreboard-update`, `config-update`
- **Data**: JSON payload
- **Fallback**: If SSE unavailable/disabled, fall back to polling

### 4.4 File Upload

- **URL**: `POST /api/v1/files`
- **Content-Type**: `multipart/form-data`
- **Field**: `file` (the binary file)
- **Optional**: `challenge_id` to associate file with challenge
- **Response**: `{ success: true, data: { id, location, url } }`

---

## 5. Non-Functional Requirements

### 5.1 Performance (NFR-01)

- Bundle split by route (lazy-loaded pages)
- React Query caching with stale-while-revalidate
- Virtual scrolling for large tables (scoreboard: 1000+ rows)
- Image optimization for uploaded logos/icons
- Debounced search inputs for user/team search
- Memoized selectors for computed data

### 5.2 Security (NFR-02)

- All API requests go through CSRF-protected wrapper
- No plaintext tokens stored in localStorage or sessionStorage
- Input sanitization via DOMPurify for Markdown rendering
- CSP headers: restrict script sources (nonce-based)
- No reflection of user input into HTML without escaping
- Session timeout handling: auto-redirect to login on 401

### 5.3 Accessibility (NFR-03)

- All interactive elements have accessible names
- Forms have proper labels, error messages, and aria-invalid
- Modals trap focus, close on Escape, have aria-labelledby
- Color combinations pass WCAG AA contrast ratio
- Skip-to-content link on all pages
- Focus visible indicators for keyboard navigation

### 5.4 Reliability (NFR-04)

- Offline detection: show banner when network disconnected
- API retry: automatic retry (3 attempts) on network failure
- Graceful degradation: if API is down, show friendly error page
- SSE reconnection: auto-reconnect on disconnect with exponential backoff

### 5.5 Internationalization (NFR-05)

- All user-facing strings externalized to i18n JSON files
- Locale detection from `navigator.language` / user preference
- RTL layout support consideration
- Date/time formatting via `dayjs` locale

---

## 6. System Models

### 6.1 Route Structure

```
/                           → Home (redirect to challenges or scoreboard)
/login                      → Login page
/register                   → Registration page
/confirm                    → Email confirmation
/reset_password             → Password reset request
/reset_password/<token>     → Password reset execution

/challenges                 → Challenge board (public)
/challenges/<id>            → Challenge detail (modal or page)

/scoreboard                 → Scoreboard standings

/users                      → Users list (if enabled)
/users/<id>                 → User public profile
/settings                   → User settings (authenticated)

/teams                      → Teams list (if enabled)
/teams/new                  → Create team
/teams/join                 → Join team
/teams/<id>                 → Team public profile
/teams/<id>/settings        → Team settings (captain)

/pages/<route>              → Static markdown page

/notifications              → Notification center

/admin                      → Admin dashboard
/admin/challenges           → Challenge management
/admin/challenges/new       → Create challenge
/admin/challenges/<id>      → Edit challenge
/admin/users                → User management
/admin/users/new            → Create user
/admin/users/<id>           → Edit user
/admin/teams                → Team management
/admin/teams/<id>           → Edit team
/admin/submissions          → Submission log
/admin/pages                → Pages CMS
/admin/pages/new            → Create page
/admin/pages/<id>           → Edit page
/admin/config               → Configuration (tabs)
/admin/config/general
/admin/config/visibility
/admin/config/time
/admin/config/email
/admin/config/theme
/admin/notifications        → Admin notifications
/admin/statistics           → Statistics
/admin/export               → Import/Export
/admin/plugins              → Plugin manager
```

### 6.2 Data Models (TypeScript Interfaces)

```typescript
// === Authentication ===
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  csrfNonce: string;
  urlRoot: string;
}

// === User ===
interface User {
  id: number;
  oauth_id: number | null;
  name: string;
  email?: string;           // Only visible to self/admin
  password: string;         // Only for create/update payload
  website: string | null;
  affiliation: string | null;
  country: string | null;
  bracket_id: number | null;
  hidden: boolean;
  banned: boolean;
  verified: boolean;
  fields?: UserFieldValue[];
  team_id?: number | null;
  created: string;          // ISO 8601
}

interface UserFieldValue {
  field_id: number;
  value: string;
}

// === Team ===
interface Team {
  id: number;
  oauth_id: number | null;
  name: string;
  password: string;         // For join operations
  website: string | null;
  affiliation: string | null;
  country: string | null;
  bracket_id: number | null;
  hidden: boolean;
  banned: boolean;
  captain_id: number;
  members: User[];
  fields?: UserFieldValue[];
  created: string;
}

// === Challenge ===
interface Challenge {
  id: number;
  name: string;
  category: string;
  value: number;
  initial: number;          // For dynamic scoring
  decay: number;            // For dynamic scoring
  minimum: number;          // For dynamic scoring
  type: string;             // e.g., 'standard', 'dynamic'
  state: 'visible' | 'hidden';
  max_attempts: number;
  description: string;      // HTML/Markdown
  connection_info: string | null;
  next_id: number | null;
  requirements: {
    prerequisites?: number[];
    score?: number;
  };
  tags: Tag[];
  hints: Hint[];
  files: FileRef[];
  topics: Topic[];
  solves: number | null;
  solved_by_me?: boolean;
  attempts?: number;
}

interface Flag {
  id: number;
  challenge_id: number;
  type: string;             // 'static' | 'regex'
  content: string;
  data: string;             // Extra config (e.g., regex case sensitivity)
}

interface Hint {
  id: number;
  challenge_id: number;
  type: 'standard' | 'paid';
  cost: number;
  content: string;
  requirement?: { prerequisites?: number[] };
}

interface Tag {
  id: number;
  challenge_id: number;
  value: string;
}

interface Topic {
  id: number;
  challenge_id: number;
  value: string;
}

interface FileRef {
  id: number;
  type: string;
  location: string;
  url: string;
}

// === Submission ===
interface Submission {
  id: number;
  user_id: number;
  team_id: number | null;
  challenge_id: number;
  type: 'correct' | 'incorrect';
  provided: string;         // The submitted flag
  ip: string;
  date: string;
  user?: User;
  team?: Team;
  challenge?: Challenge;
}

interface Solve extends Submission {
  type: 'correct';
}

// === Award ===
interface Award {
  id: number;
  user_id: number;
  team_id: number | null;
  name: string;
  value: number;
  category: string;
  description: string;
  icon: string;
  date: string;
}

// === Scoreboard ===
interface ScoreboardEntry {
  pos: number;
  account_id: number;
  name: string;
  score: number;
  bracket_name: string | null;
  member_count?: number;    // Team mode
}

interface ScoreboardTimeseries {
  [account_name: string]: { date: string; score: number }[];
}

// === Page ===
interface Page {
  id: number;
  title: string;
  route: string;
  content: string;
  draft: boolean;
  auth_required: boolean;
  hidden: boolean;
  link: string;
}

// === Notification ===
interface Notification {
  id: number;
  title: string;
  content: string;
  link: string | null;
  date: string;
}

// === Config ===
interface CTFConfig {
  ctf_name: string;
  ctf_description: string;
  user_mode: 'users' | 'teams';
  division: string | null;
  challenge_visibility: 'public' | 'private' | 'admins';
  scoreboard_visibility: 'public' | 'private' | 'admins' | 'hidden';
  registration_visibility: 'public' | 'private' | 'mlc';
  account_visibility: 'public' | 'private' | 'admins';
  start: string | null;
  end: string | null;
  freeze: string | null;
  verify_email: boolean;
  mail_server: string;
  mail_port: number;
  mail_tls: boolean;
  mail_ssl: boolean;
  mail_username: string;
  mail_password: string;
  mailgun_api_key: string;
  mailgun_base_url: string;
  theme: string;
  theme_color: string | null;
  ctf_logo: string | null;
  ctf_small_icon: string | null;
  ctf_theme_settings: string | null;
  social_icons: string | null;
  // ... more config keys exist dynamically
}

// === Bracket ===
interface Bracket {
  id: number;
  name: string;
  description: string;
  tag: string;
  hidden: boolean;
}

// === API Response Envelope ===
interface APIResponse<T> {
  success: boolean;
  data: T;
  errors?: Record<string, string[]>;
  confirmed?: boolean;
}
```

---

## 7. Verification Strategy

| Level | Tool | Scope |
|-------|------|-------|
| Unit | Vitest + React Testing Library | Component rendering, hooks, utils |
| Integration | Vitest + MSW (Mock Service Worker) | Feature flows with API mocking |
| E2E | Playwright | Full user journeys (login → solve → scoreboard) |
| Accessibility | axe-core (via Playwright + unit) | WCAG 2.1 AA compliance |
| Visual Regression | Storybook + Chromatic | Component visual diffs |
| Performance | Lighthouse CI | Bundle size, FCP, TTI |
| Type Safety | TypeScript strict mode + tsc | No implicit any, strict null checks |

---

## 8. Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3 | UI framework |
| react-dom | ^18.3 | DOM rendering |
| react-router-dom | ^6.26 | Client-side routing |
| @tanstack/react-query | ^5 | Server state management |
| @ctfdio/ctfd-js | ^0.0.19 | API client SDK |
| tailwindcss | ^3.4 | Utility-first CSS |
| @radix-ui/* | various | shadcn/ui primitives |
| class-variance-authority | ^0.7 | Component variants |
| clsx + tailwind-merge | ^2 | Conditional classnames |
| react-hook-form | ^7 | Form handling |
| zod | ^3 | Schema validation |
| dayjs | ^1.11 | Date formatting |
| echarts | ^5.5 | Scoreboard charts |
| echarts-for-react | ^3 | React ECharts wrapper |
| react-markdown | ^9 | Markdown rendering |
| dompurify | ^3 | HTML sanitization |
| react-helmet-async | ^2 | Document head management |
| lucide-react | ^0.441 | Icons |
| sonner | ^1 | Toast notifications |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^5 | Build tool |
| vitest | ^1 | Test runner |
| @testing-library/react | ^14 | Component testing |
| @testing-library/user-event | ^14 | User event simulation |
| msw | ^2 | API mocking |
| storybook | ^7 | Component development |
| @storybook/react-vite | ^7 | Storybook integration |
| playwright | ^1.45 | E2E testing |
| axe-playwright | ^2 | Accessibility testing |
| typescript | ^5.5 | Type checking |
| eslint | ^8 | Linting |
| prettier | ^3 | Formatting |
| husky | ^9 | Git hooks |
