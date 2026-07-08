import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfigSection } from './ConfigSection'

interface Props {
  configValues: Record<string, string>
  onUpdate: (configs: { key: string; value: unknown }[]) => void
  isPending: boolean
}

export function ConfigTimeTab({ configValues, onUpdate, isPending }: Props) {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  useEffect(() => {
    setStart(configValues['start'] ?? '')
    setEnd(configValues['end'] ?? '')
  }, [configValues])

  function handleSave() {
    onUpdate([
      { key: 'start', value: start },
      { key: 'end', value: end },
    ])
  }

  return (
    <ConfigSection
      title="Time"
      description="CTF competition start and end times"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="space-y-2">
        <Label htmlFor="start">Start Time</Label>
        <Input
          id="start"
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end">End Time</Label>
        <Input
          id="end"
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>
    </ConfigSection>
  )
}
