---
name: using-git-worktrees
description: |
  Git worktree protocol for CTFd refactoring. Creates isolated workspaces per component
  migration so the main working tree stays clean. Detects existing worktree state,
  creates new worktree with branch, sets up project dependencies, and verifies a clean
  test baseline before migration begins.
---

# CTFd Git Worktrees — Isolated Workspace Protocol

Protocol untuk membuat isolated workspace via git worktree. Setiap komponen yang dimigrasi mendapat worktree sendiri sehingga main working tree tidak terkontaminasi file baru atau perubahan yang belum selesai.

## Konsep

```
Main tree:           /home/mirage/Documents/code/sec/CTFd  (branch: main)
                       │
Component worktree:  ../wt-challenge-board-1704067200/    (branch: loop/challenge-board)
                       ├── CTFd/
                       ├── frontend/
                       └── ...
```

## Step 0: Detect Existing Worktree State

SEBELUM membuat worktree baru, cek status dulu:

```
bash("git status --short")
```

Jika sudah ada perubahan:
```
bash("git stash push -m 'stash-before-{component}-{timestamp}'")
```

Cek apakah sudah di worktree:
```
bash("git worktree list")
```

Output worktree list menunjukkan:
- `/path/main (main)` → ini main tree
- `/path/wt-xxx (loop/xxx)` → ini worktree, jangan buat baru

**Jika sudah di worktree:**
```
question("Kamu sedang di worktree {path} branch {branch}.
Apakah ingin melanjutkan di worktree ini atau buat baru?
[1] Lanjut di worktree ini
[2] Buat worktree baru")
```

## Step 1: Create Worktree

Hanya jika BELUM di worktree.

```
BASE_BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMPONENT_NAME="{component}"
TIMESTAMP=$(date +%s)
WORKTREE_PATH="../wt-${COMPONENT_NAME}-${TIMESTAMP}"
BRANCH_NAME="loop/${COMPONENT_NAME}"

bash("git worktree add ${WORKTREE_PATH} -b ${BRANCH_NAME}")
```

Parameter:

| Variable | Value | Contoh |
|----------|-------|--------|
| COMPONENT_NAME | {component-name} | challenge-board |
| TIMESTAMP | `date +%s` | 1704067200 |
| WORKTREE_PATH | `../wt-{name}-{ts}` | ../wt-challenge-board-1704067200 |
| BRANCH_NAME | `loop/{name}` | loop/challenge-board |

Format: `../wt-{component-name}-{unix-timestamp}`

Contoh untuk challenge-board:
```
bash("git worktree add ../wt-challenge-board-1704067200 -b loop/challenge-board")
```

## Step 2: Setup Project

Masuk ke worktree dan install dependencies:

```
bash("ls ${WORKTREE_PATH}")

WORKTREE_ABS=$(realpath ${WORKTREE_PATH})
cd ${WORKTREE_ABS}

# Install Python dependencies
bash("python -m venv venv && source venv/bin/activate && pip install -r requirements.txt")

# Install frontend dependencies
bash("cd CTFd/frontend && npm install")

# Jika ada theme dependencies yang perlu di-build
if [ -f "CTFd/themes/telkom-university/package.json" ]; then
  bash("cd CTFd/themes/telkom-university && npm install")
fi
```

## Step 3: Verify Clean Test Baseline

SEBELUM mulai migration, pastikan tests passing di worktree:

```
cd ${WORKTREE_ABS}
TESTING_DATABASE_URL=sqlite:// make test
```

Atau minimal:
```
cd ${WORKTREE_ABS}
pytest tests/test_challenges.py -v --timeout=30
```

**Jika tests gagal:**
```
question("Tests gagal di worktree. Ini berarti baseline tidak clean.
[1] Skip verification dan lanjut migration
[2] Debug test failure dulu
[3] Coba worktree dari branch lain")
```

**Jika tests pass:**
```
question("✅ All tests passing. Ready to start migration of {component}.
[1] Load loop-refactor skill → mulai migration
[2] Inline execution tasks")
```

## Step 4: Start Migration

Setelah worktree siap, panggil skill yang sesuai:

```
skill({name:"brainstorming"})
# atau
skill({name:"writing-plans"})
# atau
skill({name:"loop-refactor"})
```

## Cleanup: Remove Worktree

Setelah migration selesai dan sudah di-merge:

Kembali ke main tree dulu:
```
bash("cd /home/mirage/Documents/code/sec/CTFd")
```

Hapus worktree:
```
bash("git worktree remove ../wt-{component}-{timestamp}")
```

Hapus branch jika sudah di-merge:
```
bash("git branch -d loop/{component}")
```

## CTFd-Specific Rules

1. **Satu worktree per komponen** — jangan kerja multiple komponen dalam satu worktree
2. **Branch naming:** `loop/{component-name}` — konsisten dengan loop engineering
3. **Worktree path:** `../wt-{component-name}-{timestamp}` — unik per sesi
4. **Jangan commit ke main** — semua perubahan di worktree branch
5. **Cleanup wajib** setelah merge — hapus worktree dan branch
6. **Lock files** — `.gitignore` harus include `venv/`, `node_modules/`, `.env`
7. **CSRF tokens** — test di worktree menggunakan SQLite, pastikan CSRF nonce berfungsi
8. **Database** — worktree menggunakan SQLite default, jangan konek ke production DB

## Troubleshooting

### "worktree already exists"
```
bash("git worktree list")
# Cari worktree dengan branch yang sama
# Jika ada, gunakan yang existing atau remove dulu
bash("git worktree remove ../wt-{name}-{ts} --force")
```

### "branch already exists"
```
bash("git branch -D loop/{component}")
# Hapus branch lokal yang sudah ada
bash("git worktree add ../wt-{component}-{ts} loop/{component}")
```

### Tests fail in worktree
```
# Cek apakah ada config/testing file yang missing
ls pytest.ini
ls setup.cfg
ls pyproject.toml
# Pastikan TESTING_DATABASE_URL=sqlite:// di-set
```

### npm install fails
```
# Cek Node version
node --version  # minimal 18+
# Cek npm version
npm --version
# Cek apakah package.json ada
ls CTFd/frontend/package.json
```
