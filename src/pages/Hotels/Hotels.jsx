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
  Modal,
  Carousel
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
} from '@ant-design/icons'
import { useRoomTypes } from '../../hooks/roomtype'
import { useNavigate, useLocation } from 'react-router-dom'
import formatPrice from '../../utils/formatPrice'
import BookingWidget from '../../components/BookingWidget'
import { searchAvailableRooms } from '../../services/booking.service'
import { message } from 'antd'

const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input

function Hotels() {
  const navigate = useNavigate()
  const location = useLocation()
  const { roomTypes, loading: roomTypesLoading, error, search, setSearch, category, setCategory } = useRoomTypes({
    limit: 50 // Lấy nhiều room types để hiển thị
  })
  
  // State cho search results from API
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [roomTypeSummary, setRoomTypeSummary] = useState([]) // Lưu summary_by_room_type từ API
  
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
            limit: 50
          }
          const response = await searchAvailableRooms(params)
          console.log(response);
          
          const rooms = response?.rooms || []
          const summary = response?.summary_by_room_type || []
          
          setSearchResults(rooms)
          setRoomTypeSummary(summary) // Lưu summary vào state
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
  
  // State cho modal
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [roomInModal, setRoomInModal] = useState(null)
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)
  
  // Determine loading state
  const loading = checkIn && checkOut ? searchLoading : roomTypesLoading

  // Group available rooms by room type when searching by date range
  const groupedAvailableRoomTypes = useMemo(() => {
    if (!(checkIn && checkOut) || !Array.isArray(searchResults)) return []

    const map = new Map()
    for (const item of searchResults) {
      const typeId = item?.room_type?.room_type_id ?? item?.room_type_id
      if (!typeId) continue
      const existing = map.get(typeId)

      const typeName = item?.room_type?.room_type_name ?? item?.room_type_name
      const images = item?.room_type?.images ?? item?.images ?? []
      const capacity = item?.room_type?.capacity ?? item?.capacity
      const area = item?.room_type?.area ?? item?.area
      const amenities = item?.room_type?.amenities ?? item?.amenities ?? []
      const price = item?.price_per_night ?? item?.room_type?.prices?.[0]?.price_per_night ?? item?.prices?.[0]?.price_per_night

      // Tìm summary cho room type này
      const summary = roomTypeSummary.find(s => s.room_type_id === typeId)

      if (!existing) {
        map.set(typeId, {
          room_type_id: typeId,
          room_type_name: typeName,
          images,
          capacity,
          area,
          amenities,
          price_per_night: price,
          rooms: [item],
          // Thêm thông tin từ summary
          available_rooms: summary?.available_rooms || 0,
          total_rooms: summary?.total_rooms || 0,
          booked_rooms: summary?.booked_rooms || 0,
          sold_out: summary?.sold_out || false,
        })
      } else {
        existing.rooms.push(item)
        // keep the lowest price among rooms of this type if available
        const currentPrice = existing.price_per_night
        if (price && (!currentPrice || price < currentPrice)) {
          existing.price_per_night = price
        }
      }
    }

    return Array.from(map.values())
  }, [searchResults, checkIn, checkOut, roomTypeSummary])

  // Determine data source: grouped search results if any, else room types catalog
  const dataSource = (checkIn && checkOut)
    ? groupedAvailableRoomTypes
    : roomTypes.map(room => ({
        room_type_id: room.room_type_id,
        room_type_name: room.room_type_name,
        capacity: room.capacity,
        images: room.images,
        amenities: room.amenities,
        area: room.area,
        price_per_night: room.price_per_night,
        room_type: {
          room_type_id: room.room_type_id,
          room_type_name: room.room_type_name,
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
      if (!price) return false
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Lọc theo loại phòng (category)
    if (selectedRoomType !== 'all') {
      filtered = filtered.filter(room => {
        const categoryValue = room.room_type?.category || room.category
        return categoryValue === selectedRoomType
      })
    }

  
    return filtered
  }, [dataSource, searchKeyword, priceRange, selectedRoomType, allowChildren, allowPets, sortBy])

  // Reset price range khi có data mới

  const handleSearch = (value) => {
    setSearchKeyword(value)
  }

  const handleRoomTypeChange = (value) => {
    setSelectedRoomType(value)
  }

  const handleSelectRoom = (room) => {
    setSelectedRoom(room)
  }

  const handleRemoveRoom = () => {
    setSelectedRoom(null)
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
        guests: { adults: adultsNum, children: childrenNum }
      }
    })
  }

  const handleShowModal = (room) => {
    setRoomInModal(room)
    setIsModalVisible(true)
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setRoomInModal(null)
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
                  // <Card key={room.room_type_id} className="room-card-new" hoverable>
                  //   <Row gutter={24} align="stretch">
                  //     <Col xs={24} sm={24} md={8}>
                  //       <div className="room-image-new">
                  //         {room.images && room.images.length > 0 ? (
                  //           <img 
                  //             alt={room.room_type_name} 
                  //             src={room.images[0]} 
                  //             style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px' }}
                  //           />
                  //         ) : (
                  //           <div style={{ 
                  //             width: '100%', 
                  //             height: '300px', 
                  //             background: '#f0f0f0', 
                  //             display: 'flex', 
                  //             alignItems: 'center', 
                  //             justifyContent: 'center',
                  //             color: '#999',
                  //             borderRadius: '12px'
                  //           }}>
                  //             Không có hình ảnh
                  //           </div>
                  //         )}
                  //       </div>
                  //     </Col>
                  //     <Col xs={24} sm={24} md={16}>
                  //       <div className="room-info-new">
                  //         <Title level={3} className="room-name-new">{room.room_type_name}</Title>
                          
                  //         {/* Key Details */}
                  //         <div className="key-details" style={{ marginTop: '12px', marginBottom: '16px' }}>
                  //           <Space size="middle" wrap>
                  //             <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  //               <UserOutlined style={{ color: '#6b7280' }} />
                  //               <Text style={{ fontSize: '14px', color: '#6b7280' }}>{room.capacity || 2} người</Text>
                  //             </span>
                              
                  //             <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  //               <ExpandOutlined style={{ color: '#6b7280' }} />
                  //               <Text style={{ fontSize: '14px', color: '#6b7280' }}>{room.area || 0} m²</Text>
                  //             </span>
                  //           </Space>
                  //         </div>

                  //         {/* Amenities List */}
                  //         {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0 && (
                  //           <div className="amenities-list" style={{ marginBottom: '20px' }}>
                  //             <ul style={{ margin: 0, padding: '0 0 0 20px', fontSize: '14px', color: '#6b7280', listStyleType: 'none' }}>
                  //               {room.amenities.slice(0, 6).map((amenity, index) => (
                  //                 <li key={index} style={{ marginBottom: '4px' }}>{amenity}</li>
                  //               ))}
                  //             </ul>
                          
                  //               <Text 
                  //                 style={{ fontSize: '14px', color: '#c08a19', cursor: 'pointer' }}
                  //                 onClick={() => handleShowModal(room)}
                  //               >
                  //                 Xem thêm
                  //               </Text>
                          
                  //           </div>
                  //         )}

                  //         {/* Rate Information */}
                  //         <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                  //           <Text strong style={{ fontSize: '14px' }}>Giá tiêu chuẩn</Text>
                  //           <div style={{ marginTop: '8px', marginBottom: '16px' }}>
                  //             <Space size="small" style={{ color: '#059669', fontSize: '14px' }}>
                  //               <Text style={{ color: '#059669' }}>✓ Hủy miễn phí!</Text>
                  //               <Text style={{ color: '#059669' }}>✓ Đặt ngay, trả sau</Text>
                  //             </Space>
                  //             <div>
                  //               <Text type="secondary" style={{ fontSize: '14px' }}>Xem thêm</Text>
                  //             </div>
                  //           </div>

                  //           {/* Số lượng phòng còn lại - chỉ hiển thị khi có search params */}
                  //           {checkIn && checkOut && room.available_rooms !== undefined && (
                  //             <div style={{ marginBottom: '12px', padding: '8px', background: room.sold_out ? '#fee' : '#f0f9ff', borderRadius: '4px' }}>
                  //               {room.sold_out ? (
                  //                 <Text type="danger" style={{ fontSize: '14px', fontWeight: 500 }}>
                  //                   ⚠️ Hết phòng
                  //                 </Text>
                  //               ) : (
                  //                 <Text style={{ fontSize: '14px', color: '#059669', fontWeight: 500 }}>
                  //                   ✓ Còn {room.available_rooms} phòng trống
                  //                 </Text>
                  //               )}
                  //               <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  //                 Tổng {room.total_rooms} phòng • Đã đặt {room.booked_rooms} phòng
                  //               </Text>
                  //             </div>
                  //           )}

                  //           {/* Price and Select Button */}
                  //           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  //             <div>
                  //               <Text strong style={{ fontSize: '24px', color: '#c08a19' }}>
                  //                 {room.price_per_night ? formatPrice(room.price_per_night) : 'Liên hệ'}
                  //               </Text>
                  //               <Text type="secondary" style={{ fontSize: '14px', display: 'block' }}>
                  //                 Chi phí cho 1 đêm, 2 khách
                  //               </Text>
                  //             </div>
                  //             <Button 
                  //               type="primary" 
                  //               size="large" 
                  //               className="select-btn"
                  //               onClick={() => handleSelectRoom(room)}
                  //               disabled={checkIn && checkOut && room.sold_out}
                  //             >
                  //               {checkIn && checkOut && room.sold_out ? 'Hết phòng' : 'Chọn'}
                  //             </Button>
                  //           </div>
                  //         </div>
                  //       </div>
                  //     </Col>
                  //   </Row>
                  // </Card>
                  <Card 
                    key={room.room_type_id} 
                    className="room-card-new" 
                    bodyStyle={{ padding: 0 }} // Bỏ padding mặc định của Card
                  >
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
                                  / đêm (cho 2 khách)
                                </Text>
                              </div>
                           <Button 
                                type="primary" 
                                size="large" 
                                className="select-btn"
                                onClick={() => handleSelectRoom(room)}
                                disabled={checkIn && checkOut && room.sold_out}
                            >
                                Chọn phòng
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
                <Title level={3} style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>
                  {selectedRoom ? formatPrice(selectedRoom.price_per_night) : 'VND 0'} tổng cộng
                </Title>
              </div>

              <Divider />

              <div className="summary-dates">
                <Text strong style={{ fontSize: '16px' }}>{checkIn} - {checkOut}</Text>
              </div>
              <div className="summary-guests" style={{ marginTop: '8px' }}>
                <Text style={{ fontSize: '14px', color: '#6b7280' }}>{selectedRoom?.room_type?.capacity || 2} người</Text>
              </div>

              <Divider />

              <div className="summary-room-details">
                {selectedRoom ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: '14px' }}>{selectedRoom.room_type_name}</Text>
                        <div style={{ marginTop: '4px' }}>
                          <Text style={{ fontSize: '14px', color: '#6b7280' }}></Text>
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          <Text style={{ color: '#059669', fontSize: '14px' }}>Hủy miễn phí!</Text>
                        </div>
                      </div>
                      <Button 
                        type="text" 
                        icon={<span>🗑️</span>}
                        onClick={handleRemoveRoom}
                        style={{ marginLeft: '8px' }}
                      />
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '8px' }}>
                      <Text strong style={{ fontSize: '18px', color: '#1f2937' }}>
                        {formatPrice(selectedRoom.price_per_night)}
                      </Text>
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
                    {selectedRoom ? formatPrice(selectedRoom.price_per_night) : 'VND 0'}
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
              return (
              <>
            {/* Header */}
            <div className="modal-header">
              <Title level={3} style={{ margin: 0 }}>
                {roomInModal.room_type_name} - Giá tiêu chuẩn
              </Title>
            </div>

            <Divider />

            {/* Content - 2 Cột */}
            <Row gutter={24}>
              {/* Cột trái - Chi tiết */}
              <Col xs={24} md={14}>
                {/* Thông tin nổi bật */}
                <div className="highlight-info">
                  <Space size="middle" direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong style={{ color: '#059669', fontSize: '14px' }}>
                        ✓ Hủy miễn phí!
                      </Text>
                    </div>
                    <div>
                      <Text strong style={{ color: '#059669', fontSize: '14px' }}>
                        ✓ Đặt ngay, trả sau
                      </Text>
                    </div>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#6b7280' }}>
                        Phòng bao gồm bữa sáng và tầm nhìn thành phố
                      </Text>
                    </div>
                  </Space>
                </div>

                <Divider />

                {/* Chính sách hủy */}
                <div>
                  <Title level={5}>Chính sách hủy của khách sạn</Title>
                  <Text style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.8' }}>
                    Tất cả các đặt phòng phải được đảm bảo bằng thẻ tín dụng và sẽ được xác minh sau khi đặt phòng. 
                    Bất kỳ hủy bỏ nào nhận được trong vòng 2 ngày trước ngày đến sẽ chịu phí 100%. 
                    Việc không đến khách sạn hoặc cơ sở lưu trú sẽ được coi là không đến và sẽ chịu phí 100% (chính sách của khách sạn).
                  </Text>
                </div>

                <Divider />

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
                        <div>
                          <Text style={{ fontSize: '12px', color: '#9ca3af' }}>Cấu hình giường</Text>
                          <div><Text strong>1 Giường King</Text></div>
                        </div>
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
                        <Text style={{ color: '#6b7280', fontSize: '18px' }}>🛁</Text>
                        <div>
                          <Text style={{ fontSize: '12px', color: '#9ca3af' }}>Số phòng tắm</Text>
                          <div><Text strong>1</Text></div>
                        </div>
                      </Space>
                    </Col>
                    <Col xs={12}>
                      <Space size="small">
                        <EyeOutlined style={{ color: '#6b7280' }} />
                        <div>
                          <Text style={{ fontSize: '12px', color: '#9ca3af' }}>Tầm nhìn</Text>
                          <div><Text strong>Tầm nhìn thành phố</Text></div>
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
              </Col>

              {/* Cột phải - Hình ảnh và giá */}
              <Col xs={24} md={10}>
                <div className="modal-image-section">
                  {modalImages && modalImages.length > 0 ? (
                    <Carousel arrows style={{ marginBottom: '24px' }}>
                      {modalImages.map((img, index) => (
                        <div key={index}>
                          <img 
                            src={img} 
                            alt={`${roomInModal.room_type_name} ${index + 1}`}
                            style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px' }}
                          />
                        </div>
                      ))}
                    </Carousel>
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
                    <Text style={{ fontSize: '14px', color: '#6b7280' }}>T2, 27 Th10</Text>
                    <Text strong style={{ fontSize: '18px', color: '#1f2937', marginLeft: '8px' }}>
                      {formatPrice(modalPrice)}
                    </Text>
                  </div>
                  <Text style={{ fontSize: '13px', color: '#9ca3af' }}>Bao gồm thuế + phí</Text>
                  <Divider style={{ margin: '12px 0' }} />
                  <div>
                    <Text style={{ fontSize: '14px', color: '#6b7280' }}>Tổng cộng cho 1 đêm</Text>
                    <Text strong style={{ fontSize: '18px', color: '#1f2937', marginLeft: '8px' }}>
                      {formatPrice(modalPrice)}
                    </Text>
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
                    Chi phí cho 1 đêm, 2 khách
                  </Text>
                </Col>
                <Col>
                  <Button 
                    type="primary" 
                    size="large"
                    className="select-btn"
                    onClick={handleSelectFromModal}
                  >
                    Chọn
                  </Button>
                </Col>
              </Row>
            </div>
              </>
              )})()}
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