import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

export interface AdminNotification {
  id: number
  title: string
  content: string
  html: string
  date: string
  user_id: number | null
  team_id: number | null
}

export interface AdminNotificationCreateInput {
  title: string
  content: string
  type?: string
  sound?: boolean
}

const ADMIN_NOTIFICATIONS_KEY = ['admin', 'notifications'] as const

export function useAdminNotifications() {
  return useQuery({
    queryKey: ADMIN_NOTIFICATIONS_KEY,
    queryFn: () => api.get<AdminNotification[]>('/notifications'),
    staleTime: 30_000,
  })
}

export function useCreateNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AdminNotificationCreateInput) =>
      api.post<AdminNotification>('/notifications', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_NOTIFICATIONS_KEY })
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
