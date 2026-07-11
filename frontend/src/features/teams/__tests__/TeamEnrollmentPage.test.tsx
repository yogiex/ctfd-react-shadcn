import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeAll } from 'vitest'
import { AuthProvider } from '@/contexts/AuthContext'
import { TeamEnrollmentPage } from '../pages/TeamEnrollmentPage'

beforeAll(() => {
  ;(window as any).INITIAL_DATA = {
    urlRoot: '', csrfNonce: 'test', userMode: 'teams',
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

describe('TeamEnrollmentPage', () => {
  it('renders enrollment prompt when no team', () => {
    render(
      <TestWrapper>
        <TeamEnrollmentPage />
      </TestWrapper>
    )
    expect(screen.getByText('Welcome to CTFd!')).toBeInTheDocument()
    expect(screen.getByText('In order to participate you must either join or create a team.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Join Team' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Team' })).toBeInTheDocument()
  })

  it('navigates to join page when Join Team is clicked', () => {
    render(
      <TestWrapper>
        <TeamEnrollmentPage />
      </TestWrapper>
    )
    const joinBtn = screen.getByRole('button', { name: 'Join Team' })
    expect(joinBtn).toBeInTheDocument()
  })

  it('navigates to create page when Create Team is clicked', () => {
    render(
      <TestWrapper>
        <TeamEnrollmentPage />
      </TestWrapper>
    )
    const createBtn = screen.getByRole('button', { name: 'Create Team' })
    expect(createBtn).toBeInTheDocument()
  })
})
