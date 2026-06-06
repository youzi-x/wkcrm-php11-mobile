import { isAuthed } from './storage'

function fallbackHash(url) {
  // #ifdef H5
  if (typeof window !== 'undefined') {
    const path = url.startsWith('/') ? url : `/${url}`
    window.location.hash = `#${path}`
  }
  // #endif
}

export function reLaunchPage(url) {
  uni.reLaunch({
    url,
    fail: () => fallbackHash(url)
  })
}

export function ensureLogin() {
  if (isAuthed()) {
    return true
  }
  reLaunchPage('/pages/login/index')
  return false
}

export function openPage(url) {
  if (!ensureLogin()) {
    return
  }
  uni.navigateTo({ url })
}
