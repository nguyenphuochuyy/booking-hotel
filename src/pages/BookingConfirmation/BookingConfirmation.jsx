import React, { useState, useEffect } from 'react'
import {
  Card, Row, Col, Button, Typography, Space, Divider,
  Image, Form, Input, message, Spin, Steps, Checkbox, Tag
} from 'antd'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import formatPrice from '../../utils/formatPrice'
import { 
  UserOutlined, 
  CheckCircleOutlined, 
  CreditCardOutlined, 
  SolutionOutlined,
  HomeOutlined
} from '@ant-design/icons'
import { createTempBooking, createPaymentLink, addServicesToTempBooking, calculateNights, formatDate, validatePromotionCode } from '../../services/booking.service'
import { getAllServices } from '../../services/admin.service'
import { useAuth } from '../../context/AuthContext'
import { savePendingPayment } from '../../utils/pendingPayment.util'
import './BookingConfirmation.css'

const { Title, Text } = Typography

const BookingConfirmation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState([])
  const [promoCode, setPromoCode] = useState('')
  const [promoApplying, setPromoApplying] = useState(false)
  const [promoInfo, setPromoInfo] = useState(null)
  const [discountAmount, setDiscountAmount] = useState(0)

  const bookingInfo = location.state
  // Fallback nếu user refresh trang làm mất state
  const nights = bookingInfo ? calculateNights(bookingInfo.checkIn, bookingInfo.checkOut) : 0
  const { user } = useAuth()

  useEffect(() => {
    if (!bookingInfo) {
      navigate('/') // Quay về trang chủ nếu không có data
      return
    }
    loadServices()
  }, [bookingInfo])

  // Load services
  const loadServices = async () => {
    setServicesLoading(true)
    try {
      const response = await getAllServices({
        hotel_id: bookingInfo?.roomType?.rooms?.[0]?.hotel_id
      })
      const servicesList = response?.services
      const availableServices = Array.isArray(servicesList)
        ? servicesList.filter(s => s.is_available === true || s.is_available === 'true')
        : []
      setServices(availableServices)
    } catch (error) {
      console.error('Error loading services:', error)
      // message.error('Không thể tải danh sách dịch vụ') // Silent fail để ko làm phiền user
      setServices([])
    } finally {
      setServicesLoading(false)
    }
  }

  // Toggle Service
  const handleServiceToggle = (service, checked) => {
    if (checked) {
      setSelectedServices([...selectedServices, { ...service, quantity: 1 }])
    } else {
      setSelectedServices(selectedServices.filter(s => s.service_id !== service.service_id))
    }
  }

  // Quantity Change
  const handleServiceQuantityChange = (serviceId, quantity) => {
    setSelectedServices(selectedServices.map(s =>
      s.service_id === serviceId ? { ...s, quantity } : s
    ))
  }

  // Prefill User
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.full_name || '',
        email: user.email || '',
        confirmEmail: '', 
      })
    }
  }, [user, form])

  // Submit Logic 
  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      // 1. Create Temp Booking
      const tempBookingResponse = await createTempBooking({
        room_type_id: bookingInfo.roomType.room_type_id,
        check_in_date: bookingInfo.checkIn,
        check_out_date: bookingInfo.checkOut,
        num_person: bookingInfo.guests?.adults || 2,
        num_rooms: bookingInfo.numRooms,
      })
      const tempBookingKey = tempBookingResponse.temp_booking_key
      
      // 2. Add Services
      if (selectedServices.length > 0) {
        await addServicesToTempBooking(tempBookingKey, selectedServices)
      }

      // 3. Create Payment Link
      const paymentResponse = await createPaymentLink({
        temp_booking_key: tempBookingKey,
        promotion_code: promoCode || null
      })

      // 4. Save Pending Payment
      const paymentData = {
        tempBookingKey,
        paymentUrl: paymentResponse.payment_url,
        qrCode: paymentResponse.qr_code,
        orderCode: paymentResponse.order_code,
        bookingCode: paymentResponse.booking_code,
        amount: paymentResponse.amount,
        selectedServices,
        bookingInfo: {
          ...bookingInfo,
          numRooms: bookingInfo.numRooms,
          customerInfo: values,
          promoCode: promoCode || null
        }
      }
      savePendingPayment(user?.user_id, paymentData, 30)

      // 5. Navigate
      navigate('/payment', {
        state: paymentData
      })
    } catch (error) {
      console.error('Booking error:', error)
      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Tính toán tổng tiền
  const baseRoomPrice = bookingInfo?.roomType ? (bookingInfo.roomType.price_per_night * nights * bookingInfo.numRooms) : 0
  const servicesPrice = selectedServices.reduce((total, service) => total + service.price * service.quantity, 0)
  const totalBeforeDiscount = baseRoomPrice + servicesPrice
  const finalTotal = Math.max(0, totalBeforeDiscount - discountAmount)

  if (!bookingInfo) return null;

  return (
    <div className="luxury-booking-page">
      <div className="luxury-container">
        
        {/* Steps Indicator */}
        <div className="steps-container">
          <Steps 
            current={1} 
            items={[
              { title: 'Chọn phòng', icon: <HomeOutlined /> },
              { title: 'Thông tin & Dịch vụ', icon: <SolutionOutlined /> },
              { title: 'Thanh toán', icon: <CreditCardOutlined /> },
            ]} 
          />
        </div>

        <Row gutter={40}>
          {/* LEFT COLUMN: Information & Services */}
          <Col xs={24} lg={15}>
            
            {/* 1. Customer Information */}
            <div className="section-block">
              <Title level={3} className="section-title">Thông tin khách hàng</Title>
              <Card className="luxury-card" bordered={false}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  className="luxury-form"
                >
                   <Row gutter={20}>
                     <Col xs={24} md={24}>
                        <Form.Item
                          name="fullName"
                          label="Họ và tên người nhận phòng"
                          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                        >
                          <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="VD: Nguyen Van A" size="large" disabled={true} />
                        </Form.Item>
                     </Col>
                     <Col xs={24} md={12}>
                        <Form.Item
                          name="email"
                          label="Địa chỉ Email (để nhận vé)"
                          rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                          ]}
                        >
                          <Input placeholder="example@email.com" size="large" disabled={true} />
                        </Form.Item>
                     </Col>
                     <Col xs={24} md={12}>
                        <Form.Item
                          name="confirmEmail"
                          label="Xác nhận Email"
                          dependencies={['email']}
                          rules={[
                            { required: true, message: 'Vui lòng xác nhận email' },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value || getFieldValue('email') === value) {
                                  return Promise.resolve()
                                }
                                return Promise.reject(new Error('Email không khớp!'))
                              },
                            }),
                          ]}
                        >
                          <Input placeholder="Nhập lại email" size="large" />
                        </Form.Item>
                     </Col>
                   </Row>
                   <div className="form-note">
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      <span>Chúng tôi sẽ gửi thông tin xác nhận đặt phòng qua email này.</span>
                   </div>
                </Form>
              </Card>
            </div>

            {/* 2. Add-on Services */}
            <div className="section-block">
              <Title level={3} className="section-title">Dịch vụ bổ sung <span className="optional-tag">(Tùy chọn)</span></Title>
              <Card className="luxury-card" bordered={false}>
                <Spin spinning={servicesLoading}>
                  {services.length === 0 ? (
                    <Text type="secondary">Hiện không có dịch vụ bổ sung cho loại phòng này.</Text>
                  ) : (
                    <div className="services-list">
                      {services.map(service => {
                        const isSelected = selectedServices.some(s => s.service_id === service.service_id)
                        return (
                          <div key={service.service_id} className={`service-item ${isSelected ? 'active' : ''}`}>
                            <div className="service-checkbox">
                              <Checkbox
                                checked={isSelected}
                                onChange={(e) => handleServiceToggle(service, e.target.checked)}
                              />
                            </div>
                            <div className="service-info">
                              <Text strong className="service-name">{service.name}</Text>
                              <Text type="secondary" className="service-desc">{service.description}</Text>
                            </div>
                            <div className="service-price-ctrl">
                              <Text strong className="price-tag">{formatPrice(service.price)}</Text>
                              {isSelected && (
                                <div className="quantity-control">
                                  <Button 
                                    size="small" 
                                    shape="circle"
                                    onClick={() => {
                                      const current = selectedServices.find(s => s.service_id === service.service_id)
                                      if (current && current.quantity > 1) handleServiceQuantityChange(service.service_id, current.quantity - 1)
                                    }}
                                  >-</Button>
                                  <span className="qty-display">{selectedServices.find(s => s.service_id === service.service_id)?.quantity || 1}</span>
                                  <Button 
                                    size="small" 
                                    shape="circle"
                                    onClick={() => {
                                      const current = selectedServices.find(s => s.service_id === service.service_id)
                                      handleServiceQuantityChange(service.service_id, (current?.quantity || 1) + 1)
                                    }}
                                  >+</Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Spin>
              </Card>
            </div>

          </Col>

          {/* RIGHT COLUMN: Summary Sticky */}
          <Col xs={24} lg={9}>
            <div className="sticky-summary">
              <Card className="luxury-card summary-card" bordered={false}>
                <div className="summary-header">
                  <Title level={4}>Chi tiết đặt phòng</Title>
                </div>
                
                {/* Room Info Mini */}
                <div className="room-mini-info">
                  <div className="room-thumb">
                     <Image 
                        src={bookingInfo.roomType.images?.[0]} 
                        alt="Room" 
                        preview={false} 
                        fallback="https://via.placeholder.com/150"
                      />
                  </div>
                  <div className="room-meta">
                    <Text strong className="room-name">{bookingInfo.roomType.room_type_name}</Text>
                    <div className="room-tags">
                      <Tag color="gold">{bookingInfo.numRooms} phòng</Tag>
                      <Tag>{nights} đêm</Tag>
                    </div>
                  </div>
                </div>

                <Divider className="dashed-divider" />

                {/* Date Info */}
                <div className="info-row">
                   <span className="label">Nhận phòng</span>
                   <span className="value">{formatDate(bookingInfo.checkIn)}</span>
                </div>
                <div className="info-row">
                   <span className="label">Trả phòng</span>
                   <span className="value">{formatDate(bookingInfo.checkOut)}</span>
                </div>
                <div className="info-row">
                   <span className="label">Khách</span>
                   <span className="value">{bookingInfo.guests?.adults} người lớn, {bookingInfo.guests?.children || 0} trẻ em</span>
                </div>

                <Divider className="dashed-divider" />

                {/* Price Calculation */}
                <div className="price-calc">
                  <div className="calc-row">
                    <span>Giá phòng ({nights} đêm)</span>
                    <span>{formatPrice(baseRoomPrice)}</span>
                  </div>
                  {selectedServices.length > 0 && (
                    <div className="calc-row">
                      <span>Dịch vụ bổ sung</span>
                      <span>{formatPrice(servicesPrice)}</span>
                    </div>
                  )}
                  
                  {/* Promotion Input */}
                  <div className="promo-section">
                     <Space.Compact style={{ width: '100%' }}>
                        <Input 
                          placeholder="Mã giảm giá" 
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                        />
                        <Button type="primary" loading={promoApplying} onClick={async () => {
                           if (!promoCode) return message.warning('Vui lòng nhập mã');
                           try {
                             setPromoApplying(true);
                             const res = await validatePromotionCode(promoCode);
                             const promo = res?.promotion || res?.data || res;
                             if(!promo) throw new Error('Invalid');
                             
                             setPromoInfo(promo);
                             const base = baseRoomPrice + servicesPrice;
                             let discount = 0;
                             const dval = Number(promo.amount || promo.value || 0);
                             if ((promo.discount_type||'').toLowerCase().includes('percent')) {
                               discount = Math.floor(base * (dval / 100));
                             } else {
                               discount = dval;
                             }
                             setDiscountAmount(Math.min(discount, base));
                             message.success('Áp dụng mã thành công!');
                           } catch(e) {
                             message.error('Mã không hợp lệ');
                             setDiscountAmount(0);
                             setPromoInfo(null);
                           } finally {
                             setPromoApplying(false);
                           }
                        }}>Áp dụng</Button>
                     </Space.Compact>
                     {discountAmount > 0 && (
                        <div className="calc-row discount-row">
                          <span>Ưu đãi ({promoInfo?.code})</span>
                          <span>-{formatPrice(discountAmount)}</span>
                        </div>
                     )}
                  </div>

                  <Divider />
                  
                  <div className="total-row">
                    <span>Tổng cộng</span>
                    <span className="total-price">{formatPrice(finalTotal)}</span>
                  </div>
                  <Text type="secondary" className="tax-note">Đã bao gồm thuế & phí dịch vụ</Text>
                </div>

                <div className="action-area">
                  <Button 
                    type="primary" 
                    size="large" 
                    block 
                    className="confirm-btn"
                    loading={loading}
                    onClick={() => form.submit()}
                  >
                    THANH TOÁN NGAY
                  </Button>
                  <div className="policy-text">
                    Bằng việc tiếp tục, bạn đồng ý với <Link to="/privacy-policy">Điều khoản</Link> & <Link to="/cancellation-policy">Chính sách</Link> của Bean Hotel.
                  </div>
                </div>

              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default BookingConfirmation