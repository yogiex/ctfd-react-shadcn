import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, Clock, FileText, RefreshCw } from 'lucide-react'
import { useImportStatus, type ImportStatus } from '../hooks/useAdminImport'

function ImportProcessing({ status }: { status: ImportStatus }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Import in Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Started: {status.startTime && status.startTime !== 'None' ? new Date(parseInt(status.startTime) * 1000).toLocaleString() : 'Unknown'}</span>
          </div>
          {status.status && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {status.status}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">The admin panel is locked during import. This page updates automatically.</p>
        </CardContent>
      </Card>
    </div>
  )
}

function ImportSuccess({ status }: { status: ImportStatus }) {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/admin/config'), 5000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            Import Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status.endTime && status.endTime !== 'None' && (
            <p className="text-sm text-muted-foreground">
              Completed: {new Date(parseInt(status.endTime) * 1000).toLocaleString()}
            </p>
          )}
          <p className="text-sm text-muted-foreground">Redirecting to configuration in 5 seconds...</p>
          <Button onClick={() => navigate('/admin/config')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ImportError({ status }: { status: ImportStatus }) {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Import Failed</AlertTitle>
        <AlertDescription>{status.error || 'An unknown error occurred during import.'}</AlertDescription>
      </Alert>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate('/admin/config')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Configuration
        </Button>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    </div>
  )
}

function ImportIdle() {
  const navigate = useNavigate()
  return (
    <Card>
      <CardHeader>
        <CardTitle>No Import in Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">There is no import currently running. You can start an import from the configuration page.</p>
        <Button onClick={() => navigate('/admin/config')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go to Configuration
        </Button>
      </CardContent>
    </Card>
  )
}

export function AdminImportPage() {
  const navigate = useNavigate()
  const { data: status, isLoading, isError, error: queryError } = useImportStatus()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !status) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load import status. {(queryError as Error)?.message || 'Unknown error'}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate('/admin/config')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Configuration
        </Button>
      </div>
    )
  }

  const hasStarted = status.startTime && status.startTime !== 'None'
  const hasEnded = status.endTime && status.endTime !== 'None'
  const hasError = !!status.error

  if (!hasStarted && !hasError) return <ImportIdle />
  if (hasError && (!hasStarted || hasEnded)) return <ImportError status={status} />
  if (hasEnded) return <ImportSuccess status={status} />
  if (hasStarted) return <ImportProcessing status={status} />

  return <ImportIdle />
}
