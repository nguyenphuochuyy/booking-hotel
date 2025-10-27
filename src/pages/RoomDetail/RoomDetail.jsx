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
  InputNumber,
  Spin,
  Empty,
  Tag,
  Space,
  message
} from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  ExpandOutlined,
  CoffeeOutlined,
  WifiOutlined,
  CarOutlined,
  SafetyOutlined,
  CalendarOutlined,
  RestOutlined,
  HomeOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useRoomTypeDetail } from '../../hooks/roomtype'
import formatPrice from '../../utils/formatPrice'
import './RoomDetail.css'
const { Title, Text, Paragraph } = Typography
const { useBreakpoint } = Grid

function RoomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const [bookingForm] = Form.useForm()
  // Sử dụng hook để lấy thông tin room type
  const { data: roomData, loading, error, fetchDetail } = useRoomTypeDetail(id)
 
  useEffect(() => {
    if (id) {
      fetchDetail()
    }
  }, [id, fetchDetail])

  // Similar rooms mock data - có thể tích hợp API sau
  const similarRooms = [
    { id: 2, name: 'PHÒNG ĐƠN VIEW THÀNH PHỐ', price: 700000, area: 25, guests: 2, image: 'https://bizweb.dktcdn.net/thumb/large/100/472/947/products/sp21.jpg?v=1670338576510' },
    { id: 3, name: 'PHÒNG ĐƠN VIEW SÂN VƯỜN', price: 800000, area: 25, guests: 2, image: 'https://bizweb.dktcdn.net/thumb/large/100/472/947/products/anh11a713f0cbaa54ea595b6bb5e1b.jpg?v=1670338575473' },
    { id: 4, name: 'PHÒNG ĐƠN VIEW BIỂN', price: 900000, area: 25, guests: 1, image: 'https://bizweb.dktcdn.net/thumb/large/100/472/947/products/anh1eb6eb86adb63474a819ab595ee.jpg?v=1670338574237' }
  ]

  const bestRooms = [
    { id: 5, name: 'Phòng Đơn Vip', price: 2500000, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 6, name: 'Phòng Gia Đình', price: 3000000, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 7, name: 'Căn Hộ Chung Cư', price: 2700000, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 8, name: 'Phòng Hạng Sang', price: 3500000, image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Đang tải thông tin phòng...</Text>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Empty
          description={error}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => fetchDetail()}>
            Thử lại
          </Button>
        </Empty>
      </div>
    )
  }

  if (!roomData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Empty
          description="Không tìm thấy thông tin phòng"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    )
  }

  const tabItems = [
    {
      key: 'description',
      label: <span style={{ fontSize: screens.xs ? 14 : 16, fontWeight: 500 }}>Mô tả</span>,
      children: (
        <div className="tab-content">
          <Paragraph style={{ fontSize: screens.xs ? 14 : 16, lineHeight: 1.8, color: '#374151' }}>
            {roomData.description || 'Phòng tiện nghi với đầy đủ trang thiết bị hiện đại'}
          </Paragraph>
          <div style={{ marginTop: screens.xs ? 16 : 24 }}>
            <Title level={screens.xs ? 5 : 4} style={{ marginBottom: screens.xs ? 12 : 16 }}>
              Giờ trả phòng:
            </Title>
            <Text style={{ fontSize: screens.xs ? 14 : 15 }}>12h00 hàng ngày</Text>
          </div>
          <div style={{ marginTop: screens.xs ? 16 : 24 }}>
            <Title level={screens.xs ? 5 : 4} style={{ marginBottom: screens.xs ? 12 : 16 }}>
              Hình thức Thanh toán:
            </Title>
            <Text style={{ fontSize: screens.xs ? 14 : 15 }}>
              Tiền mặt (VND, USD, EURO, ...) thẻ tín dụng Visa và Master
            </Text>
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
          {roomData.amenities && Array.isArray(roomData.amenities) && roomData.amenities.length > 0 ? (
            <ul className="amenities-list">
              {roomData.amenities.map((amenity, index) => (
                <li key={index} style={{ fontSize: screens.xs ? 14 : 15, marginBottom: 8 }}>
                  {amenity}
                </li>
              ))}
            </ul>
          ) : (
            <Text type="secondary">Chưa có thông tin tiện nghi</Text>
          )}
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
              <a onClick={() => navigate('/')}>
                <HomeOutlined /> Trang chủ
              </a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <a onClick={() => navigate('/hotels')}>Danh sách phòng</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{roomData.room_type_name}</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {/* Image Slider */}
        <div className="room-slider-container" style={{ marginBottom: screens.xs ? 24 : 32 }}>
          {roomData.images && roomData.images.length > 0 ? (
            <Carousel autoplay autoplaySpeed={4000} dotPosition="bottom">
              {roomData.images.map((image, index) => (
                <div key={index} className="slider-item">
                  <img src={image} alt={`${roomData.room_type_name} ${index + 1}`} />
                </div>
              ))}
            </Carousel>
          ) : (
            <div style={{ 
              height: '400px', 
              background: '#f0f0f0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: '12px',
              color: '#999'
            }}>
              Không có hình ảnh
            </div>
          )}
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
              {roomData.room_type_name}
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
                    {roomData.capacity < 10 ? `0${roomData.capacity}` : roomData.capacity} Người lớn
                  </Text>
                </div>
              </Col>
              <Col xs={8} sm={8} md={8} lg={8}>
                <div className="info-item">
                  <UserOutlined style={{ fontSize: screens.xs ? 20 : 24, color: '#000' }} />
                  <Text style={{ fontSize: screens.xs ? 11 : 13, marginTop: 6, display: 'block' }}>
                    {roomData.category || 'Standard'}
                  </Text>
                </div>
              </Col>
              <Col xs={8} sm={8} md={8} lg={8}>
                <div className="info-item">
                  <ExpandOutlined style={{ fontSize: screens.xs ? 20 : 24, color: '#000' }} />
                  <Text style={{ fontSize: screens.xs ? 11 : 13, marginTop: 6, display: 'block' }}>
                    Phòng {roomData.area || 'N/A'}m²
                  </Text>
                </div>
              </Col>
            </Row>

            {/* Tags */}
            <div style={{ marginBottom: screens.xs ? 16 : 20 }}>
              <Space size="small" wrap>
                <Tag color="blue">{roomData.category}</Tag>
                <Tag icon={<UserOutlined />}>{roomData.capacity} người</Tag>
                {roomData.area && <Tag color="green">{roomData.area}m²</Tag>}
                {roomData.amenities && Array.isArray(roomData.amenities) && roomData.amenities.some(amenity => 
                  amenity.toLowerCase().includes('pet') || amenity.toLowerCase().includes('thú cưng')
                ) && <Tag color="orange">Cho phép thú cưng</Tag>}
              </Space>
            </div>

            {/* Description */}
            <Paragraph style={{ fontSize: screens.xs ? 14 : 15, lineHeight: 1.8, color: '#374151', marginBottom: 0 }}>
              {roomData.description || 'Phòng tiện nghi với đầy đủ trang thiết bị hiện đại'}
            </Paragraph>
          </Col>

          {/* Right: Booking Sidebar */}
          <Col xs={24} sm={24} md={8} lg={8}>
            <Card className="booking-sidebar-card">
              {/* Price Header */}
              <div className="price-header">
                <Title level={3} style={{ color: '#c08a19', margin: 0, fontSize: screens.xs ? 20 : 24 }}>
                  {roomData.price_per_night ? formatPrice(roomData.price_per_night) : 'Liên hệ'}/Đêm
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
                      className='book-now-button'
                      type="primary"
                      block
                      size={screens.xs ? 'middle' : 'large'}
                      onClick={() => {
                        const values = bookingForm.getFieldsValue()
                        if (!values.fullName || !values.phone) {
                          // alert('Vui lòng điền đầy đủ thông tin!')
                          message.error('Vui lòng điền đầy đủ thông tin để tiến hành đặt phòng !')
                          return
                        }
                        
                        navigate('/booking-confirmation', {
                          state: {
                            bookingInfo: {
                              roomType: roomData,
                              checkIn: values.checkIn?.format('YYYY-MM-DD'),
                              checkOut: values.checkOut?.format('YYYY-MM-DD'),
                              guests: {
                                adults: values.adults || 1,
                                children: values.children || 0
                              },
                              customerInfo: {
                                fullName: values.fullName,
                                phone: values.phone,
                                // email: values.email
                              }
                            }
                          }
                        })
                      }}
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
        <div style={{ marginBottom: screens.xs ? 24 : 32 , border : '1px solid #c08a19' , borderRadius: '12px' , padding: '10px'}}>
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
            <Col xs={12} sm={12} md={6} lg={6}>
              <Card className="service-card" hoverable>
                <div className="service-content">
                  <div style={{ fontSize: screens.xs ? 28 : 36, color: '#c08a19', marginBottom: 8 }}>
                    <CoffeeOutlined />
                  </div>
                  <Text style={{ fontSize: screens.xs ? 13 : 14, textAlign: 'center', display: 'block' }}>
                    Cafe Buổi Sáng
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6}>
              <Card className="service-card" hoverable>
                <div className="service-content">
                  <div style={{ fontSize: screens.xs ? 28 : 36, color: '#c08a19', marginBottom: 8 }}>
                    <WifiOutlined />
                  </div>
                  <Text style={{ fontSize: screens.xs ? 13 : 14, textAlign: 'center', display: 'block' }}>
                    Internet Không Dây
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6}>
              <Card className="service-card" hoverable>
                <div className="service-content">
                  <div style={{ fontSize: screens.xs ? 28 : 36, color: '#c08a19', marginBottom: 8 }}>
                    <CarOutlined />
                  </div>
                  <Text style={{ fontSize: screens.xs ? 13 : 14, textAlign: 'center', display: 'block' }}>
                    Bãi Đỗ Xe
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6}>
              <Card className="service-card" hoverable>
                <div className="service-content">
                  <div style={{ fontSize: screens.xs ? 28 : 36, color: '#c08a19', marginBottom: 8 }}>
                    <SafetyOutlined />
                  </div>
                  <Text style={{ fontSize: screens.xs ? 13 : 14, textAlign: 'center', display: 'block' }}>
                    Két Sắt
                  </Text>
                </div>
              </Card>
            </Col>
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
          
          <Row gutter={screens.xs ? [12, 16] : screens.md ? [20, 20] : [24, 24]}>
            {similarRooms.map((room) => (
              <Col xs={24} sm={12} md={8} lg={8} key={room.id}>
                <div className="room-list-card" onClick={() => navigate(`/rooms/${room.id}`)}>
                  <div className="room-list-image">
                    <img alt={room.name} src={room.image} />
                  </div>
                  <div className="room-list-content">
                    <h3 className="room-list-name">{room.name}</h3>

                    <div className="room-list-amenities">
                      <CoffeeOutlined />
                      <RestOutlined />
                      <WifiOutlined />
                    </div>

                    <div className="room-list-stats">
                      <span className="room-list-capacity">
                        <UserOutlined /> {room.guests < 10 ? `0${room.guests}` : room.guests} Khách
                      </span>
                      <span className="room-list-size">
                        <ExpandOutlined /> {room.area}m²
                      </span>
                    </div>

                    <div className="room-list-footer">
                      <span className="room-list-price">{room.price.toLocaleString('vi-VN')}đ/Đêm</span>
                      <button className="room-list-book-btn"
                      onClick={() => handleOpenBookingModal(room)}
                      >ĐẶT PHÒNG</button>
                    </div>
                  </div>
                </div>
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