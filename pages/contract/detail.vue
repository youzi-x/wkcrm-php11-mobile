<template>
  <view class="contract-detail-page">
    <view class="top-bg"></view>

    <view class="contract-card">
      <view class="contract-main">
        <view class="contract-logo">▣</view>
        <view class="contract-info">
          <view class="name-row">
            <text class="contract-name">{{ detail.name || '合同名称' }}</text>
            <text class="status-tag">{{ checkStatus }}</text>
          </view>
        </view>
      </view>

      <view class="progress-row">
        <text class="progress-label">回款进度({{ progressPercent }}%)</text>
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
      </view>

      <view class="amount-line">
        <text class="amount-label">合同金额</text>
        <text class="amount-value">￥ {{ formatMoney(contractMoney) }}</text>
      </view>

      <view class="money-row">
        <text>已回款：￥{{ formatMoney(receivedMoney) }}</text>
        <text>待回款：￥{{ formatMoney(unreceivedMoney) }}</text>
      </view>

      <view class="order-line">下单时间：{{ detail.order_date || '--' }}</view>

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
              合同动态
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
                  <text class="record-badge">合同跟进记录</text>
                </view>
                <text class="record-time">{{ item.create_time || item.update_time || '' }}</text>
              </view>
            </view>
            <view class="record-body">
              <text class="record-content">{{ item.content || '--' }}</text>
              <FollowRecordFiles :record="item" />
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
                  <text class="record-badge">合同动态</text>
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
          <text>暂无合同动态</text>
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

    <view v-if="showApprovalBar" class="approval-bar" :class="{ 'approval-bar--actions': approvalHasUsers }">
      <view v-if="approvalHasUsers" class="approval-action-panel">
        <input
          v-model="approvalContent"
          class="approval-content-input"
          placeholder="请输入审批内容"
          placeholder-class="approval-content-placeholder"
        />
        <view class="approval-action-row">
          <button class="approval-action-btn approval-action-btn--dark" @click="showApprovalDetail">详情</button>
          <button class="approval-action-btn approval-action-btn--light" @click="showMoreApprovalActions">更多</button>
          <button class="approval-action-btn approval-action-btn--dark" :disabled="approvalChecking" @click="handleContractCheck(true)">通过</button>
          <button class="approval-action-btn approval-action-btn--danger" :disabled="approvalChecking" @click="handleContractCheck(false)">拒绝</button>
        </view>
      </view>
      <button v-else class="approval-button" @click="chooseApprovalUser">选择审批人</button>
    </view>

    <view v-if="showApprovalPicker" class="approval-mask" @click="closeApprovalPicker">
      <view class="approval-sheet" @click.stop>
        <view class="approval-sheet-head">
          <text class="approval-sheet-title">选择审批人</text>
          <text class="approval-sheet-close" @click="closeApprovalPicker">×</text>
        </view>

        <view class="approval-search">
          <text class="approval-search-icon">⌕</text>
          <input v-model="approvalKeyword" class="approval-search-input" placeholder="搜索成员" placeholder-class="approval-search-placeholder" />
        </view>

        <scroll-view scroll-y class="approval-list">
          <view v-if="approvalLoading" class="approval-empty">审批人加载中...</view>
          <view v-else-if="!filteredApprovalCandidates.length" class="approval-empty">暂无可选审批人</view>
          <block v-else>
            <view
              v-for="user in filteredApprovalCandidates"
              :key="user.id"
              class="approval-user-row"
              :class="{ active: selectedApprovalUserIds.includes(Number(user.id)) }"
              @click="toggleApprovalUser(user)"
            >
              <view class="approval-user-avatar">{{ userAvatar(user) }}</view>
              <view class="approval-user-info">
                <text class="approval-user-name">{{ user.realname || user.username || user.name || '未命名成员' }}</text>
                <text class="approval-user-meta">{{ user.structure_name || user.post || user.username || '审批成员' }}</text>
              </view>
              <text class="approval-user-check">{{ selectedApprovalUserIds.includes(Number(user.id)) ? '✓' : '' }}</text>
            </view>
          </block>
        </scroll-view>

        <view class="approval-sheet-footer">
          <view class="approval-selected">已选 {{ selectedApprovalUserIds.length }} 人</view>
          <button class="approval-cancel" @click="closeApprovalPicker">取消</button>
          <button class="approval-submit" :disabled="approvalSubmitting" @click="submitApprovalUser">确认提交</button>
        </view>
      </view>
    </view>

    <view v-if="showApprovalDetailPanel" class="approval-mask" @click="closeApprovalDetail">
      <view class="approval-detail-sheet" @click.stop>
        <view class="approval-sheet-head">
          <text class="approval-sheet-title">审批详情</text>
          <text class="approval-sheet-close" @click="closeApprovalDetail">×</text>
        </view>

        <view class="approval-current">
          <text class="approval-current-label">当前审核人</text>
          <text class="approval-current-value">{{ approvalUserNames || '暂无审批人' }}</text>
        </view>

        <scroll-view scroll-y class="approval-record-list">
          <view v-if="examineLoading" class="approval-empty">审批记录加载中...</view>
          <view v-else-if="!examineRecords.length" class="approval-empty">暂无审批记录</view>
          <block v-else>
            <view v-for="item in examineRecords" :key="item.record_id || item.order_id" class="approval-record-row">
              <view class="approval-record-dot" :class="`status-${Number(item.status)}`"></view>
              <view class="approval-record-main">
                <view class="approval-record-head">
                  <text class="approval-record-user">{{ examineUserName(item) }}</text>
                  <text class="approval-record-status">{{ examineStatusText(item.status) }}</text>
                </view>
                <text class="approval-record-time">{{ item.check_date || '--' }}</text>
                <text v-if="item.content" class="approval-record-content">{{ item.content }}</text>
              </view>
            </view>
          </block>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  checkContract,
  getContractCount,
  getContractDetail,
  getContractRecords,
  getCrmTeam,
  getExamineFlowUsers,
  getExamineRecordList,
  getModuleFields,
  getReceivablesList,
  getReceivablesPlanList,
  getUserList,
  revokeContractCheck,
  updateContract
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
      recordOrder: 'desc',
      detail: {},
      counts: {},
      fields: [],
      records: [],
      relationData: {
        plans: [],
        receivables: [],
        team: []
      },
      approvalUsers: [],
      approvalCandidateUsers: [],
      committedApprovalUserIds: [],
      selectedApprovalUserIds: [],
      approvalKeyword: '',
      approvalContent: '',
      approvalLoading: false,
      approvalSubmitting: false,
      approvalChecking: false,
      showApprovalPicker: false,
      showApprovalDetailPanel: false,
      examineLoading: false,
      examineRecords: [],
      localApprovalResult: null,
      tabs: [
        { key: 'activity', label: '活动记录' },
        { key: 'detail', label: '详细信息' },
        { key: 'relation', label: '相关信息' }
      ]
    }
  },
  computed: {
    checkStatus() {
      return this.detail.check_status_info || this.statusMap[String(this.detail.check_status)] || '合同'
    },
    contractMoney() {
      return Number(this.detail.money || 0)
    },
    receivedMoney() {
      const moneyInfo = this.detail.receivablesMoney || {}
      return Number(moneyInfo.doneMoney || moneyInfo.receivablesMoney || this.sumReceivablesMoney() || 0)
    },
    unreceivedMoney() {
      const moneyInfo = this.detail.receivablesMoney || {}
      const apiValue = moneyInfo.unMoney || moneyInfo.unReceivedMoney || moneyInfo.arrearsMoney
      if (apiValue !== undefined && apiValue !== null && apiValue !== '') return Number(apiValue)
      return Math.max(this.contractMoney - this.receivedMoney, 0)
    },
    progressPercent() {
      if (!this.contractMoney) return 0
      return Math.min(100, Math.round((this.receivedMoney / this.contractMoney) * 100))
    },
    primaryContactName() {
      const contact = this.detail.contacts_id_info || {}
      return this.detail.contacts_name || contact.name || '暂无联系人'
    },
    primaryContactId() {
      const contact = this.detail.contacts_id_info || {}
      return this.detail.contacts_id || contact.contacts_id || ''
    },
    filterLabel() {
      return this.recordOrder === 'desc' ? '筛选时间⌄' : '时间正序⌄'
    },
    statusMap() {
      return {
        0: '待审核',
        1: '审核中',
        2: '审核通过',
        3: '已拒绝',
        4: '已撤回',
        5: '未提交',
        6: '已作废',
        7: '正常'
      }
    },
    showApprovalBar() {
      const status = this.detail.check_status === undefined || this.detail.check_status === null ? '' : String(this.detail.check_status)
      return ['0', '1', '5'].includes(status) || this.approvalHasUsers
    },
    approvalUserIds() {
      const ids = this.parseUserIds(this.detail.check_user_id)
      return ids.length ? ids : this.committedApprovalUserIds
    },
    approvalHasUsers() {
      return this.approvalUserIds.length > 0 || this.approvalUsers.length > 0
    },
    approvalUserNames() {
      const names = this.approvalUsers.map((item) => item.realname || item.username || item.name).filter(Boolean)
      if (names.length) return names.join('、')
      if (this.approvalUserIds.length) return `已选择 ${this.approvalUserIds.length} 人`
      return ''
    },
    filteredApprovalCandidates() {
      const keyword = this.approvalKeyword.trim().toLowerCase()
      if (!keyword) return this.approvalCandidateUsers
      return this.approvalCandidateUsers.filter((item) => {
        const text = [
          item.realname,
          item.username,
          item.name,
          item.structure_name,
          item.post
        ].filter(Boolean).join(' ').toLowerCase()
        return text.includes(keyword)
      })
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
          key: 'plans',
          title: `回款计划（${this.relationData.plans.length || 0}）`,
          icon: '计',
          items: this.relationData.plans
        },
        {
          key: 'receivables',
          title: `回款（${this.relationData.receivables.length || this.counts.receivablesCount || 0}）`,
          icon: '款',
          items: this.relationData.receivables
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
        getContractDetail(this.id),
        getContractCount(this.id),
        getModuleFields({
          module: 'crm',
          controller: 'contract',
          action: 'read',
          types: 'crm_contract',
          action_id: this.id
        }),
        getContractRecords(this.id)
      ])
      this.detail = detail || {}
      if (this.localApprovalResult) {
        const resultStatus = String(this.localApprovalResult.status)
        const currentStatus = this.detail.check_status === undefined || this.detail.check_status === null ? '' : String(this.detail.check_status)
        if (currentStatus === resultStatus) {
          this.localApprovalResult = null
        } else if (['0', '1'].includes(currentStatus) && Date.now() - this.localApprovalResult.time < 5000) {
          this.detail = {
            ...this.detail,
            check_status: this.localApprovalResult.status,
            check_status_info: this.localApprovalResult.text,
            check_user_id: ''
          }
        }
      }
      const approvalIds = this.parseUserIds(this.detail.check_user_id)
      if (approvalIds.length) this.committedApprovalUserIds = approvalIds
      this.counts = counts || {}
      this.fields = normalizeFields(fields || [])
      this.records = records.list || []
      await this.loadRelationData()
      await this.loadApprovalUsers()
    },
    async loadRelationData() {
      const [plans, receivables, team] = await Promise.all([
        getReceivablesPlanList({ page: 1, limit: 20, contract_id: this.id }, { showError: false }).catch(() => ({ list: [] })),
        getReceivablesList({ page: 1, limit: 20, contract_id: this.id }, { showError: false }).catch(() => ({ list: [] })),
        getCrmTeam({ types: 'crm_contract', types_id: this.id }, { showError: false }).catch(() => [])
      ])
      this.relationData.plans = this.normalizeList(plans)
      this.relationData.receivables = this.normalizeList(receivables)
      this.relationData.team = this.normalizeList(team)
    },
    async loadApprovalUsers() {
      const ids = this.parseUserIds(this.detail.check_user_id)
      const targetIds = ids.length ? ids : this.committedApprovalUserIds
      if (!targetIds.length) {
        this.approvalUsers = []
        return
      }
      const users = await getUserList({ id: targetIds }, { showError: false }).catch(() => ({ list: [] }))
      const list = this.normalizeList(users)
      this.approvalUsers = list.filter((item) => targetIds.includes(Number(item.id)))
    },
    parseUserIds(value) {
      if (Array.isArray(value)) return value.map(Number).filter(Boolean)
      return String(value || '')
        .split(',')
        .map((item) => Number(item.trim()))
        .filter(Boolean)
    },
    normalizeList(result) {
      if (Array.isArray(result)) return result
      if (result && Array.isArray(result.list)) return result.list
      if (result && Array.isArray(result.data)) return result.data
      return []
    },
    sumReceivablesMoney() {
      return this.relationData.receivables.reduce((sum, item) => sum + Number(item.money || 0), 0)
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
      openMapLocation(source, `${this.detail.name || this.detail.num || ''} ${item.label || '位置'}`.trim())
    },
    openRecordForm() {
      uni.navigateTo({
        url: `/pages/activity/form?activity_type=6&activity_type_id=${this.id}&name=${encodeURIComponent(this.detail.name || this.detail.num || '')}`
      })
    },
    openPrimaryContact() {
      if (!this.primaryContactId) return
      uni.navigateTo({ url: `/pages/contacts/detail?id=${this.primaryContactId}` })
    },
    relationItemKey(section, item) {
      return item.plan_id || item.receivables_id || item.id || item.user_id || item.name || section.key
    },
    relationItemTitle(section, item) {
      if (section.key === 'plans') return item.num || item.return_date || '回款计划'
      if (section.key === 'receivables') return item.number || item.return_time || '回款'
      return item.realname || item.user_name || item.name || '团队成员'
    },
    relationItemLines(section, item) {
      if (section.key === 'plans') {
        return [
          `计划回款：￥${this.formatMoney(item.money)}`,
          `计划日期：${item.return_date || '--'}`
        ]
      }
      if (section.key === 'receivables') {
        return [
          `回款金额：￥${this.formatMoney(item.money)}`,
          `回款日期：${item.return_time || '--'}`
        ]
      }
      return [
        `角色：${item.types || item.role_name || '--'}`
      ]
    },
    openRelationDetail(section, item) {
      if (section.key === 'receivables') {
        const id = item.receivables_id || item.id
        if (id) uni.navigateTo({ url: `/pages/receivables/detail?id=${id}` })
        return
      }
      if (section.key === 'plans') {
        uni.showToast({ title: '回款计划详情暂未开放', icon: 'none' })
      }
    },
    async chooseApprovalUser() {
      this.showApprovalPicker = true
      this.approvalKeyword = ''
      this.selectedApprovalUserIds = this.parseUserIds(this.detail.check_user_id)
      await this.loadApprovalCandidates()
    },
    closeApprovalPicker() {
      if (this.approvalSubmitting) return
      this.showApprovalPicker = false
    },
    async loadApprovalCandidates() {
      if (this.approvalCandidateUsers.length) return
      this.approvalLoading = true
      try {
        const result = await getExamineFlowUsers({ types: 'crm_contract' }, { showError: false })
        this.approvalCandidateUsers = this.uniqueUsers(this.normalizeList(result))
      } catch (error) {
        const result = await getUserList({}, { showError: false }).catch(() => ({ list: [] }))
        this.approvalCandidateUsers = this.uniqueUsers(this.normalizeList(result))
      } finally {
        this.approvalLoading = false
      }
    },
    uniqueUsers(list) {
      const map = new Map()
      list.forEach((item) => {
        const id = Number(item.id || item.user_id)
        if (!id) return
        map.set(id, { ...item, id })
      })
      return Array.from(map.values())
    },
    userAvatar(user) {
      return (user.realname || user.username || user.name || '审').slice(0, 1)
    },
    toggleApprovalUser(user) {
      const id = Number(user.id)
      if (!id) return
      if (this.selectedApprovalUserIds.includes(id)) {
        this.selectedApprovalUserIds = this.selectedApprovalUserIds.filter((item) => item !== id)
        return
      }
      this.selectedApprovalUserIds = [...this.selectedApprovalUserIds, id]
    },
    buildApprovalPayload(ids) {
      const customer = this.detail.customer_id_info || {}
      const business = this.detail.business_id_info || {}
      const contact = this.detail.contacts_id_info || {}
      return {
        id: this.id,
        name: this.detail.name || this.detail.num || '合同',
        num: this.detail.num || '',
        money: this.detail.money || 0,
        customer_id: this.detail.customer_id || customer.customer_id || '',
        business_id: this.detail.business_id || business.business_id || '',
        contacts_id: this.detail.contacts_id || contact.contacts_id || '',
        order_date: this.detail.order_date || '',
        start_time: this.detail.start_time || '',
        end_time: this.detail.end_time || '',
        check_user_id: ids.join(','),
        examineStatus: true,
        is_draft: 0
      }
    },
    async submitApprovalUser() {
      if (!this.selectedApprovalUserIds.length) {
        uni.showToast({ title: '请选择审批人', icon: 'none' })
        return
      }
      this.approvalSubmitting = true
      uni.showLoading({ title: '提交中...' })
      const payload = this.buildApprovalPayload(this.selectedApprovalUserIds)
      try {
        await this.submitApprovalPayload(payload)
        uni.hideLoading()
        uni.showToast({ title: '已提交审批', icon: 'success' })
        this.committedApprovalUserIds = [...this.selectedApprovalUserIds]
        this.approvalUsers = this.approvalCandidateUsers.filter((item) => this.selectedApprovalUserIds.includes(Number(item.id)))
        this.detail = {
          ...this.detail,
          check_status: 0,
          check_user_id: `,${this.selectedApprovalUserIds.join(',')},`
        }
        this.showApprovalPicker = false
        await this.loadData()
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: this.getErrorMessage(error) || '审批人提交失败',
          icon: 'none'
        })
      } finally {
        this.approvalSubmitting = false
      }
    },
    async submitApprovalPayload(payload) {
      try {
        return await updateContract(payload, { showError: false })
      } catch (error) {
        const message = this.getErrorMessage(error)
        if (String(this.detail.check_status) === '1' && message.includes('不可编辑')) {
          await revokeContractCheck({
            id: this.id,
            content: '重新选择审批人'
          }, { showError: false })
          return updateContract(payload, { showError: false })
        }
        throw error
      }
    },
    async showApprovalDetail() {
      this.showApprovalDetailPanel = true
      await this.loadExamineRecords()
    },
    closeApprovalDetail() {
      this.showApprovalDetailPanel = false
    },
    async loadExamineRecords() {
      this.examineLoading = true
      try {
        const result = await getExamineRecordList({
          types_id: this.id
        }, { showError: false })
        this.examineRecords = this.normalizeList(result)
      } catch (error) {
        this.examineRecords = []
      } finally {
        this.examineLoading = false
      }
    },
    examineUserName(item) {
      const user = item.check_user_id_info || {}
      return user.realname || user.username || item.check_user_name || '审批人'
    },
    examineStatusText(status) {
      const map = {
        0: '拒绝',
        1: '通过',
        2: '撤回',
        3: '提交'
      }
      return map[Number(status)] || '审批'
    },
    showMoreApprovalActions() {
      uni.showActionSheet({
        itemList: ['查看审批人', '重新选择审批人'],
        success: ({ tapIndex }) => {
          if (tapIndex === 0) {
            uni.showToast({
              title: this.approvalUserNames || '暂无审批人',
              icon: 'none'
            })
            return
          }
          if (tapIndex === 1) this.chooseApprovalUser()
        }
      })
    },
    handleContractCheck(passed) {
      const content = this.approvalContent.trim()
      if (!passed && !content) {
        uni.showToast({ title: '请输入拒绝原因', icon: 'none' })
        return
      }
      uni.showModal({
        title: passed ? '确认通过' : '确认拒绝',
        content: passed ? '确定通过该合同审批吗？' : '确定拒绝该合同审批吗？',
        success: (res) => {
          if (res.confirm) this.submitContractCheck(passed)
        }
      })
    },
    async submitContractCheck(passed) {
      if (this.approvalChecking) return
      this.approvalChecking = true
      uni.showLoading({ title: '提交中...' })
      try {
        await checkContract({
          id: this.id,
          status: passed ? 1 : 0,
          content: this.approvalContent.trim(),
          is_end: 1
        }, { showError: false })
        this.applyApprovalResult(passed)
        uni.hideLoading()
        uni.showToast({ title: passed ? '审批通过' : '已拒绝', icon: 'success' })
        this.approvalContent = ''
        uni.$emit('contract-detail-updated', {
          id: this.id,
          check_status: passed ? 2 : 3
        })
        await this.loadData()
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: this.getErrorMessage(error) || '审批提交失败',
          icon: 'none'
        })
      } finally {
        this.approvalChecking = false
      }
    },
    applyApprovalResult(passed) {
      const status = passed ? 2 : 3
      const text = passed ? '审核通过' : '已拒绝'
      this.localApprovalResult = {
        status,
        text,
        time: Date.now()
      }
      this.detail = {
        ...this.detail,
        check_status: status,
        check_status_info: text,
        check_user_id: ''
      }
      this.approvalUsers = []
      this.committedApprovalUserIds = []
      this.selectedApprovalUserIds = []
      this.examineRecords = []
      if (this.showApprovalDetailPanel) this.loadExamineRecords()
    },
    getErrorMessage(error) {
      if (!error) return ''
      return error.error || error.msg || error.message || ''
    }
  }
}
</script>

<style scoped>
.contract-detail-page {
  position: relative;
  min-height: 100vh;
  padding: 24rpx 18rpx 230rpx;
  background: var(--crm-page-bg);
}

.top-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 190rpx;
  background: linear-gradient(135deg, var(--crm-hero-start) 0%, var(--crm-hero-end) 100%);
}

.contract-card,
.content-card {
  position: relative;
  border-radius: 8rpx;
  background: var(--crm-card-bg);
}

.contract-card {
  padding: 26rpx 24rpx 0;
  margin-bottom: 24rpx;
}

.contract-main {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 26rpx;
}

.contract-logo {
  width: 44rpx;
  height: 44rpx;
  border-radius: 8rpx;
  background: var(--crm-primary);
  color: #ffffff;
  text-align: center;
  line-height: 44rpx;
  font-size: 23rpx;
}

.contract-info {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.contract-name {
  color: var(--crm-text);
  font-size: 30rpx;
  font-weight: 700;
}

.status-tag {
  padding: 6rpx 14rpx;
  border-radius: 4rpx;
  background: var(--crm-soft-bg);
  color: var(--crm-primary);
  font-size: 22rpx;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 18rpx;
}

.progress-label {
  color: var(--crm-text);
  font-size: 25rpx;
  font-weight: 700;
}

.progress-track {
  width: 172rpx;
  height: 10rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: var(--crm-border);
}

.progress-fill {
  height: 10rpx;
  border-radius: 999rpx;
  background: var(--crm-primary);
}

.amount-line {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-bottom: 18rpx;
}

.amount-label {
  color: var(--crm-text);
  font-size: 25rpx;
  font-weight: 700;
}

.amount-value {
  color: #ff5b22;
  font-size: 26rpx;
  font-weight: 700;
}

.money-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 18rpx;
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.order-line {
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid var(--crm-border);
  color: var(--crm-text-muted);
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
  color: var(--crm-text);
  font-size: 28rpx;
}

.contact-icon {
  color: var(--crm-primary);
  font-size: 34rpx;
}

.row-arrow {
  color: var(--crm-text-muted);
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
  border-bottom: 1rpx solid var(--crm-border);
}

.main-tab {
  position: relative;
  margin-right: 44rpx;
  height: 90rpx;
  line-height: 90rpx;
  color: var(--crm-text);
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
  background: var(--crm-input-bg);
  color: var(--crm-text-muted);
  line-height: 56rpx;
  font-size: 25rpx;
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

.record-card {
  margin-bottom: 18rpx;
  padding: 22rpx;
  border-radius: 12rpx;
  background: var(--crm-elevated-bg);
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
  color: var(--crm-text);
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
  color: var(--crm-text-muted);
  font-size: 22rpx;
}

.record-content,
.record-line {
  display: block;
  color: var(--crm-text-muted);
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
  color: var(--crm-text-muted);
  font-size: 25rpx;
}

.empty-illustration {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: var(--crm-elevated-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--crm-text-muted);
  font-size: 70rpx;
}

.field-row {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid var(--crm-border);
}

.field-label {
  width: 170rpx;
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.field-value {
  flex: 1;
  text-align: right;
  color: var(--crm-text);
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
  background: var(--crm-elevated-bg);
}

.relation-head {
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  border-bottom: 1rpx solid var(--crm-border);
}

.relation-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: var(--crm-text);
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
  border-bottom: 1rpx solid var(--crm-border);
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
  color: var(--crm-text);
  font-size: 26rpx;
  font-weight: 700;
}

.relation-row-line {
  display: block;
  color: var(--crm-text-muted);
  font-size: 23rpx;
  line-height: 1.6;
}

.relation-empty,
.empty-text {
  padding: 34rpx 0;
  text-align: center;
  color: var(--crm-text-muted);
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

.approval-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 104rpx;
  padding: 16rpx 20rpx calc(16rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid var(--crm-border);
  background: var(--crm-card-bg);
}

.approval-bar--actions {
  display: block;
  min-height: 152rpx;
  padding: 10rpx 16rpx calc(10rpx + env(safe-area-inset-bottom));
}

.approval-action-panel {
  width: 100%;
}

.approval-content-input {
  width: 100%;
  height: 54rpx;
  box-sizing: border-box;
  padding: 0 12rpx;
  border: 1rpx solid var(--crm-border);
  border-radius: 6rpx;
  background: var(--crm-input-bg);
  color: var(--crm-text);
  font-size: 24rpx;
}

.approval-content-placeholder {
  color: var(--crm-text-muted);
}

.approval-action-row {
  display: grid;
  grid-template-columns: 1fr 1.28fr 1.18fr 1.18fr;
  gap: 12rpx;
  margin-top: 10rpx;
}

.approval-action-btn {
  height: 70rpx;
  border-radius: 5rpx;
  font-size: 27rpx;
  line-height: 70rpx;
}

.approval-action-btn::after {
  border: none;
}

.approval-action-btn--dark {
  background: var(--crm-primary);
  color: #ffffff;
}

.approval-action-btn--light {
  background: var(--crm-input-bg);
  color: var(--crm-text-muted);
}

.approval-action-btn--danger {
  background: #ff5a68;
  color: #ffffff;
}

.approval-action-btn[disabled] {
  opacity: 0.72;
}

.approval-users {
  width: 100%;
  min-height: 72rpx;
  display: flex;
  align-items: center;
  padding: 0 22rpx;
  border-radius: 8rpx;
  background: var(--crm-input-bg);
}

.approval-label {
  margin-right: 18rpx;
  color: var(--crm-text-muted);
  font-size: 25rpx;
}

.approval-names {
  flex: 1;
  color: var(--crm-text);
  font-size: 27rpx;
  font-weight: 700;
}

.approval-button {
  min-width: 214rpx;
  height: 72rpx;
  padding: 0 32rpx;
  border-radius: 6rpx;
  background: var(--crm-primary);
  color: #ffffff;
  font-size: 27rpx;
  line-height: 72rpx;
}

.approval-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 90;
  display: flex;
  align-items: flex-end;
  background: rgba(14, 24, 40, 0.44);
}

.approval-sheet {
  width: 100%;
  max-height: 78vh;
  padding: 0 26rpx calc(18rpx + env(safe-area-inset-bottom));
  border-radius: 18rpx 18rpx 0 0;
  background: var(--crm-card-bg);
}

.approval-detail-sheet {
  width: 100%;
  max-height: 74vh;
  padding: 0 26rpx calc(18rpx + env(safe-area-inset-bottom));
  border-radius: 18rpx 18rpx 0 0;
  background: var(--crm-card-bg);
}

.approval-sheet-head {
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.approval-sheet-title {
  color: var(--crm-text);
  font-size: 30rpx;
  font-weight: 700;
}

.approval-sheet-close {
  width: 56rpx;
  height: 56rpx;
  color: var(--crm-text-muted);
  text-align: center;
  line-height: 52rpx;
  font-size: 42rpx;
}

.approval-search {
  height: 70rpx;
  display: flex;
  align-items: center;
  padding: 0 22rpx;
  border-radius: 10rpx;
  background: var(--crm-input-bg);
}

.approval-search-icon {
  margin-right: 12rpx;
  color: var(--crm-text-muted);
  font-size: 28rpx;
}

.approval-search-input {
  flex: 1;
  height: 70rpx;
  color: var(--crm-text);
  font-size: 26rpx;
}

.approval-search-placeholder {
  color: var(--crm-text-muted);
}

.approval-list {
  height: 560rpx;
  margin-top: 16rpx;
}

.approval-user-row {
  min-height: 92rpx;
  display: flex;
  align-items: center;
  padding: 14rpx 4rpx;
  border-bottom: 1rpx solid var(--crm-border);
}

.approval-user-row.active .approval-user-avatar {
  background: var(--crm-primary);
}

.approval-user-avatar {
  width: 52rpx;
  height: 52rpx;
  margin-right: 18rpx;
  border-radius: 50%;
  background: #8aa1bf;
  color: #ffffff;
  text-align: center;
  line-height: 52rpx;
  font-size: 24rpx;
}

.approval-user-info {
  flex: 1;
  min-width: 0;
}

.approval-user-name,
.approval-user-meta {
  display: block;
}

.approval-user-name {
  color: var(--crm-text);
  font-size: 27rpx;
  font-weight: 700;
}

.approval-user-meta {
  margin-top: 6rpx;
  color: var(--crm-text-muted);
  font-size: 22rpx;
}

.approval-user-check {
  width: 42rpx;
  color: var(--crm-primary);
  text-align: right;
  font-size: 30rpx;
  font-weight: 700;
}

.approval-empty {
  height: 320rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--crm-text-muted);
  font-size: 25rpx;
}

.approval-current {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 78rpx;
  padding: 0 18rpx;
  border-radius: 10rpx;
  background: var(--crm-input-bg);
}

.approval-current-label {
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.approval-current-value {
  flex: 1;
  padding-left: 20rpx;
  color: var(--crm-text);
  text-align: right;
  font-size: 26rpx;
  font-weight: 700;
}

.approval-record-list {
  height: 520rpx;
  margin-top: 18rpx;
}

.approval-record-row {
  display: flex;
  gap: 18rpx;
  padding: 18rpx 0;
  border-bottom: 1rpx solid var(--crm-border);
}

.approval-record-dot {
  width: 18rpx;
  height: 18rpx;
  margin-top: 12rpx;
  border-radius: 50%;
  background: #a8b3c2;
}

.approval-record-dot.status-0 {
  background: #ff5a68;
}

.approval-record-dot.status-1 {
  background: var(--crm-primary);
}

.approval-record-dot.status-2 {
  background: #f5a623;
}

.approval-record-dot.status-3 {
  background: var(--crm-primary);
}

.approval-record-main {
  flex: 1;
  min-width: 0;
}

.approval-record-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.approval-record-user {
  color: var(--crm-text);
  font-size: 27rpx;
  font-weight: 700;
}

.approval-record-status {
  color: var(--crm-primary);
  font-size: 23rpx;
}

.approval-record-time,
.approval-record-content {
  display: block;
  margin-top: 8rpx;
  color: var(--crm-text-muted);
  font-size: 23rpx;
  line-height: 1.5;
}

.approval-sheet-footer {
  min-height: 92rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid var(--crm-border);
}

.approval-selected {
  flex: 1;
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.approval-cancel,
.approval-submit {
  height: 68rpx;
  min-width: 148rpx;
  padding: 0 28rpx;
  border-radius: 6rpx;
  font-size: 26rpx;
  line-height: 68rpx;
}

.approval-cancel {
  background: var(--crm-input-bg);
  color: var(--crm-text);
}

.approval-submit {
  background: var(--crm-primary);
  color: #ffffff;
}

.approval-submit[disabled] {
  background: var(--crm-text-muted);
  color: #ffffff;
}
</style>
