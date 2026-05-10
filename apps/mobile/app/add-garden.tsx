import { useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, View, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { Redirect, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { patchColors, patchSpacing } from '@patch/core'
import { usePatchData } from '../src/data/usePatchData'
import { useAuth } from '../src/auth/AuthProvider'

export default function AddGardenScreen() {
  const router = useRouter()
  const { createGarden } = usePatchData()
  const { isAuthenticated, isBootstrapping } = useAuth()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [name, setName] = useState('')
  const [gardenType, setGardenType] = useState('')
  const [climateZone, setClimateZone] = useState('')
  const gardenTypeInputRef = useRef<TextInput>(null)
  const climateZoneInputRef = useRef<TextInput>(null)

  if (isBootstrapping) {
    return null
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Garden name is required.')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      await createGarden({
        name: name.trim(),
        garden_type: gardenType.trim() || undefined,
        climate_zone: climateZone.trim() || undefined,
      })
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create garden')
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
            accessibilityLabel="Cancel adding garden"
            onPress={() => router.back()}
            style={styles.headerButton}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>New Garden</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save new garden"
            onPress={handleSave}
            style={styles.headerButton}
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={patchColors.primary} />
            ) : (
              <Text style={[styles.saveText, !name.trim() && styles.disabledText]}>Save</Text>
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
            <Text style={styles.sectionTitle}>Basic Info</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                autoCapitalize="words"
                blurOnSubmit={false}
                style={styles.input}
                onSubmitEditing={() => gardenTypeInputRef.current?.focus()}
                returnKeyType="next"
                value={name}
                onChangeText={(text) => {
                  setName(text)
                  setError(null)
                }}
                placeholder="e.g. Backyard Raised Bed"
                placeholderTextColor={patchColors.textSecondary}
                autoFocus
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Garden Type</Text>
              <TextInput
                autoCapitalize="words"
                blurOnSubmit={false}
                ref={gardenTypeInputRef}
                returnKeyType="next"
                style={styles.input}
                onSubmitEditing={() => climateZoneInputRef.current?.focus()}
                value={gardenType}
                onChangeText={setGardenType}
                placeholder="e.g. Raised Bed, In-Ground"
                placeholderTextColor={patchColors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Climate Zone</Text>
              <TextInput
                autoCapitalize="characters"
                ref={climateZoneInputRef}
                returnKeyType="done"
                style={styles.input}
                onSubmitEditing={() => {
                  if (!isSubmitting && name.trim()) {
                    void handleSave()
                  }
                }}
                value={climateZone}
                onChangeText={setClimateZone}
                placeholder="e.g. 9b"
                placeholderTextColor={patchColors.textSecondary}
              />
            </View>
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
  formGroup: {
    gap: patchSpacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: patchColors.textSecondary,
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
