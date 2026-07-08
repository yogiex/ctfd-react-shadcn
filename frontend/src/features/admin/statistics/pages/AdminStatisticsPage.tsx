import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { QUERY_KEYS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Users, Shield, Flag, ClipboardList, CheckCircle } from 'lucide-react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent, TitleComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([PieChart, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer])

interface Challenge {
  id: number
  name: string
  category: string
  value: number
  type: string
  state: string
  solves?: number
}

interface ScoreboardEntry {
  pos: number
  account_id: number
  name: string
  score: number
}

function useAdminStats() {
  const challenges = useQuery({
    queryKey: ['admin', 'stats', 'challenges'],
    queryFn: () => api.get<Challenge[]>('/challenges', { params: { view: 'admin' } as any }),
    staleTime: 60_000,
  })

  const users = useQuery({
    queryKey: ['admin', 'stats', 'users'],
    queryFn: () => api.get<unknown[]>('/users', { params: { view: 'admin', per_page: 1 } as any }),
    staleTime: 60_000,
  })

  const teams = useQuery({
    queryKey: ['admin', 'stats', 'teams'],
    queryFn: () => api.get<unknown[]>('/teams', { params: { view: 'admin', per_page: 1 } as any }),
    staleTime: 60_000,
  })

  const submissions = useQuery({
    queryKey: ['admin', 'stats', 'submissions'],
    queryFn: () => api.get<unknown[]>('/submissions', { params: { view: 'admin', per_page: 1 } as any }),
    staleTime: 60_000,
  })

  const scoreboard = useQuery({
    queryKey: [QUERY_KEYS.SCOREBOARD, 'stats'],
    queryFn: () => api.get<ScoreboardEntry[]>('/scoreboard'),
    staleTime: 60_000,
  })

  const isLoading = challenges.isLoading || scoreboard.isLoading
  const isError = challenges.isError || scoreboard.isError

  return {
    challenges: challenges.data ?? [],
    usersCount: users.data?.length ?? 0,
    teamsCount: teams.data?.length ?? 0,
    submissionsCount: submissions.data?.length ?? 0,
    scoreboard: scoreboard.data ?? [],
    isLoading,
    isError,
  }
}

function StatCard({
  title, value, icon: Icon, isLoading,
}: {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function AdminStatisticsPage() {
  const { challenges, usersCount, teamsCount, submissionsCount, scoreboard, isLoading, isError } = useAdminStats()

  const totalSolves = useMemo(
    () => challenges?.reduce((sum, c) => sum + (c.solves ?? 0), 0) ?? 0,
    [challenges],
  )

  const solvesByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of challenges ?? []) {
      map.set(c.category, (map.get(c.category) ?? 0) + (c.solves ?? 0))
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [challenges])

  const pieOption = useMemo(() => ({
    tooltip: { trigger: 'item' as const },
    series: [{
      type: 'pie',
      radius: ['30%', '60%'],
      data: solvesByCategory.length > 0 ? solvesByCategory : [{ name: 'No data', value: 1 }],
      label: { show: true, formatter: '{b}: {c}' },
      itemStyle: { borderRadius: 4 },
    }],
  }), [solvesByCategory])

  const topChallenges = useMemo(
    () => [...(challenges ?? [])]
      .sort((a, b) => (b.solves ?? 0) - (a.solves ?? 0))
      .slice(0, 10),
    [challenges],
  )

  const barOption = useMemo(() => ({
    tooltip: { trigger: 'axis' as const },
    grid: { left: 20, right: 20, bottom: 80, top: 20 },
    xAxis: {
      type: 'category' as const,
      data: topChallenges.map((c) => c.name),
      axisLabel: { rotate: 45, fontSize: 11, interval: 0 },
    },
    yAxis: { type: 'value' as const, minInterval: 1 },
    series: [{
      type: 'bar',
      data: topChallenges.map((c) => c.solves ?? 0),
      itemStyle: { borderRadius: [4, 4, 0, 0] },
    }],
  }), [topChallenges])

  const scoreDistribution = useMemo(() => {
    const buckets = new Array(10).fill(0)
    const maxScore = Math.max(...(scoreboard?.map((s) => s.score) ?? [0]), 1)
    const bucketSize = Math.ceil(maxScore / 10)
    for (const s of scoreboard ?? []) {
      const idx = Math.min(Math.floor(s.score / bucketSize), 9)
      buckets[idx]++
    }
    return {
      categories: buckets.map((_, i) => {
        const low = i * bucketSize
        const high = (i + 1) * bucketSize
        return `${low}-${high}`
      }),
      values: buckets,
    }
  }, [scoreboard])

  const lineOption = useMemo(() => ({
    tooltip: { trigger: 'axis' as const },
    grid: { left: 50, right: 20, bottom: 30, top: 20 },
    xAxis: {
      type: 'category' as const,
      data: scoreDistribution.categories,
    },
    yAxis: { type: 'value' as const, minInterval: 1 },
    series: [{
      type: 'line',
      data: scoreDistribution.values,
      smooth: true,
      areaStyle: { opacity: 0.15 },
    }],
  }), [scoreDistribution])

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load statistics. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of CTF activity and performance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Users" value={usersCount} icon={Users} isLoading={isLoading} />
        <StatCard title="Teams" value={teamsCount} icon={Shield} isLoading={isLoading} />
        <StatCard title="Challenges" value={challenges?.length ?? 0} icon={Flag} isLoading={isLoading} />
        <StatCard title="Submissions" value={submissionsCount} icon={ClipboardList} isLoading={isLoading} />
        <StatCard title="Solves" value={totalSolves} icon={CheckCircle} isLoading={isLoading} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Solves by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : solvesByCategory.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No solves yet
              </div>
            ) : (
              <ReactEChartsCore echarts={echarts} option={pieOption} style={{ height: 300 }} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Solved Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : topChallenges.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No challenges yet
              </div>
            ) : (
              <ReactEChartsCore echarts={echarts} option={barOption} style={{ height: 300 }} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : scoreDistribution.values.every((v) => v === 0) ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No scores yet
              </div>
            ) : (
              <ReactEChartsCore echarts={echarts} option={lineOption} style={{ height: 300 }} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
