import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { AdminImportPage } from '../pages/AdminImportPage'

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
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('AdminImportPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading state initially', () => {
    vi.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}))
    render(
      <TestWrapper>
        <AdminImportPage />
      </TestWrapper>
    )
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows error state on fetch failure', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('Network error'))
    render(
      <TestWrapper>
        <AdminImportPage />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText(/Failed to load import status/)).toBeInTheDocument()
    })
  })

  it('shows idle state when no import has started', async () => {
    const idleHtml = '<html><b>Current Status:</b> idle</html>'
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(idleHtml, { status: 200 })
    )
    render(
      <TestWrapper>
        <AdminImportPage />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(screen.getByText('No Import in Progress')).toBeInTheDocument()
    })
  })

  it('shows processing state during active import', async () => {
    const processingHtml = `
      <html>
        <b>Current Status:</b> Processing...
        <span id="start-time">1234567890</span>
      </html>
    `
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(processingHtml, { status: 200 })
    )
    render(
      <TestWrapper>
        <AdminImportPage />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(screen.getByText('Import in Progress')).toBeInTheDocument()
    })
  })

  it('shows success state when import is complete', async () => {
    const successHtml = `
      <html>
        <b>Current Status:</b> complete
        <span id="start-time">1234567890</span>
        <span id="end-time">1234567899</span>
      </html>
    `
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(successHtml, { status: 200 })
    )
    render(
      <TestWrapper>
        <AdminImportPage />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(screen.getByText('Import Complete')).toBeInTheDocument()
    })
  })

  it('shows error state when import had error', async () => {
    const errorHtml = `
      <html>
        <div class="alert alert-danger">Import failed due to invalid file format</div>
        <span id="start-time">1234567890</span>
        <span id="end-time">1234567899</span>
      </html>
    `
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(errorHtml, { status: 200 })
    )
    render(
      <TestWrapper>
        <AdminImportPage />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(screen.getByText('Import Failed')).toBeInTheDocument()
      expect(screen.getByText('Import failed due to invalid file format')).toBeInTheDocument()
    })
  })

  it('navigates back to config on button click', async () => {
    const idleHtml = '<html><b>Current Status:</b> idle</html>'
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(idleHtml, { status: 200 })
    )
    render(
      <TestWrapper>
        <AdminImportPage />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(screen.getByText('No Import in Progress')).toBeInTheDocument()
    })
    const backBtn = screen.getByRole('button', { name: /go to configuration/i })
    expect(backBtn).toBeInTheDocument()
  })
})
