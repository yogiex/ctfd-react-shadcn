import { useState } from 'react'
import { useAdminTopics, useCreateTopic, useRemoveTopic } from '../hooks/useAdminChallenges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, X, AlertCircle, Bookmark } from 'lucide-react'

interface AdminTopicManagerProps {
  challengeId: number
}

export function AdminTopicManager({ challengeId }: AdminTopicManagerProps) {
  const { data: topics, isLoading, error } = useAdminTopics(challengeId)
  const createTopic = useCreateTopic()
  const removeTopic = useRemoveTopic()
  const [topicSearch, setTopicSearch] = useState('')

  const handleAddTopic = async () => {
    const value = topicSearch.trim()
    if (!value) return
    await createTopic.mutateAsync({
      challenge_id: challengeId,
      topic_id: 0,
    })
    setTopicSearch('')
  }

  const handleRemoveTopic = async (topicId: number) => {
    await removeTopic.mutateAsync({ challengeId, topicId })
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
        <AlertDescription>Failed to load topics</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Topics</h3>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Bookmark className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={topicSearch}
            onChange={(e) => setTopicSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleAddTopic}
          disabled={!topicSearch.trim() || createTopic.isPending}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {topics && topics.length === 0 ? (
        <p className="text-sm text-muted-foreground">No topics assigned.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {topics?.map((topic) => (
            <Badge key={topic.id} variant="outline" className="gap-1 pr-1">
              {topic.value}
              <button
                onClick={() => handleRemoveTopic(topic.id)}
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
