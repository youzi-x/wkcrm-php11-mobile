<template>
  <view class="page-shell project-page">
    <view class="project-head">
      <view class="title-row">
        <text class="page-title">项目</text>
      </view>
      <button class="create-btn" @click="openCreate">＋</button>
    </view>

    <view class="search-box">
      <text class="search-icon" @click="searchTasks">⌕</text>
      <input
        v-model="search"
        class="search-input"
        placeholder="搜索全局任务"
        confirm-type="search"
        @confirm="searchTasks"
        @input="handleSearchInput"
      />
      <text v-if="search" class="clear-search" @click="clearTaskSearch">×</text>
    </view>

    <view v-if="taskSearched" class="task-search-panel">
      <view class="task-search-head">
        <view>
          <text class="section-title">全局任务预览</text>
          <text class="section-count">{{ taskLoading ? '搜索中' : taskResults.length + ' 条预览' }}</text>
        </view>
        <button class="back-project-btn" @click="clearTaskSearch">返回项目</button>
      </view>

      <view v-if="taskLoading" class="empty-box">
        <text class="empty-title">正在搜索</text>
        <text class="empty-desc">正在从全局任务中查找匹配内容。</text>
      </view>

      <view v-else-if="taskResults.length" class="task-result-list">
        <view v-for="task in taskResults" :key="task.task_id" class="task-result-row" @click="openTask(task)">
          <view class="task-row-head">
            <text class="task-name">{{ task.name || '未命名任务' }}</text>
            <text class="task-status" :class="{ 'is-done': isTaskDone(task) }">{{ taskStatusText(task) }}</text>
          </view>
          <view class="task-meta">
            <text>项目：{{ projectName(task) }}</text>
            <text>截止：{{ formatTaskTime(task.stop_time) }}</text>
          </view>
          <text v-if="taskDescription(task)" class="task-desc">{{ taskDescription(task) }}</text>
        </view>
      </view>

      <view v-else class="empty-box">
        <text class="empty-title">没有找到任务</text>
        <text class="empty-desc">换个关键词试试。</text>
      </view>
    </view>

    <block v-else>
      <view class="summary-row">
        <view class="summary-card">
          <text class="summary-num">{{ projects.length }}</text>
          <text class="summary-label">全部项目</text>
        </view>
        <view class="summary-card">
          <text class="summary-num">{{ followedCount }}</text>
          <text class="summary-label">我关注的</text>
        </view>
      </view>

      <view class="project-list">
        <view v-for="item in projects" :key="item.work_id" class="project-row" @click="openDetail(item)">
          <view class="project-main">
            <text class="project-name">{{ item.name || '未命名项目' }}</text>
            <view class="project-meta">
              <text>{{ item.is_open ? '公开项目' : '私有项目' }}</text>
              <text>{{ item.update_time_text || formatTime(item.update_time) }}</text>
            </view>
          </view>
          <view class="project-check" :class="{ 'is-followed': isFollowed(item) }">
            <text>✓</text>
          </view>
        </view>

        <button class="create-row" @click="openCreate">＋ 创建项目</button>
      </view>

      <view v-if="!projects.length" class="empty-box">
        <text class="empty-title">暂无项目</text>
        <text class="empty-desc">可以先创建一个项目，再进入看板管理任务。</text>
      </view>
    </block>

    <TabBar current="project" />
  </view>
</template>

<script>
import TabBar from '../../components/TabBar.vue'
import { getProjectList, searchProjectTasks } from '../../api/work'
import { ensureLogin } from '../../utils/router'

const TASK_PREVIEW_LIMIT = 5

export default {
  components: { TabBar },
  data() {
    return {
      search: '',
      projects: [],
      taskResults: [],
      taskSearched: false,
      taskLoading: false,
      taskSearchTimer: null,
      taskSearchSeq: 0
    }
  },
  computed: {
    followedCount() {
      return this.projects.filter((item) => this.isFollowed(item)).length
    }
  },
  onShow() {
    if (!ensureLogin()) return
    this.loadProjects()
    if (this.taskSearched && this.search.trim()) {
      this.searchTasks()
    }
  },
  onUnload() {
    this.clearTaskSearchTimer()
  },
  methods: {
    async loadProjects() {
      const result = await getProjectList({
        sort_type: 1
      })
      const list = result && result.list ? result.list : result
      this.projects = Array.isArray(list) ? list : (list ? [list] : [])
    },
    async searchTasks() {
      const keyword = this.search.trim()
      if (!keyword) {
        this.clearTaskSearch()
        return
      }
      this.clearTaskSearchTimer()
      await this.fetchTaskPreview(keyword)
    },
    async fetchTaskPreview(keyword) {
      const currentSeq = ++this.taskSearchSeq
      this.taskSearched = true
      this.taskLoading = true
      try {
        const result = await searchProjectTasks({
          search: keyword,
          sort_type: 1
        })
        if (currentSeq === this.taskSearchSeq && keyword === this.search.trim()) {
          this.taskResults = this.normalizeList(result).slice(0, TASK_PREVIEW_LIMIT)
        }
      } catch (error) {
        if (currentSeq === this.taskSearchSeq) {
          this.taskResults = []
        }
      } finally {
        if (currentSeq === this.taskSearchSeq) {
          this.taskLoading = false
        }
      }
    },
    handleSearchInput(event) {
      const value = event && event.detail ? event.detail.value : this.search
      const keyword = String(value || '').trim()
      if (!keyword) {
        this.clearTaskSearch()
        return
      }
      this.taskSearched = true
      this.taskResults = []
      this.taskLoading = true
      this.clearTaskSearchTimer()
      this.taskSearchTimer = setTimeout(() => {
        this.fetchTaskPreview(keyword)
      }, 300)
    },
    clearTaskSearchTimer() {
      if (!this.taskSearchTimer) return
      clearTimeout(this.taskSearchTimer)
      this.taskSearchTimer = null
    },
    clearTaskSearch() {
      this.clearTaskSearchTimer()
      this.search = ''
      this.taskResults = []
      this.taskSearched = false
      this.taskLoading = false
    },
    normalizeList(result) {
      const list = result && result.list ? result.list : result
      if (Array.isArray(list)) return list
      if (list && Array.isArray(list.data)) return list.data
      return list ? [list] : []
    },
    formatTime(value) {
      if (!value) return '--'
      if (String(value).includes('-')) return value
      const date = new Date(Number(value) * 1000)
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    },
    formatTaskTime(value) {
      if (!value) return '--'
      const text = this.formatTime(value)
      return text.length > 16 ? text.slice(0, 16) : text
    },
    isTaskDone(task) {
      return Number(task && task.status) === 5
    },
    taskStatusText(task) {
      return this.isTaskDone(task) ? '已完成' : '进行中'
    },
    taskDescription(task) {
      return String(task.description || '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim()
    },
    projectName(task) {
      const workId = task && task.work_id
      const project = this.projects.find((item) => String(item.work_id) === String(workId))
      if (project && project.name) return project.name
      return workId ? `#${workId}` : '--'
    },
    isFollowed(item) {
      return Number(item.is_follow || item.star || 0) > 0
    },
    openDetail(item) {
      uni.navigateTo({
        url: `/pages/project/detail?id=${item.work_id}`
      })
    },
    openCreate() {
      uni.navigateTo({ url: '/pages/project/form' })
    },
    openTask(task) {
      if (!task || !task.task_id) return
      const workId = task.work_id ? `&work_id=${task.work_id}` : ''
      uni.navigateTo({
        url: `/pages/project/task-detail?id=${task.task_id}${workId}`
      })
    }
  }
}
</script>

<style scoped>
.project-page {
  min-height: 100vh;
  padding: 26rpx 30rpx 130rpx;
  background-color: var(--crm-page-bg);
}

.project-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.title-row {
  display: flex;
  align-items: center;
}

.page-title {
  color: var(--crm-text);
  font-size: 34rpx;
  font-weight: 800;
}

.create-btn {
  width: 62rpx;
  height: 62rpx;
  padding: 0;
  border-radius: 50%;
  background-color: var(--crm-primary);
  color: #ffffff;
  font-size: 34rpx;
  line-height: 62rpx;
}

.search-box {
  height: 68rpx;
  display: flex;
  align-items: center;
  margin-bottom: 26rpx;
  padding: 0 22rpx;
  border-radius: 18rpx;
  background-color: var(--crm-card-bg);
}

.search-icon {
  margin-right: 12rpx;
  color: var(--crm-text-muted);
  font-size: 31rpx;
}

.search-input {
  flex: 1;
  height: 68rpx;
  color: var(--crm-text);
  font-size: 25rpx;
}

.clear-search {
  margin-left: 12rpx;
  color: var(--crm-text-muted);
  font-size: 36rpx;
  line-height: 1;
}

.task-search-panel {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.task-search-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title,
.section-count {
  display: block;
}

.section-title {
  color: var(--crm-text);
  font-size: 28rpx;
  font-weight: 800;
}

.section-count {
  margin-top: 4rpx;
  color: var(--crm-text-muted);
  font-size: 22rpx;
}

.back-project-btn {
  height: 58rpx;
  margin: 0;
  padding: 0 20rpx;
  border: 1rpx solid var(--crm-border);
  border-radius: 999rpx;
  background-color: transparent;
  color: var(--crm-text-muted);
  font-size: 23rpx;
  line-height: 58rpx;
}

.task-result-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.task-result-row {
  padding: 22rpx 24rpx;
  border-radius: 18rpx;
  background-color: var(--crm-card-bg);
  box-shadow: 0 10rpx 30rpx rgba(25, 42, 70, 0.04);
}

.task-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.task-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--crm-text);
  font-size: 28rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-status {
  flex-shrink: 0;
  color: var(--crm-primary);
  font-size: 22rpx;
}

.task-status.is-done {
  color: var(--crm-text-muted);
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx 18rpx;
  margin-top: 12rpx;
  color: var(--crm-text-muted);
  font-size: 22rpx;
}

.task-desc {
  display: block;
  overflow: hidden;
  margin-top: 10rpx;
  color: var(--crm-text-muted);
  font-size: 23rpx;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 24rpx;
}

.summary-card {
  flex: 1;
  min-height: 112rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 24rpx;
  border-radius: 20rpx;
  background-color: var(--crm-card-bg);
}

.summary-num {
  color: var(--crm-text);
  font-size: 36rpx;
  font-weight: 800;
}

.summary-label {
  margin-top: 4rpx;
  color: var(--crm-text-muted);
  font-size: 23rpx;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.project-row {
  min-height: 134rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28rpx;
  border-radius: 20rpx;
  background-color: var(--crm-card-bg);
  box-shadow: 0 10rpx 30rpx rgba(25, 42, 70, 0.04);
}

.project-main {
  flex: 1;
  min-width: 0;
}

.project-name {
  display: block;
  overflow: hidden;
  color: var(--crm-text);
  font-size: 29rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-meta {
  display: flex;
  gap: 18rpx;
  margin-top: 12rpx;
  color: var(--crm-text-muted);
  font-size: 22rpx;
}

.project-check {
  width: 74rpx;
  height: 74rpx;
  margin-left: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 6rpx solid var(--crm-soft-bg);
  border-radius: 50%;
  color: var(--crm-primary);
  font-size: 34rpx;
}

.project-check.is-followed {
  border-color: rgba(126, 211, 33, 0.22);
  color: #7ed321;
}

.create-row {
  height: 96rpx;
  border: 1rpx dashed var(--crm-border);
  border-radius: 18rpx;
  background-color: transparent;
  color: var(--crm-text-muted);
  font-size: 26rpx;
  line-height: 96rpx;
}

.empty-box {
  margin-top: 28rpx;
  padding: 52rpx 20rpx;
  border-radius: 20rpx;
  background-color: var(--crm-card-bg);
  text-align: center;
}

.empty-title {
  display: block;
  color: var(--crm-text);
  font-size: 30rpx;
  font-weight: 700;
}

.empty-desc {
  display: block;
  margin-top: 12rpx;
  color: var(--crm-text-muted);
  font-size: 24rpx;
}
</style>
