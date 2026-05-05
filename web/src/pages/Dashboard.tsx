import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, BookOpen, Map, Pencil } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { usePlantStore } from '@/stores/plantStore'
import { useGardenStore } from '@/stores/gardenStore'

const quickLinks = [
  { to: '/plants', icon: Leaf, label: 'Plant Tracker', description: 'Track and manage your plants' },
  { to: '/wiki', icon: BookOpen, label: 'Plant Wiki', description: 'Browse plant information' },
  { to: '/gardens', icon: Map, label: 'My Gardens', description: 'View and edit your gardens' },
  { to: '/design/new', icon: Pencil, label: 'Garden Designer', description: 'Design a new garden layout' },
]

export function Dashboard() {
  const plants = usePlantStore((state) => state.plants)
  const fetchPlants = usePlantStore((state) => state.fetchPlants)
  const { gardens } = useGardenStore()

  useEffect(() => {
    fetchPlants()
  }, [fetchPlants])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-earth-900 font-display tracking-tight">Welcome to Patch</h1>
        <p className="text-earth-600/80 mt-2 font-medium">
          Your personal gardening companion
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-earth-600">Total Plants</CardDescription>
            <CardTitle className="text-5xl text-leaf-600 drop-shadow-sm">{plants.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-earth-600">Gardens</CardDescription>
            <CardTitle className="text-5xl text-leaf-600 drop-shadow-sm">{gardens.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-earth-600">Need Watering</CardDescription>
            <CardTitle className="text-5xl text-blue-500 drop-shadow-sm">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-earth-600">Tasks Today</CardDescription>
            <CardTitle className="text-5xl text-orange-500 drop-shadow-sm">0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-earth-800 font-display">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Card className="h-full transition-all duration-300 hover:bg-white/90 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 group flex flex-col justify-center animate-plant-bounce border-white/60">
                <CardHeader>
                  <link.icon className="h-10 w-10 text-primary mb-3 transition-transform duration-500 ease-out group-hover:scale-125 group-hover:animate-sway drop-shadow-sm" />
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{link.label}</CardTitle>
                  <CardDescription className="font-medium">{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
