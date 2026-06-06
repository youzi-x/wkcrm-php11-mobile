<template>
  <DynamicCrmForm
    title="新增客户"
    submit-text="保存客户"
    types="crm_customer"
    controller="customer"
    :submit-handler="createCustomer"
  />
</template>

<script>
import DynamicCrmForm from '../../components/DynamicCrmForm.vue'
import { createCustomer } from '../../api/crm'
import { ensureLogin } from '../../utils/router'

export default {
  components: { DynamicCrmForm },
  onLoad() {
    ensureLogin()
  },
  methods: {
    createCustomer
  }
}
</script>
