<template>
  <view class="page-shell profile-page">
    <view class="profile-hero">
      <view class="profile-title">我的</view>
      <view class="head-actions" @click="openTabbarConfig">⚙</view>
      <view class="user-card">
        <view class="avatar">{{ avatarText }}</view>
        <view class="user-info">
          <view class="user-line">
            <text class="user-name">{{ userInfo.realname || 'admin' }}</text>
            <text class="user-badge">默认部门-标准岗位</text>
          </view>
          <text class="user-sub">{{ appName }}</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="profile-body">
      <view v-for="group in allApps" :key="group.group" class="app-section">
        <view class="app-section__title">{{ group.group }}</view>
        <view class="app-grid">
          <view v-for="item in group.items" :key="item.title" class="app-cell" @click="openApp(item)">
            <view class="app-cell__icon" :style="{ background: item.color }">{{ item.icon }}</view>
            <text class="app-cell__text">{{ item.title }}</text>
          </view>
        </view>
      </view>

      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
    <TabBar current="profile" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import { logout } from '../../api/auth'
import { allApps } from '../../utils/app-data'
import { useStore } from '../../store'
import { ensureLogin, reLaunchPage } from '../../utils/router'
import { applyCachedSystemTitle, getSystemName, loadSystemConfig } from '../../utils/system'

export default {
  components: { TabBar },
  data() {
    return {
      appName: getSystemName(),
      allApps: allApps.map((group) => ({
        ...group,
        items: [
          ...group.items,
          {
            title: '主题',
            icon: '◐',
            color: 'var(--crm-primary)',
            action: 'themeConfig'
          },
          {
            title: '设置',
            icon: '⚙',
            color: '#8a96a8',
            action: 'tabbarConfig'
          }
        ]
      }))
    }
  },
  computed: {
    userInfo() {
      return useStore().state.userInfo || {}
    },
    avatarText() {
      return (this.userInfo.realname || 'in').slice(0, 2)
    }
  },
  onShow() {
    ensureLogin()
    this.refreshSystemName()
  },
  methods: {
    async refreshSystemName() {
      this.appName = applyCachedSystemTitle()
      const config = await loadSystemConfig({ force: true })
      this.appName = getSystemName(config)
    },
    openApp(item) {
      if (item.action === 'tabbarConfig') {
        this.openTabbarConfig()
        return
      }
      if (item.action === 'themeConfig') {
        uni.navigateTo({ url: '/pages/profile/theme' })
        return
      }
      uni.navigateTo({ url: item.url })
    },
    openTabbarConfig() {
      uni.navigateTo({ url: '/pages/profile/tabbar-config' })
    },
    async handleLogout() {
      try {
        await logout()
      } catch (error) {}
      useStore().logout()
      reLaunchPage('/pages/login/index')
    }
  }
}
</script>

<style scoped>
.profile-page {
  background: var(--crm-page-bg);
}

.profile-hero {
  position: relative;
  padding: 58rpx 30rpx 28rpx;
  background: linear-gradient(135deg, var(--crm-hero-start) 0%, var(--crm-hero-end) 100%);
}

.profile-title {
  text-align: center;
  font-size: 33rpx;
  font-weight: 700;
  color: var(--crm-text);
}

.head-actions {
  position: absolute;
  right: 20rpx;
  top: 50rpx;
  width: 52rpx;
  height: 52rpx;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid var(--crm-border);
  border-radius: 50%;
  background: var(--crm-card-bg);
  color: var(--crm-text-muted);
  font-size: 26rpx;
  line-height: 1;
}

.user-card {
  display: flex;
  align-items: center;
  margin-top: 50rpx;
}

.avatar {
  width: 138rpx;
  height: 138rpx;
  border: 3rpx solid #ffffff;
  border-radius: 50%;
  background: var(--crm-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 29rpx;
}

.user-info {
  flex: 1;
  margin-left: 28rpx;
}

.user-line {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.user-name {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--crm-text);
}

.user-badge {
  padding: 4rpx 10rpx;
  border-radius: 5rpx;
  background: #fff3d8;
  color: #ff8b00;
  font-size: 22rpx;
}

.user-sub {
  display: block;
  margin-top: 14rpx;
  color: var(--crm-text-muted);
  font-size: 26rpx;
}

.arrow {
  color: var(--crm-text-muted);
  font-size: 52rpx;
}

.profile-body {
  padding: 20rpx 20rpx 130rpx;
}

.app-section {
  margin-bottom: 22rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: var(--crm-card-bg);
}

.app-section__title {
  height: 78rpx;
  padding-left: 34rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid var(--crm-border);
  color: var(--crm-text);
  font-size: 31rpx;
  font-weight: 700;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 34rpx 0;
  padding: 28rpx 18rpx 38rpx;
}

.app-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-cell__icon {
  width: 62rpx;
  height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
}

.app-cell__text {
  margin-top: 16rpx;
  color: var(--crm-text);
  font-size: 25rpx;
}

.logout-btn {
  height: 82rpx;
  margin: 20rpx 0;
  border-radius: 8rpx;
  background: var(--crm-card-bg);
  color: #d64a4a;
  font-size: 28rpx;
}
</style>
