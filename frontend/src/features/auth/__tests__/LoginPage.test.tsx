import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeAll } from 'vitest'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoginPage } from '../pages/LoginPage'

beforeAll(() => {
  ;(window as any).INITIAL_DATA = {
    urlRoot: '', csrfNonce: 'test', userMode: 'users',
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

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )
    expect(screen.getAllByText('Sign In').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByLabelText('User Name or Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('has link to register page', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )
    expect(screen.getByText('Register')).toHaveAttribute('href', '/register')
  })

  it('has link to forgot password', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )
    expect(screen.getByText('Forgot password?')).toHaveAttribute('href', '/reset_password')
  })
})
