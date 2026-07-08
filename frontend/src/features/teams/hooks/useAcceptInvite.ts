import { useState } from 'react'
import { getCsrfNonce } from '@/lib/api/client'

interface AcceptInviteState {
  isLoading: boolean
  error: string | null
}

export function useAcceptInvite() {
  const [state, setState] = useState<AcceptInviteState>({ isLoading: false, error: null })

  const acceptInvite = async (code: string) => {
    setState({ isLoading: true, error: null })

    try {
      const csrfNonce = getCsrfNonce()
      const params = new URLSearchParams()
      if (csrfNonce) params.append('nonce', csrfNonce)

      const response = await fetch(`/teams/invite?code=${encodeURIComponent(code)}`, {
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

      if (response.status === 302 || response.status === 303) {
        window.location.href = `/challenges`
        return
      }

      if (response.status === 403) {
        const html = await response.text()
        const errorMatch = html.match(
          /<div class="alert alert-danger"[^>]*>([\s\S]*?)<\/div>/
        )
        const error = errorMatch
          ? errorMatch[1].trim().replace(/<[^>]*>/g, '')
          : 'This invite link is invalid or expired.'
        setState({ isLoading: false, error })
        return
      }

      const html = await response.text()
      const errorMatch = html.match(
        /<div class="alert alert-danger"[^>]*>([\s\S]*?)<\/div>/
      )
      const error = errorMatch
        ? errorMatch[1].trim().replace(/<[^>]*>/g, '')
        : 'Failed to accept invite.'
      setState({ isLoading: false, error })
    } catch (err) {
      setState({ isLoading: false, error: 'Network error. Please try again.' })
    }
  }

  const clearError = () => setState((prev) => ({ ...prev, error: null }))

  return { ...state, acceptInvite, clearError }
}
