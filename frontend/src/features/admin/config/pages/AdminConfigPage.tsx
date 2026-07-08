import { useCallback, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useConfigs, useUpdateConfigs } from '../hooks/useAdminConfig'
import { ConfigGeneralTab } from '../components/ConfigGeneralTab'
import { ConfigThemeTab } from '../components/ConfigThemeTab'
import { ConfigAccountsTab } from '../components/ConfigAccountsTab'
import { ConfigBracketsTab } from '../components/ConfigBracketsTab'
import { ConfigChallengesTab } from '../components/ConfigChallengesTab'
import { ConfigTimeTab } from '../components/ConfigTimeTab'
import { ConfigEmailTab } from '../components/ConfigEmailTab'
import { ConfigLegalTab } from '../components/ConfigLegalTab'
import { ConfigSocialTab } from '../components/ConfigSocialTab'
import { ConfigBackupTab } from '../components/ConfigBackupTab'
import { ConfigLogoTab } from '../components/ConfigLogoTab'
import { ConfigVisibilityTab } from '../components/ConfigVisibilityTab'
import { ConfigLocalizationTab } from '../components/ConfigLocalizationTab'
import { ConfigFieldsTab } from '../components/ConfigFieldsTab'
import { ConfigRegistrationCodeTab } from '../components/ConfigRegistrationCodeTab'
import { ConfigMLCTab } from '../components/ConfigMLCTab'
import { ConfigPauseTab } from '../components/ConfigPauseTab'
import { ConfigRobotsTab } from '../components/ConfigRobotsTab'
import { ConfigSanitizeTab } from '../components/ConfigSanitizeTab'
import { toast } from '@/hooks/use-toast'

const TABS = [
  { value: 'general', label: 'General' },
  { value: 'theme', label: 'Theme' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'brackets', label: 'Brackets' },
  { value: 'challenges', label: 'Challenges' },
  { value: 'time', label: 'Time' },
  { value: 'email', label: 'Email' },
  { value: 'legal', label: 'Legal' },
  { value: 'social', label: 'Social' },
  { value: 'backup', label: 'Backup' },
  { value: 'logo', label: 'Logo' },
  { value: 'visibility', label: 'Visibility' },
  { value: 'localization', label: 'Localization' },
  { value: 'fields', label: 'Fields' },
  { value: 'registration_code', label: 'Reg. Code' },
  { value: 'mlc', label: 'MLC' },
  { value: 'pause', label: 'Pause' },
  { value: 'robots', label: 'Robots' },
  { value: 'sanitize', label: 'Sanitize' },
] as const

export function AdminConfigPage() {
  const { data: configs, isLoading } = useConfigs()
  const updateConfigs = useUpdateConfigs()

  const configValues = useMemo(() => {
    const map: Record<string, string> = {}
    if (configs) {
      for (const c of configs) {
        map[c.key] = c.value !== null && c.value !== undefined ? String(c.value) : ''
      }
    }
    return map
  }, [configs])

  const handleUpdate = useCallback(
    async (entries: { key: string; value: unknown }[]) => {
      try {
        await updateConfigs.mutateAsync(entries)
        toast({ title: 'Settings saved' })
      } catch {
        toast({ title: 'Failed to save settings', variant: 'destructive' })
      }
    },
    [updateConfigs]
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage CTFd instance settings
          </p>
        </div>
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          Loading configuration...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage CTFd instance settings
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-10 w-max">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="whitespace-nowrap">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value="general" className="mt-6">
          <ConfigGeneralTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="theme" className="mt-6">
          <ConfigThemeTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="accounts" className="mt-6">
          <ConfigAccountsTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="brackets" className="mt-6">
          <ConfigBracketsTab />
        </TabsContent>
        <TabsContent value="challenges" className="mt-6">
          <ConfigChallengesTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="time" className="mt-6">
          <ConfigTimeTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="email" className="mt-6">
          <ConfigEmailTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="legal" className="mt-6">
          <ConfigLegalTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="social" className="mt-6">
          <ConfigSocialTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="backup" className="mt-6">
          <ConfigBackupTab />
        </TabsContent>
        <TabsContent value="logo" className="mt-6">
          <ConfigLogoTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="visibility" className="mt-6">
          <ConfigVisibilityTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="localization" className="mt-6">
          <ConfigLocalizationTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="fields" className="mt-6">
          <ConfigFieldsTab />
        </TabsContent>
        <TabsContent value="registration_code" className="mt-6">
          <ConfigRegistrationCodeTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="mlc" className="mt-6">
          <ConfigMLCTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="pause" className="mt-6">
          <ConfigPauseTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="robots" className="mt-6">
          <ConfigRobotsTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
        <TabsContent value="sanitize" className="mt-6">
          <ConfigSanitizeTab
            configValues={configValues}
            onUpdate={handleUpdate}
            isPending={updateConfigs.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
