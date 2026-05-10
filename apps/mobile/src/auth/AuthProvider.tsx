import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthUser } from '@patch/api'
import { patchApiClient } from '../api/client'
import {
  clearStoredPatchAccessToken,
  getPatchAccessToken,
  getPatchApiToken,
  hydrateStoredPatchAccessToken,
  persistPatchAccessToken,
} from '../api/authTokens'
import { clearLocalUserData, initDatabase } from '../data/db'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Authentication failed'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const refreshUser = useCallback(async () => {
    const me = await patchApiClient.me()
    setUser(me)
  }, [])

  useEffect(() => {
    let mounted = true

    void (async () => {
      try {
        await hydrateStoredPatchAccessToken()
        const token = getPatchAccessToken() ?? getPatchApiToken()
        if (!token) {
          return
        }

        await refreshUser()
      } catch (authError) {
        // If a stored token is invalid/expired, clear it and allow sign in.
        if (getPatchAccessToken()) {
          await clearStoredPatchAccessToken()
        }
        if (mounted) {
          setUser(null)
          setError(getErrorMessage(authError))
        }
      } finally {
        if (mounted) {
          setIsBootstrapping(false)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [refreshUser])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    const response = await patchApiClient.login({ email, password })
    await persistPatchAccessToken(response.accessToken)
    setUser(response.user)
  }, [])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setError(null)
    const response = await patchApiClient.register({ name, email, password })
    await persistPatchAccessToken(response.accessToken)
    setUser(response.user)
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    try {
      await patchApiClient.logout()
    } catch {
      // Continue sign-out even if backend request fails.
    } finally {
      await clearStoredPatchAccessToken()
      initDatabase()
      clearLocalUserData()
      setUser(null)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    isBootstrapping,
    error,
    signIn: async (email: string, password: string) => {
      try {
        await signIn(email, password)
      } catch (authError) {
        const message = getErrorMessage(authError)
        setError(message)
        throw authError
      }
    },
    signUp: async (name: string, email: string, password: string) => {
      try {
        await signUp(name, email, password)
      } catch (authError) {
        const message = getErrorMessage(authError)
        setError(message)
        throw authError
      }
    },
    signOut,
    refreshUser: async () => {
      try {
        setError(null)
        await refreshUser()
      } catch (authError) {
        const message = getErrorMessage(authError)
        setError(message)
        throw authError
      }
    },
    clearError,
  }), [clearError, error, isBootstrapping, refreshUser, signIn, signOut, signUp, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
