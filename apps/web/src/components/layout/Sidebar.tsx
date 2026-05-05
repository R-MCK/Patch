import { NavLink } from 'react-router-dom'
import { Home, Leaf, BookOpen, Map, Pencil, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
}

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/plants', icon: Leaf, label: 'Plant Tracker' },
  { to: '/wiki', icon: BookOpen, label: 'Plant Wiki' },
  { to: '/gardens', icon: Map, label: 'My Gardens' },
  { to: '/design/new', icon: Pencil, label: 'Garden Designer' },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-4 top-24 z-40 h-[calc(100vh-7rem)] w-64 rounded-3xl border border-white/40 bg-white/60 shadow-lg backdrop-blur-xl transition-transform duration-300 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-[120%]'
        )}
      >
        <div className="flex h-full flex-col p-2">
          {/* Mobile close button */}
          <div className="flex items-center justify-end p-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]'
                      : 'text-earth-800 hover:bg-white/50 hover:text-primary hover:scale-[1.02]'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto p-4 px-6 mb-2">
            <p className="text-xs font-medium text-earth-500/80 uppercase tracking-widest">
              Patch v0.1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
