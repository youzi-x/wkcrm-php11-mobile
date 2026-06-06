<template>
  <view class="login-page">
    <view class="login-hero">
      <text class="login-hero__badge">{{ appName }}</text>
      <text class="login-hero__title">移动 CRM 工作台</text>
      <text class="login-hero__desc">随时查看客户、跟进与待办，快速处理日常销售工作。</text>
    </view>

    <view class="login-card panel-card">
      <view class="login-card__title">账号登录</view>
      <input v-model="form.username" class="login-input" placeholder="请输入账号" />
      <input v-model="form.password" class="login-input" password placeholder="请输入密码" />
      <input v-if="needVerify" v-model="form.verifyCode" class="login-input" placeholder="请输入验证码" />
      <button class="btn-primary login-button" :loading="loading" @click="handleLogin">登录系统</button>
      <text class="login-tip">请输入账号密码登录，进入手机工作台。</text>
    </view>
  </view>
</template>

<script>
import { login } from '../../api/auth'
import { useStore } from '../../store'
import { reLaunchPage } from '../../utils/router'
import { applyCachedSystemTitle, getSystemName, loadSystemConfig } from '../../utils/system'

export default {
  data() {
    return {
      appName: getSystemName(),
      loading: false,
      needVerify: false,
      form: {
        username: '',
        password: '',
        verifyCode: ''
      }
    }
  },
  onLoad() {
    this.refreshSystemName()
    const store = useStore()
    if (store.isAuthed()) {
      reLaunchPage('/pages/workbench/index')
    }
  },
  methods: {
    async refreshSystemName() {
      this.appName = applyCachedSystemTitle()
      const config = await loadSystemConfig({ force: true })
      this.appName = getSystemName(config)
    },
    async handleLogin() {
      if (!this.form.username || !this.form.password) {
        uni.showToast({ title: '请输入账号和密码', icon: 'none' })
        return
      }

      this.loading = true
      try {
        const data = await login(this.form)
        useStore().setLogin(data)
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          reLaunchPage('/pages/workbench/index')
        }, 200)
      } catch (error) {
        const message = error && (error.error || error.msg || '')
        if (message.includes('验证码')) {
          this.needVerify = true
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: calc(96rpx + env(safe-area-inset-top)) 32rpx 40rpx;
  background:
    radial-gradient(circle at top right, rgba(84, 142, 255, 0.35), transparent 28%),
    radial-gradient(circle at left bottom, rgba(40, 110, 230, 0.18), transparent 32%),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
}

.login-hero {
  padding: 20rpx 8rpx 40rpx;
}

.login-hero__badge {
  display: inline-block;
  max-width: 100%;
  min-height: 46rpx;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(47, 106, 229, 0.12);
  color: var(--crm-primary);
  font-size: 22rpx;
  line-height: 1.4;
  margin-bottom: 28rpx;
  white-space: normal;
  word-break: break-all;
}

.login-hero__title {
  display: block;
  font-size: 54rpx;
  line-height: 1.2;
  font-weight: 700;
  color: #1c2d47;
}

.login-hero__desc {
  display: block;
  margin-top: 18rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #71829b;
}

.login-card {
  padding: 34rpx 30rpx 30rpx;
}

.login-card__title {
  font-size: 34rpx;
  font-weight: 600;
  color: #20304a;
  margin-bottom: 28rpx;
}

.login-input {
  width: 100%;
  height: 96rpx;
  margin-bottom: 20rpx;
  padding: 0 26rpx;
  border-radius: 22rpx;
  background: #f6f9ff;
  border: 2rpx solid rgba(47, 106, 229, 0.08);
  font-size: 28rpx;
}

.login-button {
  width: 100%;
  margin-top: 10rpx;
}

.login-tip {
  display: block;
  margin-top: 22rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: #8c99aa;
}
</style>
