import { useState, useEffect } from 'react'
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

const THEMES = ['core', 'admin', 'telkom-university']

export function ConfigThemeTab({ configValues, onUpdate, isPending }: Props) {
  const [themeColor, setThemeColor] = useState('')
  const [header, setHeader] = useState('')
  const [footer, setFooter] = useState('')

  useEffect(() => {
    setThemeColor(configValues['theme_color'] ?? 'core')
    setHeader(configValues['theme_header'] ?? '')
    setFooter(configValues['theme_footer'] ?? '')
  }, [configValues])

  function handleSave() {
    onUpdate([
      { key: 'theme_color', value: themeColor },
      { key: 'theme_header', value: header },
      { key: 'theme_footer', value: footer },
    ])
  }

  return (
    <ConfigSection
      title="Theme"
      description="Configure the CTFd appearance"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="space-y-2">
        <Label htmlFor="theme_color">Theme</Label>
        <Select value={themeColor} onValueChange={setThemeColor}>
          <SelectTrigger id="theme_color">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEMES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="theme_header">Header HTML</Label>
        <Textarea
          id="theme_header"
          value={header}
          onChange={(e) => setHeader(e.target.value)}
          className="font-mono text-xs"
          rows={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="theme_footer">Footer HTML</Label>
        <Textarea
          id="theme_footer"
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          className="font-mono text-xs"
          rows={6}
        />
      </div>
    </ConfigSection>
  )
}
