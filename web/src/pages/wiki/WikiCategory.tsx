import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const mockEntries: Record<string, Array<{ id: string; title: string; description: string }>> = {
  vegetables: [
    { id: 'tomato', title: 'Tomato', description: 'A popular garden vegetable in the nightshade family' },
    { id: 'pepper', title: 'Pepper', description: 'Bell peppers and hot peppers for cooking' },
    { id: 'cucumber', title: 'Cucumber', description: 'Cool, refreshing vining vegetable' },
    { id: 'carrot', title: 'Carrot', description: 'Root vegetable rich in beta-carotene' },
  ],
  herbs: [
    { id: 'basil', title: 'Basil', description: 'Aromatic herb essential for Italian cuisine' },
    { id: 'mint', title: 'Mint', description: 'Refreshing herb for drinks and desserts' },
    { id: 'rosemary', title: 'Rosemary', description: 'Woody herb perfect for roasts' },
  ],
  flowers: [
    { id: 'rose', title: 'Rose', description: 'Classic flowering shrub with fragrant blooms' },
    { id: 'sunflower', title: 'Sunflower', description: 'Tall annual with bright yellow flowers' },
    { id: 'lavender', title: 'Lavender', description: 'Fragrant purple flowers, great for pollinators' },
  ],
}

export function WikiCategory() {
  const { category } = useParams<{ category: string }>()
  const entries = category ? mockEntries[category] || [] : []
  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : ''

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/wiki">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Wiki
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{categoryName}</h1>
        <p className="text-muted-foreground">
          {entries.length} entries in this category
        </p>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No entries yet</CardTitle>
            <CardDescription>
              This category doesn't have any entries yet.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Link key={entry.id} to={`/wiki/${category}/${entry.id}`}>
              <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader>
                  <CardTitle>{entry.title}</CardTitle>
                  <CardDescription>{entry.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
