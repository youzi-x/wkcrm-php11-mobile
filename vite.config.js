import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

const apiPrefixes = ['admin', 'crm', 'bi', 'oa', 'work']

function createApiProxy(target) {
  return apiPrefixes.reduce((proxy, prefix) => {
    proxy[`/${prefix}`] = {
      target,
      changeOrigin: true
    }
    return proxy
  }, {})
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET || 'http://wucrm'

  return {
    plugins: [uni()],
    server: {
      proxy: createApiProxy(apiTarget)
    }
  }
})
