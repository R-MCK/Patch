import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { patchColors, patchSpacing } from '@patch/core'

interface SessionLoadingViewProps {
  label?: string
}

export function SessionLoadingView({ label = 'Restoring session...' }: SessionLoadingViewProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={patchColors.primary} />
      <Text style={styles.text}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: patchColors.background,
    flex: 1,
    gap: patchSpacing.sm,
    justifyContent: 'center',
  },
  text: {
    color: patchColors.textSecondary,
    fontSize: 14,
  },
})
