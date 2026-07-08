# CTFd Frontend Refactoring — Product Requirements Document

> **Version**: 1.0  
> **Status**: Draft  
> **Target Platform**: React 18 + TypeScript + shadcn/ui + Tailwind CSS  
> **Backend Version**: CTFd 3.8.6 (Flask 2.1 / Python 3.11)

---

## 1. Executive Summary

CTFd is the leading open-source Capture The Flag (CTF) framework, currently serving thousands of competitions worldwide. Its frontend is built on three independent Jinja2-based themes (core, admin, telkom-university) that use a mix of Alpine.js, Vue 2/3, Bootstrap, and jQuery. This heterogeneous architecture creates maintenance burden, inconsistent UX, and limited extensibility.

This project refactors the entire frontend into a unified **React 18 + TypeScript Single Page Application (SPA)** using **shadcn/ui** and **Tailwind CSS**. The Flask API remains unchanged. The result will be a consistent, performant, accessible, and developer-friendly frontend that serves both participants and administrators.

---

## 2. Product Overview

### 2.1 Vision

A single, modern, responsive SPA that provides an intuitive experience for CTF participants and a powerful management interface for organizers — all while preserving backward compatibility with the existing plugin system and API.

### 2.2 Target Users & Personas

| Persona | Role | Goals | Pain Points |
|---------|------|-------|-------------|
| **Alex — CTF Player** | University student, competes in 2-3 CTFs/year | Solve challenges quickly, track team progress, see scoreboard | Page reloads on every action, inconsistent dark mode, slow navigation |
| **Dr. Chen — CTF Organizer** | Professor running a 500-person CTF | Create/manage challenges, monitor submissions, configure CTF settings | Admin UI is cluttered with jQuery modals, no bulk operations, slow form interactions |
| **Sam — Plugin Developer** | Open-source contributor building custom challenge types | Extend frontend with custom components, integrate with API | Three different theme codebases to support, no component library, unclear extension points |
| **Jordan — Team Captain** | Lead of a 5-person CTF team | Manage team membership, track individual solves, use team invites | Team management is spread across multiple pages, invite flow is cumbersome |
| **Mika — CTF Platform Admin** | Sysadmin deploying CTFd for multiple orgs | Easy deployment, theming, import/export, email config | Configuration pages are inconsistent, no bulk user management |

---

## 3. User Stories

### 3.1 Challenge Solving (Player)

- **US-01**: As a player, I want to browse challenges by category so that I can find relevant problems quickly.
- **US-02**: As a player, I want to view challenge details, submit flags, and get immediate feedback without page reloads.
- **US-03**: As a player, I want to unlock hints and view my solve history for each challenge.
- **US-04**: As a player, I want to see file attachments and download them from the challenge view.
- **US-05**: As a player, I want the challenge board to update in real-time when new challenges are released.

### 3.2 Scoreboard (Player)

- **US-06**: As a player, I want to view the live scoreboard with team rankings so that I can gauge competition standing.
- **US-07**: As a player, I want to see score progression graphs comparing top teams.
- **US-08**: As a player, I want to filter scoreboard by bracket or category.

### 3.3 Admin Challenge Management

- **US-09**: As an admin, I want to create, edit, delete, and preview challenges from a single interface.
- **US-10**: As an admin, I want to manage challenge flags, hints, tags, topics, and files through dedicated forms.
- **US-11**: As an admin, I want to view solve statistics and submission logs per challenge.
- **US-12**: As an admin, I want to batch-update challenge visibility, category, or value.

### 3.4 User & Team Management

- **US-13**: As an admin, I want to list, search, edit, ban, and delete user accounts.
- **US-14**: As an admin, I want to manage teams, assign captains, and merge/delete teams.
- **US-15**: As a player, I want to register, login, verify email, reset password, and manage my profile.
- **US-16**: As a player, I want to create or join teams, and manage team membership.

### 3.5 CTF Configuration

- **US-17**: As an admin, I want to configure CTF name, description, start/end time, user mode, and visibility settings.
- **US-18**: As an admin, I want to manage email (SMTP), social login (OAuth), and MLC integration.
- **US-19**: As an admin, I want to import/export CTF data and manage backups.
- **US-20**: As an admin, I want to customize theme settings and logo.

### 3.6 Plugin Integration

- **US-21**: As a plugin developer, I want to register React components that extend challenge types, flag types, and admin panels.
- **US-22**: As a plugin developer, I want the frontend to respect existing plugin hooks (styles, scripts, navigation).
- **US-23**: As an admin, I want installed plugins to appear in the admin navigation automatically.

---

## 4. Feature Requirements by Phase

### Phase 1 — MVP (Public-Facing)

| ID | Feature | Description | User Stories |
|----|---------|-------------|--------------|
| F-01 | Authentication | Login, register, logout, email confirmation, password reset | US-15 |
| F-02 | Challenge Board | Browse, filter, view, submit flags, hints, files | US-01–05 |
| F-03 | Scoreboard | Live rankings, top-10 graph, bracket filter | US-06–08 |
| F-04 | User Profile | View/edit profile, see solves, awards, submissions | US-15 |
| F-05 | Team Management | Create/join/leave teams, invite members, captain transfer | US-16 |
| F-06 | Notifications | Real-time SSE notifications and snackbar toasts | — |
| F-07 | Static Pages | Render Markdown pages (about, rules, etc.) | — |
| F-08 | Dark Mode | System-aware and manual dark mode toggle | — |

### Phase 2 — Admin Panel

| ID | Feature | Description | User Stories |
|----|---------|-------------|--------------|
| F-09 | Admin Dashboard | Overview: user count, challenge count, recent submissions | — |
| F-10 | Challenge Management | CRUD challenges, flags, hints, tags, files, topics | US-09–12 |
| F-11 | User Management | List, search, edit, ban, delete users | US-13 |
| F-12 | Team Management | List, search, edit, merge, delete teams | US-14 |
| F-13 | Submission Logs | View all submissions, filter by user/challenge/type | — |
| F-14 | CTF Configuration | All config pages (general, visibility, time, email, etc.) | US-17–20 |
| F-15 | Pages CMS | Create/edit/delete Markdown pages | — |
| F-16 | Notifications Admin | Send/manage broadcast notifications | — |
| F-17 | Export/Import | Import and export CTF data archive | — |
| F-18 | Statistics | Charts for solves, user registration, challenge difficulty | — |

### Phase 3 — Plugin System & Extensibility

| ID | Feature | Description | User Stories |
|----|---------|-------------|--------------|
| F-19 | Plugin Component Registry | Runtime registration of React components by plugins | US-21 |
| F-20 | Plugin Hooks Compatibility | Inject plugin styles/scripts into SPA | US-22 |
| F-21 | Admin Plugin Navigation | Dynamic sidebar nav items from plugins | US-23 |
| F-22 | Challenge Type SDK | Base class + example for custom challenge types | US-21 |

---

## 5. Non-Functional Requirements

### Performance

| Requirement | Target |
|-------------|--------|
| First Contentful Paint (FCP) | < 1.5s on broadband |
| Time to Interactive (TTI) | < 3.0s |
| Lighthouse Performance Score | ≥ 90 |
| Bundle size (initial load) | < 250 KB gzipped |
| API response rendering | < 200ms for list views |
| Scoreboard rendering (1000 teams) | < 2s |

### Security

| Requirement | Approach |
|-------------|----------|
| XSS Prevention | React's built-in escaping, CSP headers |
| CSRF Protection | Use existing nonce from `window.init.csrfNonce` as `CSRF-Token` header |
| Authentication | Token-based via session cookie, no tokens in localStorage |
| API Rate Limiting | Respect existing `@ratelimit` decorator — show user-friendly error |
| Input Sanitization | Never trust user input; sanitize before rendering Markdown |

### Accessibility

- WCAG 2.1 AA compliance minimum
- Keyboard navigable for all features
- Screen reader support (aria labels, semantic HTML)
- Focus management in modals and forms
- Color contrast ratio ≥ 4.5:1

### Compatibility

- Browsers: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- Mobile: Responsive design down to 320px viewport
- Subdirectory deployment: Must respect `window.init.urlRoot` for all API calls
- Plugin backward compatibility: Existing server-rendered plugin pages must still work via iframe or separate tab

---

## 6. Success Metrics

| Metric | Baseline (Current) | Target (New SPA) |
|--------|-------------------|-------------------|
| Lighthouse Performance | ~55 (core theme) | ≥ 90 |
| Lighthouse Accessibility | ~70 | ≥ 95 |
| Page load time (challenge board) | ~3.5s | < 1.5s |
| Time-to-submit-flag (UX) | ~2s (page reload) | < 300ms (AJAX) |
| Admin page load time | ~4s | < 2s |
| JavaScript bundle size | ~800 KB (Bootstrap + jQuery + Vue) | < 250 KB gzipped |
| Number of frontend codebases | 3 themes | 1 unified SPA |
| Developer onboarding time | ~2 weeks | ~3 days |
| Test coverage (frontend) | ~0% | ≥ 80% |

---

## 7. Scope

### 7.1 In Scope

- Full rewrite of core (public) theme as React SPA
- Full rewrite of admin theme as React SPA
- Shared component library (shadcn/ui + custom CTFd components)
- Plugin extensibility via component registry
- Dark mode support
- Responsive design (mobile-first)
- i18n support via react-intl or similar
- API client SDK integration with `@ctfdio/ctfd-js`
- Automated testing (unit + integration + E2E)

### 7.2 Out of Scope

- Backend API changes (Flask API remains unchanged)
- Database schema changes
- Plugin backend changes
- Replacement of SSE transport (keep existing `GET /events`)
- Removal of legacy themes (they continue to work in parallel)
- Mobile native apps
- Third-party OAuth provider changes

### 7.3 Constraints

- Must work alongside existing Jinja2 themes during transition
- Must preserve all existing API contracts
- Must work with subdirectory deployments (script_root)
- Must use `window.init` data injection for initial state
- Must not introduce new runtime dependencies on the Flask side
- CI must continue passing with existing test suite

---

## 8. Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Foundation | Weeks 1–3 | Project scaffolding, Vite + React + shadcn/ui setup, API client, routing, auth, dark mode |
| Phase 1 (MVP Public) | Weeks 4–8 | Challenge board, scoreboard, user/team profile, notifications, static pages |
| Phase 2 (Admin Panel) | Weeks 9–14 | All admin CRUD pages, config panels, statistics, import/export |
| Phase 3 (Plugin System) | Weeks 15–16 | Plugin component registry, SDK docs, backward compatibility testing |
| Stabilization | Weeks 17–18 | E2E testing, a11y audit, performance tuning, bug fixes, documentation |

---

## 9. Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Plugin breakage during transition | High | High | Phase plugin support early; document migration path; keep legacy themes |
| Scope creep beyond SPA rewrite | Medium | Medium | Strictly enforce "out of scope"; use feature flags |
| SSR/SEO limitations of SPA | Low | Medium | Public pages (scoreboard, challenges) can be pre-rendered; use `react-helmet` for meta tags |
| `@ctfdio/ctfd-js` SDK incompatibility | Medium | High | Audit all API call sites; contribute fixes upstream; use raw `fetch` as fallback |
| Developer unfamiliarity with shadcn/ui | Low | Medium | Documentation, component workshops, reference implementation |
| Performance with 1000s of concurrent users | Low | Medium | Lazy loading, pagination, virtual scrolling for scoreboard, API caching |
