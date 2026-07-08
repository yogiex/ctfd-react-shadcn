import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminChallenges, useDeleteChallenge } from '../hooks/useAdminChallenges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
  Trophy,
} from 'lucide-react'

export function AdminChallengesListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data: challenges, isLoading, error } = useAdminChallenges(search)
  const deleteChallenge = useDeleteChallenge()

  const filtered = challenges?.filter((c) =>
    search
      ? c.name.toLowerCase().includes(search.toLowerCase())
      : true
  )

  const handleDelete = async (id: number) => {
    await deleteChallenge.mutateAsync(id)
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load challenges. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Challenges</h1>
          <p className="text-muted-foreground text-sm">
            Manage CTF challenges
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/challenges/new">
            <Plus className="h-4 w-4 mr-1" />
            Create Challenge
          </Link>
        </Button>
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
        </div>
      ) : filtered && filtered.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No challenges found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search
              ? 'No challenges match your search.'
              : 'Get started by creating your first challenge.'}
          </p>
          {!search && (
            <Button asChild>
              <Link to="/admin/challenges/new">
                <Plus className="h-4 w-4 mr-1" />
                Create Challenge
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Solves</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((challenge) => (
                <TableRow
                  key={challenge.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/admin/challenges/${challenge.id}`)}
                >
                  <TableCell className="font-mono text-xs">
                    {challenge.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {challenge.name}
                  </TableCell>
                  <TableCell>{challenge.category}</TableCell>
                  <TableCell>{challenge.value}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {challenge.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {challenge.state === 'visible' ? (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Visible
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800"
                      >
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hidden
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{challenge.solves ?? 0}</TableCell>
                  <TableCell>
                    <div
                      className="flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link to={`/admin/challenges/${challenge.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Challenge
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &ldquo;
                              {challenge.name}&rdquo;? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(challenge.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
