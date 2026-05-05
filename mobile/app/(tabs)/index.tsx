import { RefreshControl } from 'react-native'
import { patchColors } from '@patch/core'
import { Screen } from '../../src/components/Screen'
import { StatCard } from '../../src/components/StatCard'
import { StateMessage } from '../../src/components/StateMessage'
import { TaskRow } from '../../src/components/TaskRow'
import { usePatchData } from '../../src/data/usePatchData'

export default function TodayScreen() {
  const { dueToday, overdue, error, isLoading, isRefreshing, plants, refresh } = usePatchData()
  const plantsById = new Map(plants.map((plant) => [plant.id, plant]))

  return (
    <Screen
      title="Today"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} tintColor={patchColors.primary} onRefresh={refresh} />
      }
    >
      <StatCard label="Due today" value={String(dueToday.length)} helper="Care tasks scheduled for today." />
      <StatCard label="Overdue" value={String(overdue.length)} helper="Tasks that need attention first." />
      {isLoading ? <StateMessage title="Loading care plan" isLoading /> : null}
      {error ? <StateMessage title="Could not load today" message={error} /> : null}
      {!isLoading && !error && dueToday.length === 0 && overdue.length === 0 ? (
        <StateMessage title="No urgent care tasks" message="Your garden is clear for today." />
      ) : null}
      {[...overdue, ...dueToday].slice(0, 8).map((task) => (
        <TaskRow key={task.id} task={task} plant={plantsById.get(task.plantId)} />
      ))}
    </Screen>
  )
}
