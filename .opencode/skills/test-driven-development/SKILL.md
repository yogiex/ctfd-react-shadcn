---
name: test-driven-development
description: "TDD cycle (RED→GREEN→REFACTOR) khusus untuk CTFd refactoring ke React 18 + TypeScript + shadcn/ui. Menggunakan vitest + React Testing Library."
---

# TDD — Test-Driven Development untuk CTFd

## Iron Law

> **NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST**

Setiap baris kode produksi harus didahului oleh test yang gagal. Jika tidak ada test yang gagal, Anda tidak boleh menulis/mengubah kode produksi.

---

## RED → GREEN → REFACTOR

### 🔴 RED — Tulis test yang gagal

```typescript
// CTFd/components/__tests__/ChallengeCard.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ChallengeCard } from "../ChallengeCard";

describe("ChallengeCard", () => {
  it("menampilkan nama challenge", () => {
    render(<ChallengeCard name="Web Exploit" category="web" points={500} />);
    expect(screen.getByText("Web Exploit")).toBeInTheDocument();
    // BELUM diimplementasi → RED
  });
});
```

| Step        | Action                                | Verification                                   |
| ----------- | ------------------------------------- | ---------------------------------------------- |
| 🔴 RED      | Tulis test untuk satu behavior        | `npx vitest run --reporter=verbose` → **FAIL** |
| 🟢 GREEN    | Implementasi minimal                  | `npx vitest run --reporter=verbose` → **PASS** |
| 🔵 REFACTOR | Perbaiki kualitas tanpa ubah behavior | `npx vitest run` → masih **PASS**              |

### 🟢 GREEN — Implementasi minimal

```typescript
// CTFd/components/ChallengeCard.tsx
interface Props { name: string; category: string; points: number; }
export function ChallengeCard({ name }: Props) {
  return <div>{name}</div>; // minimal sampai test PASS
}
```

### 🔵 REFACTOR — Perbaiki tanpa ubah behavior

```typescript
// Tambah styling shadcn/ui, props lain — test harus tetap PASS
```

---

## Tools CTFd

| Tool           | Command                                                   | Penggunaan                |
| -------------- | --------------------------------------------------------- | ------------------------- |
| vitest         | `npx vitest run`                                          | Semua test (CI)           |
| vitest watch   | `npx vitest`                                              | Development — auto re-run |
| vitest related | `npx vitest run --related src/ChallengeCard.tsx`          | Test terkait file saja    |
| RTL            | `import { render, screen } from "@testing-library/react"` | Component tests           |
| TypeScript     | `npx tsc --noEmit`                                        | Type check sebelum commit |

---

## Anti-Patterns

| ❌ Jangan                                 | ✅ Lakukan                               |
| ----------------------------------------- | ---------------------------------------- |
| Test setelah kode produksi                | Tulis test sebelum kode                  |
| Test terlalu besar (integration overload) | Satu test = satu behavior                |
| Mock berlebihan                           | Gunakan komponen nyata jika memungkinkan |
| `screen.debug()` di test final            | Hapus debugging sebelum commit           |
| Snapshots besar tanpa review              | Snapshots kecil + code review            |

---

## Rationalization Prevention

| Rationalization                          | Reality                             |
| ---------------------------------------- | ----------------------------------- |
| "Ini komponen sederhana, ga perlu test"  | Semua komponen React perlu test     |
| "Nanti aja testnya"                      | Test duluan atau tidak akan pernah  |
| "Ini cuma refactor, test existing cukup" | Tulis test untuk kode baru dulu     |
| "Testnya terlalu lama"                   | `--related` flag untuk subset cepat |

---

## Verification Checklist

Sebelum pindah ke task berikutnya:

- [ ] `npx vitest run` — semua test PASS
- [ ] `npx tsc --noEmit` — no type errors
- [ ] Tidak ada test yang di-skip (`it.skip`)
- [ ] Code coverage untuk file baru > 80%
- [ ] Test assertion spesifik (bukan `.toBeTruthy()` generik)
