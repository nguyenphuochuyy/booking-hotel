import React, { useState } from 'react'
import { Row, Col, Typography, Button, Tabs, Grid } from 'antd'
import { WifiOutlined, CoffeeOutlined, UserOutlined, ExpandOutlined, RestOutlined, BankOutlined, TeamOutlined, SmileOutlined } from '@ant-design/icons'
import './RoomList.css'
import { useNavigate } from 'react-router-dom'

const { useBreakpoint } = Grid

const rooms = [
  {
    id: 1,
    name: 'Phòng đơn tiêu chuẩn',
    image: 'https://bizweb.dktcdn.net/thumb/large/100/472/947/products/anh1.jpg?v=1670338577307',
    capacity: '02 Khách',
    size: '20m²',
    price: '500.000đ/ Đêm',
  },
  {
    id: 2,
    name: 'Phòng đơn view thành phố',
    image: 'https://bizweb.dktcdn.net/thumb/large/100/472/947/products/sp21.jpg?v=1670338576510',
    capacity: '02 Khách',
    size: '25m²',
    price: '700.000đ/ Đêm',
  },
  {
    id: 3,
    name: 'Phòng đơn view sân vườn',
    image: 'https://bizweb.dktcdn.net/thumb/large/100/472/947/products/anh11a713f0cbaa54ea595b6bb5e1b.jpg?v=1670338575473',
    capacity: '02 Khách',
    size: '25m²',
    price: '800.000đ/ Đêm',
  },
  {
    id: 4,
    name: 'Phòng đơn view biển',
    image: 'https://bizweb.dktcdn.net/thumb/large/100/472/947/products/anh1eb6eb86adb63474a819ab595ee.jpg?v=1670338574237',
    capacity: '01 Khách',
    size: '25m²',
    price: '900.000đ/ Đêm',
  },
]

const vipRooms = [
  {
    id: 1,
    name: 'PHÒNG ĐƠN VIP',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    capacity: '02 Khách',
    size: '35m²',
    price: '2.500.000₫/Đêm',
    description: 'Với tiêu chí ngày càng nâng cao và đáp ứng mọi nhu cầu của khách hàng chúng tôi cung cấp thêm loại phòng đơn VIP với không gian rộng rãi, tiện nghi hiện đại.',
    isLarge: true,
    amenities: ['CoffeeOutlined', 'RestOutlined', 'WifiOutlined', 'CoffeeOutlined', 'RestOutlined']
  },
  {
    id: 2,
    name: 'PHÒNG GIA ĐÌNH',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    price: '3.000.000₫/Đêm',
    isLarge: false
  },
  {
    id: 3,
    name: 'CĂN HỘ CHUNG CƯ',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    price: '2.700.000₫/Đêm',
    isLarge: false
  },
  {
    id: 4,
    name: 'PHÒNG HẠNG SANG',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    price: '3.500.000₫/Đêm',
    isLarge: false
  },
  {
    id: 5,
    name: 'PHÒNG ĐÔI NỐI LIỀN',
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    price: '4.000.000₫/Đêm',
    isLarge: false
  }
]

function RoomList() {
  const [activeServiceTab, setActiveServiceTab] = useState('hotel')
  const screens = useBreakpoint()
  const navigate = useNavigate()
  return (
    <div>
      {/* Danh sách phòng */}
    <div className="room-list-section">
      <div className="room-title-wrap">
        <Typography.Title level={2} className="room-section-title">PHÒNG ĐƠN</Typography.Title>
      </div>

      <Row gutter={screens.xs ? [12, 16] : screens.md ? [20, 20] : [24, 24]}>
        {rooms.map((room) => (
          <Col key={room.id} xs={24} sm={12} md={8} lg={6} xl={6} xxl={6}>
            <div className="room-list-card" onClick={() => navigate(`/rooms/${room.id}`)}>
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

      <div className="room-title-wrap" style={{ marginTop: '40px' }}>
        <Typography.Title level={2} className="room-section-title">PHÒNG ĐÔI</Typography.Title>
      </div>
      <Row gutter={screens.xs ? [12, 16] : screens.md ? [20, 20] : [24, 24]}>
        {rooms.map((room) => (
          <Col key={room.id} xs={24} sm={12} md={8} lg={6} xl={6} xxl={6}>
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


      <div className='room-title-wrap' style={{ marginTop: '40px' }}>
        <Typography.Title level={2} className="room-section-title">PHÒNG VIP</Typography.Title>
      </div>
      <Row gutter={screens.xs ? [12, 16] : screens.md ? [20, 20] : [24, 24]} className="vip-rooms-grid">
        {/* Card lớn bên trái */}
        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
          <div className="vip-room-card vip-room-card-large">
            <div className="vip-room-image">
              <img alt={vipRooms[0].name} src={vipRooms[0].image} />
            </div>
            <div className="vip-room-content">
              <h3 className="vip-room-name">{vipRooms[0].name}</h3>
              
              <div className="vip-room-stats">
                <span className="vip-room-capacity">
                  <UserOutlined /> {vipRooms[0].capacity}
                </span>
                <span className="vip-room-size">
                  <ExpandOutlined /> {vipRooms[0].size}
                </span>
              </div>

              <div className="vip-room-amenities">
                <CoffeeOutlined />
                <RestOutlined />
                <WifiOutlined />
                <CoffeeOutlined />
                <RestOutlined />
              </div>

              <p className="vip-room-description">{vipRooms[0].description}</p>
              
              <button className="vip-room-book-btn">
                ĐẶT PHÒNG TỪ {vipRooms[0].price}
              </button>
            </div>
          </div>
        </Col>

        {/* 4 card nhỏ bên phải */}
        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
          <Row gutter={screens.xs ? [8, 12] : [16, 16]} className="vip-rooms-small-grid">
            {vipRooms.slice(1).map((room) => (
              <Col key={room.id} xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <div className="vip-room-card vip-room-card-small">
                  <div className="vip-room-image-small">
                    <img alt={room.name} src={room.image} />
                    <div className="vip-room-overlay">
                      <h4 className="vip-room-name-overlay">{room.name}</h4>
                      <div className="vip-room-price-overlay">{room.price}</div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
     
    </div>
     {/* Dịch vụ - Tabs (Ant Design) */}
     <div className="hotel-services">
      <Tabs
        activeKey={activeServiceTab}
        onChange={(k) => setActiveServiceTab(k)}
        centered
        items={[
          {
            key: 'hotel',
            label: (
              <span><BankOutlined /> KHÁCH SẠN</span>
            ),
            children: (
              <div className="services-band">
                <div className="band-heading">
                  <div className="line1">TIỆN NGHI</div>
                  <div className="line2">SANG TRỌNG</div>
                </div>
                <div className="services-section">
                  <div className="gold-frame left">
                    <img src="https://bizweb.dktcdn.net/100/472/947/themes/888072/assets/banner1_tab1.jpg?1758008810756" alt="hotel-left" />
                  </div>
                  <div className="services-text-card">
                    <h3>KHÁCH SẠN</h3>
                    <p>
                      Chúng tôi mang lại không gian thư giãn và tiện nghi đáp ứng mọi nhu cầu cho bạn.
                      Là khách sạn 5 sao đẳng cấp quốc tế, tọa lạc tại trung tâm thành phố với hệ thống phòng tiêu chuẩn
                      và phòng hạng sang thiết kế sang trọng, chú trọng từng chi tiết để đem lại sự tiện nghi và thoải mái tối đa.
                    </p>
                  </div>
                  <div className="gold-frame right">
                    <img src="https://bizweb.dktcdn.net/100/472/947/themes/888072/assets/banner2_tab1.jpg?1758008810756" alt="hotel-right" />
                  </div>
                </div>
              </div>
            )
          },
          {
            key: 'meeting',
            label: (
              <span><TeamOutlined /> PHÒNG HỌP</span>
            ),
            children: (
              <div className="services-band">
                <div className="band-heading">
                  <div className="line1">RỘNG RÃI</div>
                  <div className="line2">THANH LỊCH</div>
                </div>
                <div className="services-section">
                  <div className="gold-frame left">
                    <img src="https://bizweb.dktcdn.net/100/472/947/themes/888072/assets/banner1_tab2.jpg?1758008810756" alt="meeting-left" />
                  </div>
                  <div className="services-text-card">
                    <h3>PHÒNG HỌP</h3>
                    <p>
                      Không gian hội họp rộng rãi, trang thiết bị hiện đại và chuyên nghiệp.
                      Đáp ứng nhiều mô hình hội thảo, họp nhóm và sự kiện.
                    </p>
                  </div>
                  <div className="gold-frame right">
                    <img src="https://bizweb.dktcdn.net/100/472/947/themes/888072/assets/banner2_tab2.jpg?1758008810756" alt="meeting-right" />
                  </div>
                </div>
              </div>
            )
          },
          {
            key: 'beauty',
            label: (
              <span><SmileOutlined /> LÀM ĐẸP</span>
            ),
            children: (
              <div className="services-band">
                <div className="band-heading">
                  <div className="line1">KHỎE VÀ ĐẸP</div>
                  <div className="line2">THƯ GIÃN</div>
                </div>
                <div className="services-section">
                  <div className="gold-frame left">
                    <img src="https://bizweb.dktcdn.net/100/472/947/themes/888072/assets/banner1_tab3.jpg?1758008810756" alt="spa-left" />
                  </div>
                  <div className="services-text-card">
                    <h3>LÀM ĐẸP</h3>
                    <p>
                      Dịch vụ spa cao cấp giúp thư giãn và tái tạo năng lượng.
                      Trải nghiệm các liệu pháp chăm sóc sắc đẹp, massage và xông hơi.
                    </p>
                  </div>
                  <div className="gold-frame right">
                    <img src="https://bizweb.dktcdn.net/100/472/947/themes/888072/assets/banner2_tab3.jpg?1758008810756" alt="spa-right" />
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />
     </div>
    
    </div>
 



  )
}

export default RoomList

        
