import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute'

import { DashboardMap } from '@/redesign/pages/DashboardMap'
import { DashboardAlmanac } from '@/redesign/pages/DashboardAlmanac'
import { DashboardSeasons } from '@/redesign/pages/DashboardSeasons'
import { PlantTrackerPackets } from '@/redesign/pages/PlantTrackerPackets'
import { PlantTrackerLedger } from '@/redesign/pages/PlantTrackerLedger'
import { PlantSpread } from '@/redesign/pages/PlantSpread'
import { GardenDesigner } from '@/redesign/pages/GardenDesigner'
import { Today } from '@/redesign/pages/Today'
import { Capture } from '@/redesign/pages/Capture'
import { Ask } from '@/redesign/pages/Ask'
import { Plan } from '@/redesign/pages/Plan'
import { Onboarding } from '@/redesign/pages/Onboarding'
import { ZoneDetail } from '@/redesign/pages/ZoneDetail'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { Profile } from '@/pages/auth/Profile'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'

function OnboardingGate() {
  const location = useLocation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const profile = useProfileStore((s) => s.profile)
  const hasLoaded = useProfileStore((s) => s.hasLoaded)
  const isLoading = useProfileStore((s) => s.isLoading)
  const onboardingSkipped = useProfileStore((s) => s.onboardingSkipped)
  const fetchProfile = useProfileStore((s) => s.fetchProfile)
  const resetProfileState = useProfileStore((s) => s.resetProfileState)

  useEffect(() => {
    if (isAuthenticated && !hasLoaded && !isLoading) {
      void fetchProfile()
      return
    }
    if (!isAuthenticated) {
      resetProfileState()
    }
  }, [isAuthenticated, hasLoaded, isLoading, fetchProfile, resetProfileState])

  if (!hasLoaded) {
    return (
      <div className="paper-bg" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}>
        <div className="stamp">{isLoading ? 'Opening profile' : 'Loading profile'}</div>
      </div>
    )
  }

  const isOnboardingRoute = location.pathname === '/onboarding'
  if (!profile && !onboardingSkipped && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />
  }
  if ((profile || onboardingSkipped) && isOnboardingRoute) {
    return <Navigate to="/today" replace />
  }

  return <Outlet />
}

function App() {
  const restoreAuth = useAuthStore((s) => s.restoreAuth)

  useEffect(() => {
    void restoreAuth()
  }, [restoreAuth])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<OnboardingGate />}>
              <Route path="/" element={<Navigate to="/today" replace />} />
              <Route path="/today" element={<Today />} />
              <Route path="/capture" element={<Capture />} />
              <Route path="/ask" element={<Ask />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/onboarding" element={<Onboarding />} />

              <Route path="/dashboard/map" element={<DashboardMap />} />
              <Route path="/dashboard/almanac" element={<DashboardAlmanac />} />
              <Route path="/dashboard/seasons" element={<DashboardSeasons />} />

              <Route path="/plants" element={<PlantTrackerPackets />} />
              <Route path="/plants/ledger" element={<PlantTrackerLedger />} />
              <Route path="/plants/:id" element={<PlantSpread />} />

              <Route path="/design" element={<GardenDesigner />} />
              <Route path="/design/:id" element={<GardenDesigner />} />
              <Route path="/gardens/:gardenId/zones/:zoneId" element={<ZoneDetail />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="*" element={<Navigate to="/today" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
