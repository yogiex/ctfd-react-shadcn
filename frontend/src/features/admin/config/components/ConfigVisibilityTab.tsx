import { useState, useEffect } from 'react'
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

export function ConfigVisibilityTab({ configValues, onUpdate, isPending }: Props) {
  const [challenge, setChallenge] = useState('public')
  const [account, setAccount] = useState('public')
  const [score, setScore] = useState('public')
  const [registration, setRegistration] = useState('public')

  useEffect(() => {
    setChallenge(configValues['challenge_visibility'] ?? 'public')
    setAccount(configValues['account_visibility'] ?? 'public')
    setScore(configValues['score_visibility'] ?? 'public')
    setRegistration(configValues['registration_visibility'] ?? 'public')
  }, [configValues])

  function handleSave() {
    onUpdate([
      { key: 'challenge_visibility', value: challenge },
      { key: 'account_visibility', value: account },
      { key: 'score_visibility', value: score },
      { key: 'registration_visibility', value: registration },
    ])
  }

  return (
    <ConfigSection
      title="Visibility"
      description="Granular visibility controls"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="space-y-2">
        <Label htmlFor="visibility_challenge">Challenge Visibility</Label>
        <Select value={challenge} onValueChange={setChallenge}>
          <SelectTrigger id="visibility_challenge">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="admins">Admins Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="visibility_account">Account Visibility</Label>
        <Select value={account} onValueChange={setAccount}>
          <SelectTrigger id="visibility_account">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="admins">Admins Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="visibility_score">Score Visibility</Label>
        <Select value={score} onValueChange={setScore}>
          <SelectTrigger id="visibility_score">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="admins">Admins Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="visibility_registration">Registration Visibility</Label>
        <Select value={registration} onValueChange={setRegistration}>
          <SelectTrigger id="visibility_registration">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="admins">Admins Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </ConfigSection>
  )
}
