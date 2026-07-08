import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAcceptInvite } from '../hooks/useAcceptInvite'
import { TeamFormCard } from '../components/TeamFormCard'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Loader2, Users } from 'lucide-react'

export function TeamInvitePage() {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const { isLoading, error, acceptInvite } = useAcceptInvite()
  const [submitted, setSubmitted] = useState(false)
  const [teamName, setTeamName] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return
    const fetchTeamName = async () => {
      try {
        const res = await fetch(`/teams/invite?code=${encodeURIComponent(code)}`, {
          headers: { Accept: 'text/html' },
          redirect: 'manual',
        })
        const html = await res.text()
        const match = html.match(/Welcome to\s*<strong>([^<]+)<\/strong>/)
        if (match) {
          setTeamName(match[1])
        }
      } catch {
        // team name is optional for display, ignore errors
      }
    }
    fetchTeamName()
  }, [code])

  const handleAccept = async () => {
    if (!code) return
    setSubmitted(true)
    await acceptInvite(code)
  }

  if (!code) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-8">
        <TeamFormCard title="Invalid Invite">
          <div className="space-y-6 text-center">
            <div className="mx-auto bg-destructive/10 rounded-full p-4 w-fit">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <p className="text-muted-foreground">
              No invite code was provided. Please check the invite link you received.
            </p>
            <Button asChild className="w-full">
              <Link to="/teams">Go to Teams</Link>
            </Button>
          </div>
        </TeamFormCard>
      </div>
    )
  }

  if (error && submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-8">
        <TeamFormCard title="Invite Error">
          <div className="space-y-6 text-center">
            <div className="mx-auto bg-destructive/10 rounded-full p-4 w-fit">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              <Link
                to="/teams/new"
                className="text-primary font-medium hover:underline"
              >
                Create a new team
              </Link>{' '}
              or{' '}
              <Link
                to="/teams/join"
                className="text-primary font-medium hover:underline"
              >
                join an existing one
              </Link>
              .
            </p>
          </div>
        </TeamFormCard>
      </div>
    )
  }

  if (submitted && isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-8">
        <TeamFormCard title="Joining Team">
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Joining team...</p>
          </div>
        </TeamFormCard>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-8">
      <TeamFormCard title="Join Team">
        <div className="space-y-6 text-center">
          {teamName && (
            <>
              <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <p className="text-lg">
                Welcome to <strong>{teamName}</strong>!
              </p>
            </>
          )}

          <p className="text-muted-foreground">
            Click the button below to join the team!
          </p>

          <Button
            className="w-full h-12 text-base"
            onClick={handleAccept}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Accept Invite
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground">
            Or{' '}
            <Link
              to="/teams/new"
              className="text-primary font-medium hover:underline"
            >
              click here
            </Link>{' '}
            if you&apos;d prefer to create your own team.
          </p>
        </div>
      </TeamFormCard>
    </div>
  )
}
