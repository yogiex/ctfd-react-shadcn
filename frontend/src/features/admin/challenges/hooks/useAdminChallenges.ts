import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type {
  AdminChallenge,
  AdminChallengeDetail,
  ChallengeType,
  Flag,
  FlagFormData,
  Hint,
  HintFormData,
  ChallengeFile,
  Tag,
  Topic,
  Requirements,
  Solution,
  SolutionFormData,
  Comment,
  CommentFormData,
  Rating,
} from '../types/admin-challenge'

const ADMIN_CHALLENGES_KEY = ['admin', 'challenges'] as const
const ADMIN_CHALLENGE_KEY = (id: number) => ['admin', 'challenges', id] as const
const ADMIN_FLAGS_KEY = (id: number) => ['admin', 'challenges', id, 'flags'] as const
const ADMIN_HINTS_KEY = (id: number) => ['admin', 'challenges', id, 'hints'] as const
const ADMIN_FILES_KEY = (id: number) => ['admin', 'challenges', id, 'files'] as const
const ADMIN_TAGS_KEY = (id: number) => ['admin', 'challenges', id, 'tags'] as const
const ADMIN_TOPICS_KEY = (id: number) => ['admin', 'challenges', id, 'topics'] as const
const ADMIN_REQUIREMENTS_KEY = (id: number) => ['admin', 'challenges', id, 'requirements'] as const
const ADMIN_SOLUTION_KEY = (id: number) => ['admin', 'challenges', id, 'solution'] as const
const ADMIN_COMMENTS_KEY = (id: number) => ['admin', 'challenges', id, 'comments'] as const
const ADMIN_RATINGS_KEY = (id: number) => ['admin', 'challenges', id, 'ratings'] as const

export function useAdminChallenges(search?: string) {
  return useQuery({
    queryKey: [...ADMIN_CHALLENGES_KEY, search],
    queryFn: () =>
      api.get<AdminChallenge[]>('/challenges', {
        params: { view: 'admin', ...(search ? { q: search } : {}) },
      }),
  })
}

export function useAdminChallenge(id: number | null) {
  return useQuery({
    queryKey: ADMIN_CHALLENGE_KEY(id ?? 0),
    queryFn: () =>
      api.get<AdminChallengeDetail>(`/challenges/${id}`, {
        params: { view: 'admin' },
      }),
    enabled: id !== null,
  })
}

export function useCreateChallenge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<AdminChallenge>('/challenges', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CHALLENGES_KEY })
    },
  })
}

export function useUpdateChallenge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      api.patch<AdminChallengeDetail>(`/challenges/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CHALLENGE_KEY(id) })
      queryClient.invalidateQueries({ queryKey: ADMIN_CHALLENGES_KEY })
    },
  })
}

export function useDeleteChallenge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/challenges/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CHALLENGES_KEY })
    },
  })
}

export function useChallengeTypes() {
  return useQuery({
    queryKey: ['admin', 'challenge-types'],
    queryFn: () => api.get<ChallengeType[]>('/challenges/types'),
    staleTime: 300_000,
  })
}

export function useAdminFlags(challengeId: number | null) {
  return useQuery({
    queryKey: ADMIN_FLAGS_KEY(challengeId ?? 0),
    queryFn: () => api.get<Flag[]>(`/challenges/${challengeId}/flags`),
    enabled: challengeId !== null,
  })
}

export function useCreateFlag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: FlagFormData) =>
      api.post<Flag>('/flags', data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_FLAGS_KEY(vars.challenge_id) })
    },
  })
}

export function useUpdateFlag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FlagFormData> }) =>
      api.patch<Flag>(`/flags/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'challenges'] })
    },
  })
}

export function useDeleteFlag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; challengeId: number }) =>
      api.delete(`/flags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'challenges'] })
    },
  })
}

export function useAdminHints(challengeId: number | null) {
  return useQuery({
    queryKey: ADMIN_HINTS_KEY(challengeId ?? 0),
    queryFn: () => api.get<Hint[]>(`/challenges/${challengeId}/hints`),
    enabled: challengeId !== null,
  })
}

export function useCreateHint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: HintFormData) =>
      api.post<Hint>('/hints', data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_HINTS_KEY(vars.challenge_id) })
    },
  })
}

export function useUpdateHint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<HintFormData> }) =>
      api.patch<Hint>(`/hints/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'challenges'] })
    },
  })
}

export function useDeleteHint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; challengeId: number }) =>
      api.delete(`/hints/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'challenges'] })
    },
  })
}

export function useAdminFiles(challengeId: number | null) {
  return useQuery({
    queryKey: ADMIN_FILES_KEY(challengeId ?? 0),
    queryFn: () => api.get<ChallengeFile[]>(`/challenges/${challengeId}/files`),
    enabled: challengeId !== null,
  })
}

export function useUploadFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      challengeId: _cId,
      formData,
    }: {
      challengeId: number
      formData: FormData
    }) => api.upload<ChallengeFile[]>('/files', formData),
    onSuccess: (_data, { challengeId }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_FILES_KEY(challengeId) })
    },
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; challengeId: number }) =>
      api.delete(`/files/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'challenges'] })
    },
  })
}

export function useAdminTags(challengeId: number | null) {
  return useQuery({
    queryKey: ADMIN_TAGS_KEY(challengeId ?? 0),
    queryFn: () => api.get<Tag[]>(`/challenges/${challengeId}/tags`),
    enabled: challengeId !== null,
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { challenge_id: number; value: string }) =>
      api.post<Tag>('/tags', data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TAGS_KEY(vars.challenge_id) })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; challengeId: number }) =>
      api.delete(`/tags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'challenges'] })
    },
  })
}

export function useAdminTopics(challengeId: number | null) {
  return useQuery({
    queryKey: ADMIN_TOPICS_KEY(challengeId ?? 0),
    queryFn: () => api.get<Topic[]>(`/challenges/${challengeId}/topics`),
    enabled: challengeId !== null,
  })
}

export function useCreateTopic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { challenge_id: number; topic_id: number }) =>
      api.post<Topic>('/topics', data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TOPICS_KEY(vars.challenge_id) })
    },
  })
}

export function useRemoveTopic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      challengeId,
      topicId: _topicId,
    }: {
      challengeId: number
      topicId: number
    }) =>
      api.delete('/topics', {
        params: { type: 'challenge', target_id: challengeId },
      }),
    onSuccess: (_data, { challengeId }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TOPICS_KEY(challengeId) })
    },
  })
}

export function useAdminRequirements(challengeId: number | null) {
  return useQuery({
    queryKey: ADMIN_REQUIREMENTS_KEY(challengeId ?? 0),
    queryFn: () =>
      api.get<Requirements>(`/challenges/${challengeId}/requirements`),
    enabled: challengeId !== null,
  })
}

export function useAdminSolution(challengeId: number | null) {
  return useQuery({
    queryKey: ADMIN_SOLUTION_KEY(challengeId ?? 0),
    queryFn: () => api.get<Solution>(`/solutions/${challengeId}`),
    enabled: challengeId !== null,
  })
}

export function useCreateSolution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SolutionFormData) =>
      api.post<Solution>('/solutions', data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SOLUTION_KEY(vars.challenge_id) })
    },
  })
}

export function useUpdateSolution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<SolutionFormData>
    }) => api.patch<Solution>(`/solutions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'challenges'] })
    },
  })
}

export function useChallengeComments(challengeId: number | null) {
  return useQuery({
    queryKey: ADMIN_COMMENTS_KEY(challengeId ?? 0),
    queryFn: () =>
      api.get<Comment[]>('/comments', {
        params: { challenge_id: challengeId ?? undefined },
      }),
    enabled: challengeId !== null,
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CommentFormData) =>
      api.post<Comment>('/comments', data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_COMMENTS_KEY(vars.challenge_id) })
    },
  })
}

export function useChallengeRatingsAdmin(challengeId: number | null) {
  return useQuery({
    queryKey: ADMIN_RATINGS_KEY(challengeId ?? 0),
    queryFn: () =>
      api.get<Rating[]>(`/challenges/${challengeId}/ratings`),
    enabled: challengeId !== null,
  })
}
