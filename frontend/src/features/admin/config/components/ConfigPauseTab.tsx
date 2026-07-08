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

export function ConfigPauseTab({ configValues, onUpdate, isPending }: Props) {
  const [paused, setPaused] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setPaused(configValues['paused'] === 'true')
    setMessage(configValues['pause_message'] ?? '')
  }, [configValues])

  function handleSave() {
    onUpdate([
      { key: 'paused', value: paused },
      { key: 'pause_message', value: message },
    ])
  }

  return (
    <ConfigSection
      title="Pause"
      description="Pause the CTF to prevent submissions"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="flex items-center justify-between">
        <Label htmlFor="paused">Pause CTF</Label>
        <Switch id="paused" checked={paused} onCheckedChange={setPaused} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pause_message">Pause Message</Label>
        <Textarea
          id="pause_message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Message shown to users while CTF is paused"
        />
      </div>
    </ConfigSection>
  )
}
