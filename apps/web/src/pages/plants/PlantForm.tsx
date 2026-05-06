import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Leaf, Wand2, MapPin, Activity, Sun, Droplets, Calendar, AlignLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { usePlantStore } from '@/stores/plantStore'
import { getWikiRecommendations } from '@/lib/wikiData'
import type { Plant } from '@/types'

type PlantFormData = {
  name: string
  scientificName: string
  description: string
  location: string
  healthStatus: Plant['healthStatus']
  growthStage: Plant['growthStage']
  sunRequirement: Plant['sunRequirement'] | ''
  wateringFrequency: string
  plantedDate: string
  notes: string
}

const healthStatuses = ['excellent', 'good', 'fair', 'poor', 'critical'] as const
const growthStages = ['seedling', 'vegetative', 'flowering', 'fruiting', 'dormant', 'harvesting'] as const
const sunRequirements = ['full', 'partial', 'shade'] as const

function isHealthStatus(value: string): value is NonNullable<Plant['healthStatus']> {
  return healthStatuses.includes(value as NonNullable<Plant['healthStatus']>)
}

function isGrowthStage(value: string): value is NonNullable<Plant['growthStage']> {
  return growthStages.includes(value as NonNullable<Plant['growthStage']>)
}

function isSunRequirement(value: string): value is NonNullable<Plant['sunRequirement']> {
  return sunRequirements.includes(value as NonNullable<Plant['sunRequirement']>)
}

function toFormData(plant?: Plant | null): PlantFormData {
  return {
    name: plant?.name ?? '',
    scientificName: plant?.scientificName ?? '',
    description: plant?.description ?? '',
    location: plant?.location ?? '',
    healthStatus: plant?.healthStatus ?? 'good',
    growthStage: plant?.growthStage ?? 'seedling',
    sunRequirement: plant?.sunRequirement ?? '',
    wateringFrequency: plant?.wateringFrequency ? String(plant.wateringFrequency) : '',
    plantedDate: plant?.plantedDate ? new Date(plant.plantedDate).toISOString().split('T')[0] : '',
    notes: plant?.notes ?? ''
  }
}

export function PlantForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { plants, addPlant, updatePlant, isLoading } = usePlantStore()

  const isEditing = !!id
  const existingPlant = isEditing ? plants.find((p) => p.id === id) : null

  const [formOverrides, setFormOverrides] = useState<Partial<PlantFormData>>({})
  const formData = { ...toFormData(existingPlant), ...formOverrides }
  const [autofillSuccess, setAutofillSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormOverrides(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleAutofill = () => {
    const query = formData.scientificName || formData.name
    if (!query) return

    const recommendation = getWikiRecommendations(query)
    if (recommendation) {
      setFormOverrides(prev => ({
        ...prev,
        scientificName: recommendation.scientificName || prev.scientificName,
        description: prev.description || recommendation.content.split('\n')[0] || '',
        sunRequirement: recommendation.sunRequirement || prev.sunRequirement,
        wateringFrequency: recommendation.wateringFrequency ? String(recommendation.wateringFrequency) : prev.wateringFrequency
      }))
      setAutofillSuccess(true)
      setTimeout(() => setAutofillSuccess(false), 3000)
    } else {
      alert("No wiki recommendations found for this plant.")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const name = formData.name.trim()
    const wateringFrequency = Number.parseInt(formData.wateringFrequency, 10)
    const healthStatus = formData.healthStatus && isHealthStatus(formData.healthStatus)
      ? formData.healthStatus
      : 'good'
    const growthStage = formData.growthStage && isGrowthStage(formData.growthStage)
      ? formData.growthStage
      : 'seedling'
    const sunRequirement = formData.sunRequirement && isSunRequirement(formData.sunRequirement)
      ? formData.sunRequirement
      : undefined

    const plantData: Partial<Plant> = {
      name,
      scientificName: formData.scientificName || undefined,
      description: formData.description || undefined,
      location: formData.location || undefined,
      healthStatus,
      growthStage,
      sunRequirement,
      wateringFrequency: Number.isFinite(wateringFrequency) ? wateringFrequency : undefined,
      plantedDate: formData.plantedDate ? new Date(formData.plantedDate) : undefined,
      notes: formData.notes || undefined,
    }

    if (isEditing && existingPlant) {
      updatePlant(existingPlant.id, plantData)
      navigate(`/plants/${existingPlant.id}`)
    } else {
      const newPlant: Plant = {
        ...plantData,
        name,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      addPlant(newPlant)
      navigate('/plants')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <Link to={isEditing ? `/plants/${id}` : '/plants'}>
        <Button variant="ghost" className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <Leaf className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-earth-900">
            {isEditing ? 'Edit Plant' : 'Log a new plant'}
          </h1>
          <p className="text-earth-600/80">Enter your plant's details below.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info Card */}
        <Card className="border-earth-200/50 shadow-sm overflow-hidden">
          <div className="bg-earth-50/50 px-6 py-4 border-b border-earth-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-earth-800 font-semibold">
              <AlignLeft className="h-5 w-5 text-primary" />
              Basic Information
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAutofill}
              className="bg-primary/10 text-primary hover:bg-primary/20 border-0"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Autofill from Wiki
            </Button>
          </div>
          <CardContent className="p-6 space-y-4 bg-white">
            {autofillSuccess && (
              <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md border border-green-200 animate-in fade-in slide-in-from-top-2">
                Successfully applied wiki recommendations!
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-earth-700" htmlFor="name">Name (required)</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g., Tomato"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-earth-700" htmlFor="scientificName">Species / Scientific Name</label>
                <input
                  id="scientificName"
                  name="scientificName"
                  type="text"
                  value={formData.scientificName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g., Solanum lycopersicum"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-earth-700" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                placeholder="Brief description of the plant..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Status & Growth Card */}
        <Card className="border-earth-200/50 shadow-sm overflow-hidden">
          <div className="bg-earth-50/50 px-6 py-4 border-b border-earth-100 flex items-center gap-2 text-earth-800 font-semibold">
            <Activity className="h-5 w-5 text-primary" />
            Status & Growth
          </div>
          <CardContent className="p-6 bg-white">
            <div className="grid gap-5 md:grid-cols-2">

              <div className="space-y-2">
                <label className="text-sm font-medium text-earth-700 flex items-center gap-2" htmlFor="location">
                  <MapPin className="h-4 w-4 text-earth-400" /> Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g., Front Porch, Garden Bed A"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-earth-700 flex items-center gap-2" htmlFor="plantedDate">
                  <Calendar className="h-4 w-4 text-earth-400" /> Planting Date
                </label>
                <input
                  id="plantedDate"
                  name="plantedDate"
                  type="date"
                  value={formData.plantedDate}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-earth-700" htmlFor="healthStatus">Health Status</label>
                <select
                  id="healthStatus"
                  name="healthStatus"
                  value={formData.healthStatus}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-earth-700" htmlFor="growthStage">Growth Stage</label>
                <select
                  id="growthStage"
                  name="growthStage"
                  value={formData.growthStage}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="seedling">Seedling</option>
                  <option value="vegetative">Vegetative</option>
                  <option value="flowering">Flowering</option>
                  <option value="fruiting">Fruiting</option>
                  <option value="dormant">Dormant</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Care Requirements Card */}
        <Card className="border-earth-200/50 shadow-sm overflow-hidden">
          <div className="bg-earth-50/50 px-6 py-4 border-b border-earth-100 flex items-center gap-2 text-earth-800 font-semibold">
            <Sun className="h-5 w-5 text-primary" />
            Care Requirements
          </div>
          <CardContent className="p-6 bg-white">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-earth-700 flex items-center gap-2" htmlFor="sunRequirement">
                  <Sun className="h-4 w-4 text-amber-500" /> Sun Requirement
                </label>
                <select
                  id="sunRequirement"
                  name="sunRequirement"
                  value={formData.sunRequirement}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">Select...</option>
                  <option value="full">Full Sun</option>
                  <option value="partial">Partial Sun</option>
                  <option value="shade">Shade</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-earth-700 flex items-center gap-2" htmlFor="wateringFrequency">
                  <Droplets className="h-4 w-4 text-blue-500" /> Watering Frequency (days)
                </label>
                <input
                  id="wateringFrequency"
                  name="wateringFrequency"
                  type="number"
                  min="1"
                  value={formData.wateringFrequency}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g., 2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Link to={isEditing ? `/plants/${id}` : '/plants'}>
            <Button type="button" variant="outline" className="w-24 border-earth-200 text-earth-700 hover:bg-earth-50">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading} className="w-32 shadow-md hover:shadow-lg transition-all border-0 disabled:opacity-50">
            {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Plant'}
          </Button>
        </div>
      </form>
    </div>
  )
}
