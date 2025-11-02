import httpClient from './httpClient'

/**
 * Lấy danh sách reviews theo room type
 * @param {number|string} roomTypeId - Room type ID
 * @param {Object} params - { page, limit }
 * @returns {Promise}
 */
export const getReviewsByRoomType = async (roomTypeId, params = {}) => {
  try {
    const response = await httpClient.get(`/reviews/room-type/${roomTypeId}`, { params })
    // Response có thể trả về trực tiếp hoặc trong data
    return response?.data || response
  } catch (error) {
    console.error('Error getting reviews by room type:', error)
    // Return empty structure on error instead of throwing
    return {
      reviews: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        pageSize: params.limit || 5
      }
    }
  }
}

/**
 * Tạo review mới
 * @param {Object} reviewData - { booking_id, rating, comment, images }
 * @returns {Promise}
 */
export const createReview = async (reviewData) => {
  try {
    const formData = new FormData()
    formData.append('booking_id', reviewData.booking_id)
    formData.append('rating', reviewData.rating)
    formData.append('comment', reviewData.comment || '')
    
    if (reviewData.images && Array.isArray(reviewData.images)) {
      reviewData.images.forEach((image, index) => {
        formData.append('images', image)
      })
    }
    
    // Không set Content-Type header, httpClient sẽ tự động xử lý FormData và thêm boundary
    const response = await httpClient.post('/reviews', formData)
    return response?.data || response
  } catch (error) {
    console.error('Error creating review:', error)
    throw error
  }
}

