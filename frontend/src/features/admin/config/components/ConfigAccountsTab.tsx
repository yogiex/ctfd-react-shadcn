import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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

export function ConfigAccountsTab({ configValues, onUpdate, isPending }: Props) {
  const [verifyEmails, setVerifyEmails] = useState(false)
  const [teamCreation, setTeamCreation] = useState('true')
  const [passwordMinLength, setPasswordMinLength] = useState('8')
  const [passwordLengthBeforeReset, setPasswordLengthBeforeReset] = useState('')
  const [domainWhitelist, setDomainWhitelist] = useState('')

  useEffect(() => {
    setVerifyEmails(configValues['verify_emails'] === 'true')
    setTeamCreation(configValues['team_creation'] ?? 'true')
    setPasswordMinLength(configValues['password_min_length'] ?? '8')
    setPasswordLengthBeforeReset(configValues['password_length_before_reset'] ?? '')
    setDomainWhitelist(configValues['domain_whitelist'] ?? '')
  }, [configValues])

  function handleSave() {
    onUpdate([
      { key: 'verify_emails', value: verifyEmails },
      { key: 'team_creation', value: teamCreation },
      { key: 'password_min_length', value: Number(passwordMinLength) },
      { key: 'password_length_before_reset', value: Number(passwordLengthBeforeReset) || '' },
      { key: 'domain_whitelist', value: domainWhitelist },
    ])
  }

  return (
    <ConfigSection
      title="Accounts"
      description="Account registration and password settings"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="flex items-center justify-between">
        <Label htmlFor="verify_emails">Verify Email Addresses</Label>
        <Switch
          id="verify_emails"
          checked={verifyEmails}
          onCheckedChange={setVerifyEmails}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="team_creation">Team Creation</Label>
        <Select value={teamCreation} onValueChange={setTeamCreation}>
          <SelectTrigger id="team_creation">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Enabled</SelectItem>
            <SelectItem value="false">Disabled</SelectItem>
            <SelectItem value="admin">Admin Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password_min_length">Minimum Password Length</Label>
        <Input
          id="password_min_length"
          type="number"
          value={passwordMinLength}
          onChange={(e) => setPasswordMinLength(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password_length_before_reset">Password Length Before Reset</Label>
        <Input
          id="password_length_before_reset"
          type="number"
          value={passwordLengthBeforeReset}
          onChange={(e) => setPasswordLengthBeforeReset(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="domain_whitelist">Domain Whitelist (one per line)</Label>
        <Textarea
          id="domain_whitelist"
          value={domainWhitelist}
          onChange={(e) => setDomainWhitelist(e.target.value)}
          rows={4}
        />
      </div>
    </ConfigSection>
  )
}
