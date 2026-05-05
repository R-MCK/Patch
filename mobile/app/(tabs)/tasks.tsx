import { RefreshControl, StyleSheet, Text, View, Pressable } from 'react-native'
import { patchColors, patchSpacing } from '@patch/core'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '../../src/components/Screen'
import { StateMessage } from '../../src/components/StateMessage'
import { TaskRow } from '../../src/components/TaskRow'
import { usePatchData } from '../../src/data/usePatchData'

export default function TasksScreen() {
  const { dueToday, error, isLoading, isRefreshing, overdue, plants, refresh, upcoming } = usePatchData()
  const plantsById = new Map(plants.map((plant) => [plant.id, plant]))

  return (
    <Screen
      title="Tasks"
      action={
        <Link href="/add-task" asChild>
          <Pressable hitSlop={8}>
            <Ionicons name="add-circle" size={32} color={patchColors.primary} />
          </Pressable>
        </Link>
      }
      refreshControl={
        <RefreshControl refreshing={isRefreshing} tintColor={patchColors.primary} onRefresh={refresh} />
      }
    >
      {isLoading ? <StateMessage title="Loading tasks" isLoading /> : null}
      {error ? <StateMessage title="Could not load tasks" message={error} /> : null}
      {!isLoading && !error && overdue.length + dueToday.length + upcoming.length === 0 ? (
        <StateMessage title="No care tasks" message="Scheduled tasks from your plants will appear here." />
      ) : null}
      <TaskSection title="Overdue" tasks={overdue} plantsById={plantsById} />
      <TaskSection title="Today" tasks={dueToday} plantsById={plantsById} />
      <TaskSection title="Upcoming" tasks={upcoming.slice(0, 12)} plantsById={plantsById} />
    </Screen>
  )
}

interface TaskSectionProps {
  title: string
  tasks: ReturnType<typeof usePatchData>['tasks']
  plantsById: Map<string, ReturnType<typeof usePatchData>['plants'][number]>
}

function TaskSection({ title, tasks, plantsById }: TaskSectionProps) {
  if (tasks.length === 0) {
    return null
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} plant={plantsById.get(task.plantId)} />
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
