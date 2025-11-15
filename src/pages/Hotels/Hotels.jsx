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
  Pagination
} from 'antd'
import {
  HomeOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  EnvironmentOutlined,
  UserOutlined,
  StarOutlined,
  SearchOutlined,
  ExpandOutlined,
  CloseOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import { useRoomTypes } from '../../hooks/roomtype'
import { useNavigate, useLocation } from 'react-router-dom'
import formatPrice from '../../utils/formatPrice'
import BookingWidget from '../../components/BookingWidget'
import { searchAvailableRooms } from '../../services/booking.service'
import { getReviewsByRoomType } from '../../services/review.service'
import { getRoomTypeById } from '../../services/roomtype.service'
import { message } from 'antd'
const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input

// Format date to dd/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Lấy 2 câu đầu từ description
const getFirstTwoSentences = (text) => {
  if (!text || typeof text !== 'string') return ''
  // Tách theo dấu chấm, chấm hỏi, chấm than, hoặc xuống dòng
  const sentences = text.split(/[.!?。！？\n]+/).filter(s => s.trim().length > 0)
  if (sentences.length === 0) return ''
  if (sentences.length === 1) return sentences[0].trim()
  // Lấy 2 câu đầu và nối lại
  return sentences.slice(0, 2).map(s => s.trim()).join('. ') + '.'
}

function Hotels() {
  const navigate = useNavigate()
  const location = useLocation()
  const { roomTypes, loading: roomTypesLoading, error, search, setSearch, category, setCategory } = useRoomTypes({
    limit: 1000 // Lấy tất cả room types để hiển thị
  })

  // State cho search results from API
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [roomTypeSummary, setRoomTypeSummary] = useState([]) // Lưu summary_by_room_type từ API
  const [roomTypeDetailsCache, setRoomTypeDetailsCache] = useState({}) // cache chi tiết room type theo id

  // Lấy query params từ URL
  const searchParams = new URLSearchParams(location.search)
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const adults = searchParams.get('adults')
  const children = searchParams.get('children')

  // Load available rooms khi có search params
  useEffect(() => {
    if (checkIn && checkOut) {
      const loadAvailableRooms = async () => {
        try {
          setSearchLoading(true)
          const guests = parseInt(adults || 1) + parseInt(children || 0)
          const params = {
            check_in: checkIn,
            check_out: checkOut,
            guests: guests,
            sort: 'price_asc',
            page: 1,
            limit: 1000 // Tăng limit để lấy tất cả phòng trống, đảm bảo summary_by_room_type chứa đầy đủ tất cả loại phòng
          }
          const response = await searchAvailableRooms(params)
          const rooms = response?.rooms || []
          const summary = response?.summary_by_room_type || []
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
  }, [checkIn, checkOut, adults, children]) // Thêm dependencies để reload khi params thay đổi

  // State cho filters
  const [sortBy, setSortBy] = useState('default')
  const [priceRange, setPriceRange] = useState([0, 10000000]) // Tăng max price
  const [selectedRoomType, setSelectedRoomType] = useState('all')
  const [allowChildren, setAllowChildren] = useState(false)
  const [allowPets, setAllowPets] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')

  // State cho booking summary
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [numRooms, setNumRooms] = useState(1)

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

  // Tính số đêm từ checkIn và checkOut
  const numNights = useMemo(() => {
    if (!checkIn || !checkOut) return 1
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = Math.abs(checkOutDate - checkInDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }, [checkIn, checkOut])

  // Tính tổng tiền dựa trên số lượng phòng và số đêm
  const totalPrice = useMemo(() => {
    if (!selectedRoom || !selectedRoom.price_per_night) return 0
    return selectedRoom.price_per_night * numRooms * numNights
  }, [selectedRoom, numRooms, numNights])

  // chắc chắn loading khi có search params
  const loading = checkIn && checkOut ? searchLoading : roomTypesLoading

  // Group available rooms by room type when searching by date range
  // Ưu tiên lấy thông tin từ summary, sau đó merge với rooms
  const groupedAvailableRoomTypes = useMemo(() => {
    if (!(checkIn && checkOut)) return []

    const map = new Map()

    // Bước 1: Tạo map từ summary (ưu tiên vì có thông tin chính xác về available_rooms, sold_out)
    if (Array.isArray(roomTypeSummary)) {
      for (const summary of roomTypeSummary) {
        const typeId = summary?.room_type_id
        if (!typeId) continue
        map.set(typeId, {
          room_type_id: typeId,
          room_type_name: summary?.room_type_name || '',
          category: summary?.category || null, // Thêm category từ summary
          images: Array.isArray(summary?.images) ? summary.images : [],
          capacity: summary?.capacity,
          area: summary?.area,
          amenities: Array.isArray(summary?.amenities) ? summary.amenities : [],
          price_per_night: summary?.price_per_night,
          rooms: [], // Sẽ được fill từ searchResults
          // Thông tin từ summary (ưu tiên)
          available_rooms: summary?.available_rooms ?? 0,
          total_rooms: summary?.total_rooms ?? 0,
          booked_rooms: summary?.booked_rooms ?? 0,
          sold_out: !!summary?.sold_out,
        })
      }
    }

    // Bước 2: Merge thông tin từ searchResults (rooms) vào map
    if (Array.isArray(searchResults)) {
      for (const room of searchResults) {
        const typeId = room?.room_type?.room_type_id ?? room?.room_type_id
        if (!typeId) continue

        const existing = map.get(typeId)
        const roomPrice = room?.price_per_night ?? room?.room_type?.prices?.[0]?.price_per_night ?? room?.prices?.[0]?.price_per_night

        if (existing) {
          // Cập nhật thông tin từ room nếu chưa có hoặc tốt hơn
          if (!existing.room_type_name && (room?.room_type?.room_type_name || room?.room_type_name)) {
            existing.room_type_name = room?.room_type?.room_type_name ?? room?.room_type_name
          }
          // Cập nhật category từ room nếu chưa có
          if (!existing.category && (room?.room_type?.category || room?.category)) {
            existing.category = room?.room_type?.category ?? room?.category
          }
          if ((!existing.images || existing.images.length === 0) && (room?.room_type?.images || room?.images)) {
            existing.images = room?.room_type?.images ?? room?.images ?? []
          }
          if (!existing.capacity && (room?.room_type?.capacity || room?.capacity)) {
            existing.capacity = room?.room_type?.capacity ?? room?.capacity
          }
          if (!existing.area && (room?.room_type?.area || room?.area)) {
            existing.area = room?.room_type?.area ?? room?.area
          }
          if ((!existing.amenities || existing.amenities.length === 0) && (room?.room_type?.amenities || room?.amenities)) {
            existing.amenities = Array.isArray(room?.room_type?.amenities) ? room.room_type.amenities
              : Array.isArray(room?.amenities) ? room.amenities
                : []
          }
          // Cập nhật giá: lấy giá thấp nhất từ rooms
          if (roomPrice && (!existing.price_per_night || roomPrice < existing.price_per_night)) {
            existing.price_per_night = roomPrice
          }
          // Thêm room vào danh sách
          existing.rooms.push(room)
        } else {
          // Nếu chưa có trong summary, tạo mới từ room
          const typeName = room?.room_type?.room_type_name ?? room?.room_type_name
          map.set(typeId, {
            room_type_id: typeId,
            room_type_name: typeName || '',
            category: room?.room_type?.category || room?.category || null, // Thêm category từ room
            images: room?.room_type?.images ?? room?.images ?? [],
            capacity: room?.room_type?.capacity ?? room?.capacity,
            area: room?.room_type?.area ?? room?.area,
            amenities: Array.isArray(room?.room_type?.amenities) ? room.room_type.amenities
              : Array.isArray(room?.amenities) ? room.amenities
                : [],
            price_per_night: roomPrice,
            rooms: [room],
            // Nếu không có trong summary, mặc định available_rooms = số rooms tìm được
            available_rooms: 1,
            total_rooms: 0,
            booked_rooms: 0,
            sold_out: false,
          })
        }
      }
    }

    // Bước 3: Enrich bằng cache chi tiết nếu có
    const list = Array.from(map.values()).map(item => {
      const details = roomTypeDetailsCache[item.room_type_id]
      if (details && typeof details === 'object') {
        // lấy images từ nhiều key có thể có
        const detailImages = Array.isArray(details.images) ? details.images
          : Array.isArray(details.image_urls) ? details.image_urls
            : Array.isArray(details.gallery) ? details.gallery
              : []
        const images = (item.images && item.images.length > 0) ? item.images : detailImages

        const capacity = item.capacity ?? details.capacity
        const area = item.area ?? details.area
        const category = item.category ?? details.category ?? null // Thêm category từ cache
        const amenities = (Array.isArray(item.amenities) && item.amenities.length > 0) ? item.amenities : (details.amenities || [])
        const description = item.description ?? details.description ?? null // Thêm description từ cache

        // lấy price từ nhiều khả năng: price_per_night, prices[], min_price
        let price = item.price_per_night ?? details.price_per_night
        if (price == null && Array.isArray(details.prices) && details.prices.length > 0) {
          // chọn giá nhỏ nhất trong bảng giá
          price = details.prices
            .map(p => p?.price_per_night)
            .filter(v => typeof v === 'number')
            .reduce((min, v) => (min == null || v < min ? v : min), null)
        }
        if (price == null && typeof details.min_price === 'number') {
          price = details.min_price
        }

        return { ...item, images, capacity, area, category, amenities, description, price_per_night: price }
      }
      return item
    })

    return list
  }, [searchResults, checkIn, checkOut, roomTypeSummary, roomTypeDetailsCache])



  // Determine data source: grouped search results if any, else room types catalog
  const dataSource = (checkIn && checkOut)
    ? groupedAvailableRoomTypes.map(room => ({
      ...room,
      // Đảm bảo có room_type object với category để filter hoạt động đúng
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
      room_type_id: room.room_type_id,
      room_type_name: room.room_type_name,
      category: room.category || null,
      capacity: room.capacity,
      images: room.images,
      amenities: room.amenities,
      area: room.area,
      description: room.description || null, // Thêm description từ roomTypes
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



  // Filtered rooms dựa trên các tiêu chí
  const filteredRooms = useMemo(() => {
    let filtered = [...dataSource]
    // Lọc theo khoảng giá
    filtered = filtered.filter(room => {
      const price = room.room_type?.prices?.[0]?.price_per_night ||
        room.prices?.[0]?.price_per_night ||
        room.price_per_night
      // Nếu sold_out hoặc không có phòng khả dụng và không có giá, vẫn giữ lại để hiển thị "Tạm hết phòng"
      if ((room.sold_out || room.available_rooms === 0) && (price == null)) return true
      // Nếu có phòng khả dụng nhưng không có giá, vẫn giữ lại (có thể giá sẽ được load sau)
      if (price == null && (room.available_rooms > 0 || !room.sold_out)) return true
      // Nếu có giá, kiểm tra xem có nằm trong khoảng giá không
      if (price != null) {
        return price >= priceRange[0] && price <= priceRange[1]
      }
      return false
    })
    
    // Lọc theo loại phòng (category)
    // Normalize để tránh lỗi do khoảng trắng hoặc case sensitivity
    if (selectedRoomType !== 'all') {
      filtered = filtered.filter(room => {
        const categoryValue = room.room_type?.category || room.category
        if (!categoryValue) return false
        // Normalize: trim khoảng trắng và chuyển về lowercase để so sánh
        const normalizedCategory = String(categoryValue).trim().toLowerCase()
        const normalizedSelected = String(selectedRoomType).trim().toLowerCase()
        return normalizedCategory === normalizedSelected
      })
    }

    // Sắp xếp: Phòng có sẵn lên trên, phòng hết phòng xuống dưới
    // Chỉ sắp xếp khi có search params (checkIn/checkOut)
    if (checkIn && checkOut) {
      filtered.sort((a, b) => {
        // Kiểm tra phòng có sẵn: available_rooms > 0 và không sold_out
        const aAvailable = a.available_rooms > 0 && !a.sold_out
        const bAvailable = b.available_rooms > 0 && !b.sold_out

        // Phòng có sẵn (aAvailable = true) sẽ có priority cao hơn (số nhỏ hơn)
        if (aAvailable && !bAvailable) return -1
        if (!aAvailable && bAvailable) return 1

        // Nếu cả hai cùng trạng thái, sắp xếp theo giá tăng dần
        if (aAvailable && bAvailable) {
          // Cả hai đều có sẵn, sắp xếp theo giá tăng dần
          const aPrice = a.price_per_night || 0
          const bPrice = b.price_per_night || 0
          return aPrice - bPrice
        }

        // Cả hai đều hết phòng, sắp xếp theo giá tăng dần
        const aPrice = a.price_per_night || 0
        const bPrice = b.price_per_night || 0
        return aPrice - bPrice
      })
    }

    return filtered
  }, [dataSource, searchKeyword, priceRange, selectedRoomType, allowChildren, allowPets, sortBy, checkIn, checkOut])



  // Reset price range khi có data mới
  const handleSearch = (value) => {
    setSearchKeyword(value)
  }

  const handleRoomTypeChange = (value) => {
    setSelectedRoomType(value)
  }

  const handleSelectRoom = (room) => {
    setSelectedRoom(room)
    setNumRooms(1) // Reset về 1 phòng khi chọn phòng mới
  }

  const handleRemoveRoom = () => {
    setSelectedRoom(null)
    setNumRooms(1) // Reset về 1 phòng
  }

  const handleNumRoomsChange = (value) => {
    const num = value || 1
    if (num === 0) {
      // Hiển thị modal xác nhận khi xóa về 0
      Modal.confirm({
        title: 'Xác nhận xóa phòng',
        content: 'Bạn có chắc muốn xóa phòng này khỏi đơn đặt không?',
        okText: 'Xóa',
        cancelText: 'Hủy',
        okType: 'danger',
        onOk: () => {
          setSelectedRoom(null)
          setNumRooms(1)
        },
        onCancel: () => {
          // Giữ lại số phòng hiện tại (không thay đổi)
          setNumRooms(numRooms)
        }
      })
      return
    }
    setNumRooms(num > 0 ? num : 1)
  }

  const handleDecreaseRooms = () => {
    if (numRooms > 1) {
      setNumRooms(numRooms - 1)
    } else {
      // Nếu đang là 1 và muốn giảm, hiển thị modal xác nhận xóa
      Modal.confirm({
        title: 'Xác nhận xóa phòng',
        content: 'Bạn có chắc muốn xóa phòng này khỏi đơn đặt không?',
        okText: 'Xóa',
        cancelText: 'Hủy',
        okType: 'danger',
        onOk: () => {
          setSelectedRoom(null)
          setNumRooms(1)
        }
      })
    }
  }

  const handleIncreaseRooms = () => {
    if (numRooms < 10) {
      setNumRooms(numRooms + 1)
    } else {
      message.warning('Số lượng phòng tối đa là 10')
    }
  }

  const handleBookNow = () => {
    if (!selectedRoom) return
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (!token && !user) {
      setIsLoginModalVisible(true)
      return
    }
    const adultsNum = parseInt(adults || '1', 10)
    const childrenNum = parseInt(children || '0', 10)
    navigate('/booking-confirmation', {
      state: {
        roomType: selectedRoom,
        checkIn: checkIn || '',
        checkOut: checkOut || '',
        guests: { adults: adultsNum, children: childrenNum },
        numRooms: numRooms,
        numNights: numNights,

      }
    })
  }

  const handleShowModal = async (room) => {
    setRoomInModal(room)
    setIsModalVisible(true)

    // Load reviews và room type details khi mở modal
    if (room?.room_type_id || room?.room_type?.room_type_id) {
      const roomTypeId = room.room_type_id || room.room_type?.room_type_id

      // Load reviews
      await loadReviews(roomTypeId)

      // Load room type details vào cache nếu chưa có
      if (roomTypeId && !roomTypeDetailsCache[roomTypeId]) {
        try {
          const response = await getRoomTypeById(roomTypeId)
          const roomTypeData = response?.roomType || response?.data?.roomType || response?.room_type || response?.data?.room_type || response
          if (roomTypeData) {
            setRoomTypeDetailsCache(prev => ({
              ...prev,
              [roomTypeId]: roomTypeData
            }))
          }
        } catch (error) {
          console.error('Error loading room type details:', error)
        }
      }
    }
  }

  const loadReviews = async (roomTypeId, page = 1) => {
    if (!roomTypeId) return

    try {
      setReviewsLoading(true)
      const pageSize = 5
      const response = await getReviewsByRoomType(roomTypeId, {
        page,
        limit: pageSize
      })

      setReviews(response?.reviews || [])
      setReviewsPagination(prev => ({
        ...prev,
        current: response?.pagination?.currentPage || page,
        total: response?.pagination?.totalItems || 0,
        pageSize: pageSize
      }))
    } catch (error) {
      console.error('Error loading reviews:', error)
      setReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setRoomInModal(null)
    setReviews([])
    setReviewsPagination({
      current: 1,
      pageSize: 5,
      total: 0
    })
  }

  const handleSelectFromModal = () => {
    if (!roomInModal) return
    setSelectedRoom(roomInModal)
    handleCloseModal()
    const adultsNum = parseInt(adults || '1', 10)
    const childrenNum = parseInt(children || '0', 10)
    navigate('/booking-confirmation', {
      state: {
        roomType: roomInModal,
        checkIn: checkIn || '',
        checkOut: checkOut || '',
        guests: { adults: adultsNum, children: childrenNum }
      }
    })
  }



  return (
    <div className="hotels-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item href="/">
            <HomeOutlined />
            <span>Trang chủ</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Danh sách phòng</Breadcrumb.Item>
        </Breadcrumb>


        {/* Booking Widget */}
        <div
          className='booking-widget-container'
        >
          <BookingWidget checkIn={checkIn} checkOut={checkOut} adults={adults} children={children} />
        </div>

        {/* Main Layout - Room List và Booking Summary */}
        <Row gutter={[24, 24]}>
          {/* Danh sách phòng - Cột trái */}
          <Col xs={24} lg={16}>
            {/* Sort Section */}


            {/* Room List */}
            <div className="rooms-list">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: '16px' }}>
                    <Spin size="large" />
                  </div>
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Empty
                    description={error}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : filteredRooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Empty
                    description="Không tìm thấy phòng nào phù hợp"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : (
                filteredRooms.map(room => (
                  <Card
                    key={room.room_type_id}
                    className="room-card-new"
                    bodyStyle={{ padding: 0 }} // Bỏ padding mặc định của Card
                  >
                    {/* Badge hiển thị số phòng còn available - góc phải trên */}
                    {checkIn && checkOut && room.available_rooms !== undefined && (
                      <div className="room-availability-badge">
                        {room.sold_out ? (
                          <Tag color="error" style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '4px 12px',
                            borderRadius: '16px',
                            margin: 0,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                          }}>
                            Tạm hết phòng
                          </Tag>
                        ) : (
                          <Tag color="success" style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '4px 12px',
                            borderRadius: '16px',
                            margin: 0,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                          }}>
                            Còn {room.available_rooms} phòng
                          </Tag>
                        )}
                      </div>
                    )}
                    <Row gutter={0} align="stretch">
                      {/* Cột hình ảnh */}
                      <Col xs={24} md={9}>
                        <div className="room-image-new">
                          {room.images && room.images.length > 0 ? (
                            <img
                              alt={room.room_type_name}
                              src={room.images[0]}
                            />
                          ) : (
                            <div className="room-image-placeholder">
                              <EnvironmentOutlined />
                              <Text>Không có hình ảnh</Text>
                            </div>
                          )}
                        </div>
                      </Col>

                      {/* Cột thông tin */}
                      <Col xs={24} md={15}>
                        <div className="room-info-new">

                          {/* Phần thông tin chính (sẽ co giãn) */}
                          <div className="room-info-main">
                            <Title level={3} className="room-name-new">{room.room_type_name}</Title>

                            {/* Chi tiết chính (Sức chứa, Diện tích) */}
                            <div className="key-details" style={{ marginBottom: '16px' }}>
                              <Space size="large" wrap>
                                <span>
                                  <UserOutlined />
                                  <Text>{room.capacity || 2} người</Text>
                                </span>
                                <span>
                                  <ExpandOutlined />
                                  <Text>{room.area || 0} m²</Text>
                                </span>
                              </Space>
                            </div>

                            {/* Danh sách tiện nghi (dạng Tags) */}
                            {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0 && (
                              <div className="amenities-list-tags" style={{ marginBottom: '20px' }}>
                                <Space size={[8, 8]} wrap>
                                  {room.amenities.slice(0, 5).map((amenity, index) => (
                                    <Tag key={index}>{amenity}</Tag>
                                  ))}
                                  {room.amenities.length > 5 && (
                                    <Tag>+ {room.amenities.length - 5} thêm</Tag>
                                  )}
                                </Space>
                              </div>
                            )}

                            <Button
                              type="link"
                              icon={<EyeOutlined />}
                              onClick={() => handleShowModal(room)}
                              style={{ padding: 0, height: 'auto', fontSize: '14px', color: '#c08a19' }}
                            >
                              Xem chi tiết & tiện nghi
                            </Button>

                            {/* Hiển thị 2 câu description */}
                            {(() => {
                              const roomDescription = room.description || roomTypeDetailsCache[room.room_type_id]?.description || ''
                              const firstTwoSentences = getFirstTwoSentences(roomDescription)
                              return firstTwoSentences ? (
                                <div style={{ marginTop: '12px' }}>
                                  <Text style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', display: 'block' }}>
                                    {firstTwoSentences}
                                  </Text>
                                </div>
                              ) : null
                            })()}

                          </div>

                          {/* Phần chân (Giá, Nút) - sẽ bị đẩy xuống dưới */}
                          <div className="room-info-footer">
                            {/* Thông tin giá */}
                            <div className="rate-info" style={{ marginBottom: '16px' }}>
                              <Text strong style={{ fontSize: '15px' }}>Giá tiêu chuẩn</Text>
                              <div style={{ marginTop: '8px' }}>
                                <Space direction="vertical" size={4}>
                                  <Text className="rate-policy-text">
                                    <CheckCircleOutlined /> Hủy miễn phí!
                                  </Text>
                                  <Text className="rate-policy-text">
                                    <CheckCircleOutlined /> Đặt ngay, trả sau
                                    _</Text>
                                </Space>
                              </div>
                            </div>

                            {/* Giá và Nút Chọn */}
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

          {/* Cột phải - Booking Summary */}
          <Col xs={24} lg={8}>
            <Card className="booking-summary-card">
              <div className="summary-header">
                <Title level={3} style={{ margin: 0, fontSize: '28px', fontWeight: 700, textAlign: 'center' }}>
                  {selectedRoom ? `${selectedRoom?.room_type_name}` : ''}
                  {/* {selectedRoom ? formatPrice(totalPrice) : 'VND 0'}  */}
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
                  <Text style={{ fontSize: '14px', color: '#6b7280' }}>
                    {numNights} {numNights === 1 ? 'đêm' : 'đêm'}
                  </Text>
                </div>
              )}
              <div className="summary-guests" style={{ marginTop: '8px' }}>
                <Text style={{ fontSize: '14px', color: '#6b7280' }}>
                  {adults ? `${adults} người lớn` : ''}
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
                            <Text style={{ fontSize: '14px', color: '#6b7280' }}>
                              {formatPrice(selectedRoom.price_per_night)} / đêm
                            </Text>
                          </div>
                          <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text style={{ color: '#059669', fontSize: '14px' }}>Hủy miễn phí!</Text>

                            {/* Số lượng phòng với nút tăng/giảm - nhỏ và nằm trong cột thông tin */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                              <Button
                                type="text"
                                size="small"
                                style={{ minWidth: '24px', height: '24px', padding: 0, fontSize: '16px', lineHeight: '24px' }}
                                onClick={handleDecreaseRooms}
                              >
                                -
                              </Button>
                              <InputNumber
                                min={0}
                                max={10}
                                value={numRooms}
                                onChange={handleNumRoomsChange}
                                size="small"
                                controls={false}
                                style={{ width: '50px', fontSize: '12px' }}
                              />
                              <Button
                                type="text"
                                size="small"
                                style={{ minWidth: '24px', height: '24px', padding: 0, fontSize: '16px', lineHeight: '24px' }}
                                onClick={handleIncreaseRooms}
                                disabled={numRooms >= 10}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Chi tiết giá */}
                      {checkIn && checkOut && (
                        <div style={{ marginTop: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <Text style={{ fontSize: '13px', color: '#6b7280' }}>
                              {formatPrice(selectedRoom.price_per_night)} × {numRooms} phòng × {numNights} đêm
                            </Text>
                            <Text style={{ fontSize: '13px', color: '#6b7280' }}>
                              {formatPrice(totalPrice)}
                            </Text>
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
                  <Text strong style={{ fontSize: '18px', color: '#1f2937' }}>
                    {selectedRoom ? formatPrice(totalPrice) : 'VND 0'}
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: '13px' }}>Bao gồm thuế + phí</Text>
              </div>
              <Divider />
              <Button
                type="primary"
                size="large"
                block
                className="book-now-btn"
                onClick={handleBookNow}
                disabled={!selectedRoom}
              >
                Đặt phòng
              </Button>
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
      >
        {roomInModal && (
          <div className="modal-content">
            {(() => {
              const detailRoom = roomInModal?.room || (Array.isArray(roomInModal?.rooms) ? roomInModal.rooms[0] : null) || roomInModal
              const modalImages = detailRoom?.images || roomInModal?.images || []
              const modalAmenities = Array.isArray(detailRoom?.amenities) ? detailRoom.amenities : (Array.isArray(roomInModal?.amenities) ? roomInModal.amenities : [])
              const modalCapacity = detailRoom?.capacity ?? roomInModal?.capacity
              const modalArea = detailRoom?.area ?? roomInModal?.area
              const modalPrice = detailRoom?.price_per_night ?? roomInModal?.price_per_night
              // Lấy description từ nhiều nguồn
              const modalDescription = detailRoom?.description ?? roomInModal?.description ?? roomTypeDetailsCache[roomInModal?.room_type_id]?.description ?? ''
              return (
                <>
                  {/* Header */}
                  <div className="modal-header">
                    <Title level={3} style={{ margin: 0 }}>
                      {roomInModal.room_type_name}
                    </Title>
                  </div>

                  <Divider />

                  {/* Content - 2 Cột */}
                  <Row gutter={24}>
                    {/* Cột trái - Chi tiết */}
                    <Col xs={24} md={14}>
                      {/* Mô tả phòng */}
                      {modalDescription && (
                        <>
                          <div>
                            <Title level={5} style={{ marginBottom: '12px' }}>Mô tả</Title>
                            <Text style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.8', whiteSpace: 'pre-line', display: 'block' }}>
                              {modalDescription}
                            </Text>
                          </div>
                          <Divider />
                        </>
                      )}

                      {/* Tính năng phòng - từ room */}
                      <div>
                        <Title level={5}>Tính năng phòng</Title>
                        {modalAmenities && modalAmenities.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#6b7280' }}>
                            {modalAmenities.map((amenity, idx) => (
                              <li key={idx}>{amenity}</li>
                            ))}
                          </ul>
                        ) : (
                          <Text style={{ fontSize: '14px', color: '#6b7280' }}>Đang cập nhật tiện nghi</Text>
                        )}
                      </div>
                      <Divider />
                      {/* Thông số kỹ thuật */}
                      <div>
                        <Title level={5}>Thông số phòng</Title>
                        <Row gutter={[16, 16]}>
                          <Col xs={12}>
                            <Space size="small">
                              <UserOutlined style={{ color: '#6b7280' }} />
                              <div>
                                <Text style={{ fontSize: '12px', color: '#9ca3af' }}>Sức chứa tối đa</Text>
                                <div><Text strong>Số người: {modalCapacity || 2}</Text></div>
                              </div>
                            </Space>
                          </Col>
                          <Col xs={12}>
                            <Space size="small">
                              {/* <BedOutlined style={{ color: '#6b7280' }} /> */}
                              {/* <div>
                          <Text style={{ fontSize: '12px', color: '#9ca3af' }}>Cấu hình giường</Text>
                          <div><Text strong>1 Giường King</Text></div>
                        </div> */}
                            </Space>
                          </Col>
                          <Col xs={12}>
                            <Space size="small">
                              <ExpandOutlined style={{ color: '#6b7280' }} />
                              <div>
                                <Text style={{ fontSize: '12px', color: '#9ca3af' }}>Diện tích phòng</Text>
                                <div><Text strong>{modalArea || 28}m²</Text></div>
                              </div>
                            </Space>
                          </Col>


                          <Col xs={12}>
                            <Space size="small">
                              {/* <SmokeOutlined style={{ color: '#6b7280' }} /> */}
                              <div>
                                <Text style={{ fontSize: '12px', color: '#9ca3af' }}>Chính sách hút thuốc</Text>
                                <div><Text strong>Không hút thuốc</Text></div>
                              </div>
                            </Space>
                          </Col>
                        </Row>
                      </div>

                      <Divider />

                      {/* Amenities */}
                      <div>
                        <Title level={5}>Tiện nghi</Title>
                        <Text style={{ fontSize: '14px', color: '#6b7280' }}>
                          {roomInModal.amenities && Array.isArray(roomInModal.amenities)
                            ? roomInModal.amenities.join(', ')
                            : 'Điều hòa, Nôi, Ban công, Truyền hình cáp, Dép đi trong nhà, Áo choàng tắm, TV cáp/vệ tinh, Đầu báo khói, Vòi sen, Máy sấy tóc, TV, Tủ quần áo trong phòng, Xà phòng tắm, Dầu gội, Chậu rửa vệ sinh, Mini Bar, Điện thoại, Khăn trải giường và Khăn tắm, Két an toàn trong phòng, Vòi sen trên bồn tắm, Đồ dùng vệ sinh cá nhân, Bàn làm việc, Khu vực vệ sinh riêng, Bồn tắm, Phòng tắm riêng'
                          }
                        </Text>
                      </div>

                      <Divider />

                      {/* Reviews Section */}
                      <div>
                        <Title level={5} style={{ marginBottom: '16px' }}>
                          <MessageOutlined style={{ marginRight: '8px' }} />
                          Đánh giá từ khách hàng
                        </Title>

                        {reviewsLoading ? (
                          <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Spin />
                          </div>
                        ) : reviews.length === 0 ? (
                          <Empty
                            description="Chưa có đánh giá nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            style={{ padding: '20px 0' }}
                          />
                        ) : (
                          <>
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                              {reviews.map((review) => (
                                <Card key={review.review_id} size="small" style={{ borderRadius: '8px' }}>
                                  <div style={{ display: 'flex', gap: '12px' }}>
                                    <Avatar
                                      style={{ backgroundColor: '#c08a19', flexShrink: 0 }}
                                      size="large"
                                    >
                                      {review.user?.full_name?.charAt(0)?.toUpperCase() || 'G'}
                                    </Avatar>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                        <div>
                                          <Text strong style={{ fontSize: '14px' }}>
                                            {review.user?.full_name || 'Khách hàng'}
                                          </Text>
                                          <div style={{ marginTop: '4px' }}>
                                            <Rate
                                              disabled
                                              value={review.rating}
                                              style={{ fontSize: '12px' }}
                                            />
                                          </div>
                                        </div>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                          {formatDate(review.created_at)}
                                        </Text>
                                      </div>
                                      {review.comment && (
                                        <Text style={{ fontSize: '14px', color: '#6b7280', display: 'block', marginTop: '8px' }}>
                                          {review.comment}
                                        </Text>
                                      )}
                                      {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                          <Image.PreviewGroup>
                                            {review.images.slice(0, 3).map((img, idx) => (
                                              <Image
                                                key={idx}
                                                src={img}
                                                alt={`Review image ${idx + 1}`}
                                                width={60}
                                                height={60}
                                                style={{
                                                  objectFit: 'cover',
                                                  borderRadius: '6px',
                                                  cursor: 'pointer'
                                                }}
                                                preview={{ mask: false }}
                                              />
                                            ))}
                                          </Image.PreviewGroup>
                                          {review.images.length > 3 && (
                                            <Text type="secondary" style={{ fontSize: '12px', alignSelf: 'center' }}>
                                              +{review.images.length - 3} ảnh
                                            </Text>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </Space>

                            {reviewsPagination.total > reviewsPagination.pageSize && (
                              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                <Pagination
                                  current={reviewsPagination.current}
                                  pageSize={reviewsPagination.pageSize}
                                  total={reviewsPagination.total}
                                  onChange={(page) => {
                                    const roomTypeId = roomInModal?.room_type_id || roomInModal?.room_type?.room_type_id
                                    if (roomTypeId) {
                                      loadReviews(roomTypeId, page)
                                    }
                                  }}
                                  showSizeChanger={false}
                                  size="small"
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </Col>

                    {/* Cột phải - Hình ảnh và giá */}
                    <Col xs={24} md={10}>
                      <div className="modal-image-section">
                        {modalImages && modalImages.length > 0 ? (
                          <Image.PreviewGroup>
                            <Carousel
                              arrows
                              dots
                              draggable
                              swipeToSlide
                              touchMove
                              style={{ marginBottom: '24px' }}
                              effect="scrollx"
                              className="room-image-carousel"
                            >
                              {modalImages.map((img, index) => (
                                <div key={index} style={{ cursor: 'pointer' }}>
                                  <Image
                                    src={img}
                                    alt={`${roomInModal.room_type_name} ${index + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '300px',
                                      objectFit: 'cover',
                                      borderRadius: '12px',
                                    }}
                                    preview={{
                                      mask: 'Xem ảnh lớn',
                                      maskClassName: 'image-preview-mask'
                                    }}
                                  />
                                </div>
                              ))}
                            </Carousel>
                          </Image.PreviewGroup>
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '300px',
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            borderRadius: '12px'
                          }}>
                            Không có hình ảnh
                          </div>
                        )}
                      </div>

                      <Divider />

                      {/* Chi tiết giá */}
                      <div className="price-breakdown">
                        <div style={{ marginBottom: '12px' }}>
                          <Text style={{ fontSize: '14px', color: '#6b7280' }}>{formatDate(checkIn)} - {formatDate(checkOut)}</Text>
                          <Text strong style={{ fontSize: '18px', color: '#1f2937', marginLeft: '8px' }}>
                            {formatPrice(modalPrice * numRooms * numNights)}
                          </Text>
                        </div>
                        <div>

                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* Footer cố định */}
                  <div className="modal-footer-fixed">
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text strong style={{ fontSize: '24px', color: '#1f2937' }}>
                          {formatPrice(modalPrice)}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '14px', display: 'block' }}>
                          Chi phí cho {numRooms} phòng × {numNights} đêm
                        </Text>
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          size="large"
                          className="select-btn"
                          onClick={handleSelectFromModal}
                          disabled={checkIn && checkOut && (roomInModal?.sold_out === true)}
                        >
                          {checkIn && checkOut && (roomInModal?.sold_out === true) ? 'Tạm hết phòng' : 'Chọn'}
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </Modal>

      {/* Modal yêu cầu đăng nhập */}
      <Modal
        open={isLoginModalVisible}
        onCancel={() => setIsLoginModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsLoginModalVisible(false)}>Đóng</Button>,
          <Button key="login" type="primary" onClick={() => navigate('/login')}>Đăng nhập</Button>
        ]}
        title="Yêu cầu đăng nhập"
        centered
      >
        <Text>Vui lòng đăng nhập để tiếp tục đặt phòng.</Text>
      </Modal>
    </div>
  )
}

export default Hotels