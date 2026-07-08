import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useSubmitFlag } from '../hooks/useSubmitFlag'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, XCircle, Clock, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlagSubmissionFormProps {
  challengeId: number
  maxAttempts: number
  attempts: number
}

export function FlagSubmissionForm({
  challengeId,
  maxAttempts,
  attempts,
}: FlagSubmissionFormProps) {
  const [flag, setFlag] = useState('')
  const [result, setResult] = useState<{
    status: string
    message: string
  } | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const { mutate, isPending } = useSubmitFlag()

  const isRateLimited = cooldown > 0
  const noAttemptsLeft = maxAttempts > 0 && attempts >= maxAttempts

  const startCooldown = useCallback((seconds: number) => {
    setCooldown(seconds)
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!flag.trim() || isPending || isRateLimited) return

    setResult(null)
    mutate(
      { challenge_id: challengeId, submission: flag.trim() },
      {
        onSuccess: (data) => {
          setResult({ status: data.status, message: data.message })
          if (data.status === 'ratelimited') {
            startCooldown(5)
          }
        },
        onError: () => {
          setResult({
            status: 'error',
            message: 'Failed to submit flag. Please try again.',
          })
        },
      }
    )
  }

  const statusIcon = {
    correct: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    incorrect: <XCircle className="h-4 w-4 text-red-500" />,
    already_solved: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
    ratelimited: <Clock className="h-4 w-4 text-orange-500" />,
    paused: <Ban className="h-4 w-4 text-yellow-500" />,
    error: <XCircle className="h-4 w-4 text-destructive" />,
  } as const

  const statusVariant = {
    correct: 'border-green-500/50 text-green-600 dark:text-green-400' as const,
    incorrect: 'border-red-500/50 text-red-600 dark:text-red-400' as const,
    already_solved: 'border-blue-500/50 text-blue-600 dark:text-blue-400' as const,
    ratelimited: 'border-orange-500/50 text-orange-600 dark:text-orange-400' as const,
    paused: 'border-yellow-500/50 text-yellow-600 dark:text-yellow-400' as const,
    error: 'border-destructive/50 text-destructive' as const,
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          placeholder="Enter flag..."
          disabled={isPending || isRateLimited || noAttemptsLeft}
          className="font-mono flex-1"
        />
        <Button
          type="submit"
          disabled={
            !flag.trim() || isPending || isRateLimited || noAttemptsLeft
          }
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting
            </>
          ) : isRateLimited ? (
            `${cooldown}s`
          ) : (
            'Submit'
          )}
        </Button>
      </div>

      {maxAttempts > 0 && (
        <p className="text-xs text-muted-foreground">
          Attempts: {attempts}{noAttemptsLeft ? ' (max reached)' : ` / ${maxAttempts}`}
        </p>
      )}

      {result && (
        <Alert className={cn('py-2', statusVariant[result.status as keyof typeof statusVariant] || statusVariant.error)}>
          <AlertDescription className="flex items-center gap-2 text-sm">
            {statusIcon[result.status as keyof typeof statusIcon]}
            {result.message}
          </AlertDescription>
        </Alert>
      )}
    </form>
  )
}
