import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useResetPassword } from '../hooks/useResetPassword'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Flag } from 'lucide-react'

export function ResetPasswordPage() {
  const { token } = useParams<{ token?: string }>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { isLoading, error, success, requestReset, confirmReset } = useResetPassword()

  if (token) {
    if (success) {
      return (
        <div className="w-full max-w-sm mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-2" />
              <CardTitle>Password Reset</CardTitle>
              <CardDescription>
                Your password has been updated successfully.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )
    }

    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="flex justify-center mb-6">
          <Flag className="h-10 w-10 text-primary" />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Set New Password</CardTitle>
            <CardDescription>Enter your new password</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                confirmReset(password, token)
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-2" />
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              If an account with that email exists, we&apos;ve sent a password reset link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-center mb-6">
        <Flag className="h-10 w-10 text-primary" />
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your email to receive a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              requestReset(email)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="text-center mt-4">
        <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
