<template>
  <DynamicCrmForm
    title="新增线索"
    submit-text="保存线索"
    types="crm_leads"
    controller="leads"
    :submit-handler="createLeads"
  />
</template>

<script>
import DynamicCrmForm from '../../components/DynamicCrmForm.vue'
import { createLeads } from '../../api/crm'
import { ensureLogin } from '../../utils/router'

export default {
  components: { DynamicCrmForm },
  onLoad() {
    ensureLogin()
  },
  methods: {
    createLeads
  }
}
</script>
