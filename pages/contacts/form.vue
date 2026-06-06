<template>
  <DynamicCrmForm
    title="新增联系人"
    submit-text="保存联系人"
    types="crm_contacts"
    controller="contacts"
    :initial-values="initialValues"
    :submit-handler="createContacts"
  />
</template>

<script>
import DynamicCrmForm from '../../components/DynamicCrmForm.vue'
import { createContacts } from '../../api/crm'
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
      customer_name: options.customer_name ? decodeURIComponent(options.customer_name) : ''
    }
  },
  methods: {
    createContacts
  }
}
</script>
