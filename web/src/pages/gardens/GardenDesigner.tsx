import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useGardenStore } from '@/stores/gardenStore'

export function GardenDesigner() {
  const { id } = useParams<{ id: string }>()
  const { gardens } = useGardenStore()

  const isNew = id === 'new'
  const garden = !isNew ? gardens.find((g) => g.id === id) : null

  if (!isNew && !garden) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={garden ? `/gardens/${garden.id}` : '/gardens'}>
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Plot
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isNew ? 'New Garden Design' : `Designing: ${garden?.name}`}
          </CardTitle>
          <CardDescription>
            Click and drag to create garden plots. This is a placeholder for the full designer canvas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for garden designer canvas */}
          <div className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">Garden Designer Canvas</p>
              <p className="text-sm">Full interactive designer coming in Sprint 19</p>
              {garden && garden.plots.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2 max-w-md mx-auto">
                  {garden.plots.map((plot) => (
                    <div
                      key={plot.id}
                      className="p-2 rounded bg-primary/20 text-primary text-xs"
                      style={{
                        gridColumn: `span ${plot.width}`,
                        gridRow: `span ${plot.height}`,
                      }}
                    >
                      {plot.label || 'Plot'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
