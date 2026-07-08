import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { PaginationMeta } from '@/types/api'

export interface UserAdmin {
  id: number
  name: string
  email: string
  website: string | null
  affiliation: string | null
  country: string | null
  bracket_id: number | null
  bracket_name: string | null
  fields: { id: number; value: string; name: string; type: string }[]
  place: number | null
  score: number | null
  banned: boolean
  hidden: boolean
  verified: boolean
  type: 'admin' | 'user'
  created: string
  secret: string
  language: string | null
}

export interface UserCreateInput {
  name: string
  email: string
  password: string
  type?: 'admin' | 'user'
  verified?: boolean
  hidden?: boolean
  banned?: boolean
  affiliation?: string
  country?: string
  website?: string
  language?: string
  notify?: boolean
}

export type UserUpdateInput = Partial<UserCreateInput>

export interface UserSolve {
  id: number
  user_id: number
  challenge_id: number
  challenge_name: string
  challenge_category: string | null
  provided: string
  type: string
  date: string
}

export interface UserFail {
  id: number
  user_id: number
  challenge_id: number
  challenge_name: string
  challenge_category: string | null
  provided: string
  type: string
  date: string
}

export interface UserAward {
  id: number
  user_id: number
  name: string
  description: string
  value: number
  category: string
  icon: string
  date: string
}

interface PaginatedResult<T> {
  data: T[]
  pagination: PaginationMeta
}

const BASE_URL = '/api/v1'

async function getPaginated<T>(
  endpoint: string,
  params?: Record<string, string | number | undefined>,
): Promise<PaginatedResult<T>> {
  const urlRoot = ((window as any).INITIAL_DATA?.urlRoot as string) ?? ''
  let url = `${urlRoot}${BASE_URL}${endpoint}`
  if (params) {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) sp.append(k, String(v))
    }
    const qs = sp.toString()
    if (qs) url += `?${qs}`
  }
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.errors?.[0] ?? 'Request failed')
  return { data: json.data as T[], pagination: json.meta?.pagination as PaginationMeta }
}

export function useAdminUsers(params: { q?: string; field?: string; page?: number }) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () =>
      getPaginated<UserAdmin>('/users', { view: 'admin', q: params.q, field: params.field, page: params.page }),
    staleTime: 30_000,
  })
}

export function useAdminUser(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => api.get<UserAdmin>(`/users/${id}`),
    enabled: id !== null,
    staleTime: 60_000,
  })
}

export function useAdminUserSolves(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'users', id, 'solves'],
    queryFn: () => api.get<UserSolve[]>(`/users/${id}/solves`),
    enabled: id !== null,
    staleTime: 60_000,
  })
}

export function useAdminUserFails(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'users', id, 'fails'],
    queryFn: () => api.get<UserFail[]>(`/users/${id}/fails`),
    enabled: id !== null,
    staleTime: 60_000,
  })
}

export function useAdminUserAwards(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'users', id, 'awards'],
    queryFn: () => api.get<UserAward[]>(`/users/${id}/awards`),
    enabled: id !== null,
    staleTime: 60_000,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UserCreateInput) => api.post<UserAdmin>('/users', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateInput }) =>
      api.patch<UserAdmin>(`/users/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users', vars.id] })
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}
