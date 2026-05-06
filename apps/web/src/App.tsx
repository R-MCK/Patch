import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute'

import { DashboardMap } from '@/redesign/pages/DashboardMap'
import { DashboardAlmanac } from '@/redesign/pages/DashboardAlmanac'
import { DashboardSeasons } from '@/redesign/pages/DashboardSeasons'
import { PlantTrackerPackets } from '@/redesign/pages/PlantTrackerPackets'
import { PlantTrackerLedger } from '@/redesign/pages/PlantTrackerLedger'
import { PlantSpread } from '@/redesign/pages/PlantSpread'
import { GardenDesigner } from '@/redesign/pages/GardenDesigner'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { Profile } from '@/pages/auth/Profile'
import { useAuthStore } from '@/stores/authStore'

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
            <Route path="/" element={<DashboardMap />} />
            <Route path="/dashboard/almanac" element={<DashboardAlmanac />} />
            <Route path="/dashboard/seasons" element={<DashboardSeasons />} />

            <Route path="/plants" element={<PlantTrackerPackets />} />
            <Route path="/plants/ledger" element={<PlantTrackerLedger />} />
            <Route path="/plants/:id" element={<PlantSpread />} />

            <Route path="/design" element={<GardenDesigner />} />
            <Route path="/design/:id" element={<GardenDesigner />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="*" element={<DashboardMap />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
