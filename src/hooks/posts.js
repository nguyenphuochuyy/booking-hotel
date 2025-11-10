import { useState, useEffect, useCallback, useRef } from 'react'
import { postService, categoryService } from '../services'

// Hook để quản lý danh sách posts
export const usePosts = (initialParams = {}) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [search, setSearch] = useState(initialParams.search || '')
  const [status, setStatus] = useState(initialParams.status || 'all')
  const [category, setCategory] = useState(initialParams.category || 'all')
  const [tag, setTag] = useState(initialParams.tag || '')
  
  const abortRef = useRef(null)

  const fetchPosts = useCallback(async (overrideParams = {}) => {
    setLoading(true)
    setError(null)

    // Cancel previous request
    if (abortRef.current) {
      try { abortRef.current.abort() } catch (_) {}
    }
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: search || undefined,
        status: status === 'all' ? undefined : status,
        category_id: category === 'all' ? undefined : category,
        tag: tag || undefined,
        ...overrideParams
      }

      const response = await postService.getPosts(params)
      // httpClient trả về body trực tiếp, không có .data
      const postsData = response?.posts || []
      const paginationData = response?.pagination || {}
      
      setPosts(Array.isArray(postsData) ? postsData : [])
      setPagination(prev => ({
        ...prev,
        current: params.page || paginationData?.currentPage || prev.current,
        pageSize: params.limit || prev.pageSize,
        total: paginationData?.totalItems || paginationData?.total || 0
      }))
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError(err?.message || 'Có lỗi xảy ra khi tải danh sách bài viết')
        // Ensure posts is always an array even on error
        setPosts([])
      }
    } finally {
      setLoading(false)
    }
  }, [pagination.current, pagination.pageSize, search, status, category, tag])

  // Refresh data
  const refresh = useCallback(() => {
    fetchPosts()
  }, [fetchPosts])

  // Search posts
  const searchPosts = useCallback((searchTerm) => {
    setSearch(searchTerm)
    fetchPosts({ page: 1, search: searchTerm })
  }, [fetchPosts])

  // Filter by status
  const filterByStatus = useCallback((newStatus) => {
    setStatus(newStatus)
    fetchPosts({ page: 1, status: newStatus })
  }, [fetchPosts])

  // Filter by category
  const filterByCategory = useCallback((newCategory) => {
    setCategory(newCategory)
    fetchPosts({ page: 1, category_id: newCategory })
  }, [fetchPosts])

  // Filter by tag
  const filterByTag = useCallback((newTag) => {
    setTag(newTag)
    fetchPosts({ page: 1, tag: newTag })
  }, [fetchPosts])

  // Pagination
  const nextPage = useCallback(() => {
    if (pagination.current < Math.ceil(pagination.total / pagination.pageSize)) {
      fetchPosts({ page: pagination.current + 1 })
    }
  }, [pagination, fetchPosts])

  const prevPage = useCallback(() => {
    if (pagination.current > 1) {
      fetchPosts({ page: pagination.current - 1 })
    }
  }, [pagination, fetchPosts])

  const goToPage = useCallback((page) => {
    fetchPosts({ page })
  }, [fetchPosts])

  // Handle table pagination change
  const handleTableChange = useCallback((paginationInfo) => {
    fetchPosts({ 
      page: paginationInfo.current,
      limit: paginationInfo.pageSize 
    })
  }, [fetchPosts])

  // Admin operations
  const createPost = useCallback(async (formData) => {
    try {
      const response = await postService.createPost(formData)
      refresh()
      return response
    } catch (err) {
      throw err
    }
  }, [refresh])

  const updatePost = useCallback(async (id, formData) => {
    try {
      const response = await postService.updatePost(id, formData)
      refresh()
      return response
    } catch (err) {
      throw err
    }
  }, [refresh])

  const deletePost = useCallback(async (id) => {
    try {
      const response = await postService.deletePost(id)
      refresh()
      return response
    } catch (err) {
      throw err
    }
  }, [refresh])

  // Load initial data
  useEffect(() => {
    fetchPosts()
    
    return () => {
      if (abortRef.current) {
        try { abortRef.current.abort() } catch (_) {}
      }
    }
  }, [])

  return {
    posts,
    loading,
    error,
    pagination,
    search,
    status,
    category,
    tag,
    refresh,
    searchPosts,
    filterByStatus,
    filterByCategory,
    filterByTag,
    nextPage,
    prevPage,
    goToPage,
    handleTableChange,
    createPost,
    updatePost,
    deletePost
  }
}

// Hook để quản lý categories
export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await categoryService.getCategoriesForSelect()
      setCategories(Array.isArray(response) ? response : [])
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi tải danh mục')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories
  }
}

// Hook để quản lý single post - hỗ trợ cả ID và slug
export const usePostDetail = (identifier) => {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPost = useCallback(async (idOrSlug) => {
    if (!idOrSlug) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Kiểm tra nếu là số thì dùng getPostById, ngược lại dùng getPostBySlug
      const isNumeric = /^\d+$/.test(String(idOrSlug))
      let response
      
      if (isNumeric) {
        response = await postService.getPostById(parseInt(idOrSlug))
      } else {
        response = await postService.getPostBySlug(idOrSlug)
      }
      
      // Safe access to response data - httpClient trả về body trực tiếp
      const postData = response?.post || null
      
      if (!postData) {
        setError('Không tìm thấy bài viết')
        setPost(null)
      } else {
        setPost(postData)
      }
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi tải bài viết')
      setPost(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (identifier) {
      fetchPost(identifier)
    }
  }, [identifier, fetchPost])

  return {
    post,
    loading,
    error,
    refresh: () => fetchPost(identifier)
  }
}
