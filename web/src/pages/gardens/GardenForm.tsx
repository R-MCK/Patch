import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useGardenStore } from '@/stores/gardenStore'

export function GardenForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { gardens, addGarden, updateGarden } = useGardenStore()

  const isEditing = !!id && id !== 'new'
  const garden = isEditing ? gardens.find((g) => g.id === id) : null

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const gardenData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
    }

    if (isEditing && garden) {
      updateGarden(garden.id, gardenData)
      navigate(`/gardens/${garden.id}`)
    } else {
      const newGarden = {
        ...gardenData,
        id: Date.now().toString(),
        plots: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      addGarden(newGarden)
      navigate(`/design/${newGarden.id}`)
    }
  }

  return (
    <div className="space-y-6">
      <Link to={isEditing ? `/gardens/${id}` : '/gardens'}>
        <Button variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Garden' : 'Create New Garden'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Garden Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={garden?.name}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g., Backyard Vegetable Garden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={garden?.description}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Describe your garden..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Link to={isEditing ? `/gardens/${id}` : '/gardens'}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Create Garden'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
