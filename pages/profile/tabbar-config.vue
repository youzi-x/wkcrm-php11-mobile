<template>
  <view class="nav-config-page">
    <view class="section">
      <view class="section-title">
        <text class="section-title__main">个性化导航栏设置</text>
        <text class="section-title__tip">点击调整顺序或移除</text>
      </view>
      <view class="config-grid">
        <view v-for="(item, index) in selectedItems" :key="item.key" class="config-item" @click="editSelectedItem(item, index)">
          <view class="config-icon" :style="{ background: item.color }">
            <text>{{ item.icon }}</text>
            <text v-if="!item.required" class="config-mark is-remove">−</text>
          </view>
          <text class="config-text">{{ item.title || item.text }}</text>
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
          <text class="config-text">{{ item.title || item.text }}</text>
        </view>
      </view>
    </view>

    <button class="save-button" @click="save">保存</button>
  </view>
</template>

<script>
import { tabbarOptions } from '../../utils/app-data'
import { getTabbarKeys, saveTabbarKeys } from '../../utils/tabbar-config'
import { ensureLogin } from '../../utils/router'

export default {
  data() {
    return {
      selectedKeys: []
    }
  },
  computed: {
    selectedItems() {
      return this.selectedKeys
        .map((key) => tabbarOptions.find((item) => item.key === key))
        .filter(Boolean)
    },
    unselectedItems() {
      return tabbarOptions.filter((item) => !this.selectedKeys.includes(item.key))
    }
  },
  onLoad() {
    if (!ensureLogin()) return
    this.selectedKeys = getTabbarKeys()
  },
  methods: {
    addItem(item) {
      if (this.selectedKeys.length >= 5) {
        uni.showToast({ title: '最多显示5个栏目', icon: 'none' })
        return
      }
      this.selectedKeys = [...this.selectedKeys, item.key]
    },
    editSelectedItem(item, index) {
      const actions = ['上移', '下移']
      if (!item.required) actions.push('移除')
      uni.showActionSheet({
        itemList: actions,
        success: (event) => {
          const action = actions[event.tapIndex]
          if (action === '上移') this.moveItem(index, -1)
          if (action === '下移') this.moveItem(index, 1)
          if (action === '移除') this.removeItem(item)
        }
      })
    },
    moveItem(index, offset) {
      const targetIndex = index + offset
      if (targetIndex < 0 || targetIndex >= this.selectedKeys.length) return
      const nextKeys = [...this.selectedKeys]
      const current = nextKeys[index]
      nextKeys[index] = nextKeys[targetIndex]
      nextKeys[targetIndex] = current
      this.selectedKeys = nextKeys
    },
    removeItem(item) {
      if (item.required) {
        uni.showToast({ title: `${item.title}不可移除`, icon: 'none' })
        return
      }
      if (this.selectedKeys.length <= 3) {
        uni.showToast({ title: '至少保留3个栏目', icon: 'none' })
        return
      }
      this.selectedKeys = this.selectedKeys.filter((key) => key !== item.key)
    },
    save() {
      saveTabbarKeys(this.selectedKeys)
      uni.$emit('tabbar-config-updated')
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 300)
    }
  }
}
</script>

<style scoped>
.nav-config-page {
  min-height: 100vh;
  padding: 28rpx 24rpx 130rpx;
  background-color: var(--crm-page-bg);
}

.section {
  margin-bottom: 38rpx;
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
