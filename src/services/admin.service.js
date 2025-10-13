import http from './httpClient'
import { ADMIN, buildUrl } from '../constants/apiEndpoints'

// ==================== USER MANAGEMENT ====================

/**
 * Lấy danh sách tất cả người dùng (Admin only)
 * @param {Object} params - { page, limit, search }
 * @returns {Promise}
 */
export async function getAllUsers(params = {}) {
  return http.get(ADMIN.USERS.LIST, { params })
}

/**
 * Lấy thông tin người dùng theo ID
 * @param {number|string} id - User ID
 * @returns {Promise}
 */
export async function getUserById(id) {
  const url = buildUrl(ADMIN.USERS.DETAIL, { id })
  return http.get(url)
}

/**
 * Tạo người dùng mới
 * @param {Object} userData - Thông tin người dùng
 * @returns {Promise}
 */
export async function createUser(userData) {
  return http.post(ADMIN.USERS.CREATE, userData)
}

/**
 * Cập nhật thông tin người dùng
 * @param {number|string} id - User ID
 * @param {Object} userData - Thông tin cần cập nhật
 * @returns {Promise}
 */
export async function updateUser(id, userData) {
  const url = buildUrl(ADMIN.USERS.UPDATE, { id })
  return http.put(url, userData)
}

/**
 * Xóa người dùng
 * @param {number|string} id - User ID
 * @returns {Promise}
 */
export async function deleteUser(id) {
  const url = buildUrl(ADMIN.USERS.DELETE, { id })
  return http.delete(url)
}

/**
 * Tìm kiếm người dùng theo email
 * @param {string} email - Email cần tìm
 * @returns {Promise}
 */
export async function searchUserByEmail(email) {
  return http.get(ADMIN.USERS.SEARCH, { params: { email } })
}

// ==================== HOTEL MANAGEMENT ====================

/**
 * Lấy danh sách khách sạn
 * @param {Object} params - { page, limit, search }
 * @returns {Promise}
 */
export async function getAllHotels(params = {}) {
  return http.get(ADMIN.HOTELS.LIST, { params })
}

/**
 * Lấy thông tin khách sạn theo ID
 * @param {number|string} id - Hotel ID
 * @returns {Promise}
 */
export async function getHotelById(id) {
  const url = buildUrl(ADMIN.HOTELS.DETAIL, { id })
  return http.get(url)
}

/**
 * Tạo khách sạn mới
 * @param {FormData} formData - Form data với images
 * @returns {Promise}
 */
export async function createHotel(formData) {
  return http.post(ADMIN.HOTELS.CREATE, formData)
}

/**
 * Cập nhật thông tin khách sạn
 * @param {number|string} id - Hotel ID
 * @param {FormData} formData - Form data với images
 * @returns {Promise}
 */
export async function updateHotel(id, formData) {
  const url = buildUrl(ADMIN.HOTELS.UPDATE, { id })
  return http.put(url, formData)
}

/**
 * Xóa khách sạn
 * @param {number|string} id - Hotel ID
 * @returns {Promise}
 */
export async function deleteHotel(id) {
  const url = buildUrl(ADMIN.HOTELS.DELETE, { id })
  return http.delete(url)
}

// ==================== ROOM TYPE MANAGEMENT ====================

/**
 * Lấy danh sách loại phòng
 * @param {Object} params - { page, limit, search }
 * @returns {Promise}
 */
export async function getAllRoomTypes(params = {}) {
  return http.get(ADMIN.ROOM_TYPES.LIST, { params })
}

/**
 * Lấy thông tin loại phòng theo ID
 * @param {number|string} id - Room Type ID
 * @returns {Promise}
 */
export async function getRoomTypeById(id) {
  const url = buildUrl(ADMIN.ROOM_TYPES.DETAIL, { id })
  return http.get(url)
}

/**
 * Tạo loại phòng mới
 * @param {FormData} formData - Form data với images
 * @returns {Promise}
 */
export async function createRoomType(formData) {
  return http.post(ADMIN.ROOM_TYPES.CREATE, formData)
}

/**
 * Cập nhật loại phòng
 * @param {number|string} id - Room Type ID
 * @param {FormData} formData - Form data với images
 * @returns {Promise}
 */
export async function updateRoomType(id, formData) {
  const url = buildUrl(ADMIN.ROOM_TYPES.UPDATE, { id })
  return http.put(url, formData)
}

/**
 * Xóa loại phòng
 * @param {number|string} id - Room Type ID
 * @returns {Promise}
 */
export async function deleteRoomType(id) {
  const url = buildUrl(ADMIN.ROOM_TYPES.DELETE, { id })
  return http.delete(url)
}

// ==================== ROOM MANAGEMENT ====================

/**
 * Lấy danh sách phòng
 * @param {Object} params - { page, limit, hotel_id }
 * @returns {Promise}
 */
export async function getAllRooms(params = {}) {
  return http.get(ADMIN.ROOMS.LIST, { params })
}

/**
 * Lấy thông tin phòng theo ID
 * @param {number|string} id - Room ID
 * @returns {Promise}
 */
export async function getRoomById(id) {
  const url = buildUrl(ADMIN.ROOMS.DETAIL, { id })
  return http.get(url)
}

/**
 * Tạo phòng mới
 * @param {Object} roomData - Thông tin phòng
 * @returns {Promise}
 */
export async function createRoom(roomData) {
  return http.post(ADMIN.ROOMS.CREATE, roomData)
}

/**
 * Cập nhật phòng
 * @param {number|string} id - Room ID
 * @param {Object} roomData - Thông tin cần cập nhật
 * @returns {Promise}
 */
export async function updateRoom(id, roomData) {
  const url = buildUrl(ADMIN.ROOMS.UPDATE, { id })
  return http.put(url, roomData)
}

/**
 * Xóa phòng
 * @param {number|string} id - Room ID
 * @returns {Promise}
 */
export async function deleteRoom(id) {
  const url = buildUrl(ADMIN.ROOMS.DELETE, { id })
  return http.delete(url)
}

// ==================== ROOM PRICE MANAGEMENT ====================

/**
 * Lấy danh sách giá phòng
 * @param {Object} params - { room_type_id }
 * @returns {Promise}
 */
export async function getAllRoomPrices(params = {}) {
  return http.get(ADMIN.ROOM_PRICES.LIST, { params })
}

/**
 * Tạo giá phòng mới
 * @param {Object} priceData - Thông tin giá phòng
 * @returns {Promise}
 */
export async function createRoomPrice(priceData) {
  return http.post(ADMIN.ROOM_PRICES.CREATE, priceData)
}

/**
 * Cập nhật giá phòng
 * @param {number|string} id - Price ID
 * @param {Object} priceData - Thông tin cần cập nhật
 * @returns {Promise}
 */
export async function updateRoomPrice(id, priceData) {
  const url = buildUrl(ADMIN.ROOM_PRICES.UPDATE, { id })
  return http.put(url, priceData)
}

/**
 * Xóa giá phòng
 * @param {number|string} id - Price ID
 * @returns {Promise}
 */
export async function deleteRoomPrice(id) {
  const url = buildUrl(ADMIN.ROOM_PRICES.DELETE, { id })
  return http.delete(url)
}

// ==================== SERVICE MANAGEMENT ====================

/**
 * Lấy danh sách dịch vụ
 * @param {Object} params - { page, limit, search, hotel_id }
 * @returns {Promise}
 */
export async function getAllServices(params = {}) {
  return http.get(ADMIN.SERVICES.LIST, { params })
}

/**
 * Lấy thông tin dịch vụ theo ID
 * @param {number|string} id - Service ID
 * @returns {Promise}
 */
export async function getServiceById(id) {
  const url = buildUrl(ADMIN.SERVICES.DETAIL, { id })
  return http.get(url)
}

/**
 * Tạo dịch vụ mới
 * @param {FormData} formData - Form data với images
 * @returns {Promise}
 */
export async function createService(formData) {
  return http.post(ADMIN.SERVICES.CREATE, formData)
}

/**
 * Cập nhật dịch vụ
 * @param {number|string} id - Service ID
 * @param {FormData} formData - Form data với images
 * @returns {Promise}
 */
export async function updateService(id, formData) {
  const url = buildUrl(ADMIN.SERVICES.UPDATE, { id })
  return http.put(url, formData)
}

/**
 * Xóa dịch vụ
 * @param {number|string} id - Service ID
 * @returns {Promise}
 */
export async function deleteService(id) {
  const url = buildUrl(ADMIN.SERVICES.DELETE, { id })
  return http.delete(url)
}

export default {
  // Users
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUserByEmail,
  // Hotels
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  // Room Types
  getAllRoomTypes,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  // Rooms
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  // Room Prices
  getAllRoomPrices,
  createRoomPrice,
  updateRoomPrice,
  deleteRoomPrice,
  // Services
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
}

