import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { ScoreboardEntry, ScoreboardDetailEntry, Bracket } from '../types/scoreboard'
import { QUERY_KEYS } from '@/lib/constants'

export function useScoreboard() {
  return useQuery({
    queryKey: [QUERY_KEYS.SCOREBOARD],
    queryFn: () => api.get<ScoreboardEntry[]>('/scoreboard'),
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

export function useScoreboardDetail(count: number = 10, bracketId?: number | null) {
  return useQuery({
    queryKey: ['scoreboard', 'detail', count, bracketId],
    queryFn: () =>
      api.get<Record<string, ScoreboardDetailEntry>>(
        `/scoreboard/top/${count}`,
        bracketId ? { params: { bracket_id: bracketId } } : undefined,
      ),
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

export function useBrackets(userMode: string) {
  return useQuery({
    queryKey: ['brackets', userMode],
    queryFn: () => api.get<Bracket[]>(`/brackets?type=${userMode}`),
    staleTime: 300_000,
  })
}
