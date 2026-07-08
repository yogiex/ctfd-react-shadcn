import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  useAdminUser, useAdminUserSolves, useAdminUserFails, useAdminUserAwards,
  useUpdateUser, useDeleteUser,
  type UserAdmin, type UserUpdateInput,
} from '../hooks/useAdminUsers'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Pencil, Trash2, Award } from 'lucide-react'

function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  loading,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  user: UserAdmin
  onSubmit: (data: UserUpdateInput) => void
  loading: boolean
}) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState('')
  const [type, setType] = useState<'admin' | 'user'>(user.type)
  const [verified, setVerified] = useState(user.verified)
  const [banned, setBanned] = useState(user.banned)
  const [hidden, setHidden] = useState(user.hidden)
  const [affiliation, setAffiliation] = useState(user.affiliation ?? '')
  const [country, setCountry] = useState(user.country ?? '')
  const [website, setWebsite] = useState(user.website ?? '')
  const [language, setLanguage] = useState(user.language ?? '')

  const handleSubmit = () => {
    const data: UserUpdateInput = {
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
    if (password) data.password = password
    onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User: {user.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-password">Password (leave blank to keep)</Label>
            <Input id="edit-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-affiliation">Affiliation</Label>
              <Input id="edit-affiliation" value={affiliation} onChange={e => setAffiliation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-country">Country</Label>
              <Input id="edit-country" value={country} onChange={e => setCountry(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input id="edit-website" value={website} onChange={e => setWebsite(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-language">Language</Label>
              <Input id="edit-language" value={language} onChange={e => setLanguage(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-type">Type</Label>
            <Select value={type} onValueChange={(v: 'admin' | 'user') => setType(v)}>
              <SelectTrigger id="edit-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch id="edit-verified" checked={verified} onCheckedChange={setVerified} />
              <Label htmlFor="edit-verified">Verified</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="edit-banned" checked={banned} onCheckedChange={setBanned} />
              <Label htmlFor="edit-banned">Banned</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="edit-hidden" checked={hidden} onCheckedChange={setHidden} />
              <Label htmlFor="edit-hidden">Hidden</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={loading}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const userId = id ? Number(id) : null
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: user, isLoading, isError, error } = useAdminUser(userId)
  const solves = useAdminUserSolves(userId)
  const fails = useAdminUserFails(userId)
  const awards = useAdminUserAwards(userId)
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
        </Button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load user: {(error as Error)?.message ?? 'User not found'}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
        </Button>
        <div className="rounded-lg border p-4 text-muted-foreground">User not found.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <Badge variant={user.type === 'admin' ? 'default' : 'outline'}>{user.type}</Badge>
          {user.verified && <Badge variant="default">Verified</Badge>}
          {user.banned && <Badge variant="destructive">Banned</Badge>}
          {user.hidden && <Badge variant="secondary">Hidden</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Score</Label>
              <p className="font-medium">{user.score ?? 0}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Affiliation</Label>
              <p className="font-medium">{user.affiliation ?? '—'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Country</Label>
              <p className="font-medium">{user.country ?? '—'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Website</Label>
              <p className="font-medium">{user.website ?? '—'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Language</Label>
              <p className="font-medium">{user.language ?? '—'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Bracket</Label>
              <p className="font-medium">{user.bracket_name ?? '—'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p className="font-medium">{formatDate(user.created)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Secret</Label>
              <p className="font-mono text-xs truncate">{user.secret}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="solves">Solves ({solves.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="fails">Fails ({fails.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="awards">Awards ({awards.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit User</CardTitle>
              <CardDescription>Update user profile and settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <EditUserDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                user={user}
                onSubmit={data =>
                  updateMutation.mutate(
                    { id: user.id, data },
                    { onSuccess: () => setEditOpen(false) },
                  )
                }
                loading={updateMutation.isPending}
              />
              {!editOpen && (
                <p className="text-sm text-muted-foreground">
                  Click the "Edit" button above to modify this user.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solves">
          <Card>
            <CardHeader>
              <CardTitle>Solves</CardTitle>
            </CardHeader>
            <CardContent>
              {solves.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : solves.data?.length === 0 ? (
                <p className="text-muted-foreground">No solves yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Challenge</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solves.data?.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.challenge_name}</TableCell>
                        <TableCell>{s.challenge_category ?? '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(s.date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fails">
          <Card>
            <CardHeader>
              <CardTitle>Fails</CardTitle>
            </CardHeader>
            <CardContent>
              {fails.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : fails.data?.length === 0 ? (
                <p className="text-muted-foreground">No failed attempts.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Challenge</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fails.data?.map(f => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.challenge_name}</TableCell>
                        <TableCell>{f.challenge_category ?? '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(f.date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awards">
          <Card>
            <CardHeader>
              <CardTitle>Awards</CardTitle>
            </CardHeader>
            <CardContent>
              {awards.isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : awards.data?.length === 0 ? (
                <p className="text-muted-foreground">No awards.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {awards.data?.map(a => (
                    <Card key={a.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{a.icon || <Award className="h-6 w-6" />}</div>
                          <div>
                            <p className="font-medium">{a.name}</p>
                            <p className="text-sm text-muted-foreground">{a.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {a.value} pts &middot; {a.category} &middot; {formatDate(a.date)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Send Email</CardTitle>
              <CardDescription>Send an email to {user.name} ({user.email}).</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Email functionality is not yet implemented.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone.
              All of their solves, awards, and submissions will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteMutation.mutate(user.id, {
                  onSuccess: () => navigate('/admin/users'),
                })
              }
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
