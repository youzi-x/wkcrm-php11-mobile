<template>
  <DynamicCrmForm
    title="新增商机"
    submit-text="保存商机"
    types="crm_business"
    controller="business"
    :initial-values="initialValues"
    :submit-handler="createBusiness"
  />
</template>

<script>
import DynamicCrmForm from '../../components/DynamicCrmForm.vue'
import { createBusiness } from '../../api/crm'
import { ensureLogin } from '../../utils/router'

export default {
  components: { DynamicCrmForm },
  data() {
    return {
      initialValues: {}
    }
  },
  onLoad(options) {
    if (!ensureLogin()) return
    this.initialValues = {
      customer_id: options.customer_id || '',
      customer_name: options.customer_name ? decodeURIComponent(options.customer_name) : '',
      contacts_id: options.contacts_id || '',
      contacts_name: options.contacts_name ? decodeURIComponent(options.contacts_name) : ''
    }
  },
  methods: {
    createBusiness
  }
}
</script>
