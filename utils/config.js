function resolveBaseUrl() {
  if (typeof window === 'undefined' || !window.location) return '/'
  return `${window.location.origin}/`
}

export const BASE_URL = resolveBaseUrl()
export const STORAGE_KEY = 'wkcrm_mobile_auth'
export const PLATFORM = 'mobile'
export const BAIDU_MAP_AK = (typeof window !== 'undefined' && (window.WKCRM_BAIDU_MAP_AK || window.BAIDU_MAP_AK)) || 'g4D9pzuFnwjVVpUCDvQ6vhkSfPDx7V3q'

export const TIME_FILTERS = [
  { label: '\u4eca\u5929', value: 'today' },
  { label: '\u672c\u5468', value: 'week' },
  { label: '\u672c\u6708', value: 'month' },
  { label: '\u672c\u5e74', value: 'year' }
]
