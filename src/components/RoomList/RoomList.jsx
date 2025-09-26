import React from 'react'
import { Row, Col, Typography, Button } from 'antd'
import { WifiOutlined, CoffeeOutlined, UserOutlined, ExpandOutlined, RestOutlined } from '@ant-design/icons'
import './RoomList.css'

const rooms = [
  {
    id: 1,
    name: 'Phòng đơn tiêu chuẩn',
    image: 'https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1600&auto=format&fit=crop',
    capacity: '02 Khách',
    size: '20m²',
    price: '500.000đ/ Đêm',
  },
  {
    id: 2,
    name: 'Phòng đơn view thành phố',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop',
    capacity: '02 Khách',
    size: '25m²',
    price: '700.000đ/ Đêm',
  },
  {
    id: 3,
    name: 'Phòng đơn view sân vườn',
    image: 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop',
    capacity: '02 Khách',
    size: '25m²',
    price: '800.000đ/ Đêm',
  },
  {
    id: 4,
    name: 'Phòng đơn view biển',
    image: 'https://images.unsplash.com/photo-1505691723518-36a5ac3b2d87?q=80&w=1600&auto=format&fit=crop',
    capacity: '01 Khách',
    size: '25m²',
    price: '900.000đ/ Đêm',
  },
]

function RoomList() {
  return (
    <div className="room-list-section">
      <div className="room-title-wrap">
        <Typography.Title level={2} className="room-section-title">PHÒNG</Typography.Title>
      </div>

      <Row gutter={[24, 24]} >
        {rooms.map((room) => (
          <Col key={room.id} xs={8} sm={8} md={8} lg={6} xl={6} xxl={6}>
            <div className="room-list-card">
              <div className="room-list-image">
                <img alt={room.name} src={room.image} />
              </div>
              <div className="room-list-content">
                <h3 className="room-list-name">{room.name.toUpperCase()}</h3>

                <div className="room-list-amenities">
                  <CoffeeOutlined />
                  <RestOutlined />
                  <WifiOutlined />
                </div>

                <div className="room-list-stats">
                  <span className="room-list-capacity">
                    <UserOutlined /> {room.capacity}
                  </span>
                  <span className="room-list-size">
                    <ExpandOutlined /> {room.size}
                  </span>
                </div>

                <div className="room-list-footer">
                  <span className="room-list-price">{room.price}</span>
                  <button className="room-list-book-btn">ĐẶT PHÒNG</button>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default RoomList


