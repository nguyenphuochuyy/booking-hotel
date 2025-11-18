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

/**
 * Lấy doanh thu theo ngày (7 ngày gần nhất)
 * @returns {Promise} Array chứa doanh thu theo từng ngày
 */
export const getRevenueByDay = async () => {
  try {
    const response = await httpClient.get('/bookings', { 
      params: { page: 1, limit: 1000 } 
    })
    
    // Khởi tạo object để lưu doanh thu theo ngày (7 ngày gần nhất)
    const now = new Date()
    const revenueByDay = {}
    
    // Tạo 7 ngày gần nhất
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      
      // Đảm bảo các giá trị hợp lệ
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error('Invalid date when creating revenueByDay structure:', { year, month, day })
        continue
      }
      
      const dayKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayLabel = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`
      revenueByDay[dayKey] = {
        day: dayKey,
        label: dayLabel,
        revenue: 0
      }
    }
    
    // Tính doanh thu từ các bookings đã thanh toán
    if (response?.bookings && Array.isArray(response.bookings)) {
      response.bookings
        .filter(booking => {
          // Chỉ tính các booking đã thanh toán và không bị hủy
          return booking.payment_status === 'paid' && 
                 booking.booking_status !== 'cancelled' &&
                 booking.final_price &&
                 booking.created_at // Đảm bảo có created_at
        })
        .forEach(booking => {
          // Validate và parse date
          const bookingDate = new Date(booking.created_at)
          
          // Kiểm tra xem date có hợp lệ không
          if (isNaN(bookingDate.getTime())) {
            console.warn('Invalid booking date:', booking.created_at, booking.booking_id)
            return // Bỏ qua booking có date không hợp lệ
          }
          
          bookingDate.setHours(0, 0, 0, 0)
          
          const year = bookingDate.getFullYear()
          const month = bookingDate.getMonth() + 1
          const day = bookingDate.getDate()
          
          // Kiểm tra lại xem các giá trị có hợp lệ không
          if (isNaN(year) || isNaN(month) || isNaN(day)) {
            console.warn('Invalid date values:', { year, month, day }, booking.booking_id)
            return
          }
          
          const dayKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          
          if (revenueByDay[dayKey]) {
            const price = parseFloat(booking.final_price) || parseFloat(booking.total_price) || 0
            if (!isNaN(price) && price > 0) {
              revenueByDay[dayKey].revenue += price
            }
          }
        })
    }
    
    // Chuyển đổi object thành array và sắp xếp theo ngày
    return Object.values(revenueByDay).sort((a, b) => a.day.localeCompare(b.day))
  } catch (error) {
    console.error('Error getting revenue by day:', error)
    return []
  }
}

/**
 * Lấy thống kê trạng thái phòng
 * @returns {Promise} Array chứa số lượng phòng theo từng trạng thái
 */
export const getRoomStatusStats = async () => {
  try {
    const response = await httpClient.get('/rooms', { 
      params: { page: 1, limit: 1000 } 
    })
    
    const rooms = response?.rooms || []
    
    // Đếm số lượng phòng theo từng trạng thái
    const stats = {
      available: 0,      // Phòng trống
      in_use: 0,         // Đang có khách
      booked: 0,         // Đã đặt (Sắp đến)
      cleaning: 0,       // Đang dọn dẹp
      checked_out: 0,    // Đã trả phòng
      cancelled: 0,      // Đã hủy
      total: rooms.length
    }
    
    rooms.forEach(room => {
      const status = room.status
      if (status === 'available') {
        stats.available++
      } else if (status === 'in_use') {
        stats.in_use++
      } else if (status === 'booked') {
        stats.booked++
      } else if (status === 'cleaning') {
        stats.cleaning++
      } else if (status === 'checked_out') {
        stats.checked_out++
      } else if (status === 'cancelled') {
        stats.cancelled++
      }
    })
    
    // Chuyển đổi thành format cho biểu đồ Pie
    const pieData = [
      { type: 'Đang có khách', value: stats.in_use },
      { type: 'Phòng trống', value: stats.available },
      { type: 'Đã đặt (Sắp đến)', value: stats.booked },
      { type: 'Đang dọn dẹp', value: stats.cleaning },
      { type: 'Đã hủy', value: stats.cancelled },
    ].filter(item => item.value > 0) // Chỉ hiển thị các trạng thái có phòng
    
    return {
      stats,
      pieData,
      total: stats.total
    }
  } catch (error) {
    console.error('Error getting room status stats:', error)
    return {
      stats: {
        available: 0,
        in_use: 0,
        booked: 0,
        cleaning: 0,
        checked_out: 0,
        cancelled: 0,
        total: 0

      },
      pieData: [],
      total: 0
    }
  }
}

export default {
  getTotalUsers,
  getTotalHotels,
  getTotalRooms,
  getTotalBookings,
  getTotalRevenue,
  getAllDashboardStats,
  getRecentBookings,
  getRevenueByDay,
  getRoomStatusStats,
  getBookingStatusColor,
  getBookingStatusText,
  formatDate
}

