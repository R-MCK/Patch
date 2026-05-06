import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

function RouteLoader() {
  return (
    <div className="paper-bg" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}>
      <div className="stamp">Opening Patch</div>
    </div>
  )
}

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const hasRestored = useAuthStore((s) => s.hasRestored)

  if (isLoading || !hasRestored) return <RouteLoader />

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const hasRestored = useAuthStore((s) => s.hasRestored)

  if (isLoading || !hasRestored) return <RouteLoader />

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}
