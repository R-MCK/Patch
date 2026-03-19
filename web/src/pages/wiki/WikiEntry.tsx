import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { mockWikiData } from '@/lib/wikiData'

export function WikiEntry() {
  const { category, id } = useParams<{ category: string; id: string }>()
  const entry = id ? mockWikiData[id] : null

  if (!entry) {
    return (
      <div className="space-y-6">
        <Link to={`/wiki/${category}`}>
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {category}
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Entry not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link to={`/wiki/${category}`}>
        <Button variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {category}
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{entry.title}</CardTitle>
          <CardDescription className="text-lg italic">
            {entry.scientificName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {entry.content.split('\n').map((line, i) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return <h3 key={i} className="font-semibold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="ml-4">{line.substring(2)}</li>
              }
              if (line.trim() === '') {
                return <br key={i} />
              }
              return <p key={i}>{line}</p>
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
