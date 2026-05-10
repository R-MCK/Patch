import { RefreshControl, StyleSheet, Text, View, Pressable } from 'react-native'
import { useState } from 'react'
import { patchColors, patchSpacing } from '@patch/core'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '../../src/components/Screen'
import { StateMessage } from '../../src/components/StateMessage'
import { SyncStatusBanner } from '../../src/components/SyncStatusBanner'
import { TaskRow } from '../../src/components/TaskRow'
import { usePatchData } from '../../src/data/usePatchData'

export default function TasksScreen() {
  const { dueToday, error, isLoading, isRefreshing, overdue, plants, refresh, upcoming, completeCareTask, isSyncing, lastSyncError, lastSyncedAt } = usePatchData()
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
      title="Tasks"
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
      <SyncStatusBanner isSyncing={isSyncing} lastSyncError={lastSyncError} lastSyncedAt={lastSyncedAt} />
      {isLoading ? <StateMessage title="Loading tasks" isLoading /> : null}
      {error ? <StateMessage title="Could not load tasks" message={error} /> : null}
      {!isLoading && !error && overdue.length + dueToday.length + upcoming.length === 0 ? (
        <StateMessage title="No care tasks" message="Scheduled tasks from your plants will appear here." />
      ) : null}
      <TaskSection title="Overdue" tasks={overdue} plantsById={plantsById} onCompleteTask={handleComplete} completingTaskId={completingTaskId} />
      <TaskSection title="Today" tasks={dueToday} plantsById={plantsById} onCompleteTask={handleComplete} completingTaskId={completingTaskId} />
      <TaskSection title="Upcoming" tasks={upcoming.slice(0, 12)} plantsById={plantsById} onCompleteTask={handleComplete} completingTaskId={completingTaskId} />
    </Screen>
  )
}

interface TaskSectionProps {
  title: string
  tasks: ReturnType<typeof usePatchData>['tasks']
  plantsById: Map<string, ReturnType<typeof usePatchData>['plants'][number]>
  onCompleteTask: (taskId: string) => Promise<void>
  completingTaskId: string | null
}

function TaskSection({ title, tasks, plantsById, onCompleteTask, completingTaskId }: TaskSectionProps) {
  if (tasks.length === 0) {
    return null
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          plant={plantsById.get(task.plantId)}
          onComplete={onCompleteTask}
          isCompleting={completingTaskId === task.id}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: patchSpacing.sm,
  },
  sectionTitle: {
    color: patchColors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: patchSpacing.sm,
  },
})
