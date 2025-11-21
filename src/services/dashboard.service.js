import httpClient from './httpClient'

const normalizeBookings = (bookings) => {
  if (!Array.isArray(bookings)) return []
  const bookingMap = new Map()
  bookings.forEach((booking) => {
    const key = booking?.booking_id
    if (key) {
      bookingMap.set(key, bookingMap.get(key) || booking)
    }
  })
  return Array.from(bookingMap.values())
}

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
      params: { page: 1, limit: 1000} 
    })
    const uniqueBookings = normalizeBookings(response?.bookings || [])
    return {
      total: uniqueBookings.length,
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
export const getBookingStatusStats = async () => {
  try {
    const response = await httpClient.get('/bookings', {
      params: { page: 1, limit: 1000 },
    })
    
    const bookings = response?.bookings || []

    const stats = {
      pending: 0,
      confirmed: 0,
      checked_in: 0,
      checked_out: 0,
      cancelled: 0,
      total: bookings.length,
    }
    
    bookings.forEach((booking) => {
      const status = booking.booking_status
      if (status && typeof stats[status] === 'number') {
        stats[status]++
      }
    })
    
    const pieData = [
      { type: 'Chờ xác nhận', value: stats.pending },
      { type: 'Đã xác nhận', value: stats.confirmed },
      { type: 'Đang ở', value: stats.checked_in },
      { type: 'Đã trả phòng', value: stats.checked_out },
      { type: 'Đã hủy', value: stats.cancelled },
    ].filter((item) => item.value > 0)
    
    return {
      stats,
      pieData,
      total: stats.total,
    }
  } catch (error) {
    console.error('Error getting booking status stats:', error)
    return {
      stats: {
        pending: 0,
        confirmed: 0,
        checked_in: 0,
        checked_out: 0,
        cancelled: 0,
        total: 0,

      },
      pieData: [],
      total: 0,
    }
  }
}

/**
 * Lấy danh sách khách sẽ check-in / check-out hôm nay
 */
export const getTodayCheckSchedules = async () => {
  try {
    const response = await httpClient.get('/bookings', {
      params: { page: 1, limit: 1000 },
    })

    const bookings = Array.isArray(response?.bookings) ? response.bookings : []
    const today = new Date()
    const todayDay = today.getDate()
    const todayMonth = today.getMonth()
    const todayYear = today.getFullYear()

    const isTodayOrTomorrow = (dateString) => {
      if (!dateString) return false
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return false
      const diff =
        new Date(date.getFullYear(), date.getMonth(), date.getDate()) -
        new Date(todayYear, todayMonth, todayDay)
      return diff >= 0 && diff <= 24 * 60 * 60 * 1000
    }
    const checkIns = bookings
      .filter((booking) => {
        if (!booking?.check_in_date) return false
        const date = new Date(booking.check_in_date)
        if (isNaN(date.getTime())) return false
        const isTodayCheckIn =
          date.getFullYear() === todayYear &&
          date.getMonth() === todayMonth &&
          date.getDate() === todayDay
        return isTodayCheckIn && booking.booking_status === 'confirmed'
      })
      .map((booking) => ({
        booking_id: booking.booking_id,
        booking_code: booking.booking_code || `BK-${booking.booking_id}`,
        customer_name: booking.user?.full_name || booking.customer_name || 'N/A',
        room_type: booking.room_type?.room_type_name || booking.room_type_name || 'N/A',
        check_time: booking.check_in_date,
        booking_status: booking.booking_status,
      }))

    const checkOuts = bookings
      .filter(
        (booking) =>
          isTodayOrTomorrow(booking.check_out_date) &&
          booking.booking_status === 'checked_in'
      )
      .map((booking) => ({
        booking_id: booking.booking_id,
        booking_code: booking.booking_code || `BK-${booking.booking_id}`,
        customer_name: booking.user?.full_name || booking.customer_name || 'N/A',
        room_type: booking.room_type?.room_type_name || booking.room_type_name || 'N/A',
        check_time: booking.check_out_date,
        booking_status: booking.booking_status,
      }))

    return { checkIns, checkOuts }
  } catch (error) {
    console.error('Error getting today schedules:', error)
    return { checkIns: [], checkOuts: [] }
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
  getBookingStatusStats,
  getTodayCheckSchedules,
  getBookingStatusColor,
  getBookingStatusText,
  formatDate
}

