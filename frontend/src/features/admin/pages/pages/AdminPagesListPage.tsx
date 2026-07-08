import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useAdminPages, useDeletePage, type AdminPage,
} from '../hooks/useAdminPages'
import { Plus, FileText, Pencil, Trash2 } from 'lucide-react'

export function AdminPagesListPage() {
  const navigate = useNavigate()
  const { data: pages, isLoading, isError, error } = useAdminPages()
  const deleteMutation = useDeletePage()
  const [deleteTarget, setDeleteTarget] = useState<AdminPage | null>(null)

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pages</h1>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load pages: {(error as Error)?.message ?? 'Unknown error'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage static pages for your CTF
          </p>
        </div>
        <Button onClick={() => navigate('/admin/pages/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Page
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="w-28">Auth Required</TableHead>
              <TableHead className="w-20">Draft</TableHead>
              <TableHead className="w-20">Hidden</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : !pages || pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground/60" />
                    <p>No pages found.</p>
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/pages/new')}>
                      <Plus className="mr-1 h-3 w-3" />
                      Create your first page
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pages.map(page => (
                <TableRow key={page.id}>
                  <TableCell className="font-mono text-xs">{page.id}</TableCell>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    /{page.route}
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.auth_required ? 'default' : 'secondary'}>
                      {page.auth_required ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.draft ? 'outline' : 'secondary'}>
                      {page.draft ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.hidden ? 'outline' : 'secondary'}>
                      {page.hidden ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/pages/${page.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(page)}
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

      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
                }
              }}
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
