# Security Deep-Dive: Authentication & Session Management

**OWASP Reference**: WSTG-ATHN (Authentication), WSTG-SESN (Session Management), WSTG-CRYP (Cryptography)
**Risk Level**: **HIGH**
**Files Analyzed**: 20+ (auth hooks, AuthContext, API client, route guards, backend auth handlers)

---

## Methodology

- Traced every mutation call from React component → API client → Flask handler
- Mapped CSRF coverage across 60+ API calls
- Analyzed route guard bypass potential
- Reviewed session lifecycle (login → request → logout)
- Audited password reset flow, API token management

---

## Detailed Findings

### 🔴 [CRITICAL] WSTG-SESN-05: Static CSRF Nonce — Never Rotated Per Session

**File**: `CTFd/utils/security/auth.py:17`, `CTFd/utils/initialization/__init__.py:391-401`
**Frontend**: `frontend/src/lib/api/client.ts:47-52`

**Backend**:
```python
# initialization/__init__.py:391
if not session.get("nonce"):        # Only set ONCE per session
    session["nonce"] = generate_nonce()

# auth.py:17 — nonce regenerated on login
def login_user(user):
    session["id"] = user.id
    session["nonce"] = generate_nonce()
```

**Frontend**:
```typescript
let initDataCache: Record<string, any> | null = null

export function getCsrfNonce(): string {
  if ((window as any).INITIAL_DATA?.csrfNonce) {  // read ONCE at page load
    return (window as any).INITIAL_DATA.csrfNonce
  }
  return initDataCache?.csrfNonce ?? ''            // or from cache, never refreshed
}
```

**Attack Scenario**:
1. Attacker obtains CSRF nonce via XSS, network sniffing, or session hijacking
2. For any subsequent request in the same session, the nonce remains valid
3. Attacker can forge any state-changing request (flag submission, profile change, etc.)

**Why Critical**: A single nonce leak compromises the entire session. Combined with the two stored XSS findings in `security-xss-input.md`, this creates a complete compromise chain.

**Remediation**:
- **Option A (Best)**: Rotate nonce on every response — generate new nonce, set in response header, frontend reads and uses for next request
- **Option B (Good)**: Rotate nonce on every POST — after each mutation, re-fetch `/init-data` to get fresh nonce
- **Option C (Minimum)**: Invalidate `initDataCache` on logout and after login redirect

---

### 🟠 [HIGH] WSTG-ATHN-04: Client-Side Route Guards — Bypassable via DevTools

**File**: `frontend/src/features/admin/components/AdminLayout.tsx:15-16`
```tsx
if (!isAdmin) return <Navigate to="/" replace />
```

**Attack Scenario**:
1. User opens browser DevTools
2. Sets `window.init.isAdmin = true`
3. Navigates to `/admin/challenges`
4. `AuthContext.tsx:52` reads: `Boolean((window as any).init?.isAdmin || getInitData().isAdmin)`
5. User sees admin UI (though API calls are still server-protected by `@admins_only`)

**Impact**: Information disclosure — attacker sees admin interface structure, challenge names, user list structure. Cannot execute mutations (backend-protected), but can enumerate endpoints and see admin-only UI elements.

**Remediation**: 
- Periodically re-verify `isAdmin` from server (e.g., every 5 minutes via React Query `refetchInterval`)
- Check admin status before rendering admin components — not just at mount time

---

### 🟠 [HIGH] WSTG-SESN-06: `initDataCache` Never Refreshed After Login/Logout

**File**: `frontend/src/contexts/AuthContext.tsx:36-55`, `frontend/src/lib/api/client.ts:21-22`
```typescript
// AuthContext.tsx
const refresh = () => {
    const data = getInitialData()  // Returns STALE cached data, doesn't re-fetch
}

// client.ts
let initDataCache: Record<string, any> | null = null
```

**Attack Scenario**:
1. User logs in via `useLogin.ts:38` — does `window.location.href = '/challenges'`
2. Full page load triggers fresh `INITIAL_DATA` injection — works correctly
3. BUT: if login is handled via SPA (not full redirect), `initDataCache` still has pre-login data
4. If admin is demoted server-side while SPA is open, `isAdmin` stays `true` in client

**Impact**: Stale authentication state — user's session may be invalid but client still believes authenticated.

**Remediation**: Add a `forceRefresh` flag to `getInitialData()` that re-fetches from `/init-data`:
```typescript
export function getInitialData(forceRefresh = false) {
  if (forceRefresh || !initDataCache) {
    return preloadInitData()  // network fetch
  }
  return initDataCache
}
```

---

### 🟡 [MEDIUM] WSTG-SESN-03: No Session Expiry Detection in SPA

**File**: `frontend/src/lib/api/client.ts` — no global 401/403 interceptor

**Attack Scenario**: 
1. Server session expires (Redis TTL, server restart)
2. Client still shows authenticated UI
3. API calls fail silently or with unhandled errors
4. User continues interacting with "stale" interface — no redirect to login

**Remediation**: Add global interceptor in `api.request()`:
```typescript
if (response.status === 401 || response.status === 403) {
  const initData = await getInitData(true)  // force refresh
  if (!initData.userId) {
    window.location.href = '/login'
    throw new ApiError('Session expired', response.status)
  }
}
```

---

### 🟡 [MEDIUM] WSTG-SESN-06: Session Cache Entry Not Deleted on Logout

**File**: `CTFd/utils/security/auth.py:34-35`
```python
def logout_user():
    session.clear()  # clears session DATA but NOT the cache entry
```

**Impact**: Orphaned session cache entry. While the cleared session data means no authentication, the stale entry wastes cache space. With `CachingSessionInterface`, the key is `session:${session.sid}` which persists until TTL expiry (default: 31 days).

**Remediation**:
```python
def logout_user():
    cache.delete(f"session:{session.sid}")
    session.clear()
```

---

### 🟡 [MEDIUM] WSTG-ATHN-09: Password Reset Token in Browser URL History

**File**: `frontend/src/features/auth/pages/ResetPasswordPage.tsx:12`, `useResetPassword.ts:61`
```tsx
const { token } = useParams<{ token?: string }>()
// ...
await fetch(`${urlRoot}/auth/reset_password/${token}`, { method: 'POST', ... })
```

**Issue**: Reset token appears in URL path (browser history, server logs, Referer header). While POST is used, the token is still visible in URL.

**Remediation**: Ensure `Referrer-Policy: no-referrer` is set. Consider using POST body instead of URL path for the token.

---

### 🟡 [MEDIUM] WSTG-CRYP-03: API Tokens Never Shown to User

**File**: `frontend/src/features/users/pages/SettingsPage.tsx:62-68, 150-153`
```tsx
interface ApiToken { id, type, created, expiration, description }
// NO "value" field — token secret never exposed
const copyToken = (token: string) => navigator.clipboard.writeText(token)
// Called as: copyToken(String(token.id)) — copies token ID, not secret!
```

**Issue**: The copy button copies the token's numeric `id` (useless for auth) instead of the token value. The token creation UI is missing — tokens can never be used.

---

### 🟡 [MEDIUM] CSRF Nonce Sent Conditionally

**File**: `frontend/src/features/auth/hooks/useLogin.ts:26`
```tsx
if (csrfNonce) params.append('nonce', csrfNonce)
```

If `getCsrfNonce()` returns empty string (edge case), the nonce is silently skipped. The server will return 403, but the root cause is hidden.

---

### 🔵 [LOW] WSTG-CRYP-03: `isAdmin` Type Mismatch

**File**: `frontend/src/types/api.ts:1-14` — `InitialData` interface missing `isAdmin` field. Works at runtime because `getInitData()` returns `Record<string, any>`.

---

### 🔵 [LOW] WSTG-ATHN-01: Auth Hooks Use Raw `fetch()` With Form-URL Encoded

Auth hooks use `fetch()` with `application/x-www-form-urlencoded` instead of the centralized `api` client. No security issue with the encoding itself, but bypasses centralized error handling and redirect detection.

---

## CSRF Coverage Map

| Mutation Path | Client Method | CSRF Sent? | Backend Validates? |
|---|---|---|---|
| POST `/login` | raw `fetch()` | ✅ nonce in form | ✅ |
| POST `/auth/register` | raw `fetch()` | ✅ nonce in form | ✅ |
| POST `/auth/reset_password` | raw `fetch()` | ✅ nonce in form | ✅ |
| POST `/auth/confirm` | raw `fetch()` | ✅ nonce in form | ✅ |
| POST `/setup` | raw `fetch()` | ✅ nonce in form | ⚠️ Bypassed intentionally |
| POST `/admin/reset` | raw `fetch()` | ✅ CSRF-Token header | ✅ |
| 40+ `api.post/patch/put/delete` | `api.*()` | ✅ CSRF-Token header | ✅ |
| All GET requests | mixed | N/A (safe method) | — |

**No CSRF bypass found in any mutation path.** The only exception is `/setup` which is intentionally exempted.

---

## Summary

| Finding | Risk | OWASP | Remediation |
|---------|------|-------|-------------|
| Static CSRF nonce — never rotated | Critical | WSTG-SESN-05 | Rotate per-request or per-response |
| Client-side admin guard bypassable via DevTools | High | WSTG-ATHN-04 | Add periodic server re-verification |
| `initDataCache` never refreshed after login/logout | High | WSTG-SESN-06 | Add force-refresh parameter |
| No session expiry detection in SPA | Medium | WSTG-SESN-03 | Add 401/403 global interceptor |
| Session cache entry not deleted on logout | Medium | WSTG-SESN-06 | Add `cache.delete()` in logout |
| Password reset token in URL | Medium | WSTG-ATHN-09 | Referrer-Policy, POST body |
| API tokens never shown to user | Medium | WSTG-CRYP-03 | Add token creation UI |
| CSRF nonce conditional in login | Low | WSTG-SESN-05 | Always send nonce |
| `isAdmin` type mismatch | Low | — | Add `isAdmin` to `InitialData` |
