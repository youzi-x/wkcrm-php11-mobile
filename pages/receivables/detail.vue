<template>
  <view class="receivables-detail-page">
    <view class="top-bg"></view>

    <view class="summary-card">
      <view class="summary-head">
        <view class="summary-icon">¥</view>
        <view class="summary-main">
          <view class="summary-title-row">
            <text class="summary-title">{{ detail.number || detail.name || '回款详情' }}</text>
            <text class="status-tag">{{ detail.check_status_info || statusText }}</text>
          </view>
          <text class="summary-sub">客户名称：{{ detail.customer_name || customerInfo.name || '--' }}</text>
        </view>
      </view>

      <view class="money-card">
        <text class="money-label">回款金额</text>
        <text class="money-value">￥{{ formatMoney(detail.money) }}</text>
      </view>

      <view class="summary-lines">
        <text>合同编号：{{ detail.contract_num || contractInfo.num || '--' }}</text>
        <text>回款日期：{{ detail.return_time || '--' }}</text>
        <text>负责人：{{ detail.owner_user_name || ownerInfo.realname || '管理员' }}</text>
      </view>
    </view>

    <view class="content-card">
      <view class="main-tabs">
        <view
          v-for="item in tabs"
          :key="item.key"
          class="main-tab"
          :class="{ active: activeTab === item.key }"
          @click="activeTab = item.key"
        >
          {{ item.label }}
        </view>
      </view>

      <view v-if="activeTab === 'detail'" class="tab-panel">
        <view v-for="item in fields" :key="item.key" class="field-row">
          <text class="field-label">{{ item.label }}</text>
          <text class="field-value" :class="{ 'is-map-link': isMapField(item) }" @click="openFieldLocation(item)">
            {{ item.value }}
          </text>
        </view>
        <view v-if="!fields.length" class="empty-text">暂无详细信息</view>
      </view>

      <view v-else class="tab-panel relation-panel">
        <view class="relation-row" @click="openContract">
          <view>
            <text class="relation-title">关联合同</text>
            <text class="relation-line">{{ contractInfo.name || detail.contract_name || detail.contract_num || '--' }}</text>
          </view>
          <text class="row-arrow">›</text>
        </view>
        <view class="relation-row" @click="openCustomer">
          <view>
            <text class="relation-title">关联客户</text>
            <text class="relation-line">{{ customerInfo.name || detail.customer_name || '--' }}</text>
          </view>
          <text class="row-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getModuleFields, getReceivablesDetail } from '../../api/crm'
import { normalizeFields } from '../../utils/field'
import { isMappableField, openMapLocation } from '../../utils/map'
import { ensureLogin } from '../../utils/router'

export default {
  data() {
    return {
      id: '',
      detail: {},
      fields: [],
      activeTab: 'detail',
      tabs: [
        { key: 'detail', label: '详细信息' },
        { key: 'relation', label: '相关信息' }
      ]
    }
  },
  computed: {
    contractInfo() {
      return this.detail.contract_id_info || {}
    },
    customerInfo() {
      return this.detail.customer_id_info || {}
    },
    ownerInfo() {
      return this.detail.owner_user_id_info || {}
    },
    statusText() {
      const map = {
        0: '待审核',
        1: '审核中',
        2: '审核通过',
        3: '已拒绝',
        4: '已撤回',
        5: '未提交'
      }
      return map[Number(this.detail.check_status)] || '回款'
    }
  },
  async onLoad(options) {
    if (!ensureLogin()) return
    this.id = options.id || ''
    await this.loadData()
  },
  async onShow() {
    if (this.id) await this.loadData()
  },
  methods: {
    async loadData() {
      const [detail, fields] = await Promise.all([
        getReceivablesDetail(this.id),
        getModuleFields({
          module: 'crm',
          controller: 'receivables',
          action: 'read',
          types: 'crm_receivables',
          action_id: this.id
        }).catch(() => [])
      ])
      this.detail = detail || {}
      this.fields = normalizeFields(fields || [])
    },
    formatMoney(value) {
      const number = Number(value || 0)
      return number.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    isMapField(item) {
      return isMappableField(item)
    },
    openFieldLocation(item) {
      if (!this.isMapField(item)) return
      const source = item.rawValue || { address: item.value, name: item.label }
      openMapLocation(source, `${this.detail.number || this.detail.name || ''} ${item.label || '位置'}`.trim())
    },
    openContract() {
      const id = this.detail.contract_id || this.contractInfo.contract_id
      if (!id) return
      uni.navigateTo({ url: `/pages/contract/detail?id=${id}` })
    },
    openCustomer() {
      const id = this.detail.customer_id || this.customerInfo.customer_id
      if (!id) return
      uni.navigateTo({ url: `/pages/customer/detail?id=${id}` })
    }
  }
}
</script>

<style scoped>
.receivables-detail-page {
  position: relative;
  min-height: 100vh;
  padding: 24rpx 18rpx 80rpx;
  background: var(--crm-page-bg);
}

.top-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 190rpx;
  background: linear-gradient(135deg, #e9f6ff 0%, #bfe3ff 100%);
}

.summary-card,
.content-card {
  position: relative;
  border-radius: 10rpx;
  background: #ffffff;
}

.summary-card {
  padding: 26rpx 24rpx;
  margin-bottom: 22rpx;
}

.summary-head {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.summary-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
  background: var(--crm-primary);
  color: #ffffff;
  text-align: center;
  line-height: 48rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.summary-main {
  flex: 1;
  min-width: 0;
}

.summary-title-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.summary-title {
  flex: 1;
  color: #111820;
  font-size: 30rpx;
  font-weight: 700;
}

.status-tag {
  padding: 6rpx 14rpx;
  border-radius: 6rpx;
  background: var(--crm-soft-bg);
  color: var(--crm-primary);
  font-size: 23rpx;
}

.summary-sub {
  display: block;
  margin-top: 10rpx;
  color: #718096;
  font-size: 24rpx;
}

.money-card {
  padding: 22rpx;
  border-radius: 10rpx;
  background: #f7f9fd;
}

.money-label {
  display: block;
  color: #53657d;
  font-size: 24rpx;
}

.money-value {
  display: block;
  margin-top: 8rpx;
  color: #ff5b22;
  font-size: 34rpx;
  font-weight: 800;
}

.summary-lines {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin-top: 22rpx;
  color: #5d6e86;
  font-size: 24rpx;
}

.content-card {
  overflow: hidden;
}

.main-tabs {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 22rpx;
  border-bottom: 1rpx solid #edf0f5;
}

.main-tab {
  position: relative;
  margin-right: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  color: #111820;
  font-size: 29rpx;
  font-weight: 600;
}

.main-tab.active {
  color: var(--crm-primary);
}

.main-tab.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4rpx;
  border-radius: 999rpx;
  background: var(--crm-primary);
}

.tab-panel {
  padding: 22rpx;
}

.field-row,
.relation-row {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #edf2f8;
}

.field-row:last-child,
.relation-row:last-child {
  border-bottom: none;
}

.field-label {
  width: 170rpx;
  color: #8694a7;
  font-size: 24rpx;
}

.field-value {
  flex: 1;
  text-align: right;
  color: #25364d;
  font-size: 24rpx;
  line-height: 1.6;
}

.field-value.is-map-link {
  color: var(--crm-primary);
  font-weight: 700;
}

.relation-title,
.relation-line {
  display: block;
}

.relation-title {
  color: #20304a;
  font-size: 26rpx;
  font-weight: 700;
}

.relation-line {
  margin-top: 8rpx;
  color: #718096;
  font-size: 24rpx;
}

.row-arrow {
  color: #111820;
  font-size: 42rpx;
}

.empty-text {
  padding: 34rpx 0;
  text-align: center;
  color: #9aa8ba;
  font-size: 25rpx;
}
</style>

