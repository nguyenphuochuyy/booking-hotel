import httpClient from './httpClient'

/**
 * Service API functions
 */
export const serviceService = {
  /**
   * Lấy danh sách services
   * @param {Object} params - Query parameters (page, limit, search, hotel_id)
   * @returns {Promise} Response data
   */
  getServices: async (params = {}) => {
    try {
      const response = await httpClient.get('/services', { params })
      // httpClient trả về data trực tiếp, không cần .data
      return response
    } catch (error) {
      console.error('Error fetching services:', error)
      throw error
    }
  },

  /**
   * Lấy service theo ID
   * @param {number|string} id - Service ID
   * @returns {Promise} Response data
   */
  getServiceById: async (id) => {
    try {
      const response = await httpClient.get(`/services/${id}`)
      return response
    } catch (error) {
      console.error('Error fetching service by id:', error)
      throw error
    }
  }
}

export default serviceService

