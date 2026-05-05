import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useGardenStore } from '@/stores/gardenStore'

export function GardenDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { gardens, deleteGarden } = useGardenStore()

  const garden = gardens.find((g) => g.id === id)

  if (!garden) {
    return (
      <div className="space-y-6">
        <Link to="/gardens">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gardens
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Garden not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this garden?')) {
      deleteGarden(garden.id)
      navigate('/gardens')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/gardens">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gardens
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link to={`/design/${garden.id}`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Layout
            </Button>
          </Link>
          <Link to={`/gardens/${garden.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
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
          <CardTitle className="text-3xl">{garden.name}</CardTitle>
          {garden.description && (
            <CardDescription className="text-lg">
              {garden.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Garden Plots</h3>
            {garden.plots.length === 0 ? (
              <p className="text-muted-foreground">
                No plots yet.{' '}
                <Link to={`/design/${garden.id}`} className="text-primary hover:underline">
                  Open the designer
                </Link>{' '}
                to add some.
              </p>
            ) : (
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {garden.plots.map((plot) => (
                  <div
                    key={plot.id}
                    className="p-3 rounded-md border bg-muted/50"
                  >
                    <p className="font-medium">{plot.label || `Plot ${plot.id}`}</p>
                    <p className="text-sm text-muted-foreground">
                      {plot.width}x{plot.height} at ({plot.x}, {plot.y})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
