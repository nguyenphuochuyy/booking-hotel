import { getBaseUrl } from './httpClient'
import httpClient from './httpClient'
import dayjs from 'dayjs'

/**
 * Helper function để download file từ API
 * @param {string} url - URL đầy đủ của API
 * @returns {Promise<Blob>} File blob
 */
async function downloadFileFromAPI(url) {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Tải file thất bại' }))
    throw new Error(errorData.message || `HTTP ${response.status}: Tải file thất bại`)
  }
  
  const blob = await response.blob()
  return blob
}

/**
 * Helper function để trigger download file
 * @param {Blob} blob - File blob
 * @param {string} filename - Tên file để download
 */
export function downloadBlob(blob, filename) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(link.href)
}

/**
 * Xuất báo cáo doanh thu Excel
 * @param {string} startDate - Ngày bắt đầu (format: YYYY-MM-DD)
 * @param {string} endDate - Ngày kết thúc (format: YYYY-MM-DD)
 * @returns {Promise<Blob>} Excel file blob
 */
export async function exportRevenueReportExcel(startDate, endDate) {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/reports/revenue?start_date=${startDate}&end_date=${endDate}`
  return downloadFileFromAPI(url)
}

/**
 * Xuất báo cáo doanh thu PDF
 * @param {string} startDate - Ngày bắt đầu (format: YYYY-MM-DD)
 * @param {string} endDate - Ngày kết thúc (format: YYYY-MM-DD)
 * @returns {Promise<Blob>} PDF file blob
 */
export async function exportRevenueReportPDF(startDate, endDate) {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/reports/revenue/pdf?start_date=${startDate}&end_date=${endDate}`
  return downloadFileFromAPI(url)
}

/**
 * Xuất báo cáo công suất phòng Excel
 * @param {string} startDate - Ngày bắt đầu (format: YYYY-MM-DD)
 * @param {string} endDate - Ngày kết thúc (format: YYYY-MM-DD)
 * @returns {Promise<Blob>} Excel file blob
 */
export async function exportOccupancyReport(startDate, endDate) {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/reports/occupancy?start_date=${startDate}&end_date=${endDate}`
  return downloadFileFromAPI(url)
}

/**
 * Xuất danh sách khách đến PDF
 * @param {string} date - Ngày (format: YYYY-MM-DD), nếu không có thì mặc định hôm nay
 * @returns {Promise<Blob>} PDF file blob
 */
export async function exportArrivalList(date = null) {
  const baseUrl = getBaseUrl()
  const url = date 
    ? `${baseUrl}/reports/arrivals?date=${date}`
    : `${baseUrl}/reports/arrivals`
  return downloadFileFromAPI(url)
}

/**
 * Xuất danh sách khách đi PDF
 * @param {string} date - Ngày (format: YYYY-MM-DD), nếu không có thì mặc định hôm nay
 * @returns {Promise<Blob>} PDF file blob
 */
export async function exportDepartureList(date = null) {
  const baseUrl = getBaseUrl()
  const url = date 
    ? `${baseUrl}/reports/departures?date=${date}`
    : `${baseUrl}/reports/departures`
  return downloadFileFromAPI(url)
}

/**
 * Xuất báo cáo tình trạng phòng PDF
 * @returns {Promise<Blob>} PDF file blob
 */
export async function exportRoomStatusReport() {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/reports/room-status`
  return downloadFileFromAPI(url)
}

/**
 * Lấy doanh thu theo tháng (mặc định 12 tháng gần nhất)
 * @param {Object} options
 * @param {number} options.months - số tháng cần lấy (tối thiểu 1)
 * @returns {Promise<Array<{date: string, revenue: number}>>}
 */
export async function getMonthlyRevenue({ months = 12 } = {}) {
  try {
    const safeMonths = Math.max(1, months)
    const endDate = dayjs().endOf('month')
    const startDate = endDate.subtract(safeMonths - 1, 'month').startOf('month')

    const response = await httpClient.get('/bookings', {
      params: { page: 1, limit: 1000 },
    })

    const bookings = Array.isArray(response?.bookings) ? response.bookings : []

    const revenueMap = {}

    bookings.forEach((booking) => {
      if (!booking || booking.booking_status === 'cancelled') {
        return
      }

      const bookingDate = dayjs(booking.created_at || booking.check_in_date)
      if (!bookingDate.isValid()) return

      if (bookingDate.isBefore(startDate) || bookingDate.isAfter(endDate)) {
        return
      }

      const monthKey = bookingDate.format('YYYY-MM')
      const revenue = parseFloat(booking.final_price) || parseFloat(booking.total_price) || 0
      if (Number.isNaN(revenue) || revenue <= 0) return

      if (!revenueMap[monthKey]) {
        revenueMap[monthKey] = {
          date: bookingDate.endOf('month').format('DD/MM/YYYY'),
          revenue: 0,
        }
      }

      revenueMap[monthKey].revenue += revenue
    })

    return Object.keys(revenueMap)
      .sort()
      .map((key) => ({
        date: revenueMap[key].date,
        revenue: revenueMap[key].revenue,
      }))
  } catch (error) {
    console.error('Error fetching monthly revenue:', error)
    return []
  }
}

/**
 * Lấy doanh thu theo 7 ngày gần nhất tính từ ngày hiện tại
 * @returns {Promise<Array<{date: string, revenue: number}>>}
 */
export async function getDailyRevenue() {
  try {
    const today = dayjs().startOf('day')
    const startDate = today.subtract(6, 'day').startOf('day')

    // Khởi tạo revenueMap cho 7 ngày (đảm bảo có đủ 7 ngày kể cả khi không có booking)
    const revenueMap = {}
    for (let i = 6; i >= 0; i--) {
      const date = today.subtract(i, 'day')
      const dateKey = date.format('YYYY-MM-DD')
      revenueMap[dateKey] = {
        date: date.format('DD/MM/YYYY'),
        revenue: 0,
      }
    }

    const response = await httpClient.get('/bookings', {
      params: { page: 1, limit: 1000 },
    })

    const bookings = Array.isArray(response?.bookings) ? response.bookings : []

    bookings.forEach((booking) => {
      if (!booking || booking.booking_status === 'cancelled') {
        return
      }

      const bookingDate = dayjs(booking.created_at || booking.check_in_date)
      if (!bookingDate.isValid()) return

      const bookingDay = bookingDate.startOf('day')

      // Kiểm tra xem booking có nằm trong 7 ngày gần nhất không
      if (bookingDay.isBefore(startDate) || bookingDay.isAfter(today)) {
        return
      }

      const dateKey = bookingDay.format('YYYY-MM-DD')
      const revenue = parseFloat(booking.final_price) || parseFloat(booking.total_price) || 0
      
      if (Number.isNaN(revenue) || revenue <= 0) return

      // Cộng doanh thu vào ngày tương ứng
      if (revenueMap[dateKey]) {
        revenueMap[dateKey].revenue += revenue
      }
    })

    // Trả về mảng đã sắp xếp theo thứ tự thời gian
    return Object.keys(revenueMap)
      .sort()
      .map((key) => ({
        date: revenueMap[key].date,
        revenue: revenueMap[key].revenue,
      }))
  } catch (error) {
    console.error('Error fetching daily revenue:', error)
    return []
  }
}

