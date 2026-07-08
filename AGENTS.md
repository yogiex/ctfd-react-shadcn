# CTFd — Agent Guide

## Structure

- **Backend**: Flask 2.1 / Python 3.11 at `CTFd/`. Entrypoint: `CTFd/__init__.py:create_app()`.
- **Frontend (current)**: Three independent Vite themes in `CTFd/themes/`. Each has its own `package.json` + `vite.config.js`.
  - `admin` — Vue 3 (compat mode) + Bootstrap 4 + jQuery, CodeMirror, ECharts
  - `core` — Alpine.js 3 + Bootstrap 5 + ECharts
  - `telkom-university` (this is the **DEFAULT_THEME**, not `core`)
- **Frontend (refactoring target)**: React 18 + TypeScript + shadcn/ui at `CTFd/frontend/`. This is a new SPA being built alongside the existing themes. See project skills below.
- **API**: `CTFd/api/v1/` — 22 files, flask-restx namespaces. Consumed via `@ctfdio/ctfd-js`.
- **Plugin system**: `CTFd/plugins/`. Each exports `load(app)`. Built-in: `challenges/` (standard + dynamic scoring), `flags/` (static + regex).
- **Default theme**: `telkom-university`. Set in `CTFd/constants/themes.py`. Not `core`.

## Commands

```sh
make lint          # ruff → isort → yarn lint → black → prettier
make format        # auto-format Python + JS + MD
make test          # pytest -n auto --cov + bandit + pipdeptree
make serve         # python serve.py (debug on :4000, gevent monkeypatched)
python manage.py shell  # Flask shell with app context
serve.py --profile # enables flask_profiler at /flask-profiler/
```

### Theme builds (run from each theme directory)
```sh
cd CTFd/themes/admin && yarn install && yarn build    # output → static/
cd CTFd/themes/core && yarn install && yarn build      # output → static/
cd CTFd/themes/telkom-university && yarn install && yarn build
yarn dev   # watch mode
```

Build outputs to `static/` inside each theme dir — these are **committed to git**. CI enforces this via `yarn verify` (builds + `git diff --exit-code`).

### Tests
```sh
make test                               # full suite (parallel, coverage)
pytest tests/test_challenges.py -v      # single file
pytest tests/test_challenges.py::test_challenge_visibility -v  # single test
pytest -p no:xdist tests/test_challenges.py -v -s  # debug (no parallel)
```

**CI test quirk**: `sudo rm -f /etc/boto.cfg` is run before test to avoid boto3 conflicts. Test env also sets dummy `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

### Database
```sh
TESTING_DATABASE_URL=sqlite:// make test    # dev default
DATABASE_URL=mysql+pymysql://ctfd:ctfd@localhost/ctfd  # production
```

SQLite is the test default. CI also runs against MariaDB 10.11, MySQL 5.7/8.0, and Postgres.

### Dev server
```sh
python serve.py                           # gevent-monkeypatched, :4000, debug mode
flask run                                 # also :4000 (from .flaskenv)
docker compose up                         # MariaDB + Redis + CTFd on :8000
```

## Non-obvious quirks

- **`make test` implicitly uses SQLite** unless `TESTING_DATABASE_URL` is set.
- **CSRF is custom**, not Flask-WTF. Nonce in `window.init.csrfNonce`. Sent as `CSRF-Token` header on all mutations. Tests auto-inject via `CTFdTestClient`.
- **`window.init`** is injected in every Jinja2 page: urlRoot, csrfNonce, userMode, userId, userName, userEmail, userVerified, teamId, teamName, start, end, themeSettings.
- **SSE at `GET /events`** for real-time notifications. Config toggle: `SERVER_SENT_EVENTS`. Uses Redis pub/sub for multi-worker deployments.
- **Translations**: Flask-Babel `.po` files in `CTFd/translations/`. CI enforces `.po→.mo` compilation. Run `make translations-compile` before commit.
- **Config precedence**: env var > config.ini > code default > DB config. `PRESET_CONFIGS` env var overrides DB entirely.
- **App blocks startup** while an import is in progress (polls every 5s in `create_app()`).
- **`CTFdRequest`** hijacks `request.path` to include `script_root` — for subdirectory deployments.
- **Session storage**: `CachingSessionInterface` — lives in Redis (or filesystem if no Redis).
- **Rate limiting**: custom `@ratelimit` decorator, cache-backed. Challenge submission ratelimiting is in `api/v1/challenges.py`.
- **Challenge scoring**: static (fixed value) or dynamic (decay function). Decay in `CTFd/utils/scoring/`.
- **Cache busting**: `clear_standings()`, `clear_config()`, `clear_user_session()` — must call these after mutations that affect scores/config/users.

## Project skills (local, load on demand)

| Skill | Load with | What it covers |
|-------|-----------|----------------|
| `ctfd-frontend-design` | `skill({name:"ctfd-frontend-design"})` | Typography, color, component anatomy for ChallengeBoard/Scoreboard/Admin, dark mode, responsive |
| `ctfd-shadcn` | `skill({name:"ctfd-shadcn"})` | shadcn/ui CLI, component selection table, composition rules, form patterns, CTFd-specific customizations |
| `ctfd-code-review` | `skill({name:"ctfd-code-review"})` | Code review dispatch for CTFd refactoring, API compat checks, UI parity, severity calibration |
| `loop-triage` | `skill({name:"loop-triage"})` | Triage refactoring progress: read STATE.md + ROADMAP.md + PLAN.md, output next component to migrate |
| `loop-refactor` | `skill({name:"loop-refactor"})` | Execute one component migration cycle: SCOUT→PLAN→BUILD→REVIEW→FIX→VERIFY via subagents |

## Loop Engineering Workflow

This project uses **loop engineering** (Cobus Greyling methodology) — subagent-driven development with file-based state management. No third-party tools needed.

### State files (`docs/refactor/loop/`)
| File | Purpose |
|------|---------|
| `STATE.md` | Memory spine — current phase, priorities, blockers. **Read & write every run.** |
| `LOOP.md` | Loop configuration — active loops, human gates, worktree policy, failsafe |
| `loop-budget.md` | Token & subagent budget tracker |
| `loop-run-log.md` | Run history ledger — append every run |

### How to run
```
1. Read STATE.md → tahu posisi terkini
2. skill({name:"loop-triage"}) → dapat next target
3. skill({name:"loop-refactor"}) → eksekusi 6 fase migrasi
4. Update STATE.md + loop-run-log.md
5. Ulang dari step 1
```

### Failsafe rules
- Backend API TIDAK boleh diubah
- Batch spawn subagent (max 4), jangan sequential
- Jika REVIEW Critical > 0 → fix dulu
- Jika 2x REVIEW gagal → escalate ke human
- File lama JANGAN dihapus sampai verified

## Superpowers Workflow (adopsi dari obra/superpowers)

Setiap task migrasi komponen mengikuti urutan ini:

1. **brainstorming** → design approach (gunakan `skill({name:"brainstorming"})`)
2. **writing-plans** → task breakdown (gunakan `skill({name:"writing-plans"})`)
3. **using-git-worktrees** → isolated workspace (gunakan `skill({name:"using-git-worktrees"})`)
4. **subagent-driven-development** → implement + review (gunakan `skill({name:"loop-refactor"})`)
5. **finishing-a-development-branch** → integrate (gunakan `skill({name:"finishing-a-development-branch"})`)

Di dalam implementasi:
- **test-driven-development** → RED-GREEN-REFACTOR (gunakan `skill({name:"test-driven-development"})`)
- **verification-before-completion** → evidence before claims (gunakan `skill({name:"verification-before-completion"})`)
- **ctfd-code-review** → two-stage review (gunakan `skill({name:"ctfd-code-review"})`)

Untuk debugging:
- **systematic-debugging** → 4-phase root cause (gunakan `skill({name:"systematic-debugging"})`)

### Agent roles (registered in opencode.json)

| Agent | Mode | Permission | Purpose |
|-------|------|------------|---------|
| `loop-triage` | primary | read-only | Triage: baca STATE/ROADMAP/PLAN, output next component |
| `implementer` | subagent | bash(ask), edit(ask) | Build: implement komponen + test, tulis report |
| `reviewer` | subagent | bash(ask), edit(deny) | Review: two-stage spec compliance + code quality |
| `verifier` | subagent | bash(ask), edit(deny) | Verify: cek test evidence, APPROVE/REJECT |
