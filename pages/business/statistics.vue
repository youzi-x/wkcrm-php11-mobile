<template>
  <view class="page-shell stat-page">
    <view class="filter-bar">
      <view class="filter-item">
        <text>全部商机组</text>
      </view>
      <picker :range="timeOptions" range-key="label" :value="timeIndex" @change="changeTime">
        <view class="filter-item">
          <text>{{ currentTime.label }}</text>
          <text class="filter-arrow">⌄</text>
        </view>
      </picker>
    </view>

    <view class="stats-grid">
      <view class="stat-card">
        <text class="stat-value">{{ total }}</text>
        <text class="stat-label">商机总数</text>
      </view>
      <view class="stat-card">
        <text class="stat-value money">￥{{ formatMoney(sumMoney) }}</text>
        <text class="stat-label">商机金额</text>
      </view>
    </view>

    <view class="section-title">商机阶段</view>
    <view class="rank-list">
      <view v-for="item in statusList" :key="item.name" class="rank-card">
        <view class="rank-card__top">
          <text class="rank-card__name">{{ item.name }}</text>
          <text class="rank-card__count">{{ item.count }}</text>
        </view>
      </view>
      <view v-if="!statusList.length && !loading" class="empty-text">暂无统计数据</view>
    </view>
  </view>
</template>

<script>
import { getBusinessList } from '../../api/crm'
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
      list: [],
      total: 0,
      sumMoney: '0.00'
    }
  },
  computed: {
    currentTime() {
      return this.timeOptions[this.timeIndex] || this.timeOptions[0]
    },
    statusList() {
      const map = {}
      this.list.forEach((item) => {
        const name = item.status_id_info || item.status_name || item.status || '未设置阶段'
        map[name] = (map[name] || 0) + 1
      })
      return Object.keys(map).map((name) => ({ name, count: map[name] }))
    }
  },
  onLoad() {
    if (!ensureLogin()) return
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const result = await getBusinessList({
          page: 1,
          limit: 200,
          type: this.currentTime.value
        }, { showError: false }).catch(() => ({}))
        this.list = result.list || []
        this.total = result.dataCount || this.list.length
        this.sumMoney = (result.extraData && result.extraData.money && result.extraData.money.businessSumMoney) || this.sumByList()
      } finally {
        this.loading = false
      }
    },
    sumByList() {
      return this.list.reduce((sum, item) => sum + Number(item.money || 0), 0)
    },
    formatMoney(value) {
      const number = Number(value || 0)
      return number.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
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

.stat-value.money {
  color: #ff6a00;
  font-size: 34rpx;
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

.rank-card__top {
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
  font-size: 28rpx;
  font-weight: 700;
}

.empty-text {
  padding: 80rpx 0;
  text-align: center;
  color: #8d98aa;
  font-size: 26rpx;
}
</style>
