<template>
  <view class="page-shell home-page">
    <view class="home-hero">
      <view class="hero-actions">
        <view v-for="item in topActions" :key="item.key" class="hero-action" @click="open(item.url)">
          <text class="hero-action__icon">{{ item.icon }}</text>
          <text class="hero-action__text">{{ item.title }}</text>
        </view>
      </view>
    </view>

    <view class="home-apps">
      <view v-for="item in appGrid" :key="item.key" class="app-item" @click="openApp(item)">
        <view class="app-item__icon" :style="{ background: item.color }">{{ item.icon }}</view>
        <text class="app-item__text">{{ item.title }}</text>
      </view>
    </view>

    <view class="filter-row">
      <text class="filter-label">数据范围</text>
      <view class="filter-chip" @click="openFilter('range')">{{ currentRangeLabel }} ▾</view>
      <view class="filter-chip" @click="openFilter('time')">{{ currentTimeLabel }} ▾</view>
    </view>

    <view class="panel-card report-card">
      <text class="card-title">销售简报</text>
      <view class="report-grid">
        <view v-for="item in reportItems" :key="item.key" class="report-item">
          <text class="report-item__label">{{ item.label }}</text>
          <text class="report-item__value">{{ item.value }}</text>
        </view>
      </view>
    </view>

    <view class="panel-card target-card">
      <view class="card-title-row">
        <text class="card-title">合同目标完成情况</text>
        <text class="card-title-arrow">▾</text>
      </view>
      <view class="target-percent">{{ contractTargetPercent }}%</view>
      <text class="target-label">目标完成率</text>
      <view class="target-progress">
        <view class="target-progress__bar" :style="{ width: `${contractTargetPercent}%` }"></view>
      </view>
      <view class="target-summary">
        <view class="target-summary__item">
          <text class="target-dot is-muted"></text>
          <text>目标金额</text>
          <text class="target-summary__value">{{ contractTargetText }}</text>
        </view>
        <view class="target-summary__item">
          <text class="target-dot is-blue"></text>
          <text>完成金额</text>
          <text class="target-summary__value">{{ formatMoney(stats.contractMoneyNum || 0) }}</text>
        </view>
      </view>
    </view>

    <view class="panel-card forgotten-card">
      <view class="card-title-row">
        <text class="card-title">客户遗忘提醒</text>
      </view>
      <view class="forgotten-grid">
        <view v-for="item in forgottenItems" :key="item.key" class="forgotten-item" @click="openForgottenCustomers(item)">
          <text class="forgotten-item__label" :class="item.level">{{ item.label }}</text>
          <text class="forgotten-item__value">{{ item.value }} 个</text>
        </view>
      </view>
    </view>

    <view v-if="filterVisible" class="filter-mask" @click="closeFilter">
      <view class="filter-sheet" @click.stop>
        <view class="filter-tabs">
          <text class="filter-close" @click="closeFilter">×</text>
          <view class="filter-tab" :class="{ 'is-active': activeFilterTab === 'range' }" @click="activeFilterTab = 'range'">员工与部门</view>
          <view class="filter-tab" :class="{ 'is-active': activeFilterTab === 'time' }" @click="activeFilterTab = 'time'">时间筛选</view>
        </view>

        <view v-if="activeFilterTab === 'range'" class="filter-content">
          <view
            v-for="item in rangeOptions"
            :key="item.value"
            class="range-row"
            :class="{ 'is-current': draftRange === item.value }"
            @click="draftRange = item.value"
          >
            <text>{{ item.label }}</text>
            <text v-if="draftRange === item.value" class="check-mark">✓</text>
          </view>
        </view>

        <view v-else class="filter-content">
          <text class="filter-group-title">时间</text>
          <view class="time-grid">
            <view
              v-for="item in timeOptions"
              :key="item.value"
              class="time-option"
              :class="{ 'is-current': draftTime === item.value }"
              @click="draftTime = item.value"
            >
              {{ item.label }}
            </view>
          </view>
        </view>

        <view class="default-row" @click="saveAsDefault = !saveAsDefault">
          <text class="checkbox" :class="{ 'is-checked': saveAsDefault }">{{ saveAsDefault ? '✓' : '' }}</text>
          <text>保存为默认值</text>
        </view>

        <view class="filter-actions">
          <button class="reset-btn" @click="resetFilter">重置</button>
          <button class="confirm-btn" @click="confirmFilter">确定</button>
        </view>
      </view>
    </view>

    <TabBar current="workbench" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import { getForgottenCustomerCount, getWorkbenchStats } from '../../api/crm'
import { formatCurrency } from '../../utils/format'
import { ensureLogin } from '../../utils/router'
import { getHomeCommonFunctions, getHomeQuickActions } from '../../utils/home-config'

const FILTER_KEY = 'wkcrm_mobile_workbench_filter'

const RANGE_OPTIONS = [
  { label: '仅本人', value: 1 },
  { label: '本人及下属', value: 2 },
  { label: '仅本部门', value: 3 },
  { label: '本部门及下属部门', value: 4 }
]

const TIME_OPTIONS = [
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '本周', value: 'week' },
  { label: '上周', value: 'lastWeek' },
  { label: '本月', value: 'month' },
  { label: '上月', value: 'lastMonth' },
  { label: '本季度', value: 'quarter' },
  { label: '上一季度', value: 'lastQuarter' },
  { label: '本年度', value: 'year' },
  { label: '上一年度', value: 'lastYear' }
]

export default {
  components: { TabBar },
  data() {
    return {
      topActions: [],
      appGrid: [],
      rangeOptions: RANGE_OPTIONS,
      timeOptions: TIME_OPTIONS,
      currentRange: 2,
      currentTime: 'month',
      draftRange: 2,
      draftTime: 'month',
      activeFilterTab: 'range',
      filterVisible: false,
      saveAsDefault: false,
      filterLoaded: false,
      stats: {},
      forgotten: {}
    }
  },
  computed: {
    currentRangeLabel() {
      const current = RANGE_OPTIONS.find((item) => item.value === this.currentRange)
      return current ? current.label : '本人及下属'
    },
    currentTimeLabel() {
      const current = TIME_OPTIONS.find((item) => item.value === this.currentTime)
      return current ? current.label : '本月'
    },
    reportItems() {
      return [
        { key: 'customer', label: '新增客户', value: this.stats.customerNum || 0 },
        { key: 'contacts', label: '新增联系人', value: this.stats.contactsNum || 0 },
        { key: 'business', label: '新增商机', value: this.stats.businessNum || 0 },
        { key: 'contract', label: '新增合同', value: this.stats.contractNum || 0 },
        { key: 'contractMoney', label: '合同金额', value: formatCurrency(this.stats.contractMoneyNum || 0) },
        { key: 'businessMoney', label: '商机金额', value: formatCurrency(this.stats.businessMoneyNum || 0) },
        { key: 'receivablesMoney', label: '回款金额', value: formatCurrency(this.stats.receivablesMoneyNum || 0) },
        { key: 'record', label: '新增跟进记录', value: this.stats.recordNum || 0 }
      ]
    },
    contractTargetAmount() {
      return Number(this.stats.contractTargetMoney || this.stats.contractTarget || 0)
    },
    contractTargetPercent() {
      const target = this.contractTargetAmount
      if (!target) return 0
      const percent = Math.round((Number(this.stats.contractMoneyNum || 0) / target) * 100)
      return Math.max(0, Math.min(percent, 100))
    },
    contractTargetText() {
      return this.contractTargetAmount ? this.formatMoney(this.contractTargetAmount) : '--'
    },
    forgottenItems() {
      return [
        { key: 'sevenDays', label: '超过7天未联系', value: this.forgotten.sevenDays || 0, level: '' },
        { key: 'fifteenDays', label: '超过15天未联系', value: this.forgotten.fifteenDays || 0, level: '' },
        { key: 'oneMonth', label: '超过30天未联系', value: this.forgotten.oneMonth || 0, level: '' },
        { key: 'threeMonth', label: '超过3个月未联系', value: this.forgotten.threeMonth || 0, level: 'is-warning' },
        { key: 'sixMonth', label: '超过6个月未联系', value: this.forgotten.sixMonth || 0, level: 'is-warning' },
        { key: 'unContactCustomerCount', label: '逾期未联系', value: this.forgotten.unContactCustomerCount || 0, level: 'is-danger' }
      ]
    }
  },
  onShow() {
    if (!ensureLogin()) return
    this.loadSavedFilter()
    this.loadHomeConfig()
    this.loadStats()
    this.loadForgottenCount()
  },
  methods: {
    loadSavedFilter() {
      if (this.filterLoaded) return
      try {
        const saved = uni.getStorageSync(FILTER_KEY) || {}
        if (saved.dataType) this.currentRange = Number(saved.dataType)
        if (saved.type) this.currentTime = saved.type
      } catch (error) {}
      this.filterLoaded = true
    },
    loadHomeConfig() {
      this.topActions = getHomeQuickActions()
      this.appGrid = getHomeCommonFunctions()
    },
    async loadStats() {
      const result = await getWorkbenchStats({
        type: this.currentTime,
        dataType: this.currentRange
      })
      this.stats = result.data || {}
    },
    async loadForgottenCount() {
      this.forgotten = await getForgottenCustomerCount({
        dataType: this.currentRange
      })
    },
    formatMoney(value) {
      return formatCurrency(value)
    },
    open(url) {
      uni.navigateTo({ url })
    },
    openApp(item) {
      if (item.action === 'homeConfig') {
        this.showHomeConfigSheet()
        return
      }
      this.open(item.url)
    },
    showHomeConfigSheet() {
      uni.showActionSheet({
        itemList: ['快捷入口设置', '常用功能设置'],
        success: (event) => {
          const type = event.tapIndex === 0 ? 'quick' : 'common'
          uni.navigateTo({
            url: `/pages/workbench/config?type=${type}`
          })
        }
      })
    },
    openFilter(tab) {
      this.activeFilterTab = tab
      this.draftRange = this.currentRange
      this.draftTime = this.currentTime
      this.saveAsDefault = false
      this.filterVisible = true
    },
    closeFilter() {
      this.filterVisible = false
    },
    resetFilter() {
      this.draftRange = 2
      this.draftTime = 'month'
    },
    async confirmFilter() {
      this.currentRange = this.draftRange
      this.currentTime = this.draftTime
      if (this.saveAsDefault) {
        uni.setStorageSync(FILTER_KEY, {
          dataType: this.currentRange,
          type: this.currentTime
        })
      }
      this.filterVisible = false
      await this.loadStats()
      await this.loadForgottenCount()
    },
    openForgottenCustomers(item) {
      const queryMap = {
        sevenDays: 'sevenDays',
        fifteenDays: 'fifteenDays',
        oneMonth: 'oneMonth',
        threeMonth: 'threeMonth',
        sixMonth: 'sixMonth',
        unContactCustomerCount: 'unContact'
      }
      uni.navigateTo({
        url: `/pages/customer/index?forgotten=${queryMap[item.key] || ''}`
      })
    }
  }
}
</script>

<style scoped>
.home-page {
  background: var(--crm-page-bg);
}

.home-hero {
  height: 326rpx;
  padding-top: 122rpx;
  background: linear-gradient(135deg, var(--crm-primary-2) 0%, var(--crm-primary) 100%);
}

.hero-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 0 38rpx;
}

.hero-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ffffff;
}

.hero-action__icon {
  height: 54rpx;
  font-size: 54rpx;
  line-height: 1;
  font-weight: 700;
}

.hero-action__text {
  margin-top: 22rpx;
  font-size: 27rpx;
  font-weight: 600;
}

.home-apps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28rpx 0;
  padding: 52rpx 16rpx 24rpx;
  background: #ffffff;
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-item__icon {
  width: 62rpx;
  height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13rpx;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 700;
}

.app-item__text {
  margin-top: 15rpx;
  font-size: 24rpx;
  color: #202f45;
  font-weight: 600;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 22rpx 20rpx 12rpx;
}

.filter-label {
  font-size: 27rpx;
  color: #536277;
  font-weight: 600;
}

.filter-chip {
  height: 52rpx;
  padding: 0 18rpx;
  display: flex;
  align-items: center;
  border-radius: 10rpx;
  background: #ffffff;
  color: #25364d;
  font-size: 24rpx;
}

.filter-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 80;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.42);
}

.filter-sheet {
  width: 100%;
  min-height: 620rpx;
  padding: 0 28rpx calc(22rpx + env(safe-area-inset-bottom));
  border-radius: 18rpx 18rpx 0 0;
  background: #ffffff;
}

.filter-tabs {
  height: 86rpx;
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.filter-close {
  color: #6b7890;
  font-size: 42rpx;
  line-height: 1;
}

.filter-tab {
  height: 86rpx;
  display: flex;
  align-items: center;
  color: #111820;
  font-size: 27rpx;
}

.filter-tab.is-active {
  border-bottom: 4rpx solid var(--crm-primary);
  color: var(--crm-primary);
  font-weight: 700;
}

.filter-content {
  min-height: 320rpx;
  padding-top: 12rpx;
}

.range-row {
  height: 82rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #edf0f5;
  color: #233753;
  font-size: 27rpx;
}

.range-row.is-current {
  color: var(--crm-primary);
}

.check-mark {
  color: var(--crm-primary);
  font-size: 30rpx;
  font-weight: 700;
}

.filter-group-title {
  display: block;
  margin-bottom: 18rpx;
  color: #25364d;
  font-size: 27rpx;
  font-weight: 700;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
}

.time-option {
  height: 58rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  background: #f2f3f5;
  color: #606b7a;
  font-size: 25rpx;
}

.time-option.is-current {
  background: var(--crm-soft-bg);
  color: var(--crm-primary);
}

.default-row {
  height: 74rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #6c7890;
  font-size: 25rpx;
}

.checkbox {
  width: 28rpx;
  height: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #d9dfeb;
  border-radius: 4rpx;
  color: var(--crm-primary);
  font-size: 20rpx;
}

.filter-actions {
  display: grid;
  grid-template-columns: 176rpx 1fr;
  gap: 22rpx;
}

.reset-btn,
.confirm-btn {
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 27rpx;
  font-weight: 700;
}

.reset-btn {
  background: #f5f6f8;
  color: #41506a;
}

.confirm-btn {
  background: var(--crm-primary);
  color: #ffffff;
}

.report-card {
  margin: 0 20rpx 16rpx;
  padding: 14rpx 20rpx;
  border-radius: 8rpx;
  box-shadow: none;
}

.target-card,
.forgotten-card {
  margin: 0 20rpx 16rpx;
  padding: 14rpx 20rpx;
  border-radius: 8rpx;
  box-shadow: none;
}

.card-title {
  display: block;
  font-size: 31rpx;
  font-weight: 700;
  color: var(--crm-text);
}

.card-title-row {
  display: flex;
  align-items: center;
}

.card-title-arrow {
  margin-left: 6rpx;
  color: var(--crm-text);
  font-size: 24rpx;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 10rpx;
  border-top: 1rpx solid var(--crm-border);
  border-left: 1rpx solid var(--crm-border);
}

.report-item {
  min-height: 88rpx;
  padding: 10rpx 16rpx;
  border-right: 1rpx solid var(--crm-border);
  border-bottom: 1rpx solid var(--crm-border);
}

.report-item__label {
  display: block;
  font-size: 22rpx;
  color: var(--crm-text-muted);
  line-height: 28rpx;
}

.report-item__value {
  display: block;
  margin-top: 6rpx;
  font-size: 30rpx;
  line-height: 36rpx;
  color: var(--crm-text);
  font-weight: 700;
}

.target-percent {
  margin-top: 10rpx;
  color: var(--crm-text);
  font-size: 32rpx;
  line-height: 38rpx;
  font-weight: 800;
}

.target-label {
  display: block;
  margin-top: 2rpx;
  color: var(--crm-text-muted);
  font-size: 23rpx;
  line-height: 30rpx;
  font-weight: 600;
}

.target-progress {
  height: 12rpx;
  margin-top: 10rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: var(--crm-border);
}

.target-progress__bar {
  height: 100%;
  border-radius: 999rpx;
  background: var(--crm-primary);
}

.target-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 10rpx;
  padding: 10rpx 0;
  border-radius: 8rpx;
  background: var(--crm-input-bg);
}

.target-summary__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--crm-text-muted);
  font-size: 22rpx;
  line-height: 30rpx;
}

.target-dot {
  width: 10rpx;
  height: 10rpx;
  margin-bottom: 4rpx;
  border-radius: 50%;
}

.target-dot.is-muted {
  background: #b8c0ce;
}

.target-dot.is-blue {
  background: var(--crm-primary);
}

.target-summary__value {
  margin-top: 4rpx;
  color: var(--crm-text);
  font-weight: 700;
}

.forgotten-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 10rpx;
  border-top: 1rpx solid var(--crm-border);
  border-left: 1rpx solid var(--crm-border);
}

.forgotten-item {
  min-height: 78rpx;
  padding: 10rpx 16rpx;
  border-right: 1rpx solid var(--crm-border);
  border-bottom: 1rpx solid var(--crm-border);
}

.forgotten-item__label {
  display: inline-flex;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  background: var(--crm-input-bg);
  color: var(--crm-text-muted);
  font-size: 21rpx;
  line-height: 28rpx;
}

.forgotten-item__label.is-warning {
  background: #fff3df;
  color: #f39b22;
}

.forgotten-item__label.is-danger {
  background: #ffe7e3;
  color: #e96352;
}

.forgotten-item__value {
  display: block;
  margin-top: 6rpx;
  color: var(--crm-text);
  font-size: 25rpx;
  line-height: 32rpx;
  font-weight: 700;
}

</style>
