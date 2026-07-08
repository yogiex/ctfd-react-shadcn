import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfigSection } from './ConfigSection'
import { Upload } from 'lucide-react'

interface Props {
  configValues: Record<string, string>
  onUpdate: (configs: { key: string; value: unknown }[]) => void
  isPending: boolean
}

export function ConfigLogoTab({ configValues, onUpdate, isPending }: Props) {
  const logoRef = useRef<HTMLInputElement>(null)
  const iconRef = useRef<HTMLInputElement>(null)
  const faviconRef = useRef<HTMLInputElement>(null)

  function handleUpload(ref: React.RefObject<HTMLInputElement | null>, key: string) {
    const file = ref.current?.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('key', key)

    const reader = new FileReader()
    reader.onload = () => {
      onUpdate([{ key, value: reader.result }])
    }
    reader.readAsDataURL(file)
  }

  return (
    <ConfigSection
      title="Logo & Icon"
      description="Upload CTFd branding images"
      isPending={isPending}
      onSave={() => {
        if (logoRef.current?.files?.[0]) handleUpload(logoRef, 'ctf_logo')
        if (iconRef.current?.files?.[0]) handleUpload(iconRef, 'ctf_small_icon')
        if (faviconRef.current?.files?.[0]) handleUpload(faviconRef, 'favicon')
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Logo</Label>
          {configValues['ctf_logo'] && (
            <img
              src={configValues['ctf_logo']}
              alt="Logo preview"
              className="max-h-20 rounded border object-contain"
            />
          )}
          <div className="flex items-center gap-2">
            <Input ref={logoRef} type="file" accept="image/*" className="hidden" />
            <Button
              variant="outline"
              onClick={() => logoRef.current?.click()}
              type="button"
            >
              <Upload className="h-4 w-4" /> Upload Logo
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Small Icon</Label>
          {configValues['ctf_small_icon'] && (
            <img
              src={configValues['ctf_small_icon']}
              alt="Icon preview"
              className="max-h-12 rounded border object-contain"
            />
          )}
          <div className="flex items-center gap-2">
            <Input ref={iconRef} type="file" accept="image/*" className="hidden" />
            <Button
              variant="outline"
              onClick={() => iconRef.current?.click()}
              type="button"
            >
              <Upload className="h-4 w-4" /> Upload Icon
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Favicon</Label>
          {configValues['favicon'] && (
            <img
              src={configValues['favicon']}
              alt="Favicon preview"
              className="max-h-8 rounded border object-contain"
            />
          )}
          <div className="flex items-center gap-2">
            <Input ref={faviconRef} type="file" accept="image/*" className="hidden" />
            <Button
              variant="outline"
              onClick={() => faviconRef.current?.click()}
              type="button"
            >
              <Upload className="h-4 w-4" /> Upload Favicon
            </Button>
          </div>
        </div>
      </div>
    </ConfigSection>
  )
}
