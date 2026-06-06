<template>
  <view class="business-detail-page">
    <view class="top-bg"></view>

    <view class="business-card">
      <view class="business-main">
        <view class="business-logo">◉</view>
        <view class="business-info">
          <text class="business-name">{{ detail.name || '商机名称' }}</text>
        </view>
      </view>

      <view class="amount-line">
        <text class="amount-label">商机金额</text>
        <text class="amount-value">￥ {{ formatMoney(detail.money) }}</text>
      </view>

      <view class="meta-line">
        <text>预计成交：{{ detail.deal_date || '--' }}</text>
        <text>负责人：{{ detail.owner_user_name || '--' }}</text>
      </view>

      <view class="stage-row">
        <view>
          <text class="stage-name">{{ businessStage }}</text>
          <text class="stage-sub">阶段信息</text>
        </view>
        <text class="change-stage">☑ 更改</text>
      </view>

      <view class="contact-row" @click="openPrimaryContact">
        <view class="contact-left">
          <text class="contact-icon">♟</text>
          <text>{{ primaryContactName }}</text>
        </view>
        <text class="row-arrow">›</text>
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

      <view v-if="activeTab === 'activity'" id="record-section" class="tab-panel activity-panel">
        <view class="filter-row">
          <view class="sub-tabs">
            <text
              class="sub-tab"
              :class="{ active: activitySubTab === 'record' }"
              @click="activitySubTab = 'record'"
            >
              跟进记录
            </text>
            <text
              class="sub-tab"
              :class="{ active: activitySubTab === 'dynamic' }"
              @click="activitySubTab = 'dynamic'"
            >
              商机动态
            </text>
          </view>
          <text class="filter-text" @click="toggleRecordOrder">{{ filterLabel }}</text>
        </view>

        <view v-if="activitySubTab === 'record' && followRecords.length" class="record-list">
          <view v-for="item in followRecords" :key="item.activity_id || item.id" class="record-card">
            <view class="record-head">
              <view class="record-avatar">{{ recordAvatar(item) }}</view>
              <view class="record-title">
                <view class="record-name-row">
                  <text class="record-user">{{ recordUser(item) }}</text>
                  <text class="record-badge">商机跟进记录</text>
                </view>
                <text class="record-time">{{ item.create_time || item.update_time || '' }}</text>
              </view>
            </view>
            <view class="record-body">
              <text class="record-content">{{ item.content || '--' }}</text>
              <text class="record-line">下次联系：{{ item.next_time || '--' }}</text>
              <text class="record-line">跟进方式：{{ item.category || '--' }}</text>
            </view>
          </view>
        </view>
        <view v-else-if="activitySubTab === 'record'" class="empty-panel">
          <view class="empty-illustration">
            <text class="empty-paper">≡</text>
          </view>
          <text>暂无跟进记录</text>
        </view>

        <view v-else-if="dynamicRecords.length" class="record-list">
          <view v-for="item in dynamicRecords" :key="item.activity_id || item.id" class="record-card">
            <view class="record-head">
              <view class="record-avatar">{{ recordAvatar(item) }}</view>
              <view class="record-title">
                <view class="record-name-row">
                  <text class="record-user">{{ dynamicTitle(item) }}</text>
                  <text class="record-badge">商机动态</text>
                </view>
                <text class="record-time">{{ item.create_time || item.update_time || '' }}</text>
              </view>
            </view>
            <text class="record-content">{{ item.content || '--' }}</text>
          </view>
        </view>
        <view v-else class="empty-panel">
          <view class="empty-illustration">
            <text class="empty-paper">≡</text>
          </view>
          <text>暂无商机动态</text>
        </view>
      </view>

      <view v-else-if="activeTab === 'detail'" class="tab-panel detail-panel">
        <view v-for="item in fields" :key="item.key" class="field-row">
          <text class="field-label">{{ item.label }}</text>
          <text class="field-value" :class="{ 'is-map-link': isMapField(item) }" @click="openFieldLocation(item)">
            {{ item.value }}
          </text>
        </view>
        <view v-if="!fields.length" class="empty-text">暂无详细信息</view>
      </view>

      <view v-else class="tab-panel relation-panel">
        <view v-for="section in relationSections" :key="section.key" class="relation-section">
          <view class="relation-head">
            <view class="relation-title">
              <text class="relation-icon">{{ section.icon }}</text>
              <text>{{ section.title }}</text>
            </view>
          </view>
          <view v-if="section.items.length" class="relation-list">
            <view
              v-for="item in section.items"
              :key="relationItemKey(section, item)"
              class="relation-row"
              @click="openRelationDetail(section, item)"
            >
              <view class="relation-row-main">
                <text class="relation-row-name">{{ relationItemTitle(section, item) }}</text>
                <text v-for="line in relationItemLines(section, item)" :key="line" class="relation-row-line">{{ line }}</text>
              </view>
              <text class="row-arrow">›</text>
            </view>
          </view>
          <view v-else class="relation-empty">暂无数据</view>
        </view>
      </view>
    </view>

    <view class="float-follow" @click="openRecordForm">
      <text class="float-icon">✎</text>
      <text>写跟进</text>
    </view>
  </view>
</template>

<script>
import {
  getBusinessCount,
  getBusinessDetail,
  getBusinessRecords,
  getContactsList,
  getContractList,
  getCrmTeam,
  getModuleFields
} from '../../api/crm'
import { normalizeFields } from '../../utils/field'
import { isMappableField, openMapLocation } from '../../utils/map'
import { ensureLogin } from '../../utils/router'

export default {
  data() {
    return {
      id: '',
      activeTab: 'activity',
      activitySubTab: 'record',
      recordOrder: 'desc',
      detail: {},
      counts: {},
      fields: [],
      records: [],
      relationData: {
        contacts: [],
        team: [],
        contracts: []
      },
      tabs: [
        { key: 'activity', label: '活动记录' },
        { key: 'detail', label: '详细信息' },
        { key: 'relation', label: '相关信息' }
      ]
    }
  },
  computed: {
    businessStage() {
      return this.detail.status_id_info || this.detail.status_name || this.detail.status || '阶段信息'
    },
    primaryContactName() {
      const detailContact = this.detail.contacts_id_info || {}
      const firstContact = this.relationData.contacts[0] || {}
      return this.detail.contacts_name || detailContact.name || firstContact.name || '暂无联系人'
    },
    primaryContactId() {
      const detailContact = this.detail.contacts_id_info || {}
      const firstContact = this.relationData.contacts[0] || {}
      return this.detail.contacts_id || detailContact.contacts_id || firstContact.contacts_id || ''
    },
    filterLabel() {
      return this.recordOrder === 'desc' ? '筛选时间⌄' : '时间正序⌄'
    },
    orderedRecords() {
      return [...this.records].sort((a, b) => {
        const aTime = this.parseRecordTime(a.create_time || a.update_time)
        const bTime = this.parseRecordTime(b.create_time || b.update_time)
        return this.recordOrder === 'desc' ? bTime - aTime : aTime - bTime
      })
    },
    followRecords() {
      return this.orderedRecords.filter((item) => Number(item.type || 1) === 1)
    },
    dynamicRecords() {
      return this.orderedRecords.filter((item) => Number(item.type) === 2)
    },
    relationSections() {
      return [
        {
          key: 'contacts',
          title: `联系人（${this.relationData.contacts.length || this.counts.contactCount || 0}）`,
          icon: '人',
          items: this.relationData.contacts
        },
        {
          key: 'contracts',
          title: `合同（${this.relationData.contracts.length || this.counts.contractCount || 0}）`,
          icon: '合',
          items: this.relationData.contracts
        },
        {
          key: 'team',
          title: `团队成员（${this.relationData.team.length || 0}）`,
          icon: '组',
          items: this.relationData.team
        }
      ]
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
      const [detail, counts, fields, records] = await Promise.all([
        getBusinessDetail(this.id),
        getBusinessCount(this.id),
        getModuleFields({
          module: 'crm',
          controller: 'business',
          action: 'read',
          types: 'crm_business',
          action_id: this.id
        }),
        getBusinessRecords(this.id)
      ])
      this.detail = detail || {}
      this.counts = counts || {}
      this.fields = normalizeFields(fields || [])
      this.records = records.list || []
      await this.loadRelationData()
    },
    async loadRelationData() {
      const contactParams = {
        page: 1,
        limit: 20,
        business_id: this.id
      }
      if (this.detail.customer_id) {
        contactParams.customer_id = this.detail.customer_id
      }
      const [contacts, team, contracts] = await Promise.all([
        getContactsList(contactParams, { showError: false }).catch(() => ({ list: [] })),
        getCrmTeam({ types: 'crm_business', types_id: this.id }, { showError: false }).catch(() => []),
        getContractList({ page: 1, limit: 20, business_id: this.id }, { showError: false }).catch(() => ({ list: [] }))
      ])
      this.relationData.contacts = this.normalizeList(contacts)
      this.relationData.team = this.normalizeList(team)
      this.relationData.contracts = this.normalizeList(contracts)
    },
    normalizeList(result) {
      if (Array.isArray(result)) return result
      if (result && Array.isArray(result.list)) return result.list
      if (result && Array.isArray(result.data)) return result.data
      return []
    },
    formatMoney(value) {
      const number = Number(value || 0)
      return number.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    parseRecordTime(value) {
      if (!value) return 0
      if (/^\d+$/.test(String(value))) return Number(value)
      return new Date(String(value).replace(/-/g, '/')).getTime() || 0
    },
    recordAvatar(item) {
      return (this.recordUser(item) || '跟').slice(0, 1)
    },
    recordUser(item) {
      return (item.create_user_info && item.create_user_info.realname) || item.create_user_name || '跟进人'
    },
    dynamicTitle(item) {
      return item.title || item.realname || this.recordUser(item)
    },
    toggleRecordOrder() {
      this.recordOrder = this.recordOrder === 'desc' ? 'asc' : 'desc'
    },
    isMapField(item) {
      return isMappableField(item)
    },
    openFieldLocation(item) {
      if (!this.isMapField(item)) return
      const source = item.rawValue || { address: item.value, name: item.label }
      openMapLocation(source, `${this.detail.name || ''} ${item.label || '位置'}`.trim())
    },
    openRecordForm() {
      uni.navigateTo({
        url: `/pages/activity/form?activity_type=5&activity_type_id=${this.id}&name=${encodeURIComponent(this.detail.name || '')}`
      })
    },
    openPrimaryContact() {
      if (!this.primaryContactId) return
      uni.navigateTo({ url: `/pages/contacts/detail?id=${this.primaryContactId}` })
    },
    relationItemKey(section, item) {
      return item.contacts_id || item.contract_id || item.id || item.user_id || item.name || section.key
    },
    relationItemTitle(section, item) {
      if (section.key === 'contacts') return item.name || '未命名联系人'
      if (section.key === 'contracts') return item.name || item.num || '未命名合同'
      return item.realname || item.user_name || item.name || '团队成员'
    },
    relationItemLines(section, item) {
      if (section.key === 'contacts') {
        return [
          `手机：${item.mobile || item.phone || item.telephone || '--'}`,
          `职务：${item.post || '--'}`
        ]
      }
      if (section.key === 'contracts') {
        return [
          `编号：${item.num || '--'}`,
          `金额：￥${this.formatMoney(item.money)}`
        ]
      }
      return [
        `角色：${item.types || item.role_name || '--'}`
      ]
    },
    openRelationDetail(section, item) {
      if (section.key === 'contacts' && item.contacts_id) {
        uni.navigateTo({ url: `/pages/contacts/detail?id=${item.contacts_id}` })
      }
      if (section.key === 'contracts' && item.contract_id) {
        uni.navigateTo({ url: `/pages/contract/detail?id=${item.contract_id}` })
      }
    }
  }
}
</script>

<style scoped>
.business-detail-page {
  position: relative;
  min-height: 100vh;
  padding: 24rpx 18rpx 150rpx;
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

.business-card,
.content-card {
  position: relative;
  border-radius: 8rpx;
  background: #ffffff;
}

.business-card {
  padding: 26rpx 24rpx 0;
  margin-bottom: 24rpx;
}

.business-main {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 26rpx;
}

.business-logo {
  width: 44rpx;
  height: 44rpx;
  border-radius: 8rpx;
  background: var(--crm-primary);
  color: #ffffff;
  text-align: center;
  line-height: 44rpx;
  font-size: 24rpx;
}

.business-info {
  flex: 1;
  min-width: 0;
}

.business-name {
  color: #111820;
  font-size: 30rpx;
  font-weight: 700;
}

.amount-line {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-bottom: 18rpx;
}

.amount-label {
  color: #13233b;
  font-size: 25rpx;
  font-weight: 700;
}

.amount-value {
  color: #ff5b22;
  font-size: 26rpx;
  font-weight: 700;
}

.meta-line {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 22rpx;
  color: #5d6e86;
  font-size: 24rpx;
}

.stage-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 24rpx;
  border-bottom: 1rpx solid #edf0f5;
}

.stage-name {
  display: block;
  color: #15233a;
  font-size: 29rpx;
  font-weight: 700;
}

.stage-sub {
  display: block;
  margin-top: 8rpx;
  color: #6f7f94;
  font-size: 24rpx;
}

.change-stage {
  color: #2d4a73;
  font-size: 24rpx;
}

.contact-row {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.contact-left {
  display: flex;
  align-items: center;
  gap: 18rpx;
  color: #273348;
  font-size: 28rpx;
}

.contact-icon {
  color: var(--crm-primary);
  font-size: 34rpx;
}

.row-arrow {
  color: #111820;
  font-size: 42rpx;
}

.content-card {
  min-height: 660rpx;
  overflow: hidden;
}

.main-tabs {
  height: 90rpx;
  display: flex;
  align-items: center;
  padding: 0 22rpx;
  border-bottom: 1rpx solid #edf0f5;
}

.main-tab {
  position: relative;
  margin-right: 44rpx;
  height: 90rpx;
  line-height: 90rpx;
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
  padding: 22rpx 22rpx 30rpx;
}

.activity-panel {
  min-height: 660rpx;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.sub-tabs {
  display: flex;
  gap: 12rpx;
}

.sub-tab {
  height: 56rpx;
  padding: 0 18rpx;
  border-radius: 8rpx;
  background: #eef2f7;
  color: #6b778a;
  line-height: 56rpx;
  font-size: 25rpx;
}

.sub-tab.active {
  background: var(--crm-primary);
  color: #ffffff;
  font-weight: 700;
}

.filter-text {
  color: #111820;
  font-size: 25rpx;
}

.record-card {
  margin-bottom: 18rpx;
  padding: 22rpx;
  border-radius: 12rpx;
  background: #f7f9fd;
}

.record-head {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.record-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: var(--crm-primary);
  color: #ffffff;
  text-align: center;
  line-height: 48rpx;
  font-size: 24rpx;
}

.record-title {
  flex: 1;
}

.record-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.record-user {
  color: #20304a;
  font-size: 26rpx;
  font-weight: 700;
}

.record-badge {
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
  background: var(--crm-soft-bg);
  color: var(--crm-primary);
  font-size: 21rpx;
}

.record-time {
  display: block;
  margin-top: 6rpx;
  color: #97a3b4;
  font-size: 22rpx;
}

.record-content,
.record-line {
  display: block;
  color: #5d6f85;
  font-size: 24rpx;
  line-height: 1.7;
}

.empty-panel {
  min-height: 500rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  color: #a0a8b5;
  font-size: 25rpx;
}

.empty-illustration {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: #eef0f3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c6cf;
  font-size: 70rpx;
}

.field-row {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #edf2f8;
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

.relation-section {
  margin-bottom: 18rpx;
  border-radius: 12rpx;
  background: #f7f9fd;
}

.relation-head {
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #edf0f5;
}

.relation-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #20304a;
  font-size: 26rpx;
  font-weight: 700;
}

.relation-icon {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  background: var(--crm-soft-bg);
  color: var(--crm-primary);
  text-align: center;
  line-height: 36rpx;
  font-size: 20rpx;
}

.relation-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  border-bottom: 1rpx solid #edf0f5;
}

.relation-row:last-child {
  border-bottom: none;
}

.relation-row-main {
  flex: 1;
  min-width: 0;
}

.relation-row-name {
  display: block;
  margin-bottom: 8rpx;
  color: #273348;
  font-size: 26rpx;
  font-weight: 700;
}

.relation-row-line {
  display: block;
  color: #718096;
  font-size: 23rpx;
  line-height: 1.6;
}

.relation-empty,
.empty-text {
  padding: 34rpx 0;
  text-align: center;
  color: #9aa8ba;
  font-size: 25rpx;
}

.float-follow {
  position: fixed;
  right: 34rpx;
  bottom: calc(132rpx + env(safe-area-inset-bottom));
  width: 92rpx;
  height: 92rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--crm-primary);
  color: #ffffff;
  box-shadow: 0 12rpx 28rpx rgba(43, 71, 114, 0.34);
  font-size: 21rpx;
}

.float-icon {
  font-size: 28rpx;
  line-height: 1;
}
</style>
