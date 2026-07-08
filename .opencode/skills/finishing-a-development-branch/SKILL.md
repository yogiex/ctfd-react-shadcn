---
name: finishing-a-development-branch
description: "Pipeline 5-langkah untuk menyelesaikan branch development CTFd: verifikasi, deteksi environment, presentasi opsi, eksekusi, cleanup + update STATE.md."
---

# Finishing a Development Branch

Pipeline untuk menyelesaikan branch setelah semua perubahan selesai.

---

## Step 1 — Verify

```markdown
bash("npx tsc --noEmit")
bash("npx vitest run --reporter=verbose")
bash("git diff --stat")
```

Jika gagal → STOP. Fix dulu. Jangan lanjut.

---

## Step 2 — Detect Environment

```markdown
# Cek apakah ini worktree atau repo normal
bash("git rev-parse --git-path HEAD")
# Output: .git → normal repo
# Output: <path>/.git → worktree (bare repo reference)

# Cek branch aktif
bash("git branch --show-current")
```

---

## Step 3 — Present Options

Berikan user 4 opsi, tunggu pilihan:

| # | Option | Command |
|---|--------|---------|
| 1 | Merge ke branch utama | `bash("git merge <branch>")` lalu `STATE.md` update |
| 2 | Buat PR ke remote | `gh pr create --title "..." --body "..."` |
| 3 | Keep branch (lanjut nanti) | Catat di STATE.md sebagai draft |
| 4 | Discard / reset | `git checkout <main> && git branch -D <branch>` |

---

## Step 4 — Execute

Berdasarkan pilihan user:

**Option 1 (merge):**
```markdown
bash("git checkout main")
bash("git merge <branch>")
```

**Option 2 (PR):**
```markdown
bash("git push -u origin <branch>")
bash("gh pr create --title \"feat: ...\" --body \"## Summary\\n...\"")
```

**Option 3 (keep):** Update STATE.md → set status ke `DRAFT`.

**Option 4 (discard):**
```markdown
bash("git checkout main && git branch -D <branch>")
```

---

## Step 5 — Cleanup & Update STATE.md

```markdown
# Hapus worktree jika ada
bash("git worktree prune")

# Update STATE.md — tandai komponen selesai
# Baca STATE.md dulu, lalu edit bagian yang relevan
```

---

## STATE.md Update Template

```markdown
## Migration Progress

### [Component Name] — ✅ DONE
- Branch: `<branch-name>`
- Status: `MERGED` | `PR_OPEN` | `DRAFT` | `DISCARDED`
- Date: `YYYY-MM-DD`
```
