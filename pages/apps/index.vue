<template>
  <view class="page-shell apps-page">
    <view class="apps-head">
      <text class="apps-title">全部应用</text>
      <view class="head-actions">•••  －  ⊙</view>
    </view>

    <view v-for="group in groups" :key="group.group" class="apps-section">
      <text class="section-name">{{ group.group }}</text>
      <view class="apps-grid">
        <view v-for="item in group.items" :key="item.title" class="apps-item" @click="open(item.url)">
          <view class="apps-icon" :style="{ background: item.color || 'var(--crm-primary)' }">
            <text>{{ item.icon || item.title.slice(0, 1) }}</text>
          </view>
          <text class="apps-text">{{ item.title }}</text>
        </view>
      </view>
    </view>

    <TabBar current="" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import { allApps } from '../../utils/app-data'
import { ensureLogin, reLaunchPage } from '../../utils/router'

const TAB_PAGES = [
  '/pages/workbench/index',
  '/pages/schedule/index',
  '/pages/customer/index',
  '/pages/business/index',
  '/pages/profile/index'
]

export default {
  components: { TabBar },
  data() {
    return {
      groups: allApps
    }
  },
  onShow() {
    ensureLogin()
  },
  methods: {
    open(url) {
      if (TAB_PAGES.includes(url)) {
        reLaunchPage(url)
        return
      }
      if (url === '/pages/apps/index') return
      uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.apps-page {
  min-height: 100vh;
  padding: 58rpx 20rpx 130rpx;
  background: var(--crm-page-bg);
}

.apps-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.apps-title {
  font-size: 32rpx;
  color: #0f1724;
  font-weight: 700;
}

.head-actions {
  height: 52rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid #dfe5ef;
  border-radius: 999rpx;
  background: #ffffff;
  color: #111820;
  font-size: 24rpx;
}

.apps-section {
  margin-bottom: 18rpx;
  padding: 22rpx 10rpx 10rpx;
  border-radius: 12rpx;
  background: #ffffff;
}

.section-name {
  display: block;
  padding: 0 14rpx 18rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #111820;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  row-gap: 24rpx;
}

.apps-item {
  min-height: 122rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.apps-icon {
  width: 54rpx;
  height: 54rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  border-radius: 16rpx;
  color: #ffffff;
  font-size: 28rpx;
  box-shadow: 0 8rpx 18rpx rgba(29, 82, 150, 0.12);
}

.apps-text {
  max-width: 140rpx;
  text-align: center;
  color: #303b4f;
  font-size: 23rpx;
  line-height: 1.25;
}
</style>
