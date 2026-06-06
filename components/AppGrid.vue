<template>
  <view class="grid">
    <view
      v-for="item in list"
      :key="item.key"
      class="grid__item"
      @click="open(item.url)"
    >
      <view class="grid__icon" :style="{ background: item.color }">{{ item.icon }}</view>
      <text class="grid__title">{{ item.title }}</text>
    </view>
  </view>
</template>

<script>
import { appGrid } from '../utils/app-data'

export default {
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    list() {
      return this.items.length ? this.items : appGrid
    }
  },
  methods: {
    open(url) {
      uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24rpx 12rpx;
}

.grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.grid__icon {
  width: 86rpx;
  height: 86rpx;
  border-radius: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 14rpx;
  box-shadow: 0 12rpx 20rpx rgba(67, 110, 199, 0.18);
}

.grid__title {
  font-size: 24rpx;
  color: #2d3a4f;
}
</style>
