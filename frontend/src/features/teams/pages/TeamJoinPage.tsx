import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useJoinTeam } from '../hooks/useJoinTeam'
import { TeamFormCard } from '../components/TeamFormCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

const joinTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  password: z.string().min(1, 'Password is required'),
})

type JoinTeamFormData = z.infer<typeof joinTeamSchema>

export function TeamJoinPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const { isLoading, error, joinTeam } = useJoinTeam()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinTeamFormData>({
    resolver: zodResolver(joinTeamSchema),
    defaultValues: {
      name: '',
      password: '',
    },
  })

  const onSubmit = async (data: JoinTeamFormData) => {
    setServerError(null)
    await joinTeam(data)
  }

  const displayError = serverError || error

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-8">
      <TeamFormCard
        title="Join Team"
        description="Enter the team name and password to join an existing team"
      >
        <div className="space-y-6">
          {displayError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Team Name
              </Label>
              <Input
                id="name"
                placeholder="Enter team name"
                {...register('name')}
                autoFocus
                className="h-11 text-base"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter team password"
                {...register('password')}
                className="h-11 text-base"
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Team'
              )}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have a team?{' '}
            <Link
              to="/teams/new"
              className="text-primary font-medium hover:underline"
            >
              Create a team
            </Link>
          </p>
        </div>
      </TeamFormCard>
    </div>
  )
}
