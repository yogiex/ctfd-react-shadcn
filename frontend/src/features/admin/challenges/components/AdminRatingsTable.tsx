import { useChallengeRatingsAdmin } from '../hooks/useAdminChallenges'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatDate } from '@/lib/utils'
import { ThumbsUp, ThumbsDown, AlertCircle, Star } from 'lucide-react'

interface AdminRatingsTableProps {
  challengeId: number
}

export function AdminRatingsTable({ challengeId }: AdminRatingsTableProps) {
  const { data: ratings, isLoading, error } =
    useChallengeRatingsAdmin(challengeId)

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load ratings</AlertDescription>
      </Alert>
    )
  }

  if (!ratings || ratings.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No ratings yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        Ratings ({ratings.length})
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Review</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ratings.map((rating) => (
            <TableRow key={rating.id}>
              <TableCell className="font-medium">{rating.user}</TableCell>
              <TableCell>
                {rating.value > 0 ? (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800"
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Up
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-red-600 border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800"
                  >
                    <ThumbsDown className="h-3 w-3 mr-1" />
                    Down
                  </Badge>
                )}
              </TableCell>
              <TableCell className="max-w-[300px] truncate">
                {rating.review || '-'}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(rating.date)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
