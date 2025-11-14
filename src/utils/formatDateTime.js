import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

// Sử dụng plugin UTC
dayjs.extend(utc)

/**
 * Format date string về dạng "HH:mm DD/MM/YYYY"
 * @param {string|Date} dateString - Chuỗi ngày tháng hoặc Date object
 * @returns {string} - Chuỗi đã format theo dạng "HH:mm DD/MM/YYYY"
 */
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    // Dùng .utc() để bắt buộc Day.js xử lý chuỗi ở dạng UTC
    const formattedDate = dayjs.utc(dateString).format('HH:mm DD/MM/YYYY')
    return formattedDate
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'N/A'
  }
}

export default formatDateTime

