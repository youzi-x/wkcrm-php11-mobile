import { post } from '../utils/request'

export function getWorkbenchStats(data = 'month') {
  const payload = typeof data === 'string' ? { type: data } : data
  return post('crm/index/index', payload)
}

export async function getWorkbenchTodos() {
  const [crmTodos, messageCount] = await Promise.all([
    post('crm/message/num'),
    post('admin/message/unreadCount')
  ])
  return {
    ...crmTodos,
    messageNum: messageCount.allCount || 0
  }
}

export function getTodoList(type, data = {}) {
  const listApiMap = {
    message: ['admin/message/messageList', { label: '' }],
    todayLeads: ['crm/message/todayLeads', { types: 'list' }],
    todayCustomer: ['crm/message/todayCustomer', { types: 'list' }],
    todayBusiness: ['crm/message/todayBusiness', { types: 'list' }],
    followLeads: ['crm/message/followLeads', { types: 'list' }],
    followCustomer: ['crm/message/followCustomer', { types: 'list' }],
    remindReceivablesPlan: ['crm/message/remindReceivablesPlan', { types: 'list', type: 1 }],
    endContract: ['crm/message/endContract', { types: 'list', type: 1 }]
  }
  const config = listApiMap[type]
  if (!config) return Promise.resolve({ list: [], dataCount: 0 })
  return post(config[0], {
    page: 1,
    limit: 20,
    ...config[1],
    ...data
  })
}

export function updateMessageReadStatus(messageId, isRead = true) {
  const readValue = isRead ? 1 : 0
  return post('admin/message/updateMessage', {
    message_id: messageId,
    is_read: readValue,
    types: readValue
  })
}

export function getForgottenCustomerCount(data = {}) {
  return post('crm/index/forgottenCustomerCount', {
    page: 1,
    limit: 1,
    ...data
  })
}

export function getWorkbenchActivities(data = {}) {
  return post('oa/log/activityList', {
    page: 1,
    limit: 10,
    crmType: 0,
    queryType: 0,
    subUser: 'all',
    ...data
  })
}

export function getAppMenuConfig() {
  return post('crm/setting/appMenuConfig')
}

export function getCustomerList(data = {}) {
  return post('crm/customer/index', {
    page: 1,
    limit: 15,
    ...data
  })
}

export function getCustomerStatistics(data = {}, options = {}) {
  return post('bi/customer/statistics', {
    type: 'month',
    ...data
  }, options)
}

export function getCustomerRecordList(data = {}, options = {}) {
  return post('bi/customer/recordList', {
    type: 'month',
    ...data
  }, options)
}

export function getCustomerPoolList(data = {}, options = {}) {
  return post('bi/customer/poolList', {
    type: 'month',
    ...data
  }, options)
}

export function queryCustomerRepeat(data = {}, options = {}) {
  return post('crm/index/queryRepeat', data, options)
}

export function createCustomer(data = {}) {
  return post('crm/customer/save', data)
}

export function getCustomerDetail(id) {
  return post('crm/customer/read', { id })
}

export function getCustomerCount(customerId) {
  return post('crm/customer/count', { customer_id: customerId })
}

export function getModuleFields(data = {}) {
  return post('admin/field/getField', {
    system: 1,
    ...data
  })
}

export function getUserList(data = {}, options = {}) {
  return post('admin/users/index', {
    page: 1,
    limit: 500,
    status: 1,
    ...data
  }, options)
}

export function getExamineFlowUsers(data = {}, options = {}) {
  return post('admin/examine_flow/userList', {
    types: 'crm_contract',
    ...data
  }, options)
}

export function getExamineRecordList(data = {}, options = {}) {
  return post('admin/examine_flow/recordList', {
    types: 'crm_contract',
    ...data
  }, options)
}

export function getStructureList(data = {}) {
  return post('admin/structures/index', {
    type: 1,
    ...data
  })
}

export function createRecord(data = {}) {
  const { module, ...payload } = data
  return post('crm/activity/save', payload)
}

export function updateRecord(data = {}) {
  const { module, ...payload } = data
  return post('crm/activity/update', payload)
}

export function deleteRecord(activityId) {
  return post('crm/activity/delete', {
    activity_id: activityId
  })
}

export function getCustomerFollowRecords(customerId, data = {}, options = {}) {
  return post('admin/record/index', {
    page: 1,
    limit: 50,
    types: 'crm_customer',
    types_id: customerId,
    by: 'record',
    ...data
  }, options)
}

export function updateCustomerFollowRecord(data = {}) {
  return post('admin/record/update', data)
}

export function deleteCustomerFollowRecord(recordId) {
  return post('admin/record/delete', {
    id: recordId
  })
}

export function getCrmActivityList(data = {}, options = {}) {
  return post('crm/index/activityList', {
    page: 1,
    limit: 100,
    crmType: 2,
    queryType: 0,
    label: 0,
    subUser: '',
    ...data
  }, options)
}

export function getActivityPhrases() {
  return post('crm/activity/getPhrase')
}

export function getCustomerRecords(customerId, data = {}, options = {}) {
  return post('crm/activity/index', {
    page: 1,
    limit: 10,
    module: 'customer',
    crmType: 2,
    activity_type: '',
    activity_type_id: customerId,
    ...data
  }, options)
}

export function getContactsRecords(contactsId, data = {}) {
  return post('crm/activity/index', {
    page: 1,
    limit: 10,
    module: 'contacts',
    activity_type_id: contactsId,
    ...data
  })
}

export function getLeadsRecords(leadsId, data = {}) {
  return post('crm/activity/index', {
    page: 1,
    limit: 10,
    module: 'leads',
    activity_type_id: leadsId,
    ...data
  })
}

export function getBusinessRecords(businessId, data = {}) {
  return post('crm/activity/index', {
    page: 1,
    limit: 10,
    module: 'business',
    activity_type_id: businessId,
    ...data
  })
}

export function getContractRecords(contractId, data = {}) {
  return post('crm/activity/index', {
    page: 1,
    limit: 10,
    module: 'contract',
    activity_type_id: contractId,
    ...data
  })
}

export function getContactsList(data = {}, options = {}) {
  return post('crm/contacts/index', {
    page: 1,
    limit: 15,
    ...data
  }, options)
}

export function getContactsRanking(data = {}, options = {}) {
  return post('bi/ranking/addContacts', {
    type: 'month',
    ...data
  }, options)
}

export function searchCrmIndex(data = {}, options = {}) {
  return post('crm/index/search', {
    page: 1,
    limit: 10,
    ...data
  }, options)
}

export function createContacts(data = {}) {
  return post('crm/contacts/save', data)
}

export function getContactsDetail(id) {
  return post('crm/contacts/read', { id })
}

export function getContactsCount(contactsId) {
  return post('crm/contacts/count', { contacts_id: contactsId })
}

export function getLeadsList(data = {}) {
  return post('crm/leads/index', {
    page: 1,
    limit: 15,
    ...data
  })
}

export function createLeads(data = {}) {
  return post('crm/leads/save', data)
}

export function getLeadsDetail(id) {
  return post('crm/leads/read', { id })
}

export function getLeadsCount(leadsId) {
  return post('crm/leads/count', { leads_id: leadsId })
}

export function getBusinessList(data = {}, options = {}) {
  return post('crm/business/index', {
    page: 1,
    limit: 15,
    ...data
  }, options)
}

export function createBusiness(data = {}) {
  return post('crm/business/save', data)
}

export function getBusinessStatusList() {
  return post('crm/business/statusList')
}

export function getBusinessDetail(id) {
  return post('crm/business/read', { id })
}

export function getBusinessCount(businessId) {
  return post('crm/business/count', { business_id: businessId })
}

export function getContractList(data = {}, options = {}) {
  return post('crm/contract/index', {
    page: 1,
    limit: 15,
    ...data
  }, options)
}

export function getContractDetail(id) {
  return post('crm/contract/read', { id })
}

export function getContractCount(contractId) {
  return post('crm/contract/count', { contract_id: contractId })
}

export function updateContract(data = {}, options = {}) {
  return post('crm/contract/update', data, options)
}

export function revokeContractCheck(data = {}, options = {}) {
  return post('crm/contract/revokeCheck', data, options)
}

export function checkContract(data = {}, options = {}) {
  return post('crm/contract/check', data, options)
}

export function getReceivablesList(data = {}, options = {}) {
  return post('crm/receivables/index', {
    page: 1,
    limit: 15,
    ...data
  }, options)
}

export function getReceivablesDetail(id) {
  return post('crm/receivables/read', { id })
}

export function getReceivablesPlanList(data = {}, options = {}) {
  return post('crm/receivables_plan/index', {
    page: 1,
    limit: 15,
    ...data
  }, options)
}

export function getInvoiceList(data = {}, options = {}) {
  return post('crm/invoice/index', {
    page: 1,
    limit: 15,
    ...data
  }, options)
}

export function getCrmTeam(data = {}, options = {}) {
  return post('crm/setting/team', data, options)
}

export function getScheduleList(data = {}) {
  return post('oa/event/index', data)
}

export function getScheduleMonthStatus(data = {}) {
  return post('oa/index/eventList', data)
}

export function getMyTasks() {
  return post('oa/index/taskList')
}

export function getOaTimeline(data = {}) {
  return post('oa/log/activity', {
    page: 1,
    limit: 15,
    crmType: 0,
    queryType: 0,
    subUser: 'all',
    ...data
  })
}

export function getRecordList(data = {}) {
  return post('crm/activity/index', data)
}
