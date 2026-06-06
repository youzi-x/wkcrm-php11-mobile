<template>
  <view class="map-page">
    <view id="baidu-map-container" class="baidu-map"></view>

    <view v-if="mapStatus" class="map-status">{{ mapStatus }}</view>

    <view class="map-info">
      <view class="map-text">
        <text class="map-title">{{ target.title || '位置' }}</text>
        <text class="map-address">{{ target.address || coordinateText || '暂无地址' }}</text>
      </view>
      <button class="nav-button" @click="openNavigation">导航</button>
    </view>
  </view>
</template>

<script>
import { BAIDU_MAP_AK } from '../../utils/config'
import { buildNavigationUrl, MAP_OPTIONS, openUrl } from '../../utils/map'

function decodeParam(value) {
  if (value === undefined || value === null) return ''
  try {
    return decodeURIComponent(String(value))
  } catch (error) {
    return String(value)
  }
}

function numericParam(value) {
  if (value === undefined || value === null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function loadBaiduMap() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Baidu map only supports H5'))
  if (window.BMap) return Promise.resolve(window.BMap)
  if (window.__wkcrmBaiduMapPromise) return window.__wkcrmBaiduMapPromise

  window.__wkcrmBaiduMapPromise = new Promise((resolve, reject) => {
    const callback = `__wkcrmBaiduMapReady_${Date.now()}`
    const script = document.createElement('script')

    window[callback] = () => {
      delete window[callback]
      resolve(window.BMap)
    }

    script.src = `https://api.map.baidu.com/api?v=3.0&ak=${encodeURIComponent(BAIDU_MAP_AK)}&callback=${callback}`
    script.onerror = () => {
      delete window[callback]
      window.__wkcrmBaiduMapPromise = null
      reject(new Error('Baidu map script load failed'))
    }
    document.head.appendChild(script)
  })

  return window.__wkcrmBaiduMapPromise
}

export default {
  data() {
    return {
      target: {
        title: '',
        address: '',
        longitude: null,
        latitude: null,
        coordinateType: ''
      },
      mapStatus: '地图加载中...'
    }
  },
  computed: {
    coordinateText() {
      if (this.target.longitude === null || this.target.latitude === null) return ''
      return `${this.target.latitude}, ${this.target.longitude}`
    }
  },
  onLoad(options = {}) {
    this.target = {
      title: decodeParam(options.title) || '位置',
      address: decodeParam(options.address),
      longitude: numericParam(options.lng),
      latitude: numericParam(options.lat),
      coordinateType: decodeParam(options.coord)
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.renderMap()
    })
  },
  methods: {
    async renderMap() {
      try {
        const BMap = await loadBaiduMap()
        const container = document.getElementById('baidu-map-container')
        if (!container) return

        const map = new BMap.Map(container)
        map.enableScrollWheelZoom(true)

        if (this.target.longitude !== null && this.target.latitude !== null && (!this.target.address || this.target.coordinateType === 'baidu')) {
          this.showPoint(BMap, map, new BMap.Point(this.target.longitude, this.target.latitude))
          return
        }

        if (this.target.address) {
          this.geocodeAddress(BMap, map)
          return
        }

        if (this.target.longitude !== null && this.target.latitude !== null) {
          this.showPoint(BMap, map, new BMap.Point(this.target.longitude, this.target.latitude))
          return
        }

        this.mapStatus = '暂无可用定位'
      } catch (error) {
        this.mapStatus = '地图加载失败，可直接点击导航'
      }
    },
    geocodeAddress(BMap, map) {
      const geocoder = new BMap.Geocoder()
      geocoder.getPoint(this.target.address, (point) => {
        if (!point) {
          this.mapStatus = '地址解析失败，可直接点击导航'
          return
        }

        this.target.longitude = point.lng
        this.target.latitude = point.lat
        this.target.coordinateType = 'baidu'
        this.showPoint(BMap, map, point)
      })
    },
    showPoint(BMap, map, point) {
      map.clearOverlays()
      map.centerAndZoom(point, 16)
      map.addOverlay(new BMap.Marker(point))
      this.mapStatus = ''
    },
    openNavigation() {
      uni.showActionSheet({
        itemList: MAP_OPTIONS.map((item) => item.name),
        success: (event) => {
          const option = MAP_OPTIONS[event.tapIndex]
          if (!option) return
          openUrl(buildNavigationUrl(option.provider, this.target))
        }
      })
    }
  }
}
</script>

<style scoped>
.map-page {
  position: relative;
  min-height: 100vh;
  background: var(--crm-page-bg);
}

.baidu-map {
  width: 100%;
  height: 100vh;
}

.map-status {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  top: 32rpx;
  z-index: 3;
  padding: 18rpx 22rpx;
  border-radius: 8rpx;
  background: rgba(255, 255, 255, 0.92);
  color: var(--crm-text-muted);
  font-size: 24rpx;
  text-align: center;
}

.map-info {
  position: fixed;
  left: 22rpx;
  right: 22rpx;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 22rpx;
  border-radius: 10rpx;
  background: var(--crm-card-bg);
  box-shadow: 0 16rpx 38rpx rgba(17, 31, 54, 0.16);
}

.map-text {
  flex: 1;
  min-width: 0;
}

.map-title,
.map-address {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-title {
  color: var(--crm-text);
  font-size: 29rpx;
  font-weight: 800;
}

.map-address {
  margin-top: 8rpx;
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.nav-button {
  width: 132rpx;
  height: 72rpx;
  margin: 0;
  padding: 0;
  border-radius: 8rpx;
  background: var(--crm-primary);
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 72rpx;
}
</style>
