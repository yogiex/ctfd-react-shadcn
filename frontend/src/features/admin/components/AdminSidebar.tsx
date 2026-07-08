import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Shield,
  Flag,
  Trophy,
  ClipboardList,
  Settings,
  FileText,
  Bell,
  RotateCcw,
  Activity,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface NavItem {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: ROUTES.ADMIN_CHALLENGES, icon: Flag, label: 'Challenges' },
  { to: ROUTES.ADMIN_USERS, icon: Users, label: 'Users' },
  { to: ROUTES.ADMIN_TEAMS, icon: Shield, label: 'Teams' },
  { to: ROUTES.ADMIN_SCOREBOARD, icon: Trophy, label: 'Scoreboard' },
  { to: ROUTES.ADMIN_STATISTICS, icon: Activity, label: 'Statistics' },
  { to: ROUTES.ADMIN_SUBMISSIONS, icon: ClipboardList, label: 'Submissions' },
  { to: ROUTES.ADMIN_CONFIG, icon: Settings, label: 'Config' },
  { to: ROUTES.ADMIN_PAGES, icon: FileText, label: 'Pages' },
  { to: ROUTES.ADMIN_NOTIFICATIONS, icon: Bell, label: 'Notifications' },
  { to: ROUTES.ADMIN_RESET, icon: RotateCcw, label: 'Reset' },
]

function SidebarNav({ onNavClick }: { onNavClick?: () => void }) {
  const { pathname } = useLocation()

  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.end
          ? pathname === item.to
          : pathname.startsWith(item.to)

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
            {isActive && (
              <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  return (
    <>
      <aside className="hidden md:flex md:flex-col md:w-56 md:border-r md:bg-background md:h-screen md:sticky md:top-0">
        <div className="flex h-14 items-center border-b px-4">
          <Link to="/admin" className="font-bold text-lg tracking-tight">
            CTFd Admin
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <SidebarNav />
        </ScrollArea>
      </aside>

      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-56 p-0">
          <SheetHeader className="h-14 border-b px-4 flex-row items-center space-y-0">
            <SheetTitle className="text-lg font-bold">CTFd Admin</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 h-[calc(100vh-3.5rem)]">
            <SidebarNav onNavClick={onClose} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
