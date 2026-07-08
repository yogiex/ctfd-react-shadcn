import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api/client'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertCircle,
  Save,
  Copy,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(128),
  email: z.string().email('Invalid email'),
  password: z.string().optional().or(z.literal('')),
  confirm: z.string().optional().or(z.literal('')),
  affiliation: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  language: z.string().optional().or(z.literal('')),
})

type ProfileForm = z.infer<typeof profileSchema>

interface UserProfile {
  id: number
  name: string
  email: string
  website: string | null
  affiliation: string | null
  country: string | null
  language: string | null
  bracket_id: number | null
  bracket_name: string | null
  place: number | null
  score: number | null
}

interface ApiToken {
  id: number
  type: string
  created: string
  expiration: string | null
  description: string | null
}

export function SettingsPage() {
  const [_profile, setProfile] = useState<UserProfile | null>(null)
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  const fetchProfile = useCallback(async () => {
    try {
      const [userData, tokensData] = await Promise.all([
        api.get<UserProfile>('/users/me'),
        api.get<ApiToken[]>('/tokens').catch(() => [] as ApiToken[]),
      ])
      setProfile(userData)
      setTokens(tokensData)
      reset({
        name: userData.name ?? '',
        email: userData.email ?? '',
        password: '',
        confirm: '',
        affiliation: userData.affiliation ?? '',
        country: userData.country ?? '',
        website: userData.website ?? '',
        language: userData.language ?? '',
      })
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Failed to load profile',
      )
    } finally {
      setIsLoading(false)
    }
  }, [reset])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const onSubmit = async (data: ProfileForm) => {
    setIsSaving(true)
    setSaveError(null)
    try {
      const body: Record<string, string | undefined> = {
        name: data.name,
        email: data.email,
        affiliation: data.affiliation,
        country: data.country,
        website: data.website,
        language: data.language,
      }
      if (data.password) {
        body.password = data.password
        body.confirm = data.confirm ?? ''
      }
      const updated = await api.patch<UserProfile>('/users/me', body)
      setProfile(updated)
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      })
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Failed to update profile',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token)
    toast({ title: 'Copied', description: 'Token copied to clipboard.' })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="tokens">
            Tokens ({tokens.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account details and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {saveError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{saveError}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" {...register('name')} />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affiliation">Affiliation</Label>
                    <Input id="affiliation" {...register('affiliation')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" {...register('country')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://"
                      {...register('website')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input id="language" {...register('language')} />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-3">
                    Change Password
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        {...register('password')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm">
                        Current Password (required to change)
                      </Label>
                      <Input
                        id="confirm"
                        type="password"
                        autoComplete="current-password"
                        {...register('confirm')}
                      />
                      {errors.confirm && (
                        <p className="text-sm text-destructive">
                          {errors.confirm.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSaving || !isDirty}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Tokens</CardTitle>
                  <CardDescription>
                    Manage your API access tokens.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {tokens.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No API tokens generated yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token) => (
                      <TableRow key={token.id}>
                        <TableCell>
                          {token.description || (
                            <span className="text-muted-foreground italic">
                              No description
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{token.created?.slice(0, 10)}</TableCell>
                        <TableCell>
                          {token.expiration ? (
                            token.expiration
                          ) : (
                            <Badge variant="outline">Never</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToken(String(token.id))}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
