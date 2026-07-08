import { useState } from 'react'
import { useAdminTags, useCreateTag, useDeleteTag } from '../hooks/useAdminChallenges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, X, AlertCircle, Hash } from 'lucide-react'

interface AdminTagInputProps {
  challengeId: number
}

export function AdminTagInput({ challengeId }: AdminTagInputProps) {
  const { data: tags, isLoading, error } = useAdminTags(challengeId)
  const createTag = useCreateTag()
  const deleteTag = useDeleteTag()
  const [inputValue, setInputValue] = useState('')

  const handleAddTag = async () => {
    const value = inputValue.trim()
    if (!value) return
    const exists = tags?.some(
      (t) => t.value.toLowerCase() === value.toLowerCase()
    )
    if (exists) {
      setInputValue('')
      return
    }
    await createTag.mutateAsync({ challenge_id: challengeId, value })
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
    if (e.key === ',' || e.key === ' ') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleRemoveTag = async (tagId: number) => {
    await deleteTag.mutateAsync({ id: tagId, challengeId })
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-6 w-48" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load tags</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Tags</h3>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Add tag (Enter or comma to add)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleAddTag}
          disabled={!inputValue.trim() || createTag.isPending}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {tags && tags.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tags added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags?.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
              {tag.value}
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
