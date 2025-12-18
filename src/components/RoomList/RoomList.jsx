import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Row, Col, Typography, Button, Grid, Carousel, Modal, Divider, Space, Tag, Spin, Image, Rate } from 'antd'
import { WifiOutlined, UserOutlined, ExpandOutlined, RestOutlined, CoffeeOutlined, HomeOutlined, StarFilled } from '@ant-design/icons'
import { getRoomTypeById } from '../../services/roomtype.service'
import { getReviewsByRoomType } from '../../services/review.service'
import './RoomList.css'
import { useNavigate } from 'react-router-dom'
import { useRoomTypes } from '../../hooks/roomtype'
import formatPrice from '../../utils/formatPrice'

const { useBreakpoint } = Grid

const CATEGORY_ORDER = [
  'don-thuong',
  'don-vip',
  'doi-thuong',
  'doi-vip',
  'gia-dinh',
  'suite',
  'presidential'
]

const CATEGORY_LABEL = {
  'don-thuong': 'PHÒNG ĐƠN',
  'don-vip': 'PHÒNG ĐƠN VIP',
  'doi-thuong': 'PHÒNG ĐÔI',
  'doi-vip': 'PHÒNG ĐÔI VIP',
  'gia-dinh': 'PHÒNG GIA ĐÌNH',
  'suite': 'SUITE',
  'presidential': 'PRESIDENTIAL SUITE'
}

function RoomList() {
  const [hoverTimer, setHoverTimer] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [roomInModal, setRoomInModal] = useState(null)
  const [roomDetailsCache, setRoomDetailsCache] = useState({})
  const [modalLoading, setModalLoading] = useState(false)
  const [ratings, setRatings] = useState({}) // Store rating avg for each roomTypeId
  const timerRef = useRef(null)
  const screens = useBreakpoint()
  const navigate = useNavigate()
  const { roomTypes } = useRoomTypes()

  // lấy danh sách review của toàn bộ phòng sau đó lấy số sao trung bình của từng loại phòng và hiển thị lên modal
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsPagination, setReviewsPagination] = useState({ current: 1, pageSize: 5, total: 0 })
  useEffect(() => {
    if (roomInModal) {
      loadReviews(roomInModal.room_type_id)
    }
  }, [roomInModal])
  const loadReviews = async (roomTypeId) => {
    if (!roomTypeId) return
    try {
      setReviewsLoading(true)
      const pageSize = 5
      const response = await getReviewsByRoomType(roomTypeId, { page: 1, limit: pageSize })
      setReviews(response?.reviews || [])
      setReviewsPagination(prev => ({ ...prev, current: response?.pagination?.currentPage || 1, total: response?.pagination?.totalItems || 0, pageSize: pageSize }))
    } catch (error) { console.error('Error loading reviews:', error); setReviews([]); } finally { setReviewsLoading(false) }
  }
  const getAverageRating = (roomTypeId) => {
    if (!roomTypeId) return 0
    const reviews = reviews.filter(r => r.room_type_id === roomTypeId)
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  // 1. Group phòng theo category
  const groupedByCategory = CATEGORY_ORDER.map((cat) => ({
    key: cat,
    label: CATEGORY_LABEL[cat] || cat,
    items: (roomTypes || []).filter(rt => rt?.category === cat)
  })).filter(group => group.items.length > 0)

  // 2. Logic chọn 5 phòng nổi bật (mỗi loại 1 phòng)
  const featuredRooms = useMemo(() => {
    if (!roomTypes || roomTypes.length === 0) return []
    const picked = []
    const used = new Set()

    CATEGORY_ORDER.some(cat => {
      const room = roomTypes.find(rt => rt?.category === cat)
      if (room && !used.has(room.room_type_id)) {
        picked.push(room)
        used.add(room.room_type_id)
      }
      return picked.length === 5
    })

    // Nếu chưa đủ 5, lấy thêm các phòng khác
    if (picked.length < 5) {
      roomTypes.forEach((rt) => {
        if (picked.length < 5 && !used.has(rt.room_type_id)) {
          picked.push(rt)
          used.add(rt.room_type_id)
        }
      })
    }
    return picked.slice(0, 5)
  }, [roomTypes])

  // EFFECT: Fetch average ratings for featured rooms
  useEffect(() => {
    const fetchRatings = async () => {
      const newRatings = {}
      for (const room of featuredRooms) {
        if (!room.room_type_id) continue;
        try {
          // Fetch reviews to calculate average. Limit to 100 to get a good sample
          const resp = await getReviewsByRoomType(room.room_type_id, { page: 1, limit: 100 })
          const list = resp?.reviews || []
          if (list.length > 0) {
            const sum = list.reduce((acc, r) => acc + Number(r.rating || 0), 0)
            const avg = sum / list.length
            newRatings[room.room_type_id] = avg
          } else {
            newRatings[room.room_type_id] = 5
          }
        } catch (err) {
          console.error(`Error fetching rating for room ${room.room_type_id}`, err)
          newRatings[room.room_type_id] = 5
        }
      }
      setRatings(prev => ({ ...prev, ...newRatings }))
    }

    if (featuredRooms.length > 0) {
      fetchRatings()
    }
  }, [featuredRooms])

  // Helper lấy ảnh bìa
  const getCoverImage = (rt) => {
    if (Array.isArray(rt?.images) && rt.images.length > 0) return rt.images[0]
    return 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1600&auto=format&fit=crop'
  }

  // Helper cắt ngắn mô tả
  const getShortDescription = (rt) => {
    const text = rt?.short_description || rt?.description || 'Không gian được yêu thích nhất với thiết kế sang trọng và tiện nghi cao cấp.'
    if (text.length > 140) return `${text.slice(0, 137)}...`
    return text
  }

  // Cấu hình Carousel
  const carouselSettings = useMemo(() => ({
    dots: false,
    infinite: featuredRooms.length > 4,
    autoplay: true,
    autoplaySpeed: 3000,
    draggable: true,
    speed: 600,
    slidesToShow: Math.min(4, featuredRooms.length || 1),
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 3 }
      },
      {
        breakpoint: 992,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 576,
        settings: { slidesToShow: 1 }
      }
    ]
  }), [featuredRooms.length])

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const mergeRoomDetail = (room, detail) => {
    if (!detail) return room
    return {
      ...room,
      description: room.description || detail.description,
      images: room.images && room.images.length ? room.images : (detail.images || detail.image_urls || detail.gallery || []),
      amenities: Array.isArray(room.amenities) && room.amenities.length ? room.amenities : (detail.amenities || []),
      capacity: room.capacity || detail.capacity,
      area: room.area || detail.area,
      price_per_night: room.price_per_night || detail.price_per_night,
      bed_type: room.bed_type || detail.bed_type,
      view: room.view || detail.view,
      available_rooms: room.available_rooms ?? detail.available_rooms,
      total_rooms: room.total_rooms ?? detail.total_rooms
    }
  }

  const handleHoverStart = (room) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setModalLoading(true)
      const typeId = room.room_type_id
      let detail = roomDetailsCache[typeId]
      if (!detail && typeId) {
        try {
          const resp = await getRoomTypeById(typeId)
          detail = resp?.roomType || resp?.data?.roomType || resp?.room_type || resp?.data?.room_type || resp
          if (detail) {
            setRoomDetailsCache(prev => ({ ...prev, [typeId]: detail }))
          }
        } catch (error) {
          console.error('Load room type detail failed', error)
        }
      }
      const merged = mergeRoomDetail(room, detail)
      setRoomInModal(merged)
      setIsModalVisible(true)
      setModalLoading(false)
    }, 700)
    setHoverTimer(timerRef.current)
  }

  const handleHoverEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
      setHoverTimer(null)
    }
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setRoomInModal(null)
  }

  return (
    <div>
      {/* --- FEATURED SECTION --- */}
      {featuredRooms.length > 0 && (
        <div className="featured-rooms-section">
          {/* Header: Chỉ có Tiêu đề & Mô tả căn giữa */}
          <div className="featured-heading">
            <div>
              <Typography.Title level={2} className="room-section-title">
                CÁC PHÒNG NỔI BẬT
              </Typography.Title>
              <Typography.Paragraph className="featured-subtitle">
                5 lựa chọn được khách yêu thích nhất, cân bằng giữa thiết kế sang trọng và tiện nghi cao cấp.
              </Typography.Paragraph>
            </div>
          </div>

          {/* Carousel */}
          <Carousel {...carouselSettings} className="featured-carousel">
            {featuredRooms.map((room) => {
              const avgRating = ratings[room.room_type_id] || 5
              return (
                <div key={room.room_type_id} className="featured-room-slide">
                  <div
                    className="featured-room-card"
                    onMouseEnter={() => handleHoverStart(room)}
                    onMouseLeave={handleHoverEnd}
                  >
                    <div className="featured-room-media">
                      <img src={getCoverImage(room)} alt={room.room_type_name} />
                    </div>
                    <div className="featured-room-info">
                      <div className="featured-room-header-row">
                        <h3>{room.room_type_name}</h3>
                        {avgRating > 0 && (
                          <div className="featured-room-rating">
                            <StarFilled style={{ fontSize: 14, color: '#fadb14' }} />
                            <span className="rating-value">{avgRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p>{getShortDescription(room)}</p>
                      <div className="featured-room-meta">
                        <span><UserOutlined /> {room.capacity ? `${room.capacity} khách` : '2 khách'}</span>
                        <span><ExpandOutlined /> {room.area ? `${room.area} m²` : '30 m²'}</span>
                      </div>
                      <div className="featured-room-footer">
                        <div className="price">
                          {room.price_per_night ? `${formatPrice(room.price_per_night)}/Đêm` : 'Giá liên hệ'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </Carousel>

          {/* Bottom Action: Nút Xem tất cả nằm góc phải dưới */}
          <div className="featured-bottom-action">
            <Button type="primary" onClick={() => navigate('/hotels')}>Xem tất cả phòng</Button>
          </div>
        </div>
      )}

      {/* --- MAIN ROOM LIST SECTION --- */}

      {/* Modal chi tiết phòng (hiển thị sau 1.5s hover) */}
      <Modal
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={900}
        className="room-detail-modal"
        centered
      >
        {modalLoading && (
          <div style={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin size="large" />
          </div>
        )}
        {!modalLoading && roomInModal && (
          <div className="modal-content">
            <div className="modal-header" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {roomInModal.room_type_name}
                </Typography.Title>
                {ratings[roomInModal.room_type_id] > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StarFilled style={{ fontSize: 20, color: '#fadb14' }} />
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#fadb14' }}>
                      {ratings[roomInModal.room_type_id].toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              <Typography.Text type="secondary">
                {roomInModal.bed_type ? `${roomInModal.bed_type} • ` : ''}{roomInModal.view ? `View ${roomInModal.view}` : ''}
              </Typography.Text>
            </div>
            <Divider style={{ margin: '12px 0 20px 0' }} />
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <div className="featured-room-media" style={{ minHeight: 260 }}>
                  <Image
                    src={getCoverImage(roomInModal)}
                    alt={roomInModal.room_type_name}
                    width="100%"
                    height={260}
                    style={{ objectFit: 'cover', borderRadius: 12 }}
                    preview={{
                      toolbarRender: () => null
                    }}
                  />
                  {/* Thumbnails nếu có nhiều ảnh */}
                  {Array.isArray(roomInModal.images) && roomInModal.images.length > 1 && (
                    <Space size={8} wrap style={{ marginTop: 12 }}>
                      {roomInModal.images.slice(0, 6).map((img, idx) => (
                        <Image
                          key={idx}
                          src={img}
                          alt={`${roomInModal.room_type_name} - ${idx + 1}`}
                          width={64}
                          height={48}
                          style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }}
                          preview={{
                            src: img
                          }}
                        />
                      ))}
                    </Space>
                  )}
                </div>
              </Col>
              <Col xs={24} md={12}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  {roomInModal.description && (
                    <Typography.Text style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>
                      {roomInModal.description}
                    </Typography.Text>
                  )}
                  <Space size={16} wrap>
                    <Space>
                      <UserOutlined style={{ color: '#9ca3af' }} />
                      <Typography.Text>Sức chứa: {roomInModal.capacity || 2} người</Typography.Text>
                    </Space>
                    <Space>
                      <ExpandOutlined style={{ color: '#9ca3af' }} />
                      <Typography.Text>Diện tích: {roomInModal.area || 0} m²</Typography.Text>
                    </Space>
                  </Space>
                  <Space size={16} wrap>
                    {roomInModal.available_rooms != null && (
                      <Tag color={roomInModal.available_rooms > 0 ? 'green' : 'red'}>
                        Còn {roomInModal.available_rooms} / {roomInModal.total_rooms || '?'} phòng
                      </Tag>
                    )}
                    {roomInModal.bed_type && <Tag>{roomInModal.bed_type}</Tag>}
                    {roomInModal.view && <Tag>View {roomInModal.view}</Tag>}
                  </Space>
                  <Typography.Title level={4} style={{ color: '#c08a19', margin: 0 }}>
                    {roomInModal.price_per_night ? `${formatPrice(roomInModal.price_per_night)}/Đêm` : 'Giá liên hệ'}
                  </Typography.Title>
                  {Array.isArray(roomInModal.amenities) && roomInModal.amenities.length > 0 && (
                    <Space size={[8, 8]} wrap>
                      {roomInModal.amenities.slice(0, 8).map((am, idx) => (
                        <Tag key={idx} color="gold" style={{ borderRadius: 12 }}>
                          {am}
                        </Tag>
                      ))}
                    </Space>
                  )}
                  <Button type="primary" onClick={() => navigate('/hotels')}>
                    Xem chi tiết & đặt phòng
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RoomList