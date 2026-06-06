<template>
  <view class="tabbar">
    <view
      v-for="item in items"
      :key="item.key"
      class="tabbar__item"
      :class="{ 'is-active': current === item.key }"
      @click="handleClick(item)"
    >
      <view class="tabbar__icon-wrap">
        <text class="tabbar__icon">{{ item.icon }}</text>
      </view>
      <text class="tabbar__text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
import { getConfiguredTabbarList } from '../utils/tabbar-config'
import { applyTheme } from '../utils/theme'
import { reLaunchPage } from '../utils/router'

export default {
  props: {
    current: {
      type: String,
      default: 'workbench'
    }
  },
  data() {
    return {
      items: getConfiguredTabbarList()
    }
  },
  mounted() {
    applyTheme()
    uni.$on('tabbar-config-updated', this.refreshItems)
    uni.$on('theme-updated', this.refreshTheme)
  },
  beforeDestroy() {
    uni.$off('tabbar-config-updated', this.refreshItems)
    uni.$off('theme-updated', this.refreshTheme)
  },
  beforeUnmount() {
    uni.$off('tabbar-config-updated', this.refreshItems)
    uni.$off('theme-updated', this.refreshTheme)
  },
  unmounted() {
    uni.$off('tabbar-config-updated', this.refreshItems)
    uni.$off('theme-updated', this.refreshTheme)
  },
  methods: {
    refreshItems() {
      this.items = getConfiguredTabbarList()
    },
    refreshTheme() {
      applyTheme()
    },
    handleClick(item) {
      if (item.key === this.current) return
      reLaunchPage(item.url)
    }
  }
}
</script>

<style scoped>
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(98rpx + env(safe-area-inset-bottom));
  padding: 8rpx 6rpx calc(8rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #edf1f7;
  background: #ffffff;
  z-index: 30;
}

.tabbar__item {
  position: relative;
  flex: 1;
  height: 82rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #22324a;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.tabbar__icon-wrap {
  width: 42rpx;
  height: 42rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;
  transition: background-color 0.18s ease;
}

.tabbar__icon {
  font-size: 30rpx;
  line-height: 1;
}

.tabbar__text {
  font-size: 21rpx;
  line-height: 1;
}

.is-active {
  background: transparent;
  color: var(--crm-primary);
  font-weight: 600;
}

.is-active .tabbar__icon-wrap {
  background: transparent;
}
</style>
