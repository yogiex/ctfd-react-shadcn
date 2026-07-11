# Code Review: Admin Panel — Core Features

**Files reviewed**: ~30 (AdminLayout, Dashboard, Challenges CRUD, Pages CMS, Notifications, Statistics, Plugin System)

---

## Strengths

- **Consistent CRUD hook patterns** — All hooks follow React Query with typed query keys, `onSuccess` invalidation, and the `api` client.
- **Permission gating** — `AdminLayout.tsx` correctly gates on `isAuthenticated` and `isAdmin`.
- **shadcn/ui usage** — Excellent use of AlertDialog for destructive confirmations, Dialog for creation forms, Badge for states, Skeleton for loading.
- **Error/loading/empty states** — Nearly every component handles all three states.
- **CSRF handling** — The `api` client auto-injects CSRF-Token on all mutations.
- **Plugin architecture** — `PluginScriptLoader` with dedup and cleanup is well designed.

---

## Critical Issues

### 1. Query key collision in `useChallengeTypes`

**File**: `AdminChallengeCreatePage.tsx:32-33`

Both `useAdminChallengeTypes` (aliased from `useChallengeTypes` in `useAdminChallenges.ts:88`) and `useChallengeTypes` (from `plugin/hooks/useChallengeTypes.ts`) use the same query key `['admin', 'challenge-types']` and same endpoint `/challenges/types`, but return **different shapes** (`ChallengeType[]` vs `Record<string, ChallengeTypeInfo>`). React Query's key dedup means only one runs — the other gets stale/cached data typed wrong, causing **silent data corruption**.

### 2. `AdminTopicManager` hardcoded `topic_id: 0`

**File**: `AdminTopicManager.tsx:25`

```tsx
const response = await api.post(`/challenges/${challengeId}/topics`, {
  topic_id: 0,
});
```

No topic with ID 0 exists. The `topicSearch` input field is never used to create a topic. This mutation will always fail on the backend.

### 3. `AdminResetPage` bypasses API client entirely

**File**: `AdminResetPage.tsx:52-76`

Uses raw `fetch()` with `(window as any).INITIAL_DATA` instead of the shared `api` client and `getCsrfNonce()`. Duplicates CSRF logic, bypasses error handling middleware (`ApiError`, redirect detection), and is inconsistent with every other admin page.

---

## Important Issues

### 4. Broad query key invalidation in flag/hint/file mutations

**File**: `useAdminChallenges.ts:121,132,162,173,207,238,320`

Mutations like `useUpdateFlag`, `useDeleteHint` invalidate `['admin', 'challenges']` instead of their specific resource keys. Unnecessary re-fetches of the entire challenges list.

### 5. `useDeleteHint` doesn't invalidate hints query

**File**: `useAdminChallenges.ts:167-175` — Only invalidates `['admin', 'challenges']`, not hints specifically.

### 6. `AdminScoreboardPage` uses raw HTML `<table>` instead of shadcn `<Table>`

**File**: `AdminScoreboardPage.tsx:97-139` — Uses `<table>`, `<thead>`, `<tr>`, `<th>` directly. Misses shadcn's built-in styling and dark mode support.

### 7. `PluginFormRenderer` uses `document.querySelector('.plugin-form')`

**File**: `PluginFormRenderer.tsx:24` — Fragile: queries entire document. If multiple plugin forms exist, only the first gets the event listener. Also uses `Record<string, any>`.

### 8. `AdminChallengeCreatePage` uses `(t: any)` type escape

**File**: `AdminChallengeCreatePage.tsx:119` — `Object.values(types ?? {}).map((t: any) => ...)` should be typed as `ChallengeType`.

### 9. `AdminPageEditorPage` lacks client-side validation

**File**: `AdminPageEditorPage.tsx:58-84` — `title` and `route` can be empty; submission will likely fail on backend.

### 10. `AdminStatisticsPage` uses `as any` on params

**File**: `AdminStatisticsPage.tsx:39,51,57` — `{ params: { view: 'admin', per_page: 1 } as any }` defeats type checking.

---

## Minor Issues

### 11. `AdminSidebar` no permission filtering on nav items

**File**: `AdminSidebar.tsx:34-44` — Reset, Config always visible. If CTFd ever supports sub-admin roles, items should be filterable.

### 12. `DashboardPage` uses raw `fetch` instead of `api` client

**File**: `DashboardPage.tsx:7-14` — `fetchCount` uses raw `fetch` with `API_BASE`.

### 13. `AdminHeader` breadcrumb formatting is simplistic

**File**: `AdminHeader.tsx:27-31` — Doesn't handle kebab-case.

### 14. `useEffect` sync pattern in AdminChallengeDetailPage

**File**: `AdminChallengeDetailPage.tsx:96-109` — Syncing fetched data into local state via `useEffect` can cause race conditions with stale closures.

### 15. `PluginFlagFormRenderer` missing `scripts` prop

**File**: `AdminFlagForm.tsx:139-143` — If a plugin flag type has scripts, they won't load.

### 16. `PluginScriptLoader` `scripts.join(',')` in deps

**File**: `PluginScriptLoader.tsx:36` — Creates new string every render.

### 17. `AdminNotificationsPage` no delete notification functionality

Notifications can be created but not deleted from admin UI.

### 18. `AdminRatingsTable` uses `ThumbsUp`/`ThumbsDown` always

Rating `value: number` is only checked for `> 0` vs else. If rating supports 1-5 stars, this breaks.

---

## Assessment

| Criterion            | Result |
| -------------------- | ------ |
| **Quality rating**   | Fair   |
| **Critical issues**  | 3      |
| **Important issues** | 7      |
| **Minor issues**     | 8      |
| **Ready to merge?**  | **No** |

**Key recommendations**:

1. Fix query key collision — de-duplicate `useChallengeTypes` between `useAdminChallenges` and plugin hooks
2. Fix `AdminTopicManager` `topic_id: 0` — implement proper topic search/autocomplete or creation flow
3. Migrate `AdminResetPage` to use the shared `api` client
4. Narrow query invalidation in flag/hint/file mutations to their specific keys
5. Replace raw `<table>` in `AdminScoreboardPage` with shadcn `<Table>`
6. Eliminate `as any` casts
