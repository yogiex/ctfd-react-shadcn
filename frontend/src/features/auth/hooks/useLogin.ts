import { useState } from 'react'
import { getCsrfNonce } from '@/lib/api/client'

interface LoginCredentials {
  name: string
  password: string
}

interface LoginState {
  isLoading: boolean
  error: string | null
}

export function useLogin() {
  const [state, setState] = useState<LoginState>({ isLoading: false, error: null })

  const login = async (credentials: LoginCredentials) => {
    setState({ isLoading: true, error: null })

    try {
      const csrfNonce = getCsrfNonce()
      const params = new URLSearchParams()
      params.append('name', credentials.name)
      params.append('password', credentials.password)
      params.append('_submit', 'Submit')
      if (csrfNonce) params.append('nonce', csrfNonce)

      const response = await fetch(`/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        redirect: 'manual',
      })

      if (response.type === 'opaqueredirect' || response.status === 0) {
        window.location.href = `/challenges`
        return
      }

      const html = await response.text()
      const errorMatch = html.match(
        /<div class="alert alert-danger"[^>]*>([\s\S]*?)<\/div>/
      )
      const error = errorMatch
        ? errorMatch[1].trim().replace(/<[^>]*>/g, '')
        : 'Login failed. Please check your credentials.'
      setState({ isLoading: false, error })
    } catch (err) {
      setState({ isLoading: false, error: 'Network error. Please try again.' })
    }
  }

  const clearError = () => setState((prev) => ({ ...prev, error: null }))

  return { ...state, login, clearError }
}
