import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { AuthProvider } from '@/contexts/AuthContext'
import { TeamInvitePage } from '../pages/TeamInvitePage'

beforeAll(() => {
  ;(window as any).INITIAL_DATA = {
    urlRoot: '', csrfNonce: 'test-csrf', userMode: 'teams',
    userId: null, userName: null, userEmail: null, userVerified: false,
    teamId: null, teamName: null, start: null, end: null, themeSettings: {},
  }
})

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

function renderWithRoute(route: string) {
  window.history.pushState({}, '', route)
  return render(
    <TestWrapper>
      <TeamInvitePage />
    </TestWrapper>
  )
}

describe('TeamInvitePage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response('', { status: 0 })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows invalid invite when no code provided', () => {
    renderWithRoute('/teams/invite')
    expect(screen.getByText('Invalid Invite')).toBeInTheDocument()
    expect(screen.getByText('No invite code was provided. Please check the invite link you received.')).toBeInTheDocument()
    expect(screen.getByText('Go to Teams')).toHaveAttribute('href', '/teams')
  })

  it('renders accept invite view with team name', async () => {
    const teamNameHtml = '<html>Welcome to <strong>Awesome Team</strong></html>'
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(teamNameHtml, { status: 200 })
    )
    renderWithRoute('/teams/invite?code=abc123')
    await waitFor(() => {
      expect(screen.getByText('Welcome to Awesome Team!')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Accept Invite' })).toBeInTheDocument()
  })

  it('renders accept invite view without team name when fetch fails', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('Network error'))
    renderWithRoute('/teams/invite?code=abc123')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Accept Invite' })).toBeInTheDocument()
    })
  })

  it('shows loading state during accept', async () => {
    let resolvePromise: (value: Response) => void
    const fetchPromise = new Promise<Response>((resolve) => { resolvePromise = resolve })
    vi.spyOn(window, 'fetch').mockResolvedValue(fetchPromise)

    renderWithRoute('/teams/invite?code=abc123')
    const acceptBtn = await screen.findByRole('button', { name: 'Accept Invite' })
    const user = userEvent.setup()
    await user.click(acceptBtn)

    await waitFor(() => {
      expect(screen.getByText('Joining Team')).toBeInTheDocument()
    })
    resolvePromise!(new Response('', { status: 0 }))
  })

  it('shows error on failed accept', async () => {
    const errorHtml = '<div class="alert alert-danger">This invite link is invalid or expired.</div>'
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(errorHtml, { status: 403 })
    )
    renderWithRoute('/teams/invite?code=badcode')
    const acceptBtn = await screen.findByRole('button', { name: 'Accept Invite' })
    const user = userEvent.setup()
    await user.click(acceptBtn)

    await waitFor(() => {
      expect(screen.getByText('Invite Error')).toBeInTheDocument()
      expect(screen.getByText('This invite link is invalid or expired.')).toBeInTheDocument()
    })
  })

  it('has link to create team on error page', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response('<div class="alert alert-danger">Error</div>', { status: 403 })
    )
    renderWithRoute('/teams/invite?code=badcode')
    const acceptBtn = await screen.findByRole('button', { name: 'Accept Invite' })
    const user = userEvent.setup()
    await user.click(acceptBtn)

    await waitFor(() => {
      expect(screen.getByText('Create a new team')).toHaveAttribute('href', '/teams/new')
    })
  })
})
