import { post } from '../utils/request'

export function getSystemConfig(options = {}) {
  return post('admin/system/index', {}, options)
}
