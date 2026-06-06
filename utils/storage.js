import { STORAGE_KEY } from './config'

export function getAuth() {
  try {
    return uni.getStorageSync(STORAGE_KEY) || {}
  } catch (error) {
    return {}
  }
}

export function setAuth(payload) {
  uni.setStorageSync(STORAGE_KEY, payload || {})
}

export function clearAuth() {
  uni.removeStorageSync(STORAGE_KEY)
}

export function isAuthed() {
  const auth = getAuth()
  return !!(auth.authKey && auth.sessionId)
}
