# CTFd React Frontend — Coding Guide

## 1. Project Directory Structure

```
frontend/
├── public/
├── src/
│   ├── api/                    # API client & query hooks
│   │   ├── client.ts           # Axios instance with CSRF interceptor
│   │   ├── queries/            # React Query hooks (one file per domain)
│   │   │   ├── useChallenges.ts
│   │   │   ├── useScoreboard.ts
│   │   │   ├── useTeam.ts
│   │   │   ├── useUser.ts
│   │   │   ├── useConfig.ts
│   │   │   └── useNotifications.ts
│   │   └── mutations/          # React Query mutations
│   │       ├── useSubmitFlag.ts
│   │       ├── useUpdateProfile.ts
│   │       └── ...
│   ├── components/             # Shared UI components
│   │   ├── ui/                 # shadcn/ui primitives (generated)
│   │   ├── layout/             # AppShell, Sidebar, Navbar, Footer
│   │   ├── challenge/          # ChallengeCard, ChallengeBoard, SolveModal
│   │   ├── scoreboard/         # ScoreboardTable, ScoreRow
│   │   ├── auth/               # LoginForm, RegisterForm
│   │   ├── team/               # TeamCard, MemberList, InviteDialog
│   │   ├── user/               # ProfileCard, UserAvatar
│   │   ├── admin/              # AdminPanel, ConfigForm, UserManager
│   │   └── common/             # ErrorBoundary, LoadingSpinner, EmptyState
│   ├── hooks/                  # Shared React hooks
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   ├── useSSE.ts
│   │   └── useCountdown.ts
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ConfigContext.tsx
│   ├── lib/                    # Utility functions
│   │   ├── utils.ts            # cn() helper, misc utilities
│   │   ├── csrf.ts             # CSRF token management
│   │   └── constants.ts        # Route paths, query keys, etc.
│   ├── pages/                  # Route page components (one per route)
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ChallengesPage.tsx
│   │   ├── ChallengeDetailPage.tsx
│   │   ├── ScoreboardPage.tsx
│   │   ├── TeamPage.tsx
│   │   ├── TeamsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   └── admin/
│   │       ├── AdminDashboardPage.tsx
│   │       ├── AdminChallengesPage.tsx
│   │       ├── AdminUsersPage.tsx
│   │       ├── AdminTeamsPage.tsx
│   │       ├── AdminConfigPage.tsx
│   │       ├── AdminSubmissionsPage.tsx
│   │       ├── AdminPagesPage.tsx
│   │       └── AdminScoreboardPage.tsx
│   ├── types/                  # TypeScript type definitions
│   │   ├── api.ts              # API response/request types
│   │   ├── challenge.ts
│   │   ├── team.ts
│   │   ├── user.ts
│   │   ├── config.ts
│   │   └── notification.ts
│   ├── App.tsx                 # Root component (Router + Providers)
│   ├── Router.tsx              # Route definitions
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind directives + CSS variables
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── components.json             # shadcn/ui config
├── .eslintrc.cjs
└── .prettierrc
```

## 2. Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| React components | PascalCase | `ChallengeBoard`, `ScoreRow` |
| Hooks | camelCase, prefixed `use` | `useAuth`, `useCountdown` |
| Utilities | camelCase | `formatScore`, `cn` |
| API functions | camelCase | `fetchChallenges`, `submitFlag` |
| TypeScript types | PascalCase, prefixed `T` (optional) | `Challenge`, `ApiResponse<T>` |
| TypeScript interfaces | PascalCase | `UserProfile`, `ChallengeData` |
| Enums | PascalCase | `ChallengeState`, `UserRole` |
| Files (components) | PascalCase | `ChallengeBoard.tsx` |
| Files (hooks) | camelCase | `useAuth.ts` |
| Files (utilities) | camelCase | `utils.ts` |
| CSS classes | kebab-case (Tailwind) | `bg-background`, `text-muted` |
| Route paths | kebab-case | `/scoreboard`, `/challenge/:id` |
| Query keys | camelCase array | `['challenges']`, `['team', id]` |

## 3. Component Patterns

### Functional components with explicit return types

```tsx
interface ChallengeCardProps {
  challenge: Challenge;
  onSelect: (id: string) => void;
}

export function ChallengeCard({ challenge, onSelect }: ChallengeCardProps) {
  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() => onSelect(challenge.id)}
    >
      <CardHeader>
        <CardTitle>{challenge.name}</CardTitle>
        <CardDescription>{challenge.category}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-mono font-bold">{challenge.value}pts</p>
      </CardContent>
    </Card>
  );
}
```

### Container/Presentational split for complex pages

```tsx
// pages/ChallengesPage.tsx (container)
export function ChallengesPage() {
  const { data: challenges, isLoading } = useChallenges();
  const navigate = useNavigate();

  if (isLoading) return <LoadingSpinner />;

  return <ChallengeBoard challenges={challenges ?? []} onSelect={(id) => navigate(`/challenge/${id}`)} />;
}

// components/challenge/ChallengeBoard.tsx (presentational)
interface ChallengeBoardProps {
  challenges: Challenge[];
  onSelect: (id: string) => void;
}
export function ChallengeBoard({ challenges, onSelect }: ChallengeBoardProps) { ... }
```

## 4. State Management

| State Type | Tool | When to Use |
|-----------|------|-------------|
| Server state | TanStack React Query (`@tanstack/react-query`) | All API data: challenges, scores, users, config |
| Auth state | React Context (`AuthContext`) | Current user, session, permissions |
| Theme state | React Context (`ThemeContext`) | Dark/light mode, persisted to localStorage |
| Competition config | React Context (`ConfigContext`) | CTF start/end times, competition mode |
| Form state | `react-hook-form` + `zod` | All forms: login, register, submit flag, settings |
| UI state (modals, toasts) | Local `useState` or shadcn built-ins | Dialog open/close, sidebar collapse |
| URL state | React Router v6 hooks (`useSearchParams`) | Filters, pagination, sort order |
| Real-time events | Custom `useSSE` hook | Notifications, score updates |

### React Query example

```tsx
// api/queries/useChallenges.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

interface ChallengesResponse {
  success: boolean;
  data: Challenge[];
}

export function useChallenges() {
  return useQuery<ChallengesResponse>({
    queryKey: ['challenges'],
    queryFn: () => api.get('/challenges').then((r) => r.data),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
```

### React Query mutation example

```tsx
// api/mutations/useSubmitFlag.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

interface SubmitFlagInput {
  challengeId: number;
  submission: string;
}

export function useSubmitFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitFlagInput) =>
      api.post('/challenges/attempt', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
}
```

### Auth context

```tsx
// contexts/AuthContext.tsx
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me')
      .then((r) => setUser(r.data.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password });
    setUser(res.data.data);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

## 5. API Call Patterns

### Axios client with CSRF interceptor

```tsx
// api/client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: window.init?.urlRoot ?? '',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const csrf = window.init?.csrfNonce ?? document.querySelector('meta[name="csrf-nonce"]')?.getAttribute('content');
  if (csrf) {
    config.headers['CSRF-Token'] = csrf;
  }
  config.headers['Accept'] = 'application/json';
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // CSRF or session expired — redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### SSE for real-time events

```tsx
// hooks/useSSE.ts
import { useEffect, useRef } from 'react';

export function useSSE(url: string, onMessage: (data: unknown) => void) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(url);
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    es.onerror = () => es.close();
    eventSourceRef.current = es;

    return () => es.close();
  }, [url, onMessage]);
}
```

## 6. Form Patterns (react-hook-form + zod)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useAuth().login;

  const onSubmit = (data: LoginFormData) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...register('username')} />
        {errors.username && <p className="text-destructive text-sm">{errors.username.message}</p>}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register('password')} />
        {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

## 7. Routing Patterns (React Router v6)

```tsx
// src/Router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/challenges" replace /> },
      { path: 'challenges', element: <ChallengesPage /> },
      { path: 'challenge/:id', element: <ChallengeDetailPage /> },
      { path: 'scoreboard', element: <ScoreboardPage /> },
      { path: 'teams', element: <TeamsPage /> },
      { path: 'team/:id', element: <TeamPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'profile/:id', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage />, loader: authLoader },
      { path: 'notifications', element: <NotificationsPage /> },
      {
        path: 'admin',
        element: <AdminShell />,
        loader: adminLoader,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'challenges', element: <AdminChallengesPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'teams', element: <AdminTeamsPage /> },
          { path: 'config', element: <AdminConfigPage /> },
          { path: 'submissions', element: <AdminSubmissionsPage /> },
          { path: 'pages', element: <AdminPagesPage /> },
          { path: 'scoreboard', element: <AdminScoreboardPage /> },
        ],
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]);
```

## 8. TypeScript Rules (Strict Mode)

```jsonc
// tsconfig.json (key settings)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": false,
    "forceConsistentCasingInFileNames": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- Prefer `interface` over `type` for object shapes (extends better)
- Use `type` for unions, intersections, and mapped types
- Mark function return types explicitly (no implicit any)
- Use `as const` for literal types
- Avoid `any` — use `unknown` and narrow with type guards
- All API responses must be typed; no raw `response.data` without a type

## 9. Import Ordering

```
1. React / framework imports          import { useState } from 'react'
2. Third-party libraries              import { useQuery } from '@tanstack/react-query'
3. API / queries / mutations           import { useChallenges } from '@/api/queries/useChallenges'
4. Components                          import { ChallengeCard } from '@/components/challenge/ChallengeCard'
5. Hooks                               import { useAuth } from '@/hooks/useAuth'
6. Contexts                            import { AuthContext } from '@/contexts/AuthContext'
7. Utilities / lib                     import { cn } from '@/lib/utils'
8. Types                               import type { Challenge } from '@/types/challenge'
9. CSS / assets                        import './ChallengeBoard.css'
```

Within each group, sort alphabetically. Use the `@/` path alias for all local imports.

## 10. Error Handling Pattern

```tsx
// components/common/ErrorBoundary.tsx
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** If set, redirects to the old Jinja2 page for this section */
  legacyFallbackUrl?: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: false };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[CTFd] React page crashed:', error, info);
    if (this.props.legacyFallbackUrl) {
      window.location.href = this.props.legacyFallbackUrl;
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <p className="text-destructive p-4">Something went wrong.</p>;
    }
    return this.props.children;
  }
}
```

### API error handling

```tsx
// api/errors.ts
interface ApiError {
  success: false;
  errors: Record<string, string[]>;
  message?: string;
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'success' in error && (error as any).success === false;
}

// Usage in mutation
const { mutate } = useMutation({
  mutationFn: submitFlag,
  onError: (error) => {
    if (isApiError(error)) {
      toast({ variant: 'destructive', title: 'Submission failed', description: error.message });
    }
  },
});
```

## 11. Testing Conventions

- **Framework**: Vitest + React Testing Library
- **Location**: `__tests__/` directory next to the file under test, or `src/__tests__/`
- **Naming**: `ComponentName.test.tsx` or `hookName.test.ts`
- **Coverage targets**: All API hooks, form validation, conditional rendering

```tsx
// __tests__/ChallengeCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChallengeCard } from '@/components/challenge/ChallengeCard';

const mockChallenge = { id: '1', name: 'Test', category: 'Web', value: 500 };

describe('ChallengeCard', () => {
  it('renders challenge name and value', () => {
    render(<ChallengeCard challenge={mockChallenge} onSelect={() => {}} />);
    expect(screen.getByText('Test')).toBeDefined();
    expect(screen.getByText('500pts')).toBeDefined();
  });

  it('calls onSelect on click', async () => {
    const onSelect = vi.fn();
    render(<ChallengeCard challenge={mockChallenge} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

## 12. CSS / Styling

- **Tailwind CSS** for utility-first styling
- **CSS variables** in `index.css` for semantic color tokens (from shadcn/ui)
- **`cn()` utility** for conditional class merging (from `@/lib/utils`)
- Avoid inline styles; prefer Tailwind classes or CSS modules for complex overrides
- Dark mode via `.dark` class on `<html>`, toggled by `ThemeContext`

```tsx
// Example cn() usage
import { cn } from '@/lib/utils';

<Card className={cn('transition-colors', isSelected && 'border-primary', isSolved && 'opacity-60')}>
```
