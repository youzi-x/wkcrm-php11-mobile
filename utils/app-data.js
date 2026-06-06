export const tabbarList = [
  { key: 'workbench', text: '首页', icon: '⌂', url: '/pages/workbench/index' },
  { key: 'schedule', text: '通知/待办', icon: '◆', url: '/pages/schedule/index' },
  { key: 'customer', text: '客户', icon: '▦', url: '/pages/customer/index' },
  { key: 'business', text: '商机', icon: '￥', url: '/pages/business/index' },
  { key: 'profile', text: '我的', icon: '♙', url: '/pages/profile/index' }
]

export const tabbarOptions = [
  { key: 'workbench', text: '首页', title: '首页', icon: '⌂', color: 'var(--crm-primary)', url: '/pages/workbench/index', required: true },
  { key: 'schedule', text: '通知/待办', title: '通知/待办', icon: '◆', color: 'var(--crm-primary-2)', url: '/pages/schedule/index' },
  { key: 'customer', text: '客户', title: '客户', icon: '▦', color: 'var(--crm-primary-2)', url: '/pages/customer/index' },
  { key: 'business', text: '商机', title: '商机', icon: '￥', color: '#ff7657', url: '/pages/business/index' },
  { key: 'project', text: '项目', title: '项目', icon: '▣', color: '#3fc0bd', url: '/pages/project/index' },
  { key: 'contacts', text: '联系人', title: '联系人', icon: '♙', color: '#6f7f91', url: '/pages/contacts/index' },
  { key: 'leads', text: '线索', title: '线索', icon: '∞', color: '#ff8b4a', url: '/pages/leads/index' },
  { key: 'contract', text: '合同', title: '合同', icon: '▥', color: '#ffb300', url: '/pages/contract/index' },
  { key: 'profile', text: '我的', title: '我的', icon: '♙', color: 'var(--crm-primary)', url: '/pages/profile/index', required: true }
]

export const appGrid = [
  { key: 'customer', title: '客户', icon: '♟', color: 'var(--crm-primary-2)', url: '/pages/customer/index' },
  { key: 'contacts', title: '联系人', icon: '♙', color: '#6f7f91', url: '/pages/contacts/index' },
  { key: 'leads', title: '线索', icon: '∞', color: '#ff8b4a', url: '/pages/leads/index' },
  { key: 'business', title: '商机', icon: '◉', color: '#ff7657', url: '/pages/business/index' },
  { key: 'contract', title: '合同', icon: '▥', color: '#ffb300', url: '/pages/contract/index' },
  { key: 'receivables', title: '回款', icon: '￥', color: '#7a74f0', url: '/pages/contract/index' },
  { key: 'project', title: '项目', icon: '▣', color: '#3fc0bd', url: '/pages/project/index' },
  { key: 'config', title: '配置', icon: '▦', color: '#4f6f96', action: 'homeConfig' }
]

export const topActions = [
  { key: 'customer', title: '建客户', icon: '▦', url: '/pages/customer/form' },
  { key: 'leads', title: '建线索', icon: '∞', url: '/pages/leads/form' },
  { key: 'business', title: '建商机', icon: '▰', url: '/pages/business/form' },
  { key: 'contacts', title: '建联系人', icon: '♙', url: '/pages/contacts/form' }
]

export const quickActionOptions = [
  { key: 'customer', title: '建客户', icon: '▦', color: 'var(--crm-primary)', url: '/pages/customer/form' },
  { key: 'leads', title: '建线索', icon: '∞', color: '#ff8b4a', url: '/pages/leads/form' },
  { key: 'business', title: '建商机', icon: '▰', color: 'var(--crm-primary)', url: '/pages/business/form' },
  { key: 'contacts', title: '建联系人', icon: '♙', color: '#6f7f91', url: '/pages/contacts/form' }
]

export const commonFunctionOptions = [
  { key: 'customer', title: '客户', icon: '♟', color: 'var(--crm-primary-2)', url: '/pages/customer/index' },
  { key: 'contacts', title: '联系人', icon: '♙', color: '#6f7f91', url: '/pages/contacts/index' },
  { key: 'leads', title: '线索', icon: '∞', color: '#ff8b4a', url: '/pages/leads/index' },
  { key: 'business', title: '商机', icon: '◉', color: '#ff7657', url: '/pages/business/index' },
  { key: 'contract', title: '合同', icon: '▥', color: '#ffb300', url: '/pages/contract/index' },
  { key: 'receivables', title: '回款', icon: '￥', color: '#7a74f0', url: '/pages/contract/index' },
  { key: 'project', title: '项目', icon: '▣', color: '#3fc0bd', url: '/pages/project/index' }
]

export const todoMenus = [
  { key: 'message', title: '消息提醒', subtitle: '暂无消息提醒', icon: '♪', field: 'messageNum' },
  { key: 'todayLeads', title: '今日需联系线索', subtitle: '暂无今日需联系线索', icon: '⌁', field: 'todayLeads' },
  { key: 'todayCustomer', title: '今日需联系客户', subtitle: '暂无今日需联系客户', icon: '☎', field: 'todayCustomer' },
  { key: 'todayBusiness', title: '今日需联系商机', subtitle: '暂无今日需联系商机', icon: '￥', field: 'todayBusiness' },
  { key: 'followLeads', title: '分配给我的线索', subtitle: '暂无分配给我的线索', icon: '⌁', field: 'followLeads' },
  { key: 'followCustomer', title: '分配给我的客户', subtitle: '暂无分配给我的客户', icon: '♟', field: 'followCustomer' },
  { key: 'remindReceivablesPlan', title: '待回款提醒', subtitle: '暂无待回款提醒', icon: '♢', field: 'remindReceivablesPlan' },
  { key: 'endContract', title: '即将到期的合同', subtitle: '暂无即将到期的合同', icon: '▣', field: 'endContract' }
]

export const allApps = [
  { group: '客户管理', items: [
    { title: '线索', icon: '∞', color: '#ff8b4a', url: '/pages/leads/index' },
    { title: '客户', icon: '♟', color: 'var(--crm-primary-2)', url: '/pages/customer/index' },
    { title: '联系人', icon: '♙', color: '#6f7f91', url: '/pages/contacts/index' },
    { title: '商机', icon: '◉', color: '#ff7657', url: '/pages/business/index' },
    { title: '合同', icon: '▥', color: '#ffb300', url: '/pages/contract/index' },
    { title: '回款', icon: '￥', color: '#7a74f0', url: '/pages/contract/index' },
    { title: '项目', icon: '▣', color: '#3fc0bd', url: '/pages/project/index' }
  ]}
]
