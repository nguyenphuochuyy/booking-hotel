import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getRoomTypes,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  createRoomTypeFormData,
  validateRoomTypeData
} from '../services/roomtype.service'
import { getCurrentRoomPrice } from '../services/roomprice.service'
import {
  getRoomPrices
} from  '../services/roomprice.service'
// Hook: danh sách Room Types với pagination, search, category
export function useRoomTypes(initialParams = {}) {
  const [roomTypes, setRoomTypes] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState(initialParams.search || '')
  const [category, setCategory] = useState(initialParams.category || '')
  const [page, setPage] = useState(initialParams.page || 1)
  const [limit, setLimit] = useState(initialParams.limit || 10)
  const abortRef = useRef(null)

  const params = useMemo(() => ({
    page,
    limit,
    ...(search ? { search } : {}),
    ...(category ? { category } : {})
  }), [page, limit, search, category])

  const fetchList = useCallback(async (overrideParams) => {
    setLoading(true)
    setError(null)

    // Hủy request cũ nếu còn đang chạy
    if (abortRef.current) {
      try { abortRef.current.abort() } catch (_) {}
    }
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await getRoomTypes({ ...(overrideParams || params), signal: controller.signal })
      // Backend trả về: { roomTypes, pagination, statusCode }
      const rawRoomTypes = res?.roomTypes || []
      console.log(rawRoomTypes);
      
      // Nạp thêm giá hiện tại cho từng room type (song song)
      const enriched = await Promise.all(rawRoomTypes.map(async (rt) => {
        try {
          const priceRes = await getCurrentRoomPrice(rt.room_type_id)
          // Tùy backend trả về mảng hoặc object
          const priceData = Array.isArray(priceRes?.prices[0]) ? priceRes.prices[0] : priceRes?.prices[0]
          const pricePerNight = priceData?.price_per_night ?? null
          return { ...rt, price_per_night: pricePerNight }
        } catch (_e) {
          return { ...rt, price_per_night: null }
        }
      }))

      setRoomTypes(enriched)
      if (res?.pagination) setPagination(res.pagination)

    } catch (err) {
      if (err?.name !== 'AbortError') setError(err?.message || 'Đã xảy ra lỗi')
    } finally {
      setLoading(false)
    }
  }, [params])

  // Tải lần đầu và khi params thay đổi
  useEffect(() => {
    fetchList()
    // cleanup: hủy request khi unmount
    return () => {
      if (abortRef.current) {
        try { abortRef.current.abort() } catch (_) {}
      }
    }
  }, [fetchList])

  const refresh = useCallback(() => fetchList(), [fetchList])

  const nextPage = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages) setPage((p) => p + 1)
  }, [pagination])

  const prevPage = useCallback(() => {
    if (pagination.currentPage > 1) setPage((p) => p - 1)
  }, [pagination])

  // Admin actions (CRUD)
  const adminCreate = useCallback(async (data, images = []) => {
    const validation = validateRoomTypeData(data)
    if (!validation.isValid) {
      const err = new Error(validation.errors.join(', '))
      err.validationErrors = validation.errors
      throw err
    }
    const formData = createRoomTypeFormData(data, images)
    const res = await createRoomType(formData)
    await fetchList({ page: 1 })
    return res
  }, [fetchList])

  const adminUpdate = useCallback(async (id, data, images = []) => {
    const formData = createRoomTypeFormData(data, images)
    const res = await updateRoomType(id, formData)
    await refresh()
    return res
  }, [refresh])

  const adminDelete = useCallback(async (id) => {
    const res = await deleteRoomType(id)
    // Nếu xóa hết trang hiện tại, lùi về trang trước
    if (roomTypes.length <= 1 && page > 1) {
      setPage((p) => p - 1)
    } else {
      await refresh()
    }
    return res
  }, [refresh, roomTypes.length, page])

  return {
    // data
    roomTypes,
    pagination,
    // states
    loading,
    error,
    // filters
    search,
    setSearch,
    category,
    setCategory,
    page,
    setPage,
    limit,
    setLimit,
    // actions
    fetchList,
    refresh,
    nextPage,
    prevPage,
    adminCreate,
    adminUpdate,
    adminDelete
  }
}

// Hook: chi tiết Room Type theo id
export function useRoomTypeDetail(roomTypeId, { autoFetch = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const abortRef = useRef(null)

  const fetchDetail = useCallback(async (id = roomTypeId) => {
    if (!id) return
    setLoading(true)
    setError(null)

    if (abortRef.current) {
      try { abortRef.current.abort() } catch (_) {}
    }
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await getRoomTypeById(id, { signal: controller.signal })
      const roomPrice = await getCurrentRoomPrice(id);
      const priceData = Array.isArray(roomPrice?.prices[0]) ? roomPrice.prices[0] : roomPrice?.prices[0]
      res.roomType.price_per_night = priceData?.price_per_night ?? null
      // Backend trả về: { roomType, statusCode }
      setData(res?.roomType || null)
    } catch (err) {
      if (err?.name !== 'AbortError') setError(err?.message || 'Đã xảy ra lỗi')
    } finally {
      setLoading(false)
    }
  }, [roomTypeId])

  useEffect(() => {
    if (autoFetch && roomTypeId) fetchDetail(roomTypeId)
    return () => {
      if (abortRef.current) {
        try { abortRef.current.abort() } catch (_) {}
      }
    }
  }, [autoFetch, roomTypeId, fetchDetail])

  return {
    data,
    loading,
    error,
    fetchDetail
  }
}


