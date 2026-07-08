import { useState } from 'react'
import { Loader2, Plus, Megaphone } from 'lucide-react'
import {
  useAdminNotifications, useCreateNotification,
  type AdminNotification,
} from '../hooks/useAdminNotifications'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'

function CreateNotificationDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const createMutation = useCreateNotification()

  const handleSubmit = async () => {
    await createMutation.mutateAsync({ title, content })
    setTitle('')
    setContent('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notif-title">Title</Label>
            <Input
              id="notif-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Notification title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notif-content">Content</Label>
            <Textarea
              id="notif-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Enter notification content (markdown supported)"
              className="min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || !title.trim() || !content.trim()}
          >
            {createMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
            ) : (
              'Send'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NotificationCard({ notification }: { notification: AdminNotification }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-semibold leading-none">{notification.title}</h3>
          <p className="text-xs text-muted-foreground">
            {formatDate(notification.date)}
          </p>
        </div>
      </div>
      <div className="mt-3 text-sm text-muted-foreground">
        {notification.content}
      </div>
    </div>
  )
}

export function AdminNotificationsPage() {
  const { data: notifications, isLoading, isError, error } = useAdminNotifications()
  const [createOpen, setCreateOpen] = useState(false)

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load notifications: {(error as Error)?.message ?? 'Unknown error'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Send and manage push notifications
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Notification
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Megaphone className="h-12 w-12 text-muted-foreground/60 mb-4" />
          <h3 className="text-lg font-medium">No notifications yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Send your first notification to participants.
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Notification
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {notifications.map(n => (
            <NotificationCard key={n.id} notification={n} />
          ))}
        </div>
      )}

      <CreateNotificationDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
