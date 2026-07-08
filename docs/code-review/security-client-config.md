# Security Deep-Dive: Client-Side & Configuration

**OWASP Reference**: WSTG-CONF (Configuration), WSTG-CLNT (Client-Side), WSTG-ERR (Error Handling), WSTG-CRYP (Cryptography)
**Risk Level**: **CRITICAL**
**Files Analyzed**: 20+ (vite.config, index.html, globals.css, backend init, config tabs, package.json, backend security middleware)

---

## Executive Summary

This is the **highest-risk area** of the security review. The Flask backend sets only **1 of 7 standard security headers** (`Cross-Origin-Opener-Policy`), making the application vulnerable to clickjacking, MIME confusion, and referer leakage. There is **no Content Security Policy** anywhere — every XSS finding is immediately exploitable with zero defense-in-depth. The SPA itself is reasonably well-architected (no secrets in storage, all external links protected), but the missing server-side security headers create systemic risk.

**Risk Level**: CRITICAL — 2 Critical, 4 High, 3 Medium, 2 Low findings.

---

## Security Headers Audit

| Header | Status | Current Value | Impact if Missing |
|--------|--------|--------------|-------------------|
| `Cross-Origin-Opener-Policy` | ✅ Present | `same-origin-allow-popups` | — |
| `Content-Security-Policy` | ❌ **MISSING** | — | All XSS findings exploitable |
| `X-Frame-Options` | ❌ **MISSING** | — | Clickjacking |
| `Strict-Transport-Security` | ❌ **MISSING** | — | MITM downgrade |
| `X-Content-Type-Options` | ❌ **MISSING** | — | MIME confusion |
| `Referrer-Policy` | ❌ **MISSING** | — | Referer leakage |
| `Permissions-Policy` | ❌ **MISSING** | — | Feature abuse |

**Only 1 of 7 recommended headers is set.**

### Where to Fix

**File**: `CTFd/utils/initialization/__init__.py:403-408`

Current code:
```python
@bp.after_request
def after_request(response):
    response.headers["Cross-Origin-Opener-Policy"] = app.config.get("CROSS_ORIGIN_OPENER_POLICY", "same-origin-allow-popups")
    return response
```

Remediation:
```python
@bp.after_request
def after_request(response):
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data:; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'; "
        "connect-src 'self' ws:; "
    )
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response
```

---

## Detailed Findings

### 🔴 [CRITICAL] WSTG-CONF-12: No Content Security Policy

**File**: `CTFd/utils/initialization/__init__.py` (no CSP header set)
**Also**: `frontend/index.html` (no `<meta http-equiv="Content-Security-Policy">`)

**Impact**: Every XSS finding is fully exploitable with zero browser-level protection. Without `script-src`, inline scripts execute freely. Without `frame-ancestors`, the page can be framed for clickjacking.

**Attack Scenario**:
1. An attacker exploits the stored XSS in StaticPage or HintPanel
2. Injected script executes — no CSP to block it
3. Full impact: session hijacking, credential theft, defacement

**Remediation**: Add CSP header (see Security Headers Audit above).

---

### 🔴 [CRITICAL] WSTG-CLNT-09: No Clickjacking Protection

**File**: `CTFd/utils/initialization/__init__.py:403-408`
**Attack Scenario**:
1. Attacker creates `https://attacker.com/evil.html` with an invisible `<iframe>` to CTFd
2. Tricks authenticated admin into clicking on the iframe
3. Admin unknowingly clicks "Reset CTF" or "Delete Users"

**Remediation**: Add `X-Frame-Options: DENY` and `CSP: frame-ancestors 'none'`.

---

### 🟠 [HIGH] WSTG-CONF-07/WSTG-CONF-14: Missing HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

**Files**: `CTFd/utils/initialization/__init__.py`, `CTFd/config.py`

**Individual Risks**:
- **No HSTS**: Attacker with network access can downgrade HTTPS to HTTP (MITM)
- **No X-Content-Type-Options**: Browser may MIME-sniff, executing `.txt` files as JS
- **No Referrer-Policy**: Password reset token in URL may leak via Referer header
- **No Permissions-Policy**: Any embedded feature (camera, mic, geo) can be abused

**Remediation**: Add all headers (see Security Headers Audit).

---

### 🟠 [HIGH] WSTG-CRYP-03: Hardcoded Default Admin Credentials

**File**: `frontend/src/features/setup/pages/SetupPage.tsx:47`
```tsx
defaultValues: { name: 'admin', email: 'admin@ctfd.local', password: 'admin123' },
```

**Attack Scenario**:
1. Attacker discovers a fresh CTFd instance (before legitimate admin completes setup)
2. Knows default credentials: `admin` / `admin123`
3. Completes setup as the admin

**Why HIGH**: These defaults are visible in the production JS bundle (minified but discoverable).

**Remediation**:
```tsx
defaultValues: { name: '', email: '', password: '' },
```

---

### 🟠 [HIGH] WSTG-CLNT-04: Open Redirect via `urlRoot`

**File**: `frontend/src/contexts/AuthContext.tsx:59`
```tsx
window.location.href = `${data.urlRoot || ''}/logout`
```

**Attack Scenario**:
1. Attacker compromises `/init-data` endpoint (or misconfigured proxy modifies response)
2. Sets `urlRoot` to `https://evil.com`
3. User clicks logout → redirected to `https://evil.com/logout` (phishing page)

**Remediation**:
```tsx
const urlRoot = data.urlRoot
if (urlRoot && !/^\/[a-zA-Z0-9/_-]*$/.test(urlRoot)) {
  window.location.href = '/logout'  // absolute fallback
}
```

---

### 🟡 [MEDIUM] WSTG-ERR-01: Verbose Error Parser in Login

**File**: `frontend/src/features/auth/hooks/useLogin.ts:43-48`
```tsx
const errorMatch = html.match(
    /<div class="alert alert-danger"[^>]*>([\s\S]*?)<\/div>/
)
```

**Risk**: Scrapes raw HTML error responses. If Flask debug mode is enabled (`DEBUG=True`), stack traces may be returned and rendered to users.

---

### 🟡 [MEDIUM] WSTG-CONF-12: No CSP, CSRF Nonce Useless for XSS

**File**: `frontend/src/lib/api/client.ts:47-52`
**Analysis**: The CSRF nonce in `window.INITIAL_DATA.csrfNonce` is designed to work with CSP's `nonce-*` directive. Without CSP, the nonce provides zero XSS protection. An attacker who finds XSS can read the nonce from JavaScript and forge CSRF requests.

---

### 🟡 [MEDIUM] WSTG-CRYP-03: CSRF Nonce Stored in JS Memory

**File**: `frontend/src/lib/api/client.ts:21-22`
**Risk**: The nonce is stored in a module-level `initDataCache` variable. Any XSS can read it: `fetch('/init-data').then(r => r.json()).then(d => d.csrfNonce)` or simply access the cache through the exported `getCsrfNonce()` function.

---

### 🔵 [LOW] Browser Storage Analysis — No Secrets Leaked

| Storage | Key | Value | Sensitive? |
|---------|-----|-------|------------|
| localStorage | `ctfd-theme` | `"light"` / `"dark"` | ❌ No |

**No sensitive data stored in localStorage or sessionStorage.** This is correctly implemented.

---

### 🔵 [LOW] Reverse Tabnabbing — All External Links Protected

All 7 files with `target="_blank"` correctly include `rel="noopener noreferrer"`. No vulnerability.

### 🔵 [LOW] Dependency Health — All Current

All 40+ runtime dependencies are from 2024 Q2-Q3. No known high-severity CVEs in the dependency tree.

---

## Summary

| Finding | Risk | OWASP | Remediation | Effort |
|---------|------|-------|-------------|--------|
| No Content Security Policy | **Critical** | WSTG-CONF-12 | Add CSP header to Flask | 30 min |
| No Clickjacking Protection | **Critical** | WSTG-CLNT-09 | Add `X-Frame-Options: DENY` + `frame-ancestors` | 5 min |
| Missing HSTS, X-CT-O, Referrer-Policy, Permissions-Policy | **High** | WSTG-CONF-07/14 | Add all standard security headers | 30 min |
| Hardcoded default admin credentials | **High** | WSTG-CRYP-03 | Remove from setup defaults | 5 min |
| Open redirect via `urlRoot` | **High** | WSTG-CLNT-04 | Validate `urlRoot` protocol | 30 min |
| Verbose error parser in login | **Medium** | WSTG-ERR-01 | Use JSON error responses | 1 hr |
| CSP nonce provides no XSS protection without CSP | **Medium** | WSTG-CONF-12 | Add CSP (same as #1) | — |
| CSRF nonce readable via JS memory | **Medium** | WSTG-CRYP-03 | Rotate nonce (see auth report) | 2 hr |
| No secrets in browser storage | Low | WSTG-CLNT-12 | 🟢 Already correct | — |
| External links protected | Low | WSTG-CLNT-14 | 🟢 Already correct | — |
| Dependencies current | Low | — | 🟢 Already correct | — |

---

## Critical Path to Production

**Immediate blockers (fix before any production deployment):**

1. **Add CSP header** — eliminates impact of all XSS findings
2. **Add X-Frame-Options** — prevents clickjacking
3. **Fix StaticPage + HintPanel XSS** — closes the injection vectors
4. **Add HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy** — defense-in-depth
5. **Remove hardcoded default admin credentials** — prevents setup hijacking
