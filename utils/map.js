const AMAP_SOURCE = 'wkcrm-mobile'
const TENCENT_REFERER = 'wkcrm-mobile'
export const MAP_OPTIONS = [
  { name: '百度地图', provider: 'baidu' },
  { name: '高德地图', provider: 'amap' },
  { name: '腾讯地图', provider: 'tencent' }
]

function encode(value) {
  return encodeURIComponent(String(value || '').trim())
}

function validText(value) {
  const text = String(value || '').trim()
  if (!text || text === '--') return ''
  return text
}

function toNumber(value) {
  if (value === undefined || value === null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function objectList(value) {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.reduce((list, item) => list.concat(objectList(item)), [])
  }
  if (typeof value !== 'object') return []
  return [
    value,
    value.value,
    value.location,
    value.position,
    value.point,
    value.coordinate,
    value.coords
  ].filter((item) => item && typeof item === 'object')
}

function pickAddress(source) {
  if (typeof source === 'string') return validText(source)
  for (const item of objectList(source)) {
    const address = validText(
      item.address ||
      item.detail_address ||
      item.customer_address ||
      item.address_detail ||
      item.name ||
      item.title
    )
    if (address) return address
  }
  return ''
}

function pickCoordinate(source) {
  for (const item of objectList(source)) {
    const longitude = toNumber(item.lng || item.longitude || item.lon)
    const latitude = toNumber(item.lat || item.latitude)
    if (longitude !== null && latitude !== null) {
      return { longitude, latitude }
    }
  }
  return null
}

function pickCoordinateType(source) {
  for (const item of objectList(source)) {
    const type = String(item.coordinate || item.coordinate_type || item.coord_type || item.coordType || '').toLowerCase()
    if (['gaode', 'gcj02'].includes(type)) return 'gaode'
    if (['gps', 'wgs84'].includes(type)) return 'wgs84'
    if (['baidu', 'bd09', 'bd-09'].includes(type)) return 'baidu'
  }
  return ''
}

export function isMappableField(field = {}) {
  const key = String(field.key || field.field || '').toLowerCase()
  const label = String(field.label || field.name || '')
  const formType = String(field.formType || field.form_type || '').toLowerCase()
  const value = validText(field.value)

  if (!value && !pickAddress(field.rawValue)) return false
  if (['location', 'position', 'map_address'].includes(formType)) return true
  if (key.includes('address') || key.includes('location') || key.includes('map')) return true
  return label.includes('地址') || label.includes('定位') || label.includes('位置')
}

export function normalizeMapTarget(source = {}, fallbackTitle = '') {
  const raw = source || {}
  const address = pickAddress(raw)
  const coordinate = pickCoordinate(raw)
  const coordinateType = pickCoordinateType(raw)
  const title = validText(fallbackTitle) || pickAddress({ name: raw.name || raw.label || raw.title }) || address || '位置'

  if (!address && !coordinate) return null

  return {
    title,
    address,
    longitude: coordinate ? coordinate.longitude : null,
    latitude: coordinate ? coordinate.latitude : null,
    coordinateType
  }
}

export function buildAmapUrl(target) {
  if (!target) return ''

  if (target.longitude !== null && target.latitude !== null && (!target.address || ['gaode', 'wgs84'].includes(target.coordinateType))) {
    const coordinateType = ['gaode', 'wgs84'].includes(target.coordinateType) ? target.coordinateType : 'gaode'
    return [
      'https://uri.amap.com/marker',
      `?position=${target.longitude},${target.latitude}`,
      `&name=${encode(target.title || target.address || '位置')}`,
      `&src=${AMAP_SOURCE}`,
      `&coordinate=${coordinateType}`,
      '&callnative=1'
    ].join('')
  }

  return [
    'https://uri.amap.com/search',
    `?keyword=${encode(target.address || target.title)}`,
    `&src=${AMAP_SOURCE}`,
    '&view=map',
    '&coordinate=gaode',
    '&callnative=1'
  ].join('')
}

export function buildBaiduUrl(target) {
  if (!target) return ''

  if (target.longitude !== null && target.latitude !== null && (!target.address || target.coordinateType === 'baidu' || target.coordinateType === 'bd09')) {
    return [
      'baidumap://map/marker',
      `?location=${target.latitude},${target.longitude}`,
      `&title=${encode(target.title || target.address || '位置')}`,
      `&content=${encode(target.address || target.title || '位置')}`,
      `&src=${AMAP_SOURCE}`
    ].join('')
  }

  return [
    'baidumap://map/geocoder',
    `?address=${encode(target.address || target.title)}`,
    `&src=${AMAP_SOURCE}`
  ].join('')
}

export function buildTencentUrl(target) {
  if (!target) return ''

  if (target.longitude !== null && target.latitude !== null && !target.address) {
    return [
      'https://apis.map.qq.com/uri/v1/marker',
      `?marker=coord:${target.latitude},${target.longitude}`,
      `;title:${encode(target.title || '位置')}`,
      `&referer=${TENCENT_REFERER}`
    ].join('')
  }

  return [
    'https://apis.map.qq.com/uri/v1/search',
    `?keyword=${encode(target.address || target.title)}`,
    `&referer=${TENCENT_REFERER}`
  ].join('')
}

export function buildMapUrl(provider, target) {
  if (provider === 'baidu') return buildBaiduUrl(target)
  if (provider === 'tencent') return buildTencentUrl(target)
  return buildAmapUrl(target)
}

export function buildBaiduNavigationUrl(target) {
  if (!target) return ''

  const canUsePoint = target.longitude !== null && target.latitude !== null && (!target.address || ['baidu', 'bd09'].includes(target.coordinateType))
  const destination = canUsePoint
    ? `latlng:${target.latitude},${target.longitude}|name:${target.title || target.address || '位置'}`
    : (target.address || target.title)

  return [
    'baidumap://map/direction',
    `?destination=${encode(destination)}`,
    '&mode=driving',
    `&src=${AMAP_SOURCE}`
  ].join('')
}

export function buildAmapNavigationUrl(target) {
  if (!target) return ''

  if (target.longitude !== null && target.latitude !== null && ['gaode', 'wgs84'].includes(target.coordinateType)) {
    return [
      'https://uri.amap.com/navigation',
      `?to=${target.longitude},${target.latitude},${encode(target.title || target.address || '位置')}`,
      '&mode=car',
      '&policy=1',
      `&src=${AMAP_SOURCE}`,
      `&coordinate=${target.coordinateType}`,
      '&callnative=1'
    ].join('')
  }

  return buildAmapUrl(target)
}

export function buildTencentNavigationUrl(target) {
  if (!target) return ''

  if (target.longitude !== null && target.latitude !== null && !target.address) {
    return [
      'https://apis.map.qq.com/uri/v1/routeplan',
      '?type=drive',
      `&to=${encode(target.title || '位置')}`,
      `&tocoord=${target.latitude},${target.longitude}`,
      `&referer=${TENCENT_REFERER}`
    ].join('')
  }

  return buildTencentUrl(target)
}

export function buildNavigationUrl(provider, target) {
  if (provider === 'baidu') return buildBaiduNavigationUrl(target)
  if (provider === 'tencent') return buildTencentNavigationUrl(target)
  return buildAmapNavigationUrl(target)
}

export function buildMapPreviewUrl(target) {
  const params = [
    ['title', target.title],
    ['address', target.address],
    ['lng', target.longitude],
    ['lat', target.latitude],
    ['coord', target.coordinateType]
  ]
    .filter((item) => item[1] !== undefined && item[1] !== null && item[1] !== '')
    .map((item) => `${item[0]}=${encode(item[1])}`)
    .join('&')

  return `/pages/common/map${params ? `?${params}` : ''}`
}

export function openUrl(url) {
  if (!url) return
  if (typeof plus !== 'undefined' && plus.runtime && plus.runtime.openURL) {
    plus.runtime.openURL(url)
    return
  }
  if (typeof window !== 'undefined' && window.location) {
    window.location.href = url
    return
  }
  uni.setClipboardData({
    data: url,
    success: () => uni.showToast({ title: '地图链接已复制', icon: 'none' })
  })
}

export function openMapLocation(source, fallbackTitle = '') {
  const target = normalizeMapTarget(source, fallbackTitle)
  if (!target) {
    uni.showToast({ title: '暂无可用定位', icon: 'none' })
    return
  }

  uni.navigateTo({
    url: buildMapPreviewUrl(target),
    fail: () => {
      openUrl(buildBaiduUrl(target))
    }
  })
}

export function openAmapLocation(source, fallbackTitle = '') {
  openMapLocation(source, fallbackTitle)
}
