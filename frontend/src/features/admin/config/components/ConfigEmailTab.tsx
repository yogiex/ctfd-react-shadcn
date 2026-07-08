import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ConfigSection } from './ConfigSection'
import { api } from '@/lib/api/client'
import { Mail } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Props {
  configValues: Record<string, string>
  onUpdate: (configs: { key: string; value: unknown }[]) => void
  isPending: boolean
}

export function ConfigEmailTab({ configValues, onUpdate, isPending }: Props) {
  const [fromAddr, setFromAddr] = useState('')
  const [server, setServer] = useState('')
  const [port, setPort] = useState('25')
  const [useTls, setUseTls] = useState(false)
  const [useSsl, setUseSsl] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    setFromAddr(configValues['mailfrom_addr'] ?? '')
    setServer(configValues['mail_server'] ?? '')
    setPort(configValues['mail_port'] ?? '25')
    setUseTls(configValues['mail_use_tls'] === 'true')
    setUseSsl(configValues['mail_use_ssl'] === 'true')
    setUsername(configValues['mail_username'] ?? '')
    setPassword(configValues['mail_password'] ?? '')
  }, [configValues])

  function handleSave() {
    onUpdate([
      { key: 'mailfrom_addr', value: fromAddr },
      { key: 'mail_server', value: server },
      { key: 'mail_port', value: Number(port) },
      { key: 'mail_use_tls', value: useTls },
      { key: 'mail_use_ssl', value: useSsl },
      { key: 'mail_username', value: username },
      { key: 'mail_password', value: password },
    ])
  }

  async function handleTest() {
    setTesting(true)
    try {
      await api.post('/configs/email/test')
      toast({ title: 'Test email sent', description: 'Check the configured inbox.' })
    } catch {
      toast({ title: 'Test failed', description: 'Could not send test email.', variant: 'destructive' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <ConfigSection
      title="Email"
      description="SMTP email server configuration"
      isPending={isPending}
      onSave={handleSave}
    >
      <div className="space-y-2">
        <Label htmlFor="mailfrom_addr">From Address</Label>
        <Input
          id="mailfrom_addr"
          type="email"
          value={fromAddr}
          onChange={(e) => setFromAddr(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mail_server">SMTP Server</Label>
        <Input
          id="mail_server"
          value={server}
          onChange={(e) => setServer(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mail_port">SMTP Port</Label>
        <Input
          id="mail_port"
          type="number"
          value={port}
          onChange={(e) => setPort(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="mail_use_tls">Use TLS</Label>
        <Switch id="mail_use_tls" checked={useTls} onCheckedChange={setUseTls} />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="mail_use_ssl">Use SSL</Label>
        <Switch id="mail_use_ssl" checked={useSsl} onCheckedChange={setUseSsl} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mail_username">SMTP Username</Label>
        <Input
          id="mail_username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mail_password">SMTP Password</Label>
        <Input
          id="mail_password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button variant="outline" onClick={handleTest} disabled={testing}>
        <Mail className="h-4 w-4" />
        {testing ? 'Sending...' : 'Test Email'}
      </Button>
    </ConfigSection>
  )
}
