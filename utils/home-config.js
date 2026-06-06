import { appGrid, commonFunctionOptions, quickActionOptions, topActions } from './app-data'

const HOME_CONFIG_KEY = 'wkcrm_mobile_home_config'

function safeRead() {
  try {
    return uni.getStorageSync(HOME_CONFIG_KEY) || {}
  } catch (error) {
    return {}
  }
}

function safeWrite(config) {
  uni.setStorageSync(HOME_CONFIG_KEY, config || {})
}

function pickByKeys(options, keys) {
  const optionMap = options.reduce((map, item) => {
    map[item.key] = item
    return map
  }, {})
  return keys.map((key) => optionMap[key]).filter(Boolean)
}

function mergeWithDefaults(options, savedKeys, defaults) {
  const selected = pickByKeys(options, savedKeys || [])
  return selected.length ? selected : defaults
}

export function getHomeConfig() {
  const config = safeRead()
  return {
    quickKeys: Array.isArray(config.quickKeys) ? config.quickKeys : topActions.map((item) => item.key),
    commonKeys: Array.isArray(config.commonKeys)
      ? config.commonKeys
      : appGrid.filter((item) => item.key !== 'config').map((item) => item.key)
  }
}

export function getHomeQuickActions() {
  const config = getHomeConfig()
  return mergeWithDefaults(quickActionOptions, config.quickKeys, topActions)
}

export function getHomeCommonFunctions() {
  const config = getHomeConfig()
  const selected = mergeWithDefaults(commonFunctionOptions, config.commonKeys, appGrid.filter((item) => item.key !== 'config'))
  return [
    ...selected,
    appGrid.find((item) => item.key === 'config')
  ].filter(Boolean)
}

export function saveHomeQuickKeys(keys) {
  const config = getHomeConfig()
  safeWrite({
    ...config,
    quickKeys: keys
  })
}

export function saveHomeCommonKeys(keys) {
  const config = getHomeConfig()
  safeWrite({
    ...config,
    commonKeys: keys
  })
}
