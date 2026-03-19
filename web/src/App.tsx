import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Pages
import { Dashboard } from '@/pages/Dashboard'
import { PlantList } from '@/pages/plants/PlantList'
import { PlantDetail } from '@/pages/plants/PlantDetail'
import { PlantForm } from '@/pages/plants/PlantForm'
import { WikiHome } from '@/pages/wiki/WikiHome'
import { WikiCategory } from '@/pages/wiki/WikiCategory'
import { WikiEntry } from '@/pages/wiki/WikiEntry'
import { GardenList } from '@/pages/gardens/GardenList'
import { GardenDetail } from '@/pages/gardens/GardenDetail'
import { GardenForm } from '@/pages/gardens/GardenForm'
import { GardenDesigner } from '@/pages/gardens/GardenDesigner'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { Profile } from '@/pages/auth/Profile'

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        {/* Auth routes (no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main app routes (with layout, protected) */}
        <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />

          {/* Plants */}
          <Route path="/plants" element={<PlantList />} />
          <Route path="/plants/new" element={<PlantForm />} />
          <Route path="/plants/:id" element={<PlantDetail />} />
          <Route path="/plants/:id/edit" element={<PlantForm />} />

          {/* Wiki */}
          <Route path="/wiki" element={<WikiHome />} />
          <Route path="/wiki/:category" element={<WikiCategory />} />
          <Route path="/wiki/:category/:id" element={<WikiEntry />} />

          {/* Gardens */}
          <Route path="/gardens" element={<GardenList />} />
          <Route path="/gardens/new" element={<GardenForm />} />
          <Route path="/gardens/:id" element={<GardenDetail />} />
          <Route path="/gardens/:id/edit" element={<GardenForm />} />

          {/* Garden Designer */}
          <Route path="/design/:id" element={<GardenDesigner />} />

          {/* Profile */}
          <Route path="/profile" element={<Profile />} />
        </Route>
        </Route>
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
