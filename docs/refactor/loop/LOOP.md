# CTFd Loop Configuration

## Active Loops
| Pattern | Trigger | Status | Skill |
|---------|---------|--------|-------|
| Triage | Manual / tiap sesi | L1 report-only | skill({name:"loop-triage"}) |
| Refactor | Manual per komponen | L2 with review | skill({name:"loop-refactor"}) |

## Human Gates
- No commit tanpa review untuk Phase 3 (Admin Panel)
- No API changes (backend frozen — Flask API tidak berubah)
- Plugin templates: verify backward compat secara manual
- Jika review REJECT > 2x → escalate ke human via question()

## Worktree Policy
- Setiap migration di worktree terpisah
- Format: `../wt-{component}-{YYYYMMDDHHMMSS}`
- Buat: `bash("git worktree add ../wt-{name} -b loop/{name}")`
- Hapus setelah merge: `bash("git worktree remove ../wt-{name}")`
- Hapus setelah reject: `bash("git branch -D loop/{name} && git worktree remove ../wt-{name}")`

## Subagent Spawn Rules
- Max concurrent subagents: 4
- WAJIB batch spawn (jangan sequential)
- Tipe: explore untuk analisis, general untuk implementasi + review
- Always spawn dulu baru tunggu hasil (tidak sequential)

## Failsafe
- Jika `npx tsc --noEmit` error → jangan commit, fix dulu
- Jika `npx vitest run` fail → fix sebelum lanjut
- Jika review Critical > 0 → fix sebelum lanjut ke fase berikutnya
- Jika budget exceeded → stop, tanya human

## Phase Progression Rules
- Phase 0 → Phase 1: Foundation harus solid (routing, auth, layout)
- Phase 1 → Phase 2: Auth harus berfungsi penuh
- Phase 2 → Phase 3: Semua fitur peserta harus jalan
- Phase 3 → Phase 4: Admin panel lengkap
- Phase 4 → Phase 5: Plugin backward compat verified
