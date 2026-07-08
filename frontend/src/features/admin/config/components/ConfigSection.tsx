import { type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'

interface ConfigSectionProps {
  title: string
  description?: string
  isPending?: boolean
  onSave?: () => void
  children: ReactNode
}

export function ConfigSection({
  title,
  description,
  isPending,
  onSave,
  children,
}: ConfigSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <Separator />
      <div className="space-y-4">{children}</div>
      {onSave && (
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      )}
    </div>
  )
}
