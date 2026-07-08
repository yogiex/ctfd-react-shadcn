---
name: loop-triage
description: >
  Triage CTFd refactoring progress. Read STATE.md, ROADMAP.md, PLAN.md.
  Identify next component to migrate based on dependencies and priority.
  Output: next target + blockers + strategic approach.
---

# Loop Triage — CTFd Refactoring

## Tanggung Jawab
- Membaca STATE.md untuk status terkini
- Membaca docs/refactor/ROADMAP.md untuk task checklist per minggu
- Membaca docs/refactor/PLAN.md untuk dependencies antar phase
- Menentukan NEXT TARGET (komponen yang harus dikerjakan)
- Update STATE.md dengan target baru

## Cara Kerja

### Step 1: Read Current State
Baca file-file ini:
- `STATE.md` → current phase, progress, blockers
- `docs/refactor/ROADMAP.md` → task checklist, minggu ke berapa
- `docs/refactor/PLAN.md` → dependencies, priorities

### Step 2: Evaluate
Cari task yang memenuhi kriteria:
1. Ada di ROADMAP.md untuk minggu ini
2. Tidak punya blocker (dependency sudah selesai)
3. Prioritas tertinggi (P1 > P2 > P3)
4. Belum dikerjakan (belum dicentang di ROADMAP)

Priority order berdasarkan PLAN.md:
- P1: Auth, Challenge Board, Scoreboard, Admin Layout, Challenge CRUD
- P2: User/Team Profiles, Settings, Admin User/Team management
- P3: Notifications, Plugin system, Polish

Phase order (WAJIB):
- Phase 0 dulu (foundation) → baru Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
- Jangan lompat phase

### Step 3: Check Blockers
Untuk setiap kandidat task, cek blocker:
- Apakah komponen yang menjadi dependency sudah selesai?
- Apakah phase sebelumnya sudah complete?
- Apakah skill yang dibutuhkan sudah ada?

### Step 4: Output

Output WAJIB format berikut:

```
## Triage Result — {timestamp}

## Current Status
- Phase: {current}
- Component: {current component if any}
- Blockers: {none or list}

## Next Target
- Component: {nama komponen}
- Priority: P1/P2/P3
- Phase: {phase number}
- Skill needed: {skill names}

## Approach
- Strategi: {saran pendekatan}
- Estimated files: {jumlah}
- Risk: {low/medium/high}
```

### Step 5: Update State
Update STATE.md:
- `Last run` timestamp
- `Current phase` → phase target
- `Current component` → target component
- `High Priority` → task yang harus dikerjakan
- Hapus item yang sudah completed

## Rules
- BRUTALLY CONCISE — jangan buat laporan panjang
- Only put in High Priority if harus dikerjakan HARI INI
- When in doubt → Watch List (bukan High Priority)
- Never invent work — hanya report what's next from PLAN.md
- Jika STATE.md mengatakan "Budget exhausted" → stop, jangan suggest task baru
- Jika blocker active → report saja, jangan paksakan
