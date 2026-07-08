import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTeam } from '../hooks/useCreateTeam'
import { TeamFormCard } from '../components/TeamFormCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

const createTeamSchema = z
  .object({
    name: z.string().min(1, 'Team name is required'),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    website: z
      .string()
      .url('Must be a valid URL starting with http or https')
      .or(z.literal(''))
      .optional(),
    affiliation: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type CreateTeamFormData = z.infer<typeof createTeamSchema>

export function TeamCreatePage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const { isLoading, error, createTeam } = useCreateTeam()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
      website: '',
      affiliation: '',
    },
  })

  const onSubmit = async (data: CreateTeamFormData) => {
    setServerError(null)
    await createTeam({
      name: data.name,
      password: data.password,
      website: data.website || undefined,
      affiliation: data.affiliation || undefined,
    })
  }

  const displayError = serverError || error

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-8">
      <TeamFormCard
        title="Create Team"
        description="Create a new team and invite your teammates"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm team password"
                {...register('confirmPassword')}
                className="h-11 text-base"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium">
                Website <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="website"
                placeholder="https://example.com"
                {...register('website')}
                className="h-11 text-base"
              />
              {errors.website && (
                <p className="text-sm text-destructive mt-1">
                  {errors.website.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliation" className="text-sm font-medium">
                Affiliation{' '}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="affiliation"
                placeholder="Your organization or school"
                {...register('affiliation')}
                className="h-11 text-base"
              />
              {errors.affiliation && (
                <p className="text-sm text-destructive mt-1">
                  {errors.affiliation.message}
                </p>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              After creating your team, share the team name and password with
              your teammates so they can join your team.
            </p>

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Team'
              )}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center">
            Already have a team?{' '}
            <Link
              to="/teams/join"
              className="text-primary font-medium hover:underline"
            >
              Join a team
            </Link>
          </p>
        </div>
      </TeamFormCard>
    </div>
  )
}
