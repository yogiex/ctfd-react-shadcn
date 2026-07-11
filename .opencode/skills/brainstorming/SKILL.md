---
name: brainstorming
description: |
  Design exploration protocol for CTFd React component migration. Runs before any implementation
  begins. Guarantees every new React component has a thoughtful, reviewed design that accounts
  for CTFd-specific states (frozen, ratelimited, paused), permission levels, and dark mode.
  Output: design document at .opencode/designs/ + handoff to writing-plans skill.
---

# CTFd Brainstorming — Design Exploration Protocol

Design exploration yang WAJIB dijalankan SEBELUM implementasi komponen React dimulai. Skill ini memastikan setiap komponen yang dimigrasi dari Jinja2/Alpine/Vue ke React+shadcn memiliki design yang matang, bukan asal coding.

## Flow (5 Fase)

### Fase 1: Konteks Exploration

Load konteks yang relevan sebelum brainstorming:

```
skill({name:"ctfd-frontend-design"})
skill({name:"ctfd-shadcn"})
```

Baca file template lama dan API:

```
task({
  subagent_type: "explore",
  prompt: "Read CTFd/themes/{theme}/templates/{page}.html dan CTFd/api/v1/{resource}.py.
          Identifikasi:
          - Semua states UI: loading, empty, error, success
          - CTF-specific states: frozen, ratelimited, paused, solved, unsolved
          - Permission variants: unauthed, authed, admin
          - Semua form fields dan validasinya
          - Semua API endpoints dan response shape
          Return structured markdown."
})
```

### Fase 2: Generate Questions

Berdasarkan hasil eksplorasi, beri pertanyaan ke manusia via `question()`:

```
question("Untuk komponen {component}:
[1] Apakah perlu menampilkan solved/unsolved state di card?
[2] Rate limiting message perlu countdown timer?
[3] Bagaimana handling frozen competition — hide semua atau show read-only?
[4] Dark mode priority: first-class atau nice-to-have?
[5] Mobile breakpoint behavior: collapse atau scroll?")
```

### Fase 3: Propose 2-3 Approaches

Tulis pendekatan design dalam format berikut:

```
## Approach A: {nama pendekatan}
**Vibe:** {1 kalimat}
**Pros:** {list}
**Cons:** {list}
**States map:** loading → {komponen} | error → {komponen} | empty → {komponen}
**File impact:** {n} files baru, {n} files diubah

## Approach B: {nama pendekatan}
...

## Rekomendasi: {A/B/C}
**Alasan:** {2-3 kalimat}
```

### Fase 4: Design Document

Setelah approach disetujui, tulis design document ke `.opencode/designs/{component}.design.md`:

```
# {Component} — Design Document

## Overview
{paragraf singkat tentang apa komponen ini}

## Component Tree
```

├── {Component}Page
│ ├── {SubComponent1}
│ ├── {SubComponent2}
│ └── {SubComponent3}

````

## TypeScript Types
```typescript
interface {Component}Props { ... }
interface {Component}Response { ... }
````

## States

| State       | UI                  | Component        |
| ----------- | ------------------- | ---------------- |
| loading     | Skeleton            | SkeletonCard     |
| error       | Alert + retry       | AlertDestructive |
| empty       | EmptyState + CTA    | EmptyState       |
| success     | data                | data components  |
| ratelimited | countdown + disable | AlertWarning     |

## API Integration

- GET {endpoint} → useQuery
- POST {endpoint} → useMutation

## Permission Gates

- unauthed → redirect /login
- authed → render
- admin → extra controls

```

### Fase 5: Handoff

Setelah design document selesai, load writing-plans untuk eksekusi:

```

skill({name:"writing-plans"})

```

## HARD GATE: NO IMPLEMENTATION BEFORE APPROVAL

**Rule absolut:** Jika design document BELUM ditulis dan disetujui → DILARANG mulai implementasi.

Tanda design approved:
1. Design document ada di `.opencode/designs/{component}.design.md`
2. Tidak ada pertanyaan tersisa dari fase 2
3. Approach sudah dipilih (A/B/C)

## Output Files

| File | Location | Contents |
|------|----------|----------|
| Design doc | `.opencode/designs/{component}.design.md` | Component tree, types, states, API, permissions |
| Questions log | `.opencode/designs/{component}-questions.md` | Q&A dari fase 2 (optional) |
| Approach decisions | `.opencode/designs/{component}-decisions.md` | Mengapa approach tertentu dipilih (optional) |

## CTFd-Specific Design Checklist

Setiap design document WAJIB menjawab:

- [ ] Competition states: frozen, paused, ratelimited — bagaimana tampilannya?
- [ ] Permission levels: apa yang dilihat admin vs participant vs unauthed?
- [ ] Dark mode: sudah dihandle via CSS variables?
- [ ] API compat: response shape sesuai existing API (tidak boleh diubah)?
- [ ] Empty states: apa yang muncul ketika data kosong?
- [ ] Error recovery: user bisa retry atau harus reload?
- [ ] Loading states: Skeleton atau spinner?
- [ ] Mobile: bagaimana layout di <768px?
- [ ] Form validation: inline error messages atau toast?
- [ ] Accessibility: keyboard nav, screen reader labels, focus management?
```
