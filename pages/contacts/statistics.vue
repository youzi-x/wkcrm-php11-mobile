<template>
  <view class="page-shell stat-page">
    <view class="filter-bar">
      <view class="filter-item">
        <text>本人及下属</text>
      </view>
      <picker :range="timeOptions" range-key="label" :value="timeIndex" @change="changeTime">
        <view class="filter-item">
          <text>{{ currentTime.label }}</text>
          <text class="filter-arrow">⌄</text>
        </view>
      </picker>
    </view>

    <view class="total-card">
      <text class="total-card__value">{{ totalCount }}</text>
      <text class="total-card__label">新增联系人数</text>
    </view>

    <view class="section-title">员工排行</view>
    <view class="rank-list">
      <view v-for="item in list" :key="item.user_name" class="rank-card">
        <view class="rank-card__top">
          <text class="rank-card__name">{{ item.user_name || '--' }}</text>
          <text class="rank-card__count">{{ item.count || 0 }}</text>
        </view>
        <text class="rank-card__line">部门：{{ item.structure_name || '--' }}</text>
      </view>
      <view v-if="!list.length && !loading" class="empty-text">暂无统计数据</view>
    </view>
  </view>
</template>

<script>
import { getContactsRanking } from '../../api/crm'
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
      list: []
    }
  },
  computed: {
    currentTime() {
      return this.timeOptions[this.timeIndex] || this.timeOptions[0]
    },
    totalCount() {
      return this.list.reduce((sum, item) => sum + Number(item.count || 0), 0)
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
        const result = await getContactsRanking({ type: this.currentTime.value }, { showError: false }).catch(() => [])
        this.list = Array.isArray(result) ? result : []
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

.total-card {
  min-height: 150rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 28rpx;
  border-radius: 12rpx;
  background: #ffffff;
}

.total-card__value {
  font-size: 46rpx;
  font-weight: 700;
  color: var(--crm-primary);
}

.total-card__label {
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

.rank-card__line {
  display: block;
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

