# Frontend Testing Strategy — CTFd React Refactor

## 1. Testing Pyramid

```
         ╱╲
        ╱  ╲
       ╱ E2E ╲           10% — Playwright
      ╱────────╲
     ╱Integration╲       30% — React Testing Library (page-level)
    ╱──────────────╲
   ╱   Unit Tests    ╲   60% — Vitest (components, hooks, utils)
  ╱────────────────────╲
```

| Layer         | Tool                     | Target % | Run Frequency                |
| ------------- | ------------------------ | -------- | ---------------------------- |
| Unit          | Vitest                   | 60%      | Every commit (pre-push hook) |
| Integration   | Vitest + RTL             | 30%      | Every commit                 |
| E2E           | Playwright               | 10%      | CI per PR, nightly full run  |
| Visual        | Storybook + Chromatic    | —        | CI per PR (review)           |
| Accessibility | axe-core + Lighthouse CI | —        | CI per PR                    |

## 2. Test Tools

| Tool                                               | Purpose                                                     |
| -------------------------------------------------- | ----------------------------------------------------------- |
| **Vitest**                                         | Test runner (compatible with Vite config, fast, ESM-native) |
| **React Testing Library**                          | Component/hook rendering, user-event simulation             |
| **MSW (Mock Service Worker)**                      | API mocking for integration tests                           |
| **Playwright**                                     | E2E cross-browser testing                                   |
| **Storybook**                                      | Visual component development + Chromatic diff               |
| **axe-core** (`@axe-core/playwright` + `jest-axe`) | A11y assertions                                             |
| **Lighthouse CI**                                  | Performance budgets, a11y, SEO audits                       |

## 3. Coverage Targets

| Metric         | Unit | Integration | E2E                            |
| -------------- | ---- | ----------- | ------------------------------ |
| Lines          | ≥80% | ≥70%        | —                              |
| Branches       | ≥75% | ≥65%        | —                              |
| Functions      | ≥80% | ≥70%        | —                              |
| Critical flows | —    | —           | 100% coverage of user journeys |

CI gate: <1% drop in any metric fails the build (mirrors `.codecov.yml` pattern).

## 4. Component Test Patterns

### Conventions

- File: `src/components/ChallengeCard.tsx` → test at `src/components/__tests__/ChallengeCard.test.tsx`
- Co-located `__tests__/` directory per module (mirrors backend pattern)
- Use `render`, `screen`, `fireEvent` / `userEvent` from RTL
- Import `@testing-library/jest-dom` matchers globally in `setup.ts`

### Simple Render Test

```tsx
// src/components/__tests__/ChallengeCard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChallengeCard } from "@/components/ChallengeCard";

describe("ChallengeCard", () => {
  const defaultProps = {
    name: "Crypto 101",
    category: "Cryptography",
    value: 500,
    solved: false,
  };

  it("renders challenge name and category", () => {
    render(<ChallengeCard {...defaultProps} />);
    expect(screen.getByText("Crypto 101")).toBeInTheDocument();
    expect(screen.getByText("Cryptography")).toBeInTheDocument();
  });

  it("shows points value", () => {
    render(<ChallengeCard {...defaultProps} />);
    expect(screen.getByText("500 pts")).toBeInTheDocument();
  });

  it("applies solved styling when solved=true", () => {
    const { container } = render(<ChallengeCard {...defaultProps} solved />);
    expect(container.querySelector(".solved")).toBeInTheDocument();
  });
});
```

### User Interaction Test

```tsx
// src/components/__tests__/ChallengeCard.test.tsx (continued)
import userEvent from "@testing-library/user-event";

it("calls onClick when clicked", async () => {
  const onClick = vi.fn();
  render(<ChallengeCard {...defaultProps} onClick={onClick} />);
  await userEvent.click(screen.getByRole("button"));
  expect(onClick).toHaveBeenCalledOnce();
});
```

### Stateful Component

```tsx
// src/components/__tests__/FlagInput.test.tsx
it("disables submit when input is empty", () => {
  render(<FlagInput challengeId={1} />);
  expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
});

it("enables submit after typing", async () => {
  render(<FlagInput challengeId={1} />);
  const input = screen.getByPlaceholderText("Enter flag...");
  await userEvent.type(input, "CTF{flag}");
  expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();
});
```

## 5. Hook Test Patterns

### Simple Hook

```tsx
// src/hooks/__tests__/useCountdown.test.ts
import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "@/hooks/useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns remaining time in seconds", () => {
    const end = Date.now() + 5000;
    const { result } = renderHook(() => useCountdown(end));
    expect(result.current.remaining).toBe(5);
  });

  it("counts down every second", () => {
    const end = Date.now() + 3000;
    const { result } = renderHook(() => useCountdown(end));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(2);
  });

  it("returns 0 when expired", () => {
    const end = Date.now() - 1000;
    const { result } = renderHook(() => useCountdown(end));
    expect(result.current.remaining).toBe(0);
  });
});
```

### Hook with API Call

```tsx
// src/hooks/__tests__/useChallenge.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { useChallenge } from "@/hooks/useChallenge";

describe("useChallenge", () => {
  it("fetches challenge data by ID", async () => {
    server.use(
      http.get("/api/v1/challenges/1", () =>
        HttpResponse.json({ id: 1, name: "Test Challenge", value: 500 }),
      ),
    );

    const { result } = renderHook(() => useChallenge(1));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.name).toBe("Test Challenge");
  });

  it("handles 404 error", async () => {
    server.use(
      http.get("/api/v1/challenges/999", () =>
        HttpResponse.json({ error: "Not found" }, { status: 404 }),
      ),
    );

    const { result } = renderHook(() => useChallenge(999));
    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.error?.message).toContain("Not found");
  });
});
```

## 6. Integration Test Patterns

### MSW Server Setup

```tsx
// src/test/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

```tsx
// src/test/setup.ts
import "@testing-library/jest-dom";
import { server } from "@/test/mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```tsx
// src/test/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/v1/challenges", () =>
    HttpResponse.json({
      data: [
        { id: 1, name: "Web 101", category: "Web", value: 100, solved_by: 42 },
        {
          id: 2,
          name: "Crypto Fun",
          category: "Crypto",
          value: 200,
          solved_by: 10,
        },
      ],
    }),
  ),
  http.get("/api/v1/scoreboard", () =>
    HttpResponse.json({
      data: [
        { pos: 1, name: "team1", score: 5000 },
        { pos: 2, name: "team2", score: 4200 },
      ],
    }),
  ),
  http.post("/api/v1/challenges/attempt", () =>
    HttpResponse.json({ status: "correct", message: "Correct flag!" }),
  ),
];
```

### Page-Level Integration Test

```tsx
// src/pages/__tests__/ChallengeListPage.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChallengeListPage } from "@/pages/ChallengeListPage";

describe("ChallengeListPage", () => {
  it("renders all challenges from API", async () => {
    render(<ChallengeListPage />);
    await waitFor(() => {
      expect(screen.getByText("Web 101")).toBeInTheDocument();
      expect(screen.getByText("Crypto Fun")).toBeInTheDocument();
    });
  });

  it("filters challenges by category", async () => {
    render(<ChallengeListPage />);
    await userEvent.selectOptions(screen.getByLabelText("Category"), "Web");
    expect(screen.getByText("Web 101")).toBeInTheDocument();
    expect(screen.queryByText("Crypto Fun")).not.toBeInTheDocument();
  });

  it("shows loading state before data arrives", () => {
    render(<ChallengeListPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

## 7. E2E Test Scenarios

All critical user flows in `e2e/` directory:

### Auth Flow

```ts
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("unauthenticated user is redirected to login", async ({ page }) => {
  await page.goto("/challenges");
  await expect(page).toHaveURL(/\/login/);
});

test("user can register and login", async ({ page }) => {
  await page.goto("/register");
  await page.fill('[name="name"]', "testuser");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "strongpass123");
  await page.fill('[name="confirm"]', "strongpass123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/challenges/);
});

test("login with invalid credentials shows error", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="name"]', "wrong");
  await page.fill('[name="password"]', "wrong");
  await page.click('button[type="submit"]');
  await expect(page.locator(".error-message")).toBeVisible();
});
```

### Challenge Flow

```ts
// e2e/challenges.spec.ts
test("user can view challenge list", async ({ page }) => {
  await login(page);
  await page.goto("/challenges");
  await expect(page.locator('[data-testid="challenge-card"]')).toHaveCount(10);
});

test("user can open challenge modal", async ({ page }) => {
  await login(page);
  await page.goto("/challenges");
  await page.click('[data-testid="challenge-card"]:first-child');
  await expect(page.locator('[data-testid="challenge-modal"]')).toBeVisible();
  await expect(
    page.locator('[data-testid="challenge-description"]'),
  ).toBeVisible();
});

test("user can submit correct flag", async ({ page }) => {
  await login(page);
  await page.goto("/challenges");
  await page.click('[data-testid="challenge-card"]:first-child');
  await page.fill('[data-testid="flag-input"]', "CTF{correct_flag}");
  await page.click('[data-testid="submit-flag"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});

test("wrong flag shows error", async ({ page }) => {
  await login(page);
  await page.goto("/challenges");
  await page.click('[data-testid="challenge-card"]:first-child');
  await page.fill('[data-testid="flag-input"]', "wrong_flag");
  await page.click('[data-testid="submit-flag"]');
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});
```

### Scoreboard Flow

```ts
// e2e/scoreboard.spec.ts
test("scoreboard displays top teams", async ({ page }) => {
  await login(page);
  await page.goto("/scoreboard");
  const rows = page.locator('[data-testid="scoreboard-row"]');
  await expect(rows).toHaveCount(20);
  await expect(rows.first()).toContainText("1");
});

test("scoreboard auto-refreshes", async ({ page }) => {
  await login(page);
  await page.goto("/scoreboard");
  const firstScore = await page
    .locator('[data-testid="scoreboard-row"]')
    .first()
    .textContent();
  // trigger a solve via API
  await page.waitForTimeout(5000); // poll interval
  // score should have updated
});
```

### Settings Flow

```ts
// e2e/settings.spec.ts
test("user can update profile", async ({ page }) => {
  await login(page);
  await page.goto("/settings");
  await page.fill('[name="affiliation"]', "Test Org");
  await page.click('button[type="submit"]');
  await expect(page.locator(".toast-success")).toBeVisible();
});

test("user can change password", async ({ page }) => {
  await login(page);
  await page.goto("/settings");
  await page.click('[data-testid="password-tab"]');
  await page.fill('[name="old_password"]', "strongpass123");
  await page.fill('[name="new_password"]', "newpass456");
  await page.fill('[name="confirm"]', "newpass456");
  await page.click('button[type="submit"]');
  await expect(page.locator(".toast-success")).toBeVisible();
});
```

### Admin Flows

```ts
// e2e/admin.spec.ts
test("admin can create challenge", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/challenges");
  await page.click('[data-testid="new-challenge"]');
  await page.fill('[name="name"]', "New Challenge");
  await page.fill('[name="category"]', "Web");
  await page.fill('[name="value"]', "500");
  await page.click('[data-testid="save-challenge"]');
  await expect(page.locator('[data-testid="challenge-row"]')).toContainText(
    "New Challenge",
  );
});

test("admin can delete challenge", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/challenges");
  await page.click('[data-testid="delete-challenge"]:first-child');
  await page.click('[data-testid="confirm-delete"]');
  await expect(page.locator(".toast-success")).toBeVisible();
});

test("admin can view submissions", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/submissions");
  const table = page.locator("table");
  await expect(table).toBeVisible();
  await expect(table.locator("tr")).toHaveCount.atLeast(2);
});
```

## 8. Storybook + Visual Regression

### Setup

```ts
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: { name: "@storybook/react-vite", options: {} },
};

export default config;
```

### Story Example

```tsx
// src/components/ChallengeCard.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ChallengeCard } from "./ChallengeCard";

const meta = {
  title: "Challenges/ChallengeCard",
  component: ChallengeCard,
  tags: ["autodocs"],
} satisfies Meta<typeof ChallengeCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unsolved: Story = {
  args: {
    name: "Crypto 101",
    category: "Cryptography",
    value: 500,
    solved: false,
  },
};

export const Solved: Story = {
  args: {
    name: "Web Exploit",
    category: "Web",
    value: 1000,
    solved: true,
  },
};

export const HighValue: Story = {
  args: {
    name: "Advanced Binary",
    category: "Pwn",
    value: 5000,
    solved: false,
  },
};
```

### Chromatic Integration

```sh
npx chromatic --project-token=<token> --exit-once-uploaded
```

Every PR against `master` triggers a Chromatic build for visual diff review.

## 9. CI Pipeline Configuration

```yaml
# .github/workflows/frontend.yml
name: Frontend CI

on:
  push:
    branches: [master]
    paths: ["frontend/**"]
  pull_request:
    branches: [master]
    paths: ["frontend/**"]

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "yarn"
          cache-dependency-path: frontend/yarn.lock

      - run: yarn install --frozen-lockfile

      - name: Lint
        run: yarn lint

      - name: Type check
        run: yarn typecheck

      - name: Unit + Integration tests
        run: yarn test:ci
        env:
          CI: true

      - name: Upload coverage
        uses: codecov/codecov-action@v5
        with:
          files: ./coverage/coverage-final.json
          flags: frontend
          name: frontend-unit

      - name: E2E tests
        run: yarn test:e2e:ci
        env:
          CI: true

      - name: Upload Playwright artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: frontend/playwright-report/

  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "yarn"
          cache-dependency-path: frontend/yarn.lock

      - run: yarn install --frozen-lockfile
      - run: yarn build
      - run: yarn verify-build # git diff --exit-code for built assets
```

## 10. Migration-Specific Testing

### Screenshot Comparison (theme vs. React)

Use Playwright to capture screenshots of each page from the current Jinja2/Vue theme and compare to the new React SPA.

```ts
// e2e/migration/parity.spec.ts
import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/challenges", name: "challenge-list" },
  { path: "/scoreboard", name: "scoreboard" },
  { path: "/login", name: "login" },
  { path: "/register", name: "register" },
  { path: "/settings", name: "settings" },
  { path: "/admin/challenges", name: "admin-challenges" },
  { path: "/admin/teams", name: "admin-teams" },
  { path: "/admin/submissions", name: "admin-submissions" },
  { path: "/admin/config", name: "admin-config" },
];

PAGES.forEach(({ path, name }) => {
  test(`${name}: layout parity with old theme`, async ({ page }) => {
    // Navigate to current Jinja2 theme
    await page.goto(process.env.OLD_THEME_URL + path);
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      fullPage: true,
      path: `screenshots/old/${name}.png`,
    });

    // Navigate to new React SPA
    await page.goto(process.env.NEW_SPA_URL + path);
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      fullPage: true,
      path: `screenshots/new/${name}.png`,
    });

    // Visual comparison (using pixelmatch or similar)
    const mismatch = await compareScreenshots(
      `screenshots/old/${name}.png`,
      `screenshots/new/${name}.png`,
    );
    expect(mismatch).toBeLessThan(5); // <5% pixel mismatch threshold
  });
});
```

### Functional Parity Checklist

Each core user flow must be tested against both the old and new frontends to ensure identical behavior:

| Flow                  | Old theme                    | New React SPA                | Status  |
| --------------------- | ---------------------------- | ---------------------------- | ------- |
| Register              | `e2e/old/auth.spec.ts`       | `e2e/new/auth.spec.ts`       | Pending |
| Login                 | `e2e/old/auth.spec.ts`       | `e2e/new/auth.spec.ts`       | Pending |
| View challenges       | `e2e/old/challenges.spec.ts` | `e2e/new/challenges.spec.ts` | Pending |
| Submit flag           | `e2e/old/challenges.spec.ts` | `e2e/new/challenges.spec.ts` | Pending |
| View scoreboard       | `e2e/old/scoreboard.spec.ts` | `e2e/new/scoreboard.spec.ts` | Pending |
| Update profile        | `e2e/old/settings.spec.ts`   | `e2e/new/settings.spec.ts`   | Pending |
| Admin CRUD challenges | `e2e/old/admin.spec.ts`      | `e2e/new/admin.spec.ts`      | Pending |

Run parity tests side-by-side before and after each migration milestone. Any behavioral difference is a regression.

### API Contract Validation

```ts
// e2e/migration/api-contract.spec.ts
test("React frontend sends same API payload as old frontend", async ({
  page,
}) => {
  const requests: any[] = [];
  page.on("request", (req) => {
    if (req.url().includes("/api/v1/")) {
      requests.push({
        url: req.url(),
        method: req.method(),
        body: req.postData(),
      });
    }
  });

  // Execute the same user flow in both
  await page.goto(process.env.OLD_THEME_URL + "/challenges");
  await page.fill('[name="flag"]', "CTF{test}");
  await page.click('[type="submit"]');
  const oldRequests = [...requests];

  requests.length = 0;
  await page.goto(process.env.NEW_SPA_URL + "/challenges");
  await page.fill('[name="flag"]', "CTF{test}");
  await page.click('[type="submit"]');
  const newRequests = [...requests];

  // Payloads must match exactly
  expect(newRequests).toEqual(oldRequests);
});
```

## 11. Package.json Scripts

```jsonc
{
  "scripts": {
    // --- Test ---
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:ci": "vitest run --coverage --reporter=default --reporter=junit",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:changed": "vitest run --changed",

    // --- E2E ---
    "test:e2e": "playwright test",
    "test:e2e:ci": "playwright test --reporter=html --reporter=list",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:codegen": "playwright codegen",
    "test:e2e:update-snapshots": "playwright test --update-snapshots",

    // --- Storybook ---
    "storybook": "storybook dev -p 6006",
    "storybook:build": "storybook build",
    "storybook:test": "test-storybook --coverage",
    "storybook:chromatic": "npx chromatic --exit-once-uploaded",

    // --- Lint / Typecheck ---
    "lint": "eslint src/ --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src/ --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write 'src/**/*.{ts,tsx,css}'",

    // --- Accessibility ---
    "test:a11y": "playwright test --config=playwright.a11y.config.ts",
    "lighthouse": "lighthouse-ci https://localhost:4000 --budget-file=lighthouse-budget.json",

    // --- Migration ---
    "test:parity": "playwright test --config=playwright.parity.config.ts",
    "test:api-contract": "playwright test e2e/migration/api-contract.spec.ts",
  },
}
```

### Vitest Config

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.stories.{ts,tsx}",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/types/**",
        "src/test/**",
        "src/vite-env.d.ts",
      ],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
      },
    },
    // CTFd-specific: date mocking for countdown tests
    mockDate: true, // using @vitest/web-worker or similar
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Playwright Config

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
    ["junit", { outputFile: "playwright-report/junit.xml" }],
  ],
  use: {
    baseURL: "http://localhost:4000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "python ../serve.py",
    url: "http://localhost:4000",
    reuseExistingServer: !process.env.CI,
    cwd: "..",
    timeout: 30000,
  },
});
```

## 12. Accessibility Testing

### Unit-Level a11y (jest-axe)

```tsx
// src/components/__tests__/ChallengeCard.a11y.test.tsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { ChallengeCard } from "@/components/ChallengeCard";

expect.extend(toHaveNoViolations);

it("has no accessibility violations", async () => {
  const { container } = render(
    <ChallengeCard name="Test" category="Web" value={100} solved={false} />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### E2E-Level a11y (axe-core + Playwright)

```ts
// e2e/a11y/all-pages.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  "/",
  "/login",
  "/register",
  "/challenges",
  "/scoreboard",
  "/settings",
];

PAGES.forEach((path) => {
  test(`${path}: no critical accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual(
      [],
    );
  });
});
```

### Lighthouse CI Budget

```json
// lighthouse-budget.json
[
  {
    "path": "/",
    "timings": [
      {
        "id": "first-contentful-paint",
        "metric": "first-contentful-paint",
        "budget": { "maxNumericValue": 2500 }
      }
    ],
    "scores": [
      { "id": "accessibility", "budget": { "minScore": 0.9 } },
      { "id": "best-practices", "budget": { "minScore": 0.9 } },
      { "id": "seo", "budget": { "minScore": 0.9 } }
    ]
  }
]
```

## 13. Performance Testing

### Lighthouse CI Automation

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
      - run: npm install -g @lhci/cli@0.14.x
      - run: yarn --cwd frontend install && yarn --cwd frontend build
      - run: lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "staticDistDir": "frontend/dist",
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    },
    "upload": {
      "target": "lhci",
      "serverBaseUrl": "https://your-lhci-server.com"
    }
  }
}
```

### Performance Regression Gates

| Metric                         | Budget     | Severity |
| ------------------------------ | ---------- | -------- |
| First Contentful Paint (FCP)   | < 2.5s     | warn     |
| Largest Contentful Paint (LCP) | < 3.0s     | error    |
| Total Blocking Time (TBT)      | < 300ms    | error    |
| Cumulative Layout Shift (CLS)  | < 0.1      | error    |
| Speed Index                    | < 4.0s     | warn     |
| Bundle size (gzip)             | < 250KB JS | error    |
| Lighthouse Performance score   | ≥ 80       | warn     |
| Lighthouse Accessibility score | ≥ 90       | error    |

### Bundle Size Monitoring

```sh
# manual check
yarn build && npx vite-bundle-analyzer

# CI check (add to frontend.yml)
- run: yarn build --report
- run: |
    MAX_SIZE=$((250 * 1024))  # 250KB
    SIZE=$(stat -c%s dist/assets/*.js | paste -sd+ | bc)
    if [ "$SIZE" -gt "$MAX_SIZE" ]; then
      echo "Bundle size $SIZE exceeds limit $MAX_SIZE"
      exit 1
    fi
```

---

## Appendix: Vitest UI (Recommended Workflow)

Run `yarn test:ui` during development for a rich dashboard with file-watching, test filtering, and coverage overlays:

```sh
yarn test:ui
# opens http://localhost:51204
```

This gives instant feedback while iterating on components and hooks.
