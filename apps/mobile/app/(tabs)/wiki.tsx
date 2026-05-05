import { RefreshControl } from 'react-native'
import { patchColors } from '@patch/core'
import { Screen } from '../../src/components/Screen'
import { StatCard } from '../../src/components/StatCard'
import { StateMessage } from '../../src/components/StateMessage'
import { usePatchData } from '../../src/data/usePatchData'

export default function WikiScreen() {
  const { wikiEntries, isLoading, isRefreshing, error, refresh } = usePatchData()

  return (
    <Screen 
      title="Wiki"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} tintColor={patchColors.primary} onRefresh={refresh} />
      }
    >
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
