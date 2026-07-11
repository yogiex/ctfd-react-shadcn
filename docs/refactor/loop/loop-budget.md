# Loop Budget — CTFd Refactoring

## Token Budget

- Max per triage run: 50k tokens
- Max per refactor run: 200k tokens
- Max per day (all runs): 500k tokens

## Subagent Budget

- Max concurrent subagents: 4
- Max per triage run: 0 (report-only, no code)
- Max per refactor run: 4 (1 analysis + 3 implement/verify)

## Action on Exceed

- Triage exceed → scope ke High Priority only
- Refactor exceed → split komponen jadi sub-components
- Daily cap exceeded → stop, update STATE.md dengan "Budget exhausted"

## Current Status

- Tersedia: ~350k tokens remaining
- Terpakai hari ini: ~150k tokens (2 triage runs, 8 subagents total)
- Subagents aktif: 0

---

Last update: 2026-07-08 14:00
