export function formatCurrency(value) {
  const amount = Number(value || 0)
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

export function formatDate(value, withTime = false) {
  if (!value) return '--'
  const timestamp = String(value).length === 13 ? Number(value) : Number(value) * 1000
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hour = `${date.getHours()}`.padStart(2, '0')
  const minute = `${date.getMinutes()}`.padStart(2, '0')
  return withTime ? `${year}-${month}-${day} ${hour}:${minute}` : `${year}-${month}-${day}`
}

export function safeList(data, keys = ['list', 'page.list']) {
  if (Array.isArray(data)) return data
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i]
    const value = key.split('.').reduce((result, current) => {
      if (!result || typeof result !== 'object') return undefined
      return result[current]
    }, data)
    if (Array.isArray(value)) {
      return value
    }
  }
  return []
}

export function safeCount(data, keys = ['dataCount', 'page.dataCount', 'count']) {
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i]
    const value = key.split('.').reduce((result, current) => {
      if (!result || typeof result !== 'object') return undefined
      return result[current]
    }, data)
    if (value !== undefined && value !== null) {
      return Number(value) || 0
    }
  }
  return 0
}
