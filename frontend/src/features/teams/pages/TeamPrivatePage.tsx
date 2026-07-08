import { useState, useEffect, useCallback } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { api } from '@/lib/api/client'
import { useAuth } from '@/contexts'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertCircle,
  Trophy,
  Award,
  Users,
  Crown,
  Settings,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { formatDate, formatScore } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
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

type PageState = 'loading' | 'not_in_team' | 'loaded' | 'error'

export function TeamPrivatePage() {
  const { user, userMode } = useAuth()
  const { toast } = useToast()
  const [state, setState] = useState<PageState>('loading')
  const [pageError, setPageError] = useState<string | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [solves, setSolves] = useState<Solve[]>([])
  const [awards, setAwards] = useState<AwardItem[]>([])
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editWebsite, setEditWebsite] = useState('')
  const [editAffiliation, setEditAffiliation] = useState('')
  const [editCountry, setEditCountry] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const isCaptain =
    team != null && user != null && team.captain_id === user.id

  const fetchData = useCallback(async () => {
    setState('loading')
    setPageError(null)
    try {
      const teamData = await api.get<Team>('/teams/me')
      setTeam(teamData)
      setEditName(teamData.name ?? '')
      setEditWebsite(teamData.website ?? '')
      setEditAffiliation(teamData.affiliation ?? '')
      setEditCountry(teamData.country ?? '')

      const [solvesData, awardsData] = await Promise.all([
        api.get<Solve[]>('/teams/me/solves').catch(() => [] as Solve[]),
        api.get<AwardItem[]>('/teams/me/awards').catch(() => [] as AwardItem[]),
      ])
      setSolves(solvesData ?? [])
      setAwards(awardsData ?? [])
      setState('loaded')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load team'
      if (msg.toLowerCase().includes('team') || msg.toLowerCase().includes('403')) {
        setState('not_in_team')
      } else {
        setState('error')
        setPageError(msg)
      }
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleGenerateInvite = async () => {
    try {
      const res = await api.post<{ code: string }>('/teams/me/members')
      setInviteCode(res.code)
      toast({ title: 'Invite code generated' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to generate code',
        variant: 'destructive',
      })
    }
  }

  const handleSaveEdit = async () => {
    setIsSaving(true)
    try {
      const updated = await api.patch<Team>('/teams/me', {
        name: editName,
        website: editWebsite || '',
        affiliation: editAffiliation || '',
        country: editCountry || '',
      })
      setTeam(updated)
      setEditOpen(false)
      toast({ title: 'Team updated' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update team',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (userMode !== 'teams') {
    return <Navigate to="/" replace />
  }

  if (state === 'loading') {
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

  if (state === 'not_in_team') {
    return <Navigate to="/teams/enroll" replace />
  }

  if (state === 'error' || !team) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{pageError || 'Failed to load team'}</AlertDescription>
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
                {isCaptain && <Badge>Captain</Badge>}
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

      {isCaptain && (
        <div className="flex gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Edit Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Team</DialogTitle>
                <DialogDescription>
                  Update your team&apos;s information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Team Name</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-website">Website</Label>
                  <Input
                    id="edit-website"
                    placeholder="https://"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-affiliation">Affiliation</Label>
                  <Input
                    id="edit-affiliation"
                    value={editAffiliation}
                    onChange={(e) => setEditAffiliation(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-country">Country</Label>
                  <Input
                    id="edit-country"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateInvite}
          >
            <Copy className="h-4 w-4 mr-2" />
            Generate Invite
          </Button>
        </div>
      )}

      {inviteCode && (
        <Card className="border-primary/50">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Invite Code</p>
              <code className="text-lg font-mono text-primary">
                {inviteCode}
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(inviteCode)
                toast({ title: 'Copied to clipboard' })
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

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
                <TableHead className="w-24">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Link
                      to={`/users/${member.id}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {member.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {member.score != null ? formatScore(member.score) : '—'}
                  </TableCell>
                  <TableCell>
                    {member.id === team.captain_id ? (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 w-fit"
                      >
                        <Crown className="h-3 w-3 text-amber-500" />
                        Captain
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Member
                      </span>
                    )}
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
