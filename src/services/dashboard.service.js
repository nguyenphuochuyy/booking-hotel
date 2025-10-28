import httpClient from './httpClient'

// ========== DASHBOARD STATISTICS SERVICES ==========

/**
 * Lấy tổng số người dùng
 * @returns {Promise} Response với totalUsers
 */
export const getTotalUsers = async () => {
  try {
    const response = await httpClient.get('/users', { 
      params: { page: 1, limit: 1 } 
    })
    return {
      total: response?.pagination?.totalUsers || response?.users?.length || 0,
      message: 'Thành công'
    }
  } catch (error) {
    console.error('Error getting total users:', error)
    return { total: 0, message: 'Có lỗi xảy ra' }
  }
}

/**
 * Lấy tổng số khách sạn
 * @returns {Promise} Response với totalHotels
 */
export const getTotalHotels = async () => {
  try {
    const response = await httpClient.get('/hotels', { 
      params: { page: 1, limit: 1 } 
    })
    return {
      total: response?.pagination?.totalItems || response?.hotels?.length || 0,
      message: 'Thành công'
    }
  } catch (error) {
    console.error('Error getting total hotels:', error)
    return { total: 0, message: 'Có lỗi xảy ra' }
  }
}

/**
 * Lấy tổng số phòng
 * @returns {Promise} Response với totalRooms
 */
export const getTotalRooms = async () => {
  try {
    const response = await httpClient.get('/rooms', { 
      params: { page: 1, limit: 1 } 
    })
    return {
      total: response?.total || response?.rooms?.length || 0,
      message: 'Thành công'
    }
  } catch (error) {
    console.error('Error getting total rooms:', error)
    return { total: 0, message: 'Có lỗi xảy ra' }
  }
}

/**
 * Lấy tổng số bookings
 * @returns {Promise} Response với totalBookings
 */
export const getTotalBookings = async () => {
  try {
    const response = await httpClient.get('/bookings', { 
      params: { page: 1, limit: 1 } 
    })
    return {
      total: response?.pagination?.totalItems || response?.bookings?.length || 0,
      message: 'Thành công'
    }
  } catch (error) {
    console.error('Error getting total bookings:', error)
    return { total: 0, message: 'Có lỗi xảy ra' }
  }
}

/**
 * Lấy tổng doanh thu từ tất cả bookings đã thanh toán
 * @returns {Promise} Response với totalRevenue
 */
export const getTotalRevenue = async () => {
  try {
    const response = await httpClient.get('/bookings', { 
      params: { page: 1, limit: 1000 } 
    })
    
    // Tính tổng doanh thu từ các bookings đã paid (payment_status = 'paid')
    let totalRevenue = 0
    if (response?.bookings && Array.isArray(response.bookings)) {
      totalRevenue = response.bookings
        .filter(booking => booking.payment_status === 'paid' && booking.final_price)
        .reduce((sum, booking) => {
          const price = parseFloat(booking.final_price) || parseFloat(booking.total_price) || 0
          return sum + price
        }, 0)
    }
    
    return {
      total: totalRevenue,
      message: 'Thành công'
    }
  } catch (error) {
    console.error('Error getting total revenue:', error)
    return { total: 0, message: 'Có lỗi xảy ra' }
  }
}

/**
 * Lấy danh sách booking gần đây
 * @param {number} limit - Số lượng booking (mặc định 5)
 * @returns {Promise} Array bookings gần đây
 */
export const getRecentBookings = async (limit = 5) => {
  try {
    const response = await httpClient.get('/bookings', { 
      params: { page: 1, limit } 
    })
    return response?.bookings || []
  } catch (error) {
    console.error('Error getting recent bookings:', error)
    return []
  }
}

/**
 * Lấy tất cả thống kê cùng lúc
 * @returns {Promise} Object chứa tất cả stats và recent bookings
 */
export const getAllDashboardStats = async () => {
  try {
    const [usersData, hotelsData, roomsData, bookingsData, revenueData, recentBookings] = await Promise.all([
      getTotalUsers(),
      getTotalHotels(),
      getTotalRooms(),
      getTotalBookings(),
      getTotalRevenue(),
      getRecentBookings(5)
    ])

    return {
      totalUsers: usersData.total,
      totalHotels: hotelsData.total,
      totalRooms: roomsData.total,
      totalBookings: bookingsData.total,
      totalRevenue: revenueData.total,
      recentBookings: recentBookings
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return {
      totalUsers: 0,
      totalHotels: 0,
      totalRooms: 0,
      totalBookings: 0,
      totalRevenue: 0,
      recentBookings: []
    }
  }
}

/**
 * Get booking status color for Tag
 */
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

/**
 * Get booking status text in Vietnamese
 */
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

/**
 * Format date to Vietnamese format
 */
export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export default {
  getTotalUsers,
  getTotalHotels,
  getTotalRooms,
  getTotalBookings,
  getTotalRevenue,
  getAllDashboardStats,
  getRecentBookings,
  getBookingStatusColor,
  getBookingStatusText,
  formatDate
}

