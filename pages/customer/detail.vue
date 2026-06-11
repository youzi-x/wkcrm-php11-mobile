<template>
  <view class="customer-detail-page">
    <view class="customer-card">
      <view class="customer-main">
        <view class="customer-logo">{{ avatarText }}</view>
        <view class="customer-info">
          <view class="name-row">
            <text class="customer-name">{{ detail.name || '客户名称' }}</text>
            <text class="deal-tag">{{ dealStatus }}</text>
          </view>
          <text class="owner-line">负责人：{{ detail.owner_user_name || '--' }} | {{ contactPhone }}</text>
        </view>
      </view>

      <view class="amount-grid">
        <view v-for="item in amountStats" :key="item.label" class="amount-item">
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
              客户动态
            </text>
          </view>
          <text class="filter-text" @click="handleFilterTap">{{ filterLabel }}</text>
        </view>

        <view v-if="activitySubTab === 'record' && followRecords.length" class="record-list">
          <view v-for="item in followRecords" :key="recordKey(item)" class="record-card">
            <view class="record-head">
              <view class="record-avatar">{{ recordAvatar(item) }}</view>
              <view class="record-title">
                <view class="record-name-row">
                  <text class="record-user">{{ recordUser(item) }}</text>
                  <text class="record-badge">客户跟进记录</text>
                </view>
                <text class="record-time">{{ recordTime(item) }}</text>
              </view>
              <text class="more-dot" @click.stop="openRecordActions(item)">...</text>
            </view>

            <view class="record-body">
              <text class="record-content">{{ item.content || '--' }}</text>
              <FollowRecordFiles :record="item" />
              <text class="record-line">拜访计划：{{ recordNextTime(item) || '--' }}</text>
              <text class="record-line">跟进类型：{{ item.category || '--' }}</text>
              <text v-if="recordContactDisplay(item)" class="record-line">跟进联系人：{{ recordContactDisplay(item) }}</text>
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
          <view v-for="item in dynamicRecords" :key="recordKey(item)" class="record-card dynamic-card">
            <view class="record-head">
              <view class="record-avatar">{{ recordAvatar(item) }}</view>
              <view class="record-title">
                <view class="record-name-row">
                  <text class="record-user">{{ dynamicTitle(item) }}</text>
                  <text class="record-badge">{{ dynamicBadge(item) }}</text>
                </view>
                <text class="record-time">{{ recordTime(item) }}</text>
              </view>
            </view>

            <view class="record-body">
              <text v-for="line in dynamicLines(item)" :key="line" class="record-line">{{ line }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-text">暂无客户动态</view>
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
            <text v-if="section.createAction" class="relation-create" @click="openRelationCreate(section)">+ 新建</text>
          </view>

          <view v-if="section.items.length" class="relation-list">
            <view
              v-for="item in section.items"
              :key="relationItemKey(section, item)"
              class="relation-row"
              :class="{ 'is-map-row': section.key === 'address' }"
              @click="openRelationDetail(section, item)"
            >
              <view class="relation-row-main">
                <view class="relation-row-title">
                  <text class="relation-row-name">{{ relationItemTitle(section, item) }}</text>
                  <text v-if="relationItemBadge(section, item)" class="relation-row-badge">{{ relationItemBadge(section, item) }}</text>
                </view>
                <text v-for="line in relationItemLines(section, item)" :key="line" class="relation-row-line">{{ line }}</text>
              </view>
              <text v-if="section.key === 'address'" class="relation-row-map">地图</text>
              <text v-if="relationItemAmount(section, item)" class="relation-row-amount">{{ relationItemAmount(section, item) }}</text>
            </view>
          </view>
          <view v-else class="relation-empty">暂无数据</view>
        </view>
        <view v-if="!relationSections.length" class="empty-text">暂无相关信息</view>
      </view>
    </view>

    <view v-if="showRecordForm" class="record-form-mask" @click="closeRecordForm">
      <view class="record-form" @click.stop>
        <view class="record-form-title">{{ editingRecordId ? '编辑跟进' : '写跟进' }}</view>
        <textarea
          v-model="recordForm.content"
          class="record-textarea"
          placeholder="请输入跟进内容"
          placeholder-style="color: var(--crm-text-muted)"
        />
        <view class="record-image-panel">
          <view class="record-image-head">
            <text class="record-image-title">图片</text>
            <text v-if="canEditRecordFiles" class="record-image-add" @click="chooseRecordImage">上传图片</text>
          </view>
          <view v-if="recordFiles.length" class="record-image-list">
            <view v-for="(file, index) in recordFiles" :key="recordFileKey(file, index)" class="record-image-item">
              <image
                v-if="isImageFile(file)"
                class="record-image-thumb"
                :src="recordImageThumb(file)"
                mode="aspectFill"
                @click="previewRecordImage(file)"
              />
              <view v-else class="record-file-chip">
                <text class="record-file-icon">附</text>
                <text class="record-file-name">{{ recordFileName(file) }}</text>
              </view>
              <text v-if="canEditRecordFiles" class="record-image-remove" @click.stop="removeRecordFile(file)">×</text>
            </view>
          </view>
          <text v-else class="record-image-empty">暂无图片</text>
        </view>
        <view class="record-form-fields">
          <picker
            :range="recordContactOptions"
            range-key="name"
            :value="recordContactIndex"
            @change="handleRecordContactChange"
          >
            <view class="record-field-row">
              <text class="record-field-label">跟进联系人</text>
              <view class="record-field-value">
                <text :class="{ placeholder: !recordContactLabel }">{{ recordContactLabel || '请选择' }}</text>
                <text class="record-field-arrow">›</text>
              </view>
            </view>
          </picker>

          <view class="record-field-row">
            <text class="record-field-label">跟进方式</text>
            <input
              v-model="recordForm.category"
              class="record-field-input"
              placeholder="电话、微信、拜访"
              placeholder-style="color: var(--crm-text-muted)"
            />
          </view>

          <picker mode="date" :value="recordNextDate" @change="handleRecordDateChange">
            <view class="record-field-row">
              <text class="record-field-label">下次提醒时间</text>
              <view class="record-field-value">
                <text :class="{ placeholder: !recordNextDate }">{{ recordReminderLabel }}</text>
                <text class="record-field-arrow">›</text>
              </view>
            </view>
          </picker>

          <picker v-if="recordNextDate" mode="time" :value="recordNextClock" @change="handleRecordTimeChange">
            <view class="record-field-row">
              <text class="record-field-label">提醒时间点</text>
              <view class="record-field-value">
                <text>{{ recordNextClock }}</text>
                <text class="record-field-arrow">›</text>
              </view>
            </view>
          </picker>

          <view v-if="recordNextDate" class="record-field-clear" @click="clearRecordReminder">清空提醒时间</view>
        </view>
        <view class="record-form-actions">
          <button class="cancel-button" @click="closeRecordForm">取消</button>
          <button class="save-button" :loading="recordLoading" @click="submitRecord">保存</button>
        </view>
      </view>
    </view>

    <view class="float-actions">
      <view class="float-btn" @click="callCustomer">
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
import {
  createRecord,
  deleteUploadedFile,
  deleteCustomerFollowRecord,
  deleteRecord,
  getBusinessList,
  getContactsList,
  getContractList,
  getCrmActivityList,
  getCrmTeam,
  getCustomerCount,
  getCustomerDetail,
  getCustomerFollowRecords,
  getCustomerRecords,
  getInvoiceList,
  getModuleFields,
  getReceivablesList,
  getReceivablesPlanList,
  updateCustomerFollowRecord,
  updateRecord
} from '../../api/crm'
import FollowRecordFiles from '../../components/FollowRecordFiles.vue'
import { BASE_URL } from '../../utils/config'
import { normalizeFields } from '../../utils/field'
import { isMappableField, openMapLocation } from '../../utils/map'
import { ensureLogin } from '../../utils/router'
import { getAuth } from '../../utils/storage'

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']

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
        contacts: [],
        team: [],
        business: [],
        contracts: [],
        receivables: [],
        plans: [],
        invoices: []
      },
      relationLoaded: {
        contacts: false,
        team: false,
        business: false,
        contracts: false,
        receivables: false,
        plans: false,
        invoices: false
      },
      recordOrder: 'desc',
      showRecordForm: false,
      recordLoading: false,
      editingRecordId: '',
      editingRecordSource: '',
      editingRecord: null,
      recordContacts: [],
      recordNextDate: '',
      recordNextClock: '09:00',
      recordFiles: [],
      recordRemovedFiles: [],
      recordUploading: false,
      recordForm: {
        content: '',
        category: '',
        next_time: '',
        contacts_ids: ''
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
      return (this.detail.name || '客户').slice(0, 2)
    },
    contactPhone() {
      return this.detail.mobile || this.detail.telephone || '--'
    },
    dealStatus() {
      return this.detail.deal_status || this.detail.status_name || '未成交'
    },
    amountStats() {
      return [
        { label: '商机金额(...', value: this.formatMoney(this.pickValue(['business_money', 'businessMoney', 'business_sum_money'])) },
        { label: '合同金额(...', value: this.formatMoney(this.pickValue(['contract_money', 'contractMoney', 'contract_sum_money'])) },
        { label: '回款金额(...', value: this.formatMoney(this.pickValue(['receivables_money', 'receivablesMoney', 'receivables_sum_money'])) }
      ]
    },
    orderedRecords() {
      return [...this.records].sort((a, b) => {
        const aTime = this.recordTimestamp(a)
        const bTime = this.recordTimestamp(b)
        return this.recordOrder === 'desc' ? bTime - aTime : aTime - bTime
      })
    },
    followRecords() {
      return this.orderedRecords.filter((item) => {
        const type = Number(item.type || 1)
        return type === 1 || type === 4
      })
    },
    dynamicRecords() {
      return this.orderedRecords.filter((item) => Number(item.type) === 2)
    },
    filterLabel() {
      return this.recordOrder === 'desc' ? '最新时间' : '最早时间'
    },
    recordContactOptions() {
      const options = [{ contacts_id: '', name: '不关联联系人' }]
      const seen = new Set([''])
      const pushContact = (item) => {
        const id = this.extractContactId(item)
        const name = this.extractContactName(item)
        if (!id || seen.has(String(id))) return
        options.push({ ...item, contacts_id: id, name: name || `联系人 ${id}` })
        seen.add(String(id))
      }

      this.relationData.contacts.forEach(pushContact)
      this.recordContacts.forEach(pushContact)
      const source = this.editingRecord || {}
      if (Array.isArray(source.contacts_list)) source.contacts_list.forEach(pushContact)
      if (Array.isArray(source.contactsInfo)) source.contactsInfo.forEach(pushContact)

      const currentId = this.normalizeContactId(this.recordForm.contacts_ids)
      if (currentId && !seen.has(String(currentId))) {
        options.push({
          contacts_id: currentId,
          name: this.recordContactName(source) || `联系人 ${currentId}`
        })
      }

      return options
    },
    recordContactIndex() {
      const currentId = this.normalizeContactId(this.recordForm.contacts_ids)
      const index = this.recordContactOptions.findIndex((item) => String(item.contacts_id || '') === String(currentId || ''))
      return index >= 0 ? index : 0
    },
    recordContactLabel() {
      const option = this.recordContactOptions[this.recordContactIndex]
      return option && option.contacts_id ? option.name : ''
    },
    recordReminderLabel() {
      if (!this.recordNextDate) return '请选择'
      return `${this.recordNextDate} ${this.recordNextClock || '09:00'}`
    },
    canEditRecordFiles() {
      return true
    },
    recordImageUrls() {
      return this.recordFiles
        .filter((file) => this.isImageFile(file))
        .map((file) => this.recordFileUrl(file))
        .filter(Boolean)
    },
    addressItems() {
      const address = this.customerAddressText()
      if (!address) return []
      return [{
        id: 'customer-address',
        name: '客户地址',
        address,
        value: this.pickFirstValue(['location', 'map_address', 'customer_address', 'address_detail', 'detail_address', 'address'])
      }]
    },
    relationSections() {
      const sections = [
        { key: 'contacts', title: '联系人', icon: '联', createAction: 'contacts', items: this.relationData.contacts },
        { key: 'team', title: '团队成员', icon: '团', items: this.relationData.team },
        { key: 'business', title: '商机', icon: '商', createAction: 'business', items: this.relationData.business },
        { key: 'contracts', title: '合同', icon: '合', items: this.relationData.contracts },
        { key: 'receivables', title: '回款', icon: '回', items: this.relationData.receivables },
        { key: 'plans', title: '回款计划', icon: '计', items: this.relationData.plans },
        { key: 'invoices', title: '发票', icon: '票', items: this.relationData.invoices }
      ].filter((section) => this.relationLoaded[section.key])

      if (this.addressItems.length) {
        sections.push({ key: 'address', title: '客户地址', icon: '址', items: this.addressItems })
      }
      return sections
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
        getCustomerDetail(this.id),
        getCustomerCount(this.id),
        getModuleFields({
          module: 'crm',
          controller: 'customer',
          action: 'read',
          types: 'crm_customer',
          action_id: this.id
        }),
        this.loadActivityRecords()
      ])
      this.detail = detail || {}
      this.counts = counts || {}
      this.fields = normalizeFields(fields || [])
      this.records = records
      await this.loadRelationData()
    },
    async loadActivityRecords() {
      const [followRecords, activityRecords, listRecords] = await Promise.all([
        this.loadCustomerFollowRecords(),
        this.loadCustomerActivityRecords(),
        this.loadCrmActivityListRecords()
      ])
      const records = []
      const seen = new Set()

      this.appendRecords(records, seen, followRecords)
      this.appendRecords(records, seen, activityRecords)
      this.appendRecords(records, seen, listRecords)

      return records
    },
    async loadCustomerFollowRecords() {
      const records = []
      const seen = new Set()
      const pageSize = 50
      let page = 1

      while (page <= 20) {
        let result = null
        try {
          result = await getCustomerFollowRecords(this.id, {
            page,
            limit: pageSize
          }, { showError: false })
        } catch (error) {
          break
        }

        const list = this.normalizeRecordList(result).map((item) => this.normalizeRecordItem(item, 'admin_record'))
        this.appendRecords(records, seen, list)

        if (Array.isArray(result)) break
        if (!list.length) break

        const dataCount = Number(result && (result.dataCount || result.total || result.count || 0))
        if (dataCount && page * pageSize >= dataCount) break

        page += 1
      }

      return records
    },
    async loadCustomerActivityRecords() {
      const records = []
      const seen = new Set()
      let page = 1

      while (page <= 60) {
        let result = null
        try {
          result = await getCustomerRecords(this.id, {
            page,
            limit: 20
          }, { showError: false })
        } catch (error) {
          break
        }

        const list = this.normalizeRecordList(result).map((item) => this.normalizeRecordItem(item, 'crm_activity'))
        this.appendRecords(records, seen, list)

        if (Array.isArray(result)) {
          break
        }
        if (!list.length) break
        if (result && result.lastPage === true) break
        page += 1
      }

      return records
    },
    async loadCrmActivityListRecords() {
      const records = []
      const seen = new Set()
      const pageSize = 100
      let page = 1

      while (page <= 20) {
        let result = null
        try {
          result = await getCrmActivityList({
            page,
            limit: pageSize,
            crmType: 2,
            queryType: 0,
            start_time: '2000-01-01',
            end_time: this.todayDate()
          }, { showError: false })
        } catch (error) {
          break
        }

        const list = this.normalizeRecordList(result)
          .filter((item) => this.isCurrentCustomerRecord(item))
          .map((item) => this.normalizeRecordItem(item, 'crm_activity'))

        this.appendRecords(records, seen, list)

        if (Array.isArray(result)) break
        if (!this.normalizeRecordList(result).length) break

        const dataCount = Number(result && (result.dataCount || result.total || result.count || 0))
        if (dataCount && page * pageSize >= dataCount) break
        if (result && result.lastPage === true) break

        page += 1
      }

      return records
    },
    appendRecords(records, seen, list = []) {
      list.forEach((item) => {
        const key = this.recordKey(item)
        const duplicateKey = this.recordDuplicateKey(item)
        if (seen.has(key) || seen.has(duplicateKey)) {
          const index = records.findIndex((record) => {
            return this.recordKey(record) === key
              || this.recordKey(record) === duplicateKey
              || this.recordDuplicateKey(record) === duplicateKey
              || this.recordDuplicateKey(record) === key
          })
          if (index >= 0) records.splice(index, 1, this.mergeRecordItem(records[index], item))
          return
        }
        seen.add(key)
        seen.add(duplicateKey)
        records.push(item)
      })
    },
    mergeRecordItem(target = {}, source = {}) {
      const preferSource = this.recordSource(source) === 'crm_activity' && this.recordSource(target) === 'admin_record'
      const merged = preferSource ? { ...target, ...source } : { ...source, ...target }
      merged.imgList = this.mergeFileLists(
        target.imgList,
        source.imgList,
        target.imageList,
        source.imageList,
        target.images,
        source.images,
        target.dataInfo && target.dataInfo.imgList,
        source.dataInfo && source.dataInfo.imgList,
        target.dataInfo && target.dataInfo.imageList,
        source.dataInfo && source.dataInfo.imageList,
        target.dataInfo && target.dataInfo.images,
        source.dataInfo && source.dataInfo.images
      )
      merged.fileList = this.mergeFileLists(
        target.fileList,
        source.fileList,
        target.files,
        source.files,
        target.fileInfo,
        source.fileInfo,
        target.dataInfo && target.dataInfo.fileList,
        source.dataInfo && source.dataInfo.fileList,
        target.dataInfo && target.dataInfo.files,
        source.dataInfo && source.dataInfo.files,
        target.dataInfo && target.dataInfo.fileInfo,
        source.dataInfo && source.dataInfo.fileInfo
      )
      return merged
    },
    mergeFileLists(...lists) {
      const seen = new Set()
      const files = []
      lists.forEach((list) => {
        this.normalizeRecordFileList(list).forEach((file) => {
          const key = this.recordFileKey(file, files.length)
          if (seen.has(key)) return
          seen.add(key)
          files.push(file)
        })
      })
      return files
    },
    normalizeRecordItem(item = {}, source = '') {
      const record = {
        ...item
      }

      if (source) record._record_source = source
      if (source === 'admin_record') {
        record.record_id = record.record_id || record.id
        record.type = record.type || 1
        record.activity_type = record.activity_type || 2
        record.activity_type_id = record.activity_type_id || record.types_id || this.id
      }
      if (source === 'crm_activity') {
        record.activity_id = record.activity_id || record.id
      }
      record.imgList = this.mergeFileLists(
        record.imgList,
        record.imageList,
        record.images,
        record.dataInfo && record.dataInfo.imgList,
        record.dataInfo && record.dataInfo.imageList,
        record.dataInfo && record.dataInfo.images
      )
      record.fileList = this.mergeFileLists(
        record.fileList,
        record.files,
        record.fileInfo,
        record.dataInfo && record.dataInfo.fileList,
        record.dataInfo && record.dataInfo.files,
        record.dataInfo && record.dataInfo.fileInfo
      )

      return record
    },
    normalizeRecordList(result) {
      if (Array.isArray(result)) return result
      if (result && Array.isArray(result.list)) return result.list
      if (result && result.data && Array.isArray(result.data.list)) return result.data.list
      if (result && Array.isArray(result.data)) return result.data
      return []
    },
    isCurrentCustomerRecord(item = {}) {
      const customerId = String(this.id || '')
      if (!customerId) return false

      const activityType = Number(item.activity_type || 0)
      const activityTypeId = String(item.activity_type_id || item.types_id || '')
      if (activityType === 2 && activityTypeId === customerId) return true

      if (Array.isArray(item.customer_list)) {
        return item.customer_list.some((customer) => String(customer.customer_id || customer.id || '') === customerId)
      }

      const customerIds = String(item.customer_ids || '')
      if (customerIds) {
        return customerIds.split(',').filter(Boolean).some((id) => String(id) === customerId)
      }

      return false
    },
    todayDate() {
      const date = new Date()
      const pad = (value) => String(value).padStart(2, '0')
      return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
      ].join('-')
    },
    async reloadActivityRecords() {
      this.records = await this.loadActivityRecords()
    },
    async ensureRecordContacts() {
      if (this.recordContacts.length) return
      if (this.relationData.contacts.length) {
        this.recordContacts = this.relationData.contacts
      }
      try {
        const result = await getContactsList({
          customer_id: this.id,
          page: 1,
          limit: 100
        }, { showError: false })
        this.recordContacts = this.normalizeList(result)
      } catch (error) {
        this.recordContacts = this.relationData.contacts
      }
    },
    async loadRelationData() {
      const common = { customer_id: this.id, page: 1, limit: 10 }
      const requests = [
        ['contacts', getContactsList(common, { showError: false })],
        ['team', getCrmTeam({ types: 'crm_customer', types_id: this.id }, { showError: false })],
        ['business', getBusinessList(common, { showError: false })],
        ['contracts', getContractList(common, { showError: false })],
        ['receivables', getReceivablesList(common, { showError: false })],
        ['plans', getReceivablesPlanList(common, { showError: false })],
        ['invoices', getInvoiceList(common, { showError: false })]
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
      if (!this.recordContacts.length) this.recordContacts = nextData.contacts || []
    },
    normalizeList(result) {
      if (Array.isArray(result)) return result
      if (result && Array.isArray(result.list)) return result.list
      if (result && Array.isArray(result.data)) return result.data
      return []
    },
    normalizeContactId(value) {
      if (Array.isArray(value)) {
        for (const item of value) {
          const id = this.normalizeContactId(item)
          if (id) return id
        }
        return ''
      }
      if (value && typeof value === 'object') {
        return this.extractContactId(value)
      }
      const text = String(value || '').trim()
      if (!text) return ''
      return text.split(',').map((item) => item.trim()).filter(Boolean).find((item) => /^\d+$/.test(item)) || ''
    },
    extractContactId(item) {
      if (item === undefined || item === null || item === '') return ''
      if (typeof item !== 'object') return this.normalizeContactId(item)
      return this.normalizeContactId(item.contacts_id || item.contact_id || item.id || item.value)
    },
    extractContactName(item) {
      if (!item) return ''
      if (typeof item === 'string') return /^\d+$/.test(item) ? '' : item
      return item.name || item.contacts_name || item.label || item.realname || ''
    },
    contactListItems(value) {
      if (!value) return []
      return Array.isArray(value) ? value : [value]
    },
    recordContactId(item = {}) {
      const directId = this.normalizeContactId(item.contacts_id || item.contacts_ids || item.contact_id)
      if (directId) return directId

      const relationList = [
        ...this.contactListItems(item.contacts_list),
        ...this.contactListItems(item.contactsInfo),
        ...this.contactListItems(item.contactsList)
      ]
      for (const contact of relationList) {
        const id = this.extractContactId(contact)
        if (id) return id
      }

      const name = item.contacts_name || this.extractContactName(item.contacts_ids)
      if (name) {
        const contact = [...this.relationData.contacts, ...this.recordContacts].find((option) => this.extractContactName(option) === name)
        return contact ? this.extractContactId(contact) : ''
      }
      return ''
    },
    recordContactName(item = {}) {
      const relationList = [
        ...this.contactListItems(item.contacts_list),
        ...this.contactListItems(item.contactsInfo),
        ...this.contactListItems(item.contactsList)
      ]
      for (const contact of relationList) {
        const name = this.extractContactName(contact)
        if (name) return name
      }
      if (item.contacts_name) return item.contacts_name

      const id = this.recordContactId(item)
      if (!id) return ''
      const contact = [...this.relationData.contacts, ...this.recordContacts].find((option) => String(this.extractContactId(option)) === String(id))
      return contact ? this.extractContactName(contact) : ''
    },
    splitRecordDateTime(value) {
      const normalized = this.normalizeRecordTime(value)
      if (!normalized) return { date: '', time: '09:00' }
      const match = normalized.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?/)
      if (!match) return { date: '', time: '09:00' }
      return {
        date: match[1],
        time: match[2] || '09:00'
      }
    },
    setRecordReminder(value) {
      const next = this.splitRecordDateTime(value)
      this.recordNextDate = next.date
      this.recordNextClock = next.time || '09:00'
      this.recordForm.next_time = this.buildRecordNextTime()
    },
    buildRecordNextTime() {
      if (!this.recordNextDate) return ''
      return `${this.recordNextDate} ${this.recordNextClock || '09:00'}:00`
    },
    buildRecordContactsIds() {
      const contactId = this.normalizeContactId(this.recordForm.contacts_ids)
      return contactId ? `,${contactId},` : ''
    },
    handleRecordContactChange(event) {
      const option = this.recordContactOptions[event.detail.value] || {}
      this.recordForm.contacts_ids = option.contacts_id || ''
    },
    handleRecordDateChange(event) {
      this.recordNextDate = event.detail.value
      if (!this.recordNextClock) this.recordNextClock = '09:00'
      this.recordForm.next_time = this.buildRecordNextTime()
    },
    handleRecordTimeChange(event) {
      this.recordNextClock = event.detail.value
      this.recordForm.next_time = this.buildRecordNextTime()
    },
    clearRecordReminder() {
      this.recordNextDate = ''
      this.recordNextClock = '09:00'
      this.recordForm.next_time = ''
    },
    pickValue(keys = []) {
      const sourceList = [this.detail, this.counts]
      for (const source of sourceList) {
        for (const key of keys) {
          if (source && source[key] !== undefined && source[key] !== null && source[key] !== '') {
            return source[key]
          }
        }
      }
      return 0
    },
    pickText(keys = []) {
      for (const key of keys) {
        const value = this.detail && this.detail[key]
        if (Array.isArray(value)) {
          const text = value.map((item) => this.textValue(item)).filter(Boolean).join(' ')
          if (text) return text
          continue
        }
        const text = this.textValue(value)
        if (text) return text
      }
      return ''
    },
    textValue(value) {
      if (value === undefined || value === null || value === '') return ''
      if (typeof value === 'object') {
        return value.address || value.detail || value.name || JSON.stringify(value)
      }
      return String(value)
    },
    pickFirstValue(keys = []) {
      for (const key of keys) {
        const value = this.detail && this.detail[key]
        if (this.textValue(value)) return value
      }
      return ''
    },
    customerAddressText() {
      const locationText = this.textValue(this.detail.location || this.detail.map_address)
      if (locationText) return locationText

      const parts = [
        this.textValue(this.detail.address),
        this.textValue(this.detail.detail_address || this.detail.customer_address || this.detail.address_detail)
      ].filter(Boolean)

      return Array.from(new Set(parts)).join(' ')
    },
    isMapField(item) {
      return isMappableField(item)
    },
    openFieldLocation(item) {
      if (!this.isMapField(item)) return
      const source = item.rawValue || { address: item.value, name: item.label }
      openMapLocation(source, `${this.detail.name || ''} ${item.label || '位置'}`.trim())
    },
    openAddressLocation(item) {
      openMapLocation(item.value || item, this.detail.name || item.name || '客户地址')
    },
    formatMoney(value) {
      const number = Number(value || 0)
      return Number.isFinite(number) ? number.toLocaleString('en-US') : '0'
    },
    recordKey(item = {}) {
      const source = this.recordSource(item)
      const id = this.recordActionId(item)
      if (id) return `${source}-${id}`
      return item.record_id
        || item.activity_id
        || item.id
        || `${item.activity_type || ''}-${item.type || ''}-${item.create_time || item.update_time || ''}-${item.content || ''}`
    },
    recordDuplicateKey(item = {}) {
      const time = this.normalizeRecordTime(item.create_time) || this.normalizeRecordTime(item.update_time) || ''
      const owner = item.create_user_id || (item.create_user_info && item.create_user_info.id) || item.create_user_name || ''
      const target = item.activity_type_id || item.types_id || this.id || ''
      return `${time}-${owner}-${target}-${item.content || ''}`
    },
    recordSource(item = {}) {
      if (item._record_source) return item._record_source
      if (item.record_id || Number(item.cate) === 1) return 'admin_record'
      return 'crm_activity'
    },
    recordActionId(item = {}) {
      if (this.recordSource(item) === 'admin_record') {
        return item.record_id || item.id || ''
      }
      return item.activity_id || item.id || ''
    },
    recordUser(item) {
      return (item.create_user_info && item.create_user_info.realname) || item.create_user_name || '跟进人'
    },
    recordAvatar(item) {
      return this.recordUser(item).slice(0, 2)
    },
    recordTime(item = {}) {
      return this.normalizeRecordTime(item.create_time)
        || this.normalizeRecordTime(item.update_time)
        || this.normalizeRecordTime(item.time)
        || ''
    },
    recordNextTime(item = {}) {
      return this.normalizeRecordTime(item.next_time)
    },
    recordContactDisplay(item = {}) {
      return this.recordContactName(item)
    },
    recordTimestamp(item = {}) {
      return this.parseRecordTime(this.recordTime(item))
    },
    normalizeRecordTime(value) {
      if (value === undefined || value === null || value === '' || value === 0 || value === '0') return ''
      if (typeof value === 'number' || /^\d+$/.test(String(value))) {
        const number = Number(value)
        if (!Number.isFinite(number) || number <= 0) return ''
        const timestamp = number > 100000000000 ? number : number * 1000
        return this.formatDateTime(new Date(timestamp))
      }
      const text = String(value)
      if (text.startsWith('1970-01-01')) return ''
      return text
    },
    formatDateTime(date) {
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
      const pad = (value) => String(value).padStart(2, '0')
      return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
      ].join('-') + ' ' + [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds())
      ].join(':')
    },
    parseRecordTime(value) {
      if (!value) return 0
      const normalized = String(value).replace(/-/g, '/')
      const time = new Date(normalized).getTime()
      return Number.isFinite(time) ? time : 0
    },
    normalizeRecordFileList(value) {
      if (!value) return []
      if (Array.isArray(value)) return value.filter(Boolean)
      if (typeof value === 'object' || typeof value === 'string') return [value]
      return []
    },
    recordFilesFrom(item = {}) {
      return this.mergeFileLists(
        item.imgList,
        item.imageList,
        item.images,
        item.fileList,
        item.files,
        item.fileInfo,
        item.dataInfo && item.dataInfo.imgList,
        item.dataInfo && item.dataInfo.imageList,
        item.dataInfo && item.dataInfo.images,
        item.dataInfo && item.dataInfo.fileList,
        item.dataInfo && item.dataInfo.files,
        item.dataInfo && item.dataInfo.fileInfo
      )
    },
    recordFileKey(file, index = 0) {
      if (typeof file === 'string') return file || index
      return file.file_id || file.id || file.save_name || file.file_path || file.full_path || file.path || file.url || index
    },
    recordFileName(file) {
      if (typeof file === 'string') return file.split('/').pop() || '附件'
      return file.name || file.file_name || file.save_name || '附件'
    },
    recordFileExt(file) {
      if (typeof file === 'string') {
        const match = file.toLowerCase().match(/\.([a-z0-9]+)(?:\?|#|$)/)
        return match ? match[1] : ''
      }
      const source = [
        file.ext,
        file.name,
        file.file_name,
        file.save_name,
        file.file_path,
        file.file_path_thumb,
        file.full_path,
        file.path,
        file.local_path,
        file.tempFilePath,
        file.url
      ].filter(Boolean).join(' ')
      const match = String(source).toLowerCase().match(/\.([a-z0-9]+)(?:\?|#|$)/)
      return match ? match[1] : ''
    },
    isImageFile(file) {
      if (!file) return false
      if (typeof file === 'object' && ['img', 'image'].includes(file.types)) return true
      if (typeof file === 'object' && (file.file_path_thumb || file.thumb_path || file.thumb)) return true
      return IMAGE_EXTS.includes(this.recordFileExt(file))
    },
    resolveRecordFileUrl(url) {
      const value = String(url || '').trim()
      if (!value) return ''
      if (/^(https?:)?\/\//.test(value) || /^(data|blob):/.test(value)) {
        return value.startsWith('//') && typeof window !== 'undefined' ? `${window.location.protocol}${value}` : value
      }
      if (value.startsWith('/') && typeof window !== 'undefined') {
        return `${window.location.origin}${value}`
      }
      return `${BASE_URL}${value.replace(/^\.?\//, '')}`
    },
    recordFileUrl(file) {
      if (typeof file === 'string') return this.resolveRecordFileUrl(file)
      if (file._local) return file.local_path || file.path || file.tempFilePath || file.url || ''
      return this.resolveRecordFileUrl(file.file_path || file.full_path || file.path || file.url)
    },
    recordImageThumb(file) {
      if (typeof file === 'string') return this.resolveRecordFileUrl(file)
      if (file._local) return file.local_path || file.path || file.tempFilePath || file.url || ''
      return this.resolveRecordFileUrl(file.file_path_thumb || file.thumb_path || file.thumb || file.file_path || file.full_path || file.path || file.url)
    },
    previewRecordImage(file) {
      if (!this.recordImageUrls.length) return
      const current = this.recordFileUrl(file)
      uni.previewImage({
        urls: this.recordImageUrls,
        current: current || this.recordImageUrls[0]
      })
    },
    chooseRecordImage() {
      if (!this.canEditRecordFiles || this.recordUploading) return
      uni.chooseImage({
        count: 6,
        success: async (result) => {
          const files = result.tempFiles || result.tempFilePaths || []
          if (this.editingRecordSource === 'admin_record') {
            const localFiles = files.map((file) => this.localRecordFile(file, 'img')).filter((file) => file.local_path)
            this.recordFiles = this.mergeFileLists(this.recordFiles, localFiles)
            if (localFiles.length) uni.showToast({ title: '保存后生效', icon: 'none' })
            return
          }
          await this.uploadRecordFiles(files, 'img')
        }
      })
    },
    localRecordFile(item, type = 'img') {
      const file = typeof item === 'string' ? { path: item, name: item.split('/').pop() } : (item || {})
      const filePath = file.path || file.tempFilePath || file.local_path || file.url || ''
      return {
        ...file,
        name: file.name || (filePath ? filePath.split('/').pop() : '图片'),
        local_path: filePath,
        path: filePath,
        types: type,
        _local: true
      }
    },
    async uploadRecordFiles(list = [], type = 'img') {
      const files = list.map((item) => this.localRecordFile(item, type))
      if (!files.length) return
      this.recordUploading = true
      uni.showLoading({ title: '上传中' })
      try {
        for (const file of files) {
          const uploaded = await this.uploadOneRecordFile(file, type)
          if (uploaded && uploaded.file_id) {
            this.recordFiles = this.mergeFileLists(this.recordFiles, [{ ...uploaded, types: type }])
          }
        }
        uni.showToast({ title: '上传成功', icon: 'success' })
      } finally {
        this.recordUploading = false
        uni.hideLoading()
      }
    },
    uploadOneRecordFile(file, type = 'img', extraFormData = {}) {
      const auth = getAuth()
      const filePath = file.path || file.tempFilePath || file.local_path
      return new Promise((resolve, reject) => {
        if (!filePath) {
          uni.showToast({ title: '图片地址不存在', icon: 'none' })
          reject(new Error('missing file path'))
          return
        }
        uni.uploadFile({
          url: `${BASE_URL}admin/file/save`,
          filePath,
          name: 'file',
          formData: {
            type,
            ...extraFormData
          },
          header: {
            authKey: auth.authKey || '',
            sessionId: auth.sessionId || ''
          },
          success: (response) => {
            let result = response.data || {}
            if (typeof result === 'string') {
              try {
                result = JSON.parse(result)
              } catch (error) {
                reject(error)
                return
              }
            }
            if (result.code === 200 && result.data) {
              resolve({
                ...result.data,
                name: result.data.name || file.name || '图片',
                types: type
              })
              return
            }
            uni.showToast({ title: result.error || result.msg || '上传失败', icon: 'none' })
            reject(result)
          },
          fail: (error) => {
            uni.showToast({ title: '上传失败', icon: 'none' })
            reject(error)
          }
        })
      })
    },
    removeRecordFile(file) {
      if (this.editingRecordSource === 'admin_record' && file && !file._local) {
        const saveName = this.recordFileSaveName(file)
        if (!saveName) {
          uni.showToast({ title: '图片缺少删除标识', icon: 'none' })
          return
        }
        const key = this.recordFileKey(file)
        const exists = this.recordRemovedFiles.some((item) => this.recordFileKey(item) === key)
        if (!exists) this.recordRemovedFiles.push(file)
      }
      const key = this.recordFileKey(file)
      this.recordFiles = this.recordFiles.filter((item, index) => this.recordFileKey(item, index) !== key)
    },
    recordFileSaveName(file) {
      if (!file || typeof file === 'string') return ''
      if (file.save_name) return file.save_name
      const source = file.file_path || file.full_path || file.path || file.url || ''
      const match = String(source).match(/uploads[\\/]+(.+?)(?:\?|#|$)/i)
      return match ? match[1].replace(/\\/g, '/') : ''
    },
    recordFileId(file) {
      if (!file || typeof file === 'string') return ''
      return file.file_id || file.id || ''
    },
    recordFileIds() {
      return this.recordFiles.map((file) => this.recordFileId(file)).filter(Boolean)
    },
    async syncAdminRecordFiles(recordId) {
      if (!recordId) return
      const pendingFiles = this.recordFiles.filter((file) => file && file._local)
      for (const file of pendingFiles) {
        await this.uploadOneRecordFile(file, file.types || 'img', {
          module: 'admin_record',
          module_id: recordId
        })
      }

      for (const file of this.recordRemovedFiles) {
        const saveName = this.recordFileSaveName(file)
        if (!saveName) continue
        await deleteUploadedFile({
          save_name: saveName,
          module: 'admin_record'
        })
      }
    },
    toggleRecordOrder() {
      this.recordOrder = this.recordOrder === 'desc' ? 'asc' : 'desc'
    },
    handleFilterTap() {
      this.toggleRecordOrder()
    },
    dynamicTitle(item) {
      return `${this.recordUser(item)} ${this.dynamicAction(item)}`
    },
    dynamicAction(item) {
      const actionMap = {
        2: '创建了客户',
        3: '创建了联系人',
        5: '创建了商机',
        6: '创建了合同',
        7: '创建了回款',
        8: '创建了回款计划',
        9: '创建了发票'
      }
      return actionMap[Number(item.activity_type)] || '更新了客户动态'
    },
    dynamicBadge(item) {
      const badgeMap = {
        2: '客户创建记录',
        3: '联系人创建记录',
        5: '商机创建记录',
        6: '合同创建记录',
        7: '回款创建记录',
        8: '回款计划记录',
        9: '发票记录'
      }
      return badgeMap[Number(item.activity_type)] || '客户动态'
    },
    dynamicLines(item) {
      const lines = []
      const objectName = item.content || item.activity_type_name
      if (objectName) lines.push(`${this.dynamicObjectLabel(item)}：${objectName}`)
      if (item.contacts_list && item.contacts_list.length) {
        lines.push(`联系人：${item.contacts_list.map((contact) => contact.name).filter(Boolean).join('、')}`)
      }
      if (item.business_list && item.business_list.length) {
        lines.push(`商机：${item.business_list.map((business) => business.name).filter(Boolean).join('、')}`)
      }
      return lines.length ? lines : ['暂无更多内容']
    },
    dynamicObjectLabel(item) {
      const labelMap = {
        1: '线索',
        2: '客户',
        3: '联系人',
        5: '商机',
        6: '合同',
        7: '回款'
      }
      return labelMap[Number(item.activity_type)] || '名称'
    },
    callCustomer() {
      if (!this.contactPhone || this.contactPhone === '--') {
        uni.showToast({ title: '暂无电话', icon: 'none' })
        return
      }
      uni.makePhoneCall({
        phoneNumber: this.contactPhone
      })
    },
    openRecordForm() {
      uni.navigateTo({
        url: `/pages/activity/form?activity_type=2&activity_type_id=${this.id}&name=${encodeURIComponent(this.detail.name || '')}`
      })
    },
    closeRecordForm() {
      this.showRecordForm = false
      this.editingRecordId = ''
      this.editingRecordSource = ''
      this.editingRecord = null
      this.recordNextDate = ''
      this.recordNextClock = '09:00'
      this.recordFiles = []
      this.recordRemovedFiles = []
      this.recordUploading = false
      this.recordForm = {
        content: '',
        category: '',
        next_time: '',
        contacts_ids: ''
      }
    },
    openRecordActions(item) {
      if (!item || !this.recordActionId(item)) return
      uni.showActionSheet({
        itemList: ['编辑', '删除'],
        success: (event) => {
          if (event.tapIndex === 0) {
            this.startEditRecord(item)
          } else if (event.tapIndex === 1) {
            this.confirmDeleteRecord(item)
          }
        }
      })
    },
    async startEditRecord(item) {
      await this.ensureRecordContacts()
      this.editingRecordId = this.recordActionId(item)
      this.editingRecordSource = this.recordSource(item)
      this.editingRecord = item
      this.recordFiles = this.recordFilesFrom(item)
      this.recordRemovedFiles = []
      this.recordForm = {
        content: item.content || '',
        category: item.category || '',
        next_time: '',
        contacts_ids: this.recordContactId(item)
      }
      this.setRecordReminder(item.next_time || '')
      this.showRecordForm = true
    },
    confirmDeleteRecord(item) {
      uni.showModal({
        title: '删除跟进',
        content: '确定删除这条跟进记录吗？',
        confirmText: '删除',
        confirmColor: '#e5484d',
        success: async (event) => {
          if (!event.confirm) return
          const recordId = this.recordActionId(item)
          if (this.recordSource(item) === 'admin_record') {
            await deleteCustomerFollowRecord(recordId)
          } else {
            await deleteRecord(recordId)
          }
          uni.showToast({ title: '删除成功', icon: 'success' })
          await this.reloadActivityRecords()
        }
      })
    },
    relationItemKey(section, item) {
      return item.contacts_id || item.business_id || item.contract_id || item.receivables_id || item.plan_id || item.invoice_id || item.user_id || item.id || `${section.key}-${this.relationItemTitle(section, item)}`
    },
    relationItemTitle(section, item) {
      if (section.key === 'team') return item.realname || item.username || '团队成员'
      if (section.key === 'contracts') return item.num || item.name || '合同'
      if (section.key === 'receivables') return item.number || item.num || item.name || '回款'
      if (section.key === 'plans') return item.num ? `第 ${item.num} 期` : (item.name || '回款计划')
      if (section.key === 'invoices') return item.invoice_apple_number || item.invoice_number || item.name || '发票'
      return item.name || item.customer_name || '未命名'
    },
    relationItemBadge(section, item) {
      if (section.key === 'contacts') return item.post || item.role || ''
      if (section.key === 'team') return item.group_name || ''
      if (section.key === 'business') return item.status_name || item.type_name || ''
      if (section.key === 'contracts') return item.check_status_info || item.status_name || ''
      if (section.key === 'receivables') return item.check_status_info || item.status_name || ''
      if (section.key === 'plans') return item.receivables_id ? '已回款' : '待回款'
      if (section.key === 'invoices') return item.invoice_status || ''
      return ''
    },
    relationItemLines(section, item) {
      const lines = []
      if (section.key === 'contacts') {
        lines.push(`电话：${item.mobile || item.telephone || '--'}`)
        lines.push(`负责人：${item.owner_user_name || '--'}`)
      } else if (section.key === 'team') {
        lines.push(`权限：${item.authority || '--'}`)
        lines.push(`有效期：${item.target_time || '无限'}`)
      } else if (section.key === 'business') {
        lines.push(`客户：${item.customer_name || this.detail.name || '--'}`)
        lines.push(`负责人：${item.owner_user_name || '--'}`)
      } else if (section.key === 'contracts') {
        lines.push(`客户：${item.customer_name || this.detail.name || '--'}`)
        lines.push(`签约日期：${item.order_date || item.create_time || '--'}`)
      } else if (section.key === 'receivables') {
        lines.push(`合同：${item.contract_name || item.contract_num || '--'}`)
        lines.push(`回款日期：${item.return_time || item.create_time || '--'}`)
      } else if (section.key === 'plans') {
        lines.push(`合同：${item.contract_name || '--'}`)
        lines.push(`计划日期：${item.return_date || item.return_time || '--'}`)
      } else if (section.key === 'invoices') {
        lines.push(`抬头：${item.invoice_title || '--'}`)
        lines.push(`申请日期：${item.invoice_date || item.create_time || '--'}`)
      } else if (section.key === 'address') {
        lines.push(item.address || '--')
      }
      return lines.filter(Boolean)
    },
    relationItemAmount(section, item) {
      const moneyMap = {
        business: item.money,
        contracts: item.money,
        receivables: item.money,
        plans: item.money || item.real_money,
        invoices: item.invoice_money
      }
      const value = moneyMap[section.key]
      if (value === undefined || value === null || value === '') return ''
      return `¥${this.formatMoney(value)}`
    },
    openRelationCreate(section) {
      const customerName = encodeURIComponent(this.detail.name || '')
      if (section.createAction === 'contacts') {
        uni.navigateTo({ url: `/pages/contacts/form?customer_id=${this.id}&customer_name=${customerName}` })
      } else if (section.createAction === 'business') {
        uni.navigateTo({ url: `/pages/business/form?customer_id=${this.id}&customer_name=${customerName}` })
      }
    },
    openRelationDetail(section, item) {
      if (section.key === 'address') {
        this.openAddressLocation(item)
        return
      }
      const routeMap = {
        contacts: item.contacts_id ? `/pages/contacts/detail?id=${item.contacts_id}` : '',
        business: item.business_id ? `/pages/business/detail?id=${item.business_id}` : '',
        contracts: item.contract_id ? `/pages/contract/detail?id=${item.contract_id}` : '',
        receivables: item.receivables_id ? `/pages/receivables/detail?id=${item.receivables_id}` : ''
      }
      const url = routeMap[section.key]
      if (url) uni.navigateTo({ url })
    },
    async submitRecord() {
      const content = this.recordForm.content.trim()
      if (!content) {
        uni.showToast({ title: '请输入跟进内容', icon: 'none' })
        return
      }
      const category = String(this.recordForm.category || '').trim()
      const nextTime = this.buildRecordNextTime()
      const contactsIds = this.buildRecordContactsIds()
      const fileIds = this.recordFileIds()
      this.recordLoading = true
      try {
        if (this.editingRecordId) {
          const source = this.editingRecord || {}
          if (this.editingRecordSource === 'admin_record') {
            await updateCustomerFollowRecord({
              id: this.editingRecordId,
              content,
              category,
              next_time: nextTime,
              contacts_ids: contactsIds
            })
            await this.syncAdminRecordFiles(this.editingRecordId)
          } else {
            await updateRecord({
              activity_id: this.editingRecordId,
              activity_type: source.activity_type || 2,
              activity_type_id: source.activity_type_id || this.id,
              content,
              category,
              next_time: nextTime,
              contacts_ids: contactsIds,
              file_id: fileIds
            })
          }
          uni.showToast({ title: '修改成功', icon: 'success' })
        } else {
          await createRecord({
            activity_type: 2,
            activity_type_id: this.id,
            content,
            category: category || '电话',
            next_time: nextTime,
            contacts_ids: contactsIds,
            file_id: fileIds,
            is_event: 0
          })
          uni.showToast({ title: '保存成功', icon: 'success' })
        }
        this.closeRecordForm()
        await this.reloadActivityRecords()
        this.activeTab = 'activity'
        this.activitySubTab = 'record'
      } finally {
        this.recordLoading = false
      }
    },
    openContacts() {
      uni.navigateTo({
        url: `/pages/contacts/index?customer_id=${this.id}&customer_name=${encodeURIComponent(this.detail.name || '')}`
      })
    }
  }
}
</script>

<style scoped>
.customer-detail-page {
  min-height: 100vh;
  padding: 18rpx 18rpx 160rpx;
  background: linear-gradient(180deg, var(--crm-hero-end) 0, var(--crm-soft-bg) 170rpx, var(--crm-page-bg) 100%);
}

.customer-card,
.content-card {
  border-radius: 8rpx;
  background: var(--crm-card-bg);
}

.customer-card {
  padding: 28rpx 24rpx 20rpx;
  margin-bottom: 16rpx;
}

.customer-main {
  display: flex;
  align-items: flex-start;
}

.customer-logo {
  display: flex;
  width: 88rpx;
  height: 88rpx;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  background: var(--crm-primary);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
}

.customer-info {
  min-width: 0;
  flex: 1;
  margin-left: 22rpx;
}

.name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.customer-name {
  flex: 1;
  overflow: hidden;
  color: var(--crm-text);
  font-size: 31rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deal-tag {
  min-width: 96rpx;
  height: 56rpx;
  background: var(--crm-input-bg);
  color: var(--crm-text-muted);
  font-size: 26rpx;
  line-height: 56rpx;
  text-align: center;
}

.owner-line {
  display: block;
  margin-top: 14rpx;
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 28rpx;
}

.amount-item {
  min-width: 0;
  text-align: center;
}

.amount-num {
  display: block;
  color: var(--crm-text);
  font-size: 29rpx;
  font-weight: 700;
}

.amount-label {
  display: block;
  margin-top: 8rpx;
  overflow: hidden;
  color: var(--crm-text-muted);
  font-size: 25rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-card {
  overflow: visible;
}

.main-tabs {
  display: grid;
  height: 88rpx;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 1rpx solid var(--crm-border);
}

.main-tab {
  position: relative;
  color: var(--crm-text);
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
  right: 44rpx;
  bottom: 0;
  left: 44rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: var(--crm-primary);
  content: "";
}

.tab-panel {
  padding: 20rpx 8rpx 26rpx;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8rpx 20rpx;
}

.sub-tabs {
  display: flex;
  gap: 12rpx;
}

.sub-tab {
  height: 52rpx;
  padding: 0 18rpx;
  border-radius: 6rpx;
  background: var(--crm-input-bg);
  color: var(--crm-text-muted);
  font-size: 25rpx;
  line-height: 52rpx;
}

.sub-tab.active {
  background: var(--crm-primary);
  color: #ffffff;
  font-weight: 700;
}

.filter-text {
  color: var(--crm-text);
  font-size: 25rpx;
}

.record-list {
  padding: 0 0 10rpx;
}

.record-card {
  margin: 0 0 16rpx;
  padding: 26rpx 24rpx 18rpx;
  border-radius: 8rpx;
  background: var(--crm-elevated-bg);
}

.record-head {
  display: flex;
  align-items: flex-start;
}

.record-avatar {
  display: flex;
  width: 64rpx;
  height: 64rpx;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
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
  color: var(--crm-text);
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
  color: var(--crm-text);
  font-size: 30rpx;
  font-weight: 700;
  line-height: 36rpx;
}

.record-body {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 24rpx;
}

.record-content {
  display: block;
  color: var(--crm-text);
  font-size: 27rpx;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.record-line {
  display: block;
  color: var(--crm-text-muted);
  font-size: 25rpx;
  line-height: 1.45;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 26rpx;
  margin-top: 10rpx;
  color: var(--crm-text-muted);
  font-size: 23rpx;
}

.detail-panel {
  padding: 8rpx 24rpx 26rpx;
}

.field-row {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #eef1f6;
}

.field-label {
  width: 180rpx;
  color: #7b8798;
  font-size: 25rpx;
}

.field-value {
  flex: 1;
  color: #172033;
  font-size: 25rpx;
  line-height: 1.55;
  text-align: right;
}

.field-value.is-map-link {
  color: var(--crm-primary);
  font-weight: 700;
}

.relation-panel {
  padding: 18rpx 18rpx 28rpx;
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

.relation-row.is-map-row .relation-row-name {
  color: var(--crm-primary);
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

.relation-row-map {
  flex-shrink: 0;
  min-width: 66rpx;
  color: var(--crm-primary);
  font-size: 24rpx;
  font-weight: 700;
  text-align: right;
}

.relation-empty {
  padding: 46rpx 0;
  color: #98a4b5;
  font-size: 25rpx;
  text-align: center;
}

.empty-text {
  padding: 90rpx 0;
  color: #98a4b5;
  font-size: 26rpx;
  text-align: center;
}

.float-actions {
  position: fixed;
  right: 22rpx;
  bottom: calc(36rpx + env(safe-area-inset-bottom));
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.float-btn {
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
  max-height: 86vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 28rpx 24rpx calc(30rpx + env(safe-area-inset-bottom));
  border-radius: 28rpx 28rpx 0 0;
  background: var(--crm-card-bg);
}

.record-form-title {
  margin-bottom: 20rpx;
  color: var(--crm-text);
  font-size: 31rpx;
  font-weight: 700;
}

.record-textarea {
  width: 100%;
  min-height: 220rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background: var(--crm-input-bg);
  color: var(--crm-text);
  font-size: 27rpx;
}

.record-image-panel {
  margin-top: 18rpx;
  padding: 18rpx 0;
  border-top: 1rpx solid var(--crm-border);
}

.record-image-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.record-image-title {
  color: var(--crm-text);
  font-size: 27rpx;
}

.record-image-add {
  color: var(--crm-primary);
  font-size: 25rpx;
}

.record-image-list {
  display: grid;
  grid-template-columns: repeat(4, 118rpx);
  gap: 14rpx;
}

.record-image-item {
  position: relative;
  width: 118rpx;
  min-height: 118rpx;
}

.record-image-thumb {
  display: block;
  width: 118rpx;
  height: 118rpx;
  border-radius: 8rpx;
  background: var(--crm-soft-bg);
  border: 1rpx solid var(--crm-border);
}

.record-image-remove {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.76);
  color: #ffffff;
  font-size: 26rpx;
  line-height: 32rpx;
  text-align: center;
}

.record-file-chip {
  display: flex;
  width: 118rpx;
  height: 118rpx;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10rpx;
  padding: 10rpx 12rpx;
  border-radius: 8rpx;
  background: var(--crm-soft-bg);
  border: 1rpx solid var(--crm-border);
}

.record-file-icon {
  flex: 0 0 34rpx;
  width: 34rpx;
  height: 34rpx;
  border-radius: 6rpx;
  background: var(--crm-primary);
  color: #ffffff;
  font-size: 20rpx;
  line-height: 34rpx;
  text-align: center;
}

.record-file-name {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  color: var(--crm-text);
  font-size: 23rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-image-empty {
  display: block;
  color: var(--crm-text-muted);
  font-size: 25rpx;
}

.record-form-fields {
  margin-top: 18rpx;
  border-top: 1rpx solid var(--crm-border);
}

.record-field-row {
  display: flex;
  min-height: 82rpx;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  border-bottom: 1rpx solid var(--crm-border);
}

.record-field-label {
  flex-shrink: 0;
  color: var(--crm-text);
  font-size: 27rpx;
}

.record-field-value {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  gap: 10rpx;
  color: var(--crm-text);
  font-size: 26rpx;
  text-align: right;
}

.record-field-value text:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-field-value .placeholder {
  color: var(--crm-text-muted);
}

.record-field-arrow {
  flex-shrink: 0;
  color: var(--crm-text-muted);
  font-size: 30rpx;
}

.record-field-input {
  min-width: 0;
  flex: 1;
  height: 70rpx;
  color: var(--crm-text);
  font-size: 26rpx;
  text-align: right;
}

.record-field-clear {
  padding-top: 18rpx;
  color: var(--crm-text-muted);
  font-size: 25rpx;
  text-align: right;
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
</style>
