import { useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, View, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { Redirect, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { patchColors, patchSpacing } from '@patch/core'
import { usePatchData } from '../src/data/usePatchData'
import { useAuth } from '../src/auth/AuthProvider'

export default function AddPlantScreen() {
  const router = useRouter()
  const { createPlant } = usePatchData()
  const { isAuthenticated, isBootstrapping } = useAuth()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [variety, setVariety] = useState('')
  const [location, setLocation] = useState('')
  const speciesInputRef = useRef<TextInput>(null)
  const varietyInputRef = useRef<TextInput>(null)
  const locationInputRef = useRef<TextInput>(null)

  if (isBootstrapping) {
    return null
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Plant name is required.')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      await createPlant({
        name: name.trim(),
        species: species.trim() || undefined,
        variety: variety.trim() || undefined,
        location: location.trim() || undefined,
        health_status: 'Excellent',
        growth_stage: 'Seedling',
      })
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plant')
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
            accessibilityLabel="Cancel adding plant"
            onPress={() => router.back()}
            style={styles.headerButton}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>New Plant</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save new plant"
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

        <ScrollView contentContainerStyle={styles.content}>
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
                onSubmitEditing={() => speciesInputRef.current?.focus()}
                returnKeyType="next"
                value={name}
                onChangeText={(text) => {
                  setName(text)
                  setError(null)
                }}
                placeholder="e.g. Heirloom Tomato"
                placeholderTextColor={patchColors.textSecondary}
                autoFocus
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Species</Text>
              <TextInput
                autoCapitalize="words"
                blurOnSubmit={false}
                ref={speciesInputRef}
                returnKeyType="next"
                style={styles.input}
                onSubmitEditing={() => varietyInputRef.current?.focus()}
                value={species}
                onChangeText={setSpecies}
                placeholder="e.g. Solanum lycopersicum"
                placeholderTextColor={patchColors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Variety</Text>
              <TextInput
                autoCapitalize="words"
                blurOnSubmit={false}
                ref={varietyInputRef}
                returnKeyType="next"
                style={styles.input}
                onSubmitEditing={() => locationInputRef.current?.focus()}
                value={variety}
                onChangeText={setVariety}
                placeholder="e.g. Brandywine"
                placeholderTextColor={patchColors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Where is it?</Text>
              <TextInput
                autoCapitalize="words"
                ref={locationInputRef}
                returnKeyType="done"
                style={styles.input}
                onSubmitEditing={() => {
                  if (!isSubmitting && name.trim()) {
                    void handleSave()
                  }
                }}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Front Porch, Raised Bed 1"
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
