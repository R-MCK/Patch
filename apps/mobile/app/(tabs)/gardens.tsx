import { RefreshControl, Pressable } from 'react-native'
import { patchColors } from '@patch/core'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '../../src/components/Screen'
import { StatCard } from '../../src/components/StatCard'
import { StateMessage } from '../../src/components/StateMessage'
import { usePatchData } from '../../src/data/usePatchData'

export default function GardensScreen() {
  const { gardens, isLoading, isRefreshing, error, refresh } = usePatchData()

  return (
    <Screen 
      title="Gardens"
      action={
        <Link href="/add-garden" asChild>
          <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel="Add garden">
            <Ionicons name="add-circle" size={32} color={patchColors.primary} />
          </Pressable>
        </Link>
      }
      refreshControl={
        <RefreshControl refreshing={isRefreshing} tintColor={patchColors.primary} onRefresh={refresh} />
      }
    >
      {isLoading ? <StateMessage title="Loading gardens" isLoading /> : null}
      {error ? <StateMessage title="Could not load gardens" message={error} /> : null}
      {!isLoading && !error && gardens.length === 0 ? (
        <StateMessage title="No gardens yet" message="Gardens from the Patch API will appear here." />
      ) : null}
      {gardens.map((garden) => (
        <StatCard
          key={garden.id}
          label={garden.gardenType ?? 'Garden'}
          value={garden.name}
          helper={garden.climateZone ? `Climate: ${garden.climateZone}` : 'No climate zone set'}
        />
      ))}
    </Screen>
  )
}
