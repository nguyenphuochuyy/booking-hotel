import { getBaseUrl } from './httpClient'

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

