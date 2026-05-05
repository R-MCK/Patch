import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { PatchApiClient } from '@patch/api'

function getExpoHostBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost
  const host = hostUri?.split(':')[0]

  return host ? `http://${host}:3000` : undefined
}

export function getPatchApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_PATCH_API_URL

  if (configuredUrl) {
    return configuredUrl
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000'
  }

  return getExpoHostBaseUrl() ?? 'http://localhost:3000'
}

export const patchApiBaseUrl = getPatchApiBaseUrl()

export const patchApiClient = new PatchApiClient({
  baseUrl: patchApiBaseUrl,
})

