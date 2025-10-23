import { useState, useEffect, useCallback, useRef } from 'react'
import { hotelService } from '../services'

// Hook để quản lý danh sách hotels
export const useHotels = (initialParams = {}) => {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [search, setSearch] = useState(initialParams.search || '')
  const [featured, setFeatured] = useState(initialParams.featured || false)
  
  const abortRef = useRef(null)

  const fetchHotels = useCallback(async (overrideParams = {}) => {
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
        featured: featured || undefined,
        ...overrideParams
      }

      const response = await hotelService.getHotels(params)
      setHotels(response.hotels || [])
      setPagination(prev => ({
        ...prev,
        current: params.page || prev.current,
        total: response.pagination?.totalItems || 0
      }))
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError(err?.message || 'Có lỗi xảy ra khi tải danh sách khách sạn')
      }
    } finally {
      setLoading(false)
    }
  }, [pagination.current, pagination.pageSize, search, featured])

  // Refresh data
  const refresh = useCallback(() => {
    fetchHotels()
  }, [fetchHotels])

  // Search hotels
  const searchHotels = useCallback((searchTerm) => {
    setSearch(searchTerm)
    fetchHotels({ page: 1, search: searchTerm })
  }, [fetchHotels])

  // Filter by featured
  const filterByFeatured = useCallback((isFeatured) => {
    setFeatured(isFeatured)
    fetchHotels({ page: 1, featured: isFeatured })
  }, [fetchHotels])

  // Pagination
  const nextPage = useCallback(() => {
    if (pagination.current < Math.ceil(pagination.total / pagination.pageSize)) {
      fetchHotels({ page: pagination.current + 1 })
    }
  }, [pagination, fetchHotels])

  const prevPage = useCallback(() => {
    if (pagination.current > 1) {
      fetchHotels({ page: pagination.current - 1 })
    }
  }, [pagination, fetchHotels])

  const goToPage = useCallback((page) => {
    fetchHotels({ page })
  }, [fetchHotels])

  // Handle table pagination change
  const handleTableChange = useCallback((paginationInfo) => {
    fetchHotels({ 
      page: paginationInfo.current,
      limit: paginationInfo.pageSize 
    })
  }, [fetchHotels])

  // Admin operations
  const createHotel = useCallback(async (formData) => {
    try {
      const response = await hotelService.createHotel(formData)
      refresh()
      return response
    } catch (err) {
      throw err
    }
  }, [refresh])

  const updateHotel = useCallback(async (id, formData) => {
    try {
      const response = await hotelService.updateHotel(id, formData)
      refresh()
      return response
    } catch (err) {
      throw err
    }
  }, [refresh])

  const deleteHotel = useCallback(async (id) => {
    try {
      const response = await hotelService.deleteHotel(id)
      refresh()
      return response
    } catch (err) {
      throw err
    }
  }, [refresh])

  // Load initial data
  useEffect(() => {
    fetchHotels()
    
    return () => {
      if (abortRef.current) {
        try { abortRef.current.abort() } catch (_) {}
      }
    }
  }, [])

  return {
    hotels,
    loading,
    error,
    pagination,
    search,
    featured,
    refresh,
    searchHotels,
    filterByFeatured,
    nextPage,
    prevPage,
    goToPage,
    handleTableChange,
    createHotel,
    updateHotel,
    deleteHotel
  }
}

// Hook để lấy hotels cho dropdown
export const useHotelsForSelect = () => {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHotels = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await hotelService.getHotelsForSelect()
      setHotels(response)
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi tải danh sách khách sạn')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHotels()
  }, [fetchHotels])

  return {
    hotels,
    loading,
    error,
    refresh: fetchHotels
  }
}

// Hook để quản lý single hotel
export const useHotelDetail = (id) => {
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHotel = useCallback(async (hotelId) => {
    if (!hotelId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await hotelService.getHotelById(hotelId)
      setHotel(response.hotel)
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi tải thông tin khách sạn')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchHotel(id)
    }
  }, [id, fetchHotel])

  return {
    hotel,
    loading,
    error,
    refresh: () => fetchHotel(id)
  }
}

// Hook để lấy featured hotels
export const useFeaturedHotels = (options = {}) => {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHotels = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await hotelService.getFeaturedHotels(options)
      setHotels(response.hotels || [])
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi tải khách sạn nổi bật')
    } finally {
      setLoading(false)
    }
  }, [options])

  useEffect(() => {
    fetchHotels()
  }, [fetchHotels])

  return {
    hotels,
    loading,
    error,
    refresh: fetchHotels
  }
}
