import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthState } from '@/types'
import { api, onAuthTokenChange, setAuthToken, type AuthUserJson } from '@/lib/api'

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
  restoreAuth: () => Promise<void>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
}

let restorePromise: Promise<void> | null = null

function mapAuthUser(user: AuthUserJson): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? user.email,
    createdAt: user.created_at ? new Date(user.created_at) : new Date(),
  }
}

function unwrapAuthUser(payload: AuthUserJson | { user: AuthUserJson }): AuthUserJson {
  return 'user' in payload ? payload.user : payload
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => {
      onAuthTokenChange((token) => {
        set({
          token,
          isAuthenticated: !!token && !!get().user,
        })
      })

      return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasRestored: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const { user, accessToken } = await api.login({ email, password })
          const mappedUser = mapAuthUser(user)
          setAuthToken(accessToken)
          set({
            user: mappedUser,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
            hasRestored: true,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true })
        try {
          const { user, accessToken } = await api.register({ email, password, name })
          const mappedUser = mapAuthUser(user)
          setAuthToken(accessToken)
          set({
            user: mappedUser,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
            hasRestored: true,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await api.logout()
        } finally {
          setAuthToken(null)
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            hasRestored: true,
          })
        }
      },

      restoreAuth: async () => {
        if (restorePromise) return restorePromise

        restorePromise = (async () => {
          set({ isLoading: true })
          const token = get().token
          if (token) setAuthToken(token)

          try {
            if (token) {
              const user = mapAuthUser(unwrapAuthUser(await api.me()))
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                hasRestored: true,
              })
              return
            }

            const { user, accessToken } = await api.refresh()
            setAuthToken(accessToken)
            set({
              user: mapAuthUser(user),
              token: accessToken,
              isAuthenticated: true,
              isLoading: false,
              hasRestored: true,
            })
          } catch {
            try {
              const { user, accessToken } = await api.refresh()
              setAuthToken(accessToken)
              set({
                user: mapAuthUser(user),
                token: accessToken,
                isAuthenticated: true,
                isLoading: false,
                hasRestored: true,
              })
            } catch {
              setAuthToken(null)
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                hasRestored: true,
              })
            }
          }
        })().finally(() => {
          restorePromise = null
        })

        return restorePromise
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        setAuthToken(token)
        set({ token, isAuthenticated: !!token && !!get().user })
      },
    }
    },
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
