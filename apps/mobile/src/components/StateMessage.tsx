import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { patchColors, patchSpacing } from '@patch/core'

interface StateMessageProps {
  title: string
  message?: string
  isLoading?: boolean
}

export function StateMessage({ title, message, isLoading }: StateMessageProps) {
  return (
    <View style={styles.container}>
      {isLoading ? <ActivityIndicator color={patchColors.primary} /> : null}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: patchColors.surface,
    borderColor: patchColors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: patchSpacing.sm,
    padding: patchSpacing.lg,
  },
  title: {
    color: patchColors.text,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: patchColors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
})

