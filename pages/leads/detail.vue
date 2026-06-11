<template>
  <view class="leads-detail-page">
    <view class="leads-card">
      <view class="leads-main">
        <view class="leads-logo">{{ avatarText }}</view>
        <view class="leads-info">
          <view class="name-row">
            <text class="leads-name">{{ detail.name || '线索名称' }}</text>
            <text class="status-tag">{{ transformStatus }}</text>
          </view>
          <text class="owner-line">负责人：{{ detail.owner_user_name || '--' }} | {{ contactPhone }}</text>
        </view>
      </view>

      <view class="amount-grid">
        <view v-for="item in summaryStats" :key="item.label" class="amount-item">
          <text class="amount-num">{{ item.value }}</text>
          <text class="amount-label">{{ item.label }}</text>
        </view>
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

      <view v-if="activeTab === 'activity'" id="record-section" class="tab-panel">
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
              线索动态
            </text>
          </view>
          <text class="filter-text" @click="toggleRecordOrder">{{ filterLabel }}</text>
        </view>

        <view v-if="activitySubTab === 'record' && followRecords.length" class="record-list">
          <view v-for="item in followRecords" :key="item.record_id || item.activity_id || item.id" class="record-card">
            <view class="record-head">
              <view class="record-avatar">{{ recordAvatar(item) }}</view>
              <view class="record-title">
                <view class="record-name-row">
                  <text class="record-user">{{ recordUser(item) }}</text>
                  <text class="record-badge">线索跟进记录</text>
                </view>
                <text class="record-time">{{ item.create_time || item.update_time || '' }}</text>
              </view>
              <text class="more-dot">...</text>
            </view>

            <view class="record-body">
              <text class="record-content">{{ item.content || '--' }}</text>
              <FollowRecordFiles :record="item" />
              <text class="record-line">下次联系：{{ item.next_time || '--' }}</text>
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
          <view v-for="item in dynamicRecords" :key="item.record_id || item.activity_id || item.id" class="record-card dynamic-card">
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
        <view v-else class="empty-text">暂无线索动态</view>
      </view>

      <view v-else-if="activeTab === 'detail'" class="tab-panel detail-panel">
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
          </view>

          <view v-if="section.items.length" class="relation-list">
            <view
              v-for="item in section.items"
              :key="item.label"
              class="relation-row"
              :class="{ 'is-map-row': isMapRelation(section, item) }"
              @click="openRelationItem(section, item)"
            >
              <view class="relation-row-main">
                <text class="relation-row-name">{{ item.label }}</text>
                <text class="relation-row-line">{{ item.value }}</text>
              </view>
              <text v-if="isMapRelation(section, item)" class="relation-row-map">地图</text>
            </view>
          </view>
          <view v-else class="relation-empty">暂无数据</view>
        </view>
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

    <view class="float-actions">
      <view class="float-btn" @click="callLead">
        <text class="float-icon">Tel</text>
        <text>打电话</text>
      </view>
      <view class="float-btn" @click="openRecordForm">
        <text class="float-icon">Edit</text>
        <text>写跟进</text>
      </view>
    </view>
  </view>
</template>

<script>
import { createRecord, getLeadsCount, getLeadsDetail, getLeadsRecords, getModuleFields } from '../../api/crm'
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
    avatarText() {
      return (this.detail.name || '线索').slice(0, 2)
    },
    contactPhone() {
      return this.detail.mobile || this.detail.telephone || '--'
    },
    transformStatus() {
      return Number(this.detail.is_transform) === 1 ? '已转化' : (this.detail.follow || '未转化')
    },
    summaryStats() {
      return [
        { label: '线索来源', value: this.detail.source || '--' },
        { label: '客户级别', value: this.detail.level || '--' },
        { label: '附件数量', value: `${this.counts.fileCount || 0}` }
      ]
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
          key: 'system',
          title: '系统信息',
          icon: '系',
          items: [
            { label: '创建人', value: this.detail.create_user_name || '--' },
            { label: '负责人', value: this.detail.owner_user_name || '--' },
            { label: '创建时间', value: this.detail.create_time || '--' },
            { label: '更新时间', value: this.detail.update_time || '--' },
            { label: '最后跟进', value: this.detail.last_time || '--' }
          ]
        },
        {
          key: 'contact',
          title: '联系信息',
          icon: '联',
          items: [
            { label: '手机号', value: this.detail.mobile || '--' },
            { label: '电话', value: this.detail.telephone || '--' },
            { label: '邮箱', value: this.detail.email || '--' },
            { label: '地址', value: this.detail.detail_address || '--' }
          ]
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
        getLeadsDetail(this.id),
        getLeadsCount(this.id),
        getModuleFields({
          module: 'crm',
          controller: 'leads',
          action: 'read',
          types: 'crm_leads',
          action_id: this.id
        }),
        getLeadsRecords(this.id)
      ])
      this.detail = detail || {}
      this.counts = counts || {}
      this.fields = normalizeFields(fields || [])
      this.records = records.list || []
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
    dynamicBadge(item) {
      const map = {
        1: '线索跟进记录',
        2: '线索动态'
      }
      return map[Number(item.type)] || '线索动态'
    },
    dynamicLines(item) {
      return [
        item.content || item.title || '--'
      ].filter(Boolean)
    },
    toggleRecordOrder() {
      this.recordOrder = this.recordOrder === 'desc' ? 'asc' : 'desc'
    },
    isMapField(item) {
      return isMappableField(item)
    },
    isMapRelation(section, item) {
      return section.key === 'contact' && isMappableField({ label: item.label, value: item.value })
    },
    openFieldLocation(item) {
      if (!this.isMapField(item)) return
      const source = item.rawValue || { address: item.value, name: item.label }
      openMapLocation(source, `${this.detail.name || ''} ${item.label || '位置'}`.trim())
    },
    openRelationItem(section, item) {
      if (!this.isMapRelation(section, item)) return
      openMapLocation({ address: item.value, name: item.label }, this.detail.name || item.label || '线索地址')
    },
    openRecordForm() {
      this.showRecordForm = true
    },
    callLead() {
      const phone = this.detail.mobile || this.detail.telephone
      if (!phone) {
        uni.showToast({ title: '暂无电话', icon: 'none' })
        return
      }
      uni.makePhoneCall({ phoneNumber: String(phone) })
    },
    async submitRecord() {
      if (!this.recordForm.content.trim()) {
        uni.showToast({ title: '请输入跟进内容', icon: 'none' })
        return
      }
      this.recordLoading = true
      try {
        await createRecord({
          activity_type: 1,
          activity_type_id: this.id,
          content: this.recordForm.content,
          category: '电话',
          is_event: 0
        })
        uni.showToast({ title: '保存成功', icon: 'success' })
        this.recordForm.content = ''
        this.showRecordForm = false
        const records = await getLeadsRecords(this.id)
        this.records = records.list || []
      } finally {
        this.recordLoading = false
      }
    }
  }
}
</script>

<style scoped>
.leads-detail-page {
  min-height: 100vh;
  padding: 24rpx 18rpx 160rpx;
  background: var(--crm-page-bg);
}

.leads-card,
.content-card {
  border-radius: 10rpx;
  background: #ffffff;
}

.leads-card {
  padding: 26rpx 24rpx;
  margin-bottom: 22rpx;
}

.leads-main {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 24rpx;
}

.leads-logo {
  width: 58rpx;
  height: 58rpx;
  border-radius: 12rpx;
  background: var(--crm-primary);
  color: #ffffff;
  text-align: center;
  line-height: 58rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.leads-info {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.leads-name {
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
  font-size: 22rpx;
}

.owner-line {
  display: block;
  margin-top: 10rpx;
  color: #607086;
  font-size: 24rpx;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
  border-radius: 10rpx;
  background: #f7f9fd;
}

.amount-item {
  min-height: 112rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1rpx solid #edf0f5;
}

.amount-item:last-child {
  border-right: none;
}

.amount-num {
  max-width: 190rpx;
  overflow: hidden;
  color: #13233b;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 28rpx;
  font-weight: 700;
}

.amount-label {
  margin-top: 8rpx;
  color: #7b8798;
  font-size: 22rpx;
}

.content-card {
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
  color: #111820;
  line-height: 90rpx;
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
  min-height: 620rpx;
  padding: 22rpx;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
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

.record-time,
.more-dot {
  color: #97a3b4;
  font-size: 22rpx;
}

.record-time {
  display: block;
  margin-top: 6rpx;
}

.record-content,
.record-line {
  display: block;
  color: #5d6f85;
  font-size: 24rpx;
  line-height: 1.7;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 34rpx;
  margin-top: 16rpx;
  color: #6b7890;
  font-size: 23rpx;
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
  color: #25364d;
  text-align: right;
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

.relation-list {
  padding: 0 20rpx;
}

.relation-row-main {
  flex: 1;
}

.relation-row-name,
.relation-row-line {
  display: block;
}

.relation-row-name {
  color: #273348;
  font-size: 25rpx;
  font-weight: 700;
}

.relation-row-line {
  margin-top: 8rpx;
  color: #718096;
  font-size: 23rpx;
}

.relation-row.is-map-row .relation-row-name {
  color: var(--crm-primary);
}

.relation-row-map {
  flex-shrink: 0;
  color: var(--crm-primary);
  font-size: 23rpx;
  font-weight: 700;
}

.empty-text,
.relation-empty {
  padding: 46rpx 0;
  text-align: center;
  color: #9aa8ba;
  font-size: 25rpx;
}

.record-form-mask {
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

.record-form {
  width: 100%;
  padding: 28rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
  border-radius: 20rpx 20rpx 0 0;
  background: #ffffff;
}

.record-form-title {
  margin-bottom: 18rpx;
  color: #111820;
  font-size: 30rpx;
  font-weight: 700;
}

.record-textarea {
  width: 100%;
  min-height: 220rpx;
  box-sizing: border-box;
  padding: 22rpx;
  border-radius: 12rpx;
  background: #f5f8ff;
  font-size: 28rpx;
}

.record-form-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 20rpx;
}

.cancel-button,
.save-button {
  height: 78rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  line-height: 78rpx;
}

.cancel-button {
  background: #eef2f7;
  color: #4d5f76;
}

.save-button {
  background: var(--crm-primary);
  color: #ffffff;
}

.float-actions {
  position: fixed;
  right: 26rpx;
  bottom: calc(34rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.float-btn {
  width: 104rpx;
  height: 104rpx;
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
  font-size: 22rpx;
  line-height: 1.2;
}
</style>
