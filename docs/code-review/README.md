# CTFd Frontend Refactoring — Code Review Report

> **Date**: 2026-07-08
> **Scope**: Full code review of `CTFd/frontend/` (React 18 + TypeScript + shadcn/ui)
> **Reviewers**: 4 parallel subagents covering Foundation/Auth, Challenges/Scoreboard, Admin Core, Admin Config/Data
> **Total files reviewed**: ~120+

---

## Executive Summary

The CTFd frontend refactoring has made substantial progress. The codebase demonstrates strong understanding of React Query patterns, proper shadcn/ui usage, and correct CTFd API integration. However, **15 critical issues, 40+ important issues, and numerous minor issues** were identified across the codebase.

### Overall Quality: **Fair**

### Critical Issues by Area

| Area | Critical Count | Key Problems |
|------|---------------|--------------|
| Foundation + Auth | 2 | Broken email confirmation, missing XSS sanitization |
| Challenges + Scoreboard | 5 | Stale challenge detail post-submission, raw `fetch` in UsersListPage, missing React Query in user profiles, unsanitized HintPanel, unloaded challenge scripts |
| Admin Core | 3 | Query key collision in `useChallengeTypes`, broken `AdminTopicManager`, raw `fetch` in `AdminResetPage` |
| Admin Config/Data | 5 | Logo upload stores base64, missing CSRF on raw `fetch` calls, stale dialog form state, `as any` type assertions, team pages lack React Query |
| **Total** | **15** | |

### Important Issues by Area

| Area | Important Count |
|------|-----------------|
| Foundation + Auth | 8 |
| Challenges + Scoreboard | 10 |
| Admin Core | 7 |
| Admin Config/Data | 7 |
| **Total** | **32** |

---

## Readiness Assessment

| Criterion | Verdict |
|-----------|---------|
| **Ready for production?** | ❌ No |
| **Ready for staging/QA?** | ❌ No (blocked by 15 critical issues) |
| **Good architectural foundation?** | ✅ Yes |
| **Consistent code patterns?** | ⚠️ Mixed — React Query in some places, raw fetch in others |
| **Test coverage adequate?** | ❌ No (only 3 tests in total) |

---

## Top 10 Most Critical Fixes

1. **`ConfirmPage` returns null when token present** — Email confirmation completely broken
2. **`StaticPage` uses `dangerouslySetInnerHTML` without DOMPurify** — Stored XSS
3. **`useSubmitFlag` doesn't invalidate challenge detail** — Stale `solved_by_me` in modal
4. **`UsersListPage` uses raw `fetch()`** — Contagious anti-pattern bypassing API client
5. **`HintPanel` uses `dangerouslySetInnerHTML` without DOMPurify** — Stored XSS vector
6. **User/Profile pages use `useEffect`+`useState` instead of React Query** — No caching
7. **`AdminTopicManager` hardcoded `topic_id: 0`** — Topic creation always fails
8. **`useChallengeTypes` query key collision** — Silent data corruption
9. **`AdminResetPage` bypasses API client** — Inconsistent CSRF/error handling
10. **`ConfigLogoTab` stores base64 in config** — Wrong endpoint, data corruption

---

## Report Structure

| Report File | Area Covered |
|-------------|-------------|
| [foundation-auth.md](foundation-auth.md) | Core infrastructure, routing, layouts, contexts, auth pages, static pages |
| [challenges-scoreboard.md](challenges-scoreboard.md) | Challenge board, modals, flag submission, hints, scoreboard, user/team profiles |
| [admin-core.md](admin-core.md) | Admin layout, dashboard, challenges CRUD, pages CMS, notifications, plugin system |
| [admin-config-data.md](admin-config-data.md) | Config tabs, admin users/teams/submissions, team feature pages |

---

## Stats Summary

| Metric | Value |
|--------|-------|
| Total source files | ~70+ (.tsx/.ts) |
| Features | 10 |
| Admin sub-areas | 10 |
| Config tabs | 20 |
| Total hooks | ~60 |
| shadcn/ui components | 28 |
| Test files | 1 (3 tests) |
| TypeScript strict mode | ✅ Enabled |
| React Query used | ✅ In most features |
| React Hook Form + Zod | ✅ In use |
| CSRF handling | ✅ Auto-injected by API client |
| Dark mode | ✅ Supported via CSS variables |
| i18n | ❌ Stub only, not configured |
| Bundle splitting | ✅ Lazy-loaded routes |
