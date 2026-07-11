# Code Review: Challenges + Scoreboard + User Features

**Files reviewed**: ~30 (challenge board, challenge modal, flag submission, hints, scoreboard table/graph, user/team profiles, settings)

---

## Strengths

- **FlagSubmissionForm status UI** (`FlagSubmissionForm.tsx:73-89`) — Excellent mapping of all 5 CTFd submission statuses (correct, incorrect, already_solved, ratelimited, paused) to distinct icons + color variants. Dark mode handled via `dark:` variants.
- **ChallengeCard solved indicator** (`ChallengeCard.tsx:21,28-30`) — Green `border-l-4` + `CheckCircle2` icon provides clear visual solved state.
- **ChallengeBoard empty/loading/error states** (`ChallengeBoard.tsx:40-83`) — All three states handled with skeleton grid, destructive Alert with retry, and empty state with icon.
- **useChallengeDetail disabled when null** — Prevents unnecessary API calls when modal is closed. Same pattern in `useChallengeSolves` and `useHint`.
- **ScoreboardPage bracket filtering** (`ScoreboardPage.tsx:27-31`) — Client-side filter using `useMemo`, correct and efficient.
- **ChallengeSolvesList key uniqueness** (`ChallengeSolvesList.tsx:64`) — Uses composite key `${account_id}-${date}` to handle duplicate entries.

---

## Critical Issues

### 1. `useSubmitFlag` doesn't invalidate challenge detail — stale data in modal

**File**: `useSubmitFlag.ts:12-14`

```tsx
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHALLENGES] });
};
```

**What's wrong**: Only challe nge list (`['challenges']`) is invalidated. Challenge detail query key is `['challenges', id]`. After submitting, the modal still shows old `attempts`, `solved_by_me: false`, and stale `solves` count.

**Fix**: Add both:

```tsx
queryClient.invalidateQueries({
  queryKey: ["challenges", variables.challenge_id],
});
```

### 2. `UsersListPage` uses raw `fetch()` — bypasses CSRF, error handling, urlRoot

**File**: `UsersListPage.tsx:58-84`

```typescript
const url = `/api/v1/users?...`;
const res = await fetch(url, {
  headers: { Accept: "application/json" },
  redirect: "manual",
});
```

**Why it matters**: Contagious anti-pattern. While GET requests don't need CSRF, any future developer adding a mutation here would need to remember CSRF manually. All existing API client logic (error parsing, urlRoot prefixing, redirect detection) is duplicated.

### 3. User/Profile pages use `useEffect`+`useState` instead of React Query

**Files**: `UserPublicProfile.tsx:58-81`, `UserPrivateProfile.tsx:75-97`, `SettingsPage.tsx:88-113`

All three manually fetch via `useEffect` with `Promise.all(...)`. No `useQuery` caching: navigating between users re-fetches `/users/me`, no deduplication, no background refetch.

### 4. `HintPanel` uses `dangerouslySetInnerHTML` without DOMPurify

**File**: `HintPanel.tsx:106-109`

```tsx
<div
  dangerouslySetInnerHTML={{ __html: hintData.content }}
  className="prose prose-sm dark:prose-invert max-w-none"
/>
```

`ChallengeDescriptionRenderer` DOES use `DOMPurify.sanitize()`, but `HintPanel` does not. XSS vector if admin account is compromised.

### 5. `ChallengeModal` doesn't wire up `challenge.script` — breaks dynamic challenges

**File**: `ChallengeModal.tsx:141-143`

```tsx
<ChallengeDescriptionRenderer html={challenge?.view || ""} />
```

`ChallengeDescriptionRenderer` supports a `scripts` prop to inject JS, but `ChallengeModal` never passes it. Challenges requiring embedded scripts will silently fail.

**Fix**: Pass `scripts={challenge?.script ? [challenge.script] : []}`.

---

## Important Issues

### 6. `ChallengeModal` doesn't check `challenge.state === 'hidden'`

**File**: `ChallengeModal.tsx:125-224`

No guard for hidden challenges. The old template showed "Challenge is hidden."

### 7. Scoreboard has no frozen-state indicator

**File**: `ScoreboardPage.tsx`

No awareness of score freezing. Users lose the contextual "Scores are frozen" banner.

### 8. `SettingsPage` password change has no validation

**File**: `SettingsPage.tsx:35-46,131-134`

No Zod refinement requiring `confirm` when `password` is set. API receives `password=abc&confirm=` and fails with unhelpful error.

### 9. ChallengeBoard category filter uses raw `<button>` instead of shadcn `ToggleGroup`

**File**: `ChallengeBoard.tsx:88-112` — Same in `BracketFilter.tsx:14-38`

### 10. `useHint` uses hardcoded query key instead of `QUERY_KEYS.HINTS` constant

**File**: `useHint.ts:13` — `queryKey: ['hints', id]` ignores existing `QUERY_KEYS.HINTS(id)` constant. Same in `useScoreboardDetail` and `useBrackets`.

### 11. Duplicate `Solve` and `AwardItem` type definitions

**Files**: `UserPublicProfile.tsx:33-48`, `UserPrivateProfile.tsx:52-66` — Nearly identical interfaces duplicated across files.

### 12. FlagSubmissionForm cooldown is hardcoded (5s) instead of using `Retry-After` header

**File**: `FlagSubmissionForm.tsx:59-61`

### 13. ChallengeCard solved border causes layout shift

**File**: `ChallengeCard.tsx:20-21` — Adding `border-l-4` on solved shifts content 3px. Fix: always apply `border-l-4` but toggle color.

### 14. `UsersListPage` non-null assertion on potentially null `pagination.prev`/`next`

**File**: `UsersListPage.tsx:209,217`

### 15. `ChallengeModal` unused `Card` import

**File**: `ChallengeModal.tsx:18`

---

## Minor Issues

### 16. Redundant spread on query keys

**Files**: `useChallengeDetail.ts:8`, `useChallengeSolves.ts:8` — `[...QUERY_KEYS.CHALLENGE(id ?? 0)]` should be `QUERY_KEYS.CHALLENGE(id ?? 0)`.

### 17. `ScoreboardGraph` hardcoded color palette

**File**: `ScoreboardGraph.tsx:21-25` — Fixed hex values may have poor contrast in dark mode.

### 18. `useRating.ts` uses `PUT` — verify against actual CTFd API

**File**: `useRating.ts:9` — CTFd rating endpoint typically expects `POST`.

### 19. `scripts.join(',')` as effect dependency

**File**: `ChallengeDescriptionRenderer.ts:57` — Creates new string each render. Should use `scripts` directly.

### 20. `ChallengeBoardPage` wraps in fragment

**File**: `ChallengeBoardPage.tsx:15` — Fragments are fine but `<div>` is more predictable for external styling.

---

## Assessment

| Criterion            | Result |
| -------------------- | ------ |
| **Quality rating**   | Good   |
| **Critical issues**  | 5      |
| **Important issues** | 10     |
| **Minor issues**     | 5      |
| **Ready to merge?**  | **No** |

**Key recommendations**:

1. Fix stale challenge detail post-submission — users won't see their solved state update without closing/reopening the modal
2. Migrate user/profile pages to React Query — extract `useUserProfile()`, `useUserSolves()`, etc.
3. Create shared types file (`features/users/types/user.ts`) to deduplicate `Solve`/`AwardItem` interfaces
4. Add DOMPurify sanitization to `HintPanel`
5. Wire up `challenge.script` in `ChallengeModal`
