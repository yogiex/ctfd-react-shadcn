import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getCsrfNonce } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const adminSchema = z.object({
  name: z.string().min(1, 'Name is required').max(128),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const ctfSchema = z.object({
  ctf_name: z.string().min(1, 'CTF name is required').max(128),
  ctf_description: z.string().optional().or(z.literal('')),
  user_mode: z.enum(['users', 'teams']),
})

type AdminForm = z.infer<typeof adminSchema>
type CtfForm = z.infer<typeof ctfSchema>

export function SetupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [checkingSetup, setCheckingSetup] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [setupComplete, setSetupComplete] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)

  const adminForm = useForm<AdminForm>({
    resolver: zodResolver(adminSchema),
    defaultValues: { name: 'admin', email: 'admin@ctfd.local', password: 'admin123' },
  })

  const ctfForm = useForm<CtfForm>({
    resolver: zodResolver(ctfSchema),
    defaultValues: {
      ctf_name: 'CTFd PuTI Telkom University',
      ctf_description: 'Platform CTF untuk pembelajaran keamanan siber',
      user_mode: 'users',
    },
  })

  useEffect(() => {
    api
      .get<{ total: number }>('/users?view=admin')
      .then((data) => {
        if (data.total > 0) {
          navigate('/', { replace: true })
        } else {
          setNeedsSetup(true)
        }
      })
      .catch(() => setNeedsSetup(true))
      .finally(() => setCheckingSetup(false))
  }, [navigate])

  if (checkingSetup) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!needsSetup) {
    return null
  }

  if (setupComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 w-16 h-16 mx-auto flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Setup Complete!</h2>
            <p className="text-muted-foreground">
              Your CTFd instance is ready to go.
            </p>
            <Button asChild size="lg" className="w-full">
              <a href="/">Go to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleNext = async () => {
    const valid = await adminForm.trigger()
    if (valid) setStep(1)
  }

  const handlePrev = () => {
    setStep(0)
    setSetupError(null)
  }

  const handleFinish = async (ctfData: CtfForm) => {
    setIsSubmitting(true)
    setSetupError(null)
    try {
      const adminData = adminForm.getValues()
      const csrfNonce = getCsrfNonce()
      const urlRoot = ''

      const params = new URLSearchParams()
      params.append('name', adminData.name)
      params.append('email', adminData.email)
      params.append('password', adminData.password)
      params.append('ctf_name', ctfData.ctf_name)
      params.append('ctf_description', ctfData.ctf_description || '')
      params.append('user_mode', ctfData.user_mode)
      params.append('nonce', csrfNonce)

      const response = await fetch(`${urlRoot}/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        redirect: 'manual',
      })

      if (response.status === 302 || response.type === 'opaqueredirect') {
        setSetupComplete(true)
      } else {
        const html = await response.text()
        const errorMatch = html.match(
          /<div class="alert alert-danger"[^>]*>([\s\S]*?)<\/div>/
        )
        const error = errorMatch
          ? errorMatch[1].trim().replace(/<[^>]*>/g, '')
          : 'Setup failed. Please check your input.'
        setSetupError(error)
      }
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>CTFd Setup</CardTitle>
          <CardDescription>
            Step {step + 1} of 2{step === 0 ? ' — Admin Account' : ' — CTF Configuration'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {setupError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{setupError}</AlertDescription>
            </Alert>
          )}

          {step === 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleNext()
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Admin Name</Label>
                <Input id="name" {...adminForm.register('name')} autoFocus />
                {adminForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {adminForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input id="email" type="email" {...adminForm.register('email')} />
                {adminForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {adminForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...adminForm.register('password')}
                />
                {adminForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {adminForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          )}

          {step === 1 && (
            <form
              onSubmit={ctfForm.handleSubmit(handleFinish)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="ctf_name">CTF Name</Label>
                <Input id="ctf_name" {...ctfForm.register('ctf_name')} autoFocus />
                {ctfForm.formState.errors.ctf_name && (
                  <p className="text-sm text-destructive">
                    {ctfForm.formState.errors.ctf_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctf_description">Description</Label>
                <Input id="ctf_description" {...ctfForm.register('ctf_description')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user_mode">User Mode</Label>
                <select
                  id="user_mode"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...ctfForm.register('user_mode')}
                >
                  <option value="users">Users</option>
                  <option value="teams">Teams</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Setting up...' : 'Finish Setup'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
