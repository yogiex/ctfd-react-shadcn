import { useState } from 'react'
import { useAuth } from '@/contexts'
import type { ScoreboardEntry } from '../types/scoreboard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Props {
  standings: ScoreboardEntry[]
}

export function ScoreboardTable({ standings }: Props) {
  const { user } = useAuth()
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (standings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Scoreboard is empty
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.map((entry) => {
          const isCurrentUser = user?.id === entry.account_id
          const isExpanded = expanded.has(entry.account_id)
          const hasMembers = entry.members && entry.members.length > 0

          return (
            <TableRow
              key={entry.account_id}
              className={cn(
                isCurrentUser && 'bg-muted/50 font-medium',
              )}
            >
              <TableCell className="align-top py-3">{entry.pos}</TableCell>
              <TableCell className="py-3">
                <div className="flex items-center gap-2">
                  {hasMembers && (
                    <button
                      onClick={() => toggleExpand(entry.account_id)}
                      className="p-0.5 hover:bg-muted rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  <div className="space-y-1">
                    <div>{entry.name}</div>
                    {isExpanded && hasMembers && (
                      <div className="pl-6 space-y-0.5">
                        {entry.members!.map((m) => (
                          <div
                            key={m.id}
                            className="text-sm text-muted-foreground flex items-center justify-between gap-4"
                          >
                            <span>{m.name}</span>
                            <span>{m.score}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right align-top py-3">
                {entry.score}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
