import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '@/types/api'
import type { User } from '@/types'

const SEARCH_FIELDS = [
  { value: 'name', label: 'Name' },
  { value: 'website', label: 'Website' },
  { value: 'country', label: 'Country' },
  { value: 'affiliation', label: 'Affiliation' },
] as const

export function UsersListPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchField, setSearchField] = useState('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number | undefined> = { page }
      if (searchQuery) {
        params.q = searchQuery
        params.field = searchField
      }
      const url = `/api/v1/users?${new URLSearchParams(
        Object.entries(params).reduce(
          (acc, [k, v]) => (v !== undefined ? { ...acc, [k]: String(v) } : acc),
          {} as Record<string, string>,
        ),
      ).toString()}`
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        redirect: 'manual',
      })
      if (res.type === 'opaqueredirect' || res.status === 302) {
        throw new Error('CTFd is not configured yet. Please complete the setup first.')
      }
      if (!res.ok) {
        throw new Error(`Failed to fetch users (${res.status})`)
      }
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.errors?.[0] || 'Failed to fetch users')
      }
      setUsers(json.data as User[])
      setPagination(json.meta?.pagination ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [page, searchQuery, searchField])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <div className="w-40">
              <Label htmlFor="field" className="sr-only">
                Search field
              </Label>
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger id="field">
                  <SelectValue placeholder="Field" />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_FIELDS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="q" className="sr-only">
                Search query
              </Label>
              <Input
                id="q"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? 'No users match your search.' : 'No users found.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Affiliation</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Website</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link
                        to={`/users/${user.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {user.name}
                      </Link>
                    </TableCell>
                    <TableCell>{user.affiliation || '—'}</TableCell>
                    <TableCell>{user.country || '—'}</TableCell>
                    <TableCell>
                      {user.website ? (
                        <a
                          href={user.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {user.website}
                        </a>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.prev || isLoading}
                  onClick={() => setPage(pagination.prev!)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.next || isLoading}
                  onClick={() => setPage(pagination.next!)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
