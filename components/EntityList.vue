<template>
  <view class="entity-list">
    <view v-for="item in items" :key="item[idKey] || item.id" class="entity-item" @click="$emit('select', item)">
      <view class="entity-item__head">
        <text class="entity-item__title">{{ item[titleKey] || item.name || '未命名' }}</text>
        <text v-if="item[tagKey]" class="tag-pill">{{ item[tagKey] }}</text>
      </view>
      <view class="entity-item__meta">
        <text v-if="item[ownerKey]">负责人：{{ item[ownerKey] }}</text>
        <text v-if="item[timeKey]">{{ item[timeKey] }}</text>
      </view>
      <text v-if="item[descKey]" class="entity-item__desc">{{ item[descKey] }}</text>
    </view>
    <view v-if="!items.length" class="entity-empty">暂无数据</view>
  </view>
</template>

<script>
export default {
  emits: ['select'],
  props: {
    items: {
      type: Array,
      default: () => []
    },
    idKey: {
      type: String,
      default: 'id'
    },
    titleKey: {
      type: String,
      default: 'name'
    },
    descKey: {
      type: String,
      default: 'content'
    },
    ownerKey: {
      type: String,
      default: 'owner_user_name'
    },
    timeKey: {
      type: String,
      default: 'update_time'
    },
    tagKey: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.entity-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.entity-item {
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 34rpx rgba(37, 66, 125, 0.08);
}

.entity-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.entity-item__title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  color: #20304a;
}

.entity-item__meta {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 14rpx;
  font-size: 22rpx;
  color: #8b98ab;
}

.entity-item__desc {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  color: #617287;
  line-height: 1.6;
}

.entity-empty {
  padding: 60rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #97a4b5;
}
</style>
