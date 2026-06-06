<template>
  <view class="follow-page">
    <view class="content-card">
      <view class="field-title">
        <text class="required">*</text>
        <text>跟进内容</text>
      </view>
      <textarea
        v-model="form.content"
        class="content-input"
        maxlength="-1"
        placeholder="输入 @ 可选择需要通知人员"
        placeholder-style="color: var(--crm-text-muted)"
      />
      <button class="phrase-button" @click="openPhrase">常用语</button>
    </view>

    <view class="form-card">
      <picker mode="date" :value="nextDate" @change="handleDateChange">
        <view class="form-row">
          <text>下次联系时间</text>
          <view class="row-value">
            <text v-if="nextDate">{{ nextDate }} {{ nextTime }}</text>
            <text class="calendar-icon">日</text>
          </view>
        </view>
      </picker>
      <picker v-if="nextDate" mode="time" :value="nextTime" @change="handleTimeChange">
        <view class="form-row time-row">
          <text>联系时间点</text>
          <text class="muted-value">{{ nextTime }}</text>
        </view>
      </picker>
    </view>

    <view class="form-card">
      <view class="form-row" @click="showCategoryInput = true">
        <text>跟进方式</text>
        <view class="row-value">
          <text v-if="form.category" class="muted-value">{{ form.category }}</text>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>

    <view class="form-card">
      <view class="form-row tool-row" @click="chooseImage">
        <view class="tool-title"><text class="tool-icon">图</text><text>图片</text></view>
        <text class="plus-icon">＋</text>
      </view>
      <view class="form-row tool-row" @click="chooseFile">
        <view class="tool-title"><text class="tool-icon">附</text><text>附件</text></view>
        <text class="plus-icon">＋</text>
      </view>
      <picker
        v-if="canAssociateContact"
        :range="contactOptions"
        range-key="name"
        :value="contactIndex"
        @change="handleContactChange"
      >
        <view class="form-row tool-row">
          <view class="tool-title"><text class="tool-icon">关</text><text>关联联系人</text></view>
          <view class="row-value">
            <text v-if="contactLabel" class="muted-value">{{ contactLabel }}</text>
            <text v-else class="muted-value">请选择</text>
            <text class="plus-icon">＋</text>
          </view>
        </view>
      </picker>
      <view v-else class="form-row tool-row" @click="showRelatedInfo">
        <view class="tool-title"><text class="tool-icon">关</text><text>相关信息</text></view>
        <text class="plus-icon">＋</text>
      </view>
    </view>

    <view v-if="targetName" class="target-card">
      <text class="target-label">跟进对象</text>
      <text class="target-name">{{ targetName }}</text>
    </view>

    <view v-if="files.length" class="target-card">
      <text class="target-label">已上传附件</text>
      <view v-for="file in files" :key="file.file_id" class="file-item">
        <text class="target-name">{{ file.name }}</text>
        <text class="remove-file" @click="removeFile(file)">删除</text>
      </view>
    </view>

    <view v-if="showCategoryInput" class="input-mask" @click="showCategoryInput = false">
      <view class="input-panel" @click.stop>
        <view class="input-title">跟进方式</view>
        <input
          v-model="form.category"
          class="category-input"
          placeholder="请输入跟进方式，如电话、微信、拜访"
          placeholder-style="color: var(--crm-text-muted)"
        />
        <button class="panel-button" @click="showCategoryInput = false">确定</button>
      </view>
    </view>

    <view v-if="showPhrasePanel" class="input-mask" @click="showPhrasePanel = false">
      <view class="input-panel" @click.stop>
        <view class="input-title">常用语</view>
        <view v-if="phrases.length" class="phrase-list">
          <view v-for="item in phrases" :key="item" class="phrase-item" @click="usePhrase(item)">{{ item }}</view>
        </view>
        <view v-else class="empty-text">暂无常用语</view>
      </view>
    </view>

    <view class="bottom-bar">
      <button class="save-button" :loading="loading" @click="submit">保存</button>
    </view>
  </view>
</template>

<script>
import { createRecord, getActivityPhrases, getContactsList } from '../../api/crm'
import { BASE_URL } from '../../utils/config'
import { ensureLogin } from '../../utils/router'
import { getAuth } from '../../utils/storage'

export default {
  data() {
    return {
      activityType: '',
      activityTypeId: '',
      customerId: '',
      targetName: '',
      nextDate: '',
      nextTime: '09:00',
      loading: false,
      showCategoryInput: false,
      showPhrasePanel: false,
      phrases: [],
      contacts: [],
      files: [],
      form: {
        content: '',
        category: '',
        contacts_ids: ''
      }
    }
  },
  async onLoad(options) {
    if (!ensureLogin()) return
    this.activityType = options.activity_type || ''
    this.activityTypeId = options.activity_type_id || ''
    this.customerId = options.customer_id || (String(this.activityType) === '2' ? this.activityTypeId : '')
    this.targetName = options.name ? decodeURIComponent(options.name) : ''
    this.form.contacts_ids = options.contacts_id || ''
    await Promise.all([
      this.loadPhrases(),
      this.loadContacts()
    ])
  },
  computed: {
    canAssociateContact() {
      return Boolean(this.customerId || this.contacts.length || this.form.contacts_ids)
    },
    contactOptions() {
      const options = [{ contacts_id: '', name: '不关联联系人' }]
      const seen = new Set([''])
      this.contacts.forEach((item) => {
        const id = this.contactId(item)
        if (!id || seen.has(String(id))) return
        options.push({
          ...item,
          contacts_id: id,
          name: this.contactName(item) || `联系人 ${id}`
        })
        seen.add(String(id))
      })

      const currentId = this.normalizeContactId(this.form.contacts_ids)
      if (currentId && !seen.has(String(currentId))) {
        options.push({ contacts_id: currentId, name: `联系人 ${currentId}` })
      }
      return options
    },
    contactIndex() {
      const currentId = this.normalizeContactId(this.form.contacts_ids)
      const index = this.contactOptions.findIndex((item) => String(item.contacts_id || '') === String(currentId || ''))
      return index >= 0 ? index : 0
    },
    contactLabel() {
      const option = this.contactOptions[this.contactIndex]
      return option && option.contacts_id ? option.name : ''
    }
  },
  methods: {
    async loadPhrases() {
      try {
        const result = await getActivityPhrases()
        this.phrases = this.normalizePhrase(result)
      } catch (error) {
        this.phrases = []
      }
    },
    normalizePhrase(result) {
      if (Array.isArray(result)) return result.map((item) => this.phraseText(item)).filter(Boolean)
      if (result && Array.isArray(result.list)) return result.list.map((item) => this.phraseText(item)).filter(Boolean)
      if (result && typeof result === 'object') return Object.values(result).map((item) => this.phraseText(item)).filter(Boolean)
      return []
    },
    phraseText(item) {
      if (!item) return ''
      if (typeof item === 'string') return item
      return item.content || item.phrase || item.name || ''
    },
    async loadContacts() {
      if (!this.customerId) return
      try {
        const result = await getContactsList({
          customer_id: this.customerId,
          page: 1,
          limit: 100
        }, { showError: false })
        this.contacts = this.normalizeList(result)
      } catch (error) {
        this.contacts = []
      }
    },
    normalizeList(result) {
      if (Array.isArray(result)) return result
      if (result && Array.isArray(result.list)) return result.list
      if (result && Array.isArray(result.data)) return result.data
      return []
    },
    normalizeContactId(value) {
      const text = String(value || '').trim()
      if (!text) return ''
      return text.split(',').map((item) => item.trim()).filter(Boolean).find((item) => /^\d+$/.test(item)) || ''
    },
    contactId(item = {}) {
      return this.normalizeContactId(item.contacts_id || item.contact_id || item.id || item.value)
    },
    contactName(item = {}) {
      return item.name || item.contacts_name || item.label || ''
    },
    handleContactChange(event) {
      const option = this.contactOptions[event.detail.value] || {}
      this.form.contacts_ids = option.contacts_id || ''
    },
    handleDateChange(event) {
      this.nextDate = event.detail.value
    },
    handleTimeChange(event) {
      this.nextTime = event.detail.value
    },
    openPhrase() {
      this.showPhrasePanel = true
    },
    usePhrase(text) {
      this.form.content = this.form.content ? `${this.form.content}\n${text}` : text
      this.showPhrasePanel = false
    },
    chooseImage() {
      uni.chooseImage({
        count: 6,
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
        count: 6,
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
          const uploaded = await this.uploadOneFile(file, type)
          if (uploaded && uploaded.file_id) {
            this.files.push(uploaded)
          }
        }
        uni.showToast({ title: '上传成功', icon: 'success' })
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
            type
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
                name: result.data.name || file.name || '附件'
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
    removeFile(file) {
      this.files = this.files.filter((item) => item.file_id !== file.file_id)
    },
    showRelatedInfo() {
      uni.showToast({ title: '当前对象已自动关联', icon: 'none' })
    },
    buildNextTime() {
      if (!this.nextDate) return ''
      return `${this.nextDate} ${this.nextTime || '09:00'}:00`
    },
    async submit() {
      if (!this.form.content.trim()) {
        uni.showToast({ title: '请填写跟进内容', icon: 'none' })
        return
      }
      if (!this.activityType || !this.activityTypeId) {
        uni.showToast({ title: '缺少跟进对象', icon: 'none' })
        return
      }
      if (this.loading) return
      this.loading = true
      try {
        const payload = {
          activity_type: this.activityType,
          activity_type_id: this.activityTypeId,
          content: this.form.content.trim(),
          is_event: 0
        }
        if (this.form.category) payload.category = this.form.category
        const contactId = this.normalizeContactId(this.form.contacts_ids)
        if (contactId) payload.contacts_ids = contactId
        if (this.files.length) payload.file_id = this.files.map((file) => file.file_id)
        const nextTime = this.buildNextTime()
        if (nextTime) payload.next_time = nextTime
        await createRecord(payload)
        uni.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 300)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.follow-page {
  min-height: 100vh;
  padding: 22rpx 20rpx 150rpx;
  background: var(--crm-page-bg);
}

.content-card,
.form-card,
.target-card {
  margin-bottom: 16rpx;
  border-radius: 12rpx;
  background: var(--crm-card-bg);
}

.content-card {
  position: relative;
  min-height: 340rpx;
  padding: 22rpx 22rpx 76rpx;
}

.field-title {
  display: flex;
  align-items: center;
  color: var(--crm-text);
  font-size: 28rpx;
  font-weight: 700;
}

.required {
  margin-right: 8rpx;
  color: #f04438;
}

.content-input {
  width: 100%;
  min-height: 210rpx;
  margin-top: 20rpx;
  color: var(--crm-text);
  font-size: 27rpx;
  line-height: 1.55;
}

.phrase-button {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  width: 112rpx;
  height: 64rpx;
  padding: 0;
  border-radius: 6rpx;
  background: var(--crm-primary);
  color: #ffffff;
  font-size: 26rpx;
  line-height: 64rpx;
}

.form-card {
  overflow: hidden;
}

.form-row {
  display: flex;
  min-height: 96rpx;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  border-bottom: 1rpx solid var(--crm-border);
  color: var(--crm-text);
  font-size: 28rpx;
}

.form-row:last-child {
  border-bottom: none;
}

.time-row {
  background: var(--crm-elevated-bg);
}

.row-value,
.tool-title {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.muted-value {
  color: var(--crm-text-muted);
  font-size: 25rpx;
}

.calendar-icon,
.tool-icon,
.plus-icon {
  color: var(--crm-primary);
  font-size: 28rpx;
}

.arrow {
  color: var(--crm-text-muted);
  font-size: 48rpx;
  line-height: 1;
}

.tool-row {
  min-height: 92rpx;
}

.tool-icon {
  width: 34rpx;
  color: var(--crm-text-muted);
  font-size: 25rpx;
}

.plus-icon {
  color: var(--crm-text-muted);
  font-size: 34rpx;
  font-weight: 700;
}

.target-card {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 22rpx 24rpx;
}

.target-label {
  color: var(--crm-text-muted);
  font-size: 23rpx;
}

.target-name {
  color: var(--crm-text);
  font-size: 27rpx;
  font-weight: 700;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.file-item .target-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file {
  flex-shrink: 0;
  color: #e05a47;
  font-size: 24rpx;
}

.input-mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  background: rgba(15, 23, 42, 0.32);
}

.input-panel {
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
  padding: 28rpx 24rpx calc(30rpx + env(safe-area-inset-bottom));
  border-radius: 28rpx 28rpx 0 0;
  background: var(--crm-card-bg);
}

.input-title {
  margin-bottom: 20rpx;
  color: var(--crm-text);
  font-size: 31rpx;
  font-weight: 700;
}

.category-input {
  height: 82rpx;
  padding: 0 20rpx;
  border-radius: 12rpx;
  background: var(--crm-page-bg);
  color: var(--crm-text);
  font-size: 27rpx;
}

.panel-button {
  height: 82rpx;
  margin-top: 22rpx;
  border-radius: 12rpx;
  background: var(--crm-primary);
  color: #ffffff;
  font-size: 28rpx;
  line-height: 82rpx;
}

.phrase-item {
  padding: 22rpx 0;
  border-bottom: 1rpx solid var(--crm-border);
  color: var(--crm-text);
  font-size: 27rpx;
  line-height: 1.5;
}

.empty-text {
  padding: 50rpx 0;
  color: var(--crm-text-muted);
  font-size: 26rpx;
  text-align: center;
}

.bottom-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -8rpx 24rpx rgba(23, 32, 51, 0.06);
}

.save-button {
  height: 82rpx;
  border-radius: 10rpx;
  background: var(--crm-primary);
  color: #ffffff;
  font-size: 29rpx;
  font-weight: 700;
  line-height: 82rpx;
}
</style>
