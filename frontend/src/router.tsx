import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { PublicLayout } from '@/layouts/PublicLayout'
import { MainLayout } from '@/layouts/MainLayout'

const HomePage = lazy(() => import('@/features/home/pages/HomePage').then(m => ({ default: m.HomePage })))
const ChallengeBoardPage = lazy(() => import('@/features/challenges/pages/ChallengeBoardPage').then(m => ({ default: m.ChallengeBoardPage })))
const ScoreboardPage = lazy(() => import('@/features/scoreboard/pages/ScoreboardPage').then(m => ({ default: m.ScoreboardPage })))
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const UsersListPage = lazy(() => import('@/features/users/pages/UsersListPage').then(m => ({ default: m.UsersListPage })))
const UserPublicProfile = lazy(() => import('@/features/users/pages/UserPublicProfile').then(m => ({ default: m.UserPublicProfile })))
const TeamsListPage = lazy(() => import('@/features/teams/pages/TeamsListPage').then(m => ({ default: m.TeamsListPage })))
const TeamPublicProfile = lazy(() => import('@/features/teams/pages/TeamPublicProfile').then(m => ({ default: m.TeamPublicProfile })))
const TeamPrivatePage = lazy(() => import('@/features/teams/pages/TeamPrivatePage').then(m => ({ default: m.TeamPrivatePage })))
const StaticPage = lazy(() => import('@/features/pages/pages/StaticPage').then(m => ({ default: m.StaticPage })))

export const router = createBrowserRouter([
  {
    element: <ErrorBoundary><PublicLayout /></ErrorBoundary>,
    children: [
      { path: '/', element: <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><HomePage /></Suspense> },
    ],
  },
  {
    element: <ErrorBoundary><MainLayout /></ErrorBoundary>,
    children: [
      { path: '/challenges', element: <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><ChallengeBoardPage /></Suspense> },
      { path: '/scoreboard', element: <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><ScoreboardPage /></Suspense> },
      { path: '/notifications', element: <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><NotificationsPage /></Suspense> },
      { path: '/users', element: <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><UsersListPage /></Suspense> },
      { path: '/users/:id', element: <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><UserPublicProfile /></Suspense> },
      { path: '/teams', element: <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><TeamsListPage /></Suspense> },
      { path: '/teams/:id', element: <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><TeamPublicProfile /></Suspense> },
      { path: '/team', element: <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><TeamPrivatePage /></Suspense> },
      { path: '/:route', element: <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><StaticPage /></Suspense> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
