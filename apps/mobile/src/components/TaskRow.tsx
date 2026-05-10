import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { CareTask, Plant } from '@patch/core'
import { patchColors, patchSpacing } from '@patch/core'

interface TaskRowProps {
  task: CareTask
  plant?: Plant
  onComplete?: (taskId: string) => void
  isCompleting?: boolean
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

export function TaskRow({ task, plant, onComplete, isCompleting }: TaskRowProps) {
  const isCompleted = Boolean(task.completedDate)

  return (
    <View style={styles.row}>
      <View style={styles.marker} />
      <View style={styles.copy}>
        <Text style={styles.title}>{task.taskType}</Text>
        <Text style={styles.detail}>{plant?.name ?? 'Unknown plant'}</Text>
      </View>
      {isCompleted ? (
        <Text style={styles.doneText}>Done</Text>
      ) : onComplete ? (
        <Pressable
          accessibilityRole="button"
          disabled={isCompleting}
          onPress={() => onComplete(task.id)}
          style={({ pressed }) => [styles.completeButton, (pressed || isCompleting) ? styles.buttonPressed : null]}
        >
          <Text style={styles.completeButtonText}>{isCompleting ? 'Saving' : 'Complete'}</Text>
        </Pressable>
      ) : null}
      <Text style={styles.date}>{dateFormatter.format(task.scheduledDate)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: patchColors.surface,
    borderColor: patchColors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: patchSpacing.md,
    padding: patchSpacing.md,
  },
  marker: {
    backgroundColor: patchColors.primary,
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  copy: {
    flex: 1,
    gap: patchSpacing.xs,
  },
  title: {
    color: patchColors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  detail: {
    color: patchColors.textSecondary,
    fontSize: 14,
  },
  date: {
    color: patchColors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  completeButton: {
    backgroundColor: patchColors.primary,
    borderRadius: 8,
    paddingHorizontal: patchSpacing.sm,
    paddingVertical: 6,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  doneText: {
    color: patchColors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.72,
  },
})
