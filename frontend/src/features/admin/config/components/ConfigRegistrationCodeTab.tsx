import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfigSection } from './ConfigSection'

interface Props {
  configValues: Record<string, string>
  onUpdate: (configs: { key: string; value: unknown }[]) => void
  isPending: boolean
}

export function ConfigRegistrationCodeTab({ configValues, onUpdate, isPending }: Props) {
  const [code, setCode] = useState('')

  useEffect(() => {
    setCode(configValues['registration_code'] ?? '')
  }, [configValues])

  function handleSave() {
    onUpdate([{ key: 'registration_code', value: code }])
  }

  return (
    <ConfigSection
      title="Registration Code"
      description="Require a registration code for new accounts"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="space-y-2">
        <Label htmlFor="registration_code">Code</Label>
        <Input
          id="registration_code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Leave empty to disable"
        />
      </div>
    </ConfigSection>
  )
}
