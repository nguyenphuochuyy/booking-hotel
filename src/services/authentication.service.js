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
 * @param {{ credential: string }} payload - Google credential token
 */
export async function googleLogin(payload) {
  return http.post(AUTH.GOOGLE_LOGIN, payload)
}

const authenticationService = { login, register, verifyEmail, forgotPassword, resetPassword, googleLogin }
export default authenticationService





