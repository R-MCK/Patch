import { Link } from 'react-router-dom'
import { Leaf, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <header className="sticky top-4 z-50 w-full mx-auto max-w-7xl px-4 mb-4">
      <div className="flex h-16 items-center px-6 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <Link to="/" className="flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-primary animate-sway" />
          <span className="font-bold text-xl text-primary font-display tracking-tight">Patch</span>
        </Link>

        <div className="flex-1" />

        <nav className="flex items-center space-x-2">
          {isAuthenticated ? (
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:bg-white/50">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">{user?.name}</span>
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm" className="rounded-full shadow-sm hover:shadow-md transition-shadow">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
