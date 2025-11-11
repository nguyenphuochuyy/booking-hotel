import httpClient from './httpClient'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

export const categoryService = {
  // Lấy danh sách categories
  getCategories: async (params = {}) => {
    const response = await httpClient.get(API_ENDPOINTS.CATEGORIES.GET_CATEGORIES, { params })
    return response
  },

  // Lấy category theo ID
  getCategoryById: async (id) => {
    const response = await httpClient.get(API_ENDPOINTS.CATEGORIES.GET_CATEGORY_BY_ID(id))
    return response
  },

  // Lấy category theo slug
  getCategoryBySlug: async (slug) => {
    const response = await httpClient.get(API_ENDPOINTS.CATEGORIES.GET_CATEGORY_BY_SLUG(slug))
    return response
  },

  // Tạo category mới (Admin Only)
  createCategory: async (data) => {
    const response = await httpClient.post(API_ENDPOINTS.CATEGORIES.CREATE_CATEGORY, data)
    return response
  },

  // Cập nhật category (Admin Only)
  updateCategory: async (id, data) => {
    const response = await httpClient.put(API_ENDPOINTS.CATEGORIES.UPDATE_CATEGORY(id), data)
    return response
  },

  // Xóa category (Admin Only)
  deleteCategory: async (id) => {
    const response = await httpClient.delete(API_ENDPOINTS.CATEGORIES.DELETE_CATEGORY(id))
    return response
  },

  // Tìm kiếm categories
  searchCategories: async (searchTerm, options = {}) => {
    const params = {
      search: searchTerm,
      ...options
    }
    return categoryService.getCategories(params)
  },

  // Lấy categories cho dropdown
  getCategoriesForSelect: async () => {
    try {
      const response = await categoryService.getCategories()
      return response?.categories?.map(cat => ({
        category_id: cat.category_id,
        name: cat.name,
        slug: cat.slug
      })) || []
    } catch (error) {
      console.error('Error fetching categories for select:', error)
      return []
    }
  }
}
