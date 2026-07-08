import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageData {
  id: number
  title: string
  content: string
  route: string
}

export function StaticPage() {
  const { route } = useParams<{ route: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState<PageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!route) return
    setIsLoading(true)
    setError(null)

    api
      .get<PageData>(`/pages/${route}`)
      .then(setPage)
      .catch((err) => {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Failed to load page')
        }
      })
      .finally(() => setIsLoading(false))
  }, [route])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <FileQuestion className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
      <Card>
        <CardContent className="pt-6 prose prose-neutral dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </CardContent>
      </Card>
    </div>
  )
}
