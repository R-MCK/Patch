import { StyleSheet, Text, View } from 'react-native'
import type { CareTask, Plant } from '@patch/core'
import { patchColors, patchSpacing } from '@patch/core'

interface TaskRowProps {
  task: CareTask
  plant?: Plant
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

export function TaskRow({ task, plant }: TaskRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.marker} />
      <View style={styles.copy}>
        <Text style={styles.title}>{task.taskType}</Text>
        <Text style={styles.detail}>{plant?.name ?? 'Unknown plant'}</Text>
      </View>
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
})

