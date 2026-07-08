import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  useAdminTeams, useCreateTeam, useUpdateTeam, useDeleteTeam,
  type TeamAdmin, type TeamCreateInput, type TeamUpdateInput,
} from '../hooks/useAdminTeams'
import { formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'

function TeamFormDialog({
  open,
  onOpenChange,
  team,
  onSubmit,
  loading,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  team?: TeamAdmin
  onSubmit: (data: TeamCreateInput | TeamUpdateInput) => void
  loading: boolean
}) {
  const [name, setName] = useState(team?.name ?? '')
  const [email, setEmail] = useState(team?.email ?? '')
  const [password, setPassword] = useState('')
  const [banned, setBanned] = useState(team?.banned ?? false)
  const [hidden, setHidden] = useState(team?.hidden ?? false)
  const [affiliation, setAffiliation] = useState(team?.affiliation ?? '')
  const [country, setCountry] = useState(team?.country ?? '')
  const [website, setWebsite] = useState(team?.website ?? '')

  const isEdit = !!team

  const handleSubmit = () => {
    const base = {
      name,
      email,
      banned,
      hidden,
      affiliation: affiliation || undefined,
      country: country || undefined,
      website: website || undefined,
    }
    if (isEdit) {
      const data: TeamUpdateInput = { ...base }
      if (password) data.password = password
      onSubmit(data)
    } else {
      onSubmit({ ...base, password } as TeamCreateInput)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Team' : 'Create Team'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Name</Label>
              <Input id="team-name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-email">Email</Label>
              <Input id="team-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-password">
              Password {isEdit ? '(leave blank to keep)' : ''}
            </Label>
            <Input id="team-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team-affiliation">Affiliation</Label>
              <Input id="team-affiliation" value={affiliation} onChange={e => setAffiliation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-country">Country</Label>
              <Input id="team-country" value={country} onChange={e => setCountry(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-website">Website</Label>
            <Input id="team-website" value={website} onChange={e => setWebsite(e.target.value)} />
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch id="team-banned" checked={banned} onCheckedChange={setBanned} />
              <Label htmlFor="team-banned">Banned</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="team-hidden" checked={hidden} onCheckedChange={setHidden} />
              <Label htmlFor="team-hidden">Hidden</Label>
            </div>
          </div>
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
  teamName,
  onConfirm,
  loading,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  teamName: string
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Team</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{teamName}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function AdminTeamsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<TeamAdmin | null>(null)
  const [deletingTeam, setDeletingTeam] = useState<TeamAdmin | null>(null)

  const { data, isLoading, isError, error } = useAdminTeams({ q: search || undefined, page })
  const createMutation = useCreateTeam()
  const updateMutation = useUpdateTeam()
  const deleteMutation = useDeleteTeam()

  const teams = data?.data ?? []
  const pagination = data?.pagination

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teams</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load teams: {(error as Error)?.message ?? 'Unknown error'}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-20">Banned</TableHead>
              <TableHead className="w-24">Members</TableHead>
              <TableHead className="w-32">Created</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {search ? 'No teams match your search.' : 'No teams found.'}
                </TableCell>
              </TableRow>
            ) : (
              teams.map(team => (
                <TableRow
                  key={team.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/admin/teams/${team.id}`)}
                >
                  <TableCell className="font-mono text-xs">{team.id}</TableCell>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="text-muted-foreground">{team.email}</TableCell>
                  <TableCell>
                    <Badge variant={team.banned ? 'destructive' : 'secondary'}>
                      {team.banned ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>{team.members?.length ?? 0}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(team.created)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => setEditingTeam(team)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingTeam(team)}>
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

      <TeamFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={data => createMutation.mutate(data as TeamCreateInput, { onSuccess: () => setCreateOpen(false) })}
        loading={createMutation.isPending}
      />

      <TeamFormDialog
        open={!!editingTeam}
        onOpenChange={v => !v && setEditingTeam(null)}
        team={editingTeam ?? undefined}
        onSubmit={data =>
          editingTeam &&
          updateMutation.mutate(
            { id: editingTeam.id, data },
            { onSuccess: () => setEditingTeam(null) },
          )
        }
        loading={updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={!!deletingTeam}
        onOpenChange={v => !v && setDeletingTeam(null)}
        teamName={deletingTeam?.name ?? ''}
        onConfirm={() =>
          deletingTeam &&
          deleteMutation.mutate(deletingTeam.id, { onSuccess: () => setDeletingTeam(null) })
        }
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
