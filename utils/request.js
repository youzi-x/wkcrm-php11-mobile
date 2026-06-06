import { BASE_URL, PLATFORM } from './config'
import { clearAuth, getAuth } from './storage'
import { reLaunchPage } from './router'

function toQueryString(data = {}) {
  const params = []
  Object.keys(data).forEach((key) => {
    const value = data[key]
    if (value === undefined || value === null || value === '') {
      return
    }
    if (Array.isArray(value)) {
      value.forEach((item) => {
        params.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`)
      })
      return
    }
    params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  })
  return params.join('&')
}

function redirectToLogin() {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  if (current && current.route === 'pages/login/index') {
    return
  }
  reLaunchPage('/pages/login/index')
}

export function request({ url, method = 'POST', data = {}, header = {}, showError = true } = {}) {
  const auth = getAuth()
  const payload = {
    ...data,
    platform: PLATFORM
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data: payload,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authKey: auth.authKey || '',
        sessionId: auth.sessionId || '',
        ...header
      },
      dataType: 'json',
      responseType: 'text',
      success: (response) => {
        const result = response.data || {}

        if (result.code === 200) {
          resolve(result.data)
          return
        }

        if ([101, 302, 103].includes(result.code)) {
          clearAuth()
          if (showError) {
            uni.showToast({
              title: result.error || result.msg || '\u8bf7\u91cd\u65b0\u767b\u5f55',
              icon: 'none'
            })
          }
          redirectToLogin()
          reject(result)
          return
        }

        if (showError) {
          uni.showToast({
            title: result.error || result.msg || '\u8bf7\u6c42\u5931\u8d25',
            icon: 'none'
          })
        }
        reject(result)
      },
      fail: (error) => {
        if (showError) {
          uni.showToast({
            title: '\u7f51\u7edc\u8bf7\u6c42\u5931\u8d25',
            icon: 'none'
          })
        }
        reject(error)
      }
    })
  })
}

export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

export function get(url, data = {}, options = {}) {
  const query = toQueryString({
    ...data,
    platform: PLATFORM
  })
  return request({
    url: query ? `${url}?${query}` : url,
    method: 'GET',
    data: {},
    ...options
  })
}
