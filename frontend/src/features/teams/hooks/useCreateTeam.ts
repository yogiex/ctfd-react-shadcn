import { useState } from 'react'
import { getCsrfNonce } from '@/lib/api/client'
import type { TeamCreateInput } from '../types/team'

interface CreateTeamState {
  isLoading: boolean
  error: string | null
}

export function useCreateTeam() {
  const [state, setState] = useState<CreateTeamState>({ isLoading: false, error: null })

  const createTeam = async (input: TeamCreateInput) => {
    setState({ isLoading: true, error: null })

    try {
      const csrfNonce = getCsrfNonce()
      const params = new URLSearchParams()
      params.append('name', input.name)
      params.append('password', input.password)
      if (input.website) params.append('website', input.website)
      if (input.affiliation) params.append('affiliation', input.affiliation)
      if (input.country) params.append('country', input.country)
      if (input.bracket_id !== undefined) params.append('bracket_id', String(input.bracket_id))
      if (csrfNonce) params.append('nonce', csrfNonce)

      const response = await fetch('/teams/new', {
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
        : 'Failed to create team. Please try again.'
      setState({ isLoading: false, error })
    } catch {
      setState({ isLoading: false, error: 'Network error. Please try again.' })
    }
  }

  const clearError = () => setState((prev) => ({ ...prev, error: null }))

  return { ...state, createTeam, clearError }
}
