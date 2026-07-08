import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfigSection } from './ConfigSection'
import { api } from '@/lib/api/client'
import { Download, Upload, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function ConfigBackupTab() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const blob = await api.get<Blob>('/configs/export', {
        headers: { Accept: 'application/octet-stream' },
      } as any)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ctfd-export-${Date.now()}.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: 'Export successful' })
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' })
    } finally {
      setExporting(false)
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('backup', file)
      await api.upload('/configs/import', formData)
      toast({ title: 'Import successful', description: 'CTFd configuration has been restored.' })
    } catch {
      toast({ title: 'Import failed', description: 'Check the backup file format.', variant: 'destructive' })
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <ConfigSection
      title="Backup"
      description="Export or import CTFd configuration and data"
    >
      <div className="space-y-4">
        <div>
          <Label>Export</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Download a backup of the entire CTFd instance.
          </p>
          <Button onClick={handleExport} disabled={exporting} variant="outline">
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export Backup
          </Button>
        </div>
        <div>
          <Label>Import</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Restore from a .zip or .json backup file.
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              variant="outline"
            >
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Import Backup
            </Button>
            <Input
              ref={fileRef}
              type="file"
              accept=".zip,.json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </div>
      </div>
    </ConfigSection>
  )
}
