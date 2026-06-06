<template>
  <view class="preview-page">
    <view class="preview-nav">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">附件预览</text>
      <text class="nav-spacer"></text>
    </view>

    <view class="file-title-wrap">
      <text class="file-title">{{ name || '附件' }}</text>
      <text class="file-subtitle">{{ previewTips }}</text>
    </view>

    <!-- #ifdef H5 -->
    <iframe v-if="viewerUrl" class="h5-frame" :src="viewerUrl" frameborder="0"></iframe>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <web-view v-if="viewerUrl" :src="viewerUrl"></web-view>
    <!-- #endif -->

    <view v-if="isOffice" class="office-tips">
      <text class="office-title">Office 文件预览说明</text>
      <text class="office-desc">{{ officeMessage }}</text>
      <text class="office-link" @click="openRawFile">浏览器打开原文件</text>
    </view>

    <scroll-view v-if="!viewerUrl" scroll-y class="content-scroll">
      <text v-if="loading" class="loading-text">正在加载...</text>
      <text v-else class="content-text">{{ content || '暂无内容' }}</text>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      url: '',
      name: '',
      ext: '',
      fileId: '',
      taskId: '',
      workId: '',
      loading: false,
      content: ''
    }
  },
  computed: {
    fileExt() {
      return (this.ext || this.getExt(this.name) || this.getExt(this.url)).toLowerCase()
    },
    isText() {
      return ['txt', 'csv', 'md', 'log', 'json', 'xml', 'html', 'css', 'js'].includes(this.fileExt)
    },
    isPdf() {
      return this.fileExt === 'pdf'
    },
    isOffice() {
      return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(this.fileExt)
    },
    viewerUrl() {
      if (!this.url) return ''
      if (this.isPdf) return this.url
      if (this.isOffice) {
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(this.url)}`
      }
      return ''
    },
    previewTips() {
      if (this.isOffice) return 'Office 文件预览'
      if (this.isPdf) return 'PDF 文件预览'
      return '文本预览'
    },
    officeMessage() {
      return '当前页面只保留预览和原文件打开能力；内网地址可能无法被 Office 在线预览服务访问。'
    }
  },
  onLoad(options) {
    this.url = decodeURIComponent(options.url || '')
    this.name = decodeURIComponent(options.name || '')
    this.ext = decodeURIComponent(options.ext || '')
    this.fileId = options.file_id || ''
    this.taskId = options.task_id || ''
    this.workId = options.work_id || ''
    if (!this.viewerUrl) {
      this.loadContent()
    }
  },
  methods: {
    getExt(value) {
      const clean = String(value || '').split(/[?#]/)[0].toLowerCase()
      const name = clean.split('/').pop() || ''
      const index = name.lastIndexOf('.')
      return index >= 0 ? name.slice(index + 1) : ''
    },
    loadContent() {
      if (!this.url) {
        this.content = '附件地址不存在'
        return
      }
      if (!this.isText && this.fileExt) {
        this.content = '当前文件类型暂不支持文本预览，请使用上方预览或浏览器打开原文件。'
        return
      }
      this.loading = true
      uni.request({
        url: this.url,
        method: 'GET',
        responseType: 'text',
        success: (response) => {
          this.content = typeof response.data === 'string'
            ? response.data
            : JSON.stringify(response.data || '', null, 2)
        },
        fail: () => {
          this.content = '文件加载失败，请返回任务详情后重试。'
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    openRawFile() {
      // #ifdef H5
      window.open(this.url, '_blank')
      // #endif
      // #ifndef H5
      uni.showToast({ title: '请下载后查看原文件', icon: 'none' })
      // #endif
    },
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
        return
      }
      if (this.taskId) {
        uni.redirectTo({
          url: `/pages/project/task-detail?id=${this.taskId}&work_id=${this.workId}`
        })
        return
      }
      uni.redirectTo({ url: '/pages/project/index' })
    }
  }
}
</script>

<style scoped>
.preview-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--crm-card-bg);
}

.preview-nav {
  height: calc(88rpx + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  padding: env(safe-area-inset-top) 24rpx 0;
  background-color: var(--crm-primary);
  color: #ffffff;
}

.back-btn {
  width: 72rpx;
  font-size: 52rpx;
  line-height: 1;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 800;
}

.nav-spacer {
  width: 72rpx;
}

.file-title-wrap {
  padding: 24rpx 28rpx 18rpx;
  border-bottom: 1rpx solid var(--crm-border);
}

.file-title {
  display: block;
  overflow: hidden;
  color: var(--crm-text);
  font-size: 30rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-subtitle {
  display: block;
  margin-top: 8rpx;
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.h5-frame {
  width: 100%;
  height: 58vh;
  display: block;
  border: 0;
  background-color: #ffffff;
}

.office-tips {
  margin: 22rpx 24rpx 0;
  padding: 22rpx;
  border-radius: 18rpx;
  background-color: var(--crm-input-bg);
}

.office-title {
  display: block;
  color: var(--crm-text);
  font-size: 28rpx;
  font-weight: 800;
}

.office-desc {
  display: block;
  margin-top: 10rpx;
  color: var(--crm-text-muted);
  font-size: 25rpx;
  line-height: 1.55;
}

.office-link {
  display: inline-block;
  margin-top: 16rpx;
  color: var(--crm-primary);
  font-size: 26rpx;
  font-weight: 700;
}

.content-scroll {
  flex: 1;
  height: calc(100vh - 190rpx);
  padding: 28rpx;
  box-sizing: border-box;
}

.content-text,
.loading-text {
  color: var(--crm-text);
  font-size: 34rpx;
  line-height: 1.85;
  white-space: pre-wrap;
  word-break: break-word;
}

.loading-text {
  color: var(--crm-text-muted);
}
</style>
