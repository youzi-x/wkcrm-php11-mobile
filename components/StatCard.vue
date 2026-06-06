<template>
  <view class="stat-card">
    <text class="stat-card__label">{{ label }}</text>
    <text class="stat-card__value">{{ value }}</text>
    <text class="stat-card__extra" :class="{ 'is-up': trend > 0 }">{{ trendText }}</text>
  </view>
</template>

<script>
export default {
  props: {
    label: String,
    value: [String, Number],
    trend: {
      type: Number,
      default: 0
    }
  },
  computed: {
    trendText() {
      if (!this.trend) return '较上期持平'
      const prefix = this.trend > 0 ? '+' : ''
      return `较上期 ${prefix}${(this.trend * 100).toFixed(0)}%`
    }
  }
}
</script>

<style scoped>
.stat-card {
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: inset 0 0 0 1rpx rgba(47, 106, 229, 0.06);
}

.stat-card__label {
  display: block;
  font-size: 24rpx;
  color: #8091a7;
  margin-bottom: 12rpx;
}

.stat-card__value {
  display: block;
  font-size: 38rpx;
  font-weight: 700;
  color: #20304a;
  margin-bottom: 10rpx;
}

.stat-card__extra {
  font-size: 22rpx;
  color: #8ea0b6;
}

.is-up {
  color: #00a870;
}
</style>
