import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { AuthProvider } from '@/contexts/AuthContext'
import { TeamJoinPage } from '../pages/TeamJoinPage'

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

describe('TeamJoinPage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response('', { status: 0 }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders join team form', () => {
    render(
      <TestWrapper>
        <TeamJoinPage />
      </TestWrapper>
    )
    expect(screen.getByText('Join Team')).toBeInTheDocument()
    expect(screen.getByText('Enter the team name and password to join an existing team')).toBeInTheDocument()
    expect(screen.getByLabelText('Team Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Join Team' })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <TeamJoinPage />
      </TestWrapper>
    )
    await user.click(screen.getByRole('button', { name: 'Join Team' }))
    await waitFor(() => {
      expect(screen.getByText('Team name is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    let resolvePromise: (value: Response) => void
    const fetchPromise = new Promise<Response>((resolve) => { resolvePromise = resolve })
    vi.spyOn(window, 'fetch').mockResolvedValue(fetchPromise)

    const user = userEvent.setup()
    render(
      <TestWrapper>
        <TeamJoinPage />
      </TestWrapper>
    )
    await user.type(screen.getByLabelText('Team Name'), 'my-team')
    await user.type(screen.getByLabelText('Password'), 'pass123')
    await user.click(screen.getByRole('button', { name: 'Join Team' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /joining/i })).toBeDisabled()
    })
    resolvePromise!(new Response('', { status: 0 }))
  })

  it('shows server error on failure', async () => {
    const errorHtml = '<div class="alert alert-danger">Invalid team name or password</div>'
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(errorHtml, { status: 200, headers: { 'Content-Type': 'text/html' } })
    )
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <TeamJoinPage />
      </TestWrapper>
    )
    await user.type(screen.getByLabelText('Team Name'), 'bad-team')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Join Team' }))
    await waitFor(() => {
      expect(screen.getByText('Invalid team name or password')).toBeInTheDocument()
    })
  })

  it('has link to create page', () => {
    render(
      <TestWrapper>
        <TeamJoinPage />
      </TestWrapper>
    )
    expect(screen.getByText('Create a team')).toHaveAttribute('href', '/teams/new')
  })
})
