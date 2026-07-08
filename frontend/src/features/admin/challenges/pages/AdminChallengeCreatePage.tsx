import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChallengeTypes as useAdminChallengeTypes, useCreateChallenge } from '../hooks/useAdminChallenges'
import { useChallengeTypes } from '@/features/admin/plugin/hooks/useChallengeTypes'
import { PluginFormRenderer } from '@/features/admin/plugin/components/PluginFormRenderer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, AlertCircle, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ApiError } from '@/lib/api/client'

export function AdminChallengeCreatePage() {
  const navigate = useNavigate()
  const { data: types, isLoading: typesLoading } = useAdminChallengeTypes()
  const { data: pluginChallengeTypes } = useChallengeTypes()
  const createChallenge = useCreateChallenge()

  const [type, setType] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [value, setValue] = useState(0)
  const [description, setDescription] = useState('')
  const [maxAttempts, setMaxAttempts] = useState(0)
  const [state, setState] = useState<'visible' | 'hidden'>('hidden')
  const [pluginData, setPluginData] = useState<Record<string, unknown>>({})
  const [error, setError] = useState<string | null>(null)

  const selectedType = type && pluginChallengeTypes?.[type]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!type) {
      setError('Please select a challenge type.')
      return
    }

    try {
      const result = await createChallenge.mutateAsync({
        name,
        category,
        value,
        description,
        type,
        max_attempts: maxAttempts || undefined,
        state,
        ...pluginData,
      })
      navigate(`/admin/challenges/${result.id}`)
    } catch (err) {
      const apiErr = err as ApiError
      setError(apiErr.message || 'Failed to create challenge.')
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/challenges">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create Challenge
          </h1>
          <p className="text-muted-foreground text-sm">
            Add a new challenge to the competition
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Challenge Details</CardTitle>
          <CardDescription>
            Configure the basic properties of your challenge
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Challenge Type</Label>
              {typesLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select a type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(types ?? {}).map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name || t.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedType && (
              <div className="space-y-3 border rounded-lg p-4">
                <h3 className="text-sm font-medium">Challenge Type Configuration</h3>
                <PluginFormRenderer
                  html={selectedType.create}
                  scripts={[selectedType.scripts.create].filter(Boolean)}
                  onSubmit={(data) => setPluginData(data)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Challenge name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Web, Crypto, Reverse"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value (points)</Label>
              <Input
                id="value"
                type="number"
                min={0}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Challenge description (markdown supported)"
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_attempts">Max Attempts (0 = unlimited)</Label>
              <Input
                id="max_attempts"
                type="number"
                min={0}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={state}
                onValueChange={(v) => setState(v as 'visible' | 'hidden')}
              >
                <SelectTrigger id="state">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hidden">Hidden</SelectItem>
                  <SelectItem value="visible">Visible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createChallenge.isPending}
            >
              <Plus className="h-4 w-4 mr-1" />
              {createChallenge.isPending
                ? 'Creating...'
                : 'Create Challenge'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
