import { useState, useMemo } from 'react'
import { useAuth } from '@/contexts'
import { useScoreboard, useScoreboardDetail, useBrackets } from '../hooks/useScoreboard'
import { ScoreboardTable } from '../components/ScoreboardTable'
import { ScoreboardGraph } from '../components/ScoreboardGraph'
import { BracketFilter } from '../components/BracketFilter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function ScoreboardPage() {
  const { userMode } = useAuth()
  const [activeBracket, setActiveBracket] = useState<number | null>(null)

  const { data: brackets } = useBrackets(userMode)
  const {
    data: standings,
    isLoading: standingsLoading,
    error: standingsError,
  } = useScoreboard()
  const { data: graphData, isLoading: graphLoading } = useScoreboardDetail(
    10,
    activeBracket,
  )

  const filteredStandings = useMemo(() => {
    if (!standings) return []
    if (activeBracket === null) return standings
    return standings.filter((s) => s.bracket_id === activeBracket)
  }, [standings, activeBracket])

  if (standingsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {standingsError instanceof Error
            ? standingsError.message
            : 'Failed to load scoreboard'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scoreboard</h1>
      </div>

      {brackets && brackets.length > 0 && (
        <BracketFilter
          brackets={brackets}
          activeBracket={activeBracket}
          onBracketChange={setActiveBracket}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Scoreboard Graph</CardTitle>
        </CardHeader>
        <CardContent>
          {graphLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : graphData && Object.keys(graphData).length > 0 ? (
            <ScoreboardGraph data={graphData} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No scoreboard data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Standings</CardTitle>
        </CardHeader>
        <CardContent>
          {standingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <ScoreboardTable standings={filteredStandings} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
