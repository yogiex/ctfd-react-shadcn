import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, RotateCcw, Loader2 } from 'lucide-react'

interface ResetOption {
  key: string
  label: string
  description: string
  destructive: boolean
}

const RESET_OPTIONS: ResetOption[] = [
  {
    key: 'submissions',
    label: 'Reset All Submissions',
    description: 'Delete all solves, attempts, awards, unlocks, and tracking data. Challenges, users, and teams will be preserved.',
    destructive: true,
  },
  {
    key: 'accounts',
    label: 'Reset All Accounts',
    description: 'Delete all users and teams. This will also reset the CTF setup, requiring you to go through setup again.',
    destructive: true,
  },
  {
    key: 'challenges',
    label: 'Reset All Challenges',
    description: 'Delete all challenges including their files, flags, hints, tags, and solutions.',
    destructive: true,
  },
  {
    key: 'pages',
    label: 'Reset All Pages',
    description: 'Delete all custom pages including their associated files.',
    destructive: true,
  },
  {
    key: 'notifications',
    label: 'Reset All Notifications',
    description: 'Delete all notifications.',
    destructive: false,
  },
]

function getCsrfNonce(): string {
  return (window as any).INITIAL_DATA?.csrfNonce ?? ''
}

function getUrlRoot(): string {
  return (window as any).INITIAL_DATA?.urlRoot ?? ''
}

async function performReset(keys: string[]): Promise<void> {
  const formData = new FormData()
  keys.forEach(key => formData.append(key, 'true'))

  const response = await fetch(`${getUrlRoot()}/admin/reset`, {
    method: 'POST',
    headers: {
      'CSRF-Token': getCsrfNonce(),
    },
    body: formData,
    credentials: 'same-origin',
  })

  if (!response.ok) {
    throw new Error(`Reset failed (${response.status})`)
  }
}

function ResetConfirmDialog({
  open,
  onOpenChange,
  option,
  onConfirm,
  resetting,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  option: ResetOption | null
  onConfirm: () => void
  resetting: boolean
}) {
  const [typed, setTyped] = useState('')

  if (!option) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {option.label}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-2">
            <p>{option.description}</p>
            <p className="font-medium text-foreground">
              This action cannot be undone. Type <strong>RESET</strong> to confirm.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="px-6 pb-2">
          <Label htmlFor="reset-confirm" className="sr-only">
            Type RESET to confirm
          </Label>
          <Input
            id="reset-confirm"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder='Type "RESET" to confirm'
            className="font-mono"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={resetting} onClick={() => setTyped('')}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm()
              setTyped('')
            }}
            disabled={typed !== 'RESET' || resetting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {resetting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</>
            ) : (
              <>{option.label}</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function AdminResetPage() {
  const navigate = useNavigate()
  const [confirmOption, setConfirmOption] = useState<ResetOption | null>(null)
  const [resetting, setResetting] = useState(false)

  const handleReset = async (option: ResetOption) => {
    setResetting(true)
    try {
      await performReset([option.key])
      if (option.key === 'accounts') {
        window.location.href = '/setup'
      } else {
        navigate('/admin')
      }
    } catch {
      // Keep dialog open on error
    } finally {
      setResetting(false)
      setConfirmOption(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Reset</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Dangerous operations to reset CTFd data
        </p>
      </div>

      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-destructive">Warning</p>
            <p className="text-muted-foreground mt-1">
              These operations will permanently delete data. Make sure to export a backup before proceeding.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {RESET_OPTIONS.map(option => (
          <div
            key={option.key}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="space-y-1">
              <h3 className="font-medium">{option.label}</h3>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
            <Button
              variant={option.destructive ? 'destructive' : 'outline'}
              onClick={() => setConfirmOption(option)}
              className="shrink-0 ml-4"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        ))}
      </div>

      <ResetConfirmDialog
        open={!!confirmOption}
        onOpenChange={v => !v && setConfirmOption(null)}
        option={confirmOption}
        onConfirm={() => confirmOption && handleReset(confirmOption)}
        resetting={resetting}
      />
    </div>
  )
}
