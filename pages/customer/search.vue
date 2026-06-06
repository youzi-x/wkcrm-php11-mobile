<template>
  <view class="page-shell search-page">
    <view class="search-box">
      <input v-model="search" class="search-input" placeholder="请输入客户名称/手机/电话" confirm-type="search" focus @confirm="loadList" />
      <text class="search-icon" @click="loadList">⌕</text>
    </view>

    <view class="customer-list">
      <view v-for="item in list" :key="item.customer_id" class="customer-card" @click="openDetail(item)">
        <view class="customer-card__top">
          <text class="customer-card__name">{{ item.name || '未命名客户' }}</text>
          <text class="deal-status">{{ item.deal_status || '未成交' }}</text>
        </view>
        <text class="customer-card__line">负责人：{{ item.owner_user_name || 'admin' }}</text>
        <text class="customer-card__line">手机/电话：{{ item.mobile || item.telephone || '--' }}</text>
        <text class="customer-card__line">最后跟进时间：{{ item.last_time || item.update_time || '--' }}</text>
      </view>
      <view v-if="searched && !list.length" class="empty-text">暂无客户</view>
    </view>
  </view>
</template>

<script>
import { getCustomerList } from '../../api/crm'
import { ensureLogin } from '../../utils/router'

export default {
  data() {
    return {
      search: '',
      searched: false,
      list: []
    }
  },
  onLoad() {
    ensureLogin()
  },
  methods: {
    async loadList() {
      const keyword = this.search.trim()
      if (!keyword) {
        uni.showToast({ title: '请输入搜索内容', icon: 'none' })
        return
      }
      const result = await getCustomerList({
        page: 1,
        limit: 20,
        search: keyword
      })
      this.list = result.list || []
      this.searched = true
    },
    openDetail(item) {
      uni.navigateTo({ url: `/pages/customer/detail?id=${item.customer_id}` })
    }
  }
}
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  padding: 20rpx 20rpx 40rpx;
  background: var(--crm-page-bg);
}

.search-box {
  height: 82rpx;
  display: flex;
  align-items: center;
  margin-bottom: 18rpx;
  padding: 0 20rpx;
  border-radius: 12rpx;
  background: #ffffff;
}

.search-input {
  flex: 1;
  height: 82rpx;
  font-size: 25rpx;
}

.search-icon {
  width: 54rpx;
  text-align: right;
  color: #66758a;
  font-size: 32rpx;
}

.customer-card {
  margin-bottom: 16rpx;
  padding: 22rpx 24rpx;
  border-radius: 12rpx;
  background: #ffffff;
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
  color: #273348;
}

.deal-status {
  padding: 6rpx 14rpx;
  border-radius: 6rpx;
  background: #eef0f4;
  color: #7a8494;
  font-size: 23rpx;
}

.customer-card__line {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #7b8798;
}

.empty-text {
  padding: 80rpx 0;
  text-align: center;
  color: #8d98aa;
  font-size: 26rpx;
}
</style>

