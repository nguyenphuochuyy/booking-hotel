import React, { useState, useEffect } from 'react'
import {
  Card, Row, Col, Button, Typography, Space, Divider,
  Image, Form, Input, Select, message, Collapse, Spin,
  Checkbox, Tag
} from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import formatPrice from '../../utils/formatPrice'
import { UserOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { createTempBooking, createPaymentLink, addServicesToTempBooking, calculateNights, formatDate, validatePromotionCode } from '../../services/booking.service'
import { getAllServices } from '../../services/admin.service'
import { savePendingPayment } from '../../utils/pendingPayment.util'
import './BookingConfirmation.css'
import { useAuth } from '../../context/AuthContext'

const { Title, Text } = Typography
const { TextArea } = Input
const { Panel } = Collapse

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
  const nights = calculateNights(bookingInfo.checkIn, bookingInfo.checkOut)
  const { user } = useAuth()

  // tải dịch vụ khi component mounts
  useEffect(() => {
    loadServices()
    console.log(bookingInfo);
    
  }, [bookingInfo])

  // Load available services for the hotel
  const loadServices = async () => {
    setServicesLoading(true)
    try {
      // Use getAllServices from admin.service.js
      const response = await getAllServices({
        hotel_id: bookingInfo?.roomType?.rooms[0]?.hotel_id
      })
      // Backend returns { services: [...], pagination: {...} }
      const servicesList = response?.services
      // Filter only available services
      const availableServices = Array.isArray(servicesList)
        ? servicesList.filter(s => s.is_available === true || s.is_available === 'true')
        : []
      setServices(availableServices)
    } catch (error) {
      console.error('Error loading services:', error)
      message.error('Không thể tải danh sách dịch vụ')
      setServices([])
    } finally {
      setServicesLoading(false)
    }
  }

  // chọn dịch vụ 
  const handleServiceToggle = (service, checked) => {
    if (checked) {
      setSelectedServices([...selectedServices, { ...service, quantity: 1 }])
    } else {
      setSelectedServices(selectedServices.filter(s => s.service_id !== service.service_id))
    }
  }

  // Update service quantity
  const handleServiceQuantityChange = (serviceId, quantity) => {
    setSelectedServices(selectedServices.map(s =>
      s.service_id === serviceId ? { ...s, quantity } : s
    ))
  }

  // Prefill user info into form
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.full_name || '',
        email: user.email || '',
      })
    }


  }, [user, form])

  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      // 1. Tạo temp booking
      const tempBookingResponse = await createTempBooking({
        room_type_id: bookingInfo.roomType.room_type_id,
        check_in_date: bookingInfo.checkIn,
        check_out_date: bookingInfo.checkOut,
        num_person: bookingInfo.guests?.adults || 2,
        num_rooms: bookingInfo.numRooms,
      })
      const tempBookingKey = tempBookingResponse.temp_booking_key
      
      
      // 2. Thêm dịch vụ (nếu có chọn)
      if (selectedServices.length > 0) {
        await addServicesToTempBooking(tempBookingKey, selectedServices)
      }
      if(promoCode) {
        
      }
      // 3. Tạo payment link
      const paymentResponse = await createPaymentLink({
        temp_booking_key: tempBookingKey,
        promotion_code: promoCode || null
      })
      
      // 4. Lưu thông tin thanh toán vào localStorage
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
      savePendingPayment(paymentData, 30) // Lưu 30 phút
      
      // 5. Mở URL thanh toán trực tiếp cho khách hàng
      if (paymentResponse.payment_url) {
        message.success('Đang chuyển đến trang thanh toán...')
        // Mở trong tab mới để khách hàng có thể quay lại sau khi thanh toán
        window.open(paymentResponse.payment_url, '_blank')
        // Hoặc redirect trực tiếp (bỏ comment dòng dưới nếu muốn redirect thay vì mở tab mới)
        // window.location.href = paymentResponse.payment_url
      } else {
        message.error('Không thể tạo link thanh toán')
      }

    } catch (error) {
      console.error('có lỗi xảy ra khi tạo đặt phòng:', error)
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đặt phòng!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="booking-confirmation-page">
      <div className="container" style={{ padding: '0px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center' }}>Xác Nhận Đặt Phòng</Title>
        <Row gutter={24}>
          {/* Cột trái - Chi tiết phòng đã chọn */}
          <Col xs={24} md={6} order={{ xs: 1, md: 1 }}>
            {bookingInfo?.roomType && (
              <Card className="room-detail-card-confirmation" style={{ marginBottom: '24px' }}>
                {bookingInfo.roomType.images && bookingInfo.roomType.images.length > 0 && (
                  <Image
                    src={bookingInfo.roomType.images[0]}
                    alt={bookingInfo.roomType.room_type_name}
                    style={{ width: '100%', height: 'auto', marginBottom: '16px' }}
                    preview={false}
                  />
                )}
                <Title level={5} style={{ marginBottom: '8px' }}>{bookingInfo.roomType.room_type_name}</Title>
                <Text type="secondary" style={{ color: '#1890ff', cursor: 'pointer', display: 'block', marginBottom: '12px' }}>
                  Đọc thêm
                </Text>
                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                  <Text>{bookingInfo.guests?.adults || 2} khách</Text>
                  <Space size={12} wrap>
                    <Text>Cho phép {bookingInfo.roomType.capacity || 2} người</Text>
                    <Text>•</Text>
                    <Text>1 giường king</Text>
                    <Text>•</Text>
                    <Text>1 phòng tắm</Text>
                  </Space>
                  <Space size={12} wrap>
                    <Text>{bookingInfo.roomType.area || 28} m²</Text>
                    <Text>•</Text>
                    <Text>Tầm nhìn thành phố</Text>
                    <Text>•</Text>
                    <Text>Không hút thuốc</Text>
                  </Space>
                  <div style={{ marginTop: '12px' }}>
                    <Text style={{ color: '#059669' }}>✓ Hủy miễn phí!</Text>
                    <span style={{ margin: '0 8px' }}>|</span>
                    <Text style={{ color: '#059669' }}>Đặt ngay, trả sau</Text>
                  </div>
                </Space>
                <Divider style={{ margin: '16px 0' }} />
                <Text strong style={{ fontSize: '24px', color: '#c08a19', display: 'block', textAlign: 'center' }}>
                  {formatPrice(bookingInfo.roomType.price_per_night)}
                </Text>
              </Card>
            )}
          </Col>

          {/* Cột giữa - Form thông tin khách hàng */}
          <Col xs={24} md={10} order={{ xs: 2, md: 2 }}>
            <Card className="customer-form-card" title={
              <Space>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#c08a19',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  1
                </div>
                <span style={{ fontSize: '18px', fontWeight: 600 }}>Thông tin của bạn</span>
              </Space>
            }>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="fullName"
                      label="Họ và tên"
                      rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
                    >
                      <Input placeholder="Nhập họ và tên" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="email"
                  label="E-mail"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input placeholder="your@email.com" size="large" />
                </Form.Item>

                <Form.Item
                  name="confirmEmail"
                  label="Xác nhận E-mail"
                  dependencies={['email']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận email!' },
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
                  <Input placeholder="your@email.com" size="large" />
                </Form.Item>

                <Text type="secondary" style={{ fontSize: '13px', marginBottom: '16px', display: 'block' }}>
                  Hãy giúp chúng tôi đảm bảo một sự chào đón nồng nhiệt và trải nghiệm check-in thuận lợi khi bạn đến.
                </Text>

                {/* Dịch vụ bổ sung */}
                <Collapse
                  ghost
                  style={{ marginTop: '16px', marginBottom: '16px' , border: '1px solid #ddd' }}
                  items={[
                    {
                      key: 'services',
                      label: <span style={{ fontSize: '14px', fontWeight: 500 }}>Dịch vụ bổ sung (tùy chọn)</span>,
                      children: (
                        <Spin spinning={servicesLoading}>
                          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {services.length === 0 ? (
                              <Text type="secondary">Không có dịch vụ khả dụng</Text>
                            ) : (
                              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                {services.map(service => (
                                  <div key={service.service_id}>
                                    <Row
                                      align="middle"
                                      gutter={16}
                                      style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        backgroundColor: selectedServices.some(s => s.service_id === service.service_id)
                                          ? '#f0f8ff' : '#fff'
                                      }}
                                    >
                                      {/* Checkbox và tên dịch vụ bên trái */}
                                      <Col span={18}>
                                        <Space>
                                          <Checkbox
                                            checked={selectedServices.some(s => s.service_id === service.service_id)}
                                            onChange={(e) => handleServiceToggle(service, e.target.checked)}
                                          />
                                          <div>
                                            <Text strong>{service.name}</Text>
                                            <div>
                                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {service.description}
                                              </Text>
                                            </div>
                                          </div>
                                        </Space>
                                      </Col>

                                      {/* Giá bên phải */}
                                      <Col span={6} style={{ textAlign: 'right' }}>
                                        <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                                          {formatPrice(service.price)}
                                        </Text>
                                      </Col>
                                    </Row>

                                    {/* Hiển thị số lượng nếu đã chọn */}
                                    {selectedServices.some(s => s.service_id === service.service_id) && (
                                      <div style={{
                                        marginTop: '8px',
                                        padding: '8px 12px',
                                        background: '#fafafa',
                                        borderRadius: '6px'
                                      }}>
                                        <Space>
                                          <Text style={{ fontSize: '13px' }}>Số lượng:</Text>
                                          <Button
                                            size="small"
                                            onClick={() => {
                                              const current = selectedServices.find(s => s.service_id === service.service_id)
                                              if (current && current.quantity > 1) {
                                                handleServiceQuantityChange(service.service_id, current.quantity - 1)
                                              }
                                            }}
                                          >
                                            -
                                          </Button>
                                          <Input
                                            size="small"
                                            value={selectedServices.find(s => s.service_id === service.service_id)?.quantity || 1}
                                            style={{ width: '50px', textAlign: 'center' }}
                                            readOnly
                                          />
                                          <Button
                                            size="small"
                                            onClick={() => {
                                              const current = selectedServices.find(s => s.service_id === service.service_id)
                                              handleServiceQuantityChange(service.service_id, (current?.quantity || 1) + 1)
                                            }}
                                          >
                                            +
                                          </Button>
                                        </Space>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </Space>
                            )}
                          </div>
                        </Spin>
                      )
                    }
                  ]}
                />
                <Text type="secondary" style={{ fontSize: '12px', marginBottom: '16px', display: 'block' }}>
                  <InfoCircleOutlined /> Để bảo mật, vui lòng không nhập thông tin thẻ tín dụng trên trang này.
                </Text>
                <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
                  <Button
                    htmlType="submit"
                    size="large"
                    block
                    loading={loading}
                    style={{
                   
                      height: '48px',
                      fontSize: '16px',
                      fontWeight: 600,
                      background: '#c08a19',
                      borderColor: '#c08a19',
                      color: 'white'
                    }}
                  >
                    {loading ? 'Đang xử lý...' : 'Tiếp tục'}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Cột phải - Booking Summary */}
          <Col xs={24} md={8} order={{ xs: 3, md: 3 }}>
            <Card
              className="summary-card-confirmation"
              style={{ position: 'sticky', top: '20px' }}
              bodyStyle={{ padding: '24px' }}
            >
              {/* Header - Total */}
              <div style={{ marginBottom: '16px' }}>
                <Title level={3} style={{ margin: 0, fontSize: '24px', fontWeight: 600, textAlign: 'center' }}>
                  TÓM TẮT ĐẶT PHÒNG
                </Title>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              {/* Dates and guests */}
              <div style={{ marginBottom: '12px' }}>
                <Text strong style={{ fontSize: '14px' }}>{formatDate(bookingInfo.checkIn)} - {formatDate(bookingInfo.checkOut)}</Text>
                <Text type="secondary" style={{ marginLeft: '8px', fontSize: '14px' }}>
                  {/* Tính số đêm từ checkIn đến checkOut ko dùng hàm calculateNights*/}
                  {nights} đêm
                </Text>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '14px', color: '#6b7280' }}>{bookingInfo.numRooms} phòng, {bookingInfo.guests?.adults || 2} khách</Text>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              {/* Expandable Stay Details */}
              <Collapse
                ghost
                style={{ marginBottom: '16px' }}
                items={[
                  {
                    key: 'stay-details',
                    label: <span style={{ fontSize: '14px', fontWeight: 500 }}>Chi tiết lưu trú</span>,
                    children: bookingInfo?.roomType && (
                      <div>
                        <Text strong style={{ fontSize: '14px' }}>{bookingInfo.roomType.room_type_name}</Text>
                        <div style={{ marginTop: '4px' , display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: '13px', color: '#6b7280' }}>{bookingInfo.guests?.adults || 2} khách {nights} đêm</Text>
                          <Text style={{ fontSize: '13px', color: '#6b7280' }}>{bookingInfo.numRooms} phòng</Text>
                    
                        </div>
                        {/* dịch vụ nếu có */}
                     
                          {selectedServices.length > 0 && (
                            <div style={{ marginTop: '16px'  }}>
                              <Text strong style={{ fontSize: '14px' }}>Dịch vụ bổ sung</Text>
                              <div style={{ marginTop: '4px' , display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: '13px', color: '#6b7280' }}>{selectedServices.map(service => service.name).join(', ')}</Text>
                                <Text style={{ fontSize: '13px', color: '#6b7280' }}>{formatPrice(selectedServices.reduce((total, service) => total + service.price * service.quantity, 0))}</Text>
                              </div>
                              
                            </div>
                          )}
                
                      
                        <div style={{ textAlign: 'right', marginTop: '8px' }}>
                          <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>
                            {formatPrice((bookingInfo.roomType.price_per_night * nights) + (selectedServices.reduce((total, service) => total + service.price * service.quantity, 0)))}
                          </Text>
                        </div>
                      </div>
                    ),
                  }
                ]}
              />

              <Divider style={{ margin: '16px 0' }} />
                {/* Mã khuyến mãi */}
                <div style={{ marginTop: '16px' }}>
                          <Text strong style={{ fontSize: '14px' }}>Mã khuyến mãi</Text>
                          <div style={{ marginTop: '6px', display: 'flex', gap: '8px' }}>
                            <Input
                              placeholder="Nhập mã khuyến mãi"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                              size="middle"
                            />
                            <Button
                              type="default"
                      loading={promoApplying}
                      onClick={async () => {
                        if (!promoCode) {
                          message.warning('Vui lòng nhập mã khuyến mãi')
                          return
                        }
                        try {
                          setPromoApplying(true)
                          const res = await validatePromotionCode(promoCode)
                          const promo = res?.promotion || res?.data || res
                          if (!promo) {
                            message.error('Mã khuyến mãi không hợp lệ')
                            setPromoInfo(null)
                            setDiscountAmount(0)
                            return
                          }
                          setPromoInfo(promo)
                          // Tính tổng trước giảm
                          const baseRoom = (bookingInfo.roomType.price_per_night || 0) * nights * (bookingInfo.numRooms || 1)
                          const svcTotal = selectedServices.reduce((total, service) => total + (service.price || 0) * (service.quantity || 1), 0)
                          const baseTotal = baseRoom + svcTotal
                          let discount = 0
                          const dtype = (promo.discount_type || promo.type || '').toLowerCase()
                          const dval = Number(promo.amount || promo.value || 0)
                          if (dtype === 'percentage' || dtype === 'percent') {
                            discount = Math.floor(baseTotal * (dval / 100))
                          } else {
                            discount = dval
                          }
                          discount = Math.min(Math.max(discount, 0), baseTotal)
                          setDiscountAmount(discount)
                          message.success('Áp dụng mã khuyến mãi thành công')
                        } catch (e) {
                          message.error(e?.response?.data?.message || 'Mã khuyến mãi không hợp lệ')
                          setPromoInfo(null)
                          setDiscountAmount(0)
                        } finally {
                          setPromoApplying(false)
                        }
                      }}
                            >
                              Áp dụng
                            </Button>
                          </div>
                        </div>

              <Divider style={{ margin: '16px 0' }} />
              {/* Total */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <Text strong style={{ fontSize: '16px' }}>Tổng cộng</Text>
                    {(() => {
                      const base = bookingInfo?.roomType ? (bookingInfo.roomType.price_per_night * nights * bookingInfo.numRooms + (selectedServices.reduce((total, service) => total + service.price * service.quantity, 0))) : 0
                      const final = Math.max(0, base - (discountAmount || 0))
                      return (
                        <div style={{ textAlign: 'right' }}>
                          {discountAmount > 0 && (
                            <div style={{ fontSize: '12px', color: '#16a34a' }}>
                              Giảm: -{formatPrice(discountAmount)}
                            </div>
                          )}
                          <Text strong style={{ fontSize: '18px', color: '#1f2937' }}>
                            {formatPrice(final)}
                          </Text>
                        </div>
                      )
                    })()}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default BookingConfirmation
