<template>
  <view v-if="hasFiles" class="follow-files">
    <view v-if="imageFiles.length" class="follow-images">
      <image
        v-for="(file, index) in imageFiles"
        :key="fileKey(file, index)"
        class="follow-image"
        :src="imageThumb(file)"
        mode="aspectFill"
        @click="previewImage(index)"
      />
    </view>
    <view v-if="attachmentFiles.length" class="follow-attachments">
      <view v-for="(file, index) in attachmentFiles" :key="fileKey(file, index)" class="follow-file" @click="openFile(file)">
        <text class="follow-file__icon">附</text>
        <text class="follow-file__name">{{ fileName(file) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { BASE_URL } from '../utils/config'

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']

export default {
  props: {
    record: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    imageFiles() {
      const images = [
        ...this.normalizeList(this.record.imgList),
        ...this.normalizeList(this.record.imageList),
        ...this.normalizeList(this.record.images),
        ...this.normalizeList(this.record.fileInfo),
        ...this.normalizeList(this.record.dataInfo && this.record.dataInfo.imgList),
        ...this.normalizeList(this.record.dataInfo && this.record.dataInfo.imageList),
        ...this.normalizeList(this.record.dataInfo && this.record.dataInfo.images),
        ...this.normalizeList(this.record.dataInfo && this.record.dataInfo.fileInfo)
      ]
      const fileImages = [
        ...this.normalizeList(this.record.fileList),
        ...this.normalizeList(this.record.files),
        ...this.normalizeList(this.record.dataInfo && this.record.dataInfo.fileList),
        ...this.normalizeList(this.record.dataInfo && this.record.dataInfo.files)
      ].filter((file) => this.isImageFile(file))
      return this.uniqueFiles([...images, ...fileImages])
        .filter((file) => this.fileUrl(file))
        .filter((file) => this.isImageFile(file))
    },
    attachmentFiles() {
      const files = [
        ...this.normalizeList(this.record.fileList),
        ...this.normalizeList(this.record.files),
        ...this.normalizeList(this.record.fileInfo),
        ...this.normalizeList(this.record.dataInfo && this.record.dataInfo.fileList),
        ...this.normalizeList(this.record.dataInfo && this.record.dataInfo.files),
        ...this.normalizeList(this.record.dataInfo && this.record.dataInfo.fileInfo)
      ]
      return this.uniqueFiles(files)
        .filter((file) => this.fileUrl(file))
        .filter((file) => !this.isImageFile(file) && file.types !== 'img')
    },
    hasFiles() {
      return this.imageFiles.length > 0 || this.attachmentFiles.length > 0
    },
    imageUrls() {
      return this.imageFiles.map((file) => this.fileUrl(file)).filter(Boolean)
    }
  },
  methods: {
    normalizeList(value) {
      if (!value) return []
      if (Array.isArray(value)) return value.filter(Boolean)
      if (typeof value === 'object') return [value]
      return []
    },
    uniqueFiles(files) {
      const seen = new Set()
      return files.filter((file, index) => {
        const key = this.fileKey(file, index)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    },
    fileKey(file, index) {
      if (typeof file === 'string') return file || index
      return file.file_id || file.id || file.save_name || file.file_path || file.full_path || file.path || file.url || index
    },
    fileName(file) {
      if (typeof file === 'string') return file.split('/').pop() || '附件'
      return file.name || file.file_name || file.save_name || '附件'
    },
    fileExt(file) {
      if (typeof file === 'string') {
        const match = file.toLowerCase().match(/\.([a-z0-9]+)(?:\?|#|$)/)
        return match ? match[1] : ''
      }
      const name = [
        file.ext,
        file.name,
        file.file_name,
        file.save_name,
        file.file_path,
        file.file_path_thumb,
        file.full_path,
        file.path,
        file.url
      ].filter(Boolean).join(' ')
      const match = String(name).toLowerCase().match(/\.([a-z0-9]+)(?:\?|#|$)/)
      return match ? match[1] : ''
    },
    isImageFile(file) {
      if (!file) return false
      if (file.types === 'img' || file.types === 'image') return true
      if (typeof file === 'object' && (file.file_path_thumb || file.thumb_path || file.thumb)) return true
      return IMAGE_EXTS.includes(this.fileExt(file))
    },
    resolveUrl(url) {
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
    fileUrl(file) {
      if (typeof file === 'string') return this.resolveUrl(file)
      return this.resolveUrl(file.file_path || file.full_path || file.path || file.url)
    },
    imageThumb(file) {
      if (typeof file === 'string') return this.resolveUrl(file)
      return this.resolveUrl(file.file_path_thumb || file.thumb_path || file.thumb || file.file_path || file.full_path || file.path || file.url)
    },
    previewImage(index) {
      if (!this.imageUrls.length) return
      uni.previewImage({
        urls: this.imageUrls,
        current: this.imageUrls[index] || this.imageUrls[0]
      })
    },
    openFile(file) {
      const url = this.fileUrl(file)
      if (!url) {
        uni.showToast({ title: '附件地址不存在', icon: 'none' })
        return
      }
      if (typeof window !== 'undefined') {
        window.open(url, '_blank')
        return
      }
      uni.downloadFile({
        url,
        success: (result) => {
          if (result.tempFilePath) {
            uni.openDocument({
              filePath: result.tempFilePath,
              fail: () => uni.showToast({ title: '附件暂无法预览', icon: 'none' })
            })
          }
        },
        fail: () => uni.showToast({ title: '附件下载失败', icon: 'none' })
      })
    }
  }
}
</script>

<style scoped>
.follow-files {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 8rpx;
}

.follow-images {
  display: grid;
  grid-template-columns: repeat(3, 128rpx);
  gap: 12rpx;
}

.follow-image {
  width: 128rpx;
  height: 128rpx;
  border-radius: 8rpx;
  background: var(--crm-soft-bg);
  border: 1rpx solid var(--crm-border);
}

.follow-attachments {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.follow-file {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-height: 54rpx;
  padding: 10rpx 14rpx;
  border-radius: 8rpx;
  background: var(--crm-soft-bg);
  border: 1rpx solid var(--crm-border);
}

.follow-file__icon {
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

.follow-file__name {
  flex: 1;
  min-width: 0;
  color: var(--crm-text);
  font-size: 24rpx;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
