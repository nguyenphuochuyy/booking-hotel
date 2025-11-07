import http from './httpClient'
import { AUTH } from '../constants/apiEndpoints'

/**
 * Gọi API đăng nhập
 * @param {{ email?: string, username?: string, password: string } | Record<string, any>} payload
 * @returns {Promise<any>} dữ liệu trả về từ API (đã parse JSON nếu có)
 */
export async function login(payload) {
  return http.post(AUTH.LOGIN, payload)
}

/**
 * Gọi API đăng ký
 * @param {{ full_name: string, email: string, password: string } | Record<string, any>} payload
 * @returns {Promise<any>}
 */
export async function register(payload) {
  return http.post(AUTH.REGISTER, payload)
}

/**
 * Xác minh email (FE gọi khi user bấm link xác minh có chứa token)
 * @param {{ token: string }} params
 */
export async function verifyEmail(params) {
  return http.get(AUTH.VERIFY_EMAIL, { params })
}

/**
 * Gửi email quên mật khẩu
 * @param {{ email: string }} payload
 */
export async function forgotPassword(payload) {
  return http.post(AUTH.FORGOT_PASSWORD, payload)
}

/**
 * Đặt lại mật khẩu với token
 * @param {{ token: string, newPassword: string, confirmPassword: string }} payload
 */
export async function resetPassword(payload) {
  return http.post(AUTH.RESET_PASSWORD, payload)
}

/**
 * Đăng nhập với Google OAuth
 * Lưu ý: Function này không được sử dụng vì Google OAuth cần redirect trực tiếp đến backend
 * Sử dụng window.location.href để redirect đến AUTH.GOOGLE_LOGIN endpoint
 */
export async function googleLogin() {
  // Không sử dụng function này, thay vào đó redirect trực tiếp
  // Sử dụng helper function từ httpClient để đảm bảo nhất quán
  const apiBaseUrl = getBaseUrl()
  window.location.href = `${apiBaseUrl}${AUTH.GOOGLE_LOGIN}`
}

const authenticationService = { login, register, verifyEmail, forgotPassword, resetPassword, googleLogin }
export default authenticationService





