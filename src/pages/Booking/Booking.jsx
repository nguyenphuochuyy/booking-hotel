import React, { useState, useEffect } from 'react'
import { 
  Card, Row, Col, DatePicker, Select, Input, Button, 
  Typography, Image, Tag, Space, Divider, Form, 
  InputNumber, Radio, Checkbox, message, Spin, 
  Alert, Badge, Tooltip, Modal, Rate, Progress
} from 'antd'
import { 
  SearchOutlined, CalendarOutlined, UserOutlined, 
  GiftOutlined, WifiOutlined, CarOutlined, 
  CoffeeOutlined, CreditCardOutlined, PhoneOutlined,
  CheckCircleOutlined, ClockCircleOutlined, 
  EnvironmentOutlined, StarOutlined, HeartOutlined,
  InfoCircleOutlined, SafetyCertificateOutlined,
  BankOutlined, MobileOutlined, GlobalOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import './Booking.css'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

function Booking() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [specialRequests, setSpecialRequests] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('hotel')
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Mock data for rooms
  const mockRooms = [
    {
      id: 1,
      name: 'Phòng Standard Giường Đôi',
      type: 'standard',
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe'],
      area: '25m²',
      bedType: '1 giường King',
      view: 'Hướng thành phố',
      capacity: { adults: 2, children: 1 },
      description: 'Phòng tiêu chuẩn với đầy đủ tiện nghi hiện đại, view thành phố tuyệt đẹp',
      originalPrice: 1200000,
      currentPrice: 999000,
      discount: 10,
      breakfast: 'Không bao gồm',
      cancellation: 'Miễn phí hủy trước 3 ngày',
      available: 3,
      rating: 4.5,
      reviews: 128,
      urgency: 'Chỉ còn 2 phòng!'
    },
    {
      id: 2,
      name: 'Phòng Deluxe Hướng Biển',
      type: 'deluxe',
      images: [
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe', 'balcony', 'bathtub'],
      area: '35m²',
      bedType: '1 giường King',
      view: 'Hướng biển',
      capacity: { adults: 2, children: 2 },
      description: 'Phòng deluxe với view biển tuyệt đẹp, ban công riêng và bồn tắm sang trọng',
      originalPrice: 1800000,
      currentPrice: 1500000,
      discount: 15,
      breakfast: 'Bao gồm buffet sáng',
      cancellation: 'Miễn phí hủy trước 2 ngày',
      available: 1,
      rating: 4.8,
      reviews: 89,
      urgency: 'Đã có 5 người đặt hôm nay!'
    },
    {
      id: 3,
      name: 'Suite Gia Đình',
      type: 'suite',
      images: [
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe', 'balcony', 'bathtub', 'kitchen', 'living'],
      area: '60m²',
      bedType: '2 giường King',
      view: 'Hướng vườn',
      capacity: { adults: 4, children: 3 },
      description: 'Suite gia đình rộng rãi với phòng khách riêng, bếp mini và view vườn xanh mát',
      originalPrice: 2500000,
      currentPrice: 2200000,
      discount: 12,
      breakfast: 'Bao gồm buffet sáng',
      cancellation: 'Miễn phí hủy trước 1 ngày',
      available: 2,
      rating: 4.9,
      reviews: 45,
      urgency: 'Phổ biến với gia đình!'
    }
  ]

  // Amenity icons mapping
  const amenityIcons = {
    wifi: <WifiOutlined />,
    tv: <CreditCardOutlined />,
    ac: <SafetyCertificateOutlined />,
    minibar: <CoffeeOutlined />,
    safe: <SafetyCertificateOutlined />,
    balcony: <EnvironmentOutlined />,
    bathtub: <SafetyCertificateOutlined />,
    kitchen: <CoffeeOutlined />,
    living: <EnvironmentOutlined />
  }

  const amenityLabels = {
    wifi: 'Wi-Fi miễn phí',
    tv: 'TV màn hình phẳng',
    ac: 'Điều hòa',
    minibar: 'Minibar',
    safe: 'Két an toàn',
    balcony: 'Ban công',
    bathtub: 'Bồn tắm',
    kitchen: 'Bếp mini',
    living: 'Phòng khách'
  }

  // Handle search
  const handleSearch = async (values) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSearchResults(mockRooms)
      message.success('Tìm thấy phòng phù hợp!')
    } catch (error) {
      message.error('Có lỗi xảy ra khi tìm kiếm')
    } finally {
      setLoading(false)
    }
  }

  // Handle room selection
  const handleSelectRoom = (room) => {
    setSelectedRoom(room)
    setShowBookingForm(true)
  }

  // Handle promo code
  const handlePromoCode = (code) => {
    const validCodes = {
      'FIRST10': 10,
      'SUMMER2024': 15,
      'WELCOME': 5
    }
    
    if (validCodes[code]) {
      setPromoDiscount(validCodes[code])
      message.success(`Áp dụng mã giảm giá ${validCodes[code]}%!`)
    } else {
      setPromoDiscount(0)
      message.error('Mã khuyến mãi không hợp lệ')
    }
  }

  // Calculate total price
  const calculateTotal = () => {
    if (!selectedRoom) return 0
    
    const nights = 2 // Mock nights
    const roomPrice = selectedRoom.currentPrice * nights
    const discountAmount = (roomPrice * promoDiscount) / 100
    const tax = (roomPrice - discountAmount) * 0.1 // 10% tax
    const total = roomPrice - discountAmount + tax
    
    return {
      roomPrice,
      discountAmount,
      tax,
      total
    }
  }

  // Handle booking submission
  const handleBookingSubmit = (values) => {
    if (!termsAccepted) {
      message.error('Vui lòng đồng ý với điều khoản và điều kiện')
      return
    }
    
    message.success('Đặt phòng thành công! Chúng tôi sẽ gửi email xác nhận.')
    // Reset form
    setSelectedRoom(null)
    setShowBookingForm(false)
    form.resetFields()
  }

  const priceDetails = calculateTotal()

  return (
    <div className="booking-page">
      {/* Header */}
      <div className="booking-header">
        <Title level={1} className="booking-title">
          <CalendarOutlined /> Đặt phòng khách sạn
        </Title>
        <Paragraph className="booking-subtitle">
          Tìm kiếm và đặt phòng khách sạn với giá tốt nhất
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* Search Form - Left Side */}
        <Col xs={24} lg={8}>
          <Card className="search-form-card" title="Tìm kiếm phòng">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSearch}
              initialValues={{
                guests: { adults: 2, children: 0 },
                promoCode: ''
              }}
            >
              <Form.Item
                name="dateRange"
                label="Ngày nhận/trả phòng"
                rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  size="large"
                  placeholder={['Ngày nhận phòng', 'Ngày trả phòng']}
                  disabledDate={(current) => current && current < dayjs().endOf('day')}
                />
              </Form.Item>

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name={['guests', 'adults']}
                    label="Người lớn"
                    rules={[{ required: true, message: 'Vui lòng chọn số người!' }]}
                  >
                    <Select size="large" placeholder="Người lớn">
                      {[1,2,3,4,5,6].map(num => (
                        <Option key={num} value={num}>{num} người</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['guests', 'children']}
                    label="Trẻ em"
                  >
                    <Select size="large" placeholder="Trẻ em">
                      {[0,1,2,3,4].map(num => (
                        <Option key={num} value={num}>{num} trẻ em</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="promoCode"
                label="Mã khuyến mãi"
              >
                <Input
                  size="large"
                  placeholder="Nhập mã giảm giá"
                  suffix={
                    <Button 
                      type="text" 
                      icon={<GiftOutlined />}
                      onClick={() => handlePromoCode(form.getFieldValue('promoCode'))}
                    />
                  }
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SearchOutlined />}
                  loading={loading}
                  block
                  className="search-button"
                >
                  Kiểm tra phòng trống
                </Button>
              </Form.Item>
            </Form>

            {/* Contact Info */}
            <Divider />
            <div className="contact-info">
              <Title level={5}>
                <PhoneOutlined /> Hỗ trợ 24/7
              </Title>
              <Space direction="vertical" size="small">
                <Text><PhoneOutlined /> Hotline: 1900 1234</Text>
                <Text><GlobalOutlined /> Email: booking@beanhotel.com</Text>
                <Text><MobileOutlined /> Chat trực tuyến</Text>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Room Results - Right Side */}
        <Col xs={24} lg={16}>
          {searchResults.length > 0 ? (
            <div className="room-results">
              <Title level={3}>Kết quả tìm kiếm ({searchResults.length} phòng)</Title>
              
              {searchResults.map(room => (
                <Card key={room.id} className="room-card" hoverable>
                  <Row gutter={[16, 16]}>
                    {/* Room Images */}
                    <Col xs={24} md={8}>
                      <div className="room-images">
                        <Image.PreviewGroup>
                          {room.images.map((img, index) => (
                            <Image
                              key={index}
                              src={img}
                              alt={`${room.name} - Ảnh ${index + 1}`}
                              className="room-image"
                              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                            />
                          ))}
                        </Image.PreviewGroup>
                        
                        {/* Urgency Badge */}
                        {room.urgency && (
                          <Badge.Ribbon text={room.urgency} color="red">
                            <div></div>
                          </Badge.Ribbon>
                        )}
                      </div>
                    </Col>

                    {/* Room Info */}
                    <Col xs={24} md={16}>
                      <div className="room-info">
                        <div className="room-header">
                          <Title level={4} className="room-name">{room.name}</Title>
                          <div className="room-rating">
                            <Rate disabled defaultValue={room.rating} />
                            <Text type="secondary">({room.reviews} đánh giá)</Text>
                          </div>
                        </div>

                        <Paragraph className="room-description">
                          {room.description}
                        </Paragraph>

                        {/* Room Details */}
                        <Row gutter={[8, 8]} className="room-details">
                          <Col span={8}>
                            <Text strong><EnvironmentOutlined /> {room.area}</Text>
                          </Col>
                          <Col span={8}>
                            <Text strong><UserOutlined /> {room.bedType}</Text>
                          </Col>
                          <Col span={8}>
                            <Text strong><StarOutlined /> {room.view}</Text>
                          </Col>
                        </Row>

                        {/* Amenities */}
                        <div className="room-amenities">
                          <Text strong>Tiện nghi:</Text>
                          <Space wrap>
                            {room.amenities.map(amenity => (
                              <Tooltip key={amenity} title={amenityLabels[amenity]}>
                                <Tag icon={amenityIcons[amenity]} color="blue">
                                  {amenityLabels[amenity]}
                                </Tag>
                              </Tooltip>
                            ))}
                          </Space>
                        </div>

                        {/* Capacity */}
                        <div className="room-capacity">
                          <Text strong>Sức chứa: </Text>
                          <Text>{room.capacity.adults} người lớn</Text>
                          {room.capacity.children > 0 && (
                            <Text>, {room.capacity.children} trẻ em</Text>
                          )}
                        </div>

                        {/* Policies */}
                        <Row gutter={[16, 8]} className="room-policies">
                          <Col span={12}>
                            <Text><CoffeeOutlined /> {room.breakfast}</Text>
                          </Col>
                          <Col span={12}>
                            <Text><ClockCircleOutlined /> {room.cancellation}</Text>
                          </Col>
                        </Row>

                        {/* Price and Action */}
                        <div className="room-footer">
                          <div className="room-price">
                            <div className="price-current">
                              <Text strong className="price-amount">
                                {room.currentPrice.toLocaleString()} VNĐ
                              </Text>
                              <Text type="secondary">/đêm</Text>
                            </div>
                            {room.discount > 0 && (
                              <div className="price-original">
                                <Text delete type="secondary">
                                  {room.originalPrice.toLocaleString()} VNĐ
                                </Text>
                                <Tag color="red">-{room.discount}%</Tag>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            type="primary"
                            size="large"
                            onClick={() => handleSelectRoom(room)}
                            className="book-button"
                          >
                            Chọn phòng
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="no-results">
              <div className="no-results-content">
                <CalendarOutlined className="no-results-icon" />
                <Title level={4}>Chưa có kết quả tìm kiếm</Title>
                <Paragraph>
                  Vui lòng điền thông tin tìm kiếm để xem các phòng có sẵn
                </Paragraph>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* Booking Form Modal */}
      <Modal
        title="Hoàn tất đặt phòng"
        open={showBookingForm}
        onCancel={() => setShowBookingForm(false)}
        width={1000}
        footer={null}
        destroyOnClose
      >
        {selectedRoom && (
          <Row gutter={[24, 24]}>
            {/* Booking Summary */}
            <Col xs={24} md={12}>
              <Card title="Tóm tắt đơn đặt phòng" className="booking-summary">
                <div className="summary-room">
                  <Image
                    src={selectedRoom.images[0]}
                    width={80}
                    height={60}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                  />
                  <div className="summary-room-info">
                    <Title level={5}>{selectedRoom.name}</Title>
                    <Text type="secondary">
                      {dayjs().format('DD/MM/YYYY')} - {dayjs().add(2, 'day').format('DD/MM/YYYY')}
                    </Text>
                    <Text type="secondary">2 đêm • 2 người lớn</Text>
                  </div>
                </div>

                <Divider />

                <div className="price-breakdown">
                  <div className="price-item">
                    <Text>Giá phòng (2 đêm):</Text>
                    <Text>{priceDetails.roomPrice.toLocaleString()} VNĐ</Text>
                  </div>
                  
                  {priceDetails.discountAmount > 0 && (
                    <div className="price-item discount">
                      <Text>Giảm giá ({promoDiscount}%):</Text>
                      <Text type="success">-{priceDetails.discountAmount.toLocaleString()} VNĐ</Text>
                    </div>
                  )}
                  
                  <div className="price-item">
                    <Text>Thuế và phí dịch vụ (10%):</Text>
                    <Text>{priceDetails.tax.toLocaleString()} VNĐ</Text>
                  </div>
                  
                  <Divider />
                  
                  <div className="price-item total">
                    <Text strong>Tổng cộng:</Text>
                    <Text strong className="total-amount">
                      {priceDetails.total.toLocaleString()} VNĐ
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Booking Form */}
            <Col xs={24} md={12}>
              <Card title="Thông tin liên hệ">
                <Form
                  layout="vertical"
                  onFinish={handleBookingSubmit}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="firstName"
                        label="Họ"
                        rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
                      >
                        <Input placeholder="Nhập họ" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="lastName"
                        label="Tên"
                        rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                      >
                        <Input placeholder="Nhập tên" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input placeholder="your@email.com" />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                  >
                    <Input placeholder="0123456789" />
                  </Form.Item>

                  <Form.Item
                    name="nationality"
                    label="Quốc tịch"
                    rules={[{ required: true, message: 'Vui lòng chọn quốc tịch!' }]}
                  >
                    <Select placeholder="Chọn quốc tịch">
                      <Option value="vn">Việt Nam</Option>
                      <Option value="us">Hoa Kỳ</Option>
                      <Option value="uk">Anh</Option>
                      <Option value="jp">Nhật Bản</Option>
                      <Option value="kr">Hàn Quốc</Option>
                      <Option value="other">Khác</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="specialRequests"
                    label="Yêu cầu đặc biệt"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Ví dụ: Phòng ở tầng cao, Check-in muộn, Phòng không hút thuốc..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                    />
                  </Form.Item>

                  <Divider />

                  <Form.Item
                    name="paymentMethod"
                    label="Phương thức thanh toán"
                    rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
                  >
                    <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <Space direction="vertical">
                        <Radio value="hotel">
                          <Space>
                            <CreditCardOutlined />
                            Thanh toán tại khách sạn
                          </Space>
                        </Radio>
                        <Radio value="card">
                          <Space>
                            <CreditCardOutlined />
                            Thẻ tín dụng/ghi nợ
                          </Space>
                        </Radio>
                        <Radio value="bank">
                          <Space>
                            <BankOutlined />
                            Chuyển khoản ngân hàng
                          </Space>
                        </Radio>
                        <Radio value="wallet">
                          <Space>
                            <MobileOutlined />
                            Ví điện tử (MoMo, ZaloPay)
                          </Space>
                        </Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item>
                    <Checkbox
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    >
                      Tôi đồng ý với <a href="/terms">điều khoản và điều kiện</a> của khách sạn
                    </Checkbox>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      className="confirm-booking-btn"
                      disabled={!termsAccepted}
                    >
                      <CheckCircleOutlined /> Xác nhận đặt phòng
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  )
}

export default Booking