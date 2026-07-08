import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth, useTheme } from '@/contexts'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sun, Moon, LogOut, User, Flag, Trophy, Users, Shield, Settings } from 'lucide-react'

export function MainLayout() {
  const { isAuthenticated, isAdmin, user, userMode, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-bold text-lg">
              CTFd
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                to="/challenges"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Flag className="h-4 w-4" />
                Challenges
              </Link>
              <Link
                to="/scoreboard"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trophy className="h-4 w-4" />
                Scoreboard
              </Link>
              <Link
                to={`/${userMode === 'teams' ? 'teams' : 'users'}`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Users className="h-4 w-4" />
                {userMode === 'teams' ? 'Teams' : 'Users'}
              </Link>
              {isAdmin && (
                <>
                  <Separator orientation="vertical" className="h-5" />
                  <Link
                    to="/admin/challenges"
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
