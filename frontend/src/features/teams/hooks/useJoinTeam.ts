import { useState } from 'react'
import { getCsrfNonce } from '@/lib/api/client'
import type { TeamJoinInput } from '../types/team'

interface JoinTeamState {
  isLoading: boolean
  error: string | null
}

export function useJoinTeam() {
  const [state, setState] = useState<JoinTeamState>({ isLoading: false, error: null })

  const joinTeam = async (input: TeamJoinInput) => {
    setState({ isLoading: true, error: null })

    try {
      const csrfNonce = getCsrfNonce()
      const params = new URLSearchParams()
      params.append('name', input.name)
      params.append('password', input.password)
      if (csrfNonce) params.append('nonce', csrfNonce)

      const response = await fetch('/teams/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        redirect: 'manual',
      })

      if (response.type === 'opaqueredirect' || response.status === 0) {
        window.location.href = '/challenges'
        return
      }

      const html = await response.text()
      const errorMatch = html.match(
        /<div class="alert alert-danger"[^>]*>([\s\S]*?)<\/div>/
      )
      const error = errorMatch
        ? errorMatch[1].trim().replace(/<[^>]*>/g, '')
        : 'Failed to join team. Please try again.'
      setState({ isLoading: false, error })
    } catch {
      setState({ isLoading: false, error: 'Network error. Please try again.' })
    }
  }

  const clearError = () => setState((prev) => ({ ...prev, error: null }))

  return { ...state, joinTeam, clearError }
}
