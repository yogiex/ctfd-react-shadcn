import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ConfigSection } from './ConfigSection'

interface Props {
  configValues: Record<string, string>
  onUpdate: (configs: { key: string; value: unknown }[]) => void
  isPending: boolean
}

export function ConfigSocialTab({ configValues, onUpdate, isPending }: Props) {
  const [shares, setShares] = useState(false)
  const [twitter, setTwitter] = useState('')
  const [facebook, setFacebook] = useState('')
  const [discord, setDiscord] = useState('')

  useEffect(() => {
    setShares(configValues['social_shares'] === 'true')
    setTwitter(configValues['twitter_handle'] ?? '')
    setFacebook(configValues['facebook_url'] ?? '')
    setDiscord(configValues['discord_url'] ?? '')
  }, [configValues])

  function handleSave() {
    onUpdate([
      { key: 'social_shares', value: shares },
      { key: 'twitter_handle', value: twitter },
      { key: 'facebook_url', value: facebook },
      { key: 'discord_url', value: discord },
    ])
  }

  return (
    <ConfigSection
      title="Social"
      description="Social media sharing links"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="flex items-center justify-between">
        <Label htmlFor="social_shares">Enable Social Shares</Label>
        <Switch id="social_shares" checked={shares} onCheckedChange={setShares} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="twitter_handle">Twitter Handle</Label>
        <Input
          id="twitter_handle"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
          placeholder="@ctfd"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="facebook_url">Facebook URL</Label>
        <Input
          id="facebook_url"
          type="url"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="discord_url">Discord URL</Label>
        <Input
          id="discord_url"
          type="url"
          value={discord}
          onChange={(e) => setDiscord(e.target.value)}
        />
      </div>
    </ConfigSection>
  )
}
