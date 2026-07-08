import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { Plus, Pencil, Trash2, Loader2, BadgeCheck, Eye, Lock } from 'lucide-react'
import {
  useFields,
  useCreateField,
  useUpdateField,
  useDeleteField,
  type Field,
} from '../hooks/useAdminConfig'
import { toast } from '@/hooks/use-toast'

interface FieldForm {
  name: string
  type: string
  field_type: string
  required: boolean
  public: boolean
  editable: boolean
  options: string
}

const defaultForm: FieldForm = {
  name: '',
  type: 'text',
  field_type: 'user',
  required: false,
  public: true,
  editable: true,
  options: '',
}

export function ConfigFieldsTab() {
  const { data: fields, isLoading } = useFields()
  const createField = useCreateField()
  const updateField = useUpdateField()
  const deleteField = useDeleteField()

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Field | null>(null)
  const [form, setForm] = useState<FieldForm>(defaultForm)

  function resetForm() {
    setForm(defaultForm)
  }

  async function handleCreate() {
    try {
      await createField.mutateAsync({
        ...form,
        options: form.type === 'select' ? form.options : undefined,
      })
      setCreateOpen(false)
      resetForm()
      toast({ title: 'Field created' })
    } catch {
      toast({ title: 'Failed to create field', variant: 'destructive' })
    }
  }

  function openEdit(f: Field) {
    setSelected(f)
    setForm({
      name: f.name,
      type: f.type,
      field_type: f.field_type,
      required: f.required,
      public: f.public,
      editable: f.editable,
      options: f.options ?? '',
    })
    setEditOpen(true)
  }

  async function handleEdit() {
    if (!selected) return
    try {
      await updateField.mutateAsync({ id: selected.id, ...form })
      setEditOpen(false)
      setSelected(null)
      resetForm()
      toast({ title: 'Field updated' })
    } catch {
      toast({ title: 'Failed to update field', variant: 'destructive' })
    }
  }

  function openDelete(f: Field) {
    setSelected(f)
    setDeleteOpen(true)
  }

  async function handleDelete() {
    if (!selected) return
    try {
      await deleteField.mutateAsync(selected.id)
      setDeleteOpen(false)
      setSelected(null)
      toast({ title: 'Field deleted' })
    } catch {
      toast({ title: 'Failed to delete field', variant: 'destructive' })
    }
  }

  const isBusy = createField.isPending || updateField.isPending || deleteField.isPending

  return (
    <ConfigSection title="Fields" description="Manage custom profile fields">
      <div className="flex justify-end">
        <Button onClick={() => { resetForm(); setCreateOpen(true) }}>
          <Plus className="h-4 w-4" /> Add Field
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead className="text-center">Required</TableHead>
            <TableHead className="text-center">Public</TableHead>
            <TableHead className="text-center">Editable</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : fields?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No custom fields configured
              </TableCell>
            </TableRow>
          ) : (
            fields?.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.name}</TableCell>
                <TableCell className="capitalize">{f.type}</TableCell>
                <TableCell className="capitalize">{f.field_type}</TableCell>
                <TableCell className="text-center">
                  {f.required && <BadgeCheck className="h-4 w-4 inline text-green-500" />}
                </TableCell>
                <TableCell className="text-center">
                  {f.public && <Eye className="h-4 w-4 inline text-blue-500" />}
                </TableCell>
                <TableCell className="text-center">
                  {f.editable && <Lock className="h-4 w-4 inline text-amber-500" />}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(f)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDelete(f)}>
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
            <DialogTitle>Create Field</DialogTitle>
            <DialogDescription>Add a custom profile field</DialogDescription>
          </DialogHeader>
          <FieldFormContent form={form} onChange={setForm} />
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
            <DialogTitle>Edit Field</DialogTitle>
            <DialogDescription>Update custom field configuration</DialogDescription>
          </DialogHeader>
          <FieldFormContent form={form} onChange={setForm} />
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
            <AlertDialogTitle>Delete Field</AlertDialogTitle>
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

function FieldFormContent({
  form,
  onChange,
}: {
  form: FieldForm
  onChange: (f: FieldForm) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="field_name">Name</Label>
        <Input
          id="field_name"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="field_type">Field Type</Label>
        <Select
          value={form.type}
          onValueChange={(v) => onChange({ ...form, type: v })}
        >
          <SelectTrigger id="field_type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="select">Select</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {form.type === 'select' && (
        <div className="space-y-2">
          <Label htmlFor="field_options">Options (comma-separated)</Label>
          <Input
            id="field_options"
            value={form.options}
            onChange={(e) => onChange({ ...form, options: e.target.value })}
            placeholder="Option 1, Option 2, Option 3"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="field_scope">Scope</Label>
        <Select
          value={form.field_type}
          onValueChange={(v) => onChange({ ...form, field_type: v })}
        >
          <SelectTrigger id="field_scope">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="field_required">Required</Label>
        <Switch
          id="field_required"
          checked={form.required}
          onCheckedChange={(v) => onChange({ ...form, required: v })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="field_public">Public</Label>
        <Switch
          id="field_public"
          checked={form.public}
          onCheckedChange={(v) => onChange({ ...form, public: v })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="field_editable">Editable</Label>
        <Switch
          id="field_editable"
          checked={form.editable}
          onCheckedChange={(v) => onChange({ ...form, editable: v })}
        />
      </div>
    </div>
  )
}
