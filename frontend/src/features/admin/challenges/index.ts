export { AdminChallengesListPage } from './pages/AdminChallengesListPage'
export { AdminChallengeCreatePage } from './pages/AdminChallengeCreatePage'
export { AdminChallengeDetailPage } from './pages/AdminChallengeDetailPage'

export { AdminFlagForm } from './components/AdminFlagForm'
export { AdminHintForm } from './components/AdminHintForm'
export { AdminFileUpload } from './components/AdminFileUpload'
export { AdminTagInput } from './components/AdminTagInput'
export { AdminTopicManager } from './components/AdminTopicManager'
export { AdminRequirementsEditor } from './components/AdminRequirementsEditor'
export { AdminSolutionEditor } from './components/AdminSolutionEditor'
export { AdminCommentThread } from './components/AdminCommentThread'
export { AdminRatingsTable } from './components/AdminRatingsTable'

export {
  useAdminChallenges,
  useAdminChallenge,
  useCreateChallenge,
  useUpdateChallenge,
  useDeleteChallenge,
  useChallengeTypes,
  useAdminFlags,
  useCreateFlag,
  useUpdateFlag,
  useDeleteFlag,
  useAdminHints,
  useCreateHint,
  useUpdateHint,
  useDeleteHint,
  useAdminFiles,
  useUploadFile,
  useDeleteFile,
  useAdminTags,
  useCreateTag,
  useDeleteTag,
  useAdminTopics,
  useCreateTopic,
  useRemoveTopic,
  useAdminRequirements,
  useAdminSolution,
  useCreateSolution,
  useUpdateSolution,
  useChallengeComments,
  useCreateComment,
  useChallengeRatingsAdmin,
} from './hooks/useAdminChallenges'

export type {
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
  PaginatedResponse,
} from './types/admin-challenge'
