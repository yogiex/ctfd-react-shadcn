import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { ChallengeListItem } from '../types/challenge'
import { QUERY_KEYS } from '@/lib/constants'

export function useChallenges() {
  return useQuery({
    queryKey: [QUERY_KEYS.CHALLENGES],
    queryFn: () => api.get<ChallengeListItem[]>('/challenges'),
    staleTime: 30_000,
  })
}
