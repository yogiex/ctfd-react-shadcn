import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

interface HintData {
  id: number
  cost: number
  title?: string
  content?: string
}

export function useHint(id: number | null) {
  return useQuery({
    queryKey: ['hints', id],
    queryFn: () => api.get<HintData>(`/hints/${id}`),
    enabled: id !== null,
  })
}

export function useUnlockHint() {
  return useMutation({
    mutationFn: (hintId: number) =>
      api.post('/unlocks', { target: hintId, type: 'hints' }),
  })
}
