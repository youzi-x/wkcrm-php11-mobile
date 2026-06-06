<template>
  <view class="page-shell stat-page">
    <view class="filter-bar">
      <view class="filter-item">
        <text>本人及下属</text>
        <text class="filter-arrow">⌄</text>
      </view>
      <picker :range="timeOptions" range-key="label" :value="timeIndex" @change="changeTime">
        <view class="filter-item">
          <text>{{ currentTime.label }}</text>
          <text class="filter-arrow">⌄</text>
        </view>
      </picker>
    </view>

    <view class="stats-grid">
      <view v-for="item in stats" :key="item.key" class="stat-card">
        <text class="stat-value">{{ item.value }}</text>
        <text class="stat-label">{{ item.label }}</text>
      </view>
    </view>

    <view class="section-title">员工统计</view>
    <view class="rank-list">
      <view v-for="item in employeeList" :key="item.realname" class="rank-card">
        <view class="rank-card__top">
          <text class="rank-card__name">{{ item.realname || '--' }}</text>
          <text class="rank-card__count">新增 {{ item.customer_num || 0 }}</text>
        </view>
        <view class="rank-card__row">
          <text>成交客户：{{ item.deal_customer_num || 0 }}</text>
          <text>合同金额：{{ item.contract_money || 0 }}</text>
        </view>
      </view>
      <view v-if="!employeeList.length && !loading" class="empty-text">暂无统计数据</view>
    </view>
  </view>
</template>

<script>
import { getCustomerPoolList, getCustomerRecordList, getCustomerStatistics } from '../../api/crm'
import { ensureLogin } from '../../utils/router'

export default {
  data() {
    return {
      loading: false,
      timeIndex: 0,
      timeOptions: [
        { label: '本月', value: 'month' },
        { label: '本季度', value: 'quarter' },
        { label: '本年', value: 'year' }
      ],
      totals: {
        customer_num: 0,
        deal_customer_num: 0,
        follow_customer_num: 0,
        put_in: 0,
        receive: 0
      },
      employeeList: []
    }
  },
  computed: {
    currentTime() {
      return this.timeOptions[this.timeIndex] || this.timeOptions[0]
    },
    stats() {
      return [
        { key: 'customer_num', label: '新增客户数', value: this.totals.customer_num || 0 },
        { key: 'deal_customer_num', label: '成交客户数', value: this.totals.deal_customer_num || 0 },
        { key: 'follow_customer_num', label: '跟进客户数', value: this.totals.follow_customer_num || 0 },
        { key: 'put_in', label: '进入公海客户数', value: this.totals.put_in || 0 },
        { key: 'receive', label: '公海池领取客户数', value: this.totals.receive || 0 }
      ]
    }
  },
  onLoad() {
    if (!ensureLogin()) return
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      const params = { type: this.currentTime.value }
      try {
        const [statistics, recordList, poolList] = await Promise.all([
          getCustomerStatistics(params, { showError: false }).catch(() => ({})),
          getCustomerRecordList(params, { showError: false }).catch(() => ({})),
          getCustomerPoolList(params, { showError: false }).catch(() => ({}))
        ])
        const statisticsTotal = statistics.total || {}
        const recordTotal = recordList.total || {}
        const poolTotal = poolList.total || {}
        this.totals = {
          customer_num: statisticsTotal.customer_num || 0,
          deal_customer_num: statisticsTotal.deal_customer_num || 0,
          follow_customer_num: recordTotal.customer_num || 0,
          put_in: poolTotal.put_in || 0,
          receive: poolTotal.receive || 0
        }
        this.employeeList = Array.isArray(statistics.list) ? statistics.list : []
      } finally {
        this.loading = false
      }
    },
    changeTime(event) {
      this.timeIndex = Number(event.detail.value || 0)
      this.loadData()
    }
  }
}
</script>

<style scoped>
.stat-page {
  min-height: 100vh;
  padding: 20rpx 20rpx 40rpx;
  background: var(--crm-page-bg);
}

.filter-bar {
  height: 86rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 18rpx;
  border-radius: 12rpx;
  background: #ffffff;
}

.filter-item {
  height: 86rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: #313b4b;
  font-size: 25rpx;
}

.filter-arrow {
  color: #8792a3;
  font-size: 22rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.stat-card {
  min-height: 138rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 26rpx;
  border-radius: 12rpx;
  background: #ffffff;
}

.stat-value {
  font-size: 42rpx;
  font-weight: 700;
  color: var(--crm-primary);
}

.stat-label {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #6c788a;
}

.section-title {
  margin: 28rpx 0 14rpx;
  font-size: 27rpx;
  font-weight: 700;
  color: #111820;
}

.rank-card {
  margin-bottom: 14rpx;
  padding: 22rpx 24rpx;
  border-radius: 12rpx;
  background: #ffffff;
}

.rank-card__top,
.rank-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rank-card__name {
  font-size: 28rpx;
  font-weight: 700;
  color: #273348;
}

.rank-card__count {
  color: var(--crm-primary);
  font-size: 24rpx;
}

.rank-card__row {
  margin-top: 14rpx;
  color: #7b8798;
  font-size: 24rpx;
}

.empty-text {
  padding: 80rpx 0;
  text-align: center;
  color: #8d98aa;
  font-size: 26rpx;
}
</style>

