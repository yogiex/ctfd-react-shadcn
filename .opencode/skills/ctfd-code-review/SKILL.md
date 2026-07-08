---
name: ctfd-code-review
description: |
  Dispatch code review subagents for CTFd refactoring work. Checks React/TypeScript quality,
  shadcn/ui conventions, backend API compatibility, and migration plan compliance.
---

# CTFd Code Review

Dispatch a code reviewer subagent to catch issues before they cascade into the
CTFd codebase. The reviewer gets focused context — never your session history.

**Core principle:** In CTFd refactoring, review means: does the new React code
match or exceed the old Jinja2/Alpine/Vue behavior? Does it maintain backward
compatibility with the Flask API?

## When to Request Review

**Mandatory:**
- After completing each migrated page/component
- Before changing any API endpoint response format
- Before merging to main
- Before removing old Jinja2 templates

**Optional but valuable:**
- When stuck on a React/shadcn pattern
- Before refactoring existing React code
- After fixing a complex migration bug

## How to Request

### 1. Get git SHAs
```bash
BASE_SHA=$(git rev-parse origin/main)
HEAD_SHA=$(git rev-parse HEAD)
```

### 2. Dispatch code reviewer subagent

Use the `general` subagent with the template at [code-reviewer.md](code-reviewer.md),
filling placeholders with the specific CTFd context.

### 3. Act on feedback
- Fix Critical issues immediately (broken functionality, security, API breakage)
- Fix Important issues before proceeding (React anti-patterns, missing states, style violations)
- Note Minor issues for later (optimization, naming)
- Push back if reviewer is wrong (with technical reasoning)

## CTFd-Specific Review Focus

When requesting review, include these CTFd-specific checks:

### API Compatibility
- Does the new React code use existing API endpoints? (No new endpoints)
- Are API responses still parsed correctly? (Response envelope: `{ success, data, errors }`)
- Is CSRF-Token header sent on all non-GET requests?
- Do error states match backend error responses?

### UI Parity
- Does the React version handle every state the old template did?
  (loading, empty, error, success, rate-limited, frozen)
- Are all form fields preserved? (including extra/custom fields)
- Are permission checks correct? (unauthed, authed, admin)
- Is dark mode handled?

### React/shadcn Conventions
- TypeScript strict mode? (no `any`, no implicit `any`)
- React Query for all API data? (not `useEffect` + `fetch`)
- shadcn/ui components? (not custom HTML elements)
- `lucide-react` icons? (not Font Awesome)
- Tailwind classes? (not SCSS, not inline styles)
- `cn()` for conditional classes? (not template literals)

### Migration Compliance
- Is the old Jinja2 template still in place? (Don't delete until verified)
- Is the Flask route updated to serve the React SPA?
- Are `window.INITIAL_DATA` fields preserved?
- Are plugin templates still loading correctly?

## CTFd Issue Severity Guide

| Severity | Example | Action |
|----------|---------|--------|
| **Critical** | API call fails, CSRF missing, data loss, security hole | Fix immediately |
| **Important** | Missing empty state, wrong component for use case, missing loading state, wrong shadcn variant | Fix before proceeding |
| **Minor** | Variable naming, missing comment, unused import, minor spacing | Note for later |

## Example

```
[Just finished ChallengeBoardPage in React]

You: Requesting code review before removing old challenges.html.

BASE_SHA=$(git log --oneline | grep "challenges" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Subagent returns]:
  Strengths:
    - All API calls through React Query with proper cache invalidation
    - Loading/error/empty states all handled
    - Dark mode works through shadcn CSS variables

  Issues:
    Critical: None
    Important:
      - Flag submission form missing rate-limited state countdown
      - Challenge modal not closing on Escape
    Minor:
      - ChallengeCard uses inline Tailwind instead of cn() utility

  Assessment: Ready with fixes

You: [Add rate-limited countdown, fix Escape handler]
```

## Integration with CTFd Workflows

- **Per-page migration**: Review after each page is migrated to React
- **Admin panel migration**: Review after each admin tab/section
- **Before cleanup**: Review before removing old Jinja2/Vue files
- **Plugin changes**: Review before modifying plugin template loading
