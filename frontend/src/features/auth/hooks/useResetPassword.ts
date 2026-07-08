import { useState } from 'react'
import { useAuth } from '@/contexts'
import { getCsrfNonce } from '@/lib/api/client'

type ResetStep = 'request' | 'confirm'

export function useResetPassword() {
  const [state, setState] = useState<{
    isLoading: boolean
    error: string | null
    success: boolean
    step: ResetStep
  }>({ isLoading: false, error: null, success: false, step: 'request' })
  const { urlRoot = '' } = useAuth()

  const requestReset = async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const csrfNonce = getCsrfNonce()
      const params = new URLSearchParams()
      params.append('email', email)
      params.append('nonce', csrfNonce)

      const response = await fetch(`${urlRoot}/auth/reset_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        redirect: 'manual',
      })

      if (response.status === 302) {
        setState({ isLoading: false, error: null, success: true, step: 'request' })
        return
      }

      const html = await response.text()
      const errorMatch = html.match(
        /<div class="alert alert-danger"[^>]*>([\s\S]*?)<\/div>/
      )
      const error = errorMatch
        ? errorMatch[1].trim().replace(/<[^>]*>/g, '')
        : 'Failed to send reset email. Please try again.'
      setState({ isLoading: false, error, success: false, step: 'request' })
    } catch {
      setState({ isLoading: false, error: 'Network error.', success: false, step: 'request' })
    }
  }

  const confirmReset = async (password: string, token: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const csrfNonce = getCsrfNonce()
      const params = new URLSearchParams()
      params.append('password', password)
      params.append('nonce', csrfNonce)

      const response = await fetch(`${urlRoot}/auth/reset_password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        redirect: 'manual',
      })

      if (response.status === 302) {
        setState({ isLoading: false, error: null, success: true, step: 'confirm' })
        return
      }

      const html = await response.text()
      const errorMatch = html.match(
        /<div class="alert alert-danger"[^>]*>([\s\S]*?)<\/div>/
      )
      const error = errorMatch
        ? errorMatch[1].trim().replace(/<[^>]*>/g, '')
        : 'Failed to reset password. The link may be invalid or expired.'
      setState({ isLoading: false, error, success: false, step: 'confirm' })
    } catch {
      setState({ isLoading: false, error: 'Network error.', success: false, step: 'confirm' })
    }
  }

  return { ...state, requestReset, confirmReset }
}
