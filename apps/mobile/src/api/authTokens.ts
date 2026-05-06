let patchAccessToken: string | null = null

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

export function getPatchApiToken() {
  return normalizeToken(process.env.EXPO_PUBLIC_PATCH_API_TOKEN)
}

export function getPatchAuthToken() {
  return getPatchAccessToken() ?? getPatchApiToken()
}
