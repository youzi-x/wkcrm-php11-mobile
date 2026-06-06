import { getAuth, isAuthed, setAuth, clearAuth } from '../utils/storage'

function createState() {
  const auth = getAuth()
  return {
    auth,
    userInfo: auth.userInfo || {},
    menusList: auth.menusList || [],
    authList: auth.authList || []
  }
}

const state = createState()

const storeApi = {
  state,
  setLogin(data = {}) {
    const auth = {
      authKey: data.authKey || '',
      sessionId: data.sessionId || '',
      userInfo: data.userInfo || {},
      menusList: data.menusList || [],
      authList: data.authList || [],
      loginExpire: data.loginExpire || 0
    }
    state.auth = auth
    state.userInfo = auth.userInfo
    state.menusList = auth.menusList
    state.authList = auth.authList
    setAuth(auth)
  },
  logout() {
    state.auth = {}
    state.userInfo = {}
    state.menusList = []
    state.authList = []
    clearAuth()
  },
  isAuthed() {
    return isAuthed()
  }
}

export function useStore() {
  return storeApi
}

export function installStore(appOrVue) {
  if (!appOrVue) return
  appOrVue.config = appOrVue.config || {}
  appOrVue.config.globalProperties = appOrVue.config.globalProperties || {}
  appOrVue.config.globalProperties.$store = storeApi
  appOrVue.prototype && (appOrVue.prototype.$store = storeApi)
}
