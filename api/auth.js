import { get, post } from '../utils/request'

export function login(data) {
  return post('admin/base/login', data, { showError: true })
}

export function logout() {
  return post('admin/base/logout')
}

export function getVerify() {
  return get('admin/base/getVerify')
}
