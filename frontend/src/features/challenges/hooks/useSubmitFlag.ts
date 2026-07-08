import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { ChallengeAttempt, AttemptResponse } from '../types/challenge'
import { QUERY_KEYS } from '@/lib/constants'

export function useSubmitFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ChallengeAttempt) =>
      api.post<AttemptResponse>('/challenges/attempt', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHALLENGES] })
    },
  })
}
