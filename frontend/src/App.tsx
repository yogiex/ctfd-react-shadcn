import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { router } from '@/router'
import { preloadInitData } from '@/lib/api/client'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    preloadInitData().then(() => setReady(true))
  }, [])

  if (!ready) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
