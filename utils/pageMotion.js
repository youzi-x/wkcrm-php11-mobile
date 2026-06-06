const FORWARD_OPTIONS = {
  animationType: 'slide-in-right',
  animationDuration: 420
}

const BACK_OPTIONS = {
  animationType: 'slide-out-right',
  animationDuration: 320
}

let motionTimer = null
let frameTimer = null

function patchNavigation(name, defaults) {
  if (typeof uni === 'undefined' || !uni || typeof uni[name] !== 'function') return
  if (uni[name].__wkcrmMotionPatched) return

  const original = uni[name]
  const patched = function (options = {}) {
    if (!options || typeof options !== 'object') {
      return original.call(this, options)
    }
    return original.call(this, {
      ...defaults,
      ...options
    })
  }

  patched.__wkcrmMotionPatched = true
  uni[name] = patched
}

export function installPageMotion() {
  if (typeof uni === 'undefined' || !uni || uni.__wkcrmPageMotionInstalled) return
  uni.__wkcrmPageMotionInstalled = true

  patchNavigation('navigateTo', FORWARD_OPTIONS)
  patchNavigation('redirectTo', FORWARD_OPTIONS)
  patchNavigation('reLaunch', {
    animationType: 'fade-in',
    animationDuration: 320
  })
  patchNavigation('navigateBack', BACK_OPTIONS)
}

export function triggerPageMotion() {
  // #ifdef H5
  if (typeof document === 'undefined') return
  clearTimeout(frameTimer)
  const run = () => {
    const root = document.documentElement
    const targets = document.querySelectorAll([
      'uni-page[style*="display: block"] uni-page-body > *:first-child',
      'uni-page[style*="display: block"] .uni-page-body > *:first-child',
      'uni-page-body > *:first-child',
      '.uni-page-body > *:first-child',
      'uni-page-wrapper > *:first-child',
      '.page-shell',
      '.dynamic-form-page',
      '.customer-detail-page',
      '.contacts-detail-page',
      '.business-detail-page',
      '.contract-detail-page',
      '.leads-detail-page',
      '.receivables-detail-page',
      '.task-detail-page',
      '.project-detail-page',
      '.preview-page'
    ].join(', '))
    root.classList.remove('crm-page-animating')
    document.querySelectorAll('.crm-motion-target').forEach((item) => {
      item.classList.remove('crm-motion-target')
    })
    void root.offsetWidth
    root.classList.add('crm-page-animating')
    targets.forEach((item) => {
      item.classList.add('crm-motion-target')
    })
  }

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      requestAnimationFrame(run)
    })
  } else {
    frameTimer = setTimeout(run, 32)
  }
  clearTimeout(motionTimer)
  motionTimer = setTimeout(() => {
    document.documentElement.classList.remove('crm-page-animating')
    document.querySelectorAll('.crm-motion-target').forEach((item) => {
      item.classList.remove('crm-motion-target')
    })
  }, 620)
  // #endif
}
