export function displayValue(value) {
  if (value === undefined || value === null || value === '') return '--'
  if (Array.isArray(value)) {
    return value.map(displayValue).filter((item) => item !== '--').join('、') || '--'
  }
  if (typeof value === 'object') {
    if (value.name) return value.name
    if (value.realname) return value.realname
    if (value.value) return displayValue(value.value)
    if (value.address) return displayValue(value.address)
    return Object.values(value).map(displayValue).filter((item) => item !== '--').join('、') || '--'
  }
  return String(value)
}

export function normalizeFields(list = []) {
  return list
    .filter((item) => item && item.name && item.field !== 'file')
    .map((item) => ({
      key: item.field || item.fieldName || item.name,
      label: item.name,
      value: displayValue(item.value),
      rawValue: item.value,
      formType: item.form_type || item.formType || ''
    }))
}
