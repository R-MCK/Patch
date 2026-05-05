import { useState } from 'react'
import { StyleSheet, Text, TextInput, View, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { patchColors, patchSpacing } from '@patch/core'
import { usePatchData } from '../src/data/usePatchData'

const COMMON_TASKS = ['Watering', 'Fertilizing', 'Pruning', 'Pest Control', 'Harvesting']

export default function AddTaskScreen() {
  const router = useRouter()
  const { plants, createCareTask } = usePatchData()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null)
  const [taskType, setTaskType] = useState('')
  const [notes, setNotes] = useState('')

  const handleSave = async () => {
    if (!selectedPlantId) {
      setError('Please select a plant.')
      return
    }
    if (!taskType.trim()) {
      setError('Task type is required.')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      await createCareTask(selectedPlantId, {
        task_type: taskType.trim(),
        scheduled_date: new Date().toISOString(),
        notes: notes.trim() || undefined,
      })
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule task')
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton} disabled={isSubmitting}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>New Task</Text>
        <Pressable 
          onPress={handleSave} 
          style={styles.headerButton} 
          disabled={isSubmitting || !selectedPlantId || !taskType.trim()}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={patchColors.primary} />
          ) : (
            <Text style={[styles.saveText, (!selectedPlantId || !taskType.trim()) && styles.disabledText]}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Plant *</Text>
          {plants.length === 0 ? (
            <Text style={styles.emptyText}>You need to add a plant first.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillContainer}>
              {plants.map(plant => (
                <Pressable 
                  key={plant.id} 
                  style={[styles.pill, selectedPlantId === plant.id && styles.pillSelected]}
                  onPress={() => setSelectedPlantId(plant.id)}
                >
                  <Text style={[styles.pillText, selectedPlantId === plant.id && styles.pillTextSelected]}>
                    {plant.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Task Type *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillContainer}>
            {COMMON_TASKS.map(task => (
              <Pressable 
                key={task} 
                style={[styles.pill, taskType === task && styles.pillSelected]}
                onPress={() => {
                  setTaskType(task)
                  setError(null)
                }}
              >
                <Text style={[styles.pillText, taskType === task && styles.pillTextSelected]}>
                  {task}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          
          <TextInput
            style={[styles.input, { marginTop: patchSpacing.sm }]}
            value={taskType}
            onChangeText={(text) => {
              setTaskType(text)
              setError(null)
            }}
            placeholder="Or type a custom task..."
            placeholderTextColor={patchColors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional details?"
            placeholderTextColor={patchColors.textSecondary}
            multiline
            textAlignVertical="top"
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: patchColors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: patchSpacing.md,
    paddingVertical: patchSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: patchColors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: patchColors.text,
  },
  headerButton: {
    padding: patchSpacing.xs,
    minWidth: 60,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 17,
    color: patchColors.text,
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
    color: patchColors.primary,
  },
  disabledText: {
    opacity: 0.5,
  },
  content: {
    padding: patchSpacing.lg,
    gap: patchSpacing.xl,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: patchSpacing.md,
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  section: {
    gap: patchSpacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: patchColors.text,
    marginBottom: patchSpacing.xs,
  },
  emptyText: {
    color: patchColors.textSecondary,
    fontSize: 15,
  },
  pillContainer: {
    gap: patchSpacing.sm,
    paddingBottom: patchSpacing.xs,
  },
  pill: {
    paddingHorizontal: patchSpacing.md,
    paddingVertical: patchSpacing.sm,
    borderRadius: 20,
    backgroundColor: patchColors.background,
    borderWidth: 1,
    borderColor: patchColors.border,
  },
  pillSelected: {
    backgroundColor: patchColors.primary,
    borderColor: patchColors.primary,
  },
  pillText: {
    color: patchColors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  pillTextSelected: {
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: patchColors.border,
    borderRadius: 8,
    padding: patchSpacing.md,
    fontSize: 16,
    color: patchColors.text,
    backgroundColor: patchColors.background,
  },
})
