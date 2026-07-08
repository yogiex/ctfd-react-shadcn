import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '@/lib/api/client'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertCircle,
  Trophy,
  Award,
  ExternalLink,
  Users,
  Crown,
} from 'lucide-react'
import { formatDate, formatScore } from '@/lib/utils'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { Team } from '@/types'

echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

interface Solve {
  challenge_id: number
  challenge: { id: number; name: string; category: string; value: number }
  date: string
}

interface AwardItem {
  id: number
  name: string
  description: string
  value: number
  category: string
  icon: string | null
  date: string
}

export function TeamPublicProfile() {
  const { id } = useParams<{ id: string }>()
  const [team, setTeam] = useState<Team | null>(null)
  const [solves, setSolves] = useState<Solve[]>([])
  const [awards, setAwards] = useState<AwardItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    setError(null)

    Promise.all([
      api.get<Team>(`/teams/${id}`).catch(() => null),
      api.get<Solve[]>(`/teams/${id}/solves`).catch(() => [] as Solve[]),
      api.get<AwardItem[]>(`/teams/${id}/awards`).catch(() => [] as AwardItem[]),
    ])
      .then(([teamData, solvesData, awardsData]) => {
        if (!teamData) {
          setError('Team not found')
          return
        }
        setTeam(teamData)
        setSolves(solvesData ?? [])
        setAwards(awardsData ?? [])
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      })
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !team) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || 'Team not found'}</AlertDescription>
      </Alert>
    )
  }

  const initial = team.name?.charAt(0).toUpperCase() ?? '?'

  const scoresByDay = solves.reduce(
    (acc, s) => {
      const day = s.date.slice(0, 10)
      acc[day] = (acc[day] || 0) + (s.challenge?.value ?? 0)
      return acc
    },
    {} as Record<string, number>,
  )
  const sortedDays = Object.entries(scoresByDay).sort(([a], [b]) =>
    a.localeCompare(b),
  )
  let cumulative = 0
  const chartData = sortedDays.map(([day, score]) => {
    cumulative += score
    return { day, score: cumulative }
  })

  const chartOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: 40, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category' as const,
      data: chartData.map((d) => d.day),
      axisLabel: { rotate: 45, fontSize: 11 },
    },
    yAxis: { type: 'value' as const },
    series: [
      {
        type: 'bar' as const,
        data: chartData.map((d) => d.score),
        itemStyle: { color: '#3b82f6' },
      },
    ],
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initial}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold">{team.name}</h2>
                {team.bracket_name && (
                  <Badge variant="secondary">{team.bracket_name}</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-muted-foreground">
                {team.affiliation && <span>{team.affiliation}</span>}
                {team.country && <span>{team.country}</span>}
                {team.website && (
                  <a
                    href={team.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {team.website}
                  </a>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-bold">
                {team.score != null ? formatScore(team.score) : '—'}
              </div>
              <div className="text-sm text-muted-foreground">
                {team.place != null ? `#${team.place}` : 'Unranked'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members ({team.members?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/users/${member.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {member.name}
                      </Link>
                      {member.id === team.captain_id && (
                        <Crown className="h-4 w-4 text-amber-500" aria-label="Captain" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.score != null ? formatScore(member.score) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Score Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactEChartsCore
              echarts={echarts}
              option={chartOption}
              style={{ height: 300 }}
              notMerge
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="solves">
        <TabsList>
          <TabsTrigger value="solves" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Solves ({solves.length})
          </TabsTrigger>
          <TabsTrigger value="awards" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Awards ({awards.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solves" className="mt-4">
          {solves.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No solves yet.
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Challenge</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solves.map((solve, i) => (
                  <TableRow key={solve.challenge_id ?? i}>
                    <TableCell className="font-medium">
                      {solve.challenge?.name ?? `#${solve.challenge_id}`}
                    </TableCell>
                    <TableCell>{solve.challenge?.category ?? '—'}</TableCell>
                    <TableCell>
                      {solve.challenge?.value != null
                        ? formatScore(solve.challenge.value)
                        : '—'}
                    </TableCell>
                    <TableCell>{formatDate(solve.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="awards" className="mt-4">
          {awards.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No awards yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {awards.map((award) => (
                <Card key={award.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{award.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {award.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        +{formatScore(award.value)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {formatDate(award.date)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
