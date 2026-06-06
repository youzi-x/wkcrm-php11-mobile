<template>
  <view class="page-shell crm-list-page">
    <view class="list-head">
      <view class="module-tabs">
        <text class="module-tabs__item" :class="{ 'is-active': activeTab === 'contract' }" @click="activeTab = 'contract'">合同</text>
        <text class="module-tabs__item" :class="{ 'is-active': activeTab === 'receivables' }" @click="activeTab = 'receivables'">回款</text>
      </view>
      <view class="head-actions">•••  －  ⊙</view>
    </view>

    <view class="search-box">
      <input v-model="search" class="search-input" :placeholder="activeTab === 'contract' ? '搜索合同名称' : '搜索回款编号'" confirm-type="search" @confirm="loadData" />
    </view>

    <view class="list-tools">
      <text class="list-tools__total">{{ activeTab === 'contract' ? '合同' : '回款' }}总数：{{ currentTotal }}</text>
    </view>

    <view v-if="activeTab === 'contract'" class="card-list">
      <view v-for="item in contracts" :key="item.contract_id" class="data-card" @click="openDetail(item)">
        <view class="data-card__top">
          <text class="data-card__name">{{ item.name || '未命名合同' }}</text>
          <text class="status-tag">{{ item.check_status_info || '合同' }}</text>
        </view>
        <text class="data-card__line">客户名称：{{ item.customer_name || '--' }}</text>
        <text class="data-card__line">合同编号：{{ item.num || '--' }}</text>
        <text class="data-card__line">负责人：{{ item.owner_user_name || 'admin' }}</text>
        <view class="data-card__foot">
          <text class="blue-text">￥{{ item.money || '0.00' }}</text>
          <text class="muted">{{ item.update_time || '--' }}</text>
        </view>
      </view>
      <view v-if="!contracts.length" class="empty-text">暂无合同</view>
    </view>

    <view v-else class="card-list">
      <view v-for="item in receivables" :key="item.receivables_id" class="data-card" @click="openReceivablesDetail(item)">
        <view class="data-card__top">
          <text class="data-card__name">{{ item.number || item.name || '未命名回款' }}</text>
          <text class="status-tag">{{ item.check_status_info || '回款' }}</text>
        </view>
        <text class="data-card__line">客户名称：{{ item.customer_name || '--' }}</text>
        <text class="data-card__line">合同编号：{{ item.contract_num || '--' }}</text>
        <text class="data-card__line">回款日期：{{ item.return_time || '--' }}</text>
        <view class="data-card__foot">
          <text class="blue-text">￥{{ item.money || '0.00' }}</text>
          <text class="muted">{{ item.owner_user_name || 'admin' }}</text>
        </view>
      </view>
      <view v-if="!receivables.length" class="empty-text">暂无回款</view>
    </view>

    <TabBar current="contract" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import { getContractList, getReceivablesList } from '../../api/crm'
import { ensureLogin } from '../../utils/router'

export default {
  components: { TabBar },
  data() {
    return {
      activeTab: 'contract',
      search: '',
      contracts: [],
      receivables: [],
      contractTotal: 0,
      receivablesTotal: 0
    }
  },
  onLoad(options) {
    if (options && options.tab === 'receivables') {
      this.activeTab = 'receivables'
    }
  },
  computed: {
    currentTotal() {
      return this.activeTab === 'contract' ? this.contractTotal : this.receivablesTotal
    }
  },
  onShow() {
    if (!ensureLogin()) return
    this.loadData()
  },
  methods: {
    async loadData() {
      const [contracts, receivables] = await Promise.all([
        getContractList({ page: 1, limit: 20, search: this.activeTab === 'contract' ? this.search : '' }),
        getReceivablesList({ page: 1, limit: 20, search: this.activeTab === 'receivables' ? this.search : '' })
      ])
      this.contracts = contracts.list || []
      this.receivables = receivables.list || []
      this.contractTotal = contracts.dataCount || this.contracts.length
      this.receivablesTotal = receivables.dataCount || this.receivables.length
    },
    openDetail(item) {
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

.module-tabs {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.module-tabs__item {
  font-size: 32rpx;
  color: #111820;
  font-weight: 700;
}

.module-tabs__item.is-active {
  color: #0f1724;
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
  background: var(--crm-soft-bg);
  color: var(--crm-primary);
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
</style>
