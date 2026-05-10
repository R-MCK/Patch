import { useRef, useState, type RefObject } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Link, Redirect, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { patchColors, patchSpacing } from '@patch/core'
import { useAuth } from '../src/auth/AuthProvider'

export default function RegisterScreen() {
  const router = useRouter()
  const { signUp, error, clearError, isAuthenticated, isBootstrapping } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)
  const confirmPasswordInputRef = useRef<TextInput>(null)

  const canSubmit = name.trim().length > 0
    && email.trim().length > 0
    && password.length >= 8
    && confirmPassword === password
    && !isSubmitting

  if (isBootstrapping) {
    return null
  }

  if (isAuthenticated) {
    return <Redirect href="/" />
  }

  const handleRegister = async () => {
    setLocalError(null)
    clearError()

    if (!name.trim()) {
      setLocalError('Name is required.')
      return
    }
    if (!email.trim()) {
      setLocalError('Email is required.')
      return
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.')
      return
    }
    if (confirmPassword !== password) {
      setLocalError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await signUp(name.trim(), email.trim(), password)
      router.replace('/')
    } catch {
      // Error is surfaced from auth context.
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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start your garden record with secure sync.</Text>
        </View>

        <View style={styles.form}>
          <Field
            label="Name"
            value={name}
            onChangeText={(text) => {
              setName(text)
              setLocalError(null)
              clearError()
            }}
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            onSubmitEditing={() => emailInputRef.current?.focus()}
            blurOnSubmit={false}
            placeholder="Your name"
          />
          <Field
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              setLocalError(null)
              clearError()
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            inputRef={emailInputRef}
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
            blurOnSubmit={false}
          />
          <Field
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text)
              setLocalError(null)
              clearError()
            }}
            placeholder="At least 8 characters"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="newPassword"
            inputRef={passwordInputRef}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
            blurOnSubmit={false}
          />
          <Field
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text)
              setLocalError(null)
              clearError()
            }}
            placeholder="Repeat password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="newPassword"
            inputRef={confirmPasswordInputRef}
            returnKeyType="done"
            onSubmitEditing={() => {
              if (canSubmit) {
                void handleRegister()
              }
            }}
          />

          {localError || error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{localError ?? error}</Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={!canSubmit}
            onPress={handleRegister}
            style={({ pressed }) => [styles.submitButton, (!canSubmit || pressed) ? styles.submitButtonDisabled : null]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitText}>Create account</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already registered?</Text>
          <Link href="/login" asChild>
            <Pressable accessibilityRole="button">
              <Text style={styles.linkText}>Sign in</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

interface FieldProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder: string
  keyboardType?: 'default' | 'email-address'
  secureTextEntry?: boolean
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  autoComplete?: 'name' | 'email' | 'password' | 'off'
  textContentType?:
    | 'name'
    | 'emailAddress'
    | 'password'
    | 'newPassword'
    | 'none'
  inputRef?: RefObject<TextInput | null>
  returnKeyType?: 'next' | 'done'
  onSubmitEditing?: () => void
  blurOnSubmit?: boolean
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  textContentType = 'none',
  inputRef,
  returnKeyType = 'done',
  onSubmitEditing,
  blurOnSubmit = true,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        blurOnSubmit={blurOnSubmit}
        keyboardType={keyboardType}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={patchColors.textSecondary}
        ref={inputRef}
        returnKeyType={returnKeyType}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        textContentType={textContentType}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
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
