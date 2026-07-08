import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

export interface FlagTypeInfo {
  id: string
  name: string
  templates: { create: string }
  scripts: { create: string }
}

export function useFlagTypes() {
  return useQuery({
    queryKey: ['admin', 'flag-types'],
    queryFn: () => api.get<Record<string, FlagTypeInfo>>('/flags/types'),
    staleTime: 300_000,
  })
}
