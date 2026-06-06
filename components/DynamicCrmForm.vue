<template>
  <view class="dynamic-form-page">
    <view class="form-head">
      <text class="form-title">{{ title }}</text>
      <text class="form-sub">字段来自官方配置，支持后台自定义字段</text>
    </view>

    <view class="form-card">
      <view v-if="fieldLoading" class="loading-box">字段加载中...</view>

      <view v-for="field in visibleFields" :key="field.field" class="form-item">
        <view class="field-label">
          <text>{{ field.name }}</text>
          <text v-if="isRequired(field)" class="required">*</text>
        </view>

        <textarea
          v-if="field.form_type === 'textarea'"
          v-model="form[field.field]"
          class="form-textarea"
          :placeholder="placeholder(field)"
        />

        <view
          v-else-if="isCustomerField(field)"
          class="form-picker relation-picker"
          :class="{ 'is-placeholder': !displayValue(field) }"
          @click="openCustomerSelector(field)"
        >
          <text class="picker-value">{{ displayValue(field) || '搜索选择客户' }}</text>
          <text class="picker-action">搜索</text>
        </view>

        <picker
          v-else-if="isOptionField(field)"
          mode="selector"
          :range="optionLabels(field)"
          @change="handleOptionChange(field, $event)"
        >
          <view class="form-picker" :class="{ 'is-placeholder': !displayValue(field) }">
            {{ displayValue(field) || placeholder(field) }}
          </view>
        </picker>

        <view v-else-if="field.form_type === 'checkbox'" class="checkbox-group">
          <view
            v-for="item in optionLabels(field)"
            :key="item"
            class="checkbox-chip"
            :class="{ 'is-active': checkboxChecked(field, item) }"
            @click="toggleCheckbox(field, item)"
          >
            {{ item }}
          </view>
          <text v-if="!optionLabels(field).length" class="unsupported-text">暂无可选项</text>
        </view>

        <picker
          v-else-if="isSingleUserField(field)"
          mode="selector"
          :range="optionLabels(field)"
          @change="handleSinglePickerChange(field, $event)"
        >
          <view class="form-picker" :class="{ 'is-placeholder': !displayValue(field) }">
            {{ displayValue(field) || placeholder(field) }}
          </view>
        </picker>

        <view v-else-if="isMultiUserField(field) || isStructureField(field)" class="multi-select">
          <view
            v-for="item in optionObjects(field)"
            :key="optionKey(field, item)"
            class="checkbox-chip"
            :class="{ 'is-active': multiChecked(field, item) }"
            @click="toggleMulti(field, item)"
          >
            {{ optionName(item) }}
          </view>
          <text v-if="!optionObjects(field).length" class="unsupported-text">暂无可选项</text>
        </view>

        <picker
          v-else-if="isDateField(field)"
          mode="date"
          :value="form[field.field] || ''"
          @change="handleDateChange(field, $event)"
        >
          <view class="form-picker" :class="{ 'is-placeholder': !form[field.field] }">
            {{ form[field.field] || placeholder(field) }}
          </view>
        </picker>

        <switch
          v-else-if="field.form_type === 'boolean_value'"
          :checked="form[field.field] === '1' || form[field.field] === 1 || form[field.field] === true"
          color="var(--crm-primary)"
          @change="handleBooleanChange(field, $event)"
        />

        <input
          v-else
          v-model="form[field.field]"
          class="form-input"
          :type="inputType(field)"
          :placeholder="placeholder(field)"
        />
      </view>

      <view v-if="unsupportedFields.length" class="unsupported-box">
        <text>以下复杂字段移动端暂不支持录入：{{ unsupportedFields.map((item) => item.name).join('、') }}</text>
      </view>

      <button class="save-button" :loading="loading || fieldLoading" @click="submit">{{ submitText }}</button>
    </view>

    <view v-if="customerSelector.visible" class="selector-mask" @click="closeCustomerSelector">
      <view class="selector-panel" @click.stop>
        <view class="selector-head">
          <text class="selector-cancel" @click="closeCustomerSelector">取消</text>
          <text class="selector-title">选择客户</text>
          <text class="selector-done" @click="searchCustomers">搜索</text>
        </view>

        <view class="selector-search">
          <input
            v-model="customerSelector.keyword"
            class="selector-input"
            placeholder="请输入客户名称/手机/电话"
            confirm-type="search"
            focus
            @confirm="searchCustomers"
          />
          <text class="selector-search-btn" @click="searchCustomers">搜索</text>
        </view>

        <scroll-view scroll-y class="selector-list" @scrolltolower="loadMoreCustomers">
          <view
            v-for="item in customerSelector.list"
            :key="item.customer_id"
            class="selector-row"
            @click="selectCustomer(item)"
          >
            <text class="selector-row-title">{{ item.name || '未命名客户' }}</text>
            <text class="selector-row-desc">负责人：{{ item.owner_user_name || 'admin' }}</text>
            <text class="selector-row-desc">手机/电话：{{ item.mobile || item.telephone || '--' }}</text>
          </view>
          <view v-if="customerSelector.loading" class="selector-empty">加载中...</view>
          <view v-else-if="customerSelector.searched && !customerSelector.list.length" class="selector-empty">没有找到客户</view>
          <view v-else-if="!customerSelector.searched && !customerSelector.list.length" class="selector-empty">请输入关键词搜索客户</view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAuth } from '../utils/storage'
import {
  getBusinessList,
  getContactsList,
  getContractList,
  getCustomerList,
  getModuleFields,
  getStructureList,
  getUserList
} from '../api/crm'

const UNSUPPORTED_TYPES = [
  'file',
  'pic',
  'product',
  'detail_table',
  'handwriting_sign',
  'desc_text',
  'position',
  'location',
  'date_interval',
  'map_address'
]

export default {
  props: {
    title: {
      type: String,
      default: '新增'
    },
    submitText: {
      type: String,
      default: '保存'
    },
    types: {
      type: String,
      required: true
    },
    controller: {
      type: String,
      required: true
    },
    initialValues: {
      type: Object,
      default: () => ({})
    },
    submitHandler: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      fields: [],
      form: {},
      labels: {},
      businesses: [],
      contacts: [],
      contracts: [],
      customers: [],
      users: [],
      structures: [],
      loading: false,
      fieldLoading: false,
      businessStatusOptions: [],
      customerSelector: {
        visible: false,
        field: null,
        keyword: '',
        list: [],
        page: 1,
        loading: false,
        searched: false,
        finished: false
      }
    }
  },
  computed: {
    flatFields() {
      return this.flattenFields(this.fields)
    },
    visibleFields() {
      return this.flatFields.filter((item) => item && item.field && item.name && !this.isUnsupported(item))
    },
    unsupportedFields() {
      return this.flatFields.filter((item) => item && item.field && item.name && this.isUnsupported(item))
    }
  },
  async mounted() {
    await this.loadFields()
  },
  methods: {
    async loadFields() {
      this.fieldLoading = true
      try {
        this.fields = await getModuleFields({
          module: 'crm',
          controller: this.controller,
          action: 'save',
          types: this.types,
          format: 2,
          system: 0
        }) || []
        await Promise.all([
          this.loadCustomersIfNeeded(),
          this.loadUsersIfNeeded(),
          this.loadStructuresIfNeeded(),
          this.loadCrmRelationsIfNeeded()
        ])
        this.initForm()
      } finally {
        this.fieldLoading = false
      }
    },
    async loadCustomersIfNeeded() {
      const needsCustomer = this.hasFieldType('customer') || this.flatFields.some((item) => item.field === 'customer_id')
      if (!needsCustomer && !['crm_contacts', 'crm_business'].includes(this.types)) return
      const result = await getCustomerList({ page: 1, limit: 20 })
      this.customers = result.list || []
    },
    async loadUsersIfNeeded() {
      if (!this.hasFieldType(['user', 'single_user'])) return
      const result = await getUserList({ page: 1, limit: 500, status: 1 })
      this.users = result.list || []
    },
    async loadStructuresIfNeeded() {
      if (!this.hasFieldType('structure')) return
      const result = await getStructureList({ type: 1 })
      this.structures = this.flattenStructures(result || [])
    },
    async loadCrmRelationsIfNeeded() {
      await Promise.all([
        this.hasFieldType('business') ? getBusinessList({ page: 1, limit: 100 }).then((res) => { this.businesses = res.list || [] }) : Promise.resolve(),
        (this.hasFieldType('contacts') || this.flatFields.some((item) => item.field === 'contacts_id')) ? getContactsList({ page: 1, limit: 100 }).then((res) => { this.contacts = res.list || [] }) : Promise.resolve(),
        this.hasFieldType('contract') ? getContractList({ page: 1, limit: 100 }).then((res) => { this.contracts = res.list || [] }) : Promise.resolve()
      ])
    },
    hasFieldType(types) {
      const typeList = Array.isArray(types) ? types : [types]
      return this.flatFields.some((field) => typeList.includes(field.form_type))
    },
    flattenFields(fields) {
      if (!Array.isArray(fields)) return []
      return fields.reduce((list, item) => {
        if (Array.isArray(item)) return list.concat(this.flattenFields(item))
        return list.concat(item)
      }, [])
    },
    flattenStructures(list = [], level = 0) {
      if (!Array.isArray(list)) return []
      return list.reduce((items, item) => {
        const children = item.child || item.children || []
        const name = `${'  '.repeat(level)}${item.name || item.title || ''}`
        return items
          .concat({
            ...item,
            name
          })
          .concat(this.flattenStructures(children, level + 1))
      }, [])
    },
    initForm() {
      const nextForm = { ...this.initialValues }
      const nextLabels = {}
      this.visibleFields.forEach((field) => {
        if (nextForm[field.field] === undefined) {
          nextForm[field.field] = this.defaultValue(field)
        }
        nextForm[field.field] = this.normalizeFieldValue(field, nextForm[field.field])
        if (this.isCustomerField(field) && nextForm[field.field]) {
          const current = this.customers.find((item) => String(item.customer_id) === String(nextForm[field.field]))
          nextLabels[field.field] = current ? current.name : (this.initialValues.customer_name || '')
        }
        if (field.form_type === 'business_type' && nextForm[field.field]) {
          this.refreshBusinessStatuses(field, nextForm[field.field])
        }
        this.syncPickerLabel(field, nextForm, nextLabels)
      })
      this.form = nextForm
      this.labels = nextLabels
      this.ensureDefaultRelations()
    },
    ensureDefaultRelations() {
      const typeField = this.visibleFields.find((item) => item.form_type === 'business_type')
      if (typeField && !this.form[typeField.field] && this.optionObjects(typeField).length) {
        this.setBusinessType(typeField, this.optionObjects(typeField)[0])
      }
      const ownerField = this.visibleFields.find((item) => item.field === 'owner_user_id')
      const currentUser = this.currentUser()
      if (ownerField && !this.form[ownerField.field] && currentUser.id) {
        this.setSingleValue(ownerField, currentUser)
      }
    },
    defaultValue(field) {
      if (field.default_value !== undefined && field.default_value !== null && field.default_value !== '') {
        return field.default_value
      }
      if (field.form_type === 'checkbox') return []
      if (this.isMultiUserField(field) || this.isStructureField(field)) return []
      if (field.form_type === 'boolean_value') return '0'
      return ''
    },
    normalizeFieldValue(field, value) {
      if (this.isMultiUserField(field) || this.isStructureField(field) || field.form_type === 'checkbox') {
        if (Array.isArray(value)) return value
        if (value === undefined || value === null || value === '') return []
        if (typeof value === 'string' && value.includes(',')) {
          return value.split(',').filter(Boolean)
        }
        return [value]
      }
      if (this.isSingleUserField(field) && typeof value === 'string' && value.includes(',')) {
        return value.split(',').filter(Boolean)[0] || ''
      }
      return value
    },
    isRequired(field) {
      return Number(field.is_null || field.isNull || 0) === 1
    },
    isUnsupported(field) {
      if (UNSUPPORTED_TYPES.includes(field.form_type)) return true
      if (field.field === 'customer_address') return true
      return false
    },
    isCustomerField(field) {
      return field.form_type === 'customer' || field.field === 'customer_id'
    },
    isOptionField(field) {
      return ['select', 'radio', 'customer', 'business', 'contacts', 'contract', 'business_type', 'business_status', 'module'].includes(field.form_type) || ['customer_id', 'contacts_id'].includes(field.field)
    },
    isSingleUserField(field) {
      return field.form_type === 'single_user' || (field.form_type === 'user' && ['owner_user_id', 'create_user_id', 'before_owner_user_id'].includes(field.field))
    },
    isMultiUserField(field) {
      return field.form_type === 'user' && !this.isSingleUserField(field)
    },
    isStructureField(field) {
      return field.form_type === 'structure'
    },
    isDateField(field) {
      return ['date', 'datetime'].includes(field.form_type)
    },
    inputType(field) {
      if (['number', 'floatnumber', 'percent'].includes(field.form_type)) return 'digit'
      if (field.form_type === 'mobile') return 'number'
      return 'text'
    },
    placeholder(field) {
      return field.input_tips || `请输入${field.name}`
    },
    optionObjects(field) {
      if (this.isCustomerField(field)) return this.customers
      if (field.form_type === 'contacts' || field.field === 'contacts_id') return this.contacts
      if (field.form_type === 'business') return this.businesses
      if (field.form_type === 'contacts') return this.contacts
      if (field.form_type === 'contract') return this.contracts
      if (field.form_type === 'business_status') return this.businessStatusOptions
      if (field.form_type === 'user' || field.form_type === 'single_user') return this.users
      if (field.form_type === 'structure') return this.structures
      return Array.isArray(field.setting) ? field.setting : []
    },
    optionLabels(field) {
      return this.optionObjects(field).map((item) => {
        if (typeof item === 'string') return item
        return this.optionName(item)
      }).filter(Boolean)
    },
    displayValue(field) {
      if (this.labels[field.field]) return this.labels[field.field]
      const value = this.form[field.field]
      if (Array.isArray(value)) {
        return value.map((id) => this.optionName(this.findOption(field, id)) || id).filter(Boolean).join('、')
      }
      return value
    },
    optionName(item) {
      if (!item) return ''
      if (typeof item === 'string') return item
      return item.name || item.realname || item.label || item.username || item.num || ''
    },
    optionValue(field, item) {
      if (!item || typeof item === 'string') return item
      if (this.isCustomerField(field)) return item.customer_id || ''
      if (field.form_type === 'contacts' || field.field === 'contacts_id') return item.contacts_id || ''
      if (field.form_type === 'user' || field.form_type === 'single_user') return item.id || item.user_id || ''
      if (field.form_type === 'structure') return item.id || item.structure_id || ''
      if (field.form_type === 'business') return item.business_id || ''
      if (field.form_type === 'contacts') return item.contacts_id || ''
      if (field.form_type === 'contract') return item.contract_id || ''
      return item.value || item.id || item.name || ''
    },
    optionKey(field, item) {
      return `${field.field}-${this.optionValue(field, item)}`
    },
    findOption(field, value) {
      return this.optionObjects(field).find((item) => String(this.optionValue(field, item)) === String(value))
    },
    openCustomerSelector(field) {
      const list = this.customers.slice(0, 20)
      this.customerSelector = {
        visible: true,
        field,
        keyword: '',
        list,
        page: list.length ? 2 : 1,
        loading: false,
        searched: Boolean(list.length),
        finished: list.length > 0 && list.length < 20
      }
      if (!list.length) {
        this.loadCustomerOptions({ reset: true })
      }
    },
    closeCustomerSelector() {
      this.customerSelector = {
        ...this.customerSelector,
        visible: false,
        field: null
      }
    },
    searchCustomers() {
      this.loadCustomerOptions({ reset: true })
    },
    loadMoreCustomers() {
      this.loadCustomerOptions()
    },
    async loadCustomerOptions({ reset = false } = {}) {
      if (this.customerSelector.loading) return
      if (reset) {
        this.customerSelector.page = 1
        this.customerSelector.finished = false
        this.customerSelector.list = []
      }
      if (this.customerSelector.finished) return
      this.customerSelector.loading = true
      const keyword = this.customerSelector.keyword.trim()
      try {
        const result = await getCustomerList({
          page: this.customerSelector.page,
          limit: 20,
          ...(keyword ? { search: keyword } : {})
        })
        const list = result.list || []
        this.customerSelector.list = reset
          ? list
          : this.mergeCustomers(this.customerSelector.list, list)
        this.customerSelector.page += 1
        this.customerSelector.finished = list.length < 20
        this.customerSelector.searched = true
        this.customers = this.mergeCustomers(this.customers, list)
      } catch (error) {
        uni.showToast({ title: '客户加载失败', icon: 'none' })
      } finally {
        this.customerSelector.loading = false
      }
    },
    mergeCustomers(origin = [], next = []) {
      const map = new Map()
      origin.concat(next).forEach((item) => {
        if (!item || !item.customer_id) return
        map.set(String(item.customer_id), item)
      })
      return Array.from(map.values())
    },
    selectCustomer(customer) {
      const field = this.customerSelector.field
      if (!field || !customer) return
      this.setCustomer(field, customer)
      this.closeCustomerSelector()
    },
    currentUser() {
      const auth = getAuth()
      return auth.userInfo || {}
    },
    syncPickerLabel(field, source, target) {
      if (!this.isSingleUserField(field)) return
      const value = source[field.field]
      if (!value) return
      const option = this.findOption(field, value)
      target[field.field] = this.optionName(option) || ''
    },
    handleOptionChange(field, event) {
      const index = Number(event.detail.value || 0)
      const option = this.optionObjects(field)[index]
      if (!option) return
      if (this.isCustomerField(field)) {
        this.setCustomer(field, option)
        return
      }
      if (field.form_type === 'business_type') {
        this.setBusinessType(field, option)
        return
      }
      if (field.form_type === 'business_status') {
        this.form[field.field] = option.status_id || option.value || option
        this.labels[field.field] = option.name || option.label || String(option)
        return
      }
      if (['business', 'contacts', 'contract'].includes(field.form_type)) {
        this.form[field.field] = this.optionValue(field, option)
        this.labels[field.field] = this.optionName(option)
        return
      }
      this.form[field.field] = typeof option === 'string' ? option : (option.value || option.name || '')
      this.labels[field.field] = typeof option === 'string' ? option : (option.name || option.label || '')
    },
    handleSinglePickerChange(field, event) {
      const index = Number(event.detail.value || 0)
      const option = this.optionObjects(field)[index]
      this.setSingleValue(field, option)
    },
    setSingleValue(field, option = {}) {
      const value = this.optionValue(field, option)
      this.form[field.field] = value || ''
      this.labels[field.field] = this.optionName(option)
    },
    multiChecked(field, item) {
      const value = this.optionValue(field, item)
      return Array.isArray(this.form[field.field]) && this.form[field.field].some((id) => String(id) === String(value))
    },
    toggleMulti(field, item) {
      const value = this.optionValue(field, item)
      if (!value) return
      const values = Array.isArray(this.form[field.field]) ? [...this.form[field.field]] : []
      const index = values.findIndex((id) => String(id) === String(value))
      if (index >= 0) values.splice(index, 1)
      else values.push(value)
      this.form[field.field] = values
      this.labels[field.field] = values.map((id) => this.optionName(this.findOption(field, id))).filter(Boolean).join('、')
    },
    setCustomer(field, customer = {}) {
      this.form[field.field] = customer.customer_id || ''
      this.form.customer_id = customer.customer_id || ''
      this.form.customer_name = customer.name || ''
      this.labels[field.field] = customer.name || ''
    },
    setBusinessType(field, type = {}) {
      this.form[field.field] = type.type_id || ''
      this.labels[field.field] = type.name || ''
      this.refreshBusinessStatuses(field, type.type_id)
      const statusField = this.visibleFields.find((item) => item.form_type === 'business_status')
      if (statusField && this.businessStatusOptions.length) {
        this.handleOptionChange(statusField, { detail: { value: 0 } })
      }
    },
    refreshBusinessStatuses(field, typeId) {
      const current = this.optionObjects(field).find((item) => String(item.type_id) === String(typeId))
      this.businessStatusOptions = current && Array.isArray(current.statusList) ? current.statusList : []
    },
    checkboxChecked(field, item) {
      return Array.isArray(this.form[field.field]) && this.form[field.field].includes(item)
    },
    toggleCheckbox(field, item) {
      const values = Array.isArray(this.form[field.field]) ? [...this.form[field.field]] : []
      const index = values.indexOf(item)
      if (index >= 0) values.splice(index, 1)
      else values.push(item)
      this.form[field.field] = values
    },
    handleDateChange(field, event) {
      this.form[field.field] = event.detail.value
    },
    handleBooleanChange(field, event) {
      this.form[field.field] = event.detail.value ? '1' : '0'
    },
    validateForm() {
      const missing = this.visibleFields.find((field) => {
        if (!this.isRequired(field)) return false
        const value = this.form[field.field]
        return value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)
      })
      if (missing) {
        uni.showToast({ title: `请填写${missing.name}`, icon: 'none' })
        return false
      }
      return true
    },
    async submit() {
      if (!this.validateForm()) return
      if (this.loading) return
      this.loading = true
      try {
        await this.submitHandler({ ...this.form })
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
.dynamic-form-page {
  min-height: 100vh;
  padding: 28rpx 20rpx 48rpx;
  background-color: var(--crm-page-bg);
}

.form-head {
  margin-bottom: 22rpx;
}

.form-title {
  display: block;
  color: var(--crm-text);
  font-size: 34rpx;
  font-weight: 800;
}

.form-sub {
  display: block;
  margin-top: 10rpx;
  color: #7b8798;
  font-size: 24rpx;
}

.form-card {
  padding: 24rpx;
  border-radius: 16rpx;
  background-color: #ffffff;
  box-shadow: 0 12rpx 30rpx rgba(30, 56, 96, 0.06);
}

.loading-box {
  padding: 30rpx 0;
  color: #8a96a8;
  font-size: 25rpx;
  text-align: center;
}

.form-item {
  margin-bottom: 20rpx;
}

.field-label {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
  color: #233753;
  font-size: 25rpx;
  font-weight: 700;
}

.required {
  margin-left: 6rpx;
  color: #e96352;
}

.form-input,
.form-picker,
.form-textarea {
  width: 100%;
  border-radius: 12rpx;
  background-color: #f5f7fb;
  color: #233753;
  font-size: 26rpx;
}

.form-input,
.form-picker {
  height: 78rpx;
  padding: 0 20rpx;
}

.form-picker {
  display: flex;
  align-items: center;
}

.form-picker.is-placeholder {
  color: #9aa5b5;
}

.relation-picker {
  justify-content: space-between;
  gap: 18rpx;
}

.picker-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picker-action {
  color: var(--crm-primary);
  font-size: 24rpx;
  font-weight: 700;
}

.form-textarea {
  min-height: 180rpx;
  padding: 18rpx 20rpx;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.multi-select {
  display: flex;
  max-height: 360rpx;
  flex-wrap: wrap;
  gap: 12rpx;
  overflow-y: auto;
  padding: 4rpx 0;
}

.checkbox-chip {
  min-height: 54rpx;
  padding: 0 18rpx;
  border: 1rpx solid #dde4ef;
  border-radius: 999rpx;
  background-color: #ffffff;
  color: #52627a;
  font-size: 24rpx;
  line-height: 54rpx;
}

.checkbox-chip.is-active {
  border-color: var(--crm-primary);
  background-color: var(--crm-soft-bg);
  color: var(--crm-primary);
}

.unsupported-box {
  margin: 10rpx 0 20rpx;
  padding: 18rpx;
  border-radius: 12rpx;
  background-color: #fff8e8;
  color: #9a6b12;
  font-size: 23rpx;
  line-height: 1.5;
}

.unsupported-text {
  color: #9aa5b5;
  font-size: 24rpx;
}

.save-button {
  height: 86rpx;
  margin-top: 12rpx;
  border-radius: 12rpx;
  background-color: var(--crm-primary);
  color: #ffffff;
  font-size: 29rpx;
  font-weight: 700;
  line-height: 86rpx;
}

.selector-mask {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: flex-end;
  background-color: rgba(15, 23, 42, 0.42);
}

.selector-panel {
  width: 100%;
  max-height: 78vh;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
  border-radius: 28rpx 28rpx 0 0;
  background-color: var(--crm-card-bg);
}

.selector-head {
  min-height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28rpx;
  border-bottom: 1rpx solid var(--crm-border);
}

.selector-title {
  color: var(--crm-text);
  font-size: 30rpx;
  font-weight: 800;
}

.selector-cancel,
.selector-done {
  min-width: 90rpx;
  color: var(--crm-text-muted);
  font-size: 27rpx;
}

.selector-done {
  color: var(--crm-primary);
  text-align: right;
}

.selector-search {
  height: 78rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin: 20rpx 24rpx 12rpx;
  padding: 0 18rpx;
  border-radius: 14rpx;
  background-color: var(--crm-input-bg);
}

.selector-input {
  flex: 1;
  height: 78rpx;
  color: var(--crm-text);
  font-size: 26rpx;
}

.selector-search-btn {
  color: var(--crm-primary);
  font-size: 25rpx;
  font-weight: 800;
}

.selector-list {
  height: 56vh;
  padding: 0 24rpx 24rpx;
  box-sizing: border-box;
}

.selector-row {
  padding: 22rpx 0;
  border-bottom: 1rpx solid var(--crm-border);
}

.selector-row-title {
  display: block;
  overflow: hidden;
  color: var(--crm-text);
  font-size: 28rpx;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selector-row-desc {
  display: block;
  margin-top: 8rpx;
  color: var(--crm-text-muted);
  font-size: 24rpx;
}

.selector-empty {
  padding: 36rpx 0;
  color: var(--crm-text-muted);
  font-size: 25rpx;
  text-align: center;
}
</style>
