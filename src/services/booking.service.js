import httpClient from './httpClient'

// ========== BOOKING SERVICES ==========

// Tạo temp booking
export const createTempBooking = async (bookingData) => {
  try {
    const response = await httpClient.post('/bookings/temp-booking', bookingData)
    return response
  } catch (error) {
    console.error('Error creating temp booking:', error)
    throw error
  }
}

// Thêm dịch vụ vào temp booking
export const addServiceToTempBooking = async (serviceData) => {
  try {
    const response = await httpClient.post('/bookings/temp-booking/add-service', serviceData)
    return response
  } catch (error) {
    console.error('Error adding service to temp booking:', error)
    throw error
  }
}

// Tạo payment link
export const createPaymentLink = async (paymentData) => {
  try {
    const response = await httpClient.post('/bookings/create-payment-link', paymentData)
    return response
  } catch (error) {
    console.error('Error creating payment link:', error)
    throw error
  }
}

// Validate promotion code
export const validatePromotionCode = async (promotionCode) => {
  try {
    const response = await httpClient.post('/promotions/validate', { promotion_code: promotionCode })
    return response
  } catch (error) {
    console.error('Error validating promotion code:', error)
    throw error
  }
}

// Apply promotion code
export const applyPromotionCode = async (promotionData) => {
  try {
    const response = await httpClient.post('/promotions/apply', promotionData)
    return response.data
  } catch (error) {
    console.error('Error applying promotion code:', error)
    throw error
  }
}

// Get services
export const getServices = async (params = {}) => {
  try {
    const response = await httpClient.get('/services', { params })
    return response
  } catch (error) {
    console.error('Error getting services:', error)
    throw error
  }
}
// Add multiple services to temp booking (loop backend endpoint add one by one)
export const addServicesToTempBooking = async (tempBookingKey, services = []) => {
  try {
    if (!tempBookingKey || !Array.isArray(services) || services.length === 0) return null
    let lastResponse = null
    for (const svc of services) {
      const payload = {
        temp_booking_key: tempBookingKey,
        service_id: svc.service_id,
        quantity: svc.quantity || 1,
        payment_type: svc.payment_type || 'prepaid'
      }
      lastResponse = await httpClient.post('/bookings/temp-booking/add-service', payload)
    }
    return lastResponse
  } catch (error) {
    console.error('Có lỗi xảy ra khi thêm dịch vụ vào booking tạm thời:', error)
    throw error
  }
}
// Get user bookings
export const getUserBookings = async (params = {}) => {
  try {
    const response = await httpClient.get('/bookings/my-bookings', { params })
    return response
  } catch (error) {
    console.error('Error getting user bookings:', error)
    throw error
  }
}

// Get booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const response = await httpClient.get(`/bookings/${bookingId}`)
    return response.data
  } catch (error) {
    console.error('Error getting booking by ID:', error)
    throw error
  }
}

// Cancel booking
export const cancelBooking = async (bookingId, reason = '') => {
  try {
    const response = await httpClient.post(`/bookings/${bookingId}/cancel`, { reason })
    return response
  } catch (error) {
    console.error('Error cancelling booking:', error)
    throw error
  }
}

// ========== UTILITY FUNCTIONS ==========

// Format price
export const formatPrice = (price) => {
  if (!price) return '0 VNĐ'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

// Format date
export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// Calculate nights
export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const diffTime = Math.abs(checkOutDate - checkInDate)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Format date time
export const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get booking status color
export const getBookingStatusColor = (status) => {
  const colors = {
    'pending': 'orange',
    'confirmed': 'blue',
    'checked_in': 'green',
    'checked_out': 'purple',
    'cancelled': 'red',
    'completed': 'green'
  }
  return colors[status] || 'default'
}

// Get booking status text
export const getBookingStatusText = (status) => {
  const texts = {
    'pending': 'Chờ xác nhận',
    'confirmed': 'Đã xác nhận',
    'checked_in': 'Đã nhận phòng',
    'checked_out': 'Đã trả phòng',
    'cancelled': 'Đã hủy',
    'completed': 'Hoàn thành'
  }
  return texts[status] || status
}

// Get payment status color
export const getPaymentStatusColor = (status) => {
  const colors = {
    'pending': 'orange',
    'paid': 'green',
    'refunded': 'blue',
    'failed': 'red'
  }
  return colors[status] || 'default'
}

// Get payment status text
export const getPaymentStatusText = (status) => {
  const texts = {
    'pending': 'Chờ thanh toán',
    'paid': 'Đã thanh toán',
    'refunded': 'Đã hoàn tiền',
    'failed': 'Thanh toán thất bại'
  }
  return texts[status] || status
}

// Search available rooms
export const searchAvailableRooms = async (params) => {
  try {
    const response = await httpClient.get('/rooms/availability/search', { params })
    return response
  } catch (error) {
    console.error('Error searching available rooms:', error)
    throw error
  }
}

// Get all bookings for admin dashboard
export const getAllBookings = async (params = {}) => {
  try {
    const response = await httpClient.get('/bookings', { params })
    return response
  } catch (error) {
    console.error('Error getting all bookings:', error)
    throw error
  }
}

// Validate booking dates
export const validateBookingDates = (checkIn, checkOut) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  
  if (checkInDate < today) {
    return { valid: false, message: 'Ngày check-in không được trong quá khứ' }
  }
  
  if (checkOutDate <= checkInDate) {
    return { valid: false, message: 'Ngày check-out phải sau ngày check-in' }
  }
  
  return { valid: true }
}

// Calculate total price with services
export const calculateTotalPrice = (roomPrice, nights, services = [], promotion = null) => {
  let total = roomPrice * nights
  
  // Add prepaid services
  services.forEach(service => {
    if (service.payment_type === 'prepaid') {
      total += service.total_price
    }
  })
  
  // Apply promotion
  if (promotion) {
    if (promotion.discount_type === 'percentage') {
      total = total * (1 - promotion.amount / 100)
    } else {
      total = Math.max(0, total - promotion.amount)
    }
  }
  
  return total
}

// Generate booking summary
export const generateBookingSummary = (bookingData) => {
  const {
    roomType,
    checkIn,
    checkOut,
    guests,
    services = [],
    promotion = null
  } = bookingData
  
  const nights = calculateNights(checkIn, checkOut)
  const totalPrice = calculateTotalPrice(roomType.price_per_night, nights, services, promotion)
  
  return {
    roomType: roomType.room_type_name,
    checkIn: formatDate(checkIn),
    checkOut: formatDate(checkOut),
    nights,
    guests: guests.adults + (guests.children || 0),
    roomPrice: roomType.price_per_night,
    services: services.filter(s => s.payment_type === 'prepaid'),
    promotion,
    totalPrice
  }
}
// Check payment status
export const checkPaymentStatus = async (paymentData) => {
  try {
    const response = await httpClient.post('/bookings/payment-webhook', paymentData)
    return response
  } catch (error) {
    console.error('Error checking payment status:', error)
    throw error
  }
}

// Create walk-in booking
export const createWalkInBooking = async (bookingData) => {
  try {
    const response = await httpClient.post('/bookings/walk-in', bookingData)
    return response
  } catch (error) {
    console.error('Error creating walk-in booking:', error)
    throw error
  }
}

// cancle booking online
export const cancelBookingOnline = async (bookingId, reason = '') => {
  try {
    const response = await httpClient.post(`/bookings/${bookingId}/cancel`, { reason })
    return response
  } catch (error) {
    console.error('Error cancelling booking online:', error)
    throw error
  }
}

// Download invoice PDF for user
export const downloadInvoicePDF = async (bookingId) => {
  try {
    // Sử dụng helper function từ httpClient để đảm bảo nhất quán
    const { getBaseUrl } = await import('./httpClient.js')
    const apiBaseUrl = getBaseUrl()
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${apiBaseUrl}/bookings/${bookingId}/invoice/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || 'Không thể tải hóa đơn!' }
      }
      const error = new Error(errorData.message || 'Không thể tải hóa đơn!')
      error.response = { data: errorData, status: response.status }
      throw error
    }
    
    return await response.blob()
  } catch (error) {
    console.error('Error downloading invoice PDF:', error)
    throw error
  }
}
// Tìm booking theo bookingCode
export const findBookingByCode = async (bookingCode) => {
  try {
    const response = await httpClient.get(`/bookings/code/${bookingCode}`)
    return response
  } catch (error) {
    console.error('Error finding booking by code:', error)
    throw error
  }
}
export default {
  createTempBooking,
  addServiceToTempBooking,
  createPaymentLink,
  validatePromotionCode,
  applyPromotionCode,
  getServices,
  getUserBookings,
  getBookingById,
  cancelBooking,
  formatPrice,
  formatDate,
  calculateNights,
  formatDateTime,
  getBookingStatusColor,
  getBookingStatusText,
  getPaymentStatusColor,
  getPaymentStatusText,
  validateBookingDates,
  calculateTotalPrice,
  generateBookingSummary,
  checkPaymentStatus,
  searchAvailableRooms,
  getAllBookings,
  addServicesToTempBooking,
  cancelBookingOnline,
  downloadInvoicePDF,
  findBookingByCode
}