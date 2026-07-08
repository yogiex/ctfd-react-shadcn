import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Trophy } from 'lucide-react'
import { cn, formatScore } from '@/lib/utils'
import type { ChallengeListItem } from '../types/challenge'

interface ChallengeCardProps {
  challenge: ChallengeListItem
  onSelect: (id: number) => void
}

export function ChallengeCard({ challenge, onSelect }: ChallengeCardProps) {
  return (
    <button
      onClick={() => onSelect(challenge.id)}
      className="text-left w-full"
    >
      <Card
        className={cn(
          'p-4 transition-all hover:border-primary/50 cursor-pointer border',
          challenge.solved_by_me && 'border-l-4 border-l-green-500'
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {challenge.category}
          </Badge>
          {challenge.solved_by_me && (
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          )}
        </div>
        <h3 className="font-mono font-semibold text-sm mb-2 truncate">
          {challenge.name}
        </h3>
        <div className="flex items-center justify-between text-sm">
          <span className="font-mono font-bold">
            {challenge.value}pts
          </span>
          <span className="text-muted-foreground flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {formatScore(challenge.solves ?? 0)}
          </span>
        </div>
      </Card>
    </button>
  )
}
