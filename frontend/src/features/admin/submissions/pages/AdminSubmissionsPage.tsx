import { useState } from 'react'
import {
  useAdminSubmissions,
  useUpdateSubmission,
  useDeleteSubmission,
  type Submission,
} from '../hooks/useAdminSubmissions'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import {
  AlertCircle, Search, Check, X, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react'

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'correct', label: 'Correct' },
  { value: 'incorrect', label: 'Incorrect' },
]

const typeBadgeVariant = (type: string) => {
  switch (type) {
    case 'correct':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' as const
    case 'incorrect':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' as const
    case 'partial':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' as const
    case 'ratelimited':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700' as const
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' as const
  }
}

export function AdminSubmissionsPage() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [challengeSearch, setChallengeSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Submission | null>(null)

  const { data: submissions, isLoading, error } = useAdminSubmissions({
    page,
    type: typeFilter || undefined,
    challenge_id: challengeSearch ? Number(challengeSearch) : undefined,
    user_id: userSearch ? Number(userSearch) : undefined,
  })

  const updateMutation = useUpdateSubmission()
  const deleteMutation = useDeleteSubmission()

  const handleMarkCorrect = (id: number) => {
    updateMutation.mutate({ id, type: 'correct' })
  }

  const handleMarkIncorrect = (id: number) => {
    updateMutation.mutate({ id, type: 'incorrect' })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load submissions. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and moderate all challenge submissions
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative w-40">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Challenge ID"
            value={challengeSearch}
            onChange={(e) => { setChallengeSearch(e.target.value); setPage(1) }}
            className="pl-8"
          />
        </div>

        <div className="relative w-40">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="User ID"
            value={userSearch}
            onChange={(e) => { setUserSearch(e.target.value); setPage(1) }}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !submissions || submissions.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No submissions found</h3>
          <p className="text-sm text-muted-foreground">
            {typeFilter
              ? `No ${typeFilter} submissions match your filters.`
              : 'No submissions have been made yet.'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Challenge</TableHead>
                <TableHead>User / Team</TableHead>
                <TableHead className="max-w-xs">Provided</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">IP</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-mono text-xs">{sub.id}</TableCell>
                  <TableCell className="font-medium">
                    {sub.challenge?.name ?? `#${sub.challenge_id}`}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({sub.challenge?.value ?? '?'}pts)
                    </span>
                  </TableCell>
                  <TableCell>
                    {sub.user?.name ?? `User #${sub.user_id}`}
                    {sub.team && (
                      <span className="text-xs text-muted-foreground">
                        {' '}/ {sub.team.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-mono text-xs">
                    {sub.provided}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeBadgeVariant(sub.type)}>
                      {sub.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                    {sub.ip}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {formatDate(sub.date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {sub.type !== 'correct' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600"
                          onClick={() => handleMarkCorrect(sub.id)}
                          disabled={updateMutation.isPending}
                          title="Mark Correct"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {sub.type !== 'incorrect' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleMarkIncorrect(sub.id)}
                          disabled={updateMutation.isPending}
                          title="Mark Incorrect"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleteTarget(sub)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {submissions?.length ?? 0} submissions
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!submissions || submissions.length < 50}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete submission #{deleteTarget?.id}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
