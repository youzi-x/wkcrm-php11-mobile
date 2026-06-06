<template>
  <view class="detail-page">
    <view class="project-top">
      <view class="title-row">
        <text class="back-inline" @click="goBack">‹</text>
        <view class="title-main">
          <view class="project-name-line">
            <text class="project-title">{{ detail.name || '项目详情' }}</text>
          </view>
          <text class="project-sub">{{ detail.description || '任务列表' }}</text>
        </view>
      </view>
      <text class="project-setting" @click="openProjectMenu">•••</text>
    </view>

    <view class="project-toolbar">
      <view class="member-avatar">{{ currentUserAvatar }}</view>
      <text class="tool-btn" @click="quickAddTask">＋</text>
      <text class="tool-btn" :class="{ 'is-active': searchVisible }" @click="showSearch">⌕</text>
      <text class="tool-btn" @click="openTab('archive')">◔</text>
      <text class="tool-btn" @click="openProjectMenu">•••</text>
    </view>

    <view v-if="searchVisible" class="task-search-panel">
      <view class="task-search-box">
        <text class="task-search-icon">⌕</text>
        <input
          v-model="taskSearch"
          class="task-search-input"
          placeholder="搜索当前项目任务"
          placeholder-style="color: var(--crm-text-muted)"
          confirm-type="search"
          focus
        />
        <text v-if="taskSearch" class="task-search-clear" @click="clearTaskSearch">×</text>
      </view>
      <text class="task-search-cancel" @click="closeTaskSearch">取消</text>
    </view>

    <view class="task-filter">
      <view class="done-switch" :class="{ 'is-on': showDone }" @click="showDone = !showDone">
        <text class="switch-mark">✓</text>
        <text>显示已完成</text>
      </view>
      <text class="filter-pill">全部 {{ flatTasks.length }}</text>
      <view class="view-switch">
        <text :class="{ 'is-active': viewMode === 'group' }" @click="setViewMode('group')">▦</text>
        <text :class="{ 'is-active': viewMode === 'list' }" @click="setViewMode('list')">☰</text>
      </view>
    </view>

    <view class="tabs">
      <text class="tab" :class="{ 'is-active': activeTab === 'board' }" @click="activeTab = 'board'">任务</text>
      <text class="tab" :class="{ 'is-active': activeTab === 'files' }" @click="openTab('files')">附件</text>
      <text class="tab" :class="{ 'is-active': activeTab === 'statistic' }" @click="openTab('statistic')">任务统计</text>
      <text class="tab" :class="{ 'is-active': activeTab === 'archive' }" @click="openTab('archive')">归档任务</text>
    </view>

    <view v-if="activeTab === 'board' && viewMode === 'list'" class="task-section-list">
      <view v-for="section in taskSections" :key="section.key" class="task-section">
        <view class="section-head" @click="toggleSection(section.key)">
          <view class="section-title-wrap">
            <text class="section-arrow">{{ isSectionOpen(section.key) ? '▾' : '▸' }}</text>
            <text class="section-title">{{ section.title }}（{{ section.tasks.length }}）</text>
          </view>
          <text v-if="section.key === 'mine'" class="section-add" @click.stop="quickAddTask">＋</text>
        </view>

        <view v-if="isSectionOpen(section.key)" class="section-body">
          <view v-for="task in section.tasks" :key="section.key + '-' + task.task_id" class="task-row" @click="openTask(task)">
            <text class="row-arrow">›</text>
            <text class="row-check" :class="{ 'is-done': isDone(task) }" @click.stop="toggleTask(task)">{{ isDone(task) ? '✓' : '' }}</text>
            <text v-if="isDone(task)" class="done-label">已完成</text>
            <text class="row-name" :class="{ 'is-done-text': isDone(task) }">{{ task.name || '未命名任务' }}</text>
            <text class="row-avatar">{{ avatarText(task) }}</text>
          </view>
          <view v-if="!section.tasks.length" class="group-empty">{{ hasTaskSearch ? '没有匹配任务' : '暂无任务' }}</view>
          <view v-if="section.key !== 'done'" class="section-add-row" @click="quickAddTask">＋ 添加任务</view>
        </view>
      </view>
    </view>

    <view v-if="activeTab === 'board' && viewMode === 'group'" class="task-board-list">
      <view v-for="(column, index) in visibleColumns" :key="columnKey(column, index)" class="task-group">
        <view class="column-head">
          <view class="column-title-wrap">
            <text class="column-collapse" @click.stop="toggleColumn(column, index)">{{ isColumnOpen(column, index) ? '▾' : '▸' }}</text>
            <view class="column-dot"></view>
            <text class="column-title">{{ column.class_name || column.name || '未分组' }}</text>
          </view>
          <view class="column-head-right">
            <text class="column-count">{{ doneCount(column) }} / {{ taskCount(column) }}</text>
            <text class="column-more" @click="openColumnMenu(column)">•••</text>
          </view>
        </view>
        <view v-if="isColumnOpen(column, index)" class="progress">
          <view class="progress-bar" :style="{ width: progressWidth(column) }"></view>
        </view>

        <view v-if="isColumnOpen(column, index) && !(column.list || []).length" class="group-empty">
          <text>{{ hasTaskSearch ? '没有匹配任务' : '这个列表还没有任务' }}</text>
        </view>

        <view v-if="isColumnOpen(column, index)" v-for="task in column.list" :key="task.task_id" class="task-card" @click="openTask(task)">
          <view class="task-line">
            <text class="checkbox" :class="{ 'is-done': isDone(task) }" @click.stop="toggleTask(task)">{{ isDone(task) ? '✓' : '' }}</text>
            <text class="task-name" :class="{ 'is-done-text': isDone(task) }">{{ task.name || '未命名任务' }}</text>
          </view>
          <view class="task-meta">
            <text class="avatar">{{ avatarText(task) }}</text>
            <text>{{ task.main_user_name || task.realname || '未指派' }}</text>
            <text v-if="task.stop_time">◷ {{ formatTime(task.stop_time) }} 截止</text>
            <text v-if="priorityText(task)" class="priority">{{ priorityText(task) }}</text>
          </view>
          <view class="task-actions">
            <text @click.stop="openTask(task)">详情</text>
            <text @click.stop="archiveTask(task)">归档</text>
          </view>
        </view>

        <view v-if="isColumnOpen(column, index) && addingClassId === column.class_id" class="add-card">
          <input v-model="newTaskName" class="task-input" placeholder="请输入任务名称" confirm-type="done" @confirm="submitTask(column)" />
          <view class="add-actions">
            <text @click="cancelAdd">取消</text>
            <text class="add-confirm" @click="submitTask(column)">保存</text>
          </view>
        </view>

        <view v-else-if="isColumnOpen(column, index)" class="add-task" @click="startAdd(column)">＋ 添加任务</view>
      </view>

      <view class="new-group">
        <view v-if="showClassForm" class="add-card class-card">
          <input v-model="newClassName" class="task-input" placeholder="请输入列表名称" confirm-type="done" @confirm="submitClass" />
          <view class="add-actions">
            <text @click="cancelClass">取消</text>
            <text class="add-confirm" @click="submitClass">保存</text>
          </view>
        </view>
        <view v-else class="new-column-inner" @click="startClass">
          <text class="create-plus">＋</text>
          <text>新建列表</text>
        </view>
      </view>
    </view>

    <view v-if="activeTab === 'board' && !columns.length" class="empty-box">
      <text>暂无任务列表</text>
    </view>

    <view v-if="activeTab === 'statistic'" class="stat-card">
      <view class="stat-grid">
        <view v-for="item in statItems" :key="item.key" class="stat-item">
          <text class="stat-value">{{ item.value }}</text>
          <text class="stat-label">{{ item.label }}</text>
        </view>
      </view>
      <view class="owner-list">
        <view v-for="item in statistic.userList || []" :key="item.realname" class="owner-row">
          <text class="owner-name">{{ item.realname || '成员' }}</text>
          <text class="owner-meta">完成率 {{ item.completionRate || 0 }}%</text>
        </view>
      </view>
    </view>

    <view v-if="activeTab === 'files'" class="simple-list">
      <view v-for="file in files" :key="file.file_id || file.name" class="simple-row">
        <text class="simple-title">{{ file.name || file.file_name || '附件' }}</text>
        <text class="simple-desc">{{ file.create_time || file.size || '--' }}</text>
      </view>
      <view v-if="!files.length" class="empty-box">暂无附件</view>
    </view>

    <view v-if="activeTab === 'archive'" class="simple-list">
      <view v-for="task in archivedTasks" :key="task.task_id" class="simple-row archive-row">
        <view>
          <text class="simple-title">{{ task.name || '归档任务' }}</text>
          <text class="simple-desc">{{ task.main_user_name || task.realname || '--' }}</text>
        </view>
        <text class="recover-action" @click="recoverTask(task)">恢复</text>
      </view>
      <view v-if="!archivedTasks.length" class="empty-box">暂无归档任务</view>
    </view>

    <view v-if="projectEditor.visible" class="modal-mask" @click="closeProjectEditor">
      <view class="edit-modal" @click.stop>
        <text class="modal-title">{{ projectEditor.type === 'name' ? '修改项目名称' : '修改项目说明' }}</text>
        <input v-if="projectEditor.type === 'name'" v-model="projectEditor.value" class="modal-input" placeholder="请输入项目名称" />
        <textarea v-else v-model="projectEditor.value" class="modal-textarea" placeholder="请输入项目说明" />
        <view class="modal-actions">
          <text @click="closeProjectEditor">取消</text>
          <text class="confirm-action" @click="saveProjectEditor">保存</text>
        </view>
      </view>
    </view>

    <view v-if="quickTask.visible" class="modal-mask" @click="closeQuickTask">
      <view class="edit-modal" @click.stop>
        <text class="modal-title">新建任务</text>
        <text class="modal-subtitle">添加到：{{ quickTask.columnName || '默认列表' }}</text>
        <input
          v-model="newTaskName"
          class="modal-input"
          placeholder="请输入任务名称"
          confirm-type="done"
          focus
          @confirm="submitQuickTask"
        />
        <view class="modal-actions">
          <text @click="closeQuickTask">取消</text>
          <text class="confirm-action" @click="submitQuickTask">保存</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  archiveProjectTask,
  createProjectTask,
  createProjectTaskClass,
  deleteProjectTaskClass,
  getArchivedProjectTasks,
  getProjectDetail,
  getProjectFiles,
  getProjectStatistic,
  getProjectTasks,
  recoverProjectTask,
  renameProjectTaskClass,
  toggleProjectTask,
  updateProject
} from '../../api/work'
import { ensureLogin } from '../../utils/router'
import { useStore } from '../../store'

const PROJECT_VIEW_MODE_KEY = 'wkcrm_project_view_mode'

export default {
  data() {
    return {
      workId: '',
      detail: {},
      columns: [],
      activeTab: 'board',
      statistic: {},
      files: [],
      archivedTasks: [],
      addingClassId: '',
      newTaskName: '',
      taskSaving: false,
      showClassForm: false,
      newClassName: '',
      classSaving: false,
      actionSaving: false,
      viewMode: 'group',
      showDone: true,
      searchVisible: false,
      taskSearch: '',
      quickTask: {
        visible: false,
        columnKey: '',
        columnName: ''
      },
      collapsedColumns: {},
      projectEditor: {
        visible: false,
        type: 'name',
        value: ''
      },
      collapsedSections: {
        mine: false,
        undone: false,
        done: true
      }
    }
  },
  async onLoad(options) {
    if (!ensureLogin()) return
    this.restoreViewMode()
    this.workId = options.id || ''
    await this.loadData()
  },
  computed: {
    currentUser() {
      return useStore().state.userInfo || {}
    },
    currentUserAvatar() {
      return (this.currentUser.realname || this.currentUser.username || '我').slice(0, 1)
    },
    rawFlatTasks() {
      return this.columns.reduce((tasks, column) => {
        const list = Array.isArray(column.list) ? column.list : []
        return tasks.concat(list.map((task) => ({
          ...task,
          class_id: task.class_id || column.class_id,
          class_name: task.class_name || column.class_name || column.name || '未分组'
        })))
      }, [])
    },
    hasTaskSearch() {
      return Boolean(this.taskSearch.trim())
    },
    flatTasks() {
      return this.filterTasks(this.rawFlatTasks)
    },
    mineTasks() {
      const userId = Number(this.currentUser.id || this.currentUser.user_id || 0)
      const list = userId ? this.flatTasks.filter((task) => this.isMineTask(task, userId)) : []
      return list.length ? list : this.flatTasks
    },
    undoneTasks() {
      return this.flatTasks.filter((task) => !this.isDone(task))
    },
    doneTasks() {
      return this.flatTasks.filter((task) => this.isDone(task))
    },
    taskSections() {
      const doneSection = this.showDone ? [{ key: 'done', title: '已完成任务', tasks: this.doneTasks }] : []
      return [
        { key: 'mine', title: '我的任务', tasks: this.mineTasks },
        { key: 'undone', title: '未完成任务', tasks: this.undoneTasks },
        ...doneSection
      ]
    },
    visibleColumns() {
      return this.columns.map((column) => ({
        ...column,
        list: this.filterTasks(
          this.showDone ? (column.list || []) : (column.list || []).filter((task) => !this.isDone(task))
        )
      }))
    },
    statItems() {
      const data = this.statistic.dataCount || {}
      return [
        { key: 'all', label: '任务总数', value: data.allNum || 0 },
        { key: 'undone', label: '未完成', value: data.undoneNum || 0 },
        { key: 'done', label: '已完成', value: data.doneNum || 0 },
        { key: 'overtime', label: '延期', value: data.overtimeNum || 0 },
        { key: 'archive', label: '归档', value: data.archiveNum || 0 },
        { key: 'rate', label: '完成率', value: `${data.completionRate || 0}%` }
      ]
    }
  },
  methods: {
    async loadData() {
      const [detail, result] = await Promise.all([
        getProjectDetail(this.workId),
        getProjectTasks({ work_id: this.workId })
      ])
      const columns = result && result.list ? result.list : result
      this.detail = detail || {}
      this.columns = this.normalizeColumns(columns)
    },
    goBack() {
      uni.navigateBack()
    },
    restoreViewMode() {
      try {
        const mode = uni.getStorageSync(PROJECT_VIEW_MODE_KEY)
        this.viewMode = ['group', 'list'].includes(mode) ? mode : 'group'
      } catch (error) {
        this.viewMode = 'group'
      }
    },
    setViewMode(mode) {
      if (!['group', 'list'].includes(mode)) return
      this.viewMode = mode
      try {
        uni.setStorageSync(PROJECT_VIEW_MODE_KEY, mode)
      } catch (error) {}
    },
    openProjectMenu() {
      uni.showActionSheet({
        itemList: ['刷新项目', '修改项目名称', '修改项目说明'],
        success: async ({ tapIndex }) => {
          if (tapIndex === 0) {
            await this.loadData()
            uni.showToast({ title: '已刷新', icon: 'success' })
          }
          if (tapIndex === 1) this.openProjectEditor('name')
          if (tapIndex === 2) this.openProjectEditor('description')
        }
      })
    },
    openProjectEditor(type) {
      this.projectEditor = {
        visible: true,
        type,
        value: type === 'name' ? (this.detail.name || '') : (this.detail.description || '')
      }
    },
    closeProjectEditor() {
      this.projectEditor.visible = false
    },
    async saveProjectEditor() {
      const value = this.projectEditor.value.trim()
      if (this.projectEditor.type === 'name' && !value) {
        uni.showToast({ title: '请输入项目名称', icon: 'none' })
        return
      }
      const payload = {
        work_id: this.workId,
        name: this.projectEditor.type === 'name' ? value : (this.detail.name || ''),
        description: this.projectEditor.type === 'description' ? value : (this.detail.description || ''),
        is_open: this.detail.is_open || 0,
        group_id: this.detail.group_id || 0,
        cover_url: this.detail.cover_url || 'mobile-default-project-cover'
      }
      await updateProject(payload)
      this.closeProjectEditor()
      uni.showToast({ title: '保存成功', icon: 'success' })
      await this.loadData()
    },
    async openTab(tab) {
      this.activeTab = tab
      if (tab === 'statistic' && !this.statistic.dataCount) {
        this.statistic = await getProjectStatistic(this.workId)
      }
      if (tab === 'files' && !this.files.length) {
        const result = await getProjectFiles(this.workId)
        this.files = this.normalizeList(result)
      }
      if (tab === 'archive') {
        await this.loadArchivedTasks()
      }
    },
    normalizeList(result) {
      if (Array.isArray(result)) return result
      if (result && Array.isArray(result.list)) return result.list
      return result ? [result] : []
    },
    normalizeColumns(result) {
      if (!Array.isArray(result)) return []
      return result.map((column) => ({
        ...column,
        list: Array.isArray(column.list) ? column.list : []
      }))
    },
    columnKey(column, index = 0) {
      return String(column.class_id || column.id || column.class_name || column.name || index)
    },
    isColumnOpen(column, index = 0) {
      return !this.collapsedColumns[this.columnKey(column, index)]
    },
    toggleColumn(column, index = 0) {
      const key = this.columnKey(column, index)
      this.collapsedColumns = {
        ...this.collapsedColumns,
        [key]: !this.collapsedColumns[key]
      }
    },
    isSectionOpen(key) {
      return !this.collapsedSections[key]
    },
    toggleSection(key) {
      this.collapsedSections = {
        ...this.collapsedSections,
        [key]: !this.collapsedSections[key]
      }
    },
    quickAddTask() {
      const column = this.columns[0]
      if (!column) {
        this.startClass()
        uni.showToast({ title: '请先创建列表', icon: 'none' })
        return
      }
      this.setViewMode('group')
      this.addingClassId = column.class_id
      this.newTaskName = ''
      this.quickTask = {
        visible: true,
        columnKey: this.columnKey(column, 0),
        columnName: column.class_name || column.name || '默认列表'
      }
    },
    showSearch() {
      this.activeTab = 'board'
      this.searchVisible = true
    },
    closeTaskSearch() {
      this.searchVisible = false
      this.taskSearch = ''
    },
    clearTaskSearch() {
      this.taskSearch = ''
    },
    filterTasks(tasks = []) {
      const keyword = this.taskSearch.trim().toLowerCase()
      if (!keyword) return tasks
      return tasks.filter((task) => this.taskSearchText(task).includes(keyword))
    },
    taskSearchText(task = {}) {
      return [
        task.name,
        task.description,
        task.content,
        task.class_name,
        task.main_user_name,
        task.realname,
        task.stop_time,
        this.priorityText(task)
      ].filter(Boolean).join(' ').toLowerCase()
    },
    async loadArchivedTasks() {
      const result = await getArchivedProjectTasks(this.workId)
      this.archivedTasks = this.normalizeList(result)
    },
    taskCount(column) {
      if (this.hasTaskSearch || !this.showDone) return (column.list || []).length
      return Number(column.count || (column.list || []).length || 0)
    },
    isDone(task) {
      return Number(task.status) === 5
    },
    isMineTask(task, userId) {
      const id = Number(userId || this.currentUser.id || this.currentUser.user_id || 0)
      if (!id) return false
      if (Number(task.main_user_id || 0) === id) return true
      return String(task.owner_user_id || '').split(',').map((item) => Number(item)).includes(id)
    },
    doneCount(column) {
      return (column.list || []).filter((item) => this.isDone(item)).length
    },
    progressWidth(column) {
      const total = this.taskCount(column)
      if (!total) return '0%'
      return `${Math.min(100, Math.round((this.doneCount(column) / total) * 100))}%`
    },
    avatarText(task) {
      return (task.main_user_name || task.realname || '我').slice(0, 1)
    },
    priorityText(task) {
      const map = { 1: '低', 2: '中', 3: '高' }
      return map[Number(task.priority)] || ''
    },
    formatTime(value) {
      if (!value) return ''
      if (String(value).includes('-')) return value
      const date = new Date(Number(value) * 1000)
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    },
    startAdd(column) {
      this.addingClassId = column.class_id
      this.newTaskName = ''
    },
    cancelAdd() {
      this.addingClassId = ''
      this.newTaskName = ''
    },
    closeQuickTask() {
      this.quickTask = {
        visible: false,
        columnKey: '',
        columnName: ''
      }
      this.cancelAdd()
    },
    quickTaskColumn() {
      return this.columns.find((column, index) => this.columnKey(column, index) === this.quickTask.columnKey) || this.columns[0]
    },
    async submitQuickTask() {
      const column = this.quickTaskColumn()
      if (!column) {
        uni.showToast({ title: '请先创建列表', icon: 'none' })
        return
      }
      const saved = await this.submitTask(column)
      if (saved) {
        this.quickTask = {
          visible: false,
          columnKey: '',
          columnName: ''
        }
      }
    },
    async submitTask(column) {
      if (!this.newTaskName.trim()) {
        uni.showToast({ title: '请输入任务名称', icon: 'none' })
        return false
      }
      if (this.taskSaving) return false
      this.taskSaving = true
      try {
        await createProjectTask({
          work_id: this.workId,
          class_id: column.class_id > 0 ? column.class_id : 0,
          name: this.newTaskName
        })
        uni.showToast({ title: '添加成功', icon: 'success' })
        this.cancelAdd()
        await this.loadData()
        return true
      } finally {
        this.taskSaving = false
      }
    },
    startClass() {
      this.showClassForm = true
      this.newClassName = ''
    },
    cancelClass() {
      this.showClassForm = false
      this.newClassName = ''
    },
    async submitClass() {
      if (!this.newClassName.trim()) {
        uni.showToast({ title: '请输入列表名称', icon: 'none' })
        return
      }
      if (this.classSaving) return
      this.classSaving = true
      try {
        await createProjectTaskClass({
          work_id: this.workId,
          name: this.newClassName
        })
        uni.showToast({ title: '添加成功', icon: 'success' })
        this.cancelClass()
        await this.loadData()
      } finally {
        this.classSaving = false
      }
    },
    openColumnMenu(column) {
      const actions = ['重命名', '新建任务', '归档已完成任务']
      if (Number(column.class_id) > 0) actions.push('删除列表')
      uni.showActionSheet({
        itemList: actions,
        success: (event) => {
          const action = actions[event.tapIndex]
          if (action === '重命名') this.renameClass(column)
          if (action === '新建任务') this.startAdd(column)
          if (action === '归档已完成任务') this.archiveDone(column)
          if (action === '删除列表') this.deleteClass(column)
        }
      })
    },
    renameClass(column) {
      uni.showModal({
        title: '重命名列表',
        editable: true,
        placeholderText: '请输入列表名称',
        content: column.class_name || column.name || '',
        success: async (res) => {
          if (!res.confirm) return
          const name = (res.content || '').trim()
          if (!name) {
            uni.showToast({ title: '请输入列表名称', icon: 'none' })
            return
          }
          await renameProjectTaskClass({
            work_id: this.workId,
            class_id: column.class_id,
            name
          })
          uni.showToast({ title: '编辑成功', icon: 'success' })
          await this.loadData()
        }
      })
    },
    deleteClass(column) {
      uni.showModal({
        title: '删除列表',
        content: `确认删除“${column.class_name || column.name || '未分组'}”？列表下的任务也会被删除。`,
        success: async (res) => {
          if (!res.confirm) return
          await deleteProjectTaskClass({
            work_id: this.workId,
            class_id: column.class_id
          })
          uni.showToast({ title: '删除成功', icon: 'success' })
          await this.loadData()
        }
      })
    },
    async toggleTask(task) {
      if (this.actionSaving) return
      this.actionSaving = true
      try {
        await toggleProjectTask({
          work_id: this.workId,
          task_id: task.task_id,
          status: this.isDone(task) ? 1 : 5
        })
        await this.loadData()
      } finally {
        this.actionSaving = false
      }
    },
    async archiveTask(task) {
      uni.showModal({
        title: '归档任务',
        content: `确认归档“${task.name || '未命名任务'}”？`,
        success: async (res) => {
          if (!res.confirm) return
          await archiveProjectTask({
            work_id: this.workId,
            task_id: task.task_id
          })
          uni.showToast({ title: '已归档', icon: 'success' })
          await this.loadData()
          if (this.activeTab === 'archive') await this.loadArchivedTasks()
        }
      })
    },
    async archiveDone(column) {
      const doneTasks = (column.list || []).filter((item) => this.isDone(item))
      if (!doneTasks.length) {
        uni.showToast({ title: '暂无已完成任务', icon: 'none' })
        return
      }
      uni.showModal({
        title: '归档完成项',
        content: `确认归档“${column.class_name || column.name || '未分组'}”下的 ${doneTasks.length} 个已完成任务？`,
        success: async (res) => {
          if (!res.confirm) return
          await Promise.all(doneTasks.map((task) => archiveProjectTask({
            work_id: this.workId,
            task_id: task.task_id
          })))
          uni.showToast({ title: '已归档', icon: 'success' })
          await this.loadData()
        }
      })
    },
    async recoverTask(task) {
      await recoverProjectTask({
        work_id: this.workId,
        task_id: task.task_id
      })
      uni.showToast({ title: '已恢复', icon: 'success' })
      await this.loadArchivedTasks()
      await this.loadData()
    },
    openTask(task) {
      uni.navigateTo({
        url: `/pages/project/task-detail?id=${task.task_id}&work_id=${this.workId}`
      })
    }
  }
}
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  padding: 24rpx 0 34rpx;
  background-color: var(--crm-page-bg);
}

.project-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 20rpx 18rpx;
  padding: 10rpx 4rpx 6rpx;
  background-color: transparent;
}

.title-row {
  display: flex;
  align-items: center;
}

.back-inline {
  width: 48rpx;
  height: 48rpx;
  margin-right: 8rpx;
  color: var(--crm-text-muted);
  font-size: 56rpx;
  line-height: 42rpx;
  text-align: center;
}

.title-main {
  display: flex;
  flex-direction: column;
}

.project-name-line {
  display: flex;
  align-items: center;
}

.project-title {
  color: var(--crm-text);
  font-size: 38rpx;
  font-weight: 800;
}

.project-setting {
  margin-left: 16rpx;
  color: var(--crm-text-muted);
  font-size: 34rpx;
  line-height: 1;
}

.project-sub {
  max-width: 520rpx;
  margin-top: 8rpx;
  color: var(--crm-text-muted);
  font-size: 23rpx;
}

.project-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  margin: 18rpx 20rpx 20rpx;
}

.member-avatar,
.tool-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--crm-card-bg);
  color: var(--crm-text);
  font-size: 30rpx;
}

.member-avatar {
  position: relative;
  background-color: var(--crm-primary);
  color: #ffffff;
  font-size: 25rpx;
  font-weight: 700;
}

.member-avatar::after {
  content: '';
  position: absolute;
  right: 4rpx;
  bottom: 2rpx;
  width: 16rpx;
  height: 16rpx;
  border: 3rpx solid var(--crm-page-bg);
  border-radius: 50%;
  background-color: #7ed321;
}

.tool-btn.is-active {
  background-color: var(--crm-primary);
  color: #ffffff;
}

.task-search-panel {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin: 0 20rpx 18rpx;
}

.task-search-box {
  display: flex;
  min-width: 0;
  height: 72rpx;
  flex: 1;
  align-items: center;
  gap: 12rpx;
  padding: 0 22rpx;
  border-radius: 12rpx;
  background-color: var(--crm-card-bg);
}

.task-search-icon {
  flex-shrink: 0;
  color: var(--crm-text-muted);
  font-size: 28rpx;
}

.task-search-input {
  min-width: 0;
  flex: 1;
  color: var(--crm-text);
  font-size: 27rpx;
}

.task-search-clear {
  flex-shrink: 0;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background-color: var(--crm-input-bg);
  color: var(--crm-text-muted);
  font-size: 32rpx;
  line-height: 38rpx;
  text-align: center;
}

.task-search-cancel {
  flex-shrink: 0;
  color: var(--crm-primary);
  font-size: 27rpx;
}

.task-filter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  margin: 0 20rpx 18rpx;
}

.done-switch,
.filter-pill,
.view-switch {
  min-height: 56rpx;
  display: flex;
  align-items: center;
  border-radius: 12rpx;
  background-color: var(--crm-card-bg);
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.done-switch {
  gap: 8rpx;
  padding: 0 16rpx;
}

.done-switch.is-on .switch-mark {
  background-color: #7ed321;
  color: #ffffff;
}

.switch-mark {
  width: 26rpx;
  height: 26rpx;
  border-radius: 6rpx;
  background-color: var(--crm-input-bg);
  color: transparent;
  font-size: 18rpx;
  line-height: 26rpx;
  text-align: center;
}

.filter-pill {
  padding: 0 18rpx;
}

.view-switch {
  overflow: hidden;
}

.view-switch text {
  width: 58rpx;
  height: 56rpx;
  color: var(--crm-text-muted);
  font-size: 30rpx;
  line-height: 56rpx;
  text-align: center;
}

.view-switch text.is-active {
  background-color: var(--crm-soft-bg);
  color: var(--crm-primary);
}

.tabs {
  height: 76rpx;
  display: flex;
  align-items: center;
  gap: 38rpx;
  padding: 0 28rpx;
  background-color: var(--crm-card-bg);
}

.task-section-list {
  padding: 20rpx 20rpx 24rpx;
}

.task-section {
  margin-bottom: 24rpx;
  overflow: hidden;
  border-radius: 4rpx;
  background-color: var(--crm-card-bg);
  box-shadow: 0 8rpx 22rpx rgba(25, 42, 70, 0.04);
}

.section-head {
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 26rpx;
  border-bottom: 1rpx solid var(--crm-border);
}

.section-title-wrap {
  display: flex;
  align-items: center;
}

.section-arrow {
  width: 56rpx;
  height: 56rpx;
  margin-right: 10rpx;
  border-radius: 12rpx;
  background-color: var(--crm-input-bg);
  color: var(--crm-primary);
  font-size: 34rpx;
  font-weight: 800;
  line-height: 56rpx;
  text-align: center;
}

.section-arrow:active {
  background-color: var(--crm-soft-bg);
}

.section-title {
  color: var(--crm-text);
  font-size: 27rpx;
  font-weight: 800;
}

.section-add {
  color: var(--crm-text-muted);
  font-size: 34rpx;
}

.section-body {
  border-left: 6rpx solid var(--crm-primary);
}

.task-row {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 18rpx;
  border-bottom: 1rpx solid var(--crm-border);
}

.task-row:last-child {
  border-bottom-width: 0;
}

.row-arrow {
  margin-right: 14rpx;
  color: var(--crm-text-muted);
  font-size: 34rpx;
}

.row-check {
  width: 30rpx;
  height: 30rpx;
  margin-right: 12rpx;
  border: 2rpx solid var(--crm-border);
  border-radius: 50%;
  color: #ffffff;
  font-size: 18rpx;
  line-height: 30rpx;
  text-align: center;
}

.row-check.is-done {
  border-color: #7ed321;
  background-color: #7ed321;
}

.done-label {
  margin-right: 10rpx;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  background-color: rgba(126, 211, 33, 0.14);
  color: #37a94a;
  font-size: 22rpx;
}

.row-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--crm-text);
  font-size: 25rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-avatar {
  width: 38rpx;
  height: 38rpx;
  margin-left: 12rpx;
  border-radius: 50%;
  background-color: var(--crm-primary);
  color: #ffffff;
  font-size: 20rpx;
  line-height: 38rpx;
  text-align: center;
}

.section-add-row {
  height: 86rpx;
  padding-left: 62rpx;
  color: var(--crm-text-muted);
  font-size: 26rpx;
  line-height: 86rpx;
}

.tab {
  height: 76rpx;
  color: var(--crm-text);
  font-size: 25rpx;
  line-height: 76rpx;
}

.tab.is-active {
  border-bottom: 4rpx solid var(--crm-primary);
  color: var(--crm-primary);
  font-weight: 700;
}

.task-board-list {
  padding: 20rpx 20rpx 24rpx;
}

.task-group {
  margin-bottom: 18rpx;
  padding: 22rpx;
  border-radius: 10rpx;
  background-color: var(--crm-card-bg);
  box-shadow: 0 10rpx 28rpx rgba(25, 42, 70, 0.05);
}

.column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.column-title-wrap,
.column-head-right {
  display: flex;
  align-items: center;
}

.column-collapse {
  width: 56rpx;
  height: 56rpx;
  margin: -10rpx 6rpx -10rpx -8rpx;
  border-radius: 12rpx;
  background-color: var(--crm-input-bg);
  color: var(--crm-primary);
  font-size: 34rpx;
  font-weight: 800;
  line-height: 56rpx;
  text-align: center;
}

.column-collapse:active {
  background-color: var(--crm-soft-bg);
  color: var(--crm-primary);
}

.column-dot {
  width: 14rpx;
  height: 14rpx;
  margin-right: 12rpx;
  border-radius: 50%;
  background-color: var(--crm-primary);
}

.column-title {
  color: var(--crm-text);
  font-size: 28rpx;
  font-weight: 800;
}

.column-count {
  color: var(--crm-text-muted);
  font-size: 23rpx;
}

.column-more {
  width: 52rpx;
  height: 42rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--crm-text-muted);
  font-size: 26rpx;
  line-height: 1;
}

.progress {
  height: 10rpx;
  margin: 18rpx 0 20rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background-color: var(--crm-border);
}

.progress-bar {
  height: 100%;
  border-radius: 999rpx;
  background-color: var(--crm-primary);
}

.task-card {
  margin-bottom: 14rpx;
  padding: 18rpx;
  border: 1rpx solid var(--crm-border);
  border-radius: 10rpx;
  background-color: var(--crm-elevated-bg);
  box-shadow: 0 8rpx 18rpx rgba(29, 82, 150, 0.06);
}

.task-line {
  display: flex;
  align-items: center;
}

.checkbox {
  width: 30rpx;
  height: 30rpx;
  margin-right: 12rpx;
  border: 1rpx solid var(--crm-border);
  border-radius: 6rpx;
  color: #ffffff;
  font-size: 19rpx;
  line-height: 30rpx;
  text-align: center;
}

.checkbox.is-done {
  border-color: var(--crm-primary);
  background-color: var(--crm-primary);
}

.task-name {
  flex: 1;
  color: var(--crm-text);
  font-size: 25rpx;
}

.is-done-text {
  color: var(--crm-text-muted);
  text-decoration: line-through;
}

.avatar {
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
  background-color: var(--crm-input-bg);
  color: var(--crm-text);
  font-size: 20rpx;
  line-height: 38rpx;
  text-align: center;
}

.task-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14rpx;
  margin: 14rpx 0 0 42rpx;
  color: var(--crm-text-muted);
  font-size: 22rpx;
}

.priority {
  color: #ff7657;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  gap: 24rpx;
  margin-top: 14rpx;
  color: var(--crm-primary);
  font-size: 23rpx;
}

.add-task {
  margin-top: 10rpx;
  color: var(--crm-primary);
  font-size: 25rpx;
}

.add-card {
  margin-top: 10rpx;
  padding: 16rpx;
  border: 1rpx solid var(--crm-border);
  border-radius: 10rpx;
  background-color: var(--crm-page-bg);
}

.class-card {
  width: 100%;
  box-sizing: border-box;
}

.task-input {
  height: 66rpx;
  padding: 0 16rpx;
  border-radius: 8rpx;
  background-color: var(--crm-input-bg);
  color: var(--crm-text);
  font-size: 24rpx;
}

.add-actions {
  display: flex;
  justify-content: flex-end;
  gap: 26rpx;
  margin-top: 14rpx;
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.add-confirm {
  color: var(--crm-primary);
  font-weight: 700;
}

.new-group {
  min-height: 132rpx;
  padding: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx dashed var(--crm-border);
  border-radius: 10rpx;
  background-color: var(--crm-card-bg);
  color: var(--crm-text-muted);
}

.new-column-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.create-plus {
  margin-bottom: 12rpx;
  color: var(--crm-primary);
  font-size: 42rpx;
}

.group-empty {
  margin-bottom: 14rpx;
  padding: 24rpx;
  border-radius: 10rpx;
  background-color: var(--crm-input-bg);
  color: var(--crm-text-muted);
  font-size: 24rpx;
  text-align: center;
}

.empty-box {
  margin: 24rpx 20rpx;
  padding: 40rpx;
  border-radius: 10rpx;
  background-color: var(--crm-card-bg);
  color: var(--crm-text-muted);
  font-size: 25rpx;
  text-align: center;
}

.stat-card,
.simple-list {
  margin: 20rpx;
  padding: 22rpx;
  border-radius: 10rpx;
  background-color: var(--crm-card-bg);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1rpx solid var(--crm-border);
  border-left: 1rpx solid var(--crm-border);
}

.stat-item {
  min-height: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1rpx solid var(--crm-border);
  border-bottom: 1rpx solid var(--crm-border);
}

.stat-value {
  color: var(--crm-text);
  font-size: 34rpx;
  font-weight: 800;
}

.stat-label {
  margin-top: 8rpx;
  color: var(--crm-text-muted);
  font-size: 23rpx;
}

.owner-list {
  margin-top: 20rpx;
}

.owner-row,
.simple-row {
  min-height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid var(--crm-border);
}

.owner-row:last-child,
.simple-row:last-child {
  border-bottom-width: 0;
}

.archive-row {
  align-items: center;
}

.owner-name,
.simple-title {
  display: block;
  color: var(--crm-text);
  font-size: 26rpx;
  font-weight: 700;
}

.owner-meta,
.simple-desc {
  display: block;
  margin-top: 6rpx;
  color: var(--crm-text-muted);
  font-size: 23rpx;
}

.recover-action {
  color: var(--crm-primary);
  font-size: 24rpx;
}

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  background-color: rgba(15, 23, 42, 0.38);
}

.edit-modal {
  width: 100%;
  padding: 30rpx 28rpx calc(34rpx + env(safe-area-inset-bottom));
  border-radius: 28rpx 28rpx 0 0;
  background-color: var(--crm-card-bg);
}

.modal-title {
  display: block;
  margin-bottom: 22rpx;
  color: var(--crm-text);
  font-size: 31rpx;
  font-weight: 800;
}

.modal-subtitle {
  display: block;
  margin: -8rpx 0 20rpx;
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.modal-input,
.modal-textarea {
  width: 100%;
  padding: 0 20rpx;
  border-radius: 16rpx;
  background-color: var(--crm-input-bg);
  color: var(--crm-text);
  font-size: 27rpx;
}

.modal-input {
  height: 82rpx;
}

.modal-textarea {
  min-height: 220rpx;
  padding-top: 18rpx;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 28rpx;
  margin-top: 18rpx;
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.confirm-action {
  color: var(--crm-primary);
  font-weight: 700;
}
</style>
