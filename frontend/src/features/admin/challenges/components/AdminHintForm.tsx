import { useState } from 'react'
import { useAdminHints, useCreateHint, useDeleteHint } from '../hooks/useAdminChallenges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import type { Hint } from '../types/admin-challenge'

interface AdminHintFormProps {
  challengeId: number
}

export function AdminHintForm({ challengeId }: AdminHintFormProps) {
  const { data: hints, isLoading, error } = useAdminHints(challengeId)
  const createHint = useCreateHint()
  const deleteHint = useDeleteHint()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [cost, setCost] = useState(0)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createHint.mutateAsync({
      challenge_id: challengeId,
      title,
      content,
      cost,
    })
    setTitle('')
    setContent('')
    setCost(0)
    setOpen(false)
  }

  const handleDelete = async (hint: Hint) => {
    await deleteHint.mutateAsync({ id: hint.id, challengeId })
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
        <AlertDescription>Failed to load hints</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Hints</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create Hint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Hint</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hint-title">Title</Label>
                <Input
                  id="hint-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Hint title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hint-content">Content</Label>
                <Textarea
                  id="hint-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Hint content"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hint-cost">Cost (points)</Label>
                <Input
                  id="hint-cost"
                  type="number"
                  min={0}
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createHint.isPending}
              >
                {createHint.isPending ? 'Creating...' : 'Create Hint'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {hints && hints.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hints configured yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hints?.map((hint) => (
              <TableRow key={hint.id}>
                <TableCell className="font-mono text-xs">{hint.id}</TableCell>
                <TableCell className="font-medium">{hint.title}</TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {hint.content}
                </TableCell>
                <TableCell>{hint.cost}</TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Hint</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this hint?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(hint)}
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
