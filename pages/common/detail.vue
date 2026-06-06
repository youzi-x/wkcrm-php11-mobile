<template>
  <view class="detail-page">
    <view class="panel-card detail-card">
      <view class="section-title">
        <text class="section-title__text">{{ title }}</text>
      </view>
      <view v-for="item in rows" :key="item.label" class="field-row">
        <text class="field-row__label">{{ item.label }}</text>
        <text class="field-row__value">{{ item.value }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      title: '详情',
      rows: []
    }
  },
  onLoad(options) {
    this.title = options.title || '详情'
  }
}
</script>

<style scoped>
.detail-page {
  padding: 24rpx;
}

.detail-card {
  padding: 28rpx;
}

.field-row {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #edf2f8;
}

.field-row:last-child {
  border-bottom: none;
}

.field-row__label {
  width: 140rpx;
  color: #8694a7;
  font-size: 24rpx;
}

.field-row__value {
  flex: 1;
  text-align: right;
  color: #25364d;
  font-size: 24rpx;
}
</style>
