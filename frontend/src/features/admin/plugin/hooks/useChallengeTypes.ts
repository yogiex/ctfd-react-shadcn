import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

export interface ChallengeTypeInfo {
  id: string
  name: string
  templates: { create: string; update: string; view: string }
  scripts: { create: string; update: string; view: string }
  create: string
}

export function useChallengeTypes() {
  return useQuery({
    queryKey: ['admin', 'challenge-types'],
    queryFn: () => api.get<Record<string, ChallengeTypeInfo>>('/challenges/types'),
    staleTime: 300_000,
  })
}
