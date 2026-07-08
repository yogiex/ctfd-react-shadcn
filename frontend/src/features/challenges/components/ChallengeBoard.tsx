import { useState, useMemo } from 'react'
import { useChallenges } from '../hooks/useChallenges'
import { ChallengeCard } from './ChallengeCard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCw, Puzzle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChallengeBoardProps {
  onChallengeSelect?: (id: number) => void
}

export function ChallengeBoard({ onChallengeSelect = () => {} }: ChallengeBoardProps) {
  const { data: challenges, isLoading, isError, error, refetch } = useChallenges()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    if (!challenges) return []
    const cats = new Set(challenges.map((c) => c.category))
    return Array.from(cats).sort()
  }, [challenges])

  const filtered = useMemo(() => {
    if (!challenges) return []
    if (!selectedCategory) return challenges
    return challenges.filter((c) => c.category === selectedCategory)
  }, [challenges, selectedCategory])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const c of filtered) {
      const group = map.get(c.category) ?? []
      group.push(c)
      map.set(c.category, group)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border bg-card">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-5 w-40 mb-2" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load challenges</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{error instanceof Error ? error.message : 'There was an error fetching challenges.'}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RotateCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!challenges || challenges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Puzzle className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No challenges available</p>
        <p className="text-sm">Check back later for new challenges.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium transition-colors',
            selectedCategory === null
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              selectedCategory === cat
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {grouped.map(([category, challenges]) => (
        <div key={category}>
          <div className="flex items-center gap-1.5 mb-3">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">
              {category}
            </h3>
            <span className="text-xs text-muted-foreground/60">
              ({challenges.length})
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onSelect={onChallengeSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
