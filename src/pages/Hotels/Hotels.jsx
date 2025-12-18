import React, { useState, useEffect, useMemo } from 'react'
import './Hotels.css'
import {
  Row,
  Col,
  Breadcrumb,
  Select,
  Card,
  Slider,
  Switch,
  Button,
  Tag,
  Space,
  Typography,
  Divider,
  Spin,
  Empty,
  Input,
  InputNumber,
  Modal,
  Carousel,
  Image,
  Rate,
  Avatar,
  Pagination,
  Upload,
  Form,
  Dropdown
} from 'antd'
import {
  HomeOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  EnvironmentOutlined,
  UserOutlined,
  SearchOutlined,
  ExpandOutlined,
  CloseOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  PlusOutlined,
  CustomerServiceOutlined,
  MoreOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled
} from '@ant-design/icons'
import { useRoomTypes } from '../../hooks/roomtype'
import { useNavigate, useLocation } from 'react-router-dom'
import formatPrice from '../../utils/formatPrice'
import BookingWidget from '../../components/BookingWidget'
import { searchAvailableRooms } from '../../services/booking.service'
import { getReviewsByRoomType, updateReview, deleteReview } from '../../services/review.service'
import { getRoomTypeById } from '../../services/roomtype.service'
import { message } from 'antd'
import { useAuth } from '../../context/AuthContext'
import formatDateTime from '../../utils/formatDateTime'
const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input
const { TextArea } = Input
// ... (Giữ nguyên các hàm helper formatDate, getFirstTwoSentences)
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const getFirstTwoSentences = (text) => {
  if (!text || typeof text !== 'string') return ''
  const sentences = text.split(/[.!?。！？\n]+/).filter(s => s.trim().length > 0)
  if (sentences.length === 0) return ''
  if (sentences.length === 1) return sentences[0].trim()
  return sentences.slice(0, 2).map(s => s.trim()).join('. ') + '.'
}

function Hotels() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { roomTypes, loading: roomTypesLoading, error, search, setSearch, category, setCategory } = useRoomTypes({
    limit: 1000
  })

  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [roomTypeSummary, setRoomTypeSummary] = useState([])
  const [roomTypeDetailsCache, setRoomTypeDetailsCache] = useState({})

  const searchParams = new URLSearchParams(location.search)
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const adults = searchParams.get('adults')
  const children = searchParams.get('children')
  const numRoomsURL = parseInt(searchParams.get('rooms') || 1, 10)

  useEffect(() => {
    if (checkIn && checkOut) {
      const loadAvailableRooms = async () => {
        try {          
          setSearchLoading(true)
          const guests = parseInt(adults || 1)
          const params = {
            check_in: checkIn,
            check_out: checkOut,
            guests: guests,
            rooms: numRoomsURL,
            sort: 'price_asc',
            page: 1,
            limit: 1000
          }
          const response = await searchAvailableRooms(params)
          const rooms = response?.rooms || []
          const summary = response?.summary_by_room_type || [] // Dữ liệu quan trọng lấy từ JSON bạn cung cấp
          setSearchResults(rooms)
          setRoomTypeSummary(summary)
        } catch (error) {
          console.error('Error loading available rooms:', error)
        } finally {
          setSearchLoading(false)
        }
      }
      loadAvailableRooms()
    }
  }, [checkIn, checkOut, adults, children])

  // State cho filters
  const [sortBy, setSortBy] = useState('default')
  const [priceRange, setPriceRange] = useState([0, 10000000])
  const [selectedRoomType, setSelectedRoomType] = useState('all')
  const [allowChildren, setAllowChildren] = useState(false)
  const [allowPets, setAllowPets] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [guestFilter, setGuestFilter] = useState(null) // lọc theo số khách (capacity tối thiểu)
  const [areaMin, setAreaMin] = useState(null)         // diện tích tối thiểu
  const [areaMax, setAreaMax] = useState(null)         // diện tích tối đa

  // State cho booking summary
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [numRooms, setNumRooms] = useState(numRoomsURL || 1)

  // State cho modal
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [roomInModal, setRoomInModal] = useState(null)
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)

  // State cho reviews
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsPagination, setReviewsPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  })

  // State cho edit review modal
  const [editReviewModal, setEditReviewModal] = useState({
    visible: false,
    review: null,
    loading: false
  })
  const [editReviewForm, setEditReviewForm] = useState({
    rating: 5,
    comment: '',
    images: []
  })
 const [averageRating, setAverageRating] = useState(0)
 useEffect(() => {
  if (reviews.length > 0) {
    setAverageRating(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
  }
 }, [reviews])
  const numNights = useMemo(() => {
    if (!checkIn || !checkOut) return 1
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = Math.abs(checkOutDate - checkInDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }, [checkIn, checkOut])

  const totalPrice = useMemo(() => {
    if (!selectedRoom || !selectedRoom.price_per_night) return 0
    return selectedRoom.price_per_night * numRooms * numNights
  }, [selectedRoom, numRooms, numNights])

  const loading = checkIn && checkOut ? searchLoading : roomTypesLoading

  // --- LOGIC QUAN TRỌNG: Xử lý dữ liệu từ summary_by_room_type ---
  const groupedAvailableRoomTypes = useMemo(() => {
    if (!(checkIn && checkOut)) return []

    const map = new Map()

    // 1. Ưu tiên loop qua summary_by_room_type từ API trả về
    if (Array.isArray(roomTypeSummary)) {
      for (const summary of roomTypeSummary) {
        const typeId = summary?.room_type_id
        if (!typeId) continue

        // Xử lý giá: API trả về mảng prices, cần lấy giá từ đó
        let finalPrice = summary?.price_per_night;
        if (!finalPrice && Array.isArray(summary?.prices) && summary.prices.length > 0) {
          // Lấy giá đầu tiên trong mảng prices (hoặc logic chọn giá phù hợp nhất)
          finalPrice = parseFloat(summary.prices[0].price_per_night);
        }

        map.set(typeId, {
          room_type_id: typeId,
          room_type_name: summary?.room_type_name || '',
          category: summary?.category || null,
          images: Array.isArray(summary?.images) ? summary.images : [],
          capacity: summary?.capacity,
          area: summary?.area,
          amenities: Array.isArray(summary?.amenities) ? summary.amenities : [],
          description: summary?.description,
          // Set giá đã xử lý
          price_per_night: finalPrice,

          // Thông tin availability từ summary
          available_rooms: summary?.available_rooms ?? 0,
          total_rooms: summary?.total_rooms ?? 0,
          booked_rooms: summary?.booked_rooms ?? 0,
          sold_out: !!summary?.sold_out,
          rooms: [] // Sẽ push chi tiết room vào nếu cần (từ searchResults)
        })
      }
    }

    // 2. Merge thêm thông tin từ searchResults (nếu cần thiết, ví dụ để lấy room_id cụ thể)
    if (Array.isArray(searchResults)) {
      for (const room of searchResults) {
        const typeId = room?.room_type?.room_type_id ?? room?.room_type_id
        if (!typeId) continue
        const existing = map.get(typeId)
        if (existing) {
          existing.rooms.push(room)
        }
        // Nếu summary chưa có (trường hợp hiếm), code cũ của bạn đã xử lý create new entry
      }
    }

    // 3. Làm giàu dữ liệu từ cache (nếu API search thiếu thông tin chi tiết)
    const list = Array.from(map.values()).map(item => {
      const details = roomTypeDetailsCache[item.room_type_id]
      if (details && typeof details === 'object') {
        // Logic merge cache cũ của bạn (giữ nguyên để đảm bảo fallback)
        const detailImages = Array.isArray(details.images) ? details.images
          : Array.isArray(details.image_urls) ? details.image_urls
            : Array.isArray(details.gallery) ? details.gallery
              : []
        const images = (item.images && item.images.length > 0) ? item.images : detailImages
        const description = item.description ?? details.description ?? null

        // Chỉ fallback giá nếu trong summary không có
        let price = item.price_per_night
        if (price == null && details.price_per_night) {
          price = details.price_per_night
        }

        return { ...item, images, description, price_per_night: price }
      }
      return item
    })

    return list
  }, [searchResults, checkIn, checkOut, roomTypeSummary, roomTypeDetailsCache])

  // --- Data Source Setup ---
  const dataSource = (checkIn && checkOut)
    ? groupedAvailableRoomTypes.map(room => ({
      ...room,
      room_type: {
        room_type_id: room.room_type_id,
        room_type_name: room.room_type_name,
        category: room.category || null,
        capacity: room.capacity,
        images: room.images,
        amenities: room.amenities,
        area: room.area
      }
    }))
    : roomTypes.map(room => ({
      // ... (Giữ nguyên logic render mặc định khi chưa search)
      room_type_id: room.room_type_id,
      room_type_name: room.room_type_name,
      category: room.category || null,
      capacity: room.capacity,
      images: room.images,
      amenities: room.amenities,
      area: room.area,
      description: room.description || null,
      price_per_night: room.price_per_night,
      room_type: {
        room_type_id: room.room_type_id,
        room_type_name: room.room_type_name,
        category: room.category || null,
        capacity: room.capacity,
        images: room.images,
        amenities: room.amenities,
        area: room.area
      },
      prices: room.price_per_night ? [{ price_per_night: room.price_per_night }] : []
    }))

  // ... (Giữ nguyên logic filteredRooms, handleSearch, handleSelectRoom, v.v.)
  const filteredRooms = useMemo(() => {
    let filtered = [...dataSource]
    filtered = filtered.filter(room => {
      const price = room.price_per_night // Đã xử lý ở trên, lấy trực tiếp
      if ((room.sold_out || room.available_rooms === 0) && (price == null)) return true
      if (price == null && (room.available_rooms > 0 || !room.sold_out)) return true
      if (price != null) {
        return price >= priceRange[0] && price <= priceRange[1]
      }
      return false
    })

    // Lọc theo số khách (capacity tối thiểu)
    if (guestFilter && Number(guestFilter) > 0) {
      const minGuests = Number(guestFilter)
      filtered = filtered.filter(room => {
        const capacity = room.capacity ?? room.room_type?.capacity
        if (!capacity) return false
        return Number(capacity) >= minGuests
      })
    }

    // Lọc theo diện tích (m²)
    if (areaMin != null || areaMax != null) {
      filtered = filtered.filter(room => {
        const area = room.area ?? room.room_type?.area
        if (area == null) return false
        const value = Number(area)
        if (Number.isNaN(value)) return false
        if (areaMin != null && value < areaMin) return false
        if (areaMax != null && value > areaMax) return false
        return true
      })
    }

    if (selectedRoomType !== 'all') {
      filtered = filtered.filter(room => {
        const categoryValue = room.room_type?.category || room.category
        if (!categoryValue) return false
        const normalizedCategory = String(categoryValue).trim().toLowerCase()
        const normalizedSelected = String(selectedRoomType).trim().toLowerCase()
        return normalizedCategory === normalizedSelected
      })
    }

    // Sắp xếp theo giá & tình trạng, ưu tiên phòng còn trống
    if (checkIn && checkOut) {
      filtered.sort((a, b) => {
        const aAvailable = a.available_rooms > 0 && !a.sold_out
        const bAvailable = b.available_rooms > 0 && !b.sold_out
        if (aAvailable && !bAvailable) return -1
        if (!aAvailable && bAvailable) return 1

        const aPrice = a.price_per_night || 0
        const bPrice = b.price_per_night || 0

        // sortBy: 'price_asc' | 'price_desc' | 'default'
        if (sortBy === 'price_desc') {
          return bPrice - aPrice
        }
        // default & 'price_asc'
        return aPrice - bPrice
      })
    } else {
      // Khi chưa chọn ngày, vẫn cho phép sort theo giá
      if (sortBy === 'price_asc' || sortBy === 'price_desc') {
        filtered.sort((a, b) => {
          const aPrice = a.price_per_night || 0
          const bPrice = b.price_per_night || 0
          return sortBy === 'price_desc' ? bPrice - aPrice : aPrice - bPrice
        })
      }
    }
    return filtered
  }, [dataSource, searchKeyword, priceRange, selectedRoomType, allowChildren, allowPets, sortBy, checkIn, checkOut, guestFilter, areaMin, areaMax])

  const handleResetQuickFilters = () => {
    setSortBy('default')
    setGuestFilter(null)
    setAreaMin(null)
    setAreaMax(null)
    setPriceRange([0, 10000000])
    setSelectedRoomType('all')
  }

  // ... (Giữ nguyên các hàm handler: handleRoomTypeChange, handleSelectRoom, v.v.)
  const handleSearch = (value) => setSearchKeyword(value)
  const handleRoomTypeChange = (value) => setSelectedRoomType(value)
  const normalizeRoomData = (room) => {
    if (!room) return null
    if (room.room_type) return room
    return {
      ...room,
      room_type: {
        room_type_id: room.room_type_id,
        room_type_name: room.room_type_name,
        category: room.category || null,
        capacity: room.capacity,
        images: room.images,
        amenities: room.amenities,
        area: room.area
      }
    }
  }

  const getMaxSelectableRooms = () => {
    if (selectedRoom && typeof selectedRoom.available_rooms === 'number' && selectedRoom.available_rooms > 0) {
      return selectedRoom.available_rooms
    }
    return 10
  }

  const handleSelectRoom = (room) => {
    const normalized = normalizeRoomData(room)
    if (!normalized) return
    setSelectedRoom(normalized)
    setNumRooms(numRoomsURL || 1)
  }
  const handleRemoveRoom = () => { setSelectedRoom(null); setNumRooms(1); }
  const handleNumRoomsChange = (value) => {
    const num = value || 1
    const maxRooms = getMaxSelectableRooms()
    if (num > maxRooms) {
      message.warning(`Chỉ còn ${maxRooms} phòng khả dụng cho hạng phòng này`)
      setNumRooms(maxRooms)
      return
    }
    if (num === 0) {
      Modal.confirm({
        title: 'Xác nhận xóa phòng',
        content: 'Bạn có chắc muốn xóa phòng này khỏi đơn đặt không?',
        okText: 'Xóa',
        cancelText: 'Hủy',
        okType: 'danger',
        onOk: () => { setSelectedRoom(null); setNumRooms(1); },
        onCancel: () => { setNumRooms(numRooms); }
      })
      return
    }
    setNumRooms(num > 0 ? num : 1)
  }
  const handleDecreaseRooms = () => {
    if (numRooms > 1) { setNumRooms(numRooms - 1); } else {
      Modal.confirm({
        title: 'Xác nhận xóa phòng',
        content: 'Bạn có chắc muốn xóa phòng này khỏi đơn đặt không?',
        okText: 'Xóa',
        cancelText: 'Hủy',
        okType: 'danger',
        onOk: () => { setSelectedRoom(null); setNumRooms(1); }
      })
    }
  }
  const handleIncreaseRooms = () => {
    const maxRooms = getMaxSelectableRooms()
    if (numRooms >= maxRooms) {
      message.warning(`Chỉ còn ${maxRooms} phòng khả dụng cho hạng phòng này`)
      return
    }
    setNumRooms(numRooms + 1)
    }
  const handleBookNow = () => {
    if (!selectedRoom) return
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (!token && !user) { setIsLoginModalVisible(true); return; }
    if(!checkIn || !checkOut) {
      message.warning('Vui lòng chọn ngày check-in và check-out trước khi đặt phòng')
      return
    }
    const adultsNum = parseInt(adults || '1', 10)
    const childrenNum = parseInt(children || '0', 10)
    navigate('/booking-confirmation', {
      state: { roomType: selectedRoom, checkIn: checkIn || '', checkOut: checkOut || '', guests: { adults: adultsNum, children: childrenNum }, numRooms: numRooms, numNights: numNights }
    })
  }
  const handleShowModal = async (room) => {
    setRoomInModal(room); setIsModalVisible(true);
    if (room?.room_type_id || room?.room_type?.room_type_id) {
      const roomTypeId = room.room_type_id || room.room_type?.room_type_id
      await loadReviews(roomTypeId)
      if (roomTypeId && !roomTypeDetailsCache[roomTypeId]) {
        try {
          const response = await getRoomTypeById(roomTypeId)
          const roomTypeData = response?.roomType || response?.data?.roomType || response?.room_type || response?.data?.room_type || response
          if (roomTypeData) { setRoomTypeDetailsCache(prev => ({ ...prev, [roomTypeId]: roomTypeData })) }
        } catch (error) { console.error('Error loading room type details:', error) }
      }
    }
  }
  const loadReviews = async (roomTypeId, page = 1) => {
    if (!roomTypeId) return
    try {
      setReviewsLoading(true)
      const pageSize = 5
      const response = await getReviewsByRoomType(roomTypeId, { page, limit: pageSize })
      setReviews(response?.reviews || [])
      setReviewsPagination(prev => ({ ...prev, current: response?.pagination?.currentPage || page, total: response?.pagination?.totalItems || 0, pageSize: pageSize }))
    } catch (error) { console.error('Error loading reviews:', error); setReviews([]); } finally { setReviewsLoading(false) }
  }
  const handleCloseModal = () => { setIsModalVisible(false); setRoomInModal(null); setReviews([]); setReviewsPagination({ current: 1, pageSize: 5, total: 0 }); }

  // Hàm mở modal edit review
  const handleEditReview = (reviewId) => {
    const review = reviews.find(r => r.review_id === reviewId)
    if (!review) return
    
    // Convert images URLs to Upload file format
    const imageFiles = (review.images || []).map((img, index) => ({
      uid: `existing-${index}`,
      name: `image-${index}.jpg`,
      status: 'done',
      url: img,
      thumbUrl: img
    }))
    
    setEditReviewForm({
      rating: review.rating || 5,
      comment: review.comment || '',
      images: imageFiles
    })
    setEditReviewModal({
      visible: true,
      review: review,
      loading: false
    })
  }

  // Hàm cập nhật review
  const handleUpdateReview = async () => {
    if (!editReviewModal.review) return
    
    if (!editReviewForm.rating || editReviewForm.rating < 1) {
      message.warning('Vui lòng chọn số sao đánh giá')
      return
    }
    
    setEditReviewModal(prev => ({ ...prev, loading: true }))
    try {
      // Lấy các file mới từ fileList (chỉ file có originFileObj)
      const newImageFiles = editReviewForm.images
        .filter(file => file.originFileObj)
        .map(file => file.originFileObj)
      
      // Tạo FormData để gửi
      const formData = new FormData()
      formData.append('rating', editReviewForm.rating)
      formData.append('comment', editReviewForm.comment.trim() || '')
      
      // Append new image files (nếu có)
      // Lưu ý: Backend sẽ xóa tất cả ảnh cũ và thay bằng ảnh mới nếu có req.files
      // Nếu không có ảnh mới, backend sẽ giữ nguyên ảnh cũ
      newImageFiles.forEach((file) => {
        formData.append('images', file)
      })
      
      await updateReview(editReviewModal.review.review_id, formData)
      
      message.success('Cập nhật đánh giá thành công!')
      
      // Đóng modal và reset form
      setEditReviewModal({ visible: false, review: null, loading: false })
      setEditReviewForm({ rating: 5, comment: '', images: [] })
      
      // Reload reviews
      const roomTypeId = roomInModal?.room_type_id || roomInModal?.room_type?.room_type_id
      if (roomTypeId) {
        await loadReviews(roomTypeId, reviewsPagination.current)
      }
    } catch (error) {
      console.error('Error updating review:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể cập nhật đánh giá. Vui lòng thử lại.'
      message.error(errorMessage)
    } finally {
      setEditReviewModal(prev => ({ ...prev, loading: false }))
    }
  }

  // Hàm xóa review
  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId)
      message.success('Xóa đánh giá thành công!')
      
      // Reload reviews
      const roomTypeId = roomInModal?.room_type_id || roomInModal?.room_type?.room_type_id
      if (roomTypeId) {
        await loadReviews(roomTypeId, reviewsPagination.current)
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể xóa đánh giá. Vui lòng thử lại.'
      message.error(errorMessage)
    }
  }
  const handleSelectFromModal = () => {
    if (!roomInModal) return
    const normalized = normalizeRoomData(roomInModal)
    if (!normalized) return
    setSelectedRoom(normalized)
    setNumRooms(numRoomsURL || 1)
    handleCloseModal()
    message.success('Đã chọn phòng. Vui lòng xem lại thông tin ở cột bên phải trước khi đặt phòng.')
  }

  return (
    <div className="hotels-page">
      <div className="container">
        <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item href="/">
            <HomeOutlined />
            <span>Trang chủ</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Danh sách phòng</Breadcrumb.Item>
        </Breadcrumb>

        <div className='booking-widget-container'>
          <BookingWidget checkIn={checkIn} checkOut={checkOut} adults={adults} children={children} />
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* Summary + bộ lọc nhanh */}
            <div
              style={{
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                background: '#f9fafb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <Space direction="vertical" size={0}>
                <Text strong>
                  {`Tìm thấy ${filteredRooms.length} loại phòng`}
                </Text>
                {checkIn && checkOut && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tổng số phòng còn trống:{' '}
                    {filteredRooms.reduce((sum, room) => {
                      const avail = Number(room.available_rooms ?? 0)
                      return sum + (Number.isNaN(avail) ? 0 : avail)
                    }, 0)}
                  </Text>
                )}
              </Space>

              <Space size="small" wrap>
                {/* Sắp xếp theo giá */}
                <Select
                  size="small"
                  value={sortBy}
                  style={{ minWidth: 140 }}
                  onChange={setSortBy}
                  suffixIcon={<SortAscendingOutlined />}
                >
                  <Option value="default">Mặc định</Option>
                  <Option value="price_asc">Giá tăng dần</Option>
                  <Option value="price_desc">Giá giảm dần</Option>
                </Select>

                {/* Lọc theo số khách */}
                <InputNumber
                  size="small"
                  min={1}
                  placeholder="Số khách"
                  value={guestFilter}
                  onChange={(val) => setGuestFilter(val || null)}
                  style={{ width: 100 }}
                />

                {/* Lọc theo diện tích */}
                <InputNumber
                  size="small"
                  min={0}
                  placeholder="m² từ"
                  value={areaMin}
                  onChange={(val) => setAreaMin(val ?? null)}
                  style={{ width: 90 }}
                />
                <InputNumber
                  size="small"
                  min={0}
                  placeholder="m² đến"
                  value={areaMax}
                  onChange={(val) => setAreaMax(val ?? null)}
                  style={{ width: 90 }}
                />

                <Button
                  size="small"
                  icon={<FilterOutlined />}
                  onClick={handleResetQuickFilters}
                >
                  Mặc định
                </Button>
              </Space>
            </div>

            <div className="rooms-list">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: '16px' }}><Spin size="large" /></div>
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Empty description={error} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              ) : filteredRooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Empty description="Không tìm thấy phòng nào phù hợp" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              ) : (
                filteredRooms.map(room => (
                  <Card key={room.room_type_id} className="room-card-new" bodyStyle={{ padding: 0 }}>
                    {/* Badge availability */}
                    {checkIn && checkOut && room.available_rooms !== undefined && (
                      <div className="room-availability-badge">
                        {room.sold_out ? (
                          <Tag color="error" style={{ fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '16px', margin: 0, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
                            Tạm hết phòng
                          </Tag>
                        ) : (
                          <Tag color="success" style={{ fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '16px', margin: 0, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
                            Còn {room.available_rooms} phòng
                          </Tag>
                        )}
                      </div>
                    )}
                    <Row gutter={0} align="stretch">
                      <Col xs={24} md={9}>
                        <div className="room-image-new">
                          {room.images && room.images.length > 0 ? (
                            <img alt={room.room_type_name} src={room.images[0]} />
                          ) : (
                            <div className="room-image-placeholder">
                              <EnvironmentOutlined />
                              <Text>Không có hình ảnh</Text>
                            </div>
                          )}
                        </div>
                      </Col>

                      <Col xs={24} md={15}>
                        <div className="room-info-new">
                          <div className="room-info-main">
                            <Title level={3} className="room-name-new">{room.room_type_name}</Title>
                            <div className="key-details" style={{ marginBottom: '16px' }}>
                              <Space size="large" wrap>
                                <span><UserOutlined /> <Text>{room.capacity || 2} người</Text></span>
                                <span><ExpandOutlined /> <Text>{room.area || 0} m²</Text></span>
                              </Space>
                            </div>
                            {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0 && (
                              <div className="amenities-list-tags" style={{ marginBottom: '20px' }}>
                                <Space size={[8, 8]} wrap>
                                  {room.amenities.slice(0, 5).map((amenity, index) => (
                                    <Tag key={index}>{amenity}</Tag>
                                  ))}
                                  {room.amenities.length > 5 && <Tag>+ {room.amenities.length - 5} thêm</Tag>}
                                </Space>
                              </div>
                            )}
                            <Button type="link" icon={<EyeOutlined />} onClick={() => handleShowModal(room)} style={{ padding: 0, height: 'auto', fontSize: '14px', color: '#c08a19' }}>
                              Xem chi tiết & tiện nghi
                            </Button>
                            {(() => {
                              const roomDescription = room.description || roomTypeDetailsCache[room.room_type_id]?.description || ''
                              const firstTwoSentences = getFirstTwoSentences(roomDescription)
                              return firstTwoSentences ? (
                                <div style={{ marginTop: '12px' }}>
                                  <Text style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', display: 'block' }}>{firstTwoSentences}</Text>
                                </div>
                              ) : null
                            })()}
                          </div>

                          <div className="room-info-footer">

                            {/* --- PHẦN THAY ĐỔI UI THEO YÊU CẦU --- */}
                            <div className="rate-info" style={{ marginBottom: '16px' }}>
                              <Text type="warning" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                                <ExclamationCircleOutlined /> Có tính phí hủy
                                  </Text>
                              </div>
                            {/* ------------------------------------- */}

                            <div className="room-price-action">
                              <div className="room-price-text">
                                <Text strong>
                                  {room.price_per_night ? formatPrice(room.price_per_night) : 'Liên hệ'}
                                </Text>
                                <Text type="secondary" style={{ fontSize: '13px', display: 'block' }}>
                                  / đêm (cho {room.capacity || 2} khách)
                                </Text>
                              </div>
                              <Button
                                type="primary"
                                size="large"
                                className="select-btn"
                                onClick={() => handleSelectRoom(room)}
                                disabled={checkIn && checkOut && room.sold_out}
                              >
                                {checkIn && checkOut && room.sold_out ? 'Tạm hết phòng' : 'Chọn phòng'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                ))
              )}
            </div>
          </Col>

          {/* Cột phải - Booking Summary (Giữ nguyên) */}
          <Col xs={24} lg={8}>
            <Card className="booking-summary-card">
              <div className="summary-header">
                <Title level={3} style={{ margin: 0, fontSize: '28px', fontWeight: 700, textAlign: 'center' }}>
                  {selectedRoom ? `${selectedRoom?.room_type_name}` : ''}
                </Title>
              </div>
              <Divider />
              <div className="summary-dates">
                
                <Text strong style={{ fontSize: '16px' }}>
                  {checkIn ? formatDate(checkIn) : 'Chưa chọn'} - {checkOut ? formatDate(checkOut) : 'Chưa chọn'}
                </Text>
              </div>
              {checkIn && checkOut && (
                <div className="summary-nights" style={{ marginTop: '4px' }}>
                  <Text style={{ fontSize: '14px', color: '#6b7280' }}>{numNights} {numNights === 1 ? 'đêm' : 'đêm'}</Text>
                </div>
              )}
              <div className="summary-guests" style={{ marginTop: '8px' }}>
                <Text style={{ fontSize: '14px', color: '#6b7280' }}>
                  {adults ? `${adults} khách` : ''}
                  {children && parseInt(children) > 0 ? `, ${children} trẻ em` : ''}
                  {!adults && !children && selectedRoom ? `${selectedRoom?.capacity || 2} người` : ''}
                </Text>
              </div>
              <Divider />
              <div className="summary-room-details">
                {selectedRoom ? (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ fontSize: '14px' }}>{selectedRoom.room_type_name}</Text>
                          <div style={{ marginTop: '4px' }}>
                            <Text style={{ fontSize: '14px', color: '#6b7280' }}>{formatPrice(selectedRoom.price_per_night)} / đêm</Text>
                          </div>
                          <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>

                            {/* Lưu ý: Có thể bạn cũng muốn đổi text ở đây cho đồng bộ, nhưng tạm thời giữ nguyên Hủy miễn phí ở phần booking nếu bạn chưa yêu cầu đổi */}
                            <Text style={{ color: '#faad14', fontSize: '14px' }}> <ExclamationCircleOutlined /> Có tính phí hủy</Text>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                              <Button type="text" size="small" style={{ minWidth: '24px', height: '24px', padding: 0, fontSize: '16px', lineHeight: '24px' }} onClick={handleDecreaseRooms}>-</Button>
                              <InputNumber min={0} max={10} value={numRooms} onChange={handleNumRoomsChange} size="small" controls={false} style={{ width: '50px', fontSize: '12px' }} />
                              <Button type="text" size="small" style={{ minWidth: '24px', height: '24px', padding: 0, fontSize: '16px', lineHeight: '24px' }} onClick={handleIncreaseRooms} disabled={numRooms >= 10}>+</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {checkIn && checkOut && (
                        <div style={{ marginTop: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <Text style={{ fontSize: '13px', color: '#6b7280' }}>{formatPrice(selectedRoom.price_per_night)} × {numRooms} phòng × {numNights} đêm</Text>
                            <Text style={{ fontSize: '13px', color: '#6b7280' }}>{formatPrice(totalPrice)}</Text>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <Empty description="Chưa chọn phòng" />
                )}
              </div>
              <Divider />
              <div className="summary-total">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: '16px' }}>Tổng cộng</Text>
                  <Text strong style={{ fontSize: '18px', color: '#1f2937' }}>{selectedRoom ? formatPrice(totalPrice) : 'VND 0'}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: '13px' }}>Bao gồm thuế + phí</Text>
              </div>
              <Divider />
              <Button type="primary" size="large" block className="book-now-btn" onClick={handleBookNow} disabled={!selectedRoom}>Đặt phòng</Button>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal Chi tiết phòng */}
      <Modal
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={1000}
        className="room-detail-modal"
        closeIcon={<CloseOutlined />}
        centered // Căn giữa màn hình
        style={{ top: 20 }}
      >
        {roomInModal && (
          <div className="modal-content">
            {(() => {
              // Logic lấy dữ liệu chi tiết nhất có thể
              // 1. Lấy object room gốc
              const detailRoom = roomInModal?.room || (Array.isArray(roomInModal?.rooms) ? roomInModal.rooms[0] : null) || roomInModal

              // 2. Lấy ảnh: ưu tiên từ detailRoom -> roomInModal -> cache
              let modalImages = detailRoom?.images || roomInModal?.images || []
              if (modalImages.length === 0 && roomTypeDetailsCache[roomInModal.room_type_id]?.images) {
                modalImages = roomTypeDetailsCache[roomInModal.room_type_id].images;
              }

              // 3. Lấy tiện nghi
              const modalAmenities = Array.isArray(detailRoom?.amenities) ? detailRoom.amenities : (Array.isArray(roomInModal?.amenities) ? roomInModal.amenities : [])

              // 4. Lấy thông số
              const modalCapacity = detailRoom?.capacity ?? roomInModal?.capacity
              const modalArea = detailRoom?.area ?? roomInModal?.area
              const modalPrice = detailRoom?.price_per_night ?? roomInModal?.price_per_night

              // 5. Lấy mô tả
              const modalDescription = detailRoom?.description ?? roomInModal?.description ?? roomTypeDetailsCache[roomInModal?.room_type_id]?.description ?? ''

              return (
                <>
                  {/* Header Modal */}
                  <div className="modal-header">
                    <Title level={3} style={{ margin: 0 }}>
                      {roomInModal.room_type_name}
                    </Title>
                    <>
                    <Text type="secondary" style={{ fontSize: '15px' }}>Đánh giá trung bình: {averageRating.toFixed(1)} <StarFilled style={{ color: '#fadb14' }} /></Text>
                    </>
                  </div>

                  <Divider style={{ margin: '12px 0 24px 0' }} />

                  {/* Content chính - Chia 2 cột: Trái (Info) - Phải (Ảnh & Giá) */}
                  <Row gutter={32}>

                    {/* --- CỘT TRÁI: THÔNG TIN CHI TIẾT --- */}
                    <Col xs={24} md={14}>
                      <div style={{ paddingRight: '8px' }}>
                        {/* Mô tả */}
                      {modalDescription && (
                          <div style={{ marginBottom: '24px' }}>
                            <Title level={5}>Mô tả</Title>
                            <Text style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', whiteSpace: 'pre-line', display: 'block' }}>
                              {modalDescription}
                            </Text>
                          </div>
                        )}

                      <Divider />

                        {/* Thông số phòng (Grid nhỏ) */}
                        <div style={{ marginBottom: '24px' }}>
                        <Title level={5}>Thông số phòng</Title>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                              <Space>
                                <UserOutlined style={{ color: '#9ca3af' }} />
                              <div>
                                  <Text type="secondary" style={{ fontSize: '12px' }}>Sức chứa</Text>
                                  <div><Text strong>{modalCapacity || 2} người</Text></div>
                              </div>
                            </Space>
                          </Col>
                            <Col span={12}>
                              <Space>
                                <ExpandOutlined style={{ color: '#9ca3af' }} />
                              <div>
                                  <Text type="secondary" style={{ fontSize: '12px' }}>Diện tích</Text>
                                  <div><Text strong>{modalArea || 0}m²</Text></div>
                              </div>
                            </Space>
                          </Col>
                            <Col span={24}>
                              <Space>
                                <ExclamationCircleOutlined style={{ color: '#9ca3af' }} />
                              <div>
                                  <Text type="secondary" style={{ fontSize: '12px' }}>Chính sách</Text>
                                  <div><Text strong>Có tính phí hủy & Không hút thuốc</Text></div>
                              </div>
                            </Space>
                          </Col>
                        </Row>
                      </div>

                      <Divider />

                        {/* Tiện nghi */}
                        <div style={{ marginBottom: '24px' }}>
                        <Title level={5}>Tiện nghi</Title>
                          {modalAmenities && modalAmenities.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {modalAmenities.map((item, idx) => (
                                <Tag key={idx} color="blue">{item}</Tag>
                              ))}
                            </div>
                          ) : (
                            <Text type="secondary">Đang cập nhật tiện nghi</Text>
                          )}
                      </div>

                      <Divider />

                      {/* Reviews Section */}
                        <div style={{ marginTop: '24px' }}>
                        <Title level={5} style={{ marginBottom: '16px' }}>
                          <MessageOutlined style={{ marginRight: '8px' }} />
                            Đánh giá từ khách hàng ({reviewsPagination.total})
                            <Text type="secondary" style={{ fontSize: '14px', marginLeft: '10px' , fontWeight: 600 }}>{averageRating.toFixed(1)}/5 <StarFilled style={{ color: '#fadb14' }} /></Text>
                        </Title>
                    
                       
                        {reviewsLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>
                        ) : reviews.length === 0 ? (
                            <Empty description="Chưa có đánh giá nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          ) : (
                            <div className="reviews-list-container">
                              
                              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                {reviews.map((review) => {
                                  const isOwner = user && user.user_id === review.user?.user_id
                                  
                                  // Menu items cho dropdown
                                  const menuItems = [
                                    {
                                      key: 'edit',
                                      label: (
                                        <Space>
                                          <EditOutlined />
                                          <span>Sửa</span>
                                        </Space>
                                      ),
                                      onClick: () => handleEditReview(review.review_id)
                                    },
                                    {
                                      key: 'delete',
                                      label: (
                                        <Space style={{ color: '#ff4d4f' }}>
                                          <DeleteOutlined />
                                          <span>Xóa</span>
                                        </Space>
                                      ),
                                      danger: true,
                                      onClick: () => {
                                        Modal.confirm({
                                          title: 'Xóa đánh giá',
                                          content: 'Bạn có chắc chắn muốn xóa đánh giá này không?',
                                          okText: 'Xóa',
                                          cancelText: 'Hủy',
                                          okType: 'danger',
                                          onOk: () => handleDeleteReview(review.review_id)
                                        })
                                      }
                                    }
                                  ]

                                  return (
                                    <div key={review.review_id} className="review-item" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '16px', position: 'relative' }}>
                                      {/* Dropdown menu 3 chấm - chỉ hiển thị nếu user là chủ sở hữu */}
                                      {isOwner && (
                                        <Dropdown
                                          menu={{ items: menuItems }}
                                          trigger={['click']}
                                          placement="bottomRight"
                                        >
                                          <Button
                                            type="text"
                                            icon={<MoreOutlined />}
                                            style={{
                                              position: 'absolute',
                                              top: 0,
                                              right: 0,
                                              zIndex: 1,
                                              fontSize: '18px',
                                              color: '#8c8c8c'
                                            }}
                                            size="small"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </Dropdown>
                                      )}
                                      
                                  <div style={{ display: 'flex', gap: '12px' }}>
                                        {/* Avatar User */}
                                    <Avatar
                                      style={{ backgroundColor: '#c08a19', flexShrink: 0 }}
                                      size="large"
                                    >
                                          {review.user?.full_name?.charAt(0)?.toUpperCase() || 'K'}
                                    </Avatar>

                                    <div style={{ flex: 1 }}>
                                       
                                          {/* Tên + Rate + Ngày */}
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginRight: isOwner ? '40px' : '0' }}>
                                        <div>
                                              <Text strong style={{ fontSize: '14px', display: 'block' }}>
                                                {review.user?.full_name || 'Khách hàng ẩn danh'}
                                          </Text>
                                              <Rate disabled value={review.rating} style={{ fontSize: '12px', color: '#fadb14' }} />
                                        </div>
                                          <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {formatDateTime(review.created_at)}
                                          </Text>
                                      </div>

                                        {/* Nội dung Comment */}
                                      {review.comment && (
                                          <div style={{ marginTop: '8px' }}>
                                            <Text style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>
                                          {review.comment}
                                        </Text>
                                          </div>
                                      )}

                                        {/* Ảnh Review (nếu có) */}
                                      {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                                          <div style={{ marginTop: '12px' }}>
                                          <Image.PreviewGroup>
                                              <Space size={8} wrap>
                                                {review.images.map((img, idx) => (
                                              <Image
                                                key={idx}
                                                src={img}
                                                    alt="Review img"
                                                width={60}
                                                height={60}
                                                    style={{ objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb' }}
                                              />
                                            ))}
                                              </Space>
                                          </Image.PreviewGroup>
                                          </div>
                                        )}

                                        {/* Phản hồi của admin (nếu có) */}
                                        {(review.reply || review.admin_reply) && (
                                          <div style={{ 
                                            marginTop: '16px',
                                            padding: '12px 16px',
                                            background: '#f0f2f5',
                                            borderRadius: '8px',
                                            borderLeft: '4px solid #1890ff'
                                          }}>
                                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <CustomerServiceOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                                                <Text strong style={{ fontSize: '13px', color: '#1890ff' }}>
                                                  Phản hồi từ quản trị viên
                                                </Text>
                                                {review.reply_at && (
                                                  <Text type="secondary" style={{ fontSize: '11px', marginLeft: 'auto' }}>
                                                    {formatDateTime(review.reply_at)}
                                                  </Text>
                                                )}
                                              </div>
                                              <Text style={{ fontSize: '13px', lineHeight: '1.6', color: '#333', display: 'block', marginTop: '4px' }}>
                                                {review.reply || review.admin_reply}
                                              </Text>
                                            </Space>
                                        </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  )
                                })}
                            </Space>

                              {/* Phân trang (nếu nhiều review) */}
                            {reviewsPagination.total > reviewsPagination.pageSize && (
                              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                <Pagination
                                    simple
                                  current={reviewsPagination.current}
                                  pageSize={reviewsPagination.pageSize}
                                  total={reviewsPagination.total}
                                  onChange={(page) => {
                                    const roomTypeId = roomInModal?.room_type_id || roomInModal?.room_type?.room_type_id
                                    if (roomTypeId) {
                                      loadReviews(roomTypeId, page)
                                    }
                                  }}
                                />
                              </div>
                            )}
                            </div>
                        )}
                        </div>
                        {/* Khoảng trống để không bị che bởi footer sticky trên mobile nếu cần */}
                        <div style={{ height: '60px' }}></div>
                      </div>
                    </Col>

                    {/* --- CỘT PHẢI: ẢNH & GIÁ (Sticky) --- */}
                    <Col xs={24} md={10}>
                      <div style={{ position: 'sticky', top: '20px' }}>

                        {/* Carousel Ảnh */}
                        <div className="modal-image-section" style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        {modalImages && modalImages.length > 0 ? (
                          <Image.PreviewGroup>
                              <Carousel autoplay effect="fade" dots={{ className: 'custom-dots' }}>
                              {modalImages.map((img, index) => (
                                  <div key={index}>
                                  <Image
                                    src={img}
                                      alt={`Room ${index}`}
                                      style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                                      preview={{ mask: 'Xem ảnh lớn' }}
                                  />
                                </div>
                              ))}
                            </Carousel>
                          </Image.PreviewGroup>
                        ) : (
                            <div style={{ width: '100%', height: '250px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#999' }}>
                              <EnvironmentOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                              <Text type="secondary">Chưa có hình ảnh</Text>
                          </div>
                        )}
                      </div>

                        {/* Card thông tin giá */}
                        <Card bordered={false} style={{ background: '#f9fafb', borderRadius: '12px' }}>
                          <div style={{ marginBottom: '16px' }}>
                            <Text type="secondary">Giá phòng cho {numNights} đêm</Text>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                              <Title level={2} style={{ margin: 0, color: '#c08a19' }}>
                            {formatPrice(modalPrice * numRooms * numNights)}
                              </Title>
                            </div>
                            <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                              ({formatPrice(modalPrice)} / đêm x {numRooms} phòng)
                          </Text>
                        </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {checkIn && checkOut ? (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <Text strong>Ngày nhận:</Text>
                                <Text>{formatDate(checkIn)}</Text>
                        </div>
                            ) : null}
                            {checkIn && checkOut ? (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <Text strong>Ngày trả:</Text>
                                <Text>{formatDate(checkOut)}</Text>
                      </div>
                            ) : null}
                          </div>

                          <Divider style={{ margin: '16px 0' }} />

                        <Button
                          type="primary"
                          size="large"
                            block
                            style={{ height: '48px', fontWeight: 600, fontSize: '16px' }}
                          onClick={handleSelectFromModal}
                          disabled={checkIn && checkOut && (roomInModal?.sold_out === true)}
                        >
                            {checkIn && checkOut && (roomInModal?.sold_out === true) ? 'Tạm hết phòng' : 'Chọn phòng này'}
                        </Button>
                        </Card>
                      </div>
                      </Col>
                    </Row>

                  {/* Footer Sticky Mobile Only - Nếu màn hình nhỏ, hiển thị nút ở dưới cùng */}
                  <div className="modal-footer-mobile-only">
                    {/* CSS class này cần được set display: none trên Desktop và block trên Mobile trong file .css */}
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </Modal>

      <Modal open={isLoginModalVisible} onCancel={() => setIsLoginModalVisible(false)} footer={[<Button key="cancel" onClick={() => setIsLoginModalVisible(false)}>Đóng</Button>, <Button key="login" type="primary" onClick={() => navigate('/login')}>Đăng nhập</Button>]} title="Yêu cầu đăng nhập" centered>
        <Text>Vui lòng đăng nhập để tiếp tục đặt phòng.</Text>
      </Modal>

      {/* Modal Edit Review */}
      <Modal
        open={editReviewModal.visible}
        title="Sửa đánh giá"
        onCancel={() => {
          setEditReviewModal({ visible: false, review: null, loading: false })
          setEditReviewForm({ rating: 5, comment: '', images: [] })
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setEditReviewModal({ visible: false, review: null, loading: false })
              setEditReviewForm({ rating: 5, comment: '', images: [] })
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={editReviewModal.loading}
            onClick={handleUpdateReview}
            disabled={!editReviewForm.rating || editReviewForm.rating < 1}
          >
            Cập nhật
          </Button>
        ]}
        width={600}
        centered
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Đánh giá của bạn <Text type="danger">*</Text>
            </Text>
            <Rate
              value={editReviewForm.rating}
              onChange={(value) => setEditReviewForm(prev => ({ ...prev, rating: value }))}
              style={{ fontSize: '24px' }}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}>
              {editReviewForm.rating === 1 && 'Rất không hài lòng'}
              {editReviewForm.rating === 2 && 'Không hài lòng'}
              {editReviewForm.rating === 3 && 'Bình thường'}
              {editReviewForm.rating === 4 && 'Hài lòng'}
              {editReviewForm.rating === 5 && 'Rất hài lòng'}
            </Text>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Nội dung đánh giá
            </Text>
            <TextArea
              value={editReviewForm.comment}
              onChange={(e) => setEditReviewForm(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ và phòng ở..."
              rows={6}
              maxLength={1000}
              showCount
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Hình ảnh đính kèm (tối đa 5 ảnh)
            </Text>
            <Upload
              listType="picture-card"
              fileList={editReviewForm.images}
              onChange={({ fileList }) => {
                const validFiles = fileList.filter(file => {
                  // Chỉ lấy file mới upload (có originFileObj)
                  if (file.originFileObj) {
                    return true
                  }
                  // Giữ lại file đã có (từ URL)
                  return file.url || file.thumbUrl
                })
                setEditReviewForm(prev => ({
                  ...prev,
                  images: validFiles.slice(0, 5) // Giới hạn 5 ảnh
                }))
              }}
              beforeUpload={(file) => {
                // Validate file type
                const isImage = file.type.startsWith('image/')
                if (!isImage) {
                  message.error('Chỉ có thể upload file ảnh!')
                  return false
                }
                // Validate file size (max 5MB)
                const isLt5M = file.size / 1024 / 1024 < 5
                if (!isLt5M) {
                  message.error('Ảnh phải nhỏ hơn 5MB!')
                  return false
                }
                return false // Prevent auto upload
              }}
              onRemove={(file) => {
                setEditReviewForm(prev => ({
                  ...prev,
                  images: prev.images.filter(img => img.uid !== file.uid)
                }))
              }}
              accept="image/*"
            >
              {editReviewForm.images.length < 5 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </div>
        </Space>
      </Modal>

      {selectedRoom && (
        <div className="mobile-sticky-booking-bar">
          <div className="mobile-booking-info">
            <div className="mobile-booking-text">
              <Text strong>{numRooms} phòng đã chọn</Text>
              <Text strong style={{ color: '#c08a19' }}>Tổng: {formatPrice(totalPrice)}</Text>
            </div>
            <Button type="primary" size="large" onClick={handleBookNow} disabled={!selectedRoom}>Tiếp tục</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Hotels