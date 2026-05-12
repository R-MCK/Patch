import * as SecureStore from 'expo-secure-store'

let patchAccessToken: string | null = null
const PATCH_ACCESS_TOKEN_KEY = 'patch_access_token'

function normalizeToken(token: string | null | undefined) {
  const trimmed = token?.trim()
  return trimmed ? trimmed : null
}

export function setPatchAccessToken(token: string | null | undefined) {
  patchAccessToken = normalizeToken(token)
}

export function clearPatchAccessToken() {
  patchAccessToken = null
}

export function getPatchAccessToken() {
  return patchAccessToken
}

export async function hydrateStoredPatchAccessToken() {
  try {
    const stored = await SecureStore.getItemAsync(PATCH_ACCESS_TOKEN_KEY)
    setPatchAccessToken(stored)
  } catch {
    // Ignore secure storage read failures.
  }
}

export async function persistPatchAccessToken(token: string | null | undefined) {
  const normalized = normalizeToken(token)
  setPatchAccessToken(normalized)

  try {
    if (!normalized) {
      await SecureStore.deleteItemAsync(PATCH_ACCESS_TOKEN_KEY)
      return
    }

    await SecureStore.setItemAsync(PATCH_ACCESS_TOKEN_KEY, normalized)
  } catch {
    // Ignore secure storage write failures.
  }
}

export async function clearStoredPatchAccessToken() {
  patchAccessToken = null
  try {
    await SecureStore.deleteItemAsync(PATCH_ACCESS_TOKEN_KEY)
  } catch {
    // Ignore secure storage delete failures.
  }
}

export function getPatchApiToken() {
  return normalizeToken(process.env.EXPO_PUBLIC_PATCH_API_TOKEN)
}

export function getPatchAuthToken() {
  return getPatchAccessToken() ?? getPatchApiToken()
}
