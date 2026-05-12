import { useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, View, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { Link, Redirect, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { patchColors, patchSpacing } from '@patch/core'
import { usePatchData } from '../src/data/usePatchData'
import { useAuth } from '../src/auth/AuthProvider'
import { SessionLoadingView } from '../src/components/SessionLoadingView'

const COMMON_TASKS = ['Watering', 'Fertilizing', 'Pruning', 'Pest Control', 'Harvesting']

export default function AddTaskScreen() {
  const router = useRouter()
  const { plants, createCareTask } = usePatchData()
  const { isAuthenticated, isBootstrapping } = useAuth()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null)
  const [taskType, setTaskType] = useState('')
  const [notes, setNotes] = useState('')
  const notesInputRef = useRef<TextInput>(null)

  if (isBootstrapping) {
    return <SessionLoadingView />
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />
  }

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
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 12, android: 0 })}
        style={styles.container}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel adding task"
            onPress={() => router.back()}
            style={styles.headerButton}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>New Task</Text>
          <Pressable 
            accessibilityRole="button"
            accessibilityLabel="Save new task"
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

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Select Plant *</Text>
            {plants.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>You need to add a plant first.</Text>
                <Link href="/add-plant" asChild>
                  <Pressable style={styles.addPlantButton}>
                    <Text style={styles.addPlantButtonText}>Add your first plant</Text>
                  </Pressable>
                </Link>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillContainer}
                keyboardShouldPersistTaps="handled"
              >
                {plants.map(plant => (
                  <Pressable 
                    key={plant.id} 
                    accessibilityRole="button"
                    accessibilityLabel={`Select plant ${plant.name}`}
                    accessibilityState={{ selected: selectedPlantId === plant.id }}
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillContainer}
              keyboardShouldPersistTaps="handled"
            >
            {COMMON_TASKS.map(task => (
              <Pressable 
                key={task} 
                accessibilityRole="button"
                accessibilityLabel={`Select task type ${task}`}
                accessibilityState={{ selected: taskType === task }}
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
              accessibilityLabel="Task type"
              accessibilityHint="Required field"
              autoCapitalize="words"
              blurOnSubmit={false}
              style={[styles.input, { marginTop: patchSpacing.sm }]}
              value={taskType}
              onChangeText={(text) => {
                setTaskType(text)
                setError(null)
              }}
              onSubmitEditing={() => notesInputRef.current?.focus()}
              placeholder="Or type a custom task..."
              placeholderTextColor={patchColors.textSecondary}
              returnKeyType="next"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              accessibilityLabel="Task notes"
              autoCapitalize="sentences"
              blurOnSubmit
              ref={notesInputRef}
              returnKeyType="done"
              submitBehavior="blurAndSubmit"
              style={[styles.input, { height: 100 }]}
              value={notes}
              onChangeText={setNotes}
              onSubmitEditing={() => {
                if (!isSubmitting && selectedPlantId && taskType.trim()) {
                  void handleSave()
                }
              }}
              placeholder="Any additional details?"
              placeholderTextColor={patchColors.textSecondary}
              multiline
              textAlignVertical="top"
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: patchColors.surface,
  },
  container: {
    flex: 1,
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
    minHeight: 44,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyState: {
    gap: patchSpacing.sm,
  },
  addPlantButton: {
    alignSelf: 'flex-start',
    backgroundColor: patchColors.primary,
    borderRadius: 8,
    paddingHorizontal: patchSpacing.md,
    paddingVertical: patchSpacing.sm,
  },
  addPlantButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
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
