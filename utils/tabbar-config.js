import { tabbarList, tabbarOptions } from './app-data'

const TABBAR_CONFIG_KEY = 'wkcrm_mobile_tabbar_config'

function readKeys() {
  try {
    const keys = uni.getStorageSync(TABBAR_CONFIG_KEY)
    return Array.isArray(keys) ? keys : tabbarList.map((item) => item.key)
  } catch (error) {
    return tabbarList.map((item) => item.key)
  }
}

function pickOptions(keys) {
  const optionMap = tabbarOptions.reduce((map, item) => {
    map[item.key] = item
    return map
  }, {})
  return keys.map((key) => optionMap[key]).filter(Boolean)
}

export function getTabbarKeys() {
  const keys = readKeys()
  const requiredKeys = tabbarOptions.filter((item) => item.required).map((item) => item.key)
  const merged = [...keys, ...requiredKeys].filter((key, index, list) => list.indexOf(key) === index)
  while (merged.length > 5) {
    const removableIndex = [...merged].reverse().findIndex((key) => !requiredKeys.includes(key))
    if (removableIndex < 0) break
    merged.splice(merged.length - 1 - removableIndex, 1)
  }
  return pickOptions(merged).map((item) => item.key)
}

export function getConfiguredTabbarList() {
  const selected = pickOptions(getTabbarKeys())
  return selected.length ? selected : tabbarList
}

export function saveTabbarKeys(keys) {
  const requiredKeys = tabbarOptions.filter((item) => item.required).map((item) => item.key)
  const merged = [...keys, ...requiredKeys].filter((key, index, list) => list.indexOf(key) === index)
  while (merged.length > 5) {
    const removableIndex = [...merged].reverse().findIndex((key) => !requiredKeys.includes(key))
    if (removableIndex < 0) break
    merged.splice(merged.length - 1 - removableIndex, 1)
  }
  uni.setStorageSync(TABBAR_CONFIG_KEY, pickOptions(merged).map((item) => item.key))
}
