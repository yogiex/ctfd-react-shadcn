---
name: verification-before-completion
description: "Gate function 5-langkah (IDENTIFY→RUN→READ→VERIFY→CLAIM) untuk memastikan tidak ada klaim selesai tanpa bukti verifikasi terbaru. Kompatibel dengan CTFd refactoring."
---

# Verification Before Completion

## Iron Law

> **NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE**

Setiap klaim "selesai" harus didukung oleh bukti verifikasi yang dijalankan **setelah** perubahan terakhir.

---

## Gate Function

```
IDENTIFY → RUN → READ → VERIFY → CLAIM
```

### 1️⃣ IDENTIFY — Tentukan apa yang perlu diverifikasi

```markdown
- Apakah ada file TypeScript baru/diubah? → `npx tsc --noEmit`
- Apakah ada komponen React baru? → component test
- Apakah ada perubahan API? → integration test
```

### 2️⃣ RUN — Jalankan verification commands

```markdown
# TypeScript check (WAJIB)

bash("npx tsc --noEmit")

# Component tests terkait perubahan

bash("npx vitest run --related src/components/ChallengeBoard.tsx --reporter=verbose")

# Full test suite (jika memungkinkan)

bash("npx vitest run --reporter=verbose")

# Diff overview

bash("git diff --stat")
```

### 3️⃣ READ — Baca output verification

```markdown
- TypeScript: cek ada `error TS...` atau tidak
- Test: cek jumlah PASS / FAIL
- Diff: pastikan hanya file yang relevan berubah
```

### 4️⃣ VERIFY — Cocokkan dengan criteria

```markdown
- ✅ `npx tsc --noEmit` → exit code 0
- ✅ `npx vitest run` → all tests PASS
- ✅ Hanya file target yang berubah (`git diff --stat`)
- ✅ Tidak ada `console.log` / debugging artifacts
```

### 5️⃣ CLAIM — Baru klaim selesai

```markdown
Verification complete:

- TypeScript: ✅
- Tests: ✅ (X passed, 0 failed)
- Files changed: N
- Status: READY
```

---

## Common Verification Failures

| Failure                 | Cause                | Fix                               |
| ----------------------- | -------------------- | --------------------------------- |
| `error TS2322`          | Type mismatch        | Check interface/props             |
| `FAIL` di test          | Broken component     | Run `npx vitest --ui` untuk debug |
| Unexpected file changes | Side effect          | `git checkout -- <file>`          |
| Module not found        | Missing import       | Check path + barrel exports       |
| Test timeout            | Async tidak di-await | Gunakan `waitFor` / `findBy`      |
