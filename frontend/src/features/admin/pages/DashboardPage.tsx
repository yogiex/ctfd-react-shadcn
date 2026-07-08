import { useQuery } from '@tanstack/react-query'
import { Users, Shield, Flag, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { QUERY_KEYS, API_BASE } from '@/lib/constants'

async function fetchCount(endpoint: string): Promise<number> {
  const res = await fetch(`${API_BASE}${endpoint}?view=admin&per_page=1`, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })
  const json = await res.json()
  if (json.success && json.meta?.pagination?.total !== undefined) {
    return json.meta.pagination.total
  }
  if (Array.isArray(json.data)) {
    return json.data.length
  }
  return 0
}

function useCount(key: string, endpoint: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_COUNT(key),
    queryFn: () => fetchCount(endpoint),
    staleTime: 30_000,
  })
}

const statCards = [
  {
    title: 'Total Users',
    icon: Users,
    id: 'users',
    endpoint: '/users',
  },
  {
    title: 'Total Teams',
    icon: Shield,
    id: 'teams',
    endpoint: '/teams',
  },
  {
    title: 'Total Challenges',
    icon: Flag,
    id: 'challenges',
    endpoint: '/challenges',
  },
  {
    title: 'Total Submissions',
    icon: ClipboardList,
    id: 'submissions',
    endpoint: '/submissions',
  },
] as const

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your CTF instance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>
    </div>
  )
}

function StatCard({
  title,
  icon: Icon,
  endpoint,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  id: string
  endpoint: string
}) {
  const { data, isLoading, isError } = useCount(title, endpoint)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : isError ? (
          <p className="text-sm text-destructive">Failed to load</p>
        ) : (
          <p className="text-2xl font-bold">{data ?? 0}</p>
        )}
      </CardContent>
    </Card>
  )
}
