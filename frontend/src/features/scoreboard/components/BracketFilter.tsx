import { cn } from '@/lib/utils'
import type { Bracket } from '../types/scoreboard'

interface Props {
  brackets: Bracket[]
  activeBracket: number | null
  onBracketChange: (id: number | null) => void
}

export function BracketFilter({ brackets, activeBracket, onBracketChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onBracketChange(null)}
        className={cn(
          'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
          activeBracket === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        )}
      >
        All
      </button>
      {brackets.map((b) => (
        <button
          key={b.id}
          onClick={() => onBracketChange(b.id)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
            activeBracket === b.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          )}
        >
          {b.name}
        </button>
      ))}
    </div>
  )
}
