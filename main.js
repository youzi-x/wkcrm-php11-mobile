import App from './App.vue'
import { installStore } from './store'
import { installPageMotion, triggerPageMotion } from './utils/pageMotion'
import { applyTheme } from './utils/theme'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'

Vue.config.productionTip = false
installPageMotion()
installStore(Vue)
Vue.mixin({
  onShow() {
    applyTheme()
    triggerPageMotion()
  }
})
App.mpType = 'app'

const app = new Vue({
  ...App
})

app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'

export function createApp() {
  installPageMotion()
  const app = createSSRApp(App)
  installStore(app)
  app.mixin({
    onShow() {
      applyTheme()
      triggerPageMotion()
    }
  })
  return { app }
}
// #endif
