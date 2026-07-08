import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { PublicLayout } from '@/layouts/PublicLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { AdminLayout } from '@/features/admin/components/AdminLayout'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const ConfirmPage = lazy(() => import('@/features/auth/pages/ConfirmPage').then(m => ({ default: m.ConfirmPage })))
const ChallengeBoardPage = lazy(() => import('@/features/challenges/pages/ChallengeBoardPage').then(m => ({ default: m.ChallengeBoardPage })))
const ScoreboardPage = lazy(() => import('@/features/scoreboard/pages/ScoreboardPage').then(m => ({ default: m.ScoreboardPage })))
const UsersListPage = lazy(() => import('@/features/users/pages/UsersListPage').then(m => ({ default: m.UsersListPage })))
const UserPublicProfile = lazy(() => import('@/features/users/pages/UserPublicProfile').then(m => ({ default: m.UserPublicProfile })))
const TeamsListPage = lazy(() => import('@/features/teams/pages/TeamsListPage').then(m => ({ default: m.TeamsListPage })))
const TeamPublicProfile = lazy(() => import('@/features/teams/pages/TeamPublicProfile').then(m => ({ default: m.TeamPublicProfile })))
const SettingsPage = lazy(() => import('@/features/users/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const TeamPrivatePage = lazy(() => import('@/features/teams/pages/TeamPrivatePage').then(m => ({ default: m.TeamPrivatePage })))
const TeamEnrollmentPage = lazy(() => import('@/features/teams/pages/TeamEnrollmentPage').then(m => ({ default: m.TeamEnrollmentPage })))
const TeamCreatePage = lazy(() => import('@/features/teams/pages/TeamCreatePage').then(m => ({ default: m.TeamCreatePage })))
const TeamJoinPage = lazy(() => import('@/features/teams/pages/TeamJoinPage').then(m => ({ default: m.TeamJoinPage })))
const TeamInvitePage = lazy(() => import('@/features/teams/pages/TeamInvitePage').then(m => ({ default: m.TeamInvitePage })))
const DashboardPage = lazy(() => import('@/features/admin/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AdminChallengesListPage = lazy(() => import('@/features/admin/challenges/pages/AdminChallengesListPage').then(m => ({ default: m.AdminChallengesListPage })))
const AdminChallengeCreatePage = lazy(() => import('@/features/admin/challenges/pages/AdminChallengeCreatePage').then(m => ({ default: m.AdminChallengeCreatePage })))
const AdminChallengeDetailPage = lazy(() => import('@/features/admin/challenges/pages/AdminChallengeDetailPage').then(m => ({ default: m.AdminChallengeDetailPage })))
const AdminUsersListPage = lazy(() => import('@/features/admin/users/pages/AdminUsersListPage').then(m => ({ default: m.AdminUsersListPage })))
const AdminUserDetailPage = lazy(() => import('@/features/admin/users/pages/AdminUserDetailPage').then(m => ({ default: m.AdminUserDetailPage })))
const AdminTeamsListPage = lazy(() => import('@/features/admin/teams/pages/AdminTeamsListPage').then(m => ({ default: m.AdminTeamsListPage })))
const AdminTeamDetailPage = lazy(() => import('@/features/admin/teams/pages/AdminTeamDetailPage').then(m => ({ default: m.AdminTeamDetailPage })))
const AdminPagesListPage = lazy(() => import('@/features/admin/pages/pages/AdminPagesListPage').then(m => ({ default: m.AdminPagesListPage })))
const AdminPageEditorPage = lazy(() => import('@/features/admin/pages/pages/AdminPageEditorPage').then(m => ({ default: m.AdminPageEditorPage })))
const AdminNotificationsPage = lazy(() => import('@/features/admin/notifications/pages/AdminNotificationsPage').then(m => ({ default: m.AdminNotificationsPage })))
const AdminResetPage = lazy(() => import('@/features/admin/reset/pages/AdminResetPage').then(m => ({ default: m.AdminResetPage })))
const AdminConfigPage = lazy(() => import('@/features/admin/config/pages/AdminConfigPage').then(m => ({ default: m.AdminConfigPage })))
const AdminSubmissionsPage = lazy(() => import('@/features/admin/submissions/pages/AdminSubmissionsPage').then(m => ({ default: m.AdminSubmissionsPage })))
const AdminScoreboardPage = lazy(() => import('@/features/admin/scoreboard/pages/AdminScoreboardPage').then(m => ({ default: m.AdminScoreboardPage })))
const AdminStatisticsPage = lazy(() => import('@/features/admin/statistics/pages/AdminStatisticsPage').then(m => ({ default: m.AdminStatisticsPage })))
const HomePage = lazy(() => import('@/features/home/pages/HomePage').then(m => ({ default: m.HomePage })))
const UserPrivateProfile = lazy(() => import('@/features/users/pages/UserPrivateProfile').then(m => ({ default: m.UserPrivateProfile })))
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const StaticPage = lazy(() => import('@/features/pages/pages/StaticPage').then(m => ({ default: m.StaticPage })))
const SetupPage = lazy(() => import('@/features/setup/pages/SetupPage').then(m => ({ default: m.SetupPage })))

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <ErrorBoundary><PublicLayout /></ErrorBoundary>,
    children: [
      { path: '/login', element: <Lazy><LoginPage /></Lazy> },
      { path: '/register', element: <Lazy><RegisterPage /></Lazy> },
      { path: '/reset_password', element: <Lazy><ResetPasswordPage /></Lazy> },
      { path: '/confirm', element: <Lazy><ConfirmPage /></Lazy> },
      { path: '/confirm/:data', element: <Lazy><ConfirmPage /></Lazy> },
    ],
  },
  {
    element: <ErrorBoundary><MainLayout /></ErrorBoundary>,
    children: [
      { path: '/', element: <Lazy><HomePage /></Lazy> },
      { path: '/challenges', element: <Lazy><ChallengeBoardPage /></Lazy> },
      { path: '/scoreboard', element: <Lazy><ScoreboardPage /></Lazy> },
      { path: '/users', element: <Lazy><UsersListPage /></Lazy> },
      { path: '/users/:id', element: <Lazy><UserPublicProfile /></Lazy> },
      { path: '/teams', element: <Lazy><TeamsListPage /></Lazy> },
      { path: '/teams/:id', element: <Lazy><TeamPublicProfile /></Lazy> },
      { path: '/profile', element: <Lazy><UserPrivateProfile /></Lazy> },
      { path: '/team', element: <Lazy><TeamPrivatePage /></Lazy> },
      { path: '/teams/enroll', element: <Lazy><TeamEnrollmentPage /></Lazy> },
      { path: '/teams/new', element: <Lazy><TeamCreatePage /></Lazy> },
      { path: '/teams/join', element: <Lazy><TeamJoinPage /></Lazy> },
      { path: '/teams/invite', element: <Lazy><TeamInvitePage /></Lazy> },
      { path: '/settings', element: <Lazy><SettingsPage /></Lazy> },
      { path: '/notifications', element: <Lazy><NotificationsPage /></Lazy> },
      { path: '/pages/:route', element: <Lazy><StaticPage /></Lazy> },
    ],
  },
  { path: '/setup', element: <Lazy><SetupPage /></Lazy> },
  {
    element: <ErrorBoundary><AdminLayout /></ErrorBoundary>,
    children: [
      { path: '/admin', element: <Lazy><DashboardPage /></Lazy> },
      { path: '/admin/challenges', element: <Lazy><AdminChallengesListPage /></Lazy> },
      { path: '/admin/challenges/new', element: <Lazy><AdminChallengeCreatePage /></Lazy> },
      { path: '/admin/challenges/:id', element: <Lazy><AdminChallengeDetailPage /></Lazy> },
      { path: '/admin/users', element: <Lazy><AdminUsersListPage /></Lazy> },
      { path: '/admin/users/:id', element: <Lazy><AdminUserDetailPage /></Lazy> },
      { path: '/admin/teams', element: <Lazy><AdminTeamsListPage /></Lazy> },
      { path: '/admin/teams/:id', element: <Lazy><AdminTeamDetailPage /></Lazy> },
      { path: '/admin/pages', element: <Lazy><AdminPagesListPage /></Lazy> },
      { path: '/admin/pages/new', element: <Lazy><AdminPageEditorPage /></Lazy> },
      { path: '/admin/pages/:id', element: <Lazy><AdminPageEditorPage /></Lazy> },
      { path: '/admin/notifications', element: <Lazy><AdminNotificationsPage /></Lazy> },
      { path: '/admin/reset', element: <Lazy><AdminResetPage /></Lazy> },
      { path: '/admin/config', element: <Lazy><AdminConfigPage /></Lazy> },
      { path: '/admin/submissions', element: <Lazy><AdminSubmissionsPage /></Lazy> },
      { path: '/admin/scoreboard', element: <Lazy><AdminScoreboardPage /></Lazy> },
      { path: '/admin/statistics', element: <Lazy><AdminStatisticsPage /></Lazy> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
