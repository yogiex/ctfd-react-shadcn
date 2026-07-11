# CTFd Frontend — Security Deep-Dive Report

> **Date**: 2026-07-08
> **Scope**: Full OWASP-based security code review of `CTFd/frontend/` (React 18 + TypeScript SPA + Flask Backend)
> **Methodology**: OWASP Web Security Testing Guide v4.2 — 12 phases
> **Reviewers**: 4 specialized security subagents

---

## Executive Summary

**Overall Risk: HIGH** — 4 critical, 8 high, and 12 medium-severity findings identified.

The CTFd codebase has a strong server-side authorization model (`@admins_only` decorators, schema-based field allowlisting, server-enforced challenge visibility). However, the frontend has critical gaps in **XSS prevention**, **Content Security Policy**, **CSRF token rotation**, and **security headers**.

### Risk Breakdown

| Severity     | Count | Key Areas                                                                                                                                        |
| ------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Critical** | 4     | No CSP header, stored XSS in StaticPage & HintPanel, static CSRF nonce                                                                           |
| **High**     | 8     | Missing security headers, DOM XSS, open redirect via urlRoot, admin secret exposure, hardcoded default credentials, client-side auth stale state |
| **Medium**   | 12    | IDOR enumeration, password reset token in URL, no session expiry detection, API tokens never displayed, sequential integer IDs, etc.             |
| **Low**      | 10    | Verbose error parsing, unused rehype-raw dependency, etc.                                                                                        |

### Most Critical Findings (Top 5)

| Rank | Finding                                                                          | Risk     | OWASP        |
| ---- | -------------------------------------------------------------------------------- | -------- | ------------ |
| 🔴 1 | **No Content Security Policy (CSP)** — all XSS findings are full-impact          | Critical | WSTG-CONF-12 |
| 🔴 2 | **Stored XSS — StaticPage** `dangerouslySetInnerHTML` without DOMPurify          | Critical | WSTG-INPV-02 |
| 🔴 3 | **Stored XSS — HintPanel** `dangerouslySetInnerHTML` without DOMPurify           | Critical | WSTG-INPV-02 |
| 🔴 4 | **Static CSRF nonce per session** — no rotation, single point of failure         | Critical | WSTG-SESN-05 |
| 🟠 5 | **No Clickjacking / XSS protections** — 6 of 7 standard security headers missing | High     | WSTG-CLNT-09 |

---

## Report Structure

| Report File                                            | OWASP Categories                | Findings                            |
| ------------------------------------------------------ | ------------------------------- | ----------------------------------- |
| [security-xss-input.md](security-xss-input.md)         | WSTG-INPV, WSTG-CLNT (XSS)      | 2 Critical, 2 High, 2 Medium, 3 Low |
| [security-auth-session.md](security-auth-session.md)   | WSTG-ATHN, WSTG-SESN, WSTG-CRYP | 1 Critical, 3 High, 5 Medium, 2 Low |
| [security-authorization.md](security-authorization.md) | WSTG-ATHZ, WSTG-API, WSTG-BUS   | 0 Critical, 0 High, 3 Medium, 6 Low |
| [security-client-config.md](security-client-config.md) | WSTG-CONF, WSTG-CLNT, WSTG-ERR  | 2 Critical, 4 High, 3 Medium, 2 Low |

---

## Vulnerability Distribution per OWASP Phase

| OWASP Phase                    | Findings | Critical | High  | Medium | Low    |
| ------------------------------ | -------- | -------- | ----- | ------ | ------ |
| WSTG-CONF — Configuration      | 4        | 1        | 2     | 1      | 0      |
| WSTG-ATHN — Authentication     | 5        | 0        | 2     | 2      | 1      |
| WSTG-ATHZ — Authorization      | 6        | 0        | 0     | 2      | 4      |
| WSTG-SESN — Session Management | 5        | 1        | 2     | 2      | 0      |
| WSTG-INPV — Input Validation   | 6        | 2        | 1     | 1      | 2      |
| WSTG-ERR — Error Handling      | 1        | 0        | 0     | 0      | 1      |
| WSTG-CRYP — Cryptography       | 3        | 0        | 1     | 1      | 1      |
| WSTG-BUS — Business Logic      | 3        | 0        | 0     | 0      | 3      |
| WSTG-CLNT — Client-Side        | 7        | 2        | 2     | 2      | 1      |
| **Total**                      | **40**   | **4**    | **8** | **12** | **10** |

---

## Risk by Defense Layer

| Layer                            | Score       | Key Weakness                                                    |
| -------------------------------- | ----------- | --------------------------------------------------------------- |
| 🏗️ **Server-side Authorization** | 🟢 Strong   | `@admins_only`, schema allowlists, server-enforced visibility   |
| 🔑 **Authentication**            | 🟡 Moderate | Strong server-side CSRF, but static nonce and stale state       |
| 🛡️ **XSS Prevention**            | 🔴 Weak     | 2 unsanitized `dangerouslySetInnerHTML`, no CSP                 |
| 🔒 **Security Headers**          | 🔴 Critical | Only 1 of 7 headers present                                     |
| 🧪 **Input Validation**          | 🟡 Moderate | DOMPurify used in most places, but gaps in HintPanel/StaticPage |
| 🔐 **Session Management**        | 🟡 Moderate | Server-side OK, client-side stale/session expiry not detected   |

---

## Remediation Priority Matrix

### Immediate (Fix Within 24 Hours)

| #   | Finding                                 | Effort | Impact                       |
| --- | --------------------------------------- | ------ | ---------------------------- |
| 1   | Add CSP header to Flask backend         | 30 min | Eliminates impact of all XSS |
| 2   | Wrap `StaticPage.tsx:88` with DOMPurify | 5 min  | Fixes stored XSS             |
| 3   | Wrap `HintPanel.tsx:107` with DOMPurify | 5 min  | Fixes stored XSS             |
| 4   | Add `X-Frame-Options: DENY`             | 5 min  | Prevents clickjacking        |

### Short-Term (Fix Within Sprint)

| #   | Finding                                                           | Effort | Impact                       |
| --- | ----------------------------------------------------------------- | ------ | ---------------------------- |
| 5   | Rotate CSRF nonce per request                                     | 2 hr   | Eliminates static nonce risk |
| 6   | Add missing security headers (HSTS, X-Content-Type-Options, etc.) | 30 min | Defense-in-depth             |
| 7   | Fix stale `initDataCache` after login/logout                      | 1 hr   | Prevents auth state mismatch |
| 8   | Add 401/403 interceptor for session expiry detection              | 1 hr   | Detects expired sessions     |
| 9   | Remove hardcoded default admin credentials                        | 5 min  | Prevents setup hijacking     |

### Medium-Term (Fix Within Milestone)

| #   | Finding                                            | Effort | Impact                      |
| --- | -------------------------------------------------- | ------ | --------------------------- |
| 10  | Delete session cache entry on logout               | 1 hr   | Prevents orphaned sessions  |
| 11  | Validate `urlRoot` before redirect                 | 30 min | Prevents open redirect      |
| 12  | Mask `secret` field in admin UI with reveal toggle | 1 hr   | Protects 2FA secrets        |
| 13  | Remove `CMARK_OPT_UNSAFE` from backend markdown    | 30 min | Reduces XSS surface         |
| 14  | Add origin validation to plugin script loading     | 30 min | Plugin supply chain defense |

---

## Key Security Architecture Observations

### What's Done Well

- **CSRF-Token header** is auto-injected on all API mutations via centralized `api` client
- **Backend authorization** is always server-enforced — frontend guards are cosmetic
- **`session.regenerate()`** called on login (prevents session fixation)
- **DOMPurify** is used in 4/6 `dangerouslySetInnerHTML` sites
- **No secrets in localStorage** — only theme preference
- **`rel="noopener noreferrer"`** on all `target="_blank"` links
- **Email enumeration** is properly mitigated in password reset
- **Rate limiting** exists on auth endpoints and flag submission

### What Needs Urgent Fixing

- **No CSP** means every XSS finding is immediately exploitable
- **Static CSRF nonce** never rotates — one leak = session compromise
- **Two DOM XSS vectors** (HintPanel, StaticPage) are completely unsanitized
- **Only 1 security header** out of 7 standard ones

---

## References

- OWASP WSTG: https://owasp.org/www-project-web-security-testing-guide/
- CTFd Backend: `/home/mirage/Documents/code/sec/CTFd/CTFd/`
- CTFd Frontend: `/home/mirage/Documents/code/sec/CTFd/frontend/`
