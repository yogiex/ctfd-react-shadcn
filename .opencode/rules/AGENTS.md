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
make serve         # python serve.py (debug on :4000, gevent monkitied)
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

| Skill                  | Tool name                              | What it covers                                                                                           |
| ---------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `ctfd-frontend-design` | `skill({name:"ctfd-frontend-design"})` | Typography, color, component anatomy for ChallengeBoard/Scoreboard/Admin, dark mode, responsive          |
| `ctfd-shadcn`          | `skill({name:"ctfd-shadcn"})`          | shadcn/ui CLI, component selection table, composition rules, form patterns, CTFd-specific customizations |
| `ctfd-code-review`     | `skill({name:"ctfd-code-review"})`     | Code review dispatch for CTFd refactoring, API compat checks, UI parity, severity calibration            |
