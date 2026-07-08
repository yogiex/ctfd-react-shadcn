import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { QUERY_KEYS } from '@/lib/constants'

export function useSubmitRating(challengeId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { value: 1 | -1; review?: string }) =>
      api.put(`/challenges/${challengeId}/ratings`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHALLENGES] })
    },
  })
}
