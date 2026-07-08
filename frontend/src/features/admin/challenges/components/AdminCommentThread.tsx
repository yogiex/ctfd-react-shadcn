import { useState } from 'react'
import {
  useChallengeComments,
  useCreateComment,
} from '../hooks/useAdminChallenges'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatDate } from '@/lib/utils'
import { MessageSquare, Send, AlertCircle } from 'lucide-react'

interface AdminCommentThreadProps {
  challengeId: number
}

export function AdminCommentThread({ challengeId }: AdminCommentThreadProps) {
  const { data: comments, isLoading, error } = useChallengeComments(challengeId)
  const createComment = useCreateComment()
  const [newComment, setNewComment] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    await createComment.mutateAsync({
      challenge_id: challengeId,
      content: newComment,
    })
    setNewComment('')
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load comments</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Comments
        {comments && comments.length > 0 && (
          <span className="text-sm text-muted-foreground font-normal">
            ({comments.length})
          </span>
        )}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || createComment.isPending}
          >
            <Send className="h-4 w-4 mr-1" />
            {createComment.isPending ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      {comments && comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <div className="space-y-3">
          {comments?.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 rounded-lg border p-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {comment.author
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.author}</span>
                  <span className="text-xs text-muted-foreground">
                    {comment.date ? formatDate(comment.date) : ''}
                  </span>
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
