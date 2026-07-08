import { createContext, useContext, useState, type ReactNode } from 'react'
import type { InitialData } from '@/types/api'
import { getInitData } from '@/lib/api/client'

interface AuthState {
  user: {
    id: number | null
    name: string | null
    email: string | null
    verified: boolean
  } | null
  team: {
    id: number | null
    name: string | null
  } | null
  userMode: 'users' | 'teams'
  isAuthenticated: boolean
  isAdmin: boolean
  urlRoot: string
}

interface AuthContextType extends AuthState {
  logout: () => void
  refresh: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function getInitialData(): InitialData {
  const fromWindow = (window as any).INITIAL_DATA
  if (fromWindow?.csrfNonce) return fromWindow
  return getInitData() as InitialData
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const data = getInitialData()
    return {
      user: data.userId
        ? {
            id: data.userId,
            name: data.userName,
            email: data.userEmail,
            verified: data.userVerified,
          }
        : null,
      team: data.teamId
        ? { id: data.teamId, name: data.teamName }
        : null,
      userMode: data.userMode || 'users',
      isAuthenticated: !!data.userId,
      isAdmin: Boolean((window as any).init?.isAdmin || getInitData().isAdmin),
      urlRoot: data.urlRoot || '',
    }
  })

  const logout = () => {
    const data = getInitialData()
    window.location.href = `${data.urlRoot || ''}/logout`
  }

  const refresh = () => {
    const data = getInitialData()
    setState((prev) => ({
      ...prev,
      user: data.userId
        ? { id: data.userId, name: data.userName, email: data.userEmail, verified: data.userVerified }
        : null,
      team: data.teamId ? { id: data.teamId, name: data.teamName } : null,
      isAuthenticated: !!data.userId,
      userMode: data.userMode || prev.userMode,
    }))
  }

  return (
    <AuthContext.Provider value={{ ...state, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
