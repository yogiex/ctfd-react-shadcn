import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { QUERY_KEYS } from '@/lib/constants'

export interface ConfigEntry {
  id: number
  key: string
  value: string | number | boolean | null
}

export interface Bracket {
  id: number
  name: string
  description: string
  type: 'users' | 'teams'
}

export interface Field {
  id: number
  name: string
  type: 'text' | 'boolean' | 'select'
  field_type: 'user' | 'team'
  required: boolean
  public: boolean
  editable: boolean
  options: string | null
}

export function useConfigs() {
  return useQuery({
    queryKey: [QUERY_KEYS.CONFIG],
    queryFn: () => api.get<ConfigEntry[]>('/configs'),
    staleTime: 60000,
  })
}

export function useUpdateConfigs() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (configs: { key: string; value: unknown }[]) =>
      api.patch('/configs', configs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONFIG] }),
  })
}

export function useConfigValue(
  configs: ConfigEntry[] | undefined,
  key: string,
  defaultValue: string = ''
): string {
  if (!configs) return defaultValue
  const entry = configs.find((c) => c.key === key)
  if (entry === undefined) return defaultValue
  if (entry.value === null || entry.value === undefined) return defaultValue
  return String(entry.value)
}

export function useConfigBool(
  configs: ConfigEntry[] | undefined,
  key: string,
  defaultValue: boolean = false
): boolean {
  if (!configs) return defaultValue
  const entry = configs.find((c) => c.key === key)
  if (entry === undefined) return defaultValue
  if (entry.value === null || entry.value === undefined) return defaultValue
  if (typeof entry.value === 'boolean') return entry.value
  if (entry.value === 'true' || entry.value === '1') return true
  if (entry.value === 'false' || entry.value === '0') return false
  return defaultValue
}

export function useBrackets() {
  return useQuery({
    queryKey: ['brackets'],
    queryFn: () => api.get<Bracket[]>('/brackets'),
    staleTime: 60000,
  })
}

export function useCreateBracket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description: string; type: string }) =>
      api.post('/brackets', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brackets'] }),
  })
}

export function useUpdateBracket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; name: string; description: string; type: string }) =>
      api.patch(`/brackets/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brackets'] }),
  })
}

export function useDeleteBracket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/brackets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brackets'] }),
  })
}

export function useFields() {
  return useQuery({
    queryKey: ['fields'],
    queryFn: () => api.get<Field[]>('/configs/fields'),
    staleTime: 60000,
  })
}

export function useCreateField() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      type: string
      field_type: string
      required: boolean
      public: boolean
      editable: boolean
      options?: string
    }) => api.post('/configs/fields', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fields'] }),
  })
}

export function useUpdateField() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: {
      id: number
      name?: string
      type?: string
      field_type?: string
      required?: boolean
      public?: boolean
      editable?: boolean
      options?: string
    }) => api.patch(`/configs/fields/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fields'] }),
  })
}

export function useDeleteField() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/configs/fields/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fields'] }),
  })
}
