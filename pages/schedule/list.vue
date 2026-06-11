<template>
  <view class="todo-list-page">
    <view class="summary-card">
      <text class="summary-title">{{ title }}</text>
      <text class="summary-sub">{{ total }} 条记录</text>
    </view>

    <view
      v-for="item in list"
      :key="itemKey(item)"
      class="todo-record"
      :class="{ 'todo-record--unread': isMessageList && isMessageUnread(item) }"
      @click="openDetail(item)"
    >
      <view class="record-main">
        <view class="record-title-row">
          <text class="record-title">{{ itemTitle(item) }}</text>
          <view v-if="isMessageList" class="record-state">
            <button
              class="read-action"
              :class="{ 'read-action--unread': isMessageUnread(item) }"
              :loading="activeMessageId === item.message_id"
              :disabled="activeMessageId === item.message_id"
              @click.stop="toggleMessageRead(item)"
            >
              {{ isMessageUnread(item) ? '设为已读' : '设为未读' }}
            </button>
            <text class="read-badge" :class="{ 'read-badge--unread': isMessageUnread(item) }">
              {{ isMessageUnread(item) ? '未读' : '已读' }}
            </text>
          </view>
        </view>
        <text class="record-desc">{{ itemDesc(item) }}</text>
        <text v-if="itemTime(item)" class="record-time">{{ itemTime(item) }}</text>
      </view>
    </view>

    <view v-if="!loading && !list.length" class="empty-text">暂无数据</view>
    <view v-if="loading" class="empty-text">加载中...</view>
    <view v-if="finished && list.length" class="bottom-text">没有更多了</view>
  </view>
</template>

<script>
import { getTodoList, updateMessageReadStatus } from '../../api/crm'
import { ensureLogin } from '../../utils/router'

const DETAIL_ROUTES = {
  leads: '/pages/leads/detail',
  customer: '/pages/customer/detail',
  contacts: '/pages/contacts/detail',
  business: '/pages/business/detail',
  contract: '/pages/contract/detail',
  task: '/pages/project/task-detail'
}

const MESSAGE_TYPE_ROUTE = {
  1: DETAIL_ROUTES.task,
  2: DETAIL_ROUTES.task,
  3: DETAIL_ROUTES.task,
  11: DETAIL_ROUTES.contract,
  12: DETAIL_ROUTES.contract,
  13: DETAIL_ROUTES.contract,
  21: DETAIL_ROUTES.customer,
  22: DETAIL_ROUTES.business,
  23: DETAIL_ROUTES.contract,
  28: DETAIL_ROUTES.business,
  29: DETAIL_ROUTES.customer,
  30: DETAIL_ROUTES.contract,
  32: DETAIL_ROUTES.leads
}

export default {
  data() {
    return {
      type: '',
      title: '通知/待办',
      page: 1,
      limit: 20,
      total: 0,
      list: [],
      loading: false,
      finished: false,
      activeMessageId: ''
    }
  },
  computed: {
    isMessageList() {
      return this.type === 'message'
    }
  },
  async onLoad(options) {
    if (!ensureLogin()) return
    this.type = options.type || ''
    this.title = options.title ? decodeURIComponent(options.title) : '通知/待办'
    uni.setNavigationBarTitle({ title: this.title })
    await this.loadList(true)
  },
  async onPullDownRefresh() {
    await this.loadList(true)
    uni.stopPullDownRefresh()
  },
  async onReachBottom() {
    if (!this.finished) await this.loadList()
  },
  methods: {
    async loadList(reset = false) {
      if (this.loading) return
      if (reset) {
        this.page = 1
        this.finished = false
      }
      this.loading = true
      try {
        const result = await getTodoList(this.type, {
          page: this.page,
          limit: this.limit
        })
        const pageData = result.page || result
        const rows = pageData.list || []
        this.total = Number(pageData.dataCount || result.dataCount || rows.length || 0)
        this.list = reset ? rows : this.list.concat(rows)
        this.finished = rows.length < this.limit || this.list.length >= this.total
        this.page += 1
      } finally {
        this.loading = false
      }
    },
    itemKey(item) {
      return item.message_id || item.leads_id || item.customer_id || item.business_id || item.contract_id || item.plan_id || item.receivables_id || item.id || item.action_id
    },
    itemTitle(item) {
      return item.name || item.title || item.relation_title || item.customer_name || item.business_name || item.contract_name || item.num || item.number || item.content || '待办记录'
    },
    itemDesc(item) {
      const parts = [
        item.owner_user_name ? `负责人：${item.owner_user_name}` : '',
        item.customer_name ? `客户：${item.customer_name}` : '',
        item.money ? `金额：${item.money}` : '',
        item.content && item.content !== this.itemTitle(item) ? item.content : ''
      ].filter(Boolean)
      return parts.join('  ') || '点击查看详情'
    },
    itemTime(item) {
      return item.create_time || item.update_time || item.next_time || item.return_date || item.end_time || ''
    },
    isMessageUnread(item) {
      if (item.is_read !== undefined && item.is_read !== null) {
        return Number(item.is_read) === 0
      }
      return Number(item.read_time || 0) === 0
    },
    updateLocalMessageStatus(item, isRead) {
      item.is_read = isRead ? 1 : 0
      item.read_time = isRead ? Math.floor(Date.now() / 1000) : 0
    },
    async toggleMessageRead(item) {
      if (!item.message_id || this.activeMessageId) return

      const nextIsRead = this.isMessageUnread(item)
      this.activeMessageId = item.message_id
      try {
        await updateMessageReadStatus(item.message_id, nextIsRead)
        this.updateLocalMessageStatus(item, nextIsRead)
        uni.showToast({
          title: nextIsRead ? '已设为已读' : '已设为未读',
          icon: 'none'
        })
      } finally {
        this.activeMessageId = ''
      }
    },
    openDetail(item) {
      if (this.isMessageList && item.message_id && this.isMessageUnread(item)) {
        updateMessageReadStatus(item.message_id, true)
          .then(() => {
            this.updateLocalMessageStatus(item, true)
          })
          .catch(() => {})
      }

      const routeInfo = this.resolveRoute(item)
      if (!routeInfo) {
        uni.showToast({ title: '暂无可跳转详情', icon: 'none' })
        return
      }
      uni.navigateTo({
        url: `${routeInfo.url}?id=${routeInfo.id}`
      })
    },
    resolveRoute(item) {
      if (item.leads_id) return { url: DETAIL_ROUTES.leads, id: item.leads_id }
      if (item.customer_id) return { url: DETAIL_ROUTES.customer, id: item.customer_id }
      if (item.contacts_id) return { url: DETAIL_ROUTES.contacts, id: item.contacts_id }
      if (item.business_id) return { url: DETAIL_ROUTES.business, id: item.business_id }
      if (item.contract_id) return { url: DETAIL_ROUTES.contract, id: item.contract_id }

      const controller = String(item.controller_name || item.controller || '').toLowerCase()
      const actionId = item.action_id || item.types_id
      if (!actionId) return null
      const messageRoute = MESSAGE_TYPE_ROUTE[Number(item.type)]
      if (messageRoute) return { url: messageRoute, id: actionId }
      if (controller.includes('task')) return { url: DETAIL_ROUTES.task, id: actionId }
      if (controller.includes('leads')) return { url: DETAIL_ROUTES.leads, id: actionId }
      if (controller.includes('customer')) return { url: DETAIL_ROUTES.customer, id: actionId }
      if (controller.includes('contacts')) return { url: DETAIL_ROUTES.contacts, id: actionId }
      if (controller.includes('business')) return { url: DETAIL_ROUTES.business, id: actionId }
      if (controller.includes('contract')) return { url: DETAIL_ROUTES.contract, id: actionId }
      return null
    }
  }
}
</script>

<style scoped>
.todo-list-page {
  min-height: 100vh;
  padding: 22rpx 20rpx 48rpx;
  background-color: var(--crm-page-bg);
}

.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
  padding: 24rpx 26rpx;
  border-radius: 12rpx;
  background-color: var(--crm-card-bg);
}

.summary-title {
  color: var(--crm-text);
  font-size: 31rpx;
  font-weight: 700;
}

.summary-sub {
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.todo-record {
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  background-color: var(--crm-card-bg);
}

.todo-record--unread {
  box-shadow: inset 6rpx 0 0 var(--crm-primary);
}

.record-main {
  flex: 1;
  min-width: 0;
}

.record-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}

.record-title {
  display: block;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--crm-text);
  font-size: 29rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-desc {
  display: block;
  margin-top: 10rpx;
  color: var(--crm-text-muted);
  font-size: 24rpx;
  line-height: 1.5;
}

.record-state {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 12rpx;
  white-space: nowrap;
}

.read-action {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 142rpx;
  width: 142rpx;
  height: 44rpx;
  margin: 0;
  padding: 0;
  border-radius: 999rpx;
  background-color: #f5f6f8;
  color: var(--crm-text-muted);
  font-size: 21rpx;
  line-height: 44rpx;
}

.read-action--unread {
  background-color: #f5f6f8;
  color: var(--crm-text-muted);
}

.read-action::after {
  border: 0;
}

.read-badge {
  display: inline-flex;
  flex: 0 0 56rpx;
  align-items: center;
  justify-content: flex-end;
  color: var(--crm-text-muted);
  font-size: 25rpx;
  line-height: 36rpx;
  text-align: right;
  white-space: nowrap;
}

.read-badge--unread {
  color: #ff4d4f;
}

.record-time {
  display: block;
  margin-top: 12rpx;
  color: var(--crm-text-muted);
  font-size: 23rpx;
  line-height: 32rpx;
  text-align: left;
}

.empty-text,
.bottom-text {
  padding: 60rpx 0;
  color: var(--crm-text-muted);
  font-size: 25rpx;
  text-align: center;
}

.bottom-text {
  padding: 30rpx 0;
}
</style>
