<template>
  <view class="task-detail-page">
    <view class="sheet-card">
      <view class="sheet-head">
        <view class="title-check" :class="{ 'is-done': isDone }" @click="toggleStatus">{{ isDone ? '✓' : '' }}</view>
        <text class="status-chip" :class="{ 'is-done': isDone }">{{ isDone ? '已完成' : '进行中' }}</text>
        <text class="crumb">{{ detail.work_name || '项目任务' }} / {{ detail.class_name || 'Default' }}</text>
        <text class="sheet-more" @click="openTaskMenu">•••</text>
        <text class="sheet-close" @click="goBack">×</text>
      </view>

      <view v-if="isDone" class="done-watermark">✓</view>

      <view class="editable-title" @click="openTextEditor('name')">
        <text class="hero-title" :class="{ 'is-done-text': isDone }">{{ detail.name || '任务详情' }}</text>
        <text class="edit-hint">编辑</text>
      </view>

      <view class="editable-desc" @click="openTextEditor('description')">
        <rich-text v-if="detail.description" class="description" :nodes="detail.description"></rich-text>
        <text v-else class="empty-text">暂无任务详情，点击添加</text>
        <text class="desc-edit">编辑详情</text>
      </view>

      <view class="meta-lines">
        <view class="meta-line clickable" @click="openPrioritySheet">
          <text class="meta-label">优先级</text>
          <text class="priority-badge" :class="priorityClass">{{ priorityText(detail.priority) }}</text>
          <text class="meta-action">修改</text>
        </view>
        <view class="meta-line">
          <text class="meta-label">负责人</text>
          <view class="avatar mini">
            <image v-if="mainUserImg" class="avatar-img" :src="mainUserImg" mode="aspectFill" />
            <text v-else>{{ avatarText(mainUserName) }}</text>
          </view>
          <text class="meta-value">{{ mainUserName || '--' }}</text>
        </view>
        <view class="meta-line clickable" @click="openTimeEditor">
          <text class="meta-label">时间范围</text>
          <text class="meta-value">{{ timeRangeText }}</text>
          <text class="meta-action">选择</text>
        </view>
      </view>

      <view class="quick-block" v-if="relationItems.length || subTaskList.length || showSubtaskForm">
        <view v-if="relationItems.length" class="quick-section">
          <text class="quick-title">相关信息</text>
          <view v-for="item in relationItems" :key="item.key" class="relation-row">
            <text class="relation-type">{{ item.type }}</text>
            <text class="relation-name">{{ item.name }}</text>
          </view>
        </view>

        <view v-if="subTaskList.length || showSubtaskForm" class="quick-section">
          <view class="card-head">
            <text class="quick-title">子任务 {{ subTaskComplete }}/{{ subTaskList.length }}</text>
            <text class="head-action" @click="startSubtask">＋ 添加</text>
          </view>
          <view v-for="item in subTaskList" :key="item.task_id" class="subtask-row">
            <view class="subtask-check" :class="{ 'is-done': Number(item.status) === 5 }" @click="toggleSubTask(item)">{{ Number(item.status) === 5 ? '✓' : '' }}</view>
            <text class="subtask-name" :class="{ 'is-done-text': Number(item.status) === 5 }">{{ item.name }}</text>
          </view>
          <view v-if="showSubtaskForm" class="subtask-form">
            <input v-model="newSubtaskName" class="subtask-input" placeholder="请输入子任务名称" confirm-type="done" @confirm="submitSubtask" />
            <view class="form-actions">
              <text @click="cancelSubtask">取消</text>
              <text class="confirm-action" @click="submitSubtask">保存</text>
            </view>
          </view>
        </view>
      </view>

      <view class="panel-tabs">
        <text :class="{ 'is-active': activePanel === 'comment' }" @click="activePanel = 'comment'">评论</text>
        <text :class="{ 'is-active': activePanel === 'log' }" @click="activePanel = 'log'">动态</text>
      </view>

      <view v-if="activePanel === 'comment'" class="comment-list">
        <view class="attachment-card">
          <view class="card-head">
            <text class="quick-title">附件</text>
            <view class="attach-actions">
              <text @click="chooseImage">传图片</text>
              <text @click="chooseFile">传文件</text>
            </view>
          </view>
          <view v-for="file in fileList" :key="file.file_id || file.name" class="file-row" @click="previewFile(file)">
            <view class="file-icon">{{ fileIcon(file) }}</view>
            <view class="file-main">
              <text class="file-name">{{ file.name || file.save_name || '附件' }}</text>
              <text class="file-meta">{{ file.size || '--' }} {{ file.create_time || '' }}</text>
            </view>
            <view class="file-actions">
              <text class="file-action" @click.stop="renameFile(file)">改名</text>
              <text class="file-action danger" @click.stop="deleteFile(file)">删除</text>
            </view>
          </view>
          <text v-if="!fileList.length" class="empty-text compact">暂无附件，可在这里上传图片、Office、PDF 等文件</text>
        </view>

        <view v-for="item in replyList" :key="item.comment_id" class="comment-row">
          <view class="avatar mini">{{ avatarText(commentUserName(item)) }}</view>
          <view class="comment-main">
            <text class="comment-name">{{ commentUserName(item) }}</text>
            <text class="comment-content">{{ item.content || '' }}</text>
            <text class="comment-time">{{ item.create_time || '' }}</text>
          </view>
        </view>
        <text v-if="!replyList.length" class="empty-text compact">暂无评论</text>
      </view>

      <view v-if="activePanel === 'log'" class="comment-list">
        <view v-for="item in logList" :key="item.log_id" class="comment-row">
          <view class="avatar mini">{{ avatarText(item.realname) }}</view>
          <view class="comment-main">
            <text class="comment-name">{{ item.realname || '系统' }}</text>
            <text class="comment-content">{{ item.content || item.name || '更新了任务' }}</text>
            <text class="comment-time">{{ item.create_time || '' }}</text>
          </view>
        </view>
        <text v-if="!logList.length" class="empty-text compact">暂无动态</text>
      </view>
    </view>

    <view class="comment-bar">
      <input v-model="commentText" class="comment-input" placeholder="输入评论..." confirm-type="send" @confirm="submitComment" />
      <text class="comment-tool" @click="chooseFile">＋</text>
      <button class="send-btn" :loading="commentSaving" @click="submitComment">发送</button>
    </view>

    <view v-if="textEditor.visible" class="modal-mask" @click="closeTextEditor">
      <view class="edit-modal" @click.stop>
        <text class="modal-title">{{ textEditor.type === 'name' ? '修改任务标题' : '修改任务详情' }}</text>
        <input v-if="textEditor.type === 'name'" v-model="textEditor.value" class="modal-input" placeholder="请输入任务标题" />
        <textarea v-else v-model="textEditor.value" class="modal-textarea" placeholder="请输入任务详情" />
        <view class="modal-actions">
          <text @click="closeTextEditor">取消</text>
          <text class="confirm-action" @click="saveTextEditor">保存</text>
        </view>
      </view>
    </view>

    <view v-if="timeEditor.visible" class="modal-mask" @click="closeTimeEditor">
      <view class="edit-modal" @click.stop>
        <text class="modal-title">选择时间范围</text>
        <view class="date-row">
          <text>开始时间</text>
          <picker mode="date" :value="timeEditor.start_time" @change="handleStartDate">
            <text class="date-value">{{ timeEditor.start_time || '未设置' }}</text>
          </picker>
        </view>
        <view class="date-row">
          <text>截止时间</text>
          <picker mode="date" :value="timeEditor.stop_time" @change="handleStopDate">
            <text class="date-value">{{ timeEditor.stop_time || '未设置' }}</text>
          </picker>
        </view>
        <view class="modal-actions">
          <text @click="clearTimeEditor">清空</text>
          <text @click="closeTimeEditor">取消</text>
          <text class="confirm-action" @click="saveTimeEditor">保存</text>
        </view>
      </view>
    </view>

    <view v-if="fileEditor.visible" class="modal-mask" @click="closeFileEditor">
      <view class="edit-modal" @click.stop>
        <text class="modal-title">修改附件名称</text>
        <input v-model="fileEditor.name" class="modal-input" placeholder="请输入附件名称" />
        <view class="modal-actions">
          <text @click="closeFileEditor">取消</text>
          <text class="confirm-action" @click="saveFileEditor">保存</text>
        </view>
      </view>
    </view>

    <view v-if="textPreview.visible" class="preview-mask">
      <view class="text-preview-panel">
        <view class="preview-head">
          <text class="preview-close" @click="closeTextPreview">‹ 返回</text>
          <text class="preview-title">{{ textPreview.title || '文本预览' }}</text>
          <text class="preview-spacer"></text>
        </view>
        <scroll-view scroll-y class="preview-body">
          <text v-if="textPreview.loading" class="preview-loading">正在加载...</text>
          <text v-else class="preview-text">{{ textPreview.content || '暂无内容' }}</text>
        </scroll-view>
      </view>
    </view>

    <view
      v-if="imagePreview.visible"
      class="image-preview-mask"
      @click="closeImagePreview"
      @touchstart="handleImageTouchStart"
      @touchend="handleImageTouchEnd"
    >
      <text class="image-preview-float-close" @click.stop="closeImagePreview">×</text>
      <view class="image-preview-head" @click.stop>
        <text class="image-preview-btn" @click.stop="closeImagePreview">关闭</text>
        <text class="image-preview-title">{{ imagePreview.name || '图片预览' }}</text>
        <text class="image-preview-btn primary" @click.stop="saveImageToAlbum">保存</text>
      </view>
      <view class="image-preview-body" @click.stop>
        <image class="image-preview-img" :src="imagePreview.url" mode="aspectFit" />
      </view>
      <view class="image-preview-actions" @click.stop>
        <text @click.stop="saveImageToAlbum">保存到相册</text>
        <text class="danger" @click.stop="deleteFile(imagePreview.file)">删除图片</text>
      </view>
    </view>
  </view>
</template>

<script>
import {
  addProjectTaskComment,
  createProjectTask,
  getProjectTaskDetail,
  getProjectTaskLogs,
  deleteProjectFile,
  renameProjectFile,
  toggleProjectTask,
  updateProjectTask,
  updateProjectTaskName,
  updateProjectTaskPriority,
  updateProjectTaskTime
} from '../../api/work'
import { BASE_URL } from '../../utils/config'
import { ensureLogin } from '../../utils/router'
import { getAuth } from '../../utils/storage'

export default {
  data() {
    return {
      taskId: '',
      workId: '',
      detail: {},
      logList: [],
      activePanel: 'comment',
      commentText: '',
      commentSaving: false,
      fileDeleting: false,
      showSubtaskForm: false,
      newSubtaskName: '',
      subtaskSaving: false,
      textEditor: {
        visible: false,
        type: 'name',
        value: ''
      },
      timeEditor: {
        visible: false,
        start_time: '',
        stop_time: ''
      },
      fileEditor: {
        visible: false,
        save_name: '',
        name: ''
      },
      textPreview: {
        visible: false,
        loading: false,
        title: '',
        content: ''
      },
      imagePreview: {
        visible: false,
        url: '',
        name: '',
        file: null
      },
      imageTouchStartY: 0
    }
  },
  computed: {
    isDone() {
      return Number(this.detail.status) === 5
    },
    mainUserName() {
      return this.detail.main_user_name || (this.detail.main_user && this.detail.main_user.realname) || ''
    },
    mainUserImg() {
      return this.detail.main_user_img || (this.detail.main_user && this.detail.main_user.img) || ''
    },
    replyList() {
      return Array.isArray(this.detail.replyList) ? this.detail.replyList : []
    },
    subTaskList() {
      return Array.isArray(this.detail.subTaskList) ? this.detail.subTaskList : []
    },
    subTaskComplete() {
      return Number(this.detail.subTaskComplete || 0)
    },
    fileList() {
      return Array.isArray(this.detail.fileList) ? this.detail.fileList : []
    },
    relationItems() {
      return [
        ...this.mapRelation('客户', this.detail.customerList),
        ...this.mapRelation('联系人', this.detail.contactsList),
        ...this.mapRelation('商机', this.detail.businessList),
        ...this.mapRelation('合同', this.detail.contractList)
      ]
    },
    priorityClass() {
      return `priority-${Number(this.detail.priority || 0)}`
    },
    timeRangeText() {
      const start = this.detail.start_time || '未设置'
      const stop = this.detail.stop_time || '未设置'
      return `${start} 至 ${stop}`
    }
  },
  async onLoad(options) {
    if (!ensureLogin()) return
    this.taskId = options.id || ''
    this.workId = options.work_id || ''
    await this.loadData()
  },
  methods: {
    async loadData() {
      const [detail, logs] = await Promise.all([
        getProjectTaskDetail(this.taskId),
        getProjectTaskLogs(this.taskId)
      ])
      this.detail = detail || {}
      this.logList = Array.isArray(logs) ? logs : (logs && Array.isArray(logs.list) ? logs.list : [])
      this.workId = this.workId || this.detail.work_id || ''
    },
    goBack() {
      uni.navigateBack()
    },
    mapRelation(type, list) {
      if (!Array.isArray(list)) return []
      return list.map((item, index) => ({
        key: `${type}-${item.id || item.customer_id || item.business_id || item.contract_id || index}`,
        type,
        name: item.name || item.customer_name || item.business_name || item.contract_name || '--'
      }))
    },
    avatarText(name) {
      return (name || '无').slice(0, 1)
    },
    commentUserName(item) {
      return (item.userInfo && item.userInfo.realname) || item.realname || item.create_user_name || '成员'
    },
    priorityText(value) {
      const map = { 0: '无', 1: '低', 2: '中', 3: '高' }
      return map[Number(value)] || '无'
    },
    openTaskMenu() {
      uni.showActionSheet({
        itemList: ['修改标题', '修改详情', '设置优先级', '设置时间范围'],
        success: ({ tapIndex }) => {
          if (tapIndex === 0) this.openTextEditor('name')
          if (tapIndex === 1) this.openTextEditor('description')
          if (tapIndex === 2) this.openPrioritySheet()
          if (tapIndex === 3) this.openTimeEditor()
        }
      })
    },
    openTextEditor(type) {
      this.textEditor = {
        visible: true,
        type,
        value: type === 'name' ? (this.detail.name || '') : this.plainDescription(this.detail.description || '')
      }
    },
    closeTextEditor() {
      this.textEditor.visible = false
    },
    plainDescription(value) {
      return String(value || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '')
    },
    htmlDescription(value) {
      return String(value || '').replace(/\n/g, '<br/>')
    },
    async saveTextEditor() {
      const value = this.textEditor.value.trim()
      if (this.textEditor.type === 'name' && !value) {
        uni.showToast({ title: '请输入任务标题', icon: 'none' })
        return
      }
      if (this.textEditor.type === 'name') {
        await updateProjectTaskName({
          work_id: this.workId,
          task_id: this.taskId,
          name: value
        })
      } else {
        await updateProjectTask({
          work_id: this.workId,
          task_id: this.taskId,
          type: 'description',
          description: this.htmlDescription(value)
        })
      }
      this.closeTextEditor()
      uni.showToast({ title: '保存成功', icon: 'success' })
      await this.loadData()
    },
    openPrioritySheet() {
      uni.showActionSheet({
        itemList: ['无', '低', '中', '高'],
        success: async ({ tapIndex }) => {
          await updateProjectTaskPriority({
            work_id: this.workId,
            task_id: this.taskId,
            priority_id: tapIndex
          })
          uni.showToast({ title: '已更新', icon: 'success' })
          await this.loadData()
        }
      })
    },
    openTimeEditor() {
      this.timeEditor = {
        visible: true,
        start_time: this.detail.start_time || '',
        stop_time: this.detail.stop_time || ''
      }
    },
    closeTimeEditor() {
      this.timeEditor.visible = false
    },
    clearTimeEditor() {
      this.timeEditor.start_time = ''
      this.timeEditor.stop_time = ''
    },
    handleStartDate(event) {
      this.timeEditor.start_time = event.detail.value
    },
    handleStopDate(event) {
      this.timeEditor.stop_time = event.detail.value
    },
    async saveTimeEditor() {
      if (this.timeEditor.start_time && this.timeEditor.stop_time && this.timeEditor.start_time > this.timeEditor.stop_time) {
        uni.showToast({ title: '开始时间不能晚于截止时间', icon: 'none' })
        return
      }
      await updateProjectTaskTime({
        work_id: this.workId,
        task_id: this.taskId,
        type: 'stop_time',
        start_time: this.timeEditor.start_time || null,
        stop_time: this.timeEditor.stop_time || null
      })
      this.closeTimeEditor()
      uni.showToast({ title: '已更新', icon: 'success' })
      await this.loadData()
    },
    async toggleStatus() {
      await toggleProjectTask({
        work_id: this.workId,
        task_id: this.taskId,
        status: this.isDone ? 1 : 5
      })
      uni.showToast({ title: '操作成功', icon: 'success' })
      await this.loadData()
    },
    async toggleSubTask(item) {
      await toggleProjectTask({
        work_id: this.workId,
        task_id: item.task_id,
        status: Number(item.status) === 5 ? 1 : 5
      })
      await this.loadData()
    },
    startSubtask() {
      this.showSubtaskForm = true
      this.newSubtaskName = ''
    },
    cancelSubtask() {
      this.showSubtaskForm = false
      this.newSubtaskName = ''
    },
    async submitSubtask() {
      if (!this.newSubtaskName.trim()) {
        uni.showToast({ title: '请输入子任务名称', icon: 'none' })
        return
      }
      if (this.subtaskSaving) return
      this.subtaskSaving = true
      try {
        await createProjectTask({
          work_id: this.workId,
          pid: this.taskId,
          name: this.newSubtaskName
        })
        uni.showToast({ title: '添加成功', icon: 'success' })
        this.cancelSubtask()
        await this.loadData()
      } finally {
        this.subtaskSaving = false
      }
    },
    chooseImage() {
      uni.chooseImage({
        count: 9,
        success: async (result) => {
          await this.uploadLocalFiles(result.tempFiles || result.tempFilePaths || [], 'img')
        }
      })
    },
    chooseFile() {
      if (!uni.chooseFile) {
        uni.showToast({ title: '当前端暂不支持选择附件', icon: 'none' })
        return
      }
      uni.chooseFile({
        count: 9,
        success: async (result) => {
          await this.uploadLocalFiles(result.tempFiles || result.tempFilePaths || [], 'file')
        }
      })
    },
    async uploadLocalFiles(list = [], type = 'file') {
      const files = list.map((item) => (typeof item === 'string' ? { path: item, name: item.split('/').pop() } : item))
      if (!files.length) return
      uni.showLoading({ title: '上传中' })
      try {
        for (const file of files) {
          await this.uploadOneFile(file, type)
        }
        uni.showToast({ title: '上传成功', icon: 'success' })
        await this.loadData()
      } finally {
        uni.hideLoading()
      }
    },
    uploadOneFile(file, type) {
      const auth = getAuth()
      const filePath = file.path || file.tempFilePath
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: `${BASE_URL}admin/file/save`,
          filePath,
          name: 'file',
          formData: {
            type,
            module: 'work_task',
            module_id: this.taskId,
            work_id: this.workId
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
            if (result.code === 200) {
              resolve(result.data)
              return
            }
            uni.showToast({ title: result.error || result.msg || '上传失败', icon: 'none' })
            reject(result)
          },
          fail: reject
        })
      })
    },
    fileUrl(file) {
      return file.file_path || file.full_path || file.path || file.url || ''
    },
    fileName(file) {
      return file.name || file.save_name || ''
    },
    fileExt(file) {
      const candidates = [
        file.name,
        file.save_name,
        file.file_path,
        file.full_path,
        file.path,
        file.url
      ]
      for (const item of candidates) {
        const clean = String(item || '').split('?')[0].split('#')[0].trim().toLowerCase()
        const match = clean.match(/\.([a-z0-9]+)$/)
        if (match) return match[1]
      }
      return ''
    },
    isImageFile(file) {
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(this.fileExt(file))
    },
    isTextFile(file) {
      return ['txt', 'csv', 'md', 'log', 'json', 'xml', 'html', 'css', 'js'].includes(this.fileExt(file))
    },
    isDocumentFile(file) {
      return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf'].includes(this.fileExt(file))
    },
    fileIcon(file) {
      const ext = this.fileExt(file)
      if (this.isImageFile(file)) return '图'
      if (this.isTextFile(file)) return '文'
      if (['doc', 'docx'].includes(ext)) return 'W'
      if (['xls', 'xlsx', 'csv'].includes(ext)) return 'X'
      if (['ppt', 'pptx'].includes(ext)) return 'P'
      if (ext === 'pdf') return 'P'
      return '附'
    },
    previewFile(file) {
      const url = this.fileUrl(file)
      if (!url) {
        uni.showToast({ title: '附件地址不存在', icon: 'none' })
        return
      }
      if (this.isImageFile(file)) {
        this.openImagePreview(file)
        return
      }
      if (this.isTextFile(file) || this.isDocumentFile(file) || !this.fileExt(file)) {
        this.openFilePreview(file)
        return
      }
      if (uni.downloadFile && uni.openDocument) {
        uni.showLoading({ title: '打开中' })
        uni.downloadFile({
          url,
          success: (result) => {
            uni.openDocument({
              filePath: result.tempFilePath,
              showMenu: true,
              fail: () => this.openExternalFile(url)
            })
          },
          fail: () => this.openExternalFile(url),
          complete: () => uni.hideLoading()
        })
        return
      }
      this.openExternalFile(url)
    },
    openFilePreview(file) {
      const url = this.fileUrl(file)
      const name = this.fileName(file) || '附件预览'
      const ext = this.fileExt(file)
      const fileId = file.file_id || ''
      uni.navigateTo({
        url: `/pages/project/file-preview?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}&ext=${encodeURIComponent(ext)}&file_id=${fileId}&task_id=${this.taskId}&work_id=${this.workId}`
      })
    },
    closeTextPreview() {
      this.textPreview.visible = false
    },
    openImagePreview(file) {
      const url = this.fileUrl(file)
      if (!url) {
        uni.showToast({ title: '附件地址不存在', icon: 'none' })
        return
      }
      this.imagePreview = {
        visible: true,
        url,
        name: this.fileName(file),
        file
      }
    },
    closeImagePreview() {
      this.imagePreview = {
        visible: false,
        url: '',
        name: '',
        file: null
      }
      this.imageTouchStartY = 0
    },
    handleImageTouchStart(event) {
      const touch = event.touches && event.touches[0]
      this.imageTouchStartY = touch ? touch.clientY : 0
    },
    handleImageTouchEnd(event) {
      const touch = event.changedTouches && event.changedTouches[0]
      if (!touch || !this.imageTouchStartY) return
      if (touch.clientY - this.imageTouchStartY > 90) {
        this.closeImagePreview()
      }
    },
    saveImageToAlbum() {
      const url = this.imagePreview.url
      if (!url) {
        uni.showToast({ title: '图片地址不存在', icon: 'none' })
        return
      }
      // #ifdef H5
      const link = document.createElement('a')
      link.href = url
      link.download = this.imagePreview.name || 'image'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      uni.showToast({ title: '已开始下载', icon: 'success' })
      // #endif
      // #ifndef H5
      uni.showLoading({ title: '保存中...' })
      uni.downloadFile({
        url,
        success: (result) => {
          uni.saveImageToPhotosAlbum({
            filePath: result.tempFilePath,
            success: () => uni.showToast({ title: '保存成功', icon: 'success' }),
            fail: () => uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
          })
        },
        fail: () => uni.showToast({ title: '图片下载失败', icon: 'none' }),
        complete: () => uni.hideLoading()
      })
      // #endif
    },
    openExternalFile(url) {
      // H5 端没有原生 Office 插件时，交给浏览器或系统应用预览。
      // #ifdef H5
      window.open(url, '_blank')
      // #endif
      // #ifndef H5
      uni.showToast({ title: '当前端不支持直接预览，请下载查看', icon: 'none' })
      // #endif
    },
    renameFile(file) {
      this.fileEditor = {
        visible: true,
        save_name: file.save_name,
        name: this.fileName(file)
      }
    },
    closeFileEditor() {
      this.fileEditor.visible = false
    },
    async saveFileEditor() {
      const name = this.fileEditor.name.trim()
      if (!name) {
        uni.showToast({ title: '请输入附件名称', icon: 'none' })
        return
      }
      await renameProjectFile({
        save_name: this.fileEditor.save_name,
        name
      })
      this.closeFileEditor()
      uni.showToast({ title: '修改成功', icon: 'success' })
      await this.loadData()
    },
    deleteFile(file) {
      if (!file || this.fileDeleting) return
      const saveName = file.save_name || ''
      if (!saveName) {
        uni.showToast({ title: '附件标识不存在', icon: 'none' })
        return
      }
      uni.showModal({
        title: '删除附件',
        content: `确定删除“${this.fileName(file) || '附件'}”吗？`,
        confirmText: '删除',
        confirmColor: '#e5484d',
        success: async (res) => {
          if (!res.confirm) return
          this.fileDeleting = true
          try {
            await deleteProjectFile({
              file_id: file.file_id || file.id || '',
              save_name: saveName,
              module: 'work_task',
              module_id: this.taskId,
              work_id: this.workId
            })
            if (this.imagePreview.file === file || this.imagePreview.url === this.fileUrl(file)) {
              this.closeImagePreview()
            }
            uni.showToast({ title: '删除成功', icon: 'success' })
            await this.loadData()
          } catch (error) {
            uni.showToast({ title: '删除失败', icon: 'none' })
          } finally {
            this.fileDeleting = false
          }
        }
      })
    },
    async submitComment() {
      if (!this.commentText.trim()) {
        uni.showToast({ title: '请输入评论内容', icon: 'none' })
        return
      }
      if (this.commentSaving) return
      this.commentSaving = true
      try {
        await addProjectTaskComment({
          type_id: this.taskId,
          content: this.commentText.trim()
        })
        this.commentText = ''
        uni.showToast({ title: '发送成功', icon: 'success' })
        await this.loadData()
      } finally {
        this.commentSaving = false
      }
    }
  }
}
</script>

<style scoped>
.task-detail-page {
  min-height: 100vh;
  padding: 40rpx 20rpx 140rpx;
  background: rgba(0, 0, 0, 0.38);
}

.sheet-card {
  position: relative;
  min-height: calc(100vh - 180rpx);
  padding: 28rpx 28rpx 36rpx;
  overflow: hidden;
  border-radius: 34rpx 34rpx 0 0;
  background-color: var(--crm-card-bg);
}

.sheet-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid var(--crm-border);
}

.title-check,
.subtask-check {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #7ed321;
  color: #ffffff;
}

.title-check {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  font-size: 20rpx;
  line-height: 32rpx;
}

.title-check.is-done,
.subtask-check.is-done {
  background-color: #7ed321;
}

.status-chip {
  padding: 7rpx 16rpx;
  border-radius: 8rpx;
  background-color: var(--crm-input-bg);
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.status-chip.is-done {
  background-color: rgba(126, 211, 33, 0.15);
  color: #27a845;
}

.crumb {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--crm-text-muted);
  font-size: 22rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sheet-more,
.sheet-close {
  color: var(--crm-text-muted);
  font-size: 34rpx;
}

.sheet-close {
  font-size: 48rpx;
  line-height: 1;
}

.done-watermark {
  position: absolute;
  top: 42rpx;
  right: 78rpx;
  z-index: 0;
  width: 118rpx;
  height: 118rpx;
  border: 12rpx solid rgba(126, 211, 33, 0.24);
  border-radius: 50%;
  color: rgba(126, 211, 33, 0.34);
  font-size: 76rpx;
  line-height: 108rpx;
  text-align: center;
  transform: rotate(-18deg);
}

.editable-title {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  margin-top: 48rpx;
}

.hero-title {
  flex: 1;
  color: var(--crm-text);
  font-size: 40rpx;
  font-weight: 800;
  line-height: 1.35;
}

.edit-hint,
.desc-edit,
.meta-action,
.head-action,
.file-action,
.attach-actions text {
  color: var(--crm-primary);
  font-size: 24rpx;
  font-weight: 700;
}

.is-done-text {
  color: #8a96a8;
  text-decoration: line-through;
}

.editable-desc {
  position: relative;
  z-index: 1;
  margin-top: 22rpx;
  padding: 18rpx;
  border: 1rpx dashed transparent;
  border-radius: 16rpx;
  background-color: var(--crm-input-bg);
}

.description,
.empty-text {
  display: block;
  color: var(--crm-text-muted);
  font-size: 27rpx;
  line-height: 1.65;
}

.description {
  color: var(--crm-text);
}

.desc-edit {
  display: block;
  margin-top: 10rpx;
}

.meta-lines {
  margin-top: 28rpx;
}

.meta-line {
  min-height: 76rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  color: var(--crm-text-muted);
  font-size: 25rpx;
}

.meta-line.clickable {
  border-bottom: 1rpx solid var(--crm-border);
}

.meta-label {
  width: 120rpx;
  color: var(--crm-text-muted);
}

.meta-value {
  flex: 1;
  min-width: 0;
  color: var(--crm-text);
}

.priority-badge {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  background-color: var(--crm-input-bg);
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.priority-badge.priority-1 {
  background-color: #e9f8f3;
  color: #20a678;
}

.priority-badge.priority-2 {
  background-color: #fff4df;
  color: #d88911;
}

.priority-badge.priority-3 {
  background-color: #ffecec;
  color: #dd4b4b;
}

.avatar {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background-color: #eef2f7;
  color: #52627a;
  font-size: 23rpx;
  font-weight: 700;
}

.avatar.mini {
  width: 50rpx;
  height: 50rpx;
  background-color: var(--crm-primary);
  color: #ffffff;
  font-size: 22rpx;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.quick-block {
  margin-top: 30rpx;
}

.quick-section,
.attachment-card {
  margin-bottom: 22rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid var(--crm-border);
}

.quick-title {
  display: block;
  color: var(--crm-text);
  font-size: 27rpx;
  font-weight: 800;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.attach-actions {
  display: flex;
  gap: 24rpx;
}

.relation-row,
.subtask-row,
.file-row {
  min-height: 76rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid var(--crm-border);
}

.relation-row:last-child,
.subtask-row:last-child,
.file-row:last-child {
  border-bottom-width: 0;
}

.relation-type {
  width: 104rpx;
  color: var(--crm-text-muted);
  font-size: 23rpx;
}

.relation-name,
.subtask-name,
.file-name {
  flex: 1;
  color: var(--crm-text);
  font-size: 25rpx;
}

.subtask-check {
  width: 30rpx;
  height: 30rpx;
  margin-right: 14rpx;
  border-radius: 6rpx;
  font-size: 18rpx;
}

.subtask-form {
  margin-top: 16rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  background-color: var(--crm-input-bg);
}

.subtask-input {
  height: 70rpx;
  padding: 0 18rpx;
  border-radius: 10rpx;
  background-color: var(--crm-card-bg);
  color: var(--crm-text);
  font-size: 25rpx;
}

.form-actions,
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

.file-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 14rpx;
  border-radius: 12rpx;
  background-color: var(--crm-soft-bg);
  color: var(--crm-primary);
  font-size: 22rpx;
  font-weight: 800;
  line-height: 48rpx;
  text-align: center;
}

.file-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  margin-top: 4rpx;
  color: var(--crm-text-muted);
  font-size: 22rpx;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-left: 14rpx;
}

.file-action {
  min-width: 64rpx;
  padding: 12rpx 0;
  text-align: center;
}

.file-action.danger {
  color: #e5484d;
}

.panel-tabs {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 36rpx;
  margin-top: 44rpx;
  padding: 22rpx 0 16rpx;
  border-bottom: 1rpx solid var(--crm-border);
  background-color: var(--crm-card-bg);
}

.panel-tabs text {
  color: var(--crm-text-muted);
  font-size: 28rpx;
}

.panel-tabs text.is-active {
  color: var(--crm-text);
  font-weight: 800;
}

.comment-list {
  padding-top: 20rpx;
}

.comment-row {
  display: flex;
  gap: 16rpx;
  padding: 18rpx 0;
}

.comment-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.comment-name {
  color: var(--crm-text);
  font-size: 25rpx;
  font-weight: 700;
}

.comment-content {
  margin-top: 8rpx;
  color: var(--crm-text);
  font-size: 26rpx;
  line-height: 1.5;
}

.comment-time {
  margin-top: 8rpx;
  color: var(--crm-text-muted);
  font-size: 22rpx;
}

.compact {
  margin-top: 10rpx;
  font-size: 24rpx;
}

.comment-bar {
  position: fixed;
  left: 20rpx;
  right: 20rpx;
  bottom: calc(18rpx + env(safe-area-inset-bottom));
  z-index: 20;
  min-height: 86rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 0 16rpx;
  border-radius: 18rpx;
  background-color: var(--crm-card-bg);
  box-shadow: 0 12rpx 36rpx rgba(25, 42, 70, 0.12);
}

.comment-input {
  flex: 1;
  height: 68rpx;
  padding: 0 14rpx;
  border-radius: 14rpx;
  background-color: var(--crm-input-bg);
  color: var(--crm-text);
  font-size: 25rpx;
}

.comment-tool {
  color: var(--crm-primary);
  font-size: 38rpx;
  font-weight: 700;
}

.send-btn {
  width: 96rpx;
  height: 58rpx;
  padding: 0;
  border-radius: 999rpx;
  background-color: var(--crm-primary);
  color: #ffffff;
  font-size: 24rpx;
  line-height: 58rpx;
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

.preview-mask {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  align-items: stretch;
  background-color: rgba(15, 23, 42, 0.46);
}

.text-preview-panel {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--crm-card-bg);
}

.preview-head {
  min-height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: calc(20rpx + env(safe-area-inset-top)) 28rpx 18rpx;
  border-bottom: 1rpx solid var(--crm-border);
}

.preview-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--crm-text);
  font-size: 30rpx;
  font-weight: 800;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-close {
  min-width: 118rpx;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background-color: var(--crm-soft-bg);
  color: var(--crm-primary);
  font-size: 27rpx;
  font-weight: 700;
}

.preview-spacer {
  width: 118rpx;
}

.preview-body {
  flex: 1;
  height: calc(100vh - 120rpx);
  padding: 28rpx;
  box-sizing: border-box;
  background-color: var(--crm-card-bg);
}

.preview-text,
.preview-loading {
  color: var(--crm-text);
  font-size: 32rpx;
  line-height: 1.85;
  white-space: pre-wrap;
  word-break: break-word;
}

.preview-loading {
  color: var(--crm-text-muted);
}

.image-preview-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  background-color: #05070d;
}

.image-preview-float-close {
  position: fixed;
  top: calc(92rpx + env(safe-area-inset-top));
  right: 24rpx;
  z-index: 10001;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 48rpx;
  font-weight: 300;
  line-height: 66rpx;
  text-align: center;
}

.image-preview-head {
  min-height: 104rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: calc(22rpx + env(safe-area-inset-top)) 24rpx 18rpx;
  box-sizing: border-box;
  color: #ffffff;
}

.image-preview-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #ffffff;
  font-size: 29rpx;
  font-weight: 800;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-preview-btn {
  min-width: 110rpx;
  min-height: 62rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background-color: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-size: 27rpx;
  font-weight: 700;
  line-height: 62rpx;
  text-align: center;
}

.image-preview-btn.primary {
  background-color: var(--crm-primary);
}

.image-preview-body {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
}

.image-preview-img {
  width: 100%;
  height: 100%;
}

.image-preview-actions {
  display: flex;
  justify-content: center;
  gap: 22rpx;
  padding: 20rpx 24rpx calc(28rpx + env(safe-area-inset-bottom));
}

.image-preview-actions text {
  min-width: 210rpx;
  min-height: 72rpx;
  padding: 0 26rpx;
  border-radius: 999rpx;
  background-color: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-size: 27rpx;
  font-weight: 800;
  line-height: 72rpx;
  text-align: center;
}

.image-preview-actions text.danger {
  background-color: rgba(229, 72, 77, 0.18);
  color: #ff7d82;
}

.modal-title {
  display: block;
  margin-bottom: 22rpx;
  color: var(--crm-text);
  font-size: 31rpx;
  font-weight: 800;
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
  min-height: 260rpx;
  padding-top: 18rpx;
  line-height: 1.5;
}

.date-row {
  min-height: 82rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid var(--crm-border);
  color: var(--crm-text);
  font-size: 27rpx;
}

.date-value {
  color: var(--crm-primary);
  font-weight: 700;
}
</style>
