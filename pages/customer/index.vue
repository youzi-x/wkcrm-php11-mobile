<template>
  <view class="page-shell customer-page">
    <view class="customer-head">
      <view class="module-tabs">
        <text class="module-tabs__item is-active">客户</text>
        <text class="module-tabs__item" @click="openContacts">联系人</text>
      </view>
      <view class="head-actions">•••  －  ⊙</view>
    </view>

    <view class="search-panel">
      <view class="search-action" @click="openStatistics">
        <text class="search-action__icon">▥</text>
        <text>统计</text>
      </view>
      <view class="search-action" @click="openRepeat">
        <text class="search-action__icon">◎</text>
        <text>查重</text>
      </view>
      <view class="search-action" @click="openSearch">
        <text class="search-action__icon">⌕</text>
        <text>搜索</text>
      </view>
    </view>

    <view v-if="forgottenLabel" class="filter-chip-row">
      <text>筛选：{{ forgottenLabel }}</text>
      <text class="filter-chip-row__clear" @click="clearForgotten">清除</text>
    </view>

    <view class="list-tools">
      <text class="list-tools__total">客户总数：{{ total }}</text>
    </view>

    <view class="customer-list">
      <view v-for="item in list" :key="item.customer_id" class="customer-card" @click="openDetail(item)">
        <view class="customer-card__top">
          <text class="customer-card__name">{{ item.name || '未命名客户' }}</text>
          <text class="follow-btn">+关注</text>
        </view>
        <text class="customer-card__line">负责人：{{ item.owner_user_name || 'admin' }}</text>
        <text class="customer-card__line">客户等级：{{ item.level || '--' }}</text>
        <text class="customer-card__line">最后跟进时间：{{ item.last_time || item.update_time || '--' }}</text>
        <view class="customer-card__foot">
          <text class="business-count">{{ item.business_count || 0 }} 条商机</text>
          <text class="deal-status">{{ item.deal_status || '未成交' }}</text>
        </view>
      </view>
      <view v-if="!list.length" class="empty-text">暂无客户</view>
    </view>

    <button class="float-add" @click="openCreate">▤＋</button>
    <TabBar current="customer" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import { getCustomerList } from '../../api/crm'
import { ensureLogin } from '../../utils/router'

export default {
  components: { TabBar },
  data() {
    return {
      forgotten: '',
      list: [],
      total: 0
    }
  },
  computed: {
    forgottenLabel() {
      const labels = {
        sevenDays: '超过7天未联系',
        fifteenDays: '超过15天未联系',
        oneMonth: '超过30天未联系',
        threeMonth: '超过3个月未联系',
        sixMonth: '超过6个月未联系',
        unContact: '逾期未联系'
      }
      return labels[this.forgotten] || ''
    }
  },
  onLoad(options) {
    this.forgotten = options.forgotten || ''
  },
  onShow() {
    if (!ensureLogin()) return
    this.loadList()
  },
  methods: {
    async loadList() {
      const result = await getCustomerList({
        page: 1,
        limit: 20,
        otherMap: this.forgottenOtherMap()
      })
      this.list = result.list || []
      this.total = result.dataCount || this.list.length
    },
    openDetail(item) {
      uni.navigateTo({
        url: `/pages/customer/detail?id=${item.customer_id}`
      })
    },
    openCreate() {
      uni.navigateTo({ url: '/pages/customer/form' })
    },
    openContacts() {
      uni.navigateTo({ url: '/pages/contacts/index' })
    },
    openStatistics() {
      uni.navigateTo({ url: '/pages/customer/statistics' })
    },
    openRepeat() {
      uni.navigateTo({ url: '/pages/customer/repeat' })
    },
    openSearch() {
      uni.navigateTo({ url: '/pages/customer/search' })
    },
    clearForgotten() {
      this.forgotten = ''
      this.loadList()
    },
    forgottenOtherMap() {
      const now = Math.floor(Date.now() / 1000)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStart = Math.floor(today.getTime() / 1000)
      const filters = {
        sevenDays: ` ( IFNULL(last_time,create_time) < ${now - 7 * 86400}) `,
        fifteenDays: ` ( IFNULL(last_time,create_time) < ${now - 15 * 86400}) `,
        oneMonth: ` ( IFNULL(last_time,create_time) < ${now - 30 * 86400}) `,
        threeMonth: ` ( IFNULL(last_time,create_time) < ${now - 90 * 86400}) `,
        sixMonth: ` ( IFNULL(last_time,create_time) < ${now - 180 * 86400}) `,
        unContact: ` ( next_time < ${todayStart} AND (next_time) >0) `
      }
      return filters[this.forgotten] || ''
    }
  }
}
</script>

<style scoped>
.customer-page {
  min-height: 100vh;
  padding: 58rpx 20rpx 130rpx;
  background: var(--crm-page-bg);
}

.customer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.module-tabs {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.module-tabs__item {
  font-size: 32rpx;
  color: var(--crm-text);
  font-weight: 700;
}

.module-tabs__item:not(.is-active) {
  color: var(--crm-text-muted);
}

.head-actions {
  height: 52rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid var(--crm-border);
  border-radius: 999rpx;
  background: var(--crm-card-bg);
  color: var(--crm-text);
  font-size: 24rpx;
}

.search-panel {
  height: 86rpx;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  margin-bottom: 18rpx;
  border-radius: 12rpx;
  background: var(--crm-card-bg);
}

.search-action {
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  color: var(--crm-text-muted);
  font-size: 25rpx;
  border-right: 1rpx solid var(--crm-border);
}

.search-action:last-child {
  border-right: none;
}

.search-box {
  margin-bottom: 18rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  background: var(--crm-card-bg);
}

.search-input {
  height: 70rpx;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background: var(--crm-page-bg);
  font-size: 25rpx;
}

.filter-chip-row {
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
  padding: 0 18rpx;
  border-radius: 10rpx;
  background: var(--crm-card-bg);
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.filter-chip-row__clear {
  color: var(--crm-primary);
}

.list-tools {
  height: 58rpx;
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.list-tools__total {
  flex: 1;
  font-size: 27rpx;
  font-weight: 700;
  color: var(--crm-text);
}

.list-tools__item {
  padding: 0 28rpx;
  font-size: 25rpx;
  color: var(--crm-text-muted);
}

.list-tools__item.is-blue {
  color: var(--crm-primary);
}

.list-tools__split {
  width: 1rpx;
  height: 34rpx;
  background: var(--crm-border);
}

.customer-card {
  margin-bottom: 16rpx;
  padding: 22rpx 24rpx 0;
  border-radius: 10rpx;
  background: var(--crm-card-bg);
}

.customer-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.customer-card__name {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--crm-text);
}

.follow-btn {
  height: 40rpx;
  padding: 0 14rpx;
  border: 1rpx solid var(--crm-primary);
  border-radius: 999rpx;
  color: var(--crm-primary);
  line-height: 38rpx;
  font-size: 22rpx;
}

.customer-card__line {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--crm-text-muted);
}

.customer-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 62rpx;
  margin-top: 18rpx;
  border-top: 1rpx solid var(--crm-border);
}

.business-count {
  margin-left: 60rpx;
  color: var(--crm-primary);
  font-size: 24rpx;
}

.deal-status {
  padding: 6rpx 14rpx;
  border-radius: 6rpx;
  background: var(--crm-input-bg);
  color: var(--crm-text-muted);
  font-size: 23rpx;
}

.empty-text {
  padding: 80rpx 0;
  text-align: center;
  color: var(--crm-text-muted);
  font-size: 26rpx;
}

.float-add {
  position: fixed;
  right: 46rpx;
  bottom: calc(145rpx + env(safe-area-inset-bottom));
  width: 96rpx;
  height: 96rpx;
  padding: 0;
  border-radius: 50%;
  background: var(--crm-primary);
  color: #ffffff;
  box-shadow: 0 12rpx 28rpx rgba(3, 95, 213, 0.36);
  font-size: 34rpx;
  line-height: 96rpx;
}
</style>
