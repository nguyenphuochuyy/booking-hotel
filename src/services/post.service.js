import httpClient from './httpClient'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

/**
 * Service để quản lý posts/news
 */
export const postService = {
  /**
   * Lấy danh sách posts với phân trang và filter
   * @param {Object} params - Tham số tìm kiếm
   * @param {number} params.page - Trang hiện tại (default: 1)
   * @param {number} params.limit - Số lượng items per page (default: 10)
   * @param {string} params.status - Trạng thái post ('published', 'draft')
   * @param {number} params.category_id - ID danh mục
   * @param {string} params.search - Từ khóa tìm kiếm
   * @param {string} params.tag - Tag để filter
   * @returns {Promise<Object>} - { posts, pagination }
   */
  async getPosts(params = {}) {
    try {
      const response = await httpClient.get(API_ENDPOINTS.POSTS.GET_POSTS, {
        params: {
          page: 1,
          limit: 10,
          status: 'published', // Chỉ lấy posts đã publish
          ...params
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching posts:', error)
      throw error
    }
  },

  /**
   * Lấy post theo ID
   * @param {number} id - Post ID
   * @returns {Promise<Object>} - Post data
   */
  async getPostById(id) {
    try {
      const response = await httpClient.get(API_ENDPOINTS.POSTS.GET_POST_BY_ID(id))
      return response.data
    } catch (error) {
      console.error('Error fetching post by ID:', error)
      throw error
    }
  },

  /**
   * Lấy post theo slug
   * @param {string} slug - Post slug
   * @returns {Promise<Object>} - Post data
   */
  async getPostBySlug(slug) {
    try {
      const response = await httpClient.get(API_ENDPOINTS.POSTS.GET_POST_BY_SLUG(slug))
      return response.data
    } catch (error) {
      console.error('Error fetching post by slug:', error)
      throw error
    }
  },

  /**
   * Tạo post mới (Admin only)
   * @param {FormData} formData - Form data với files
   * @returns {Promise<Object>} - Created post
   */
  async createPost(formData) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.POSTS.CREATE_POST, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  },

  /**
   * Cập nhật post (Admin only)
   * @param {number} id - Post ID
   * @param {FormData} formData - Form data với files
   * @returns {Promise<Object>} - Updated post
   */
  async updatePost(id, formData) {
    try {
      const response = await httpClient.put(API_ENDPOINTS.POSTS.UPDATE_POST(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error updating post:', error)
      throw error
    }
  },

  /**
   * Xóa post (Admin only)
   * @param {number} id - Post ID
   * @returns {Promise<Object>} - Success message
   */
  async deletePost(id) {
    try {
      const response = await httpClient.delete(API_ENDPOINTS.POSTS.DELETE_POST(id))
      return response.data
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  },

  /**
   * Tìm kiếm posts
   * @param {Object} options - Tùy chọn tìm kiếm
   * @returns {Promise<Object>} - Search results
   */
  async searchPosts(options = {}) {
    return this.getPosts({
      search: options.keyword,
      category_id: options.categoryId,
      tag: options.tag,
      page: options.page || 1,
      limit: options.limit || 10
    })
  },

  /**
   * Lấy posts theo danh mục
   * @param {number} categoryId - Category ID
   * @param {Object} options - Tùy chọn
   * @returns {Promise<Object>} - Posts in category
   */
  async getPostsByCategory(categoryId, options = {}) {
    return this.getPosts({
      category_id: categoryId,
      page: options.page || 1,
      limit: options.limit || 10
    })
  },

  /**
   * Lấy posts mới nhất
   * @param {number} limit - Số lượng posts
   * @returns {Promise<Object>} - Latest posts
   */
  async getLatestPosts(limit = 5) {
    return this.getPosts({
      limit,
      page: 1
    })
  },

  /**
   * Lấy posts phổ biến (có thể implement sau)
   * @param {number} limit - Số lượng posts
   * @returns {Promise<Object>} - Popular posts
   */
  async getPopularPosts(limit = 5) {
    // TODO: Implement popular posts logic
    return this.getLatestPosts(limit)
  }
}

export default postService
