import { useAdminRequirements, useUpdateChallenge } from '../hooks/useAdminChallenges'
import { useAdminChallenges } from '../hooks/useAdminChallenges'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, AlertCircle } from 'lucide-react'

interface AdminRequirementsEditorProps {
  challengeId: number
}

export function AdminRequirementsEditor({
  challengeId,
}: AdminRequirementsEditorProps) {
  const { data: requirements, isLoading: reqLoading, error: reqError } =
    useAdminRequirements(challengeId)
  const { data: allChallenges } = useAdminChallenges()
  const updateChallenge = useUpdateChallenge()

  const prerequisites = requirements?.prerequisites ?? []
  const anonymize = requirements?.anonymize ?? false

  const togglePrerequisite = (id: number) => {
    const next = prerequisites.includes(id)
      ? prerequisites.filter((p) => p !== id)
      : [...prerequisites, id]
    updateChallenge.mutate({
      id: challengeId,
      data: { requirements: { prerequisites: next, anonymize } },
    })
  }

  const toggleAnonymize = (checked: boolean) => {
    updateChallenge.mutate({
      id: challengeId,
      data: { requirements: { prerequisites, anonymize: checked } },
    })
  }

  if (reqLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (reqError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load requirements</AlertDescription>
      </Alert>
    )
  }

  const otherChallenges =
    allChallenges?.filter((c) => c.id !== challengeId) ?? []

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Requirements</h3>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="anonymize">Anonymize</Label>
          <p className="text-sm text-muted-foreground">
            Hide challenge solves from scoreboard until solved
          </p>
        </div>
        <Switch
          id="anonymize"
          checked={anonymize}
          onCheckedChange={toggleAnonymize}
        />
      </div>

      <div className="space-y-2">
        <Label>Prerequisite Challenges</Label>
        <p className="text-sm text-muted-foreground">
          Select challenges that must be solved before this one
        </p>
        {otherChallenges.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No other challenges available.
          </p>
        ) : (
          <div className="grid gap-2">
            {otherChallenges.map((challenge) => (
              <label
                key={challenge.id}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <Checkbox
                  checked={prerequisites.includes(challenge.id)}
                  onCheckedChange={() => togglePrerequisite(challenge.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {challenge.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {challenge.category} &middot; {challenge.value} pts
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    challenge.state === 'visible'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}
                >
                  {challenge.state}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {updateChallenge.isPending && (
        <Button disabled className="w-full">
          <Save className="h-4 w-4 mr-1 animate-pulse" />
          Saving...
        </Button>
      )}
    </div>
  )
}
