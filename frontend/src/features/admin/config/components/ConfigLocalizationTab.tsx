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

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: 'Chinese' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'es', label: 'Spanish' },
]

export function ConfigLocalizationTab({ configValues, onUpdate, isPending }: Props) {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    setLanguage(configValues['language'] ?? 'en')
  }, [configValues])

  function handleSave() {
    onUpdate([{ key: 'language', value: language }])
  }

  return (
    <ConfigSection
      title="Localization"
      description="Language and locale settings"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger id="language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </ConfigSection>
  )
}
