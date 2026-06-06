<template>
  <view class="page-shell business-page">
    <view class="business-head">
      <view class="module-tabs">
        <text class="module-tabs__item" :class="{ 'is-active': activeTab === 'business' }" @click="switchTab('business')">商机</text>
        <text class="module-tabs__item" :class="{ 'is-active': activeTab === 'contract' }" @click="switchTab('contract')">合同</text>
        <text class="module-tabs__item" :class="{ 'is-active': activeTab === 'receivables' }" @click="switchTab('receivables')">回款</text>
      </view>
      <view class="head-actions">•••  －  ⊙</view>
    </view>

    <view class="action-panel">
      <view class="action-item" @click="openStatistics">
        <text class="action-icon">◷</text>
        <text>统计</text>
      </view>
      <view class="action-item" @click="openSearch">
        <text class="action-icon">⌕</text>
        <text>搜索</text>
      </view>
    </view>

    <view class="filter-row">
      <view class="filter-item">
        <text class="filter-arrow">⌄</text>
        <text>{{ groupLabel }}</text>
      </view>
      <view class="filter-split"></view>
      <view class="filter-item">
        <text class="filter-arrow">⌄</text>
        <text>排序</text>
      </view>
      <view class="filter-split"></view>
      <view class="filter-item is-blue">
        <text class="filter-arrow">⌄</text>
        <text>筛选</text>
      </view>
    </view>

    <view v-if="activeTab === 'business'" class="business-list">
      <view v-for="item in businessList" :key="item.business_id" class="business-card" @click="openBusinessDetail(item)">
        <view class="business-card__top">
          <text class="business-card__name">{{ item.name || '未命名商机' }}</text>
          <text class="follow-btn">+关注</text>
        </view>
        <text class="business-money">￥ {{ formatMoney(item.money) }}</text>
        <view class="business-fields">
          <text class="business-card__line">客户名称：{{ item.customer_name || '--' }}</text>
          <text class="business-card__line">商机阶段：{{ businessStatus(item) }}</text>
          <text class="business-card__line">负责人：{{ item.owner_user_name || 'admin' }}</text>
        </view>
        <view class="business-card__foot">
          <text>预计成交时间：{{ item.deal_date || '--' }}</text>
        </view>
      </view>
      <view v-if="!businessList.length" class="empty-text">暂无商机</view>
    </view>

    <view v-else-if="activeTab === 'contract'" class="business-list">
      <view v-for="item in contractList" :key="item.contract_id" class="business-card" @click="openContractDetail(item)">
        <view class="business-card__top">
          <text class="business-card__name">{{ item.name || '未命名合同' }}</text>
          <text class="status-tag">{{ item.check_status_info || '合同' }}</text>
        </view>
        <text class="business-money">￥ {{ formatMoney(item.money) }}</text>
        <view class="business-fields">
          <text class="business-card__line">客户名称：{{ item.customer_name || '--' }}</text>
          <text class="business-card__line">合同编号：{{ item.num || '--' }}</text>
          <text class="business-card__line">负责人：{{ item.owner_user_name || 'admin' }}</text>
        </view>
        <view class="business-card__foot">
          <text>{{ item.update_time || '--' }}</text>
        </view>
      </view>
      <view v-if="!contractList.length" class="empty-text">暂无合同</view>
    </view>

    <view v-else class="business-list">
      <view v-for="item in receivablesList" :key="item.receivables_id" class="business-card" @click="openReceivablesDetail(item)">
        <view class="business-card__top">
          <text class="business-card__name">{{ item.number || item.name || '未命名回款' }}</text>
          <text class="status-tag">{{ item.check_status_info || '回款' }}</text>
        </view>
        <text class="business-money">￥ {{ formatMoney(item.money) }}</text>
        <view class="business-fields">
          <text class="business-card__line">客户名称：{{ item.customer_name || '--' }}</text>
          <text class="business-card__line">合同编号：{{ item.contract_num || '--' }}</text>
          <text class="business-card__line">回款日期：{{ item.return_time || '--' }}</text>
        </view>
        <view class="business-card__foot">
          <text>负责人：{{ item.owner_user_name || 'admin' }}</text>
        </view>
      </view>
      <view v-if="!receivablesList.length" class="empty-text">暂无回款</view>
    </view>

    <button v-if="activeTab === 'business'" class="float-add" @click="openCreate">▤＋</button>
    <TabBar current="business" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import { getBusinessList, getContractList, getReceivablesList } from '../../api/crm'
import { ensureLogin } from '../../utils/router'

export default {
  components: { TabBar },
  data() {
    return {
      activeTab: 'business',
      businessList: [],
      contractList: [],
      receivablesList: [],
      totals: {
        business: 0,
        contract: 0,
        receivables: 0
      },
      sumMoney: '0.00',
      loadedTabs: {
        business: false,
        contract: false,
        receivables: false
      }
    }
  },
  computed: {
    groupLabel() {
      const labels = {
        business: '全部商机组',
        contract: '全部合同',
        receivables: '全部回款'
      }
      return labels[this.activeTab] || '全部'
    }
  },
  onShow() {
    if (!ensureLogin()) return
    this.loadCurrentTab(true)
  },
  methods: {
    switchTab(tab) {
      if (this.activeTab === tab) return
      this.activeTab = tab
      this.loadCurrentTab()
    },
    async loadCurrentTab(force = false) {
      if (!force && this.loadedTabs[this.activeTab]) return
      if (this.activeTab === 'business') {
        await this.loadBusinessList()
      } else if (this.activeTab === 'contract') {
        await this.loadContractList()
      } else {
        await this.loadReceivablesList()
      }
    },
    async loadBusinessList() {
      const result = await getBusinessList({
        page: 1,
        limit: 20
      })
      this.businessList = result.list || []
      this.totals.business = result.dataCount || this.businessList.length
      this.sumMoney = (result.extraData && result.extraData.money && result.extraData.money.businessSumMoney) || '0.00'
      this.loadedTabs.business = true
    },
    async loadContractList() {
      const result = await getContractList({
        page: 1,
        limit: 20
      })
      this.contractList = result.list || []
      this.totals.contract = result.dataCount || this.contractList.length
      this.loadedTabs.contract = true
    },
    async loadReceivablesList() {
      const result = await getReceivablesList({
        page: 1,
        limit: 20
      })
      this.receivablesList = result.list || []
      this.totals.receivables = result.dataCount || this.receivablesList.length
      this.loadedTabs.receivables = true
    },
    businessStatus(item) {
      return item.status_id_info || item.status_name || item.status || '--'
    },
    formatMoney(value) {
      const number = Number(value || 0)
      return number.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    openBusinessDetail(item) {
      uni.navigateTo({
        url: `/pages/business/detail?id=${item.business_id}`
      })
    },
    openContractDetail(item) {
      uni.navigateTo({
        url: `/pages/contract/detail?id=${item.contract_id}`
      })
    },
    openReceivablesDetail(item) {
      const id = item.receivables_id || item.id
      if (!id) return
      uni.navigateTo({
        url: `/pages/receivables/detail?id=${id}`
      })
    },
    openCreate() {
      uni.navigateTo({ url: '/pages/business/form' })
    },
    openStatistics() {
      uni.navigateTo({ url: '/pages/business/statistics' })
    },
    openSearch() {
      uni.navigateTo({ url: '/pages/business/search' })
    }
  }
}
</script>

<style scoped>
.business-page {
  min-height: 100vh;
  padding: 58rpx 20rpx 130rpx;
  background: var(--crm-page-bg);
}

.business-head {
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
  color: var(--crm-text-muted);
  font-weight: 700;
}

.module-tabs__item.is-active {
  color: var(--crm-text);
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

.action-panel {
  height: 88rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  margin-bottom: 14rpx;
  border-radius: 12rpx;
  background: var(--crm-card-bg);
}

.action-item {
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  border-right: 1rpx solid var(--crm-border);
  color: var(--crm-text-muted);
  font-size: 25rpx;
}

.action-item:last-child {
  border-right: none;
}

.action-icon {
  color: var(--crm-text-muted);
  font-size: 27rpx;
}

.filter-row {
  height: 72rpx;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1rpx minmax(0, 1fr) 1rpx minmax(0, 1fr);
  align-items: center;
  margin-bottom: 14rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: var(--crm-text-muted);
  font-size: 26rpx;
}

.filter-item.is-blue {
  color: var(--crm-primary);
}

.filter-arrow {
  color: inherit;
  font-size: 22rpx;
}

.filter-split {
  width: 1rpx;
  height: 38rpx;
  background: var(--crm-border);
}

.business-card {
  margin-bottom: 16rpx;
  padding: 24rpx 28rpx 0;
  border-radius: 12rpx;
  background: var(--crm-card-bg);
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
  color: var(--crm-text);
}

.follow-btn {
  height: 42rpx;
  padding: 0 16rpx;
  border: 1rpx solid var(--crm-primary);
  border-radius: 999rpx;
  color: var(--crm-primary);
  line-height: 40rpx;
  font-size: 22rpx;
}

.business-money {
  display: block;
  margin-bottom: 18rpx;
  color: #ff6a00;
  font-size: 28rpx;
  font-weight: 700;
}

.business-fields {
  margin-bottom: 18rpx;
}

.business-card__line {
  display: block;
  margin-top: 8rpx;
  color: var(--crm-text-muted);
  font-size: 25rpx;
}

.business-card__foot {
  min-height: 68rpx;
  display: flex;
  align-items: center;
  border-top: 1rpx solid var(--crm-border);
  color: var(--crm-text-muted);
  font-size: 24rpx;
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
