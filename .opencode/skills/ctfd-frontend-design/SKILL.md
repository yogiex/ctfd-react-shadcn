---
name: ctfd-frontend-design
description: |
  Design lead guidance for CTFd's React+shadcn frontend. Covers typography (Inter + JetBrains Mono),
  functional color theming via CSS variables, motion design for competition UX, component anatomy for
  ChallengeBoard/Scoreboard/Admin panels, dark mode, responsive breakpoints, and WCAG accessibility.
---

# CTFd Frontend Design

Act as the design lead for CTFd, a Capture The Flag platform used by cybersecurity
competitions worldwide. The audience is technical (security researchers, students,
hobbyists) — they value clarity, speed, and density over decoration. The UI must
feel intentional and trustworthy, never generic or templated.

## Ground it in the subject

CTFd's world: terminals, scoreboards, exploit code, dashboards, real-time
competition pressure. Every design choice should serve a competitor who needs to
parse information fast under time pressure. The hero of each page is the data —
challenges, flags, scores, standings. The UI is a frame around that data, not
the spectacle itself.

## Principles

**Typography carries the personality.** Pair a monospace or technical display face
(e.g., JetBrains Mono, DM Mono) for code-adjacent data (challenge names, scores,
flags) with a highly readable sans (e.g., Inter, Plus Jakarta Sans) for body text.
Avoid purely decorative fonts — the audience reads them as untrustworthy. Set a
crisp type scale: 14px body minimum, tight line-height (1.4), generous letter-spacing
on uppercase labels.

**Structure is information.** CTF pages are inherently hierarchical (challenges
grouped by category, submissions ordered by time, standings sorted by score).
Use structural devices that encode real meaning: category headers, score badges,
timestamp labels, solved/unsolved states. Numbered markers (01, 02, 03) only if
the content genuinely forms a sequence.

**Color carries state, not decoration.** The palette serves a functional purpose:

- `green` = solved / correct
- `red` = incorrect / error / banned
- `yellow` = pending / ratelimited
- `blue` = info / hint
- Neutral grays for backgrounds, borders, secondary text
- One accent color for CTF branding (configurable via `--ctf-accent`)

Use Tailwind CSS variables (`--primary`, `--destructive`, etc.) via shadcn/ui's
theme system so admins can customize the accent. Avoid multiple competing accent
colors — one is enough.

**Motion is purpose-driven.** Use micro-interactions for feedback only:

- Button loading spinner on flag submit
- Solved challenge card crossfade (not a flashy animation)
- Scoreboard row highlight on your own team/user
- Toast slide-in for notifications

No decorative animations, no parallax, no scroll-triggered reveals. CTF
competitors want information, not a show.

**Match complexity to the vision.** CTFd is a tool, not a marketing site. Keep
the UI minimal and precise. Every pixel should earn its place. If a component
does not carry information or afford an action, remove it.

## Tailwind + shadcn/ui usage

- All UI components come from shadcn/ui: `Button`, `Card`, `Dialog`, `Table`,
  `Badge`, `Tabs`, `Select`, `Input`, `Switch`, `Toast`
- Customize via `globals.css` CSS variables — never override with one-off colors
- Use Tailwind's `dark:` prefix for dark mode; the theme toggle sets `.dark` on `<html>`
- Keep component files small: one component, one file, co-located with its feature
- Use `cn()` from `@/lib/utils` for conditional class merging
- Icons: `lucide-react` only. Never Font Awesome or inline SVGs.

## Color theming (CSS variables)

In `globals.css`, define:

```css
:root {
  --ctf-accent: 221 83% 53%; /* blue-600 — configurable */
  --ctf-solved: 142 71% 45%; /* green-600 */
  --ctf-incorrect: 0 84% 60%; /* red-500 */
  --ctf-ratelimited: 48 96% 53%; /* yellow-500 */

  /* shadcn/ui overrides */
  --primary: var(--ctf-accent);
  --success: var(--ctf-solved);
  --destructive: var(--ctf-incorrect);
  --warning: var(--ctf-ratelimited);
}

.dark {
  /* Dark mode variants — maintain same hue, adjust lightness */
}
```

## Typography

```css
/* In globals.css or layout */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

/* Usage in Tailwind config */
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

## Component anatomy for key CTFd views

### ChallengeBoardPage

```
┌─────────────────────────────────────────────────┐
│  Challenges                          Filter [▼] │
│                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Web      │ │ Crypto   │ │ Pwn      │          │
│  │          │ │          │ │          │          │
│  │ SQL Inj  │ │ RSA-300  │ │ Buffer   │          │
│  │ 500pts   │ │ 64 solves│ │ 300pts   │          │
│  │ ✅ solved│ │          │ │          │          │
│  └──────────┘ └──────────┘ └──────────┘          │
│                                                   │
│  ┌──────────┐ ┌──────────┐                       │
│  │ Forensics│ │ Misc     │                       │
│  │          │ │          │                       │
│  │ pcap-1   │ │ Squid    │                       │
│  │ 200pts   │ │ Game     │                       │
│  │          │ │ 150pts   │                       │
│  └──────────┘ └──────────┘                       │
└─────────────────────────────────────────────────┘
```

### ChallengeModal

```
┌───────────────────────────────────────────────────┐
│  SQL Injection                         [✕]        │
│  500pts  •  Web  •  42 solves  •  ✅ solved       │
│                                                    │
│  ┌─────────────┬──────┬──────┬──────┐              │
│  │ Challenge   │Solves│Subm. │  Sol │              │
│  ├─────────────┴──────┴──────┴──────┤              │
│  │  Description HTML...              │              │
│  │  [Download files]                 │              │
│  │                                   │              │
│  │  Hints:                           │              │
│  │  ▼ [ -10pts ] Try looking at...   │              │
│  │                                   │              │
│  │  Flag: [________________] [Submit]│              │
│  │  Attempts: 1/10                   │              │
│  └───────────────────────────────────┘              │
└───────────────────────────────────────────────────┘
```

### ScoreboardPage

```
┌─────────────────────────────────────────────────┐
│  Scoreboard                  Bracket: [All] [▼] │
│                                                   │
│  ┌───────────────────────────────────────┐       │
│  │  📈 Score Graph (ECharts, top 10)     │       │
│  └───────────────────────────────────────┘       │
│                                                   │
│  #  Team/User         Score   Solves              │
│  1  🥇 team_hack     4500     9                   │
│  2  🥈 pwner         4200     8                   │
│  3  🥉 cr3amy        4000     7                   │
│  ...                                             │
│  42 you              1200     3                   │
└─────────────────────────────────────────────────┘
```

### AdminChallengeDetail (multi-tab editor)

```
┌───────────────────────────────────────────────────┐
│  Admin  /  Challenges  /  SQL Injection    [Save] │
│                                                    │
│  ┌───┬──────┬──────┬──────┬────┬────┬────┬────┐   │
│  │De │Flags │Hints │Files │Tags│Req │Sol │Com │   │
│  ├───┴──────┴──────┴──────┴────┴────┴────┴────┤   │
│  │  Name: [___________________________]         │   │
│  │  Category: [Web ______▼]  Value: [500]      │   │
│  │  Type: [standard _____▼]  Max Attempts: [0] │   │
│  │  Description:                               │   │
│  │  ┌─────────────────────────────────────────┐ │   │
│  │  │ Markdown editor (CodeMirror)             │ │   │
│  │  └─────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Do

- Use white/gray card backgrounds with subtle borders for challenge cards
- Show solved status with a green accent (not an overlay or badge — a subtle left border or icon)
- Use monospace for: challenge names, flag input, code blocks, raw data
- Keep the flag submission form prominent (primary action = submit flag)
- Show attempt count as a small muted label
- Group challenges by category with sticky category headers
- Use Badge components from shadcn/ui for tags, categories, solve counts
- Make scoreboard rows highlight on hover and for the current user
- Use Toast for notification delivery (not modal — CTF competitors should not dismiss modals)

## Don't

- Don't use Bootstrap classes (we're on shadcn/ui now)
- Don't use Font Awesome (use lucide-react)
- Don't use gradient backgrounds or glassmorphism
- Don't use heavy shadows or 3D effects
- Don't animate challenge cards entering the DOM
- Don't show loading spinners for cached data (React Query handles this)
- Don't use centered layout for data-heavy pages (challenges, scoreboard should be full-width)
- Don't put the flag input in a modal footer — it's the main action

## Dark mode

CTF competitors often work late at night. Dark mode is not optional — it must
be first-class. Use shadcn/ui's built-in dark mode via `.dark` class on `<html>`.

Dark mode palette:

- Background: `hsl(222 47% 11%)` (very dark blue-gray, not pure black — reduces eye strain)
- Card: `hsl(217 33% 17%)`
- Border: `hsl(216 34% 23%)`
- Text: `hsl(210 40% 98%)`
- Muted: `hsl(215 20% 65%)`

The same functional color coding applies (green=correct, red=incorrect) but with
slightly desaturated values to reduce glare.

## Responsive

- **Desktop (≥1024px)**: Multi-column challenge grid, full scoreboard table, side-by-side admin tabs
- **Tablet (768-1023px)**: 2-column challenge grid, scoreboard graph hidden, admin tabs become accordion
- **Mobile (<768px)**: Single column, challenge modal full-screen, scoreboard as list (no graph)
- Challenge category headers should stick to top on scroll
- Admin sidebar collapses to hamburger on mobile

## Accessibility

CTFd should be usable by everyone. Follow WCAG 2.1 AA:

- All interactive elements focusable and have visible focus rings
- Color is never the sole indicator of state (add icons/text: ✅ solved, ❌ incorrect)
- Form inputs have associated labels (not placeholders as labels)
- Error messages are announced to screen readers
- Scoreboard tables have proper `<th>` scope attributes
- Keyboard navigation works for challenge grid (arrow keys) and modals (Escape to close)

## File structure for new components

```
frontend/src/features/{feature}/
├── components/
│   ├── ChallengeBoard.tsx        # Page-level
│   ├── ChallengeCard.tsx          # Card in grid
│   └── ChallengeModal.tsx         # Detail dialog
├── hooks/
│   └── useChallenges.ts           # React Query hook
├── types/
│   └── challenge.ts              # TypeScript interfaces
└── __tests__/
    ├── ChallengeCard.test.tsx
    └── ChallengeBoard.test.tsx
```
