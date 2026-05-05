import { StyleSheet, Text, View } from 'react-native'
import { patchColors, patchSpacing } from '@patch/core'

interface StatCardProps {
  label: string
  value: string
  helper: string
}

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.helper}>{helper}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: patchColors.surface,
    borderColor: patchColors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: patchSpacing.xs,
    padding: patchSpacing.md,
  },
  label: {
    color: patchColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: patchColors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  helper: {
    color: patchColors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
  },
})
