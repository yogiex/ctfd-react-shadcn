import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { AuthProvider } from '@/contexts/AuthContext'
import { RegisterPage } from '../pages/RegisterPage'

beforeAll(() => {
  ;(window as any).INITIAL_DATA = {
    urlRoot: '', csrfNonce: 'test-csrf', userMode: 'users',
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

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response('', { status: 0 }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders registration form', () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    )
    expect(screen.getByText('Create Account')).toBeInTheDocument()
    expect(screen.getByLabelText('User Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument()
  })

  it('shows loading state during submission', async () => {
    let resolvePromise: (value: Response) => void
    const fetchPromise = new Promise<Response>((resolve) => { resolvePromise = resolve })
    vi.spyOn(window, 'fetch').mockResolvedValue(fetchPromise)

    const user = userEvent.setup()
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    )
    await user.type(screen.getByLabelText('User Name'), 'testuser')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
    })
    resolvePromise!(new Response('', { status: 0 }))
  })

  it('shows success state after successful registration', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response('', { status: 302 }))
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    )
    await user.type(screen.getByLabelText('User Name'), 'testuser')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() => {
      expect(screen.getByText('Registration Submitted')).toBeInTheDocument()
      expect(screen.getByText('Your account has been created. You can now sign in.')).toBeInTheDocument()
    })
    expect(screen.getByText('Sign In')).toHaveAttribute('href', '/login')
  })

  it('shows server error on registration failure', async () => {
    const errorHtml = '<div class="alert alert-danger">Username already taken</div>'
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(errorHtml, { status: 200 })
    )
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    )
    await user.type(screen.getByLabelText('User Name'), 'existing')
    await user.type(screen.getByLabelText('Email'), 'existing@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() => {
      expect(screen.getByText('Username already taken')).toBeInTheDocument()
    })
  })

  it('shows network error when fetch fails', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    )
    await user.type(screen.getByLabelText('User Name'), 'testuser')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument()
    })
  })

  it('has link to login page', () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    )
    expect(screen.getByText('Sign In')).toHaveAttribute('href', '/login')
  })
})
