import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { ChallengeSolve } from '../types/challenge'
import { QUERY_KEYS } from '@/lib/constants'

export function useChallengeSolves(challengeId: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.SOLVES(challengeId ?? 0)],
    queryFn: () => api.get<ChallengeSolve[]>(`/challenges/${challengeId}/solves`),
    enabled: challengeId !== null,
    staleTime: 30_000,
  })
}
