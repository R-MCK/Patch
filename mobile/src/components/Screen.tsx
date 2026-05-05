import type { ReactNode } from 'react'
import type { RefreshControlProps, StyleProp, ViewStyle } from 'react-native'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { patchColors, patchSpacing } from '@patch/core'

interface ScreenProps {
  title: string
  children: ReactNode
  refreshControl?: React.ReactElement<RefreshControlProps>
  contentStyle?: StyleProp<ViewStyle>
  action?: ReactNode
}

export function Screen({ title, children, refreshControl, contentStyle, action }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, contentStyle]} refreshControl={refreshControl}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={styles.kicker}>Patch</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
          {action && <View style={styles.actionContainer}>{action}</View>}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: patchColors.background,
  },
  content: {
    gap: patchSpacing.md,
    padding: patchSpacing.lg,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: patchSpacing.sm,
  },
  header: {
    gap: patchSpacing.xs,
  },
  actionContainer: {
    justifyContent: 'center',
  },
  kicker: {
    color: patchColors.primary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: patchColors.text,
    fontSize: 34,
    fontWeight: '800',
  },
})
