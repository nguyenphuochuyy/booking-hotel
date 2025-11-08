/**
 * Utility functions để quản lý pendingPayment trong localStorage
 */

const PENDING_PAYMENT_KEY = 'pendingPayment'
const PENDING_PAYMENT_EXPIRY_KEY = 'pendingPaymentExpiry'

/**
 * Lưu thông tin thanh toán đang chờ vào localStorage
 * @param {Object} paymentData - Dữ liệu thanh toán cần lưu
 * @param {number} expiryMinutes - Thời gian hết hạn (phút), mặc định 30 phút
 * @returns {boolean} - true nếu lưu thành công, false nếu có lỗi
 */
export const savePendingPayment = (paymentData, expiryMinutes = 30) => {
  try {
    if (!paymentData) {
      console.error('Payment data is required')
      return false
    }

    // Lưu dữ liệu thanh toán
    localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(paymentData))

    // Lưu thời gian hết hạn
    const expiry = Date.now() + (expiryMinutes * 60 * 1000)
    localStorage.setItem(PENDING_PAYMENT_EXPIRY_KEY, String(expiry))

    return true
  } catch (error) {
    console.error('Error saving pending payment:', error)
    return false
  }
}

/**
 * Lấy thông tin thanh toán đang chờ từ localStorage
 * @returns {Object|null} - Dữ liệu thanh toán hoặc null nếu không có hoặc đã hết hạn
 */
export const getPendingPayment = () => {
  try {
    const raw = localStorage.getItem(PENDING_PAYMENT_KEY)
    if (!raw) {
      return null
    }

    // Kiểm tra thời gian hết hạn
    const expiryRaw = localStorage.getItem(PENDING_PAYMENT_EXPIRY_KEY)
    if (expiryRaw) {
      const expiry = Number(expiryRaw)
      const now = Date.now()
      
      if (expiry < now) {
        // Đã hết hạn, xóa dữ liệu
        clearPendingPayment()
        return null
      }
    }

    return JSON.parse(raw)
  } catch (error) {
    console.error('Error getting pending payment:', error)
    clearPendingPayment()
    return null
  }
}

/**
 * Xóa thông tin thanh toán đang chờ khỏi localStorage
 * @returns {boolean} - true nếu xóa thành công
 */
export const clearPendingPayment = () => {
  try {
    localStorage.removeItem(PENDING_PAYMENT_KEY)
  
    localStorage.removeItem(PENDING_PAYMENT_EXPIRY_KEY)
    return true
  } catch (error) {
    console.error('Error clearing pending payment:', error)
    return false
  }
}

/**
 * Kiểm tra xem có thanh toán đang chờ không
 * @returns {boolean} - true nếu có thanh toán đang chờ và chưa hết hạn
 */
export const hasPendingPayment = () => {
  return getPendingPayment() !== null
}

/**
 * Lấy thời gian còn lại (giây) của thanh toán đang chờ
 * @returns {number} - Số giây còn lại, 0 nếu đã hết hạn hoặc không có
 */
export const getRemainingTime = () => {
  try {
    const expiryRaw = localStorage.getItem(PENDING_PAYMENT_EXPIRY_KEY)
    if (!expiryRaw) {
      return 0
    }

    const expiry = Number(expiryRaw)
    const now = Date.now()
    const remaining = Math.max(Math.floor((expiry - now) / 1000), 0)

    // Nếu đã hết hạn, xóa dữ liệu
    if (remaining === 0) {
      clearPendingPayment()
    }

    return remaining
  } catch (error) {
    console.error('Error getting remaining time:', error)
    return 0
  }
}

/**
 * Cập nhật một phần dữ liệu thanh toán đang chờ
 * @param {Object} updates - Dữ liệu cần cập nhật (sẽ merge với dữ liệu hiện tại)
 * @returns {boolean} - true nếu cập nhật thành công
 */
export const updatePendingPayment = (updates) => {
  try {
    const currentData = getPendingPayment()
    if (!currentData) {
      return false
    }

    const updatedData = {
      ...currentData,
      ...updates
    }

    // Lấy thời gian hết hạn hiện tại
    const expiryRaw = localStorage.getItem(PENDING_PAYMENT_EXPIRY_KEY)
    const expiry = expiryRaw ? Number(expiryRaw) : Date.now() + (30 * 60 * 1000)
    const remainingMinutes = Math.max(Math.floor((expiry - Date.now()) / (60 * 1000)), 0)

    return savePendingPayment(updatedData, remainingMinutes || 30)
  } catch (error) {
    console.error('Error updating pending payment:', error)
    return false
  }
}

export default {
  savePendingPayment,
  getPendingPayment,
  clearPendingPayment,
  hasPendingPayment,
  getRemainingTime,
  updatePendingPayment
}

