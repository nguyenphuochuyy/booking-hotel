/**
 * Utility functions để quản lý pendingPayment trong localStorage
 */

const PENDING_PAYMENT_KEY = 'pendingPayment'
const PENDING_PAYMENT_EXPIRY_KEY = 'pendingPaymentExpiry'
const TEMP_BOOKINGS_KEY = 'temp_bookings' // Key để lưu danh sách temp bookings theo userId

/**
 * Lưu thông tin thanh toán đang chờ vào localStorage (thêm vào danh sách temp bookings)
 * @param {number} userId - ID của user
 * @param {Object} paymentData - Dữ liệu thanh toán cần lưu
 * @param {number} expiryMinutes - Thời gian hết hạn (phút), mặc định 30 phút
 * @returns {boolean} - true nếu lưu thành công, false nếu có lỗi
 */
export const savePendingPayment = (userId, paymentData, expiryMinutes = 30) => {
  try {
    if (!paymentData || !userId) {
      console.error('Dữ liệu thanh toán hoặc userId không hợp lệ')
      return false
    }

    // Lấy danh sách temp bookings hiện có của user
    const userTempBookingsKey = `${TEMP_BOOKINGS_KEY}_${userId}`
    const existingBookingsStr = localStorage.getItem(userTempBookingsKey)
    let existingBookings = []
    
    try {
      existingBookings = existingBookingsStr ? JSON.parse(existingBookingsStr) : []
    } catch (e) {
      console.error('Error parsing existing temp bookings:', e)
      existingBookings = []
    }

    // Kiểm tra xem temp booking này đã tồn tại chưa (theo tempBookingKey hoặc bookingCode)
    const existingIndex = existingBookings.findIndex(
      tb => tb.tempBookingKey === paymentData.tempBookingKey || 
            tb.bookingCode === paymentData.bookingCode
    )

    // Tạo object temp booking với đầy đủ thông tin
    const tempBookingData = {
      ...paymentData,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + (expiryMinutes * 60 * 1000)
    }

    if (existingIndex >= 0) {
      // Cập nhật temp booking đã tồn tại
      existingBookings[existingIndex] = tempBookingData
    } else {
      // Thêm temp booking mới vào danh sách
      existingBookings.push(tempBookingData)
    }

    // Lưu lại danh sách vào localStorage
    localStorage.setItem(userTempBookingsKey, JSON.stringify(existingBookings))

    // Lưu dữ liệu thanh toán cũ (tương thích ngược)
    localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(paymentData))
    const expiry = Date.now() + (expiryMinutes * 60 * 1000)
    localStorage.setItem(PENDING_PAYMENT_EXPIRY_KEY, String(expiry))

    return true
  } catch (error) {
    console.error('Error saving pending payment:', error)
    return false
  }
}

/**
 * Lấy thông tin thanh toán đang chờ từ localStorage (tương thích ngược)
 * @param {number} userId - ID của user (optional, nếu không có thì lấy từ key cũ)
 * @returns {Object|null} - Dữ liệu thanh toán hoặc null nếu không có hoặc đã hết hạn
 */
export const getPendingPayment = (userId = null) => {
  try {
    // Tương thích ngược: lấy từ key cũ nếu không có userId
    if (!userId) {
      const raw = localStorage.getItem(PENDING_PAYMENT_KEY)
      if (!raw) {
        return null
      }
      const expiryRaw = localStorage.getItem(PENDING_PAYMENT_EXPIRY_KEY)
      if (expiryRaw) {
        const expiry = Number(expiryRaw)
        if (expiry < Date.now()) {
          clearPendingPayment()
          return null
        }
      }
      return JSON.parse(raw)
    }

    // Lấy từ danh sách temp bookings của user
    const userTempBookingsKey = `${TEMP_BOOKINGS_KEY}_${userId}`
    const raw = localStorage.getItem(userTempBookingsKey)
    if (!raw) {
      return null
    }
    const bookings = JSON.parse(raw)
    // Trả về booking đầu tiên chưa hết hạn (hoặc booking mới nhất)
    const validBookings = bookings.filter(tb => {
      if (tb.expiresAt) {
        return tb.expiresAt > Date.now()
      }
      return true
    })
    return validBookings.length > 0 ? validBookings[0] : null
  } catch (error) {
    console.error('Error getting pending payment:', error)
    return null
  }
}

/**
 * Lấy tất cả temp bookings của user từ localStorage
 * @param {number} userId - ID của user
 * @returns {Array} - Danh sách temp bookings chưa hết hạn
 */
export const getAllPendingPayments = (userId) => {
  try {
    if (!userId) {
      return []
    }

    const userTempBookingsKey = `${TEMP_BOOKINGS_KEY}_${userId}`
    const raw = localStorage.getItem(userTempBookingsKey)
    if (!raw) {
      return []
    }

    const bookings = JSON.parse(raw)
    const now = Date.now()
    
    // Lọc các booking chưa hết hạn
    const validBookings = bookings.filter(tb => {
      if (tb.expiresAt) {
        return tb.expiresAt > now
      }
      return true
    })

    // Cập nhật lại danh sách nếu có booking đã hết hạn
    if (validBookings.length !== bookings.length) {
      localStorage.setItem(userTempBookingsKey, JSON.stringify(validBookings))
    }

    return validBookings
  } catch (error) {
    console.error('Error getting all pending payments:', error)
    return []
  }
}

/**
 * Lấy temp booking theo identifier (tempBookingKey/bookingCode/orderCode)
 * @param {number} userId - ID user
 * @param {string} identifier - tempBookingKey | bookingCode | orderCode
 * @returns {Object|null}
 */
export const getPendingPaymentByIdentifier = (userId, identifier) => {
  try {
    if (!userId || !identifier) {
      return null
    }

    const bookings = getAllPendingPayments(userId)
    if (!Array.isArray(bookings) || bookings.length === 0) {
      return null
    }

    return bookings.find(
      tb =>
        tb.tempBookingKey === identifier ||
        tb.bookingCode === identifier ||
        tb.orderCode?.toString() === identifier?.toString()
    ) || null
  } catch (error) {
    console.error('Error getting pending payment by identifier:', error)
    return null
  }
}

/**
 * Xóa một temp booking khỏi danh sách
 * @param {number} userId - ID của user
 * @param {string} identifier - tempBookingKey hoặc bookingCode hoặc orderCode
 * @returns {boolean} - true nếu xóa thành công
 */
export const removePendingPayment = (userId, identifier) => {
  try {
    if (!userId || !identifier) {
      return false
    }

    const userTempBookingsKey = `${TEMP_BOOKINGS_KEY}_${userId}`
    const raw = localStorage.getItem(userTempBookingsKey)
    if (!raw) {
      return false
    }

    const bookings = JSON.parse(raw)
    const filteredBookings = bookings.filter(
      tb => tb.tempBookingKey !== identifier && 
            tb.bookingCode !== identifier && 
            tb.orderCode?.toString() !== identifier?.toString()
    )

    if (filteredBookings.length !== bookings.length) {
      localStorage.setItem(userTempBookingsKey, JSON.stringify(filteredBookings))
      return true
    }

    return false
  } catch (error) {
    console.error('Error removing pending payment:', error)
    return false
  }
}

/**
 * Xóa tất cả thông tin thanh toán đang chờ khỏi localStorage
 * @param {number} userId - ID của user (optional)
 * @returns {boolean} - true nếu xóa thành công
 */
export const clearPendingPayment = (userId = null) => {
  try {
    // Xóa key cũ (tương thích ngược)
    localStorage.removeItem(PENDING_PAYMENT_KEY)
    localStorage.removeItem(PENDING_PAYMENT_EXPIRY_KEY)
    
    // Xóa danh sách temp bookings của user
    if (userId) {
      const userTempBookingsKey = `${TEMP_BOOKINGS_KEY}_${userId}`
      localStorage.removeItem(userTempBookingsKey)
    }
    
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
 * @param {number} userId - ID của user
 * @param {string} identifier - tempBookingKey hoặc bookingCode để tìm temp booking cần cập nhật
 * @param {Object} updates - Dữ liệu cần cập nhật (sẽ merge với dữ liệu hiện tại)
 * @returns {boolean} - true nếu cập nhật thành công
 */
export const updatePendingPayment = (userId, identifier, updates) => {
  try {
    if (!userId || !identifier) {
      console.error('userId hoặc identifier không hợp lệ')
      return false
    }

    // Lấy danh sách temp bookings của user
    const userTempBookingsKey = `${TEMP_BOOKINGS_KEY}_${userId}`
    const raw = localStorage.getItem(userTempBookingsKey)
    if (!raw) {
      return false
    }

    const bookings = JSON.parse(raw)
    const existingIndex = bookings.findIndex(
      tb => tb.tempBookingKey === identifier || 
            tb.bookingCode === identifier ||
            tb.orderCode?.toString() === identifier?.toString()
    )

    if (existingIndex === -1) {
      console.error('Không tìm thấy temp booking để cập nhật')
      return false
    }

    // Cập nhật temp booking
    const currentBooking = bookings[existingIndex]
    const updatedBooking = {
      ...currentBooking,
      ...updates
    }

    // Tính lại thời gian hết hạn nếu có expiresAt trong currentBooking
    const remainingMinutes = currentBooking.expiresAt 
      ? Math.max(Math.floor((currentBooking.expiresAt - Date.now()) / (60 * 1000)), 0)
      : 30

    // Lưu lại bằng cách gọi savePendingPayment
    return savePendingPayment(userId, updatedBooking, remainingMinutes || 30)
  } catch (error) {
    console.error('Error updating pending payment:', error)
    return false
  }
}

export default {
  savePendingPayment,
  getPendingPayment,
  getAllPendingPayments,
  getPendingPaymentByIdentifier,
  removePendingPayment,
  clearPendingPayment,
  hasPendingPayment,
  getRemainingTime,
  updatePendingPayment
}

