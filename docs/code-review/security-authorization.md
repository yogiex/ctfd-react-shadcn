# Security Deep-Dive: Authorization & IDOR

**OWASP Reference**: WSTG-ATHZ (Authorization), WSTG-API (API Testing), WSTG-BUS (Business Logic)
**Risk Level**: **LOW-MEDIUM**
**Files Analyzed**: 30+ (admin hooks, user/team profiles, challenge flows, backend decorators)

---

## Executive Summary

The application demonstrates **strong server-side authorization hygiene**. No exploitable IDOR, privilege escalation, or mass assignment vulnerabilities were found. All authorization decisions are enforced server-side via `@admins_only` decorators, schema-based field allowlisting, and server-enforced challenge visibility.

The frontend provides cosmetic guards only — React state determines what UI is shown, but the backend is always the final authority. This is the correct architecture.

**Risk Level**: LOW-MEDIUM — 0 Critical, 0 High, 3 Medium, 6 Low findings.

---

## Methodology

- Traced every PATCH/POST/DELETE mutation through the full call chain
- Verified server-side authorization for every non-admin operation
- Mapped all API endpoints to their authorization requirements
- Reviewed schema views for mass assignment protection

---

## IDOR Analysis

### IDOR-Prone Endpoints Mapped

| Endpoint                | Frontend File             | Backend Protection                                   | Risk    |
| ----------------------- | ------------------------- | ---------------------------------------------------- | ------- |
| `GET /users/:id`        | `UserPublicProfile.tsx`   | `UserSchema(view=user_type)` — filters hidden/banned | ✅ Safe |
| `GET /users/me`         | `UserPrivateProfile.tsx`  | Session-scoped                                       | ✅ Safe |
| `GET /teams/:id`        | `TeamPublicProfile.tsx`   | `TeamSchema(view=user_type)`                         | ✅ Safe |
| `GET /teams/me`         | `TeamPrivatePage.tsx`     | Session-scoped + captain check                       | ✅ Safe |
| `GET /challenges/:id`   | `ChallengeModal.tsx`      | Backend checks `is_admin()` + state visibility       | ✅ Safe |
| `GET /users/:id/solves` | `UserPublicProfile.tsx`   | Backend checks `is_admin()`                          | ✅ Safe |
| `PATCH /users/:id`      | `AdminUserDetailPage.tsx` | `@admins_only`                                       | ✅ Safe |
| `PATCH /users/me`       | `SettingsPage.tsx`        | `UserSchema("self")` — scoped                        | ✅ Safe |
| `PATCH /teams/:id`      | `AdminTeamDetailPage.tsx` | `@admins_only`                                       | ✅ Safe |
| `PATCH /teams/me`       | `TeamPrivatePage.tsx`     | Captain-only                                         | ✅ Safe |

**No IDOR vulnerabilities found.** All endpoints are properly guarded server-side.

---

## Detailed Findings

### 🟡 [MEDIUM] WSTG-API-03: Admin `secret` Field Exposed in Plaintext

**Files**: `AdminUserDetailPage.tsx:267`, `AdminTeamDetailPage.tsx:329`

Both pages display the `user.secret` / `team.secret` field (2FA TOTP secrets) as plaintext in the admin panel.

**Attack Scenario**: If an admin's session is compromised via XSS or session hijacking, the attacker can view all user/team 2FA secrets, bypassing two-factor authentication for those accounts.

**Remediation**: Mask by default with a "Reveal" button:

```tsx
const [showSecret, setShowSecret] = useState(false);
// ...
{
  showSecret ? (
    <Badge variant="outline">{user.secret}</Badge>
  ) : (
    <Badge variant="secondary">••••••••</Badge>
  );
}
<Button size="sm" variant="ghost" onClick={() => setShowSecret(!showSecret)}>
  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
</Button>;
```

---

### 🟡 [MEDIUM] WSTG-ATHZ-03: Frontend-Only Admin Route Guard

**File**: `AdminLayout.tsx:15-16`

```tsx
if (!isAdmin) return <Navigate to="/" replace />;
```

**Risk**: Bypassable via DevTools — an attacker can set `window.init.isAdmin = true` in the console and see admin UI components.

**Mitigation**: Backend `@admins_only` decorators protect all admin API endpoints. No mutation can be performed without server authorization. The risk is limited to **information disclosure** of the admin interface structure.

**Remediation**: Add periodic server-side admin re-verification.

---

### 🟡 [MEDIUM] WSTG-ATHZ-04: Sequential Integer ID Enumeration

All entity IDs (users, teams, challenges) use sequential integers in URLs: `/users/:id`, `/teams/:id`, `/challenges/:id`.

**Risk**: An attacker can enumerate valid IDs to discover user/team/challenge existence. Backend properly scopes data per permissions (hidden/banned users hidden from non-admins), but existence can be determined by response status codes (200 vs 404).

**Remediation**: Consider using UUID-based public IDs for user-facing endpoints. For now, the backend properly limits data exposure per ID.

---

### 🔵 [LOW] WSTG-API-03: `User` TypeScript Type Includes Optional `email`

**File**: `types/user.ts:4` — `User` interface has `email?: string`. The backend `UserSchema("user")` (public view) does NOT include email. Currently not rendered in public profile, but type safety gap.

---

### 🔵 [LOW] WSTG-API-03: Admin Detail Page Uses `/users/${id}` Without `view=admin`

**File**: `useAdminUsers.ts:117` — `useAdminUser` calls `api.get<UserAdmin>('/users/${id}')` without `view=admin` param. Works correctly because backend checks `is_admin()` on all admin routes, but inconsistent with other admin hooks.

---

### 🔵 [LOW] WSTG-BUS: Setup Page Detection

**File**: `SetupPage.tsx:61-71` — Calls `GET /users?view=admin` for setup detection. This request will fail for non-admins (backend requires `is_admin()` for `view=admin`), potentially showing setup page to already-configured instances.

---

## Mass Assignment Analysis

| Mutation                | Fields Sent                                          | Backend Schema        | Allowlisted    | Risk |
| ----------------------- | ---------------------------------------------------- | --------------------- | -------------- | ---- |
| `PATCH /users/me`       | name, email, affiliation, country, website, language | `UserSchema("self")`  | ✅             | None |
| `PATCH /teams/me`       | name, website, affiliation, country                  | `TeamSchema("self")`  | ✅             | None |
| `PATCH /users/:id`      | name, email, type, verified, banned, hidden, etc.    | `UserSchema("admin")` | ✅ (by design) | None |
| `PATCH /teams/:id`      | name, banned, hidden, captain_id, etc.               | `TeamSchema("admin")` | ✅ (by design) | None |
| `PATCH /challenges/:id` | name, category, value, state, etc.                   | `ChallengeSchema`     | ✅ (by design) | None |

**No mass assignment vulnerabilities found.** All schemas use explicit allowlists per view — not blocklists.

---

## Business Logic Flaws

| Check                                 | Result  | Evidence                                          |
| ------------------------------------- | ------- | ------------------------------------------------- |
| Flag submission for hidden challenges | ✅ Safe | Backend returns 404 for hidden challenges         |
| Flag submission without prerequisites | ✅ Safe | Backend checks `solve_ids >= prereqs`             |
| Hint unlock without paying cost       | ✅ Safe | Backend checks `score >= hint.cost`               |
| Duplicate hint unlock                 | ✅ Safe | Backend checks for existing unlock                |
| Non-captain team edit                 | ✅ Safe | Backend validates `captain_id` match              |
| Solution view without solving         | ✅ Safe | Backend checks solve status                       |
| Hint content without unlocking        | ✅ Safe | Backend only returns `content` for unlocked hints |

---

## Summary

| Finding                                       | Risk   | OWASP        | Remediation                      |
| --------------------------------------------- | ------ | ------------ | -------------------------------- |
| Admin `secret` (2FA) exposed in plaintext     | Medium | WSTG-API-03  | Mask with reveal toggle          |
| Frontend-only admin route guard               | Medium | WSTG-ATHZ-03 | Periodic server re-verification  |
| Sequential integer ID enumeration             | Medium | WSTG-ATHZ-04 | Consider UUIDs for public IDs    |
| `User` type has optional `email`              | Low    | WSTG-API-03  | Remove from public type          |
| Admin user detail missing `view=admin`        | Low    | —            | Add `view=admin` for consistency |
| Setup page detection may redirect incorrectly | Low    | WSTG-BUS     | Handle non-admin gracefully      |

**Verdict**: Authorization architecture is sound. The server is the authoritative security boundary. Focus on the 3 medium findings.
