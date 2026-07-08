import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { PaginationMeta } from '@/types/api'

export interface TeamAdmin {
  id: number
  name: string
  email: string
  website: string | null
  affiliation: string | null
  country: string | null
  bracket_id: number | null
  bracket_name: string | null
  captain_id: number
  members: { id: number; name: string; score: number }[]
  fields: { id: number; value: string; name: string; type: string }[]
  place: number | null
  score: number | null
  banned: boolean
  hidden: boolean
  created: string
  secret: string
}

export interface TeamCreateInput {
  name: string
  email: string
  password: string
  affiliation?: string
  country?: string
  website?: string
  hidden?: boolean
  banned?: boolean
}

export type TeamUpdateInput = Partial<TeamCreateInput> & { captain_id?: number }

export interface TeamMember {
  id: number
  name: string
  score: number
}

export interface TeamSolve {
  id: number
  challenge_id: number
  challenge_name: string
  challenge_category: string | null
  provided: string
  type: string
  date: string
}

export interface TeamAward {
  id: number
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

export function useAdminTeams(params: { q?: string; page?: number }) {
  return useQuery({
    queryKey: ['admin', 'teams', params],
    queryFn: () => getPaginated<TeamAdmin>('/teams', { view: 'admin', q: params.q, page: params.page }),
    staleTime: 30_000,
  })
}

export function useAdminTeam(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'teams', id],
    queryFn: () => api.get<TeamAdmin>(`/teams/${id}`),
    enabled: id !== null,
    staleTime: 60_000,
  })
}

export function useAdminTeamSolves(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'teams', id, 'solves'],
    queryFn: () => api.get<TeamSolve[]>(`/teams/${id}/solves`),
    enabled: id !== null,
    staleTime: 60_000,
  })
}

export function useAdminTeamAwards(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'teams', id, 'awards'],
    queryFn: () => api.get<TeamAward[]>(`/teams/${id}/awards`),
    enabled: id !== null,
    staleTime: 60_000,
  })
}

export function useAdminTeamMembers(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'teams', id, 'members'],
    queryFn: () => api.get<TeamMember[]>(`/teams/${id}/members`),
    enabled: id !== null,
    staleTime: 30_000,
  })
}

export function useCreateTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TeamCreateInput) => api.post<TeamAdmin>('/teams', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'teams'] }),
  })
}

export function useUpdateTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TeamUpdateInput }) =>
      api.patch<TeamAdmin>(`/teams/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'teams', vars.id] })
      qc.invalidateQueries({ queryKey: ['admin', 'teams'] })
    },
  })
}

export function useDeleteTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/teams/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'teams'] }),
  })
}

export function useAddTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
      api.post(`/teams/${teamId}/members`, { user_id: userId }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'teams', vars.teamId] })
      qc.invalidateQueries({ queryKey: ['admin', 'teams', vars.teamId, 'members'] })
    },
  })
}

export function useRemoveTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
      api.delete(`/teams/${teamId}/members`, { params: { user_id: userId } } as any),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'teams', vars.teamId] })
      qc.invalidateQueries({ queryKey: ['admin', 'teams', vars.teamId, 'members'] })
    },
  })
}
