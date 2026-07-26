import { createContext, useContext, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'

interface User {
  id: number
  name: string
  email: string
  verified: boolean
}

interface Team {
  id: number
  name: string
}

interface AuthContextType {
  user: User | null
  team: Team | null
  userMode: 'users' | 'teams'
  isAuthenticated: boolean
  isAdmin: boolean
  isVerified: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = false
  const isAdmin = false
  const isLoading = false

  const login = useCallback(async (_username: string, _password: string) => {
    console.warn('[Static Site] Login is not available')
    return { success: false, error: 'Login is not available in static mode' }
  }, [])

  const logout = useCallback(async () => {
    console.warn('[Static Site] Logout is not available')
  }, [])

  const refresh = useCallback(async () => {
    // No-op for static site
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    user: null,
    team: null,
    userMode: 'users',
    isAuthenticated,
    isAdmin,
    isVerified: false,
    isLoading,
    login,
    logout,
    refresh,
  }), [isAuthenticated, isAdmin, isLoading, login, logout, refresh])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
