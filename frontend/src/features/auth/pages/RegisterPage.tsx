import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRegister } from '../hooks/useRegister'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { isLoading, error, success, register } = useRegister()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await register({ name, email, password })
  }

  if (success) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
          <div className="bg-success/10 rounded-full p-4">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
          <h1 className="text-2xl font-bold">Registration Submitted</h1>
          <p className="text-muted-foreground">
            Your account has been created. You can now sign in.
          </p>
          <Button asChild className="w-full mt-4">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Create Account</h1>
          <p className="text-base text-muted-foreground">
            Register to participate in CTF challenges
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">User Name</Label>
            <Input
              id="name"
              placeholder="Enter your username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="h-11 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 text-base"
            />
          </div>

          <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
