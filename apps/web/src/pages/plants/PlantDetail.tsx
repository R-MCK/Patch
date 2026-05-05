import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { usePlantStore } from '@/stores/plantStore'

export function PlantDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { plants, deletePlant } = usePlantStore()

  const plant = plants.find((p) => p.id === id)

  if (!plant) {
    return (
      <div className="space-y-6">
        <Link to="/plants">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plants
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Plant not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this plant?')) {
      deletePlant(plant.id)
      navigate('/plants')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/plants">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plants
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link to={`/plants/${plant.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{plant.name}</CardTitle>
          {plant.scientificName && (
            <CardDescription className="text-lg italic">
              {plant.scientificName}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {plant.description && (
            <div>
              <h3 className="font-medium mb-1">Description</h3>
              <p className="text-muted-foreground">{plant.description}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-1">Sun Requirement</h3>
              <p className="text-muted-foreground capitalize">
                {plant.sunRequirement || 'Not specified'}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Watering Frequency</h3>
              <p className="text-muted-foreground">
                {plant.wateringFrequency
                  ? `Every ${plant.wateringFrequency} days`
                  : 'Not specified'}
              </p>
            </div>
          </div>

          {plant.notes && (
            <div>
              <h3 className="font-medium mb-1">Notes</h3>
              <p className="text-muted-foreground">{plant.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
