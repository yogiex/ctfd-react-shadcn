---
name: systematic-debugging
description: "Framework debugging 4-phase untuk CTFd refactoring. Berfokus pada root cause investigation sebelum implementasi fix. Menangani component migration issues, API response mismatches, dan React rendering bugs."
---

# Systematic Debugging untuk CTFd

## Iron Law

> **NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST**

Dilarang menebak-nebak fix. Setiap perubahan harus berdasarkan root cause yang teridentifikasi.

---

## 4-Phase Debugging Cycle

```
┌──────────────────────────────────────────────────┐
│  1. Root Cause Investigation                     │
│  2. Pattern Analysis                             │
│  3. Hypothesis & Testing                         │
│  4. Implementation                               │
└──────────────────────────────────────────────────┘
```

---

### Phase 1: Root Cause Investigation

Kumpulkan bukti sebelum menyentuh kode:

```markdown
# 1a. Replicate
- Apa yang terjadi? vs Apa yang seharusnya terjadi?
- Console errors? → bash("buka Chrome DevTools > Console")
- Network errors? → bash("buka Chrome DevTools > Network")

# 1b. Narrow
- Apakah ini component migration issue? (React 18 vs Vue 2)
- Apakah ini API response mismatch? (format backend vs frontend)
- Apakah ini React rendering bug? (key, useEffect deps, stale closure)

# 1c. Capture
- Simpan error message / stack trace
- Catat API response jika relevan
```

### Phase 2: Pattern Analysis

Cari pola dari bug yang mirip:

| Issue Type | Pattern | Sumber |
|------------|---------|--------|
| Component migration | Props interface tidak sinkron | Cek file di `CTFd/api/v1/` vs frontend types |
| API mismatch | Response field tidak sesuai ekspektasi | Bandingkan response actual dengan `useQuery` type |
| React re-render loop | `useEffect` tanpa dependency atau dependency berubah terus | `bash("npx tsc --noEmit")` + lint |
| Stale closure | State lama di-capture oleh callback | Cek `useCallback` / `useRef` |

### Phase 3: Hypothesis & Testing

Buat hypothesis dan test sebelum implementasi:

```markdown
Hypothesis: "Component X crash karena props `challengeId` undefined"
Test:
  - bash("npx vitest run --related src/components/X.tsx")
  - atau: tambah console.log di entry component → reload page
```

Jika hypothesis salah → ulang Phase 1-3.

### Phase 4: Implementation

Hanya setelah root cause terkonfirmasi:

```markdown
1. Tulis test yang mereproduksi bug (RED)
2. Implementasi fix minimal (GREEN)
3. Refactor jika perlu
4. bash("npx vitest run --related src/components/X.tsx") → PASS
5. bash("npx tsc --noEmit") → OK
```

---

## Eskalasi

Jika 3+ fix attempts gagal (masih muncul error yang sama setelah implementasi):

> **STOP. Question architecture.**

Kemungkinan:
- Pendekatan migrasi salah (coba pendekatan berbeda)
- Backend API perlu diubah (koordinasi dengan tim)
- Component perlu di-restructure

Tulis temuan di STATE.md di bagian `BLOCKERS` sebelum lanjut.

---

## CTFd-Specific Debugging Commands

```markdown
# Type check komponen
bash("npx tsc --noEmit")

# Test terkait komponen
bash("npx vitest run --related src/components/ChallengeCard.tsx")

# Test dengan coverage
bash("npx vitest run --coverage --reporter=verbose")

# Lint
bash("npx eslint src/components/ChallengeCard.tsx")
```
