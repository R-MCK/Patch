import { useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Link, Redirect, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { patchColors, patchSpacing } from '@patch/core'
import { useAuth } from '../src/auth/AuthProvider'

export default function LoginScreen() {
  const router = useRouter()
  const { signIn, error, clearError, isAuthenticated, isBootstrapping } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const passwordInputRef = useRef<TextInput>(null)

  const canSubmit = email.trim().length > 0 && password.length >= 8 && !isSubmitting

  if (isBootstrapping) {
    return null
  }

  if (isAuthenticated) {
    return <Redirect href="/" />
  }

  const handleSignIn = async () => {
    setLocalError(null)
    clearError()

    if (!email.trim()) {
      setLocalError('Email is required.')
      return
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.')
      return
    }

    setIsSubmitting(true)
    try {
      await signIn(email.trim(), password)
      router.replace('/')
    } catch {
      // Error state is surfaced from auth context.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 16, android: 0 })}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>Patch</Text>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Keep your garden ledger synced across devices.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={false}
              keyboardType="email-address"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              placeholder="you@example.com"
              placeholderTextColor={patchColors.textSecondary}
              returnKeyType="next"
              style={styles.input}
              textContentType="emailAddress"
              value={email}
              onChangeText={(text) => {
                setEmail(text)
                setLocalError(null)
                clearError()
              }}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              autoComplete="password"
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={() => {
                if (canSubmit) {
                  void handleSignIn()
                }
              }}
              secureTextEntry
              placeholder="At least 8 characters"
              placeholderTextColor={patchColors.textSecondary}
              ref={passwordInputRef}
              returnKeyType="done"
              style={styles.input}
              textContentType="password"
              value={password}
              onChangeText={(text) => {
                setPassword(text)
                setLocalError(null)
                clearError()
              }}
            />
          </View>

          {localError || error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{localError ?? error}</Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={!canSubmit}
            onPress={handleSignIn}
            style={({ pressed }) => [styles.submitButton, (!canSubmit || pressed) ? styles.submitButtonDisabled : null]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitText}>Sign in</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>No account yet?</Text>
          <Link href="/register" asChild>
            <Pressable accessibilityRole="button">
              <Text style={styles.linkText}>Create one</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: patchColors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: patchSpacing.xl,
    padding: patchSpacing.lg,
  },
  header: {
    gap: patchSpacing.xs,
  },
  kicker: {
    color: patchColors.primary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: patchColors.text,
    fontSize: 36,
    fontWeight: '800',
  },
  subtitle: {
    color: patchColors.textSecondary,
    fontSize: 15,
  },
  form: {
    gap: patchSpacing.md,
  },
  field: {
    gap: patchSpacing.xs,
  },
  label: {
    color: patchColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: patchColors.surface,
    borderColor: patchColors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: patchColors.text,
    fontSize: 16,
    paddingHorizontal: patchSpacing.md,
    paddingVertical: patchSpacing.sm,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    padding: patchSpacing.sm,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: patchColors.primary,
    borderRadius: 10,
    minHeight: 46,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: patchSpacing.sm,
    justifyContent: 'center',
  },
  footerText: {
    color: patchColors.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: patchColors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
})
