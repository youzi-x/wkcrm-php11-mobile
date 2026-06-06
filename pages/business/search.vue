<template>
  <view class="page-shell search-page">
    <view class="search-box">
      <input v-model="search" class="search-input" placeholder="请输入商机名称/客户名称" confirm-type="search" focus @confirm="loadList" />
      <text class="search-icon" @click="loadList">⌕</text>
    </view>

    <view class="business-list">
      <view v-for="item in list" :key="item.business_id" class="business-card" @click="openDetail(item)">
        <view class="business-card__top">
          <text class="business-card__name">{{ item.name || '未命名商机' }}</text>
          <text class="status-tag">{{ item.status_id_info || '商机' }}</text>
        </view>
        <text class="business-money">￥ {{ formatMoney(item.money) }}</text>
        <text class="business-card__line">客户名称：{{ item.customer_name || '--' }}</text>
        <text class="business-card__line">负责人：{{ item.owner_user_name || 'admin' }}</text>
        <text class="business-card__line">预计成交时间：{{ item.deal_date || '--' }}</text>
      </view>
      <view v-if="searched && !list.length" class="empty-text">暂无商机</view>
    </view>
  </view>
</template>

<script>
import { getBusinessList } from '../../api/crm'
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
      const result = await getBusinessList({
        page: 1,
        limit: 20,
        search: keyword
      })
      this.list = result.list || []
      this.searched = true
    },
    formatMoney(value) {
      const number = Number(value || 0)
      return number.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    openDetail(item) {
      uni.navigateTo({ url: `/pages/business/detail?id=${item.business_id}` })
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

.business-card {
  margin-bottom: 16rpx;
  padding: 24rpx 28rpx;
  border-radius: 12rpx;
  background: #ffffff;
}

.business-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.business-card__name {
  font-size: 30rpx;
  font-weight: 500;
  color: #273348;
}

.status-tag {
  padding: 6rpx 14rpx;
  border-radius: 6rpx;
  background: var(--crm-soft-bg);
  color: var(--crm-primary);
  font-size: 22rpx;
}

.business-money {
  display: block;
  margin-bottom: 18rpx;
  color: #ff6a00;
  font-size: 28rpx;
  font-weight: 700;
}

.business-card__line {
  display: block;
  margin-top: 8rpx;
  color: #53657d;
  font-size: 25rpx;
}

.empty-text {
  padding: 80rpx 0;
  text-align: center;
  color: #8d98aa;
  font-size: 26rpx;
}
</style>

