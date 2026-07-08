import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ConfigSection } from './ConfigSection'

interface Props {
  configValues: Record<string, string>
  onUpdate: (configs: { key: string; value: unknown }[]) => void
  isPending: boolean
}

export function ConfigRobotsTab({ configValues, onUpdate, isPending }: Props) {
  const [robots, setRobots] = useState('')

  useEffect(() => {
    setRobots(configValues['robots_txt'] ?? '')
  }, [configValues])

  function handleSave() {
    onUpdate([{ key: 'robots_txt', value: robots }])
  }

  return (
    <ConfigSection
      title="Robots.txt"
      description="Custom robots.txt content for search engine crawlers"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="space-y-2">
        <Label htmlFor="robots_txt">Robots.txt</Label>
        <Textarea
          id="robots_txt"
          value={robots}
          onChange={(e) => setRobots(e.target.value)}
          className="font-mono text-xs"
          rows={10}
          placeholder="User-agent: *&#10;Disallow: /admin&#10;Disallow: /api"
        />
      </div>
    </ConfigSection>
  )
}
