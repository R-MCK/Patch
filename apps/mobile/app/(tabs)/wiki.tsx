import { Pressable, RefreshControl } from 'react-native'
import { patchColors } from '@patch/core'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '../../src/components/Screen'
import { StatCard } from '../../src/components/StatCard'
import { StateMessage } from '../../src/components/StateMessage'
import { SyncStatusBanner } from '../../src/components/SyncStatusBanner'
import { usePatchData } from '../../src/data/usePatchData'
import { useAuth } from '../../src/auth/AuthProvider'

export default function WikiScreen() {
  const { wikiEntries, isLoading, isRefreshing, error, refresh, isSyncing, lastSyncError, lastSyncedAt } = usePatchData()
  const { signOut } = useAuth()

  return (
    <Screen 
      title="Wiki"
      action={(
        <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel="Sign out" onPress={() => { void signOut() }}>
          <Ionicons name="log-out-outline" size={28} color={patchColors.textSecondary} />
        </Pressable>
      )}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} tintColor={patchColors.primary} onRefresh={refresh} />
      }
    >
      <SyncStatusBanner isSyncing={isSyncing} lastSyncError={lastSyncError} lastSyncedAt={lastSyncedAt} />
      {isLoading ? <StateMessage title="Loading wiki entries" isLoading /> : null}
      {error ? <StateMessage title="Could not load wiki entries" message={error} /> : null}
      {!isLoading && !error && wikiEntries.length === 0 ? (
        <StateMessage title="No wiki entries yet" message="Entries from the Patch API will appear here." />
      ) : null}
      {wikiEntries.map((entry) => (
        <StatCard
          key={entry.id}
          label={entry.category ?? 'Plant'}
          value={entry.commonName ?? entry.title}
          helper={entry.entryDescription ?? 'No description available.'}
        />
      ))}
    </Screen>
  )
}
