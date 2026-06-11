<template>
  <view class="page-shell search-page">
    <view class="search-box">
      <input v-model="search" class="search-input" placeholder="请输入联系人姓名/手机/电话" confirm-type="search" focus @confirm="loadList" />
      <text class="search-icon" @click="loadList">⌕</text>
    </view>

    <view v-if="customerName" class="filter-chip">
      <text>所属客户：{{ customerName }}</text>
    </view>

    <view class="contact-list">
      <view v-for="item in list" :key="item.contacts_id" class="contact-card" @click="openDetail(item)">
        <view class="contact-card__top">
          <text class="contact-card__name">{{ item.name || '未命名联系人' }}</text>
          <text class="light-tag">{{ item.post || '联系人' }}</text>
        </view>
        <text class="contact-card__line">所属客户：{{ item.customer_name || customerName || '--' }}</text>
        <text class="contact-card__line">手机号：{{ item.mobile || item.phone || item.telephone || '--' }}</text>
        <text class="contact-card__line">电话：{{ item.telephone || item.phone || item.mobile || '--' }}</text>
      </view>
      <view v-if="searched && !list.length" class="empty-text">暂无联系人</view>
    </view>
  </view>
</template>

<script>
import { getContactsList } from '../../api/crm'
import { ensureLogin } from '../../utils/router'

export default {
  data() {
    return {
      search: '',
      customerId: '',
      customerName: '',
      searched: false,
      list: []
    }
  },
  onLoad(options) {
    this.customerId = options.customer_id || ''
    this.customerName = options.customer_name ? decodeURIComponent(options.customer_name) : ''
    ensureLogin()
  },
  methods: {
    async loadList() {
      const keyword = this.search.trim()
      if (!keyword) {
        uni.showToast({ title: '请输入搜索内容', icon: 'none' })
        return
      }
      const params = {
        page: 1,
        limit: 20,
        search: keyword
      }
      if (this.customerId) {
        params.customer_id = this.customerId
      }
      const result = await getContactsList(params)
      this.list = this.normalizeList(result)
      this.searched = true
    },
    normalizeList(result) {
      if (Array.isArray(result)) return result
      if (result && Array.isArray(result.list)) return result.list
      if (result && Array.isArray(result.data)) return result.data
      return []
    },
    openDetail(item) {
      uni.navigateTo({ url: `/pages/contacts/detail?id=${item.contacts_id}` })
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

.search-box,
.filter-chip {
  display: flex;
  align-items: center;
  margin-bottom: 18rpx;
  padding: 0 20rpx;
  border-radius: 12rpx;
  background: #ffffff;
}

.search-box {
  height: 82rpx;
}

.filter-chip {
  min-height: 70rpx;
  color: #607086;
  font-size: 24rpx;
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

.contact-card {
  margin-bottom: 16rpx;
  padding: 22rpx 24rpx;
  border-radius: 12rpx;
  background: #ffffff;
}

.contact-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.contact-card__name {
  font-size: 30rpx;
  font-weight: 700;
  color: #273348;
}

.light-tag {
  padding: 6rpx 14rpx;
  border-radius: 6rpx;
  background: #eef0f4;
  color: #7a8494;
  font-size: 23rpx;
}

.contact-card__line {
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
