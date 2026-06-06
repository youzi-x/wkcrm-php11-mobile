export const THEME_STORAGE_KEY = 'wkcrm_mobile_theme'
export const THEME_MODE_STORAGE_KEY = 'wkcrm_mobile_theme_mode'

const lightBase = {
  cardBg: '#ffffff',
  elevatedBg: '#ffffff',
  border: '#edf0f5',
  textMuted: '#6c7890',
  inputBg: '#f5f7fb'
}

const darkBase = {
  pageBg: '#0b1220',
  softBg: '#17243a',
  heroStart: '#192437',
  heroEnd: '#101827',
  text: '#e8eef8',
  cardBg: '#151f2f',
  elevatedBg: '#1b2739',
  border: '#29364b',
  textMuted: '#9aa8ba',
  inputBg: '#101827'
}

const darkThemeOverrides = {
  ocean: {
    primary: '#6ea0ff',
    primary2: '#94bbff',
    accent: '#4dd4d1'
  },
  forest: {
    primary: '#45d092',
    primary2: '#70e2ad',
    accent: '#f2bd5c'
  },
  sunset: {
    primary: '#ff7b5c',
    primary2: '#ffad83',
    accent: '#ffd166'
  },
  slate: {
    primary: '#9fb0c7',
    primary2: '#768aa4',
    accent: '#d1a15c'
  }
}

export const themeList = [
  {
    key: 'ocean',
    name: '海蓝',
    desc: '稳重清爽，适合默认 CRM 工作台',
    primary: '#2f6ae5',
    primary2: '#4d88ff',
    accent: '#3fc0bd',
    pageBg: '#f3f6fc',
    softBg: '#eef4ff',
    heroStart: '#eaf4ff',
    heroEnd: '#cfeaff',
    text: '#17243b'
  },
  {
    key: 'forest',
    name: '森绿',
    desc: '更柔和，适合长时间录入和查看',
    primary: '#1f9d68',
    primary2: '#37c98b',
    accent: '#f0a23a',
    pageBg: '#f3f8f1',
    softBg: '#eaf7f0',
    heroStart: '#eff9eb',
    heroEnd: '#d6f1dc',
    text: '#153628'
  },
  {
    key: 'sunset',
    name: '暖橙',
    desc: '更活跃，适合销售团队日常推进',
    primary: '#e35d3e',
    primary2: '#ff9466',
    accent: '#f5b83d',
    pageBg: '#fff7f1',
    softBg: '#fff0e8',
    heroStart: '#fff3df',
    heroEnd: '#ffd9c6',
    text: '#3a2118'
  },
  {
    key: 'slate',
    name: '曜石',
    desc: '低饱和商务风，适合项目和知识库',
    primary: '#26374d',
    primary2: '#52657e',
    accent: '#b88a44',
    pageBg: '#f4f1ea',
    softBg: '#ece8df',
    heroStart: '#f2efe8',
    heroEnd: '#d9d2c3',
    text: '#17202d'
  }
]

export function getThemeKey() {
  try {
    return uni.getStorageSync(THEME_STORAGE_KEY) || 'ocean'
  } catch (error) {
    return 'ocean'
  }
}

export function getTheme(key = getThemeKey()) {
  return themeList.find((item) => item.key === key) || themeList[0]
}

export function getThemeMode() {
  try {
    return uni.getStorageSync(THEME_MODE_STORAGE_KEY) || 'auto'
  } catch (error) {
    return 'auto'
  }
}

export function saveThemeMode(mode = 'auto') {
  const nextMode = ['auto', 'light', 'dark'].includes(mode) ? mode : 'auto'
  uni.setStorageSync(THEME_MODE_STORAGE_KEY, nextMode)
  applyTheme()
  uni.$emit('theme-updated', getTheme())
}

export function saveTheme(key) {
  uni.setStorageSync(THEME_STORAGE_KEY, key)
  applyTheme(key)
  uni.$emit('theme-updated', getTheme(key))
}

function applyCssVariable(root, name, value) {
  if (value) root.style.setProperty(name, value)
}

function getNavFrontColor(backgroundColor) {
  const color = String(backgroundColor || '').replace('#', '')
  if (color.length !== 6) return '#000000'
  const red = parseInt(color.slice(0, 2), 16)
  const green = parseInt(color.slice(2, 4), 16)
  const blue = parseInt(color.slice(4, 6), 16)
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000
  return brightness < 150 ? '#ffffff' : '#000000'
}

function isSystemDark() {
  try {
    const info = uni.getSystemInfoSync && uni.getSystemInfoSync()
    if (info && info.theme) return info.theme === 'dark'
  } catch (error) {}
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

export function isDarkMode(mode = getThemeMode()) {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return isSystemDark()
}

function resolveTheme(key = getThemeKey()) {
  const baseTheme = getTheme(key)
  const dark = isDarkMode()
  if (!dark) {
    return {
      ...lightBase,
      ...baseTheme,
      dark
    }
  }
  return {
    ...baseTheme,
    ...darkBase,
    ...(darkThemeOverrides[baseTheme.key] || darkThemeOverrides.ocean),
    dark
  }
}

let themeChangeBound = false

export function watchSystemTheme() {
  if (themeChangeBound) return
  themeChangeBound = true
  try {
    if (uni.onThemeChange) {
      uni.onThemeChange(() => applyTheme())
    }
  } catch (error) {}
  if (typeof window !== 'undefined' && window.matchMedia) {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme()
    if (media.addEventListener) {
      media.addEventListener('change', handler)
    } else if (media.addListener) {
      media.addListener(handler)
    }
  }
}

export function applyTheme(key = getThemeKey()) {
  const theme = resolveTheme(key)
  if (typeof document !== 'undefined' && document.documentElement) {
    const root = document.documentElement
    root.setAttribute('data-crm-theme', theme.key)
    root.setAttribute('data-crm-dark', theme.dark ? '1' : '0')
    applyCssVariable(root, '--crm-primary', theme.primary)
    applyCssVariable(root, '--crm-primary-2', theme.primary2)
    applyCssVariable(root, '--crm-accent', theme.accent)
    applyCssVariable(root, '--crm-page-bg', theme.pageBg)
    applyCssVariable(root, '--crm-soft-bg', theme.softBg)
    applyCssVariable(root, '--crm-hero-start', theme.heroStart)
    applyCssVariable(root, '--crm-hero-end', theme.heroEnd)
    applyCssVariable(root, '--crm-text', theme.text)
    applyCssVariable(root, '--crm-card-bg', theme.cardBg)
    applyCssVariable(root, '--crm-elevated-bg', theme.elevatedBg)
    applyCssVariable(root, '--crm-border', theme.border)
    applyCssVariable(root, '--crm-text-muted', theme.textMuted)
    applyCssVariable(root, '--crm-input-bg', theme.inputBg)
    root.style.colorScheme = theme.dark ? 'dark' : 'light'
    document.body && (document.body.style.background = theme.pageBg)
  }
  try {
    if (typeof uni !== 'undefined' && uni.setNavigationBarColor) {
      const navBg = theme.dark ? theme.pageBg : theme.primary
      uni.setNavigationBarColor({
        frontColor: getNavFrontColor(navBg),
        backgroundColor: navBg,
        animation: {
          duration: 160,
          timingFunc: 'easeIn'
        }
      })
    }
  } catch (error) {
    // Some H5 containers do not expose native navigation colors.
  }
  return theme
}
