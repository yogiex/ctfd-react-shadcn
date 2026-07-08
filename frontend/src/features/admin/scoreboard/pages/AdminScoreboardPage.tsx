import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { QUERY_KEYS } from '@/lib/constants'
import { Input } from '@/components/ui/input'

import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatScore } from '@/lib/utils'
import { Search, AlertCircle, Trophy, Users, Shield } from 'lucide-react'

interface ScoreboardEntry {
  pos: number
  account_id: number
  account_url: string
  account_type: 'users' | 'teams'
  name: string
  score: number
  bracket_id: number | null
  bracket_name: string | null
  members?: { id: number; name: string; score: number }[]
}

export function AdminScoreboardPage() {
  const [search, setSearch] = useState('')

  const { data: standings, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.SCOREBOARD, 'admin'],
    queryFn: () => api.get<ScoreboardEntry[]>('/scoreboard'),
    staleTime: 30_000,
    refetchInterval: 30_000,
  })

  const filtered = useMemo(() => {
    if (!standings) return []
    if (!search) return standings
    const q = search.toLowerCase()
    return standings.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.account_type.toLowerCase().includes(q),
    )
  }, [standings, search])

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load scoreboard. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scoreboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View current standings
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No standings found</h3>
          <p className="text-sm text-muted-foreground">
            {search
              ? 'No entries match your search.'
              : 'Scoreboard is empty.'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium w-12">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium w-24">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium w-24">Bracket</th>
                <th className="px-4 py-3 text-right text-sm font-medium w-24">Score</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.account_id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-bold text-sm">{entry.pos}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {entry.account_type === 'teams' ? (
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Users className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={entry.account_type === 'teams' ? 'font-medium' : ''}>
                        {entry.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                    {entry.account_type}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {entry.bracket_name && (
                      <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs">
                        {entry.bracket_name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono font-bold">
                    {formatScore(entry.score)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
