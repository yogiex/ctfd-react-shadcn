import { useState, useEffect } from 'react'
import {
  useAdminSolution,
  useCreateSolution,
  useUpdateSolution,
} from '../hooks/useAdminChallenges'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react'

interface AdminSolutionEditorProps {
  challengeId: number
}

const SOLUTION_STATES = [
  { value: 'hidden', label: 'Hidden', icon: EyeOff },
  { value: 'visible', label: 'Visible', icon: Eye },
  { value: 'solved', label: 'Visible on Solve', icon: Lock },
] as const

export function AdminSolutionEditor({
  challengeId,
}: AdminSolutionEditorProps) {
  const { data: solution, isLoading, error } = useAdminSolution(challengeId)
  const createSolution = useCreateSolution()
  const updateSolution = useUpdateSolution()
  const [content, setContent] = useState('')
  const [state, setState] = useState<'hidden' | 'visible' | 'solved'>('hidden')

  useEffect(() => {
    if (solution) {
      setContent(solution.content ?? '')
      setState(solution.state ?? 'hidden')
    }
  }, [solution])

  const handleSave = async () => {
    if (solution?.id) {
      await updateSolution.mutateAsync({
        id: solution.id,
        data: { content, state },
      })
    } else {
      await createSolution.mutateAsync({
        challenge_id: challengeId,
        content,
        state,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-24" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load solution</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Solution</h3>

      <div className="space-y-2">
        <Label htmlFor="solution-content">Solution Content</Label>
        <Textarea
          id="solution-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter solution explanation (markdown supported)"
          className="min-h-[200px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="solution-state">Visibility</Label>
        <Select
          value={state}
          onValueChange={(v) =>
            setState(v as 'hidden' | 'visible' | 'solved')
          }
        >
          <SelectTrigger id="solution-state">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SOLUTION_STATES.map((s) => {
              const Icon = s.icon
              return (
                <SelectItem key={s.value} value={s.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {s.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleSave}
        disabled={
          updateSolution.isPending || createSolution.isPending || !content.trim()
        }
      >
        <Save className="h-4 w-4 mr-1" />
        {updateSolution.isPending || createSolution.isPending
          ? 'Saving...'
          : solution?.id
          ? 'Update Solution'
          : 'Create Solution'}
      </Button>
    </div>
  )
}
