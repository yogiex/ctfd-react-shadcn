# CTFd Frontend Refactoring — Migration Strategy

## 1. Overview

We are replacing three independent frontend themes (Alpine.js + Bootstrap, Vue 2 compat + Bootstrap 4, and a custom theme) with a single **React 18 + TypeScript + shadcn/ui + Tailwind CSS** SPA at `CTFd/frontend/`.

**Approach**: Incremental migration — page by page, route by route — keeping the old themes operational until every page has been converted.

**Dual-frontend architecture**: During the transition, Flask's route handlers decide which frontend to serve. Each route has three states:

- `legacy` — serves the existing Jinja2 template (current state of all routes)
- `react` — serves `index.html` from the React build, with the React Router handling the route client-side
- `hybrid` — serves the React shell for most content, but conditionally falls back to legacy for pages not yet migrated

## 2. Architecture Diagram (Dual Frontend During Transition)

```
┌─────────────────────────────────────────────────────────────┐
│                        Flask (CTFd/)                         │
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────┐ │
│  │ Route Config │   │ API (v1/*)   │   │ Template Engine   │ │
│  │ per-page     │   │ flask-restx  │   │ (Jinja2)         │ │
│  │ FE switch    │   └──────┬───────┘   └────────┬─────────┘ │
│  └──────┬───────┘          │                     │           │
│         │                  │                     │           │
│         ▼                  ▼                     ▼           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Migration    │  │ JSON resp.   │  │ Jinja2 templates   │ │
│  │ Middleware    │  │ (consumed    │  │ (alpine/vue/jq)    │ │
│  │ "legacy |     │  │  by both FE) │  │                    │ │
│  │  react |      │  └──────────────┘  └────────┬───────────┘ │
│  │  hybrid"      │                             │             │
│  └──────┬───────┘                              │             │
│         │                                      │             │
└─────────┼──────────────────────────────────────┼─────────────┘
          │                                      │
          ▼                                      ▼
┌──────────────────┐              ┌───────────────────────────┐
│ React SPA         │              │ Legacy Themes             │
│ (CTFd/frontend/)  │              │ (CTFd/themes/*/)          │
│                   │              │                           │
│  React Router v6   │              │  core (Alpine.js + BS5)  │
│  Vite build        │              │  admin (Vue 2 + BS4)     │
│  shadcn/ui + TW    │              │  telkom-university       │
│                   │              │                           │
│  API: @ctfdio/     │              │  API: @ctfdio/ctfd-js    │
│  ctfd-js           │              │  (jQuery/browser globals)│
└──────────────────┘              └───────────────────────────┘
          │                                      │
          └──────────────┬───────────────────────┘
                         ▼
              ┌──────────────────────┐
              │  API Layer           │
              │  CTFd/api/v1/        │
              │  22 flask-restx      │
              │  namespaces          │
              │  @ctfdio/ctfd-js     │
              └──────────────────────┘
```

## 3. Per-Page Migration Steps

Each page follows these 6 steps:

```
┌─────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐   ┌──────────┐
│ ANALYZE  │ → │ CREATE    │ → │ ADD ROUTE│ → │ UPDATE   │ → │ VERIFY  │ → │ CLEANUP  │
│ existing  │   │ React     │   │ in React │   │ Flask    │   │ parity  │   │ old      │
│ page      │   │ component │   │ Router   │   │ route    │   │ + tests │   │ files    │
└─────────┘   └───────────┘   └──────────┘   └──────────┘   └─────────┘   └──────────┘
```

### Step Details

**Step 1 — ANALYZE**

- Read the existing Jinja2 template and its JS entry point
- Document all data dependencies (from `window.init`, API calls, DOM manipulation)
- Identify user interactions (form submissions, button clicks, search/filter)
- Note the Bootstrap/Alpine specific patterns that need React equivalents
- Check for plugin hooks (template blocks that plugins override)

**Step 2 — CREATE**

- Build the React component in `frontend/src/pages/`
- Create the API query hook in `frontend/src/api/queries/`
- Create any mutation hooks needed
- Build the presentational components in `frontend/src/components/`
- Add TypeScript types in `frontend/src/types/`
- Add form schemas if applicable

**Step 3 — ADD ROUTE**

- Register the route in `frontend/src/Router.tsx`
- Add route guards (auth required / admin only) if needed
- Wrap in `ErrorBoundary` with `legacyFallbackUrl` pointing to the old Jinja2 page

**Step 4 — UPDATE FLASK**

- In the Flask route handler, change the response to serve the React SPA (`index.html`)
- Or, use the migration middleware approach with a config toggle

**Step 5 — VERIFY**

- Run the page through all states: loading, empty, error, populated
- Compare UI against the legacy page screenshot/Spec
- Test with plugins enabled (does the plugin JS still inject?)
- Run `pytest` for any backend tests that reference this page
- Verify dark mode, responsive layout, keyboard navigation

**Step 6 — CLEANUP**

- Remove the Jinja2 template file (or mark it deprecated)
- Remove the JS entry point from `vite.config.js` (if theme-specific)
- Remove the SCSS/CSS file if no longer imported elsewhere
- Remove old route tests that are now covered by React E2E tests

## 4. Migration Priority Order

### Phase 0 — Foundation (Week 1-2)

| #   | Task                                                                  | Depends On |
| --- | --------------------------------------------------------------------- | ---------- |
| 0.1 | Scaffold React project with Vite + TS + shadcn/ui                     | —          |
| 0.2 | Set up Tailwind, `index.css` with CSS variables                       | 0.1        |
| 0.3 | Create `AuthContext`, `ThemeContext`, `ConfigContext`                 | 0.1        |
| 0.4 | Build API client with CSRF interceptor                                | 0.1        |
| 0.5 | Set up React Router with all routes (all pointing to legacy fallback) | 0.1        |
| 0.6 | Build `AppShell`, `Navbar`, `Footer` layout components                | 0.3        |
| 0.7 | Build `ErrorBoundary` with legacy redirect fallback                   | 0.1        |
| 0.8 | Set up `react-hook-form` + `zod` integration                          | 0.1        |
| 0.9 | Create `cn()` utility and base shadcn components                      | 0.1        |

### Phase 1 — Public Pages, No Auth Required (Week 3-4)

| #   | Page       | Old Theme Entry       | Notes                                 |
| --- | ---------- | --------------------- | ------------------------------------- |
| 1.1 | Login      | `core: index.js`      | Simple form, no auth needed to render |
| 1.2 | Register   | `core: index.js`      | Same as login                         |
| 1.3 | Scoreboard | `core: scoreboard.js` | Read-only, high visibility            |
| 1.4 | Teams list | `core: teams/list.js` | Simple list page                      |
| 1.5 | Users list | `core: users/list.js` | Simple list page                      |

### Phase 2 — Core Competition Pages (Week 5-7)

| #   | Page                 | Old Theme Entry          | Notes                            |
| --- | -------------------- | ------------------------ | -------------------------------- |
| 2.1 | Challenges grid      | `core: challenges.js`    | Most important page, many states |
| 2.2 | Challenge detail     | `core: page.js` + modal  | Solve modal, file downloads      |
| 2.3 | Team detail (public) | `core: teams/public.js`  |                                  |
| 2.4 | User detail (public) | `core: users/public.js`  |                                  |
| 2.5 | Notifications        | `core: notifications.js` | SSE integration                  |
| 2.6 | Settings             | `core: settings.js`      | Complex form, multiple tabs      |

### Phase 3 — Private / Authenticated Pages (Week 8-9)

| #   | Page                  | Old Theme Entry          | Notes                          |
| --- | --------------------- | ------------------------ | ------------------------------ |
| 3.1 | Team detail (private) | `core: teams/private.js` | Team invites, captain controls |
| 3.2 | User detail (private) | `core: users/private.js` | Profile editing, tokens        |
| 3.3 | Setup wizard          | `core: setup.js`         | First-run config               |

### Phase 4 — Admin Panel (Week 10-14)

| #    | Page                   | Old Theme Entry                 | Notes                    |
| ---- | ---------------------- | ------------------------------- | ------------------------ |
| 4.1  | Admin dashboard        | `admin: pages/main.js`          | Summary stats            |
| 4.2  | Admin challenges       | `admin: pages/challenges.js`    | CRUD grid                |
| 4.3  | Admin challenge editor | `admin: pages/editor.js`        | CodeMirror, flags, hints |
| 4.4  | Admin users            | `admin: pages/users.js`         | Table + CRUD             |
| 4.5  | Admin teams            | `admin: pages/teams.js`         | Table + CRUD             |
| 4.6  | Admin submissions      | `admin: pages/submissions.js`   | Filterable log           |
| 4.7  | Admin scoreboard       | `admin: pages/scoreboard.js`    |                          |
| 4.8  | Admin config           | `admin: pages/configs.js`       | Tabs, many form types    |
| 4.9  | Admin pages            | `admin: pages/pages.js`         | CMS pages CRUD           |
| 4.10 | Admin notifications    | `admin: pages/notifications.js` |                          |
| 4.11 | Admin statistics       | `admin: pages/statistics.js`    | ECharts graphs           |
| 4.12 | Admin reset            | `admin: pages/reset.js`         | Destructive actions      |
| 4.13 | Admin team detail      | `admin: pages/team.js`          |                          |
| 4.14 | Admin user detail      | `admin: pages/user.js`          |                          |

### Phase 5 — Polish & Cutover (Week 15-16)

| #   | Task                                              | Notes                   |
| --- | ------------------------------------------------- | ----------------------- |
| 5.1 | E2E tests for all pages                           | Playwright or Cypress   |
| 5.2 | Performance audit                                 | Lighthouse, bundle size |
| 5.3 | Accessibility audit                               | WCAG 2.1 AA             |
| 5.4 | Remove legacy theme build steps from CI           |                         |
| 5.5 | Remove old `CTFd/themes/*` directories (optional) | Archive if desired      |

## 5. Plugin Compatibility Strategy

### Phase 1: `dangerouslySetInnerHTML` (Initial)

Existing plugins inject content into Jinja2 template blocks (e.g., `{% block content %}`,
`{% block scripts %}`). For the first phase of migration:

```tsx
// In React components that need to render legacy plugin output
function PluginSlot({ name }: { name: string }) {
  const { data: pluginHtml } = useQuery({
    queryKey: ["plugin-slot", name, currentPage],
    queryFn: () => api.get(`/plugin/${name}/slot`).then((r) => r.data),
  });

  if (!pluginHtml) return null;

  return <div dangerouslySetInnerHTML={{ __html: pluginHtml.html }} />;
}
```

- Plugins that only inject CSS/JS into `<head>` continue to work (loaded via Flask base template)
- Plugins that inject into body slots get a `PluginSlot` component
- Plugin JS that depends on `window.init` continues to work
- Plugin JS that depends on Alpine.js / Vue / jQuery may break — document this clearly

### Phase 2: React Plugin API (Post-Migration)

New plugin system for React:

```
CTFd/plugins/my_plugin/
├── __init__.py           # Flask blueprint + React component registration
├── frontend/
│   ├── package.json
│   └── src/
│       └── index.tsx     # Exported React component
```

```tsx
// Plugin registration API (future)
// In Flask __init__.py
from CTFd.plugins import register_react_plugin

register_react_plugin(
    name="my_plugin",
    component="challenge-board-header",  # slot name
    entry_point="frontend/dist/index.js",
)
```

```tsx
// In React app, plugins are loaded dynamically
function PluginSlot({ slot }: { slot: string }) {
  const plugins = usePluginRegistry();
  const slotPlugins = plugins.filter((p) => p.slot === slot);

  return (
    <>
      {slotPlugins.map((Plugin) => (
        <ErrorBoundary key={Plugin.name} fallback={null}>
          <Plugin.component />
        </ErrorBoundary>
      ))}
    </>
  );
}
```

## 6. Fallback Plan

### Error Boundary Redirect

Every route wrapped in `ErrorBoundary` with `legacyFallbackUrl`:

```tsx
<ErrorBoundary legacyFallbackUrl="/challenges">
  <ChallengesPage />
</ErrorBoundary>
```

If the React component crashes (uncaught JS error), the `ErrorBoundary` catches it and redirects to the old Jinja2 page. The user loses no functionality — they just see the old UI.

### Feature Flag / Toggle

Environment variable `REACT_FE_PAGES` controls which pages use React:

```python
# In Flask route
REACT_PAGES = os.environ.get("REACT_FE_PAGES", "").split(",")
# e.g. REACT_FE_PAGES=scoreboard,login

@app.route("/scoreboard")
def scoreboard():
    if "scoreboard" in REACT_FE_PAGES:
        return render_template("react_index.html")  # SPA shell
    return render_template("core/scoreboard.html")  # legacy
```

### Per-Page Rollback

If a page has a critical bug in production:

1. Remove the page name from `REACT_FE_PAGES`
2. Deploy (Flask template fallback takes effect immediately)
3. Fix the React component
4. Re-add the page name
5. Re-deploy

## 7. Testing Requirements During Migration

| Test Type           | Tool                    | When                      | Coverage                                           |
| ------------------- | ----------------------- | ------------------------- | -------------------------------------------------- |
| Unit (component)    | Vitest + RTL            | Per PR for new components | All states: loading, empty, error, populated       |
| API hook            | Vitest + MSW            | Per PR for new queries    | Success + error responses                          |
| Form validation     | Vitest + RTL            | Per PR for new forms      | Valid input, invalid input, submission             |
| Backend integration | pytest                  | Existing test suite       | Ensure API responses unchanged                     |
| Visual regression   | Playwright snapshot     | Per page migration        | Compare React vs legacy screenshot                 |
| E2E (critical path) | Playwright              | Per page migration        | Login → view challenges → submit flag → scoreboard |
| E2E (admin)         | Playwright              | Per admin page            | CRUD operations, config changes                    |
| Accessibility       | axe-core via Playwright | Per page migration        | WCAG 2.1 AA                                        |
| Performance         | Lighthouse CI           | Phase 5                   | LCP < 2.5s, CLS < 0.1                              |

### Test matrix for each migrated page:

```tsx
// Requirements covered by:
describe("ChallengesPage", () => {
  it("renders loading state");
  it("renders challenge cards from API");
  it("renders empty state when no challenges");
  it("renders error state on API failure");
  it("filters by category");
  it("navigates to challenge detail on click");
  it("respects competition visibility settings");
  it("handles solved/unsolved states");
});
```

## 8. File Cleanup Checklist (Per Page)

After a page is fully migrated and verified, remove:

```
### Core Theme
☐ CTFd/themes/core/templates/<page>.html          (Jinja2 template)
☐ CTFd/themes/core/assets/js/<page>.js            (JS entry point)
☐ CTFd/themes/core/assets/scss/<page>.scss        (page-specific SCSS)
☐ CTFd/themes/core/vite.config.js — remove entry  (vite input entry)

### Admin Theme
☐ CTFd/themes/admin/templates/<page>.html         (Jinja2 template)
☐ CTFd/themes/admin/assets/js/pages/<page>.js     (JS entry point)
☐ CTFd/themes/admin/assets/css/<page>.scss        (page-specific SCSS)
☐ CTFd/themes/admin/vite.config.js — remove entry (vite input entry)

### Flask Route
☐ CTFd/views.py — update route to serve react_index.html  (or remove if fully replaced)

### Plugin References
☐ Check CTFd/plugins/ for any templates that extend <page>.html
☐ Check for {% include %} or {% extends %} references to removed template
```

### Final Cleanup (After All Pages Migrated)

```
### Themes
☐ CTFd/themes/core/ — entire directory (archive)
☐ CTFd/themes/admin/ — entire directory (archive)
☐ CTFd/themes/telkom-university/ — entire directory (archive)

### Theme Configuration
☐ CTFd/constants/themes.py — remove ADMIN_THEME, DEFAULT_THEME
☐ Remove theme selection from admin config UI

### Dependencies
☐ Remove Alpine.js, Vue 2, jQuery, Bootstrap from package.json
☐ Remove @ctfdio/ctfd-js (replace with direct fetch/axios calls)
☐ Remove ECharts (replace with recharts or chart.js if still needed)

### Build System
☐ Remove theme build steps from Makefile
☐ Remove theme CI verification (yarn verify)
☐ Remove theme build from Dockerfile
```
