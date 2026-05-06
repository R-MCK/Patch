import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'

import { DashboardMap } from '@/redesign/pages/DashboardMap'
import { DashboardAlmanac } from '@/redesign/pages/DashboardAlmanac'
import { DashboardSeasons } from '@/redesign/pages/DashboardSeasons'
import { PlantTrackerPackets } from '@/redesign/pages/PlantTrackerPackets'
import { PlantTrackerLedger } from '@/redesign/pages/PlantTrackerLedger'
import { PlantSpread } from '@/redesign/pages/PlantSpread'
import { GardenDesigner } from '@/redesign/pages/GardenDesigner'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardMap />} />
          <Route path="/dashboard/almanac" element={<DashboardAlmanac />} />
          <Route path="/dashboard/seasons" element={<DashboardSeasons />} />

          <Route path="/plants" element={<PlantTrackerPackets />} />
          <Route path="/plants/ledger" element={<PlantTrackerLedger />} />
          <Route path="/plants/:id" element={<PlantSpread />} />

          <Route path="/design" element={<GardenDesigner />} />
          <Route path="/design/:id" element={<GardenDesigner />} />

          <Route path="*" element={<DashboardMap />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
