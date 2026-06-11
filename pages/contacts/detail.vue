<template>
  <view class="contacts-detail-page">
    <view class="contact-card">
      <view class="contact-main">
        <view class="contact-logo">名</view>
        <view class="contact-info">
          <view class="name-row">
            <text class="contact-name">{{ detail.name || '联系人详情' }}</text>
            <text class="contact-tag">联系人</text>
          </view>
          <text class="meta-line">联系方式：{{ contactPhone }}</text>
          <text class="meta-line">负责人：{{ detail.owner_user_name || '--' }}</text>
          <text class="meta-line">最后跟进：{{ detail.last_time || detail.update_time || '--' }}</text>
        </view>
        <view class="phone-button" @click="callContact">Tel</view>
      </view>

      <view v-if="customerName" class="customer-link" @click="openCustomer">
        <view class="customer-icon">客</view>
        <text class="customer-name">{{ customerName }}</text>
        <text class="customer-arrow">›</text>
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

      <view v-if="activeTab === 'activity'" class="tab-panel">
        <view class="filter-row">
          <view class="sub-tabs">
            <text class="sub-tab" :class="{ active: activitySubTab === 'record' }" @click="activitySubTab = 'record'">
              跟进记录
            </text>
            <text class="sub-tab" :class="{ active: activitySubTab === 'dynamic' }" @click="activitySubTab = 'dynamic'">
              联系人动态
            </text>
          </view>
          <text class="filter-text" @click="toggleRecordOrder">{{ filterLabel }}</text>
        </view>

        <view v-if="activitySubTab === 'record' && followRecords.length" class="record-list">
          <view v-for="item in followRecords" :key="recordKey(item)" class="record-card">
            <view class="record-head">
              <view class="record-avatar">{{ recordAvatar(item) }}</view>
              <view class="record-title">
                <view class="record-name-row">
                  <text class="record-user">{{ recordUser(item) }}</text>
                  <text class="record-badge">联系人跟进记录</text>
                </view>
                <text class="record-time">{{ item.create_time || item.update_time || '' }}</text>
              </view>
              <text class="more-dot">...</text>
            </view>
            <view class="record-body">
              <text class="record-content">{{ item.content || '--' }}</text>
              <FollowRecordFiles :record="item" />
              <text class="record-line">跟进类型：{{ item.category || item.activity_type_name || '--' }}</text>
              <text class="record-line">有效跟进人：{{ item.valid_user_name || '--' }}</text>
            </view>
            <view class="record-actions">
              <text>有效</text>
              <text>无效</text>
              <text>赞</text>
            </view>
          </view>
        </view>
        <view v-else-if="activitySubTab === 'record'" class="empty-text">暂无跟进记录</view>

        <view v-else-if="dynamicRecords.length" class="record-list">
          <view v-for="item in dynamicRecords" :key="recordKey(item)" class="record-card">
            <view class="record-head">
              <view class="record-avatar">{{ recordAvatar(item) }}</view>
              <view class="record-title">
                <view class="record-name-row">
                  <text class="record-user">{{ dynamicTitle(item) }}</text>
                  <text class="record-badge">{{ dynamicBadge(item) }}</text>
                </view>
                <text class="record-time">{{ item.create_time || item.update_time || '' }}</text>
              </view>
            </view>
            <view class="record-body">
              <text v-for="line in dynamicLines(item)" :key="line" class="record-line">{{ line }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-text">暂无联系人动态</view>
      </view>

      <view v-else-if="activeTab === 'detail'" class="tab-panel detail-panel">
        <view class="field-group-title">基本信息</view>
        <view v-for="item in fields" :key="item.key" class="field-row">
          <text class="field-label">{{ item.label }}</text>
          <text class="field-value" :class="{ 'is-map-link': isMapField(item) }" @click="openFieldLocation(item)">
            {{ item.value }}
          </text>
        </view>
        <view v-if="!fields.length" class="empty-text">暂无详情信息</view>
      </view>

      <view v-else class="tab-panel relation-panel">
        <view v-for="section in relationSections" :key="section.key" class="relation-section">
          <view class="relation-head">
            <view class="relation-title">
              <text class="relation-icon">{{ section.icon }}</text>
              <text>{{ section.title }}</text>
            </view>
            <text v-if="section.createAction" class="relation-create" @click="openRelationCreate(section)">+ 新建</text>
          </view>

          <view v-if="section.items.length" class="relation-list">
            <view
              v-for="item in section.items"
              :key="relationItemKey(section, item)"
              class="relation-row"
              @click="openRelationDetail(section, item)"
            >
              <view class="relation-row-main">
                <view class="relation-row-title">
                  <text class="relation-row-name">{{ relationItemTitle(section, item) }}</text>
                  <text v-if="relationItemBadge(section, item)" class="relation-row-badge">{{ relationItemBadge(section, item) }}</text>
                </view>
                <text v-for="line in relationItemLines(section, item)" :key="line" class="relation-row-line">{{ line }}</text>
              </view>
              <text v-if="relationItemAmount(section, item)" class="relation-row-amount">{{ relationItemAmount(section, item) }}</text>
            </view>
          </view>
          <view v-else class="relation-empty">暂无数据</view>
        </view>
        <view v-if="!relationSections.length" class="empty-text">暂无相关信息</view>
      </view>
    </view>

    <view v-if="showRecordForm" class="record-form-mask" @click="showRecordForm = false">
      <view class="record-form" @click.stop>
        <view class="record-form-title">写跟进</view>
        <textarea v-model="recordForm.content" class="record-textarea" placeholder="请输入跟进内容" />
        <view class="record-form-actions">
          <button class="cancel-button" @click="showRecordForm = false">取消</button>
          <button class="save-button" :loading="recordLoading" @click="submitRecord">保存</button>
        </view>
      </view>
    </view>

    <view class="float-btn" @click="openRecordForm">
      <text class="float-icon">Edit</text>
      <text>写跟进</text>
    </view>
  </view>
</template>

<script>
import {
  createRecord,
  getBusinessList,
  getContactsCount,
  getContactsDetail,
  getContactsRecords,
  getCrmTeam,
  getModuleFields
} from '../../api/crm'
import FollowRecordFiles from '../../components/FollowRecordFiles.vue'
import { normalizeFields } from '../../utils/field'
import { isMappableField, openMapLocation } from '../../utils/map'
import { ensureLogin } from '../../utils/router'

export default {
  components: { FollowRecordFiles },
  data() {
    return {
      id: '',
      activeTab: 'activity',
      activitySubTab: 'record',
      detail: {},
      counts: {},
      fields: [],
      records: [],
      relationData: {
        team: [],
        business: []
      },
      relationLoaded: {
        team: false,
        business: false
      },
      recordOrder: 'desc',
      showRecordForm: false,
      recordLoading: false,
      recordForm: {
        content: ''
      },
      tabs: [
        { key: 'activity', label: '活动记录' },
        { key: 'detail', label: '详细信息' },
        { key: 'relation', label: '相关信息' }
      ]
    }
  },
  computed: {
    contactPhone() {
      return this.detail.mobile || this.detail.phone || this.detail.telephone || '--'
    },
    customerName() {
      return this.detail.customer_name || (this.detail.customer_id_info && this.detail.customer_id_info.name) || ''
    },
    customerId() {
      return this.detail.customer_id || (this.detail.customer_id_info && this.detail.customer_id_info.customer_id) || ''
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
    filterLabel() {
      return this.recordOrder === 'desc' ? '筛选时间' : '最早时间'
    },
    relationSections() {
      return [
        { key: 'team', title: '团队成员', icon: '团', items: this.relationData.team },
        { key: 'business', title: '商机', icon: '商', createAction: 'business', items: this.relationData.business }
      ].filter((section) => this.relationLoaded[section.key])
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
        getContactsDetail(this.id),
        getContactsCount(this.id),
        getModuleFields({
          module: 'crm',
          controller: 'contacts',
          action: 'read',
          types: 'crm_contacts',
          action_id: this.id
        }),
        getContactsRecords(this.id)
      ])
      this.detail = detail || {}
      this.counts = counts || {}
      this.fields = normalizeFields(fields || [])
      this.records = this.normalizeList(records)
      await this.loadRelationData()
    },
    async loadRelationData() {
      const requests = [
        ['team', getCrmTeam({ types: 'crm_contacts', types_id: this.id }, { showError: false })],
        ['business', getBusinessList({ page: 1, limit: 10, contacts_id: this.id }, { showError: false })]
      ]
      const results = await Promise.allSettled(requests.map((item) => item[1]))
      const nextData = { ...this.relationData }
      const nextLoaded = { ...this.relationLoaded }

      results.forEach((result, index) => {
        const key = requests[index][0]
        if (result.status !== 'fulfilled') {
          nextData[key] = []
          nextLoaded[key] = false
          return
        }
        nextData[key] = this.normalizeList(result.value)
        nextLoaded[key] = true
      })

      this.relationData = nextData
      this.relationLoaded = nextLoaded
    },
    normalizeList(result) {
      if (Array.isArray(result)) return result
      if (result && Array.isArray(result.list)) return result.list
      if (result && Array.isArray(result.data)) return result.data
      return []
    },
    formatMoney(value) {
      const number = Number(value || 0)
      return Number.isFinite(number) ? number.toLocaleString('en-US') : '0'
    },
    parseRecordTime(value) {
      if (!value) return 0
      const normalized = String(value).replace(/-/g, '/')
      const time = new Date(normalized).getTime()
      return Number.isFinite(time) ? time : 0
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
    recordKey(item) {
      return item.record_id || item.activity_id || item.id || `${item.create_time}-${item.content}`
    },
    recordUser(item) {
      return (item.create_user_info && item.create_user_info.realname) || item.create_user_name || '跟进人'
    },
    recordAvatar(item) {
      return this.recordUser(item).slice(0, 2)
    },
    dynamicTitle(item) {
      return `${this.recordUser(item)} ${this.dynamicAction(item)}`
    },
    dynamicAction(item) {
      const actionMap = {
        3: '创建了联系人',
        5: '创建了商机',
        6: '创建了合同',
        7: '创建了回款'
      }
      return actionMap[Number(item.activity_type)] || '更新了联系人动态'
    },
    dynamicBadge(item) {
      const badgeMap = {
        3: '联系人创建记录',
        5: '商机创建记录',
        6: '合同创建记录',
        7: '回款创建记录'
      }
      return badgeMap[Number(item.activity_type)] || '联系人动态'
    },
    dynamicLines(item) {
      const lines = []
      if (item.content) lines.push(`联系人名称：${item.content}`)
      if (item.activity_type_name) lines.push(`模块：${item.activity_type_name}`)
      if (this.detail.post) lines.push(`职务：${this.detail.post}`)
      if (this.detail.mobile) lines.push(`手机：${this.detail.mobile}`)
      return lines.length ? lines : ['暂无更多内容']
    },
    relationItemKey(section, item) {
      return item.user_id || item.id || item.business_id || `${section.key}-${this.relationItemTitle(section, item)}`
    },
    relationItemTitle(section, item) {
      if (section.key === 'team') return item.realname || item.username || '团队成员'
      return item.name || '未命名商机'
    },
    relationItemBadge(section, item) {
      if (section.key === 'team') return item.group_name || ''
      return item.status_name || item.type_name || ''
    },
    relationItemLines(section, item) {
      if (section.key === 'team') {
        return [
          `权限：${item.authority || '--'}`,
          `有效期：${item.target_time || '无限'}`
        ]
      }
      return [
        `客户：${item.customer_name || this.customerName || '--'}`,
        `负责人：${item.owner_user_name || '--'}`
      ]
    },
    relationItemAmount(section, item) {
      if (section.key !== 'business' || item.money === undefined || item.money === null || item.money === '') return ''
      return `¥${this.formatMoney(item.money)}`
    },
    openRelationCreate(section) {
      if (section.createAction !== 'business') return
      const query = [
        `contacts_id=${this.id}`,
        `contacts_name=${encodeURIComponent(this.detail.name || '')}`
      ]
      if (this.customerId) query.push(`customer_id=${this.customerId}`)
      if (this.customerName) query.push(`customer_name=${encodeURIComponent(this.customerName)}`)
      uni.navigateTo({ url: `/pages/business/form?${query.join('&')}` })
    },
    openRelationDetail(section, item) {
      if (section.key === 'business' && item.business_id) {
        uni.navigateTo({ url: `/pages/business/detail?id=${item.business_id}` })
      }
    },
    openCustomer() {
      if (!this.customerId) return
      uni.navigateTo({ url: `/pages/customer/detail?id=${this.customerId}` })
    },
    callContact() {
      if (!this.contactPhone || this.contactPhone === '--') {
        uni.showToast({ title: '暂无电话', icon: 'none' })
        return
      }
      uni.makePhoneCall({ phoneNumber: this.contactPhone })
    },
    openRecordForm() {
      uni.navigateTo({
        url: `/pages/activity/form?activity_type=3&activity_type_id=${this.id}&name=${encodeURIComponent(this.detail.name || '')}`
      })
    },
    async submitRecord() {
      if (!this.recordForm.content.trim()) {
        uni.showToast({ title: '请输入跟进内容', icon: 'none' })
        return
      }
      this.recordLoading = true
      try {
        await createRecord({
          activity_type: 3,
          activity_type_id: this.id,
          content: this.recordForm.content,
          category: '电话',
          is_event: 0
        })
        uni.showToast({ title: '保存成功', icon: 'success' })
        this.recordForm.content = ''
        this.showRecordForm = false
        const records = await getContactsRecords(this.id)
        this.records = this.normalizeList(records)
        this.activeTab = 'activity'
        this.activitySubTab = 'record'
      } finally {
        this.recordLoading = false
      }
    }
  }
}
</script>

<style scoped>
.contacts-detail-page {
  min-height: 100vh;
  padding: 18rpx 18rpx 160rpx;
  background: linear-gradient(180deg, var(--crm-hero-end) 0, var(--crm-soft-bg) 170rpx, var(--crm-page-bg) 100%);
}

.contact-card,
.content-card {
  border-radius: 8rpx;
  background: #ffffff;
}

.contact-card {
  padding: 24rpx 24rpx 0;
  margin-bottom: 16rpx;
}

.contact-main {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding-bottom: 24rpx;
}

.contact-logo,
.customer-icon,
.record-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.contact-logo {
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
  background: var(--crm-primary);
  color: #ffffff;
  font-size: 23rpx;
}

.contact-info {
  min-width: 0;
  flex: 1;
  margin-left: 16rpx;
  padding-right: 76rpx;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 22rpx;
}

.contact-name {
  overflow: hidden;
  color: #111827;
  font-size: 31rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-tag {
  padding: 4rpx 10rpx;
  border-radius: 4rpx;
  background: var(--crm-soft-bg);
  color: #53647a;
  font-size: 21rpx;
}

.meta-line {
  display: block;
  margin-top: 13rpx;
  color: #52647d;
  font-size: 24rpx;
}

.phone-button {
  position: absolute;
  right: 22rpx;
  top: 84rpx;
  width: 66rpx;
  height: 66rpx;
  border: 4rpx solid #d6ffe6;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 8rpx 18rpx rgba(13, 177, 91, 0.18);
  color: #0cb659;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 58rpx;
  text-align: center;
}

.customer-link {
  display: flex;
  height: 88rpx;
  align-items: center;
  border-top: 1rpx solid #eef1f6;
}

.customer-icon {
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: var(--crm-soft-bg);
  color: var(--crm-primary);
  font-size: 22rpx;
}

.customer-name {
  flex: 1;
  margin-left: 16rpx;
  color: #172033;
  font-size: 29rpx;
  font-weight: 700;
}

.customer-arrow {
  color: #111827;
  font-size: 42rpx;
  line-height: 1;
}

.content-card {
  min-height: 650rpx;
  overflow: hidden;
}

.main-tabs {
  display: grid;
  height: 88rpx;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 1rpx solid #edf0f5;
}

.main-tab {
  position: relative;
  color: #111827;
  font-size: 29rpx;
  font-weight: 500;
  line-height: 88rpx;
  text-align: center;
}

.main-tab.active {
  color: var(--crm-primary);
  font-weight: 700;
}

.main-tab.active::after {
  position: absolute;
  right: 42rpx;
  bottom: 0;
  left: 42rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: var(--crm-primary);
  content: "";
}

.tab-panel {
  padding: 20rpx 18rpx 28rpx;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.sub-tabs {
  display: flex;
  gap: 12rpx;
}

.sub-tab {
  height: 52rpx;
  padding: 0 18rpx;
  border-radius: 6rpx;
  background: #f1f3f6;
  color: #8b95a6;
  font-size: 25rpx;
  line-height: 52rpx;
}

.sub-tab.active {
  background: var(--crm-primary);
  color: #ffffff;
  font-weight: 700;
}

.filter-text {
  color: #111827;
  font-size: 25rpx;
}

.record-card {
  margin-bottom: 16rpx;
  padding: 26rpx 24rpx 18rpx;
  border-radius: 8rpx;
  background: #f2f4f8;
}

.record-head {
  display: flex;
  align-items: flex-start;
}

.record-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: var(--crm-primary);
  color: #ffffff;
  font-size: 23rpx;
}

.record-title {
  flex: 1;
  min-width: 0;
  margin-left: 16rpx;
}

.record-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.record-user {
  color: #111827;
  font-size: 28rpx;
  font-weight: 500;
}

.record-badge {
  height: 38rpx;
  padding: 0 12rpx;
  border-radius: 4rpx;
  background: var(--crm-soft-bg);
  color: var(--crm-primary);
  font-size: 22rpx;
  line-height: 38rpx;
}

.record-time {
  display: block;
  margin-top: 6rpx;
  color: #8a96a8;
  font-size: 23rpx;
}

.more-dot {
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
}

.record-body {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 24rpx;
}

.record-content {
  color: #111827;
  font-size: 27rpx;
  line-height: 1.5;
}

.record-line {
  color: #4e5f76;
  font-size: 25rpx;
  line-height: 1.45;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 26rpx;
  margin-top: 10rpx;
  color: #5f6f85;
  font-size: 23rpx;
}

.detail-panel {
  padding: 24rpx 28rpx 32rpx;
}

.field-group-title {
  margin-bottom: 12rpx;
  color: #172033;
  font-size: 27rpx;
  font-weight: 700;
}

.field-row {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eef1f6;
}

.field-label,
.field-value {
  display: block;
  font-size: 25rpx;
}

.field-label {
  color: #9aa5b5;
}

.field-value {
  margin-top: 14rpx;
  color: #172033;
  line-height: 1.55;
}

.field-value.is-map-link {
  color: var(--crm-primary);
  font-weight: 700;
}

.relation-section {
  overflow: hidden;
  margin-bottom: 18rpx;
  border: 1rpx solid #eef1f6;
  border-radius: 8rpx;
  background: #ffffff;
}

.relation-head {
  display: flex;
  height: 78rpx;
  align-items: center;
  justify-content: space-between;
  padding: 0 22rpx;
  border-bottom: 1rpx solid #eef1f6;
}

.relation-title {
  display: flex;
  align-items: center;
  color: #172033;
  font-size: 27rpx;
  font-weight: 700;
}

.relation-icon {
  width: 42rpx;
  height: 42rpx;
  margin-right: 12rpx;
  border-radius: 50%;
  background: var(--crm-soft-bg);
  color: var(--crm-primary);
  font-size: 22rpx;
  line-height: 42rpx;
  text-align: center;
}

.relation-create {
  color: var(--crm-primary);
  font-size: 25rpx;
}

.relation-list {
  padding: 0 20rpx;
}

.relation-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #f0f2f6;
}

.relation-row:last-child {
  border-bottom: none;
}

.relation-row-main {
  min-width: 0;
  flex: 1;
}

.relation-row-title {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.relation-row-name {
  overflow: hidden;
  color: #172033;
  font-size: 27rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relation-row-badge {
  flex-shrink: 0;
  padding: 4rpx 10rpx;
  border-radius: 4rpx;
  background: #f0f2f5;
  color: #69778a;
  font-size: 21rpx;
}

.relation-row-line {
  display: block;
  margin-top: 9rpx;
  color: #6a788b;
  font-size: 24rpx;
  line-height: 1.45;
}

.relation-row-amount {
  flex-shrink: 0;
  color: #e05a47;
  font-size: 26rpx;
  font-weight: 700;
}

.relation-empty,
.empty-text {
  color: #98a4b5;
  font-size: 25rpx;
  text-align: center;
}

.relation-empty {
  padding: 46rpx 0;
}

.empty-text {
  padding: 90rpx 0;
}

.record-form-mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  background: rgba(15, 23, 42, 0.32);
}

.record-form {
  width: 100%;
  padding: 28rpx 24rpx calc(30rpx + env(safe-area-inset-bottom));
  border-radius: 28rpx 28rpx 0 0;
  background: #ffffff;
}

.record-form-title {
  margin-bottom: 20rpx;
  color: #172033;
  font-size: 31rpx;
  font-weight: 700;
}

.record-textarea {
  width: 100%;
  min-height: 220rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background: var(--crm-page-bg);
  color: #172033;
  font-size: 27rpx;
}

.record-form-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 22rpx;
}

.cancel-button,
.save-button {
  height: 82rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  line-height: 82rpx;
}

.cancel-button {
  background: #eef2f7;
  color: #53647a;
}

.save-button {
  background: var(--crm-primary);
  color: #ffffff;
}

.float-btn {
  position: fixed;
  right: 22rpx;
  bottom: calc(36rpx + env(safe-area-inset-bottom));
  z-index: 10;
  display: flex;
  width: 104rpx;
  height: 104rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--crm-primary);
  box-shadow: 0 10rpx 26rpx rgba(27, 44, 70, 0.35);
  color: #ffffff;
  font-size: 22rpx;
}

.float-icon {
  display: block;
  margin-bottom: 4rpx;
  font-size: 20rpx;
  line-height: 1;
}
</style>
