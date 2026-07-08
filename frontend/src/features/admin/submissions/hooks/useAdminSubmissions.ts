import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { QUERY_KEYS } from '@/lib/constants'

export interface Submission {
  id: number
  challenge_id: number
  user_id: number
  team_id: number | null
  provided: string
  type: 'correct' | 'incorrect' | 'partial' | 'discard' | 'ratelimited'
  ip: string
  date: string
  challenge?: { id: number; name: string; category: string; value: number }
  user?: { id: number; name: string }
  team?: { id: number; name: string } | null
}

export function useAdminSubmissions(params?: { page?: number; type?: string; challenge_id?: number; user_id?: number }) {
  return useQuery({
    queryKey: [QUERY_KEYS.SUBMISSIONS, params],
    queryFn: () => api.get<Submission[]>('/submissions', { params: { ...params, view: 'admin' } as any }),
    staleTime: 15000,
  })
}

export function useUpdateSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, type }: { id: number; type: string }) => api.patch(`/submissions/${id}`, { type }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.SUBMISSIONS] }),
  })
}

export function useDeleteSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/submissions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.SUBMISSIONS] }),
  })
}
