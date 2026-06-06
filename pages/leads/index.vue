<template>
  <view class="page-shell crm-list-page">
    <view class="list-head">
      <text class="page-title">线索</text>
      <view class="head-actions">•••  －  ⊙</view>
    </view>

    <view class="search-box">
      <input v-model="search" class="search-input" placeholder="搜索线索名称 / 手机 / 电话" confirm-type="search" @confirm="loadList" />
    </view>

    <view class="list-tools">
      <text class="list-tools__total">线索总数：{{ total }}</text>
    </view>

    <view class="card-list">
      <view v-for="item in list" :key="item.leads_id" class="data-card" @click="openDetail(item)">
        <view class="data-card__top">
          <text class="data-card__name">{{ item.name || '未命名线索' }}</text>
          <text class="status-tag">{{ Number(item.is_transform || 0) ? '已转化' : '未转化' }}</text>
        </view>
        <text class="data-card__line">手机号：{{ item.mobile || '--' }}</text>
        <text class="data-card__line">电话：{{ item.telephone || '--' }}</text>
        <text class="data-card__line">线索来源：{{ item.source || '--' }}</text>
        <view class="data-card__foot">
          <text class="blue-text">{{ item.owner_user_name || 'admin' }}</text>
          <text class="muted">{{ item.update_time || '--' }}</text>
        </view>
      </view>
      <view v-if="!list.length" class="empty-text">暂无线索</view>
    </view>

    <button class="float-add" @click="openCreate">▤＋</button>
    <TabBar current="leads" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import { getLeadsList } from '../../api/crm'
import { ensureLogin } from '../../utils/router'

export default {
  components: { TabBar },
  data() {
    return {
      search: '',
      list: [],
      total: 0
    }
  },
  onShow() {
    if (!ensureLogin()) return
    this.loadList()
  },
  methods: {
    async loadList() {
      const result = await getLeadsList({
        page: 1,
        limit: 20,
        search: this.search
      })
      this.list = result.list || []
      this.total = result.dataCount || this.list.length
    },
    openDetail(item) {
      uni.navigateTo({
        url: `/pages/leads/detail?id=${item.leads_id}`
      })
    },
    openCreate() {
      uni.navigateTo({ url: '/pages/leads/form' })
    }
  }
}
</script>

<style scoped>
.crm-list-page {
  min-height: 100vh;
  padding: 58rpx 20rpx 130rpx;
  background: var(--crm-page-bg);
}

.list-head,
.data-card__top,
.data-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-head {
  margin-bottom: 20rpx;
}

.page-title {
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

.search-panel {
  height: 86rpx;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  margin-bottom: 18rpx;
  border-radius: 12rpx;
  background: #ffffff;
}

.search-action {
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  color: #607086;
  font-size: 25rpx;
  border-right: 1rpx solid #edf0f5;
}

.search-action:last-child {
  border-right: none;
}

.search-box {
  margin-bottom: 18rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  background: #ffffff;
}

.search-input {
  height: 70rpx;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background: var(--crm-page-bg);
  font-size: 25rpx;
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
  color: #111820;
}

.list-tools__item {
  padding: 0 28rpx;
  font-size: 25rpx;
  color: #65758a;
}

.list-tools__item.is-blue,
.blue-text {
  color: var(--crm-primary);
}

.list-tools__split {
  width: 1rpx;
  height: 34rpx;
  background: #d9dee8;
}

.data-card {
  margin-bottom: 16rpx;
  padding: 22rpx 24rpx 0;
  border-radius: 10rpx;
  background: #ffffff;
}

.data-card__top {
  margin-bottom: 16rpx;
}

.data-card__name {
  font-size: 30rpx;
  font-weight: 700;
  color: #273348;
}

.status-tag {
  padding: 6rpx 14rpx;
  border-radius: 6rpx;
  background: #eef0f4;
  color: #7a8494;
  font-size: 23rpx;
}

.data-card__line {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #7b8798;
}

.data-card__foot {
  height: 62rpx;
  margin-top: 18rpx;
  border-top: 1rpx solid #edf0f5;
  font-size: 24rpx;
}

.muted {
  color: #8d98aa;
}

.empty-text {
  padding: 80rpx 0;
  text-align: center;
  color: #8d98aa;
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
