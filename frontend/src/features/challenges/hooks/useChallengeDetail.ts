import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { ChallengeDetail } from '../types/challenge'
import { QUERY_KEYS } from '@/lib/constants'

export function useChallengeDetail(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CHALLENGE(id ?? 0)],
    queryFn: () => api.get<ChallengeDetail>(`/challenges/${id}`),
    enabled: id !== null,
    staleTime: 60_000,
  })
}
