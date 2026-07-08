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
  useAdminTeam, useAdminTeamMembers, useAdminTeamSolves, useAdminTeamAwards,
  useUpdateTeam, useDeleteTeam, useAddTeamMember, useRemoveTeamMember,
  type TeamAdmin, type TeamUpdateInput,
} from '../hooks/useAdminTeams'
import { useAdminUsers } from '../../users/hooks/useAdminUsers'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Pencil, Trash2, Plus, X, Award } from 'lucide-react'

function EditTeamDialog({
  open,
  onOpenChange,
  team,
  onSubmit,
  loading,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  team: TeamAdmin
  onSubmit: (data: TeamUpdateInput) => void
  loading: boolean
}) {
  const [name, setName] = useState(team.name)
  const [email, setEmail] = useState(team.email)
  const [password, setPassword] = useState('')
  const [banned, setBanned] = useState(team.banned)
  const [hidden, setHidden] = useState(team.hidden)
  const [affiliation, setAffiliation] = useState(team.affiliation ?? '')
  const [country, setCountry] = useState(team.country ?? '')
  const [website, setWebsite] = useState(team.website ?? '')
  const [captainId, setCaptainId] = useState(String(team.captain_id))

  const handleSubmit = () => {
    const data: TeamUpdateInput = {
      name,
      email,
      banned,
      hidden,
      affiliation: affiliation || undefined,
      country: country || undefined,
      website: website || undefined,
      captain_id: Number(captainId),
    }
    if (password) data.password = password
    onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Team: {team.name}</DialogTitle>
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
          <div className="space-y-2">
            <Label htmlFor="edit-website">Website</Label>
            <Input id="edit-website" value={website} onChange={e => setWebsite(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-captain">Captain ID</Label>
            <Input id="edit-captain" type="number" value={captainId} onChange={e => setCaptainId(e.target.value)} />
          </div>
          <div className="flex gap-6">
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

function AddMemberDialog({
  open,
  onOpenChange,
  teamId,
  onAdded,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  teamId: number
  onAdded: () => void
}) {
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const { data: users } = useAdminUsers({ q: search || undefined })
  const addMember = useAddTeamMember()

  const handleAdd = () => {
    if (!selectedUserId) return
    addMember.mutate(
      { teamId, userId: selectedUserId },
      {
        onSuccess: () => {
          onAdded()
          onOpenChange(false)
          setSearch('')
          setSelectedUserId(null)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="member-search">Search user by name</Label>
            <Input
              id="member-search"
              placeholder="Type to search..."
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setSelectedUserId(null)
              }}
            />
          </div>
          {users?.data && users.data.length > 0 && (
            <div className="border rounded-md max-h-48 overflow-y-auto">
              {users.data.map(u => (
                <div
                  key={u.id}
                  className={`px-3 py-2 cursor-pointer text-sm hover:bg-accent ${
                    selectedUserId === u.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedUserId(u.id)}
                >
                  {u.name} ({u.email})
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAdd} disabled={!selectedUserId || addMember.isPending}>
            Add Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminTeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const teamId = id ? Number(id) : null
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<number | null>(null)

  const { data: team, isLoading, isError, error } = useAdminTeam(teamId)
  const members = useAdminTeamMembers(teamId)
  const solves = useAdminTeamSolves(teamId)
  const awards = useAdminTeamAwards(teamId)
  const updateMutation = useUpdateTeam()
  const deleteMutation = useDeleteTeam()
  const removeMember = useRemoveTeamMember()

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
        <Button variant="ghost" onClick={() => navigate('/admin/teams')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams
        </Button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load team: {(error as Error)?.message ?? 'Team not found'}
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/teams')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams
        </Button>
        <div className="rounded-lg border p-4 text-muted-foreground">Team not found.</div>
      </div>
    )
  }

  const captain = team.members?.find(m => m.id === team.captain_id)
  const memberList = members.data ?? team.members ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/teams')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          {team.banned && <Badge variant="destructive">Banned</Badge>}
          {team.hidden && <Badge variant="secondary">Hidden</Badge>}
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
          <CardTitle>Team Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{team.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{team.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Score</Label>
              <p className="font-medium">{team.score ?? 0}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Affiliation</Label>
              <p className="font-medium">{team.affiliation ?? '—'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Country</Label>
              <p className="font-medium">{team.country ?? '—'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Website</Label>
              <p className="font-medium">{team.website ?? '—'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Captain</Label>
              <p className="font-medium">{captain?.name ?? `User #${team.captain_id}`}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Members</Label>
              <p className="font-medium">{memberList.length}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p className="font-medium">{formatDate(team.created)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Secret</Label>
              <p className="font-mono text-xs truncate">{team.secret}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="members">Members ({memberList.length})</TabsTrigger>
          <TabsTrigger value="solves">Solves ({solves.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="awards">Awards ({awards.data?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit Team</CardTitle>
              <CardDescription>Update team settings and information.</CardDescription>
            </CardHeader>
            <CardContent>
              <EditTeamDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                team={team}
                onSubmit={data =>
                  updateMutation.mutate(
                    { id: team.id, data },
                    { onSuccess: () => setEditOpen(false) },
                  )
                }
                loading={updateMutation.isPending}
              />
              {!editOpen && (
                <p className="text-sm text-muted-foreground">
                  Click the "Edit" button above to modify this team.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Members</CardTitle>
              </div>
              <Button size="sm" onClick={() => setAddMemberOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Member
              </Button>
            </CardHeader>
            <CardContent>
              {members.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : memberList.length === 0 ? (
                <p className="text-muted-foreground">No members.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberList.map(m => (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono text-xs">{m.id}</TableCell>
                        <TableCell className="font-medium">
                          {m.name}
                          {m.id === team.captain_id && (
                            <Badge variant="outline" className="ml-2">Captain</Badge>
                          )}
                        </TableCell>
                        <TableCell>{m.score}</TableCell>
                        <TableCell>
                          {m.id === team.captain_id ? 'Captain' : 'Member'}
                        </TableCell>
                        <TableCell className="text-right">
                          {m.id !== team.captain_id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRemovingUserId(m.id)}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <AlertDialog
            open={removingUserId !== null}
            onOpenChange={v => !v && setRemovingUserId(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Member</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this member from the team?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (removingUserId && teamId) {
                      removeMember.mutate(
                        { teamId, userId: removingUserId },
                        { onSuccess: () => setRemovingUserId(null) },
                      )
                    }
                  }}
                  disabled={removeMember.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AddMemberDialog
            open={addMemberOpen}
            onOpenChange={setAddMemberOpen}
            teamId={team.id}
            onAdded={() => {
              members.refetch()
            }}
          />
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
      </Tabs>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{team.name}</strong>? This action cannot be undone.
              All member relationships will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteMutation.mutate(team.id, {
                  onSuccess: () => navigate('/admin/teams'),
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
