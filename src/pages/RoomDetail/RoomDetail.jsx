import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Row,
  Col,
  Breadcrumb,
  Typography,
  Carousel,
  Card,
  Tabs,
  Grid,
  Button,
  Divider,
  Form,
  Input,
  DatePicker,
  InputNumber
} from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  ExpandOutlined,
  CoffeeOutlined,
  WifiOutlined,
  CarOutlined,
  SafetyOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import './RoomDetail.css'

const { Title, Text, Paragraph } = Typography
const { useBreakpoint } = Grid

function RoomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const [loading, setLoading] = useState(true)
  const [roomData, setRoomData] = useState(null)
  const [bookingForm] = Form.useForm()
  const [bookingLoading, setBookingLoading] = useState(false)

  // Mock data - sẽ thay bằng API call thật
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRoomData({
        id: 1,
        name: 'Phòng Đơn Tiêu Chuẩn',
        images: [
          'https://bizweb.dktcdn.net/thumb/1024x1024/100/472/947/products/anh1.jpg?v=1670338577307',
          'https://bizweb.dktcdn.net/thumb/1024x1024/100/472/947/products/anh3.jpg?v=1670338577307',
          'https://bizweb.dktcdn.net/thumb/1024x1024/100/472/947/products/anh2.jpg?v=1670338577307'
        ],
        adults: 2,
        children: 1,
        area: 20,
        price: 700000,
        description: 'Các phòng trang nhã và đầy phòng trang nghiêm của chúng tôi gợi nhớ về một thời đã qua. Mỗi tính năng như đường cong, thẩm mỹ trang nhà cao, phòng tắm lát đá cẩm thạch, thiết bị làm sạch và nhiều tiện ích khác, thiết kế và trang bị sẵn nhà hàng, trang bị, được bổ sung một nhà hàng, thiết bị dành riêng cho riêng bạn. Tổng màu nâu nâu như màu sắc cùng với những dõ dõ bỏ với, ứng dõi hàng riêng tay cho riêng bạn.',
        services: [
          { icon: <CoffeeOutlined />, name: 'Cafe Buổi Sáng' },
          { icon: <WifiOutlined />, name: 'Internet Không Dây' },
          { icon: <CarOutlined />, name: 'Bãi Đỗ Xe' },
          { icon: <SafetyOutlined />, name: 'Két Sắt' }
        ],
        amenities: [
          'Ấn sáng tự chọn',
          'Nước khoáng trên phòng nghỉ',
          'Dịch Internet không dây (wifi)',
          'Tiền ích phòng đầy máy lạnh, tivi màn hình phẳng và nhiều tiện ích khác nữa'
        ],
        paymentMethods: 'Tiền mặt (VND, USD, EURO, ...) thẻ tín dụng Visa và Master',
        checkoutTime: '12h00 hàng ngày'
      })
      setLoading(false)
    }, 500)
  }, [id])

  // Similar rooms mock data
  const similarRooms = [
    { id: 2, name: 'PHÒNG ĐƠN VIEW THÀNH PHỐ', price: 700000, area: 25, guests: 2, image: 'https://via.placeholder.com/300x200' },
    { id: 3, name: 'PHÒNG ĐƠN VIEW SÂN VƯỜN', price: 800000, area: 25, guests: 2, image: 'https://via.placeholder.com/300x200' },
    { id: 4, name: 'PHÒNG ĐƠN VIEW BIỂN', price: 900000, area: 25, guests: 1, image: 'https://via.placeholder.com/300x200' }
  ]

  const bestRooms = [
    { id: 5, name: 'Phòng Đơn Vip', price: 2500000, image: 'https://via.placeholder.com/150x100' },
    { id: 6, name: 'Phòng Gia Đình', price: 3000000, image: 'https://via.placeholder.com/150x100' },
    { id: 7, name: 'Căn Hộ Chung Cư', price: 2700000, image: 'https://via.placeholder.com/150x100' },
    { id: 8, name: 'Phòng Hạng Sang', price: 3500000, image: 'https://via.placeholder.com/150x100' }
  ]

  if (loading || !roomData) {
    return <div>Loading...</div>
  }

  const tabItems = [
    {
      key: 'description',
      label: <span style={{ fontSize: screens.xs ? 14 : 16, fontWeight: 500 }}>Mô tả</span>,
      children: (
        <div className="tab-content">
          <Paragraph style={{ fontSize: screens.xs ? 14 : 16, lineHeight: 1.8, color: '#374151' }}>
            {roomData.description}
          </Paragraph>
          <div style={{ marginTop: screens.xs ? 16 : 24 }}>
            <Title level={screens.xs ? 5 : 4} style={{ marginBottom: screens.xs ? 12 : 16 }}>
              Giờ trả phòng:
            </Title>
            <Text style={{ fontSize: screens.xs ? 14 : 15 }}>{roomData.checkoutTime}</Text>
          </div>
          <div style={{ marginTop: screens.xs ? 16 : 24 }}>
            <Title level={screens.xs ? 5 : 4} style={{ marginBottom: screens.xs ? 12 : 16 }}>
              Hình thức Thanh toán:
            </Title>
            <Text style={{ fontSize: screens.xs ? 14 : 15 }}>{roomData.paymentMethods}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: screens.xs ? 12 : 13 }}>
              * Nếu Quý khách thanh toán bằng ngoại tệ thì theo tỷ giá hối đoái của Ngân hàng hiện thời.
            </Text>
          </div>
        </div>
      )
    },
    {
      key: 'amenities',
      label: <span style={{ fontSize: screens.xs ? 14 : 16, fontWeight: 500 }}>Tiện nghi</span>,
      children: (
        <div className="tab-content">
          <Title level={screens.xs ? 5 : 4} style={{ marginBottom: screens.xs ? 12 : 16 }}>
            Dịch vụ miễn phí:
          </Title>
          <ul className="amenities-list">
            {roomData.amenities.map((amenity, index) => (
              <li key={index} style={{ fontSize: screens.xs ? 14 : 15, marginBottom: 8 }}>
                {amenity}
              </li>
            ))}
          </ul>
        </div>
      )
    }
  ]

  return (
    <div className="room-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: screens.xs ? 16 : 24, marginTop: screens.xs ? 16 : 24 }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <a onClick={() => navigate('/')}>Trang chủ</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <a onClick={() => navigate('/hotels')}>Phòng đơn</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Phòng đơn tiêu chuẩn</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {/* Image Slider */}
        <div className="room-slider-container" style={{ marginBottom: screens.xs ? 24 : 32 }}>
          <Carousel autoplay autoplaySpeed={4000} dotPosition="bottom">
            {roomData.images.map((image, index) => (
              <div key={index} className="slider-item">
                <img src={image} alt={`${roomData.name} ${index + 1}`} />
              </div>
            ))}
          </Carousel>
        </div>

        {/* Room Content: Left info + Right booking form */}
        <Row gutter={[24, 24]} style={{ marginBottom: screens.xs ? 24 : 32 }}>
          {/* Left: Room Info */}
          <Col xs={24} sm={24} md={16} lg={16}>
            {/* Room Name */}
            <Title 
              level={screens.xs ? 3 : 2} 
              style={{ 
                marginBottom: screens.xs ? 16 : 24,
                color: '#1f2937'
              }}
            >
              {roomData.name}
            </Title>

            {/* Room Info Row */}
            <Row 
              gutter={[12, 12]} 
              style={{ marginBottom: screens.xs ? 20 : 24 }}
              className="room-info-row"
            >
              <Col xs={8} sm={8} md={8} lg={8}>
                <div className="info-item">
                  <TeamOutlined style={{ fontSize: screens.xs ? 20 : 24, color: '#000' }} />
                  <Text style={{ fontSize: screens.xs ? 11 : 13, marginTop: 6, display: 'block' }}>
                    {roomData.adults < 10 ? `0${roomData.adults}` : roomData.adults} Người lớn
                  </Text>
                </div>
              </Col>
              <Col xs={8} sm={8} md={8} lg={8}>
                <div className="info-item">
                  <UserOutlined style={{ fontSize: screens.xs ? 20 : 24, color: '#000' }} />
                  <Text style={{ fontSize: screens.xs ? 11 : 13, marginTop: 6, display: 'block' }}>
                    {roomData.children < 10 ? `0${roomData.children}` : roomData.children} Trẻ em
                  </Text>
                </div>
              </Col>
              <Col xs={8} sm={8} md={8} lg={8}>
                <div className="info-item">
                  <ExpandOutlined style={{ fontSize: screens.xs ? 20 : 24, color: '#000' }} />
                  <Text style={{ fontSize: screens.xs ? 11 : 13, marginTop: 6, display: 'block' }}>
                    Phòng {roomData.area}m²
                  </Text>
                </div>
              </Col>
            </Row>

            {/* Description */}
            <Paragraph style={{ fontSize: screens.xs ? 14 : 15, lineHeight: 1.8, color: '#374151', marginBottom: 0 }}>
              {roomData.description}
            </Paragraph>
          </Col>

          {/* Right: Booking Sidebar */}
          <Col xs={24} sm={24} md={8} lg={8}>
            <Card className="booking-sidebar-card">
              {/* Price Header */}
              <div className="price-header">
                <Title level={3} style={{ color: '#c08a19', margin: 0, fontSize: screens.xs ? 20 : 24 }}>
                  {roomData.price.toLocaleString('vi-VN')}đ/Đêm
                </Title>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              {/* Booking Form */}
              <Form
                form={bookingForm}
                layout="vertical"
                className="booking-form"
                initialValues={{
                  checkIn: dayjs(),
                  checkOut: dayjs().add(1, 'day'),
                  adults: 1,
                  children: 0
                }}
              >
                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <Form.Item
                      label="Họ và tên*"
                      name="fullName"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                      <Input placeholder="Họ và tên" size={screens.xs ? 'middle' : 'large'} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Số điện thoại*"
                      name="phone"
                      rules={[{ required: true, message: 'Nhập SĐT!' }]}
                    >
                      <Input placeholder="Số điện thoại" size={screens.xs ? 'middle' : 'large'} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <Form.Item
                      label="Ngày nhận"
                      name="checkIn"
                    >
                      <DatePicker 
                        placeholder="2025-10-10"
                        format="YYYY-MM-DD"
                        style={{ width: '100%' }}
                        size={screens.xs ? 'middle' : 'large'}
                        suffixIcon={<CalendarOutlined style={{ color: '#c08a19' }} />}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Ngày trả"
                      name="checkOut"
                    >
                      <DatePicker 
                        placeholder="2025-10-11"
                        format="YYYY-MM-DD"
                        style={{ width: '100%' }}
                        size={screens.xs ? 'middle' : 'large'}
                        suffixIcon={<CalendarOutlined style={{ color: '#c08a19' }} />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <Form.Item
                      label="Người lớn"
                      name="adults"
                    >
                      <InputNumber 
                        min={1} 
                        max={10}
                        style={{ width: '100%' }}
                        size={screens.xs ? 'middle' : 'large'}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Trẻ em"
                      name="children"
                    >
                      <InputNumber 
                        min={0} 
                        max={10}
                        style={{ width: '100%' }}
                        size={screens.xs ? 'middle' : 'large'}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <Button 
                      block 
                      size={screens.xs ? 'middle' : 'large'}
                      className="temp-calc-button"
                    >
                      TẠM TÍNH
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button 
                      type="primary"
                      block 
                      size={screens.xs ? 'middle' : 'large'}
                      className="book-now-button"
                      loading={bookingLoading}
                    >
                      ĐẶT PHÒNG
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Services Row */}
        <div style={{ marginBottom: screens.xs ? 24 : 32 }}>
          <div 
            className="section-title-wrapper"
            style={{ marginBottom: screens.xs ? 16 : 24 }}
          >
            <Title 
              level={screens.xs ? 4 : 3}
              className="section-title"
            >
              Dịch vụ phòng
            </Title>
          </div>
          
          <Row gutter={[16, 16]} className="services-row">
            {roomData.services.map((service, index) => (
              <Col xs={12} sm={12} md={6} lg={6} key={index}>
                <Card className="service-card" hoverable>
                  <div className="service-content">
                    <div style={{ fontSize: screens.xs ? 28 : 36, color: '#c08a19', marginBottom: 8 }}>
                      {service.icon}
                    </div>
                    <Text style={{ fontSize: screens.xs ? 13 : 14, textAlign: 'center', display: 'block' }}>
                      {service.name}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Tabs - Mô tả & Tiện nghi */}
        <Card 
          className="room-tabs-card"
          style={{ marginBottom: screens.xs ? 32 : 48 }}
        >
          <Tabs 
            defaultActiveKey="description" 
            items={tabItems}
            className="room-tabs"
          />
        </Card>

        {/* Phòng tương tự */}
        <div style={{ marginBottom: screens.xs ? 32 : 48 }}>
          <div 
            className="section-title-wrapper"
            style={{ marginBottom: screens.xs ? 16 : 24 }}
          >
            <Title 
              level={screens.xs ? 4 : 3}
              className="section-title"
            >
              Phòng tương tự
            </Title>
          </div>
          
          <Row gutter={[16, 16]}>
            {similarRooms.map((room) => (
              <Col xs={24} sm={12} md={8} lg={8} key={room.id}>
                <Card 
                  hoverable
                  className="similar-room-card"
                  cover={<img alt={room.name} src={room.image} />}
                  onClick={() => navigate(`/rooms/${room.id}`)}
                >
                  <Title level={5} style={{ marginBottom: 8, fontSize: screens.xs ? 15 : 16 }}>
                    {room.name}
                  </Title>
                  <div className="room-meta">
                    <Text type="secondary" style={{ fontSize: screens.xs ? 12 : 13 }}>
                      <TeamOutlined /> {room.guests < 10 ? `0${room.guests}` : room.guests} Khách
                    </Text>
                    <Text type="secondary" style={{ fontSize: screens.xs ? 12 : 13 }}>
                      <ExpandOutlined /> {room.area}m²
                    </Text>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <div className="room-price-footer">
                    <Text strong style={{ fontSize: screens.xs ? 16 : 18, color: '#c08a19' }}>
                      {room.price.toLocaleString('vi-VN')}đ/Đêm
                    </Text>
                    <Button 
                      type="primary" 
                      className="book-button"
                      size={screens.xs ? 'small' : 'middle'}
                    >
                      ĐẶT PHÒNG
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Phòng tốt nhất */}
        <div style={{ marginBottom: screens.xs ? 32 : 48 }}>
          <div 
            className="section-title-wrapper"
            style={{ marginBottom: screens.xs ? 16 : 24 }}
          >
            <Title 
              level={screens.xs ? 4 : 3}
              className="section-title"
            >
              Phòng tốt nhất
            </Title>
          </div>
          
          <Row gutter={[16, 16]}>
            {bestRooms.map((room) => (
              <Col xs={12} sm={12} md={6} lg={6} key={room.id}>
                <Card 
                  hoverable
                  className="best-room-card"
                  onClick={() => navigate(`/rooms/${room.id}`)}
                >
                  <img src={room.image} alt={room.name} className="best-room-image" />
                  <div className="best-room-content">
                    <Title level={5} style={{ fontSize: screens.xs ? 13 : 14, marginBottom: 4 }}>
                      {room.name}
                    </Title>
                    <Text strong style={{ fontSize: screens.xs ? 14 : 16, color: '#c08a19' }}>
                      {room.price.toLocaleString('vi-VN')}đ
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  )
}

export default RoomDetail

