import { useState } from 'react'
import { useAdminFlags, useCreateFlag, useDeleteFlag } from '../hooks/useAdminChallenges'
import { useFlagTypes } from '@/features/admin/plugin/hooks/useFlagTypes'
import { PluginFlagFormRenderer } from '@/features/admin/plugin/components/PluginFlagFormRenderer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import type { Flag } from '../types/admin-challenge'

interface AdminFlagFormProps {
  challengeId: number
}

const FLAG_TYPES = [
  { value: 'static', label: 'Static' },
  { value: 'regex', label: 'Regex' },
  { value: 'token', label: 'Token' },
] as const

export function AdminFlagForm({ challengeId }: AdminFlagFormProps) {
  const { data: flags, isLoading, error } = useAdminFlags(challengeId)
  const { data: flagTypes } = useFlagTypes()
  const createFlag = useCreateFlag()
  const deleteFlag = useDeleteFlag()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'static' | 'regex' | 'token'>('static')
  const [content, setContent] = useState('')
  const [data, setData] = useState('')
  const selectedFlagType = type && flagTypes?.[type]

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createFlag.mutateAsync({
      challenge_id: challengeId,
      type,
      content,
      data: data || undefined,
    })
    setContent('')
    setData('')
    setOpen(false)
  }

  const handleDelete = async (flag: Flag) => {
    await deleteFlag.mutateAsync({ id: flag.id, challengeId })
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load flags</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Flags</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create Flag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Flag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flag-type">Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as 'static' | 'regex' | 'token')}
                >
                  <SelectTrigger id="flag-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FLAG_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFlagType && (
                <div className="space-y-2">
                  <Label>Flag Type Configuration</Label>
                  <PluginFlagFormRenderer html={selectedFlagType.templates.create} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="flag-content">Content</Label>
                <Input
                  id="flag-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter flag content"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flag-data">Data (optional)</Label>
                <Input
                  id="flag-data"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  placeholder="Enter flag data"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createFlag.isPending}
              >
                {createFlag.isPending ? 'Creating...' : 'Create Flag'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {flags && flags.length === 0 ? (
        <p className="text-sm text-muted-foreground">No flags configured yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flags?.map((flag) => (
              <TableRow key={flag.id}>
                <TableCell className="font-mono text-xs">{flag.id}</TableCell>
                <TableCell>
                  <Badge variant="outline">{flag.type}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs max-w-[300px] truncate">
                  {flag.content}
                </TableCell>
                <TableCell className="font-mono text-xs max-w-[200px] truncate">
                  {flag.data || '-'}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Flag</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this flag? This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(flag)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
