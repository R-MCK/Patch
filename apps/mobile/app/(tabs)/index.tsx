import { Pressable, RefreshControl } from 'react-native'
import { useState } from 'react'
import { patchColors } from '@patch/core'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '../../src/components/Screen'
import { StatCard } from '../../src/components/StatCard'
import { StateMessage } from '../../src/components/StateMessage'
import { SyncStatusBanner } from '../../src/components/SyncStatusBanner'
import { TaskRow } from '../../src/components/TaskRow'
import { usePatchData } from '../../src/data/usePatchData'

export default function TodayScreen() {
  const {
    dueToday,
    overdue,
    error,
    isLoading,
    isRefreshing,
    plants,
    refresh,
    completeCareTask,
    isSyncing,
    lastSyncedAt,
    lastSyncError,
  } = usePatchData()
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)
  const plantsById = new Map(plants.map((plant) => [plant.id, plant]))

  const handleComplete = async (taskId: string) => {
    setCompletingTaskId(taskId)
    try {
      await completeCareTask(taskId)
    } finally {
      setCompletingTaskId(null)
    }
  }

  return (
    <Screen
      title="Today"
      action={
        <Link href="/add-task" asChild>
          <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel="Add task">
            <Ionicons name="add-circle" size={32} color={patchColors.primary} />
          </Pressable>
        </Link>
      }
      refreshControl={
        <RefreshControl refreshing={isRefreshing} tintColor={patchColors.primary} onRefresh={refresh} />
      }
    >
      <StatCard label="Due today" value={String(dueToday.length)} helper="Care tasks scheduled for today." />
      <StatCard label="Overdue" value={String(overdue.length)} helper="Tasks that need attention first." />
      <SyncStatusBanner isSyncing={isSyncing} lastSyncError={lastSyncError} lastSyncedAt={lastSyncedAt} />
      {isLoading ? <StateMessage title="Loading care plan" isLoading /> : null}
      {error ? <StateMessage title="Could not load today" message={error} /> : null}
      {!isLoading && !error && dueToday.length === 0 && overdue.length === 0 ? (
        <StateMessage title="No urgent care tasks" message="Your garden is clear for today." />
      ) : null}
      {[...overdue, ...dueToday].slice(0, 8).map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          plant={plantsById.get(task.plantId)}
          onComplete={handleComplete}
          isCompleting={completingTaskId === task.id}
        />
      ))}
    </Screen>
  )
}
