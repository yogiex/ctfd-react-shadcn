import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { AuthProvider } from '@/contexts/AuthContext'
import { TeamCreatePage } from '../pages/TeamCreatePage'

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

describe('TeamCreatePage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response('', { status: 0 }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders create team form', () => {
    render(
      <TestWrapper>
        <TeamCreatePage />
      </TestWrapper>
    )
    expect(screen.getByText('Create Team')).toBeInTheDocument()
    expect(screen.getByText('Create a new team and invite your teammates')).toBeInTheDocument()
    expect(screen.getByLabelText('Team Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Website')).toBeInTheDocument()
    expect(screen.getByLabelText('Affiliation')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Team' })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <TeamCreatePage />
      </TestWrapper>
    )
    await user.click(screen.getByRole('button', { name: 'Create Team' }))
    await waitFor(() => {
      expect(screen.getByText('Team name is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument()
    })
  })

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <TeamCreatePage />
      </TestWrapper>
    )
    await user.type(screen.getByLabelText('Team Name'), 'test-team')
    await user.type(screen.getByLabelText('Password'), 'pass123')
    await user.type(screen.getByLabelText('Confirm Password'), 'different')
    await user.click(screen.getByRole('button', { name: 'Create Team' }))
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    let resolvePromise: (value: Response) => void
    const fetchPromise = new Promise<Response>((resolve) => { resolvePromise = resolve })
    vi.spyOn(window, 'fetch').mockResolvedValue(fetchPromise)

    const user = userEvent.setup()
    render(
      <TestWrapper>
        <TeamCreatePage />
      </TestWrapper>
    )
    await user.type(screen.getByLabelText('Team Name'), 'test-team')
    await user.type(screen.getByLabelText('Password'), 'pass123')
    await user.type(screen.getByLabelText('Confirm Password'), 'pass123')
    await user.click(screen.getByRole('button', { name: 'Create Team' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
    })
    resolvePromise!(new Response('', { status: 0 }))
  })

  it('shows server error on failure', async () => {
    const errorHtml = '<div class="alert alert-danger">Team name already taken</div>'
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(errorHtml, { status: 200, headers: { 'Content-Type': 'text/html' } })
    )
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <TeamCreatePage />
      </TestWrapper>
    )
    await user.type(screen.getByLabelText('Team Name'), 'existing-team')
    await user.type(screen.getByLabelText('Password'), 'pass123')
    await user.type(screen.getByLabelText('Confirm Password'), 'pass123')
    await user.click(screen.getByRole('button', { name: 'Create Team' }))
    await waitFor(() => {
      expect(screen.getByText('Team name already taken')).toBeInTheDocument()
    })
  })

  it('has link to join page', () => {
    render(
      <TestWrapper>
        <TeamCreatePage />
      </TestWrapper>
    )
    expect(screen.getByText('Join a team')).toHaveAttribute('href', '/teams/join')
  })
})
