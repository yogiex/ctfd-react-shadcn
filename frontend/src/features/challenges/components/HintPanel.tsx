import { useState } from 'react'
import { useHint, useUnlockHint } from '../hooks/useHint'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, Unlock, Loader2, AlertCircle } from 'lucide-react'

interface HintPanelProps {
  hints: { id: number; cost: number; title?: string }[]
}

export function HintPanel({ hints }: HintPanelProps) {
  const [unlockedHints, setUnlockedHints] = useState<Set<number>>(new Set())
  const { mutate: unlockHint, isPending: isUnlocking } = useUnlockHint()

  if (!hints.length) return null

  function handleUnlock(hintId: number) {
    unlockHint(hintId, {
      onSuccess: () => {
        setUnlockedHints((prev) => new Set(prev).add(hintId))
      },
    })
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {hints.map((hint) => (
        <HintItem
          key={hint.id}
          hint={hint}
          isUnlocked={unlockedHints.has(hint.id)}
          isUnlocking={isUnlocking}
          onUnlock={handleUnlock}
        />
      ))}
    </Accordion>
  )
}

interface HintItemProps {
  hint: { id: number; cost: number; title?: string }
  isUnlocked: boolean
  isUnlocking: boolean
  onUnlock: (id: number) => void
}

function HintItem({ hint, isUnlocked, isUnlocking, onUnlock }: HintItemProps) {
  const { data: hintData, isLoading, isError } = useHint(
    isUnlocked ? hint.id : null
  )

  return (
    <AccordionItem value={`hint-${hint.id}`}>
      <AccordionTrigger className="text-sm">
        <span className="flex items-center gap-2">
          {isUnlocked ? (
            <Unlock className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {hint.title || `Hint ${hint.id}`}
        </span>
      </AccordionTrigger>
      <AccordionContent>
        {!isUnlocked ? (
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">
              Costs {hint.cost} points to unlock
            </span>
            <Button
              size="sm"
              onClick={() => onUnlock(hint.id)}
              disabled={isUnlocking}
            >
              {isUnlocking ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : null}
              Unlock for {hint.cost}pts
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-2 py-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : isError ? (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Failed to load hint.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="py-2 text-sm">
            {hintData?.title && (
              <p className="font-medium mb-1">{hintData.title}</p>
            )}
            {hintData?.content ? (
              <div
                dangerouslySetInnerHTML={{ __html: hintData.content }}
                className="prose prose-sm dark:prose-invert max-w-none"
              />
            ) : (
              <p className="text-muted-foreground italic">No content</p>
            )}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}
