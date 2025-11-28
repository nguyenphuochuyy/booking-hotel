import React, { useMemo } from 'react'
import { Row, Col, Typography, Button, Grid, Carousel } from 'antd'
import { WifiOutlined, UserOutlined, ExpandOutlined, RestOutlined, CoffeeOutlined } from '@ant-design/icons'
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
  const screens = useBreakpoint()
  const navigate = useNavigate()
  const { roomTypes } = useRoomTypes()

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
            {featuredRooms.map((room) => (
              <div key={room.room_type_id} className="featured-room-slide">
                <div className="featured-room-card" >
                  <div className="featured-room-media">
                    <img src={getCoverImage(room)} alt={room.room_type_name} />
                  </div>
                  <div className="featured-room-info">
                    <h3>{room.room_type_name}</h3>
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
            ))}
          </Carousel>

          {/* Bottom Action: Nút Xem tất cả nằm góc phải dưới */}
          <div className="featured-bottom-action">
             <Button type="primary" onClick={() => navigate('/hotels')}>Xem tất cả phòng</Button>
          </div>
        </div>
      )}

      {/* --- MAIN ROOM LIST SECTION --- */}
    
    </div>
  )
}

export default RoomList