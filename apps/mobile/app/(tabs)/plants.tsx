import { useState } from 'react'
import { RefreshControl, Pressable } from 'react-native'
import { patchColors } from '@patch/core'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { PlantCard } from '../../src/components/PlantCard'
import { Screen } from '../../src/components/Screen'
import { StateMessage } from '../../src/components/StateMessage'
import { usePatchData } from '../../src/data/usePatchData'

export default function PlantsScreen() {
  const { plants, isLoading, isRefreshing, error, refresh, waterPlant } = usePatchData()
  const [wateringPlantId, setWateringPlantId] = useState<string | null>(null)

  async function handleWaterPlant(plantId: string) {
    setWateringPlantId(plantId)
    try {
      await waterPlant(plantId)
    } finally {
      setWateringPlantId(null)
    }
  }

  return (
    <Screen
      title="Plants"
      action={
        <Link href="/add-plant" asChild>
          <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel="Add plant">
            <Ionicons name="add-circle" size={32} color={patchColors.primary} />
          </Pressable>
        </Link>
      }
      refreshControl={
        <RefreshControl refreshing={isRefreshing} tintColor={patchColors.primary} onRefresh={refresh} />
      }
    >
      {isLoading ? <StateMessage title="Loading plants" isLoading /> : null}
      {error ? <StateMessage title="Could not load plants" message={error} /> : null}
      {!isLoading && !error && plants.length === 0 ? (
        <StateMessage title="No plants yet" message="Plants from the Patch API will appear here." />
      ) : null}
      {plants.map((plant) => (
        <PlantCard
          key={plant.id}
          plant={plant}
          isWatering={wateringPlantId === plant.id}
          onWater={handleWaterPlant}
        />
      ))}
    </Screen>
  )
}
