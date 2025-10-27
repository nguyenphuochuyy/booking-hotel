import React, { useState, useEffect } from 'react'
import { 
  Modal, Form, Input, DatePicker, Select, Button, 
  Typography, Row, Col, Card, Divider, Space, 
  message, Spin, Alert, Steps, Tag, InputNumber,
  Checkbox, Radio, Tooltip, Progress
} from 'antd'
import { 
  CalendarOutlined, UserOutlined, CreditCardOutlined,
  CheckCircleOutlined, InfoCircleOutlined, GiftOutlined,
  PhoneOutlined, MailOutlined, GlobalOutlined,
  BankOutlined, MobileOutlined, SafetyCertificateOutlined
} from '@ant-design/icons'
import { 
  createTempBooking, addServiceToTempBooking, createPaymentLink,
  validatePromotionCode, getServices, formatPrice, formatDate,
  calculateNights, isValidEmail, isValidPhone, generateBookingSummary
} from '../../services/booking.service'
import { useAuth } from '../../context/AuthContext'
import dayjs from 'dayjs'
import './BookingModal.css'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

const BookingModal = ({ 
  visible, 
  onCancel, 
  roomType, 
  onSuccess 
}) => {
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [tempBookingKey, setTempBookingKey] = useState(null)
  const [bookingData, setBookingData] = useState(null)
  const [services, setServices] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoInfo, setPromoInfo] = useState(null)
  const [paymentUrl, setPaymentUrl] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Steps configuration
  const steps = [
    {
      title: 'Thông tin đặt phòng',
      icon: <CalendarOutlined />
    },
    {
      title: 'Dịch vụ bổ sung',
      icon: <GiftOutlined />
    },
    {
      title: 'Xác nhận & Thanh toán',
      icon: <CreditCardOutlined />
    }
  ]

  // Load services when modal opens
  useEffect(() => {
    if (visible && roomType) {
      loadServices()
    }
  }, [visible, roomType])

  // Load available services
  const loadServices = async () => {
    try {
      const response = await getServices({ 
        hotel_id: roomType.hotel_id || 1,
        is_available: true 
      })
      setServices(response.services || response || [])
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }

  // Handle step 1: Create temp booking
  const handleStep1Next = async () => {
    try {
      const values = await form.validateFields(['dateRange', 'guests'])
      
      const checkIn = values.dateRange[0].format('YYYY-MM-DD')
      const checkOut = values.dateRange[1].format('YYYY-MM-DD')
      const nights = calculateNights(checkIn, checkOut)
      
      setLoading(true)
      
      const tempBookingData = {
        room_type_id: roomType.room_type_id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        num_person: values.guests.adults + (values.guests.children || 0)
      }

      const response = await createTempBooking(tempBookingData)
      
      if (response.temp_booking_key) {
        setTempBookingKey(response.temp_booking_key)
        setBookingData({
          ...response.booking_data,
          check_in_date: checkIn,
          check_out_date: checkOut,
          nights: nights
        })
        setCurrentStep(1)
        message.success('Tạo booking tạm thời thành công!')
      }
    } catch (error) {
      console.error('Error creating temp booking:', error)
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo booking!')
    } finally {
      setLoading(false)
    }
  }

  // Handle step 2: Add services
  const handleStep2Next = async () => {
    try {
      if (selectedServices.length === 0) {
        setCurrentStep(2)
        return
      }

      setLoading(true)
      
      // Add each selected service
      for (const service of selectedServices) {
        await addServiceToTempBooking({
          temp_booking_key: tempBookingKey,
          service_id: service.service_id,
          quantity: service.quantity,
          payment_type: service.payment_type
        })
      }
      
      setCurrentStep(2)
      message.success('Thêm dịch vụ thành công!')
    } catch (error) {
      console.error('Error adding services:', error)
      message.error('Có lỗi xảy ra khi thêm dịch vụ!')
    } finally {
      setLoading(false)
    }
  }

  // Handle promotion code validation
  const handlePromoCodeChange = async (code) => {
    setPromoCode(code)
    if (code && code.length >= 3) {
      try {
        const response = await validatePromotionCode(code)
        if (response.promotion) {
          setPromoInfo(response.promotion)
          message.success('Mã khuyến mãi hợp lệ!')
        }
      } catch (error) {
        setPromoInfo(null)
        if (error.response?.status !== 404) {
          message.error('Mã khuyến mãi không hợp lệ!')
        }
      }
    } else {
      setPromoInfo(null)
    }
  }

  // Handle payment
  const handlePayment = async () => {
    try {
      setPaymentLoading(true)
      
      const response = await createPaymentLink({
        temp_booking_key: tempBookingKey,
        promotion_code: promoCode || null
      })
      
      if (response.payment_url) {
        setPaymentUrl(response.payment_url)
        
        // Open payment URL in new tab
        window.open(response.payment_url, '_blank')
        
        message.success('Đang chuyển hướng đến trang thanh toán...')
        
        // Close modal after successful payment initiation
        setTimeout(() => {
          onSuccess?.(response)
          onCancel()
        }, 2000)
      }
    } catch (error) {
      console.error('Error creating payment link:', error)
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo link thanh toán!')
    } finally {
      setPaymentLoading(false)
    }
  }

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!bookingData) return 0
    
    let total = bookingData.total_price || 0
    
    // Add services
    selectedServices.forEach(service => {
      if (service.payment_type === 'prepaid') {
        total += service.total_price
      }
    })
    
    // Apply promotion discount
    if (promoInfo) {
      if (promoInfo.discount_type === 'percentage') {
        total = total * (1 - promoInfo.amount / 100)
      } else {
        total = Math.max(0, total - promoInfo.amount)
      }
    }
    
    return total
  }

  // Handle service selection
  const handleServiceToggle = (service, checked) => {
    if (checked) {
      setSelectedServices([...selectedServices, {
        ...service,
        quantity: 1,
        payment_type: 'prepaid',
        total_price: service.price
      }])
    } else {
      setSelectedServices(selectedServices.filter(s => s.service_id !== service.service_id))
    }
  }

  const handleServiceQuantityChange = (serviceId, quantity) => {
    setSelectedServices(selectedServices.map(s => 
      s.service_id === serviceId 
        ? { ...s, quantity, total_price: s.unit_price * quantity }
        : s
    ))
  }

  const handleServicePaymentTypeChange = (serviceId, paymentType) => {
    setSelectedServices(selectedServices.map(s => 
      s.service_id === serviceId 
        ? { ...s, payment_type: paymentType }
        : s
    ))
  }

  // Reset modal state
  const handleCancel = () => {
    setCurrentStep(0)
    setTempBookingKey(null)
    setBookingData(null)
    setSelectedServices([])
    setPromoCode('')
    setPromoDiscount(0)
    setPromoInfo(null)
    setPaymentUrl(null)
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={
        <div className="booking-modal-header">
          <Title level={3} style={{ margin: 0 }}>
            <CalendarOutlined /> Đặt phòng {roomType?.room_type_name}
          </Title>
          <Text type="secondary">Hoàn tất đặt phòng trong 3 bước đơn giản</Text>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={900}
      footer={null}
      destroyOnClose
      className="booking-modal"
    >
      <div className="booking-modal-content">
        {/* Progress Steps */}
        <Steps current={currentStep} className="booking-steps">
          {steps.map((step, index) => (
            <Steps.Step
              key={index}
              title={step.title}
              icon={step.icon}
              status={index < currentStep ? 'finish' : index === currentStep ? 'process' : 'wait'}
            />
          ))}
        </Steps>

        <Divider />

        {/* Step 1: Booking Information */}
        {currentStep === 0 && (
          <div className="booking-step">
            <Title level={4}>Thông tin đặt phòng</Title>
            
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                guests: { adults: 2, children: 0 }
              }}
            >
              <Row gutter={16}>
                <Col span={24}>
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
                </Col>
              </Row>

              <Row gutter={16}>
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

              {/* Room Type Summary */}
              <Card className="room-summary-card">
                <Row gutter={16} align="middle">
                  <Col span={6}>
                    <img 
                      src={roomType?.images?.[0] || '/placeholder-room.jpg'} 
                      alt={roomType?.room_type_name}
                      className="room-summary-image"
                    />
                  </Col>
                  <Col span={18}>
                    <Title level={5}>{roomType?.room_type_name}</Title>
                    <Paragraph type="secondary">
                      {roomType?.description}
                    </Paragraph>
                    <Space>
                      <Tag icon={<UserOutlined />}>{roomType?.capacity} người</Tag>
                      <Tag icon={<CalendarOutlined />}>{roomType?.area}</Tag>
                    </Space>
                  </Col>
                </Row>
              </Card>

              <div className="step-actions">
                <Button size="large" onClick={handleCancel}>
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={handleStep1Next}
                  loading={loading}
                >
                  Tiếp theo
                </Button>
              </div>
            </Form>
          </div>
        )}

        {/* Step 2: Additional Services */}
        {currentStep === 1 && (
          <div className="booking-step">
            <Title level={4}>Dịch vụ bổ sung</Title>
            <Paragraph type="secondary">
              Chọn các dịch vụ bổ sung cho chuyến đi của bạn (tùy chọn)
            </Paragraph>

            <div className="services-list">
              {services.map(service => (
                <Card key={service.service_id} className="service-card">
                  <Row gutter={16} align="middle">
                    <Col span={2}>
                      <Checkbox
                        checked={selectedServices.some(s => s.service_id === service.service_id)}
                        onChange={(e) => handleServiceToggle(service, e.target.checked)}
                      />
                    </Col>
                    <Col span={6}>
                      <img 
                        src={service.images?.[0] || '/placeholder-service.jpg'} 
                        alt={service.name}
                        className="service-image"
                      />
                    </Col>
                    <Col span={8}>
                      <Title level={5}>{service.name}</Title>
                      <Paragraph type="secondary">{service.description}</Paragraph>
                      <Tag color={service.service_type === 'prepaid' ? 'green' : 'orange'}>
                        {service.service_type === 'prepaid' ? 'Trả trước' : 'Trả sau'}
                      </Tag>
                    </Col>
                    <Col span={8}>
                      <div className="service-actions">
                        {selectedServices.some(s => s.service_id === service.service_id) && (
                          <>
                            <div className="quantity-control">
                              <Text>Số lượng:</Text>
                              <InputNumber
                                min={1}
                                max={10}
                                value={selectedServices.find(s => s.service_id === service.service_id)?.quantity || 1}
                                onChange={(value) => handleServiceQuantityChange(service.service_id, value)}
                              />
                            </div>
                            <div className="payment-type">
                              <Text>Thanh toán:</Text>
                              <Radio.Group
                                value={selectedServices.find(s => s.service_id === service.service_id)?.payment_type || 'prepaid'}
                                onChange={(e) => handleServicePaymentTypeChange(service.service_id, e.target.value)}
                              >
                                <Radio value="prepaid">Trả trước</Radio>
                                <Radio value="postpaid">Trả sau</Radio>
                              </Radio.Group>
                            </div>
                          </>
                        )}
                        <div className="service-price">
                          <Text strong className="price-amount">
                            {formatPrice(service.price)}
                          </Text>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>

            <div className="step-actions">
              <Button size="large" onClick={() => setCurrentStep(0)}>
                Quay lại
              </Button>
              <Button 
                type="primary" 
                size="large" 
                onClick={handleStep2Next}
                loading={loading}
              >
                Tiếp theo
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation & Payment */}
        {currentStep === 2 && (
          <div className="booking-step">
            <Title level={4}>Xác nhận & Thanh toán</Title>

            <Row gutter={24}>
              {/* Booking Summary */}
              <Col span={12}>
                <Card title="Tóm tắt đặt phòng" className="summary-card">
                  <div className="booking-summary">
                    <div className="summary-item">
                      <Text strong>Phòng:</Text>
                      <Text>{roomType?.room_type_name}</Text>
                    </div>
                    <div className="summary-item">
                      <Text strong>Ngày:</Text>
                      <Text>
                        {bookingData?.check_in_date && formatDate(bookingData.check_in_date)} - {' '}
                        {bookingData?.check_out_date && formatDate(bookingData.check_out_date)}
                      </Text>
                    </div>
                    <div className="summary-item">
                      <Text strong>Số đêm:</Text>
                      <Text>{bookingData?.nights} đêm</Text>
                    </div>
                    <div className="summary-item">
                      <Text strong>Số khách:</Text>
                      <Text>{bookingData?.num_person} người</Text>
                    </div>
                  </div>

                  <Divider />

                  <div className="price-breakdown">
                    <div className="price-item">
                      <Text>Giá phòng ({bookingData?.nights} đêm):</Text>
                      <Text>{formatPrice(bookingData?.total_price || 0)}</Text>
                    </div>
                    
                    {selectedServices.filter(s => s.payment_type === 'prepaid').map(service => (
                      <div key={service.service_id} className="price-item">
                        <Text>{service.name} (x{service.quantity}):</Text>
                        <Text>{formatPrice(service.total_price)}</Text>
                      </div>
                    ))}
                    
                    {promoInfo && (
                      <div className="price-item discount">
                        <Text>Giảm giá ({promoInfo.name}):</Text>
                        <Text type="success">
                          -{formatPrice(
                            promoInfo.discount_type === 'percentage' 
                              ? (bookingData?.total_price || 0) * promoInfo.amount / 100
                              : promoInfo.amount
                          )}
                        </Text>
                      </div>
                    )}
                    
                    <Divider />
                    
                    <div className="price-item total">
                      <Text strong>Tổng cộng:</Text>
                      <Text strong className="total-amount">
                        {formatPrice(calculateTotalPrice())}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Payment Form */}
              <Col span={12}>
                <Card title="Thông tin thanh toán" className="payment-card">
                  <Form layout="vertical">
                    <Form.Item label="Mã khuyến mãi">
                      <Input
                        placeholder="Nhập mã khuyến mãi"
                        value={promoCode}
                        onChange={(e) => handlePromoCodeChange(e.target.value)}
                        suffix={
                          <Button 
                            type="text" 
                            icon={<GiftOutlined />}
                            onClick={() => handlePromoCodeChange(promoCode)}
                          />
                        }
                      />
                      {promoInfo && (
                        <Alert
                          message={`Mã khuyến mãi: ${promoInfo.name}`}
                          description={`Giảm ${promoInfo.discount_type === 'percentage' ? promoInfo.amount + '%' : formatPrice(promoInfo.amount)}`}
                          type="success"
                          showIcon
                          style={{ marginTop: 8 }}
                        />
                      )}
                    </Form.Item>

                    <Form.Item label="Phương thức thanh toán">
                      <Radio.Group defaultValue="payos">
                        <Space direction="vertical">
                          <Radio value="payos">
                            <Space>
                              <CreditCardOutlined />
                              Thanh toán online (PayOS)
                            </Space>
                          </Radio>
                          <Radio value="hotel" disabled>
                            <Space>
                              <BankOutlined />
                              Thanh toán tại khách sạn
                            </Space>
                          </Radio>
                        </Space>
                      </Radio.Group>
                    </Form.Item>

                    <Form.Item>
                      <Checkbox defaultChecked>
                        Tôi đồng ý với <a href="/terms" target="_blank">điều khoản và điều kiện</a>
                      </Checkbox>
                    </Form.Item>

                    <Button
                      type="primary"
                      size="large"
                      block
                      onClick={handlePayment}
                      loading={paymentLoading}
                      icon={<CreditCardOutlined />}
                      className="payment-button"
                    >
                      Thanh toán {formatPrice(calculateTotalPrice())}
                    </Button>
                  </Form>
                </Card>
              </Col>
            </Row>

            <div className="step-actions">
              <Button size="large" onClick={() => setCurrentStep(1)}>
                Quay lại
              </Button>
              <Button size="large" onClick={handleCancel}>
                Hủy đặt phòng
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default BookingModal
