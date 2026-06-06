<template>
  <view class="form-page">
    <view class="form-card">
      <view class="section-title">创建项目</view>
      <input v-model="form.name" class="form-input" placeholder="项目名称" />
      <textarea v-model="form.description" class="form-textarea" placeholder="项目描述" />
      <view class="cover-preview">
        <text>默认封面</text>
        <view class="cover-block"></view>
      </view>
      <button class="save-button" :loading="loading" @click="submit">保存项目</button>
    </view>
  </view>
</template>

<script>
import { createProject } from '../../api/work'
import { ensureLogin } from '../../utils/router'

export default {
  data() {
    return {
      loading: false,
      form: {
        name: '',
        description: ''
      }
    }
  },
  onLoad() {
    ensureLogin()
  },
  methods: {
    async submit() {
      if (!this.form.name.trim()) {
        uni.showToast({ title: '请填写项目名称', icon: 'none' })
        return
      }
      this.loading = true
      try {
        await createProject(this.form)
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
.form-page {
  min-height: 100vh;
  padding: 28rpx 20rpx;
  background-color: var(--crm-page-bg);
}

.form-card {
  padding: 26rpx;
  border-radius: 10rpx;
  background-color: #ffffff;
}

.section-title {
  margin-bottom: 24rpx;
  color: var(--crm-text);
  font-size: 32rpx;
  font-weight: 800;
}

.form-input,
.form-textarea {
  width: 100%;
  margin-bottom: 18rpx;
  padding: 0 22rpx;
  border-radius: 10rpx;
  background-color: var(--crm-page-bg);
  font-size: 27rpx;
}

.form-input {
  height: 86rpx;
}

.form-textarea {
  min-height: 220rpx;
  padding-top: 22rpx;
}

.cover-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
  color: #607086;
  font-size: 25rpx;
}

.cover-block {
  width: 180rpx;
  height: 86rpx;
  border-radius: 10rpx;
  background: linear-gradient(135deg, var(--crm-accent), var(--crm-primary-2));
}

.save-button {
  height: 88rpx;
  border-radius: 10rpx;
  background-color: var(--crm-primary);
  color: #ffffff;
  font-size: 29rpx;
  font-weight: 700;
}
</style>
