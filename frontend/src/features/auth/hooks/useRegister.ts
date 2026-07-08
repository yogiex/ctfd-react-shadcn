import { useState } from 'react'
import { useAuth } from '@/contexts'
import { getCsrfNonce } from '@/lib/api/client'

interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export function useRegister() {
  const [state, setState] = useState<{
    isLoading: boolean
    error: string | null
    success: boolean
  }>({ isLoading: false, error: null, success: false })
  const { urlRoot = '' } = useAuth()

  const register = async (credentials: RegisterCredentials) => {
    setState({ isLoading: true, error: null, success: false })

    try {
      const csrfNonce = getCsrfNonce()
      const params = new URLSearchParams()
      params.append('name', credentials.name)
      params.append('email', credentials.email)
      params.append('password', credentials.password)
      params.append('nonce', csrfNonce)

      const response = await fetch(`${urlRoot}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        redirect: 'manual',
      })

      if (response.status === 302) {
        setState({ isLoading: false, error: null, success: true })
        return
      }

      const html = await response.text()
      const errorMatch = html.match(
        /<div class="alert alert-danger"[^>]*>([\s\S]*?)<\/div>/
      )
      const error = errorMatch
        ? errorMatch[1].trim().replace(/<[^>]*>/g, '')
        : 'Registration failed. Please try again.'
      setState({ isLoading: false, error, success: false })
    } catch {
      setState({ isLoading: false, error: 'Network error. Please try again.', success: false })
    }
  }

  return { ...state, register }
}
