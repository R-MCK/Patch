import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Sun, CloudSun, Cloud, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { usePlantStore } from '@/stores/plantStore'

const sunIcons = {
  full: Sun,
  partial: CloudSun,
  shade: Cloud,
}

export function PlantList() {
  const { plants, fetchPlants, isLoading, error } = usePlantStore()

  useEffect(() => {
    fetchPlants()
  }, [fetchPlants])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight text-earth-900">Plant Tracker</h1>
          <p className="text-earth-600/80 font-medium">Manage your plants</p>
        </div>
        <Link to="/plants/new">
          <Button className="rounded-full shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <Plus className="h-4 w-4 mr-2" />
            Add Plant
          </Button>
        </Link>
      </div>

      {plants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-earth-600/80 font-medium mb-4">No plants yet</p>
            <Link to="/plants/new">
              <Button className="rounded-full shadow-sm hover:shadow-md transition-all">Add Your First Plant</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => {
            const SunIcon = plant.sunRequirement
              ? sunIcons[plant.sunRequirement]
              : Sun

            return (
              <Link key={plant.id} to={`/plants/${plant.id}`}>
                <Card className="h-full transition-all duration-300 hover:bg-white/90 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 border-white/60 group animate-plant-bounce">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">{plant.name}</CardTitle>
                    {plant.scientificName && (
                      <CardDescription className="italic text-earth-600/70">
                        {plant.scientificName}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-earth-600 font-medium">
                      <div className="flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                        <SunIcon className="h-4 w-4" />
                        <span className="capitalize">{plant.sunRequirement || 'Unknown'}</span>
                      </div>
                      {plant.wateringFrequency && (
                        <div className="flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                          <Droplets className="h-4 w-4" />
                          <span>Every {plant.wateringFrequency}d</span>
                        </div>
                      )}
                    </div>
                    {plant.description && (
                      <p className="mt-4 text-sm text-earth-600/80 line-clamp-2">
                        {plant.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
