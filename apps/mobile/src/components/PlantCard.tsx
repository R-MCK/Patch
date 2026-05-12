import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Plant } from '@patch/core'
import { patchColors, patchSpacing } from '@patch/core'

interface PlantCardProps {
  plant: Plant
  isWatering?: boolean
  onWater: (plantId: string) => void
}

function formatLabel(value: string | undefined) {
  return value ? value.replace(/^\w/, (letter) => letter.toUpperCase()) : 'Unknown'
}

export function PlantCard({ plant, isWatering, onWater }: PlantCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.name}>{plant.name}</Text>
          <Text style={styles.meta}>{plant.scientificName ?? plant.location ?? 'No location set'}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Water ${plant.name}`}
          accessibilityHint="Marks a watering action for this plant"
          disabled={isWatering}
          onPress={() => onWater(plant.id)}
          style={({ pressed }) => [styles.button, pressed || isWatering ? styles.buttonPressed : null]}
        >
          <Text style={styles.buttonText}>{isWatering ? 'Saving' : 'Water'}</Text>
        </Pressable>
      </View>
      <View style={styles.pills}>
        <Text style={styles.pill}>{formatLabel(plant.healthStatus)}</Text>
        <Text style={styles.pill}>{formatLabel(plant.growthStage)}</Text>
        {plant.location ? <Text style={styles.pill}>{plant.location}</Text> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: patchColors.surface,
    borderColor: patchColors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: patchSpacing.md,
    padding: patchSpacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: patchSpacing.md,
    justifyContent: 'space-between',
  },
  titleGroup: {
    flex: 1,
    gap: patchSpacing.xs,
  },
  name: {
    color: patchColors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  meta: {
    color: patchColors.textSecondary,
    fontSize: 14,
  },
  button: {
    backgroundColor: patchColors.primary,
    borderRadius: 10,
    paddingHorizontal: patchSpacing.md,
    paddingVertical: 10,
  },
  buttonPressed: {
    opacity: 0.72,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: patchSpacing.sm,
  },
  pill: {
    backgroundColor: patchColors.background,
    borderColor: patchColors.border,
    borderRadius: 999,
    borderWidth: 1,
    color: patchColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
})
