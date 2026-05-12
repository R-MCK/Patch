import { Pressable, StyleSheet, Text, View } from 'react-native'
import { patchColors, patchSpacing } from '@patch/core'

interface SyncStatusBannerProps {
  isSyncing: boolean
  lastSyncError: string | null
  lastSyncedAt: number | null
  pendingChangesCount: number
  onRetry?: () => void
}

export function SyncStatusBanner({
  isSyncing,
  lastSyncError,
  lastSyncedAt,
  pendingChangesCount,
  onRetry,
}: SyncStatusBannerProps) {
  if (isSyncing) {
    return (
      <View style={[styles.container, styles.syncing]}>
        <Text style={styles.syncingText}>
          Syncing latest updates{pendingChangesCount > 0 ? ` (${pendingChangesCount} pending)` : ''}…
        </Text>
      </View>
    )
  }

  if (lastSyncError) {
    return (
      <View style={[styles.container, styles.offline]}>
        <Text style={styles.offlineTitle}>Working offline</Text>
        <Text style={styles.offlineText}>Could not sync latest changes. Pull to retry when online.</Text>
        {pendingChangesCount > 0 ? (
          <Text style={styles.pendingText}>{pendingChangesCount} local change(s) pending sync.</Text>
        ) : null}
        {onRetry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry sync"
            onPress={onRetry}
            style={({ pressed }) => [styles.retryButton, pressed ? styles.retryButtonPressed : null]}
          >
            <Text style={styles.retryText}>Retry now</Text>
          </Pressable>
        ) : null}
      </View>
    )
  }

  if (!lastSyncedAt) {
    if (pendingChangesCount > 0) {
      return (
        <Text style={styles.metaText}>
          {pendingChangesCount} local change(s) queued for sync.
        </Text>
      )
    }

    return null
  }

  return (
    <View style={styles.metaContainer}>
      <Text style={styles.metaText}>
        Last synced {new Date(lastSyncedAt).toLocaleTimeString()}
      </Text>
      {pendingChangesCount > 0 ? (
        <Text style={styles.metaText}>
          {pendingChangesCount} local change(s) queued for sync.
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    paddingHorizontal: patchSpacing.md,
    paddingVertical: patchSpacing.sm,
  },
  syncing: {
    backgroundColor: '#e0f2fe',
  },
  syncingText: {
    color: '#075985',
    fontSize: 13,
    fontWeight: '600',
  },
  offline: {
    backgroundColor: '#fff7ed',
  },
  offlineTitle: {
    color: '#9a3412',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  offlineText: {
    color: '#9a3412',
    fontSize: 12,
  },
  pendingText: {
    color: '#9a3412',
    fontSize: 12,
    fontWeight: '600',
    marginTop: patchSpacing.xs,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fdba74',
    borderRadius: 8,
    marginTop: patchSpacing.xs,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: patchSpacing.sm,
  },
  retryButtonPressed: {
    opacity: 0.75,
  },
  retryText: {
    color: '#7c2d12',
    fontSize: 12,
    fontWeight: '700',
  },
  metaText: {
    color: patchColors.textSecondary,
    fontSize: 12,
  },
  metaContainer: {
    gap: 2,
  },
})
