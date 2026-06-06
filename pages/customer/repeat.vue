<template>
  <view class="page-shell repeat-page">
    <view class="search-card">
      <picker :range="typeOptions" range-key="label" :value="typeIndex" @change="changeType">
        <view class="type-select">
          <text>{{ currentType.label }}</text>
          <text class="filter-arrow">⌄</text>
        </view>
      </picker>
      <input v-model="content" class="search-input" :placeholder="currentType.placeholder" confirm-type="search" @confirm="loadList" />
      <text class="inline-search" @click="loadList">⌕</text>
    </view>

    <view class="repeat-tip">注：查重结果最多显示10条，如不完整，请完善查重条件</view>

    <view class="result-list">
      <view v-for="item in list" :key="item.type + '-' + item.id" class="result-card" @click="openResult(item)">
        <view class="result-card__top">
          <text class="result-card__name">{{ item.name || '未命名' }}</text>
          <text class="module-tag">{{ item.module || '--' }}</text>
        </view>
        <text class="result-card__line">负责人：{{ item.owner_user_name || '--' }}</text>
        <text class="result-card__line">手机/电话：{{ item.mobile || item.telephone || '--' }}</text>
        <text class="result-card__line">创建时间：{{ item.create_time || '--' }}</text>
      </view>
      <view v-if="searched && !list.length" class="empty-box">
        <text class="empty-icon">⌕</text>
        <text>暂无重复数据</text>
      </view>
    </view>
  </view>
</template>

<script>
import { queryCustomerRepeat } from '../../api/crm'
import { ensureLogin } from '../../utils/router'

export default {
  data() {
    return {
      content: '',
      typeIndex: 0,
      searched: false,
      list: [],
      typeOptions: [
        { label: '按客户名称', value: 'name', placeholder: '请输入客户名称' },
        { label: '按手机/电话', value: 'phone', placeholder: '请输入手机或电话' }
      ]
    }
  },
  computed: {
    currentType() {
      return this.typeOptions[this.typeIndex] || this.typeOptions[0]
    }
  },
  onLoad() {
    ensureLogin()
  },
  methods: {
    async loadList() {
      const keyword = this.content.trim()
      if (!keyword) {
        uni.showToast({ title: '请输入查重内容', icon: 'none' })
        return
      }
      const result = await queryCustomerRepeat({
        type: this.currentType.value,
        content: keyword
      })
      this.list = Array.isArray(result) ? result : []
      this.searched = true
    },
    changeType(event) {
      this.typeIndex = Number(event.detail.value || 0)
      this.list = []
      this.searched = false
    },
    openResult(item) {
      if (Number(item.type) === 1) {
        uni.navigateTo({ url: `/pages/leads/detail?id=${item.id}` })
        return
      }
      if ([2, 9].includes(Number(item.type))) {
        uni.navigateTo({ url: `/pages/customer/detail?id=${item.id}` })
      }
    }
  }
}
</script>

<style scoped>
.repeat-page {
  min-height: 100vh;
  padding: 20rpx 20rpx 40rpx;
  background: var(--crm-page-bg);
}

.search-card {
  display: grid;
  grid-template-columns: 210rpx minmax(0, 1fr) 64rpx;
  align-items: center;
  min-height: 88rpx;
  border-radius: 12rpx;
  background: #ffffff;
}

.type-select {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border-right: 1rpx solid #edf0f5;
  color: #313b4b;
  font-size: 25rpx;
}

.filter-arrow {
  color: #8792a3;
  font-size: 22rpx;
}

.search-input {
  height: 88rpx;
  padding: 0 22rpx;
  font-size: 25rpx;
}

.inline-search {
  width: 64rpx;
  color: #66758a;
  text-align: center;
  font-size: 32rpx;
}

.repeat-tip {
  margin: 18rpx 4rpx;
  color: #8b95a6;
  font-size: 23rpx;
}

.result-card {
  margin-bottom: 14rpx;
  padding: 22rpx 24rpx;
  border-radius: 12rpx;
  background: #ffffff;
}

.result-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.result-card__name {
  font-size: 29rpx;
  font-weight: 700;
  color: #273348;
}

.module-tag {
  padding: 6rpx 14rpx;
  border-radius: 6rpx;
  background: var(--crm-soft-bg);
  color: var(--crm-primary);
  font-size: 22rpx;
}

.result-card__line {
  display: block;
  margin-top: 8rpx;
  color: #7b8798;
  font-size: 24rpx;
}

.empty-box {
  min-height: 360rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  color: #8d98aa;
  font-size: 26rpx;
}

.empty-icon {
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: #ffffff;
  color: #b8c1cf;
  text-align: center;
  line-height: 104rpx;
  font-size: 44rpx;
}
</style>

