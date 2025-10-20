import http from "./httpClient"
import { ADMIN } from "../constants/apiEndpoints"
import { buildUrl } from "../constants/apiEndpoints"

// ========== PUBLIC APIs (Không cần authentication) ==========

/**
 * Lấy danh sách giá phòng (Public)
 * @param {Object} params - Query parameters
 * @param {number} params.room_type_id - ID loại phòng
 * @param {string} params.start_date - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} params.end_date - Ngày kết thúc (YYYY-MM-DD)
 * @param {number} params.page - Trang hiện tại
 * @param {number} params.limit - Số lượng mỗi trang
 * @returns {Promise} Response từ API
 */
export async function getRoomPrices(params = {}) {
  return http.get(ADMIN.ROOM_PRICES.LIST, { params })
}

/**
 * Lấy giá phòng theo loại phòng và khoảng thời gian
 * @param {number} roomTypeId - ID loại phòng
 * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD)
 * @returns {Promise} Response từ API
 */
export async function getRoomPricesByTypeAndDate(roomTypeId, startDate, endDate) {
  return getRoomPrices({
    room_type_id: roomTypeId,
    start_date: startDate,
    end_date: endDate
  })
}

/**
 * Lấy giá phòng hiện tại cho một loại phòng
 * @param {number} roomTypeId - ID loại phòng
 * @returns {Promise} Response từ API
 */
export async function getCurrentRoomPrice(roomTypeId) {
  const today = new Date().toISOString().split('T')[0]
  return getRoomPrices({
    room_type_id: roomTypeId,
    start_date: today,
    end_date: today
  })
}

// ========== ADMIN APIs (Cần authentication + admin role) ==========

/**
 * Tạo giá phòng mới (Admin Only)
 * @param {Object} data - Dữ liệu giá phòng
 * @param {number} data.room_type_id - ID loại phòng
 * @param {string} data.start_date - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} data.end_date - Ngày kết thúc (YYYY-MM-DD)
 * @param {number} data.price_per_night - Giá mỗi đêm
 * @returns {Promise} Response từ API
 */
export async function createRoomPrice(data) {
  return http.post(ADMIN.ROOM_PRICES.CREATE, data)
}

/**
 * Cập nhật giá phòng (Admin Only)
 * @param {number} id - ID của giá phòng
 * @param {Object} data - Dữ liệu cập nhật
 * @param {string} data.start_date - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} data.end_date - Ngày kết thúc (YYYY-MM-DD)
 * @param {number} data.price_per_night - Giá mỗi đêm
 * @returns {Promise} Response từ API
 */
export async function updateRoomPrice(id, data) {
  const url = buildUrl(ADMIN.ROOM_PRICES.UPDATE, { id })
  return http.put(url, data)
}

/**
 * Xóa giá phòng (Admin Only)
 * @param {number} id - ID của giá phòng
 * @returns {Promise} Response từ API
 */
export async function deleteRoomPrice(id) {
  const url = buildUrl(ADMIN.ROOM_PRICES.DELETE, { id })
  return http.delete(url)
}

// ========== HELPER FUNCTIONS ==========

/**
 * Validate dữ liệu giá phòng trước khi gửi
 * @param {Object} data - Dữ liệu giá phòng
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateRoomPriceData(data) {
  const errors = []
  
  if (!data.room_type_id || isNaN(data.room_type_id)) {
    errors.push('ID loại phòng là bắt buộc và phải là số')
  }
  
  if (!data.start_date) {
    errors.push('Ngày bắt đầu là bắt buộc')
  } else if (!isValidDate(data.start_date)) {
    errors.push('Ngày bắt đầu không hợp lệ (định dạng: YYYY-MM-DD)')
  }
  
  if (!data.end_date) {
    errors.push('Ngày kết thúc là bắt buộc')
  } else if (!isValidDate(data.end_date)) {
    errors.push('Ngày kết thúc không hợp lệ (định dạng: YYYY-MM-DD)')
  }
  
  if (data.start_date && data.end_date && new Date(data.start_date) >= new Date(data.end_date)) {
    errors.push('Ngày bắt đầu phải trước ngày kết thúc')
  }
  
  if (!data.price_per_night || isNaN(data.price_per_night) || data.price_per_night < 0) {
    errors.push('Giá mỗi đêm phải là số không âm')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Kiểm tra định dạng ngày
 * @param {string} dateString - Chuỗi ngày
 * @returns {boolean} True nếu hợp lệ
 */
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false
  
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date)
}

/**
 * Tính tổng giá cho số đêm
 * @param {number} pricePerNight - Giá mỗi đêm
 * @param {string} startDate - Ngày bắt đầu
 * @param {string} endDate - Ngày kết thúc
 * @returns {number} Tổng giá
 */
export function calculateTotalPrice(pricePerNight, startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  return pricePerNight * nights
}

/**
 * Lấy giá phòng trong khoảng thời gian với xử lý overlap
 * @param {number} roomTypeId - ID loại phòng
 * @param {string} startDate - Ngày bắt đầu
 * @param {string} endDate - Ngày kết thúc
 * @returns {Promise} Response từ API với giá phù hợp
 */
export async function getRoomPriceForPeriod(roomTypeId, startDate, endDate) {
  try {
    const response = await getRoomPricesByTypeAndDate(roomTypeId, startDate, endDate)
    
    if (response.data && response.data.length > 0) {
      // Tìm giá phù hợp nhất (có thể cần logic phức tạp hơn)
      const prices = response.data
      const targetStart = new Date(startDate)
      const targetEnd = new Date(endDate)
      
      // Sắp xếp theo ngày bắt đầu
      prices.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
      
      // Tìm giá phù hợp (đơn giản: lấy giá đầu tiên)
      const suitablePrice = prices.find(price => {
        const priceStart = new Date(price.start_date)
        const priceEnd = new Date(price.end_date)
        return targetStart >= priceStart && targetEnd <= priceEnd
      })
      
      return {
        ...response,
        data: suitablePrice || prices[0] // Fallback về giá đầu tiên
      }
    }
    
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Tạo giá phòng cho nhiều khoảng thời gian
 * @param {number} roomTypeId - ID loại phòng
 * @param {Array} priceRanges - Mảng các khoảng thời gian và giá
 * @param {string} priceRanges[].start_date - Ngày bắt đầu
 * @param {string} priceRanges[].end_date - Ngày kết thúc
 * @param {number} priceRanges[].price_per_night - Giá mỗi đêm
 * @returns {Promise} Mảng các response từ API
 */
export async function createMultipleRoomPrices(roomTypeId, priceRanges) {
  const promises = priceRanges.map(range => 
    createRoomPrice({
      room_type_id: roomTypeId,
      ...range
    })
  )
  
  return Promise.all(promises)
}

/**
 * Cập nhật giá phòng theo mùa
 * @param {number} roomTypeId - ID loại phòng
 * @param {Object} seasonalPrices - Giá theo mùa
 * @param {Object} seasonalPrices.spring - Giá mùa xuân
 * @param {Object} seasonalPrices.summer - Giá mùa hè
 * @param {Object} seasonalPrices.autumn - Giá mùa thu
 * @param {Object} seasonalPrices.winter - Giá mùa đông
 * @returns {Promise} Mảng các response từ API
 */
export async function updateSeasonalPrices(roomTypeId, seasonalPrices) {
  const currentYear = new Date().getFullYear()
  const seasons = {
    spring: { start: `${currentYear}-03-01`, end: `${currentYear}-05-31` },
    summer: { start: `${currentYear}-06-01`, end: `${currentYear}-08-31` },
    autumn: { start: `${currentYear}-09-01`, end: `${currentYear}-11-30` },
    winter: { start: `${currentYear}-12-01`, end: `${currentYear + 1}-02-28` }
  }
  
  const priceRanges = []
  
  Object.keys(seasonalPrices).forEach(season => {
    if (seasonalPrices[season] && seasons[season]) {
      priceRanges.push({
        start_date: seasons[season].start,
        end_date: seasons[season].end,
        price_per_night: seasonalPrices[season]
      })
    }
  })
  
  return createMultipleRoomPrices(roomTypeId, priceRanges)
}
