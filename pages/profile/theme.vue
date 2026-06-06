<template>
  <view class="theme-page">
    <view class="theme-head">
      <text class="theme-title">更换主题</text>
      <text class="theme-sub">选择一套颜色风格，首页、导航和主要按钮会同步变化。</text>
    </view>

    <view class="mode-card">
      <view class="mode-title-row">
        <text class="mode-title">显示模式</text>
        <text class="mode-tip">默认跟随手机系统</text>
      </view>
      <view class="mode-segments">
        <view
          v-for="item in modeOptions"
          :key="item.value"
          class="mode-segment"
          :class="{ 'is-active': currentMode === item.value }"
          @click="selectMode(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
    </view>

    <view class="theme-list">
      <view
        v-for="item in themes"
        :key="item.key"
        class="theme-card"
        :class="{ 'is-active': currentKey === item.key }"
        @click="selectTheme(item)"
      >
        <view class="theme-preview" :style="{ background: previewBackground(item) }">
          <view class="preview-top"></view>
          <view class="preview-row">
            <text class="preview-dot" :style="{ background: item.accent }"></text>
            <text class="preview-line"></text>
          </view>
          <view class="preview-button" :style="{ background: item.primary }"></view>
        </view>
        <view class="theme-info">
          <view class="theme-name-row">
            <text class="theme-name">{{ item.name }}</text>
            <text v-if="currentKey === item.key" class="active-badge">当前</text>
          </view>
          <text class="theme-desc">{{ item.desc }}</text>
          <view class="color-row">
            <text class="color-dot" :style="{ background: item.primary }"></text>
            <text class="color-dot" :style="{ background: item.primary2 }"></text>
            <text class="color-dot" :style="{ background: item.accent }"></text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { applyTheme, getThemeKey, getThemeMode, saveTheme, saveThemeMode, themeList } from '../../utils/theme'
import { ensureLogin } from '../../utils/router'

export default {
  data() {
    return {
      themes: themeList,
      currentKey: 'ocean',
      currentMode: 'auto',
      modeOptions: [
        { label: '跟随系统', value: 'auto' },
        { label: '浅色', value: 'light' },
        { label: '深色', value: 'dark' }
      ]
    }
  },
  onLoad() {
    if (!ensureLogin()) return
    this.currentKey = getThemeKey()
    this.currentMode = getThemeMode()
    applyTheme(this.currentKey)
  },
  methods: {
    previewBackground(item) {
      return `linear-gradient(135deg, ${item.heroStart}, ${item.heroEnd})`
    },
    selectTheme(item) {
      this.currentKey = item.key
      saveTheme(item.key)
      uni.showToast({ title: `已切换为${item.name}`, icon: 'success' })
    },
    selectMode(mode) {
      this.currentMode = mode
      saveThemeMode(mode)
      applyTheme(this.currentKey)
    }
  }
}
</script>

<style scoped>
.theme-page {
  min-height: 100vh;
  padding: 28rpx 22rpx 120rpx;
  background-color: var(--crm-page-bg);
}

.theme-head {
  padding: 28rpx 24rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, var(--crm-hero-start), var(--crm-hero-end));
}

.theme-title {
  display: block;
  color: var(--crm-text);
  font-size: 34rpx;
  font-weight: 800;
}

.theme-sub {
  display: block;
  margin-top: 12rpx;
  color: #607086;
  font-size: 24rpx;
  line-height: 1.5;
}

.theme-list {
  margin-top: 22rpx;
}

.mode-card {
  margin-top: 22rpx;
  padding: 22rpx;
  border-radius: 14rpx;
  background-color: var(--crm-card-bg);
  box-shadow: 0 12rpx 28rpx rgba(26, 53, 91, 0.06);
}

.mode-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mode-title {
  color: var(--crm-text);
  font-size: 29rpx;
  font-weight: 800;
}

.mode-tip {
  color: var(--crm-text-muted);
  font-size: 23rpx;
}

.mode-segments {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 18rpx;
  padding: 8rpx;
  border-radius: 12rpx;
  background-color: var(--crm-input-bg);
}

.mode-segment {
  height: 58rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.mode-segment.is-active {
  background-color: var(--crm-primary);
  color: #ffffff;
  font-weight: 700;
}

.theme-card {
  display: flex;
  gap: 22rpx;
  margin-bottom: 20rpx;
  padding: 22rpx;
  border: 2rpx solid transparent;
  border-radius: 14rpx;
  background-color: var(--crm-card-bg);
  box-shadow: 0 12rpx 28rpx rgba(26, 53, 91, 0.06);
}

.theme-card.is-active {
  border-color: var(--crm-primary);
}

.theme-preview {
  width: 190rpx;
  height: 150rpx;
  padding: 16rpx;
  border-radius: 12rpx;
}

.preview-top {
  width: 64rpx;
  height: 24rpx;
  border-radius: 999rpx;
  background-color: rgba(255, 255, 255, 0.88);
}

.preview-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 28rpx;
}

.preview-dot {
  width: 26rpx;
  height: 26rpx;
  border-radius: 50%;
}

.preview-line {
  flex: 1;
  height: 18rpx;
  border-radius: 999rpx;
  background-color: rgba(255, 255, 255, 0.82);
}

.preview-button {
  width: 100rpx;
  height: 28rpx;
  margin-top: 26rpx;
  border-radius: 999rpx;
}

.theme-info {
  flex: 1;
}

.theme-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.theme-name {
  color: var(--crm-text);
  font-size: 30rpx;
  font-weight: 800;
}

.active-badge {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background-color: var(--crm-soft-bg);
  color: var(--crm-primary);
  font-size: 22rpx;
}

.theme-desc {
  display: block;
  margin-top: 10rpx;
  color: #7b8798;
  font-size: 24rpx;
  line-height: 1.45;
}

.color-row {
  display: flex;
  gap: 10rpx;
  margin-top: 18rpx;
}

.color-dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
}
</style>
