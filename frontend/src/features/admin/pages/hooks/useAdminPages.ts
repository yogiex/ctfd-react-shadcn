import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

export interface AdminPage {
  id: number
  title: string
  route: string
  content: string
  draft: boolean
  hidden: boolean
  auth_required: boolean
  format: 'markdown' | 'html'
  link_target: string | null
}

export interface AdminPageCreateInput {
  title: string
  route: string
  content?: string
  draft?: boolean
  hidden?: boolean
  auth_required?: boolean
  format?: 'markdown' | 'html'
  link_target?: string | null
}

export type AdminPageUpdateInput = Partial<AdminPageCreateInput>

const ADMIN_PAGES_KEY = ['admin', 'pages'] as const
const ADMIN_PAGE_KEY = (id: number) => ['admin', 'pages', id] as const

export function useAdminPages() {
  return useQuery({
    queryKey: ADMIN_PAGES_KEY,
    queryFn: () => api.get<AdminPage[]>('/pages'),
    staleTime: 30_000,
  })
}

export function useAdminPage(id: number | null) {
  return useQuery({
    queryKey: ADMIN_PAGE_KEY(id ?? 0),
    queryFn: () => api.get<AdminPage>(`/pages/${id}`),
    enabled: id !== null,
    staleTime: 60_000,
  })
}

export function useCreatePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AdminPageCreateInput) => api.post<AdminPage>('/pages', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_PAGES_KEY }),
  })
}

export function useUpdatePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminPageUpdateInput }) =>
      api.patch<AdminPage>(`/pages/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ADMIN_PAGE_KEY(vars.id) })
      qc.invalidateQueries({ queryKey: ADMIN_PAGES_KEY })
    },
  })
}

export function useDeletePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/pages/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_PAGES_KEY }),
  })
}
