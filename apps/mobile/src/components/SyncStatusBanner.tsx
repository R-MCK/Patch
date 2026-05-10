import { StyleSheet, Text, View } from 'react-native'
import { patchColors, patchSpacing } from '@patch/core'

interface SyncStatusBannerProps {
  isSyncing: boolean
  lastSyncError: string | null
  lastSyncedAt: number | null
}

export function SyncStatusBanner({ isSyncing, lastSyncError, lastSyncedAt }: SyncStatusBannerProps) {
  if (isSyncing) {
    return (
      <View style={[styles.container, styles.syncing]}>
        <Text style={styles.syncingText}>Syncing latest updates…</Text>
      </View>
    )
  }

  if (lastSyncError) {
    return (
      <View style={[styles.container, styles.offline]}>
        <Text style={styles.offlineTitle}>Working offline</Text>
        <Text style={styles.offlineText}>Could not sync latest changes. Pull to retry when online.</Text>
      </View>
    )
  }

  if (!lastSyncedAt) {
    return null
  }

  return (
    <Text style={styles.metaText}>
      Last synced {new Date(lastSyncedAt).toLocaleTimeString()}
    </Text>
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
  metaText: {
    color: patchColors.textSecondary,
    fontSize: 12,
    marginTop: -patchSpacing.xs,
  },
})
