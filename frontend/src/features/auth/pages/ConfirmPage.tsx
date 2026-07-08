import { Link, useParams } from 'react-router-dom'
import { useConfirm } from '../hooks/useConfirm'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Flag } from 'lucide-react'

export function ConfirmPage() {
  const { data: token } = useParams<{ data?: string }>()
  const { isLoading, error, success, resendConfirmation } = useConfirm()

  if (token) {
    return null
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-center mb-6">
        <Flag className="h-10 w-10 text-primary" />
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Confirm Email</CardTitle>
          <CardDescription>
            Need a new confirmation email? Click the button below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Confirmation email sent! Check your inbox.
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={resendConfirmation}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Confirmation Email'}
          </Button>
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
