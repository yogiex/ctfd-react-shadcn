import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  useAdminChallenge,
  useUpdateChallenge,
  useAdminChallenges,
} from '../hooks/useAdminChallenges'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { PluginChallengeRenderer } from '@/features/admin/plugin/components/PluginChallengeRenderer'
import { AdminFlagForm } from '../components/AdminFlagForm'
import { AdminHintForm } from '../components/AdminHintForm'
import { AdminFileUpload } from '../components/AdminFileUpload'
import { AdminTagInput } from '../components/AdminTagInput'
import { AdminTopicManager } from '../components/AdminTopicManager'
import { AdminRequirementsEditor } from '../components/AdminRequirementsEditor'
import { AdminSolutionEditor } from '../components/AdminSolutionEditor'
import { AdminCommentThread } from '../components/AdminCommentThread'
import { AdminRatingsTable } from '../components/AdminRatingsTable'
import {
  ArrowLeft,
  Save,
  AlertCircle,
  FileText,
  Flag,
  Lightbulb,
  Files,
  Tags,
  Bookmark,
  ListChecks,
  FileCode,
  ArrowRight,
  MessageSquare,
  Star,
} from 'lucide-react'
import type { ApiError } from '@/lib/api/client'

const TABS = [
  { value: 'details', label: 'Detail', icon: FileText },
  { value: 'flags', label: 'Flags', icon: Flag },
  { value: 'hints', label: 'Hints', icon: Lightbulb },
  { value: 'files', label: 'Files', icon: Files },
  { value: 'tags', label: 'Tags', icon: Tags },
  { value: 'topics', label: 'Topics', icon: Bookmark },
  { value: 'requirements', label: 'Requirements', icon: ListChecks },
  { value: 'solution', label: 'Solution', icon: FileCode },
  { value: 'next', label: 'Next', icon: ArrowRight },
  { value: 'comments', label: 'Comments', icon: MessageSquare },
  { value: 'ratings', label: 'Ratings', icon: Star },
] as const

export function AdminChallengeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const challengeId = id ? Number(id) : null
  const { data: challenge, isLoading, error } = useAdminChallenge(challengeId)
  const { data: allChallenges } = useAdminChallenges()
  const updateChallenge = useUpdateChallenge()
  const [activeTab, setActiveTab] = useState('details')

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [value, setValue] = useState(0)
  const [description, setDescription] = useState('')
  const [connectionInfo, setConnectionInfo] = useState('')
  const [attribution, setAttribution] = useState('')
  const [maxAttempts, setMaxAttempts] = useState(0)
  const [position, setPosition] = useState(0)
  const [state, setState] = useState<'visible' | 'hidden'>('hidden')
  const [nextId, setNextId] = useState<string>('')
  const [detailError, setDetailError] = useState<string | null>(null)

  useEffect(() => {
    if (challenge) {
      setName(challenge.name ?? '')
      setCategory(challenge.category ?? '')
      setValue(challenge.value ?? 0)
      setDescription(challenge.description ?? '')
      setConnectionInfo(challenge.connection_info ?? '')
      setAttribution(challenge.attribution ?? '')
      setMaxAttempts(challenge.max_attempts ?? 0)
      setPosition(challenge.position ?? 0)
      setState(challenge.state ?? 'hidden')
      setNextId(challenge.next_id ? String(challenge.next_id) : '')
    }
  }, [challenge])

  const handleSaveDetail = async () => {
    if (!challengeId) return
    setDetailError(null)
    try {
      await updateChallenge.mutateAsync({
        id: challengeId,
        data: {
          name,
          category,
          value,
          description,
          connection_info: connectionInfo || null,
          attribution: attribution || null,
          max_attempts: maxAttempts || 0,
          position,
          state,
          next_id: nextId ? Number(nextId) : null,
        },
      })
    } catch (err) {
      const apiErr = err as ApiError
      setDetailError(apiErr.message || 'Failed to update challenge.')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Challenge not found or failed to load.
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/admin/challenges">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Challenges
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/challenges">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {challenge.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            {challenge.category} &middot; {challenge.value} pts &middot;{' '}
            {challenge.type}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-1">
          <TabsList className="w-max">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Challenge Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {detailError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{detailError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-value">Value</Label>
                  <Input
                    id="edit-value"
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-position">Position</Label>
                  <Input
                    id="edit-position"
                    type="number"
                    min={0}
                    value={position}
                    onChange={(e) => setPosition(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-max-attempts">Max Attempts</Label>
                  <Input
                    id="edit-max-attempts"
                    type="number"
                    min={0}
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">State</Label>
                  <Select
                    value={state}
                    onValueChange={(v) =>
                      setState(v as 'visible' | 'hidden')
                    }
                  >
                    <SelectTrigger id="edit-state">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hidden">Hidden</SelectItem>
                      <SelectItem value="visible">Visible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-connection-info">
                  Connection Info
                </Label>
                <Input
                  id="edit-connection-info"
                  value={connectionInfo}
                  onChange={(e) => setConnectionInfo(e.target.value)}
                  placeholder="e.g. nc host.com 1337"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-attribution">Attribution</Label>
                <Input
                  id="edit-attribution"
                  value={attribution}
                  onChange={(e) => setAttribution(e.target.value)}
                  placeholder="Author or source attribution"
                />
              </div>

              <Separator />

              <Button
                onClick={handleSaveDetail}
                disabled={updateChallenge.isPending}
              >
                <Save className="h-4 w-4 mr-1" />
                {updateChallenge.isPending ? 'Saving...' : 'Save Changes'}
              </Button>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Challenge View</h3>
                <div className="border rounded-lg p-4 bg-card">
                  <PluginChallengeRenderer
                    html={challenge.view}
                    scripts={challenge.script ? [challenge.script] : []}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {challengeId && <AdminFlagForm challengeId={challengeId} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hints" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {challengeId && <AdminHintForm challengeId={challengeId} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {challengeId && <AdminFileUpload challengeId={challengeId} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {challengeId && <AdminTagInput challengeId={challengeId} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {challengeId && <AdminTopicManager challengeId={challengeId} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {challengeId && (
                <AdminRequirementsEditor challengeId={challengeId} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solution" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {challengeId && (
                <AdminSolutionEditor challengeId={challengeId} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="next" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Next Challenge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-next-id">
                  Select the next challenge
                </Label>
                <Select value={nextId} onValueChange={setNextId}>
                  <SelectTrigger id="edit-next-id">
                    <SelectValue placeholder="No next challenge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {allChallenges
                      ?.filter((c) => c.id !== challengeId)
                      .map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} ({c.category})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Players will be redirected to this challenge after solving
                  the current one.
                </p>
              </div>
              <Button
                onClick={handleSaveDetail}
                disabled={updateChallenge.isPending}
              >
                <Save className="h-4 w-4 mr-1" />
                {updateChallenge.isPending ? 'Saving...' : 'Save'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {challengeId && (
                <AdminCommentThread challengeId={challengeId} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {challengeId && (
                <AdminRatingsTable challengeId={challengeId} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
