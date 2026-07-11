# Code Review: Foundation + Auth + Routing

**Files reviewed**: 28 (core infrastructure, layouts, contexts, API client, auth pages, setup, static pages, error boundary)

---

## Strengths

- **API client (`lib/api/client.ts`)** — Well-designed with proper CSRF header injection, response envelope parsing, `ApiError` class, `redirect: 'manual'` for auth redirects, and `preloadInitData()` with caching/promise deduplication.
- **TypeScript strict mode** enabled (`tsconfig.json:14`) with `noUnusedLocals` and `noUnusedParameters`.
- **shadcn/ui usage** — All UI components use proper shadcn imports (`Button`, `Card`, `Input`, `Alert`, etc.).
- **ErrorBoundary** — Thoughtfully wrapped at both App level and per-layout level in the router.
- **Dark mode** — CSS variables are complete and well-contrasted (`globals.css:33-57`): all 12 semantic tokens have distinct dark values.
- **Auth gate guarding** (`App.tsx:27`) — `AuthProvider` never mounts before init data resolves via `ready` state, preventing race conditions.
- **NotificationsPage** covers all three states: loading (skeleton), error (Alert), and empty (Card with icon + message).

---

## Critical Issues

### 1. `ConfirmPage` renders blank page when token present — email confirmation broken

**File**: `ConfirmPage.tsx:12-14`

```tsx
if (token) {
  return null; // User sees a blank white page
}
```

**What's wrong**: When a user clicks the email confirmation link (`/confirm/abc123`), the component immediately returns `null` without making any API call. The confirmation token is never sent to the backend.

**Why it matters**: Users cannot confirm their email. If `EMAIL_CONFIRMATIONS` is enabled, users are stuck with unverified accounts and cannot access challenges.

**Fix**: Either do a full-page redirect to the server endpoint:

```tsx
if (token) {
  window.location.href = `/confirm/${token}`;
  return (
    <div className="flex items-center justify-center min-h-screen">
      Confirming...
    </div>
  );
}
```

Or implement the confirmation via form POST with proper loading/error/success states.

### 2. `dangerouslySetInnerHTML` without sanitization — stored XSS

**File**: `StaticPage.tsx:88`

```tsx
<div dangerouslySetInnerHTML={{ __html: page.content }} />
```

**What's wrong**: `dompurify` is already in `package.json` but is not imported or used. If an admin account is compromised, injected JavaScript executes without sanitization.

**Why it matters**: Stored XSS can steal session cookies, perform actions as the admin, or deface the CTF platform.

**Fix**:

```tsx
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }} />;
```

---

## Important Issues

### 3. Auth hooks bypass React Query, use form-scraping anti-pattern

**Files**: `useLogin.ts:28-48`, `useRegister.ts:30-51`, `useConfirm.ts:21-43`, `useResetPassword.ts:25-49,61-83`

**Problem**: All four auth hooks use raw `fetch()` to form-based endpoints with `application/x-www-form-urlencoded`, detect success via `302`/`opaqueredirect`, and parse errors via regex on HTML (`/<div class="alert alert-danger"[^>]*>/`).

**Why it matters**: HTML error scraping is brittle. `useLogin` does `window.location.href = '/challenges'` causing full page reload, defeating SPA benefits. Inconsistent with every other data access pattern.

### 4. `useLogin` exposes `clearError` but `LoginPage` never calls it

**File**: `LoginPage.tsx` — destructures only `{ isLoading, error, login }`. Error persists even if user starts typing corrections.

### 5. `NotificationsPage` uses `useEffect` + `useState` instead of React Query

**File**: `NotificationsPage.tsx:17-37`

Manual polling via `setInterval(30000)`. No caching, no retry, no stale-while-revalidate. Same issue in `StaticPage.tsx:24-40`.

### 6. `isAdmin` detection is fragile; `InitialData` type is incomplete

**File**: `AuthContext.tsx:52`, `types/api.ts:1-14`

```tsx
isAdmin: Boolean((window as any).init?.isAdmin || getInitData().isAdmin),
```

- `(window as any).init` — does NOT exist in the SPA (dead code)
- `InitialData` type does NOT include `isAdmin` — works only because `getInitData()` returns `Record<string, any>`

### 7. Auth pages have inconsistent layout wrappers

**Files**: `ResetPasswordPage.tsx`, `ConfirmPage.tsx`

`LoginPage` and `RegisterPage` use `<AuthLayout>` (branded two-column). Reset/Confirm use raw `<Card>` without branding — jarring inconsistency.

### 8. Raw HTML `<select>` in SetupPage instead of shadcn `Select`

**File**: `SetupPage.tsx:248-255`

Inline-styled `<select>` instead of shadcn `Select` component. Drifts from conventions, especially for dark mode and accessibility.

### 9. ThemeContext doesn't react to OS theme changes

**File**: `ThemeContext.tsx` — checks `prefers-color-scheme` on mount but no `change` event listener.

### 10. React Toast hook stale closure

**File**: `hooks/use-toast.ts:177-185` — `[state]` in useEffect deps causes re-subscribe on every toast update. Should be `[]`.

---

## Minor Issues

### 11. Hardcoded `en-US` locale in `formatDate`

**File**: `lib/utils.ts:9` — Should use `navigator.language`.

### 12. Dead code: `CTFD_VERSION` in `main.tsx:6`

Declared but never referenced.

### 13. `(window as any).INITIAL_DATA` dead code in SPA

**Files**: `AuthContext.tsx:30-31`, `lib/api/client.ts:48-49,55-57` — SPA serves its own `index.html` without Jinja2 injection.

### 14. `SetupPage` returns `null` instead of `<Navigate>` redirect

**File**: `SetupPage.tsx:85-87` — Causes flash of white content before useEffect fires.

### 15. `@tailwindcss/typography` missing from `package.json`

`StaticPage.tsx:87` uses `prose prose-neutral dark:prose-invert` classes. Plugin not listed in `package.json`.

### 16. `useResetPassword` returns unused `step` field

**File**: `useResetPassword.ts:12` — tracked in state but never read by `ResetPasswordPage`.

---

## Assessment

| Criterion            | Result |
| -------------------- | ------ |
| **Quality rating**   | Fair   |
| **Critical issues**  | 2      |
| **Important issues** | 8      |
| **Minor issues**     | 6      |
| **Ready to merge?**  | **No** |

**Key recommendations**:

1. Fix `ConfirmPage` email confirmation flow (critical)
2. Add DOMPurify sanitization to `StaticPage` (critical)
3. Migrate auth hooks and data-fetching pages to React Query conventions
4. Complete the `InitialData` type and remove dead `window.init` references
5. Wrap all auth pages in consistent `<AuthLayout>`
