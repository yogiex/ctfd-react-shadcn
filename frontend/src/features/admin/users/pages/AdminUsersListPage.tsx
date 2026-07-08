import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  useAdminUsers, useCreateUser, useUpdateUser, useDeleteUser,
  type UserAdmin, type UserCreateInput, type UserUpdateInput,
} from '../hooks/useAdminUsers'
import { formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'

const SEARCH_FIELDS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'affiliation', label: 'Affiliation' },
  { value: 'country', label: 'Country' },
]

function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  loading,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  user?: UserAdmin
  onSubmit: (data: UserCreateInput | UserUpdateInput) => void
  loading: boolean
}) {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [type, setType] = useState<'admin' | 'user'>(user?.type ?? 'user')
  const [verified, setVerified] = useState(user?.verified ?? false)
  const [banned, setBanned] = useState(user?.banned ?? false)
  const [hidden, setHidden] = useState(user?.hidden ?? false)
  const [affiliation, setAffiliation] = useState(user?.affiliation ?? '')
  const [country, setCountry] = useState(user?.country ?? '')
  const [website, setWebsite] = useState(user?.website ?? '')
  const [language, setLanguage] = useState(user?.language ?? '')
  const [notify, setNotify] = useState(false)

  const isEdit = !!user

  const handleSubmit = () => {
    const base = {
      name,
      email,
      type,
      verified,
      banned,
      hidden,
      affiliation: affiliation || undefined,
      country: country || undefined,
      website: website || undefined,
      language: language || undefined,
    }
    if (isEdit) {
      const data: UserUpdateInput = { ...base }
      if (password) data.password = password
      onSubmit(data)
    } else {
      const data: UserCreateInput = { ...base, password }
      if (notify) data.notify = true
      onSubmit(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Create User'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password {isEdit ? '(leave blank to keep)' : ''}</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="affiliation">Affiliation</Label>
              <Input id="affiliation" value={affiliation} onChange={e => setAffiliation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={country} onChange={e => setCountry(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={website} onChange={e => setWebsite(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input id="language" value={language} onChange={e => setLanguage(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(v: 'admin' | 'user') => setType(v)}>
              <SelectTrigger id="type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch id="verified" checked={verified} onCheckedChange={setVerified} />
              <Label htmlFor="verified">Verified</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="banned" checked={banned} onCheckedChange={setBanned} />
              <Label htmlFor="banned">Banned</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="hidden" checked={hidden} onCheckedChange={setHidden} />
              <Label htmlFor="hidden">Hidden</Label>
            </div>
          </div>
          {!isEdit && (
            <div className="flex items-center gap-2">
              <Switch id="notify" checked={notify} onCheckedChange={setNotify} />
              <Label htmlFor="notify">Send notification email</Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={loading}>
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  userName,
  onConfirm,
  loading,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  userName: string
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{userName}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function AdminUsersListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [searchField, setSearchField] = useState('name')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserAdmin | null>(null)
  const [deleteUser, setDeleteUser] = useState<UserAdmin | null>(null)

  const { data, isLoading, isError, error } = useAdminUsers({ q: search || undefined, field: searchField, page })
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()

  const users = data?.data ?? []
  const pagination = data?.pagination

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Select value={searchField} onValueChange={setSearchField}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEARCH_FIELDS.map(f => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search by ${SEARCH_FIELDS.find(f => f.value === searchField)?.label.toLowerCase()}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load users: {(error as Error)?.message ?? 'Unknown error'}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-20">Verified</TableHead>
              <TableHead className="w-20">Banned</TableHead>
              <TableHead className="w-24">Type</TableHead>
              <TableHead className="w-32">Created</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  {search ? 'No users match your search.' : 'No users found.'}
                </TableCell>
              </TableRow>
            ) : (
              users.map(user => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/admin/users/${user.id}`)}
                >
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.verified ? 'default' : 'secondary'}>
                      {user.verified ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.banned ? 'destructive' : 'secondary'}>
                      {user.banned ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.type === 'admin' ? 'default' : 'outline'}>
                      {user.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(user.created)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingUser(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteUser(user)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.next}
              onClick={() => setPage(p => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <UserFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={data => createMutation.mutate(data as UserCreateInput, { onSuccess: () => setCreateOpen(false) })}
        loading={createMutation.isPending}
      />

      <UserFormDialog
        open={!!editingUser}
        onOpenChange={v => !v && setEditingUser(null)}
        user={editingUser ?? undefined}
        onSubmit={data =>
          editingUser &&
          updateMutation.mutate(
            { id: editingUser.id, data },
            { onSuccess: () => setEditingUser(null) },
          )
        }
        loading={updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={!!deleteUser}
        onOpenChange={v => !v && setDeleteUser(null)}
        userName={deleteUser?.name ?? ''}
        onConfirm={() =>
          deleteUser &&
          deleteMutation.mutate(deleteUser.id, { onSuccess: () => setDeleteUser(null) })
        }
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
