import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ConfigSection } from './ConfigSection'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  configValues: Record<string, string>
  onUpdate: (configs: { key: string; value: unknown }[]) => void
  isPending: boolean
}

export function ConfigGeneralTab({ configValues, onUpdate, isPending }: Props) {
  const [ctfName, setCtfName] = useState('')
  const [description, setDescription] = useState('')
  const [userMode, setUserMode] = useState('users')

  useEffect(() => {
    setCtfName(configValues['ctf_name'] ?? '')
    setDescription(configValues['ctf_description'] ?? '')
    setUserMode(configValues['user_mode'] ?? 'users')
  }, [configValues])

  function handleSave() {
    onUpdate([
      { key: 'ctf_name', value: ctfName },
      { key: 'ctf_description', value: description },
      { key: 'user_mode', value: userMode },
    ])
  }

  return (
    <ConfigSection
      title="General"
      description="Basic CTF configuration settings"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="space-y-2">
        <Label htmlFor="ctf_name">CTF Name</Label>
        <Input
          id="ctf_name"
          value={ctfName}
          onChange={(e) => setCtfName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ctf_description">Description</Label>
        <Textarea
          id="ctf_description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user_mode">User Mode</Label>
        <Select value={userMode} onValueChange={setUserMode}>
          <SelectTrigger id="user_mode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="users">Users</SelectItem>
            <SelectItem value="teams">Teams</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </ConfigSection>
  )
}
