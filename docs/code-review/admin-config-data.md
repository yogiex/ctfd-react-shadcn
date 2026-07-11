# Code Review: Admin Panel — Config, Users, Teams, Submissions

**Files reviewed**: ~30 (20 config tabs, admin users/teams/submissions hooks and pages, team feature pages)

---

## Strengths

- **Consistent component patterns** — Config tabs follow uniform `useState+useEffect` sync + `handleSave` pattern. Loading, empty, and error states present throughout.
- **shadcn/ui usage** — `Table`, `Dialog`, `AlertDialog`, `Tabs`, `Select`, `Switch`, `Badge`, `Skeleton`, `Card` properly used.
- **React Query mutations** — `useMutation` with `onSuccess` invalidation used correctly for admin configs, users, teams, submissions.
- **Delete confirmation dialogs** — All destructive actions use `AlertDialog` confirmation.
- **Pagination** — Consistent Previous/Next across admin users, teams, submissions lists.
- **Loading skeletons** — Used instead of text spinners for data tables.

---

## Critical Issues

### 1. Logo/icon upload stores base64 in config — wrong endpoint

**File**: `ConfigLogoTab.tsx:27-31`

```tsx
const reader = new FileReader();
reader.onload = () => onUpdate([{ key, value: reader.result }]);
reader.readAsDataURL(file);
```

**What's wrong**: Stores full base64 data URL as a config value. The old Jinja admin uploads via `POST /configs/logo` which stores a file path. Storing raw base64 in the `Config` table bloats the database and the logo won't render properly (config values have size limits).

**Fix**: Use `api.upload('/configs/upload', formData)` or hit the correct logo upload endpoint.

### 2. Raw `fetch` calls missing CSRF-Token header

**Files**: `useAdminUsers.ts:97-100`, `useAdminTeams.ts:85-88`

```typescript
const res = await fetch(url, {
  headers: { Accept: "application/json" },
  credentials: "same-origin",
});
```

**What's wrong**: The `getPaginated` function uses raw `fetch()` with only `Accept: 'application/json'`. The `CSRF-Token` header is missing. This bypasses the `api` client's interceptor logic entirely.

**Why it matters**: While GET requests typically don't need CSRF, this creates a maintenance risk. If auth logic changes, these raw calls won't be updated.

**Fix**: Add `'CSRF-Token': getCsrfNonce()` to headers, or refactor to use `api.get()`.

### 3. Stale form state in create/edit Dialogs

**Files**: `AdminUsersListPage.tsx:49-56`, `AdminTeamsListPage.tsx:39-47`, `AdminUserDetailPage.tsx:47-58`, `AdminTeamDetailPage.tsx:46-55`

```tsx
const [name, setName] = useState(user?.name ?? "");
```

**What's wrong**: When Dialog `open` toggles but the component remains mounted (rendered unconditionally for create), stale field values persist between opens.

**Fix**: Add `key` prop tied to dialog open state, or use `useEffect` to sync when prop changes, or use React Hook Form.

### 4. `as any` type assertions on API calls

**Files**:

- `ConfigBackupTab.tsx:19` — `headers: { Accept: 'application/octet-stream' } as any`
- `useAdminTeams.ts:182` — `api.delete(\`/teams/${teamId}/members\`, { params: { user_id: userId } } as any)`
- `useAdminSubmissions.ts:22` — `api.get<Submission[]>('/submissions', { params: { ...params, view: 'admin' } as any })`

Hides type errors instead of properly extending API client method signatures.

### 5. Team feature pages don't use React Query

**Files**: `TeamsListPage.tsx`, `TeamPublicProfile.tsx`, `TeamPrivatePage.tsx`

All use manual `useState` + `useEffect` + raw `fetch`/`api.get` patterns. No caching, no stale-time management, no automatic refetch on focus.

---

## Important Issues

### 6. `(window as any).INITIAL_DATA?.urlRoot` type casting

**Files**: `useAdminUsers.ts:87`, `useAdminTeams.ts:75` — Should use a typed utility instead of casting `window` to `any`.

### 7. Pagination heuristic instead of metadata in submissions

**File**: `AdminSubmissionsPage.tsx:262` — Uses `submissions.length < 50` to guess whether more pages exist. The backend returns pagination metadata but the response type doesn't include it.

### 8. `datetime-local` inputs omit timezone

**Files**: `ConfigTimeTab.tsx:40-41`, `ConfigChallengesTab.tsx:99-104`

`datetime-local` produces `YYYY-MM-DDTHH:MM` without timezone. CTFd backend expects ISO 8601 with timezone. Non-UTC admins will set wrong times.

### 9. Single `isBusy` state disables all action buttons

**Files**: `ConfigFieldsTab.tsx:144`, `ConfigBracketsTab.tsx:116`

```tsx
isBusy =
  createField.isPending || updateField.isPending || deleteField.isPending;
```

User can't create a new field while a delete is ongoing. Should use per-action loading states.

### 10. ECharts tree-shaking import path fragility

**Files**: `TeamPublicProfile.tsx:27`, `TeamPrivatePage.tsx:43`

Imports from `echarts-for-react/lib/core` — internal module path that could change with library upgrades.

### 11. ConfigChallengesTab has duplicate visibility fields

`ConfigChallengesTab.tsx:21-23` manages `challenge_visibility`, `score_visibility`, `account_visibility` which are also in `ConfigVisibilityTab.tsx`. Last-saved tab wins — confusing for admins.

### 12. `TeamsListPage` redirect detection using `opaqueredirect`

**File**: `TeamsListPage.tsx:68` — Non-standard pattern. Normal fetch doesn't produce `opaqueredirect`.

---

## Minor Issues

### 13. Hardcoded language list in ConfigLocalizationTab

**File**: `ConfigLocalizationTab.tsx:18-28` — Should read available languages from backend or `window.init`.

### 14. Missing `key` prop for Dialog re-renders

**File**: `AdminUsersListPage.tsx:49` — Add `key={user?.id ?? 'create'}` to ensure clean remounting.

### 15. Search triggers API calls on every keystroke

**Files**: `AdminUsersListPage.tsx:254`, `AdminTeamsListPage.tsx:204` — Should debounce (300ms).

### 16. No empty/loading state for `ConfigBackupTab`

**File**: `ConfigBackupTab.tsx:52-101` — Import/export buttons don't show progress feedback for long operations.

### 17. `ConfigSection` uses `onSave` prop instead of form submission pattern

**File**: `ConfigSection.tsx:32-36` — Each tab has its own Save button. Old admin had single Save button at page level.

### 18. `ConfigMLCTab` sends `mlc_client_secret` as plain config value

**File**: `ConfigMLCTab.tsx:30`

---

## Assessment

| Criterion            | Result |
| -------------------- | ------ |
| **Quality rating**   | Good   |
| **Critical issues**  | 5      |
| **Important issues** | 7      |
| **Minor issues**     | 6      |
| **Ready to merge?**  | **No** |

**Key recommendations**:

1. Fix logo/icon upload to use proper multipart upload endpoint (critical UX/data corruption)
2. Add CSRF-Token to raw `fetch` calls and/or refactor to use `api` client (critical for admin security)
3. Add `key` props or `useEffect` sync to all dialog form components to avoid stale state
4. Migrate team feature pages to React Query hooks for consistency
5. Remove `as any` casts by properly typing API client method signatures
6. Address `datetime-local` timezone omission in Time/Challenges config tabs
