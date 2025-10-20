import http from "./httpClient"
import { ADMIN } from "../constants/apiEndpoints"
import { buildUrl } from "../constants/apiEndpoints"

// ========== PUBLIC APIs (Không cần authentication) ==========

/**
 * Lấy danh sách loại phòng (Public)
 * @param {Object} params - Query parameters
 * @param {string} params.search - Tìm kiếm theo tên loại phòng
 * @param {string} params.category - Lọc theo danh mục (don-vip, don-thuong, etc.)
 * @param {number} params.page - Trang hiện tại
 * @param {number} params.limit - Số lượng mỗi trang
 * @returns {Promise} Response từ API
 */
export async function getRoomTypes(params = {}) {
  return http.get(ADMIN.ROOM_TYPES.LIST, { params })
}

/**
 * Lấy chi tiết loại phòng theo ID (Public)
 * @param {number} id - ID của loại phòng
 * @returns {Promise} Response từ API
 */
export async function getRoomTypeById(id) {
  const url = buildUrl(ADMIN.ROOM_TYPES.DETAIL, { id })
  return http.get(url)
}

// ========== ADMIN APIs (Cần authentication + admin role) ==========

/**
 * Tạo loại phòng mới (Admin Only)
 * @param {FormData} formData - Dữ liệu form với ảnh
 * @param {string} formData.room_type_name - Tên loại phòng
 * @param {string} formData.category - Danh mục loại phòng
 * @param {number} formData.capacity - Sức chứa
 * @param {string} formData.description - Mô tả
 * @param {string} formData.amenities - Tiện nghi (JSON string)
 * @param {number} formData.area - Diện tích
 * @param {number} formData.quantity - Số lượng
 * @param {File[]} formData.images - Mảng ảnh
 * @returns {Promise} Response từ API
 */
export async function createRoomType(formData) {
  return http.post(ADMIN.ROOM_TYPES.CREATE, formData)
}

/**
 * Cập nhật loại phòng (Admin Only)
 * @param {number} id - ID của loại phòng
 * @param {FormData} formData - Dữ liệu form với ảnh
 * @param {string} formData.room_type_name - Tên loại phòng
 * @param {string} formData.category - Danh mục loại phòng
 * @param {number} formData.capacity - Sức chứa
 * @param {string} formData.description - Mô tả
 * @param {string} formData.amenities - Tiện nghi (JSON string)
 * @param {number} formData.area - Diện tích
 * @param {number} formData.quantity - Số lượng
 * @param {File[]} formData.images - Mảng ảnh (gửi để thay TOÀN BỘ ảnh)
 * @returns {Promise} Response từ API
 */
export async function updateRoomType(id, formData) {
  const url = buildUrl(ADMIN.ROOM_TYPES.UPDATE, { id })
  return http.put(url, formData)
}

/**
 * Xóa loại phòng (Admin Only)
 * @param {number} id - ID của loại phòng
 * @returns {Promise} Response từ API
 */
export async function deleteRoomType(id) {
  const url = buildUrl(ADMIN.ROOM_TYPES.DELETE, { id })
  return http.delete(url)
}

// ========== HELPER FUNCTIONS ==========

/**
 * Tạo FormData cho việc tạo/cập nhật room type
 * @param {Object} data - Dữ liệu room type
 * @param {File[]} images - Mảng ảnh
 * @returns {FormData} FormData object
 */
export function createRoomTypeFormData(data, images = []) {
  const formData = new FormData()
  
  // Thêm các field text
  if (data.room_type_name) formData.append('room_type_name', data.room_type_name)
  if (data.category) formData.append('category', data.category)
  if (data.capacity) formData.append('capacity', data.capacity.toString())
  if (data.description) formData.append('description', data.description)
  if (data.amenities) {
    // Nếu amenities là object, chuyển thành JSON string
    const amenitiesStr = typeof data.amenities === 'string' 
      ? data.amenities 
      : JSON.stringify(data.amenities)
    formData.append('amenities', amenitiesStr)
  }
  if (data.area) formData.append('area', data.area.toString())
  if (data.quantity) formData.append('quantity', data.quantity.toString())
  
  // Thêm ảnh
  images.forEach((image, index) => {
    if (image instanceof File) {
      formData.append('images', image)
    }
  })
  
  return formData
}

/**
 * Validate dữ liệu room type trước khi gửi
 * @param {Object} data - Dữ liệu room type
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateRoomTypeData(data) {
  const errors = []
  
  if (!data.room_type_name || data.room_type_name.trim() === '') {
    errors.push('Tên loại phòng là bắt buộc')
  }
  
  if (data.capacity && (isNaN(data.capacity) || data.capacity < 1)) {
    errors.push('Sức chứa phải là số dương')
  }
  
  if (data.area && (isNaN(data.area) || data.area < 0)) {
    errors.push('Diện tích phải là số không âm')
  }
  
  if (data.quantity && (isNaN(data.quantity) || data.quantity < 0)) {
    errors.push('Số lượng phải là số không âm')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Lấy danh sách loại phòng với pagination và search
 * @param {Object} options - Tùy chọn tìm kiếm
 * @param {string} options.search - Từ khóa tìm kiếm
 * @param {string} options.category - Danh mục lọc
 * @param {number} options.page - Trang hiện tại
 * @param {number} options.limit - Số lượng mỗi trang
 * @returns {Promise} Response từ API
 */
export async function searchRoomTypes(options = {}) {
  const params = {
    page: options.page || 1,
    limit: options.limit || 10,
    ...(options.search && { search: options.search }),
    ...(options.category && { category: options.category })
  }
  
  return getRoomTypes(params)
}

/**
 * Lấy loại phòng theo danh mục
 * @param {string} category - Danh mục loại phòng
 * @param {Object} options - Tùy chọn bổ sung
 * @returns {Promise} Response từ API
 */
export async function getRoomTypesByCategory(category, options = {}) {
  return searchRoomTypes({ ...options, category })
}

/**
 * Lấy loại phòng phổ biến (có thể mở rộng thêm logic)
 * @param {number} limit - Số lượng tối đa
 * @returns {Promise} Response từ API
 */
export async function getPopularRoomTypes(limit = 6) {
  return getRoomTypes({ limit })
}
