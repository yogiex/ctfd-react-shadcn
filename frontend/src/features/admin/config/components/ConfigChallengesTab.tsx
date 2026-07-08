import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
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

export function ConfigChallengesTab({ configValues, onUpdate, isPending }: Props) {
  const [visibility, setVisibility] = useState('public')
  const [scoreVisibility, setScoreVisibility] = useState('public')
  const [accountVisibility, setAccountVisibility] = useState('public')
  const [freeze, setFreeze] = useState('')
  const [ratings, setRatings] = useState('disabled')
  const [viewSubmissions, setViewSubmissions] = useState(false)
  const [requireTeamName, setRequireTeamName] = useState(false)

  useEffect(() => {
    setVisibility(configValues['challenge_visibility'] ?? 'public')
    setScoreVisibility(configValues['score_visibility'] ?? 'public')
    setAccountVisibility(configValues['account_visibility'] ?? 'public')
    setFreeze(configValues['freeze'] ?? '')
    setRatings(configValues['challenge_ratings'] ?? 'disabled')
    setViewSubmissions(configValues['view_self_submissions'] === 'true')
    setRequireTeamName(configValues['require_team_name'] === 'true')
  }, [configValues])

  function handleSave() {
    onUpdate([
      { key: 'challenge_visibility', value: visibility },
      { key: 'score_visibility', value: scoreVisibility },
      { key: 'account_visibility', value: accountVisibility },
      { key: 'freeze', value: freeze },
      { key: 'challenge_ratings', value: ratings },
      { key: 'view_self_submissions', value: viewSubmissions },
      { key: 'require_team_name', value: requireTeamName },
    ])
  }

  return (
    <ConfigSection
      title="Challenges"
      description="Challenge visibility and scoring settings"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="space-y-2">
        <Label htmlFor="challenge_visibility">Challenge Visibility</Label>
        <Select value={visibility} onValueChange={setVisibility}>
          <SelectTrigger id="challenge_visibility">
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
        <Label htmlFor="score_visibility">Score Visibility</Label>
        <Select value={scoreVisibility} onValueChange={setScoreVisibility}>
          <SelectTrigger id="score_visibility">
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
        <Label htmlFor="account_visibility">Account Visibility</Label>
        <Select value={accountVisibility} onValueChange={setAccountVisibility}>
          <SelectTrigger id="account_visibility">
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
        <Label htmlFor="freeze">Freeze Time (ISO 8601)</Label>
        <Input
          id="freeze"
          type="datetime-local"
          value={freeze}
          onChange={(e) => setFreeze(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="challenge_ratings">Challenge Ratings</Label>
        <Select value={ratings} onValueChange={setRatings}>
          <SelectTrigger id="challenge_ratings">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="disabled">Disabled</SelectItem>
            <SelectItem value="enabled">Enabled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="view_self_submissions">View Self Submissions</Label>
        <Switch
          id="view_self_submissions"
          checked={viewSubmissions}
          onCheckedChange={setViewSubmissions}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="require_team_name">Require Team Name</Label>
        <Switch
          id="require_team_name"
          checked={requireTeamName}
          onCheckedChange={setRequireTeamName}
        />
      </div>
    </ConfigSection>
  )
}
