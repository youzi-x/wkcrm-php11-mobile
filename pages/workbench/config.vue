<template>
  <view class="config-page">
    <view class="section">
      <view class="section-title">
        <text class="section-title__main">{{ selectedTitle }}</text>
        <text class="section-title__tip">点击加减调整首页显示</text>
      </view>
      <view class="config-grid">
        <view v-for="item in selectedItems" :key="item.key" class="config-item" @click="removeItem(item)">
          <view class="config-icon" :style="{ background: item.color }">
            <text>{{ item.icon }}</text>
            <text class="config-mark is-remove">−</text>
          </view>
          <text class="config-text">{{ item.title }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">
        <text class="section-title__main">全部</text>
      </view>
      <view class="config-grid">
        <view v-for="item in unselectedItems" :key="item.key" class="config-item" @click="addItem(item)">
          <view class="config-icon" :style="{ background: item.color }">
            <text>{{ item.icon }}</text>
            <text class="config-mark is-add">＋</text>
          </view>
          <text class="config-text">{{ item.title }}</text>
        </view>
      </view>
    </view>

    <button class="save-button" @click="save">保存</button>
  </view>
</template>

<script>
import { commonFunctionOptions, quickActionOptions } from '../../utils/app-data'
import { getHomeConfig, saveHomeCommonKeys, saveHomeQuickKeys } from '../../utils/home-config'
import { ensureLogin } from '../../utils/router'

export default {
  data() {
    return {
      type: 'quick',
      selectedKeys: []
    }
  },
  computed: {
    isQuick() {
      return this.type === 'quick'
    },
    selectedTitle() {
      return this.isQuick ? '快捷入口' : '常用功能'
    },
    options() {
      return this.isQuick ? quickActionOptions : commonFunctionOptions
    },
    maxCount() {
      return this.isQuick ? 4 : 8
    },
    selectedItems() {
      return this.selectedKeys
        .map((key) => this.options.find((item) => item.key === key))
        .filter(Boolean)
    },
    unselectedItems() {
      return this.options.filter((item) => !this.selectedKeys.includes(item.key))
    }
  },
  onLoad(options) {
    if (!ensureLogin()) return
    this.type = options.type === 'common' ? 'common' : 'quick'
    const config = getHomeConfig()
    this.selectedKeys = this.isQuick ? [...config.quickKeys] : [...config.commonKeys]
    uni.setNavigationBarTitle({
      title: this.isQuick ? '快捷入口设置' : '常用功能设置'
    })
  },
  methods: {
    addItem(item) {
      if (this.selectedKeys.length >= this.maxCount) {
        uni.showToast({
          title: `最多选择${this.maxCount}个`,
          icon: 'none'
        })
        return
      }
      this.selectedKeys = [...this.selectedKeys, item.key]
    },
    removeItem(item) {
      if (this.selectedKeys.length <= 1) {
        uni.showToast({
          title: '至少保留1个入口',
          icon: 'none'
        })
        return
      }
      this.selectedKeys = this.selectedKeys.filter((key) => key !== item.key)
    },
    save() {
      if (this.isQuick) {
        saveHomeQuickKeys(this.selectedKeys)
      } else {
        saveHomeCommonKeys(this.selectedKeys)
      }
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 300)
    }
  }
}
</script>

<style scoped>
.config-page {
  min-height: 100vh;
  padding: 28rpx 24rpx 130rpx;
  background-color: var(--crm-page-bg);
}

.section {
  margin-bottom: 36rpx;
}

.section-title {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  margin-bottom: 22rpx;
}

.section-title__main {
  color: #102039;
  font-size: 30rpx;
  font-weight: 700;
}

.section-title__tip {
  margin-left: 10rpx;
  color: #718096;
  font-size: 23rpx;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22rpx 18rpx;
}

.config-item {
  height: 126rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  background-color: #ffffff;
  box-shadow: 0 8rpx 18rpx rgba(29, 82, 150, 0.08);
}

.config-icon {
  position: relative;
  width: 54rpx;
  height: 54rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
}

.config-mark {
  position: absolute;
  right: -14rpx;
  top: -14rpx;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  color: #ffffff;
  font-size: 22rpx;
  line-height: 30rpx;
  text-align: center;
}

.config-mark.is-remove {
  background-color: #a8afb9;
}

.config-mark.is-add {
  background-color: var(--crm-primary);
}

.config-text {
  margin-top: 13rpx;
  color: #102039;
  font-size: 23rpx;
}

.save-button {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(26rpx + env(safe-area-inset-bottom));
  height: 80rpx;
  border-radius: 10rpx;
  background-color: var(--crm-primary);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
}
</style>
