import { useState } from 'react'
import { useAuth } from '@/contexts'
import { getCsrfNonce } from '@/lib/api/client'

export function useConfirm() {
  const [state, setState] = useState<{
    isLoading: boolean
    error: string | null
    success: boolean
  }>({ isLoading: false, error: null, success: false })
  const { urlRoot = '' } = useAuth()

  const resendConfirmation = async () => {
    setState({ isLoading: true, error: null, success: false })

    try {
      const csrfNonce = getCsrfNonce()
      const params = new URLSearchParams()
      params.append('nonce', csrfNonce)

      const response = await fetch(`${urlRoot}/auth/confirm`, {
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
        : 'Failed to send confirmation email.'
      setState({ isLoading: false, error, success: false })
    } catch {
      setState({ isLoading: false, error: 'Network error.', success: false })
    }
  }

  return { ...state, resendConfirmation }
}
