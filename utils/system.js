import { getSystemConfig } from '../api/system'

export const SYSTEM_CONFIG_KEY = 'wkcrm_mobile_system_config'
export const DEFAULT_SYSTEM_NAME = 'CRM'

function normalizeConfig(data = {}) {
  if (data && typeof data === 'object' && data.data && typeof data.data === 'object') {
    return data.data
  }
  return data && typeof data === 'object' ? data : {}
}

export function getCachedSystemConfig() {
  try {
    return uni.getStorageSync(SYSTEM_CONFIG_KEY) || {}
  } catch (error) {
    return {}
  }
}

export function setCachedSystemConfig(config = {}) {
  try {
    uni.setStorageSync(SYSTEM_CONFIG_KEY, config || {})
  } catch (error) {}
}

export function getSystemName(config = getCachedSystemConfig()) {
  const name = config && (config.name || config.company_name || config.system_name || config.title)
  const nextName = String(name || '').trim()
  return nextName || DEFAULT_SYSTEM_NAME
}

export function applySystemTitle(config = getCachedSystemConfig()) {
  const name = getSystemName(config)
  try {
    if (typeof document !== 'undefined' && document) {
      document.title = name
    }
  } catch (error) {}
  return name
}

export function applyCachedSystemTitle() {
  return applySystemTitle(getCachedSystemConfig())
}

export async function loadSystemConfig({ force = true, showError = false } = {}) {
  const cached = getCachedSystemConfig()
  if (!force && getSystemName(cached) !== DEFAULT_SYSTEM_NAME) {
    applySystemTitle(cached)
    return cached
  }

  try {
    const config = normalizeConfig(await getSystemConfig({ showError }))
    setCachedSystemConfig(config)
    applySystemTitle(config)
    try {
      uni.$emit('system-config-updated', config)
    } catch (error) {}
    return config
  } catch (error) {
    applySystemTitle(cached)
    return cached
  }
}
