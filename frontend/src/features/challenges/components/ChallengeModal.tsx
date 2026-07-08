import { useMemo } from 'react'
import { useChallengeDetail } from '../hooks/useChallengeDetail'
import { ChallengeDescriptionRenderer } from './ChallengeDescriptionRenderer'
import { FlagSubmissionForm } from './FlagSubmissionForm'
import { HintPanel } from './HintPanel'
import { ChallengeSolvesList } from './ChallengeSolvesList'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { formatScore } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertCircle,
  Trophy,
  CheckCircle2,
  FileText,
  ExternalLink,
  RotateCw,
  Users,
  Flag,
} from 'lucide-react'

interface ChallengeModalProps {
  challengeId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChallengeModal({
  challengeId,
  open,
  onOpenChange,
}: ChallengeModalProps) {
  const { data: challenge, isLoading, isError, refetch } =
    useChallengeDetail(open ? challengeId : null)

  const tabs = useMemo(() => {
    if (!challenge) return []
    const items: { value: string; label: string }[] = [
      { value: 'challenge', label: 'Challenge' },
      { value: 'solves', label: `Solves (${challenge.solves ?? 0})` },
      { value: 'submissions', label: 'Submissions' },
    ]
    if (challenge.solution_id != null && challenge.solution_state !== 'hidden') {
      items.push({ value: 'solution', label: 'Solution' })
    }
    return items
  }, [challenge])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <div>
          <DialogHeader>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : isError ? (
            <DialogTitle>Error</DialogTitle>
          ) : challenge ? (
            <>
              <div className="flex items-center gap-3 pr-8">
                <DialogTitle className="text-xl">
                  {challenge.name}
                </DialogTitle>
                {challenge.solved_by_me && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                )}
                <Badge variant="secondary">{challenge.category}</Badge>
                <Badge
                  variant="outline"
                  className="font-mono font-bold text-primary"
                >
                  <Trophy className="h-3 w-3 mr-1" />
                  {challenge.value}pts
                </Badge>
                {challenge.solves != null && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                    <Users className="h-3 w-3" />
                    {formatScore(challenge.solves)} solves
                  </span>
                )}
              </div>
              <DialogDescription className="sr-only">
                Challenge details for {challenge.name}
              </DialogDescription>
            </>
          ) : null}
          </DialogHeader>
          </div>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load challenge</AlertTitle>
            <AlertDescription className="flex items-center gap-2 mt-1">
              <span>There was an error loading challenge details.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                <RotateCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : challenge ? (
          <Tabs defaultValue="challenge" className="mt-2">
            <TabsList className="w-full justify-start">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="h-[65vh] mt-3">
              <TabsContent value="challenge" className="space-y-6 px-1">
                <ChallengeDescriptionRenderer
                  html={challenge?.view || ''}
                />

                {challenge.connection_info && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                    <code className="text-sm font-mono break-all">
                      {challenge.connection_info}
                    </code>
                  </div>
                )}

                {challenge.files.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Files
                    </h4>
                    <ul className="space-y-1">
                      {challenge.files.map((file) => (
                        <li key={file}>
                          <a
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline break-all"
                          >
                            {file.split('/').pop() || file}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Card className="p-4 border-primary/10 bg-primary/[0.03]">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                    <Flag className="h-4 w-4" />
                    Submit Flag
                  </h4>
                  {challenge.max_attempts > 0 && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Attempts: {challenge.attempts} / {challenge.max_attempts}
                    </p>
                  )}
                  <FlagSubmissionForm
                    challengeId={challenge.id}
                    maxAttempts={challenge.max_attempts}
                    attempts={challenge.attempts}
                  />
                </Card>

                {challenge.hints.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Hints</h4>
                    <HintPanel hints={challenge.hints} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="solves" className="px-1">
                <ChallengeSolvesList challengeId={challenge.id} />
              </TabsContent>

              <TabsContent value="submissions" className="px-1">
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Submissions will be available soon.
                </p>
              </TabsContent>

              {challenge.solution_id != null &&
                challenge.solution_state !== 'hidden' && (
                  <TabsContent value="solution" className="px-1">
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      {challenge.solution_state === 'solved'
                        ? 'Solution will be visible after the competition ends.'
                        : 'Solution available.'}
                    </p>
                  </TabsContent>
                )}
            </ScrollArea>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
