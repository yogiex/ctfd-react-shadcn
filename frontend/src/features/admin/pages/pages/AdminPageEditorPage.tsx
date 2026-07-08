import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminPage, useCreatePage, useUpdatePage,
  type AdminPageCreateInput, type AdminPageUpdateInput,
} from '../hooks/useAdminPages'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

const LINK_TARGETS = [
  { value: '', label: 'None (same window)' },
  { value: '_self', label: 'Same Window' },
  { value: '_blank', label: 'New Window' },
]

export function AdminPageEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const pageId = isNew ? null : Number(id)

  const { data: page, isLoading } = useAdminPage(pageId)
  const createMutation = useCreatePage()
  const updateMutation = useUpdatePage()

  const [title, setTitle] = useState('')
  const [route, setRoute] = useState('')
  const [content, setContent] = useState('')
  const [format, setFormat] = useState<'markdown' | 'html'>('markdown')
  const [authRequired, setAuthRequired] = useState(false)
  const [draft, setDraft] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [linkTarget, setLinkTarget] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (page) {
      setTitle(page.title)
      setRoute(page.route)
      setContent(page.content)
      setFormat(page.format)
      setAuthRequired(page.auth_required)
      setDraft(page.draft)
      setHidden(page.hidden)
      setLinkTarget(page.link_target ?? '')
    }
  }, [page])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload: AdminPageCreateInput | AdminPageUpdateInput = {
        title,
        route,
        content: content || undefined,
        format,
        auth_required: authRequired,
        draft,
        hidden,
        link_target: linkTarget || null,
      }

      if (isNew) {
        await createMutation.mutateAsync(payload as AdminPageCreateInput)
        navigate('/admin/pages')
      } else if (pageId) {
        await updateMutation.mutateAsync({ id: pageId, data: payload as AdminPageUpdateInput })
        navigate('/admin/pages')
      }
    } catch (e) {
      setError((e as Error)?.message ?? 'Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  if (!isNew && isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pages')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isNew ? 'New Page' : 'Edit Page'}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isNew ? 'Create a new static page' : `Editing: ${page?.title}`}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Save</>
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Page title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="route">Route</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">/</span>
            <Input
              id="route"
              value={route}
              onChange={e => setRoute(e.target.value)}
              placeholder="page-route"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <Select value={format} onValueChange={(v: 'markdown' | 'html') => setFormat(v)}>
            <SelectTrigger id="format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={format === 'markdown' ? 'Enter markdown content...' : 'Enter HTML content...'}
            className="min-h-[300px] font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="link_target">Link Target</Label>
          <Select value={linkTarget} onValueChange={setLinkTarget}>
            <SelectTrigger id="link_target">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LINK_TARGETS.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-6 pt-2">
          <div className="flex items-center gap-2">
            <Switch id="auth_required" checked={authRequired} onCheckedChange={setAuthRequired} />
            <Label htmlFor="auth_required">Auth Required</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="draft" checked={draft} onCheckedChange={setDraft} />
            <Label htmlFor="draft">Draft</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="hidden" checked={hidden} onCheckedChange={setHidden} />
            <Label htmlFor="hidden">Hidden</Label>
          </div>
        </div>
      </div>
    </div>
  )
}
