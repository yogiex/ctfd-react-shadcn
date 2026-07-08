import { useChallengeSolves } from '../hooks/useChallengeSolves'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ChallengeSolvesListProps {
  challengeId: number | null
}

export function ChallengeSolvesList({ challengeId }: ChallengeSolvesListProps) {
  const { data: solves, isLoading, isError } = useChallengeSolves(challengeId)

  if (!challengeId) return null

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="py-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Failed to load solves.
        </AlertDescription>
      </Alert>
    )
  }

  if (!solves || solves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Users className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No solves yet</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead className="text-right">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {solves.map((solve) => (
          <TableRow key={`${solve.account_id}-${solve.date}`}>
            <TableCell className="font-medium">
              {solve.account_url ? (
                <a
                  href={solve.account_url}
                  className="hover:underline text-primary"
                >
                  {solve.name}
                </a>
              ) : (
                solve.name
              )}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {formatDate(solve.date)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
