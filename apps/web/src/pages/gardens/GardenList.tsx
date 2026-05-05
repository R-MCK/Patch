import { Link } from 'react-router-dom'
import { Plus, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useGardenStore } from '@/stores/gardenStore'

export function GardenList() {
  const { gardens } = useGardenStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight text-earth-900">My Gardens</h1>
          <p className="text-earth-600/80 font-medium">Manage your garden layouts</p>
        </div>
        <Link to="/gardens/new">
          <Button className="rounded-full shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <Plus className="h-4 w-4 mr-2" />
            New Garden
          </Button>
        </Link>
      </div>

      {gardens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Map className="h-16 w-16 text-primary/40 mb-4 animate-sway" />
            <p className="text-earth-600/80 font-medium mb-4">No gardens yet</p>
            <Link to="/gardens/new">
              <Button className="rounded-full shadow-sm hover:shadow-md transition-all">Create Your First Garden</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gardens.map((garden) => (
            <Link key={garden.id} to={`/gardens/${garden.id}`}>
              <Card className="h-full transition-all duration-300 hover:bg-white/90 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 border-white/60 group animate-plant-bounce">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">{garden.name}</CardTitle>
                  {garden.description && (
                    <CardDescription className="text-earth-600/80 font-medium">{garden.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-earth-500 bg-earth-100/50 inline-flex px-3 py-1 rounded-full">
                    {garden.plots.length} plot{garden.plots.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
