<template>
  <view class="page-header" :style="headerStyle">
    <view class="page-header__top">
      <view>
        <text class="page-header__title">{{ title }}</text>
        <text v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</text>
      </view>
      <view v-if="showBack" class="page-header__back" @click="back">‹</view>
    </view>
    <slot />
  </view>
</template>

<script>
export default {
  props: {
    title: String,
    subtitle: String,
    showBack: {
      type: Boolean,
      default: false
    },
    compact: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    headerStyle() {
      return this.compact ? 'padding-bottom: 24rpx;' : ''
    }
  },
  methods: {
    back() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.page-header {
  padding: calc(88rpx + env(safe-area-inset-top)) 28rpx 36rpx;
  background: linear-gradient(135deg, var(--crm-primary) 0%, var(--crm-primary-2) 70%, var(--crm-primary-2) 100%);
  color: #ffffff;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow: 0 24rpx 48rpx rgba(47, 106, 229, 0.24);
}

.page-header__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-header__title {
  display: block;
  font-size: 42rpx;
  font-weight: 700;
}

.page-header__subtitle {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  opacity: 0.9;
}

.page-header__back {
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42rpx;
  line-height: 1;
}
</style>
