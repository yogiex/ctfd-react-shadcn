import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Users, UserPlus, LogIn } from 'lucide-react'

export function TeamEnrollmentPage() {
  const { userMode, team } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (userMode !== 'teams') {
      navigate('/', { replace: true })
      return
    }
    if (team?.id) {
      navigate('/team', { replace: true })
    }
  }, [userMode, team, navigate])

  if (userMode !== 'teams') {
    return null
  }

  if (team?.id) {
    return null
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome to CTFd!
          </CardTitle>
          <p className="text-muted-foreground text-base">
            In order to participate you must either join or create a team.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full h-12 text-base gap-2"
            onClick={() => navigate('/teams/join')}
          >
            <LogIn className="h-5 w-5" />
            Join Team
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-base gap-2"
            onClick={() => navigate('/teams/new')}
          >
            <UserPlus className="h-5 w-5" />
            Create Team
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
