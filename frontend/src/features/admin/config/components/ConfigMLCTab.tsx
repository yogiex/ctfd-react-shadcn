import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfigSection } from './ConfigSection'

interface Props {
  configValues: Record<string, string>
  onUpdate: (configs: { key: string; value: unknown }[]) => void
  isPending: boolean
}

export function ConfigMLCTab({ configValues, onUpdate, isPending }: Props) {
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [userEndpoint, setUserEndpoint] = useState('')
  const [authEndpoint, setAuthEndpoint] = useState('')
  const [teamEndpoint, setTeamEndpoint] = useState('')

  useEffect(() => {
    setClientId(configValues['mlc_client_id'] ?? '')
    setClientSecret(configValues['mlc_client_secret'] ?? '')
    setUserEndpoint(configValues['mlc_user_endpoint'] ?? '')
    setAuthEndpoint(configValues['mlc_auth_endpoint'] ?? '')
    setTeamEndpoint(configValues['mlc_team_endpoint'] ?? '')
  }, [configValues])

  function handleSave() {
    onUpdate([
      { key: 'mlc_client_id', value: clientId },
      { key: 'mlc_client_secret', value: clientSecret },
      { key: 'mlc_user_endpoint', value: userEndpoint },
      { key: 'mlc_auth_endpoint', value: authEndpoint },
      { key: 'mlc_team_endpoint', value: teamEndpoint },
    ])
  }

  return (
    <ConfigSection
      title="MLC"
      description="Major League CTF (MLC) integration"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="space-y-2">
        <Label htmlFor="mlc_client_id">Client ID</Label>
        <Input
          id="mlc_client_id"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mlc_client_secret">Client Secret</Label>
        <Input
          id="mlc_client_secret"
          type="password"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mlc_user_endpoint">User Endpoint</Label>
        <Input
          id="mlc_user_endpoint"
          type="url"
          value={userEndpoint}
          onChange={(e) => setUserEndpoint(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mlc_auth_endpoint">Auth Endpoint</Label>
        <Input
          id="mlc_auth_endpoint"
          type="url"
          value={authEndpoint}
          onChange={(e) => setAuthEndpoint(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mlc_team_endpoint">Team Endpoint</Label>
        <Input
          id="mlc_team_endpoint"
          type="url"
          value={teamEndpoint}
          onChange={(e) => setTeamEndpoint(e.target.value)}
        />
      </div>
    </ConfigSection>
  )
}
