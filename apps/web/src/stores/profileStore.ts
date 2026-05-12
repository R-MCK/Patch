import { create } from 'zustand'
import type { UserProfile } from '@/types'
import { api } from '@/lib/api'

const ONBOARDING_SKIP_KEY = 'patch-web-onboarding-skipped'

interface ProfileState {
  profile: UserProfile | null
  isLoading: boolean
  hasLoaded: boolean
  error: string | null
  onboardingSkipped: boolean
}

interface ProfileActions {
  fetchProfile: () => Promise<UserProfile | null>
  updateProfile: (payload: {
    country?: string | null
    region?: string | null
    postcode?: string | null
    units?: 'imperial' | 'metric' | null
    experience_level?: string | null
    goals?: string | null
    climate_notes?: string | null
  }) => Promise<UserProfile>
  skipOnboarding: () => void
  clearOnboardingSkip: () => void
  resetProfileState: () => void
}

const readOnboardingSkip = (): boolean => {
  try {
    return localStorage.getItem(ONBOARDING_SKIP_KEY) === '1'
  } catch {
    return false
  }
}

const writeOnboardingSkip = (value: boolean): void => {
  try {
    localStorage.setItem(ONBOARDING_SKIP_KEY, value ? '1' : '0')
  } catch {
    // Ignore storage failures.
  }
}

export const useProfileStore = create<ProfileState & ProfileActions>()((set) => ({
  profile: null,
  isLoading: false,
  hasLoaded: false,
  error: null,
  onboardingSkipped: readOnboardingSkip(),

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const profile = await api.getProfile()
      set({ profile, isLoading: false, hasLoaded: true })
      return profile
    } catch (error) {
      set({
        isLoading: false,
        hasLoaded: true,
        error: error instanceof Error ? error.message : String(error),
      })
      return null
    }
  },

  updateProfile: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const profile = await api.updateProfile(payload)
      set({
        profile,
        isLoading: false,
        hasLoaded: true,
        onboardingSkipped: false,
      })
      writeOnboardingSkip(false)
      return profile
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({ isLoading: false, error: message })
      throw error
    }
  },

  skipOnboarding: () => {
    writeOnboardingSkip(true)
    set({ onboardingSkipped: true })
  },

  clearOnboardingSkip: () => {
    writeOnboardingSkip(false)
    set({ onboardingSkipped: false })
  },

  resetProfileState: () => {
    set({
      profile: null,
      isLoading: false,
      hasLoaded: false,
      error: null,
      onboardingSkipped: readOnboardingSkip(),
    })
  },
}))
