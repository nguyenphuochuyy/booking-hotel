import httpClient from './httpClient'
import { API_ENDPOINTS } from '../constants/apiEndpoints'
import { 
  getAllHotels, 
} from './admin.service'
export const hotelService = {
  // Lấy danh sách hotels
  getHotels: async (params = {}) => {
    const response = await httpClient.get(API_ENDPOINTS.HOTELS.LIST, { params })
    return response.data
  },

  // Lấy hotel theo ID
  getHotelById: async (id) => {
    const response = await httpClient.get(API_ENDPOINTS.HOTELS.DETAIL.replace(':id', id))
    return response.data
  },

  // Tạo hotel mới (Admin Only)
  createHotel: async (formData) => {
    const response = await httpClient.post(API_ENDPOINTS.HOTELS.LIST, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Cập nhật hotel (Admin Only)
  updateHotel: async (id, formData) => {
    const response = await httpClient.put(API_ENDPOINTS.HOTELS.DETAIL.replace(':id', id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Xóa hotel (Admin Only)
  deleteHotel: async (id) => {
    const response = await httpClient.delete(API_ENDPOINTS.HOTELS.DETAIL.replace(':id', id))
    return response.data
  },

  // Tìm kiếm hotels
  searchHotels: async (searchTerm, options = {}) => {
    const params = {
      search: searchTerm,
      ...options
    }
    return hotelService.getHotels(params)
  },

  // Lấy hotels cho dropdown
  getHotelsForSelect: async () => {
    try {
      const response = await getAllHotels({ limit: 100 }) // Lấy tối đa 100 hotels
      return response?.hotels || []
    } catch (error) {
      console.error('Error fetching hotels for select:', error)
      return []
    }
  },

  // Lấy featured hotels
  getFeaturedHotels: async (options = {}) => {
    const params = {
      featured: true,
      ...options
    }
    return hotelService.getHotels(params)
  }
}
