import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ConfigSection } from './ConfigSection'

interface Props {
  configValues: Record<string, string>
  onUpdate: (configs: { key: string; value: unknown }[]) => void
  isPending: boolean
}

export function ConfigLegalTab({ configValues, onUpdate, isPending }: Props) {
  const [tosUrl, setTosUrl] = useState('')
  const [tosText, setTosText] = useState('')
  const [privacyUrl, setPrivacyUrl] = useState('')

  useEffect(() => {
    setTosUrl(configValues['tos_url'] ?? '')
    setTosText(configValues['tos_text'] ?? '')
    setPrivacyUrl(configValues['privacy_policy_url'] ?? '')
  }, [configValues])

  function handleSave() {
    onUpdate([
      { key: 'tos_url', value: tosUrl },
      { key: 'tos_text', value: tosText },
      { key: 'privacy_policy_url', value: privacyUrl },
    ])
  }

  return (
    <ConfigSection
      title="Legal"
      description="Terms of service and privacy policy"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="space-y-2">
        <Label htmlFor="tos_url">Terms of Service URL</Label>
        <Input
          id="tos_url"
          type="url"
          value={tosUrl}
          onChange={(e) => setTosUrl(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tos_text">Terms of Service Text</Label>
        <Textarea
          id="tos_text"
          value={tosText}
          onChange={(e) => setTosText(e.target.value)}
          rows={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="privacy_policy_url">Privacy Policy URL</Label>
        <Input
          id="privacy_policy_url"
          type="url"
          value={privacyUrl}
          onChange={(e) => setPrivacyUrl(e.target.value)}
        />
      </div>
    </ConfigSection>
  )
}
