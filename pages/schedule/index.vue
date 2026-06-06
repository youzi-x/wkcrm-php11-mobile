<template>
  <view class="page-shell todo-page">
    <view class="todo-card">
      <view v-for="(item, index) in list" :key="item.key" class="todo-item" @click="openTodo(item)">
        <view class="todo-icon" :style="iconStyle(index)">
          <text class="todo-icon-text">{{ item.icon }}</text>
        </view>
        <view class="todo-content">
          <view class="todo-title-line">
            <text class="todo-title">{{ item.title }}</text>
            <text class="todo-badge" :class="{ 'todo-badge--empty': !item.count }">{{ item.count }}</text>
          </view>
          <text class="todo-desc">{{ descText(item) }}</text>
        </view>
        <text class="todo-arrow">›</text>
      </view>
    </view>
    <TabBar current="schedule" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import { getWorkbenchTodos } from '../../api/crm'
import { todoMenus } from '../../utils/app-data'
import { ensureLogin } from '../../utils/router'

const ICON_COLORS = [
  'var(--crm-primary-2)',
  '#ff8b6b',
  '#ff9d3f',
  '#3cc886',
  '#ff7657',
  '#7a74f0',
  'var(--crm-primary)'
]

export default {
  components: { TabBar },
  data() {
    return {
      todos: {}
    }
  },
  computed: {
    list() {
      return todoMenus.map((item) => ({
        ...item,
        count: Number(this.todos[item.field] || 0)
      }))
    }
  },
  async onShow() {
    if (!ensureLogin()) return
    this.todos = await getWorkbenchTodos()
  },
  methods: {
    descText(item) {
      return `${item.count} 条待处理`
    },
    iconStyle(index) {
      return {
        backgroundColor: ICON_COLORS[index % ICON_COLORS.length]
      }
    },
    openTodo(item) {
      uni.navigateTo({
        url: `/pages/schedule/list?type=${item.key}&title=${encodeURIComponent(item.title)}`
      })
    }
  }
}
</script>

<style scoped>
.todo-page {
  min-height: 100vh;
  padding: 18rpx 20rpx 130rpx;
  background-color: var(--crm-page-bg);
}

.todo-card {
  overflow: hidden;
  border-radius: 12rpx;
  background-color: var(--crm-card-bg);
}

.todo-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 118rpx;
  padding: 15rpx 20rpx 15rpx 26rpx;
  background-color: var(--crm-card-bg);
}

.todo-icon {
  flex: 0 0 64rpx;
  width: 64rpx;
  height: 64rpx;
  margin-right: 22rpx;
  border-radius: 14rpx;
  text-align: center;
  line-height: 64rpx;
}

.todo-icon-text {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
}

.todo-content {
  flex: 1;
  min-width: 0;
  min-height: 88rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-bottom: 1rpx solid var(--crm-border);
}

.todo-item:last-child .todo-content {
  border-bottom-width: 0;
}

.todo-title-line {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.todo-title {
  flex: 1;
  color: var(--crm-text);
  font-size: 29rpx;
  font-weight: 600;
  line-height: 38rpx;
}

.todo-badge {
  min-width: 34rpx;
  height: 34rpx;
  margin-left: 12rpx;
  padding: 0 10rpx;
  border-radius: 999rpx;
  background-color: #ff4d4f;
  color: #ffffff;
  font-size: 21rpx;
  line-height: 34rpx;
  text-align: center;
}

.todo-badge--empty {
  background-color: #d7deeb;
  color: #667085;
}

.todo-desc {
  margin-top: 7rpx;
  color: var(--crm-text-muted);
  font-size: 24rpx;
  line-height: 34rpx;
}

.todo-arrow {
  flex: 0 0 30rpx;
  color: var(--crm-text-muted);
  font-size: 38rpx;
  line-height: 1;
  text-align: right;
}
</style>
