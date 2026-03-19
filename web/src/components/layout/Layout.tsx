import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { FloatingLeavesBackground } from '../animations/FloatingLeavesBackground'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-leaf-50 to-earth-100 font-sans text-foreground selection:bg-primary/20 relative">
      <FloatingLeavesBackground />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:pl-64 relative z-10">
        <div className="container mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
