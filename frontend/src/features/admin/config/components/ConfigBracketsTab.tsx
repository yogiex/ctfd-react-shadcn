import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfigSection } from './ConfigSection'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import {
  useBrackets,
  useCreateBracket,
  useUpdateBracket,
  useDeleteBracket,
  type Bracket,
} from '../hooks/useAdminConfig'
import { toast } from '@/hooks/use-toast'

export function ConfigBracketsTab() {
  const { data: brackets, isLoading } = useBrackets()
  const createBracket = useCreateBracket()
  const updateBracket = useUpdateBracket()
  const deleteBracket = useDeleteBracket()

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Bracket | null>(null)
  const [form, setForm] = useState<{ name: string; description: string; type: string }>({
    name: '',
    description: '',
    type: 'users',
  })

  function resetForm() {
    setForm({ name: '', description: '', type: 'users' })
  }

  async function handleCreate() {
    try {
      await createBracket.mutateAsync(form)
      setCreateOpen(false)
      resetForm()
      toast({ title: 'Bracket created' })
    } catch {
      toast({ title: 'Failed to create bracket', variant: 'destructive' })
    }
  }

  function openEdit(b: Bracket) {
    setSelected(b)
    setForm({ name: b.name, description: b.description, type: b.type })
    setEditOpen(true)
  }

  async function handleEdit() {
    if (!selected) return
    try {
      await updateBracket.mutateAsync({ id: selected.id, ...form })
      setEditOpen(false)
      setSelected(null)
      resetForm()
      toast({ title: 'Bracket updated' })
    } catch {
      toast({ title: 'Failed to update bracket', variant: 'destructive' })
    }
  }

  function openDelete(b: Bracket) {
    setSelected(b)
    setDeleteOpen(true)
  }

  async function handleDelete() {
    if (!selected) return
    try {
      await deleteBracket.mutateAsync(selected.id)
      setDeleteOpen(false)
      setSelected(null)
      toast({ title: 'Bracket deleted' })
    } catch {
      toast({ title: 'Failed to delete bracket', variant: 'destructive' })
    }
  }

  const isBusy = createBracket.isPending || updateBracket.isPending || deleteBracket.isPending

  return (
    <ConfigSection title="Brackets" description="Manage competition brackets">
      <div className="flex justify-end">
        <Button onClick={() => { resetForm(); setCreateOpen(true) }}>
          <Plus className="h-4 w-4" /> Add Bracket
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : brackets?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No brackets configured
              </TableCell>
            </TableRow>
          ) : (
            brackets?.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>{b.description}</TableCell>
                <TableCell className="capitalize">{b.type}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDelete(b)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Bracket</DialogTitle>
            <DialogDescription>Add a new competition bracket</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bracket_name">Name</Label>
              <Input
                id="bracket_name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bracket_desc">Description</Label>
              <Input
                id="bracket_desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bracket_type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger id="bracket_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="teams">Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isBusy}>
              {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bracket</DialogTitle>
            <DialogDescription>Update bracket configuration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_bracket_name">Name</Label>
              <Input
                id="edit_bracket_name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_bracket_desc">Description</Label>
              <Input
                id="edit_bracket_desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_bracket_type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger id="edit_bracket_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="teams">Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isBusy}>
              {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bracket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selected?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isBusy}>
              {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfigSection>
  )
}
