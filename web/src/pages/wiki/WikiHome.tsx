import { Link } from 'react-router-dom'
import { Flower2, TreeDeciduous, Salad, Apple, Shrub, Sprout } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const categories = [
  { slug: 'vegetables', name: 'Vegetables', icon: Salad, count: 45, description: 'Common garden vegetables' },
  { slug: 'fruits', name: 'Fruits', icon: Apple, count: 32, description: 'Fruit-bearing plants and trees' },
  { slug: 'herbs', name: 'Herbs', icon: Sprout, count: 28, description: 'Culinary and medicinal herbs' },
  { slug: 'flowers', name: 'Flowers', icon: Flower2, count: 56, description: 'Ornamental flowering plants' },
  { slug: 'trees', name: 'Trees', icon: TreeDeciduous, count: 24, description: 'Trees for home landscapes' },
  { slug: 'shrubs', name: 'Shrubs', icon: Shrub, count: 18, description: 'Bushes and shrubs' },
]

export function WikiHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold font-display tracking-tight text-earth-900">Plant Wiki</h1>
        <p className="text-earth-600/80 font-medium">
          Browse our comprehensive plant database
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.slug} to={`/wiki/${category.slug}`}>
            <Card className="h-full transition-all duration-300 hover:bg-white/90 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 border-white/60 group animate-plant-bounce">
              <CardHeader>
                <category.icon className="h-10 w-10 text-primary mb-3 transition-transform duration-500 ease-out group-hover:scale-125 group-hover:animate-sway drop-shadow-sm" />
                <CardTitle className="flex items-center justify-between group-hover:text-primary transition-colors">
                  {category.name}
                  <span className="text-sm font-medium text-earth-500/80 bg-earth-100/50 px-2 py-0.5 rounded-full">
                    {category.count} entries
                  </span>
                </CardTitle>
                <CardDescription className="font-medium text-earth-600/80 mt-2">{category.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
