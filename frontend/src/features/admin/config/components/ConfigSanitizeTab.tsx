import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ConfigSection } from './ConfigSection'

interface Props {
  configValues: Record<string, string>
  onUpdate: (configs: { key: string; value: unknown }[]) => void
  isPending: boolean
}

export function ConfigSanitizeTab({ configValues, onUpdate, isPending }: Props) {
  const [enabled, setEnabled] = useState(false)
  const [tags, setTags] = useState('')
  const [attributes, setAttributes] = useState('')
  const [protocols, setProtocols] = useState('')

  useEffect(() => {
    setEnabled(configValues['html_sanitization'] === 'true')
    setTags(configValues['allowed_tags'] ?? '')
    setAttributes(configValues['allowed_attributes'] ?? '')
    setProtocols(configValues['allowed_protocols'] ?? '')
  }, [configValues])

  function handleSave() {
    onUpdate([
      { key: 'html_sanitization', value: enabled },
      { key: 'allowed_tags', value: tags },
      { key: 'allowed_attributes', value: attributes },
      { key: 'allowed_protocols', value: protocols },
    ])
  }

  return (
    <ConfigSection
      title="Sanitization"
      description="HTML sanitization settings"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="flex items-center justify-between">
        <Label htmlFor="html_sanitization">Enable HTML Sanitization</Label>
        <Switch
          id="html_sanitization"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="allowed_tags">Allowed HTML Tags (comma-separated)</Label>
        <Textarea
          id="allowed_tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="a, b, i, em, strong, p, br, ul, ol, li"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="allowed_attributes">Allowed HTML Attributes (comma-separated)</Label>
        <Textarea
          id="allowed_attributes"
          value={attributes}
          onChange={(e) => setAttributes(e.target.value)}
          placeholder="href, target, rel, class"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="allowed_protocols">Allowed Protocols (comma-separated)</Label>
        <Textarea
          id="allowed_protocols"
          value={protocols}
          onChange={(e) => setProtocols(e.target.value)}
          placeholder="http, https, mailto"
          rows={3}
        />
      </div>
    </ConfigSection>
  )
}
