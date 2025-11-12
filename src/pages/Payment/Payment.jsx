import React, { useState, useEffect } from 'react'
import { 
  Card, Row, Col, Typography, Space, Divider, 
  Alert, Spin, message, Button
} from 'antd'
import { 
  QrcodeOutlined, CheckCircleOutlined, ClockCircleOutlined,
  SafetyCertificateOutlined, CreditCardOutlined
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import formatPrice from '../../utils/formatPrice'
import './Payment.css'
import QRCode from 'antd/es/qr-code'
const { Title, Text } = Typography
import { calculateNights, checkPaymentStatus, formatDate } from '../../services/booking.service'
import {  getPendingPayment, clearPendingPayment, getRemainingTime, getPendingPaymentByIdentifier, removePendingPayment } from '../../utils/pendingPayment.util'
import { useAuth } from '../../context/AuthContext'
const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  
  const stateData = location.state || {}

  const storedUser = (() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  const userId = user?.user_id || user?.id || storedUser?.user_id || storedUser?.id || storedUser?.userId || null

  const bookingData = (() => {
    let booking = null
    const identifierCandidates = [
      stateData?.tempBookingKey,
      stateData?.orderCode,
      stateData?.bookingCode,
      stateData?.bookingData?.tempBookingKey,
      stateData?.bookingData?.orderCode,
      stateData?.bookingData?.bookingCode
    ].filter(Boolean)

    if (userId && identifierCandidates.length > 0) {
      for (const identifier of identifierCandidates) {
        booking = getPendingPaymentByIdentifier(userId, identifier)
        if (booking) break
      }
    }

    if (!booking && stateData?.bookingData) {
      booking = stateData.bookingData
    }

    if (!booking && userId) {
      booking = getPendingPayment(userId)
    }

    if (!booking) {
      booking = getPendingPayment()
    }

    return booking
  })()
  
  useEffect(() => {
    if (bookingData && bookingData.bookingInfo) {
      // Lưu thông tin thanh toán vào localStorage để khôi phục khi quay lại site
      // Thiết lập thời gian còn lại
      const initialRemain = getRemainingTime()
      setRemainingSeconds(initialRemain)
    } else {
      message.error('Thông tin thanh toán không hợp lệ')
      navigate('/')
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  // Lấy thông tin từ bookingData
  const {
    qrCode,
    paymentUrl,
    bookingCode,
    orderCode,
    amount = 0,
    bookingInfo,
    tempBookingKey,
    promoCode,
    selectedServices = []
  } = bookingData || {}
  
  const nights = bookingInfo ? calculateNights(bookingInfo.checkIn, bookingInfo.checkOut) : 0
  const roomSubtotal = bookingInfo?.roomType?.price_per_night * nights || 0
  const servicesTotal = selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0)
  const totalWithServices = roomSubtotal + servicesTotal

  // Xử lý thanh toán thành công
  const handlePaymentSuccess = async () => {
    if (paymentStatus === 'success') return // Tránh gọi nhiều lần
    
    try {
      setPaymentStatus('success')
      const buyerName = bookingInfo?.customerInfo?.fullName || ''
      const buyerEmail = bookingInfo?.customerInfo?.email || ''
      const res = await checkPaymentStatus(
        {
          orderCode : orderCode,
          status : "PAID",
          buyerName,
          buyerEmail,
        }
      )
      const data = res?.data || res
      if (data?.status === 'success' || data?.statusCode === 200) {
        message.success('Thanh toán thành công!')
        // Xóa booking trong localStorage theo orderCode (ưu tiên) hoặc các identifier khác
        if (userId) {
          // Ưu tiên xóa theo orderCode vì đây là identifier chính xác nhất
          if (orderCode) {
            const removed = removePendingPayment(userId, orderCode)
            if (removed) {
              console.log(`[Payment] Đã xóa booking có orderCode: ${orderCode}`)
            }
          }
          // Xóa theo các identifier khác để đảm bảo (nếu orderCode không tìm thấy)
          if (bookingCode && !orderCode) {
            removePendingPayment(userId, bookingCode)
          }
          if (tempBookingKey && !orderCode && !bookingCode) {
            removePendingPayment(userId, tempBookingKey)
          }
        } else {
          clearPendingPayment()
        }
        setTimeout(() => {
          // Điều hướng sang trang thành công với query params theo yêu cầu
          const successUrl = `/payment/success?code=00&id=${encodeURIComponent(orderCode || bookingCode || tempBookingKey || '')}&cancel=false&status=PAID&orderCode=${encodeURIComponent(orderCode || '')}`
          navigate(successUrl, { replace: true })
        }, 1000)
      } else {
        setPaymentStatus('pending') // Reset về pending nếu không thành công
        message.error('Thanh toán chưa được xác nhận. Vui lòng thử lại.')
      }
    } catch (err) {
      setPaymentStatus('pending') // Reset về pending nếu có lỗi
      message.error('Không thể xác nhận thanh toán. Vui lòng thử lại.')
    }
  }

  return (
    <div className="payment-page-new">
      <div className="container">
        {/* Header */}
        <div className="payment-header-new">
          <Title level={2} style={{ margin: 0, textAlign: 'center' }}>
            Thanh toán đặt phòng
          </Title>
      
        </div>

        <Row gutter={32}>
          {/* Cột trái - QR Code */}
          <Col xs={24} md={10}>
            <Card className="qr-code-card">
              {/* Tạo đồng hồ đếm ngược 30p  */}
              <div className="qr-code-section">
                <Title level={4} style={{ textAlign: 'center', marginTop: '16px' }}>
                  Quét mã QR để thanh toán
                </Title>
                <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginBottom: '24px' }}>
                  Sử dụng ứng dụng ngân hàng để quét và thanh toán
                </Text>
                
                {/* QR Code */}
                {qrCode && paymentStatus !== 'expired' ? (
                  <div className="qr-code-container">
                    <QRCode value={qrCode} />
                  </div>
                ) : (
                  <div className="qr-code-placeholder">
                    <Spin size="large" />
                    <Text type="secondary" style={{ display: 'block', marginTop: '16px' }}>
                      {paymentStatus === 'expired' ? 'Mã QR đã hết hạn. Vui lòng tạo lại đơn thanh toán.' : 'Đang tải mã QR...'}
                    </Text>
                  </div>
                )}
                {/* Status Indicator */}
                <div className="payment-status" style={{ marginTop: '24px' }}>
                  {paymentStatus === 'pending' && (
                    <Alert
                      message="Đang chờ thanh toán"
                      description="Vui lòng quét mã QR và hoàn tất thanh toán"
                      type="info"
                      showIcon
                      icon={<ClockCircleOutlined />}
                    />
                  )}
                  {paymentStatus === 'expired' && (
                    <Alert
                      message="Mã QR đã hết hạn"
                      description="Vui lòng quay lại và tạo lại thanh toán để tiếp tục."
                      type="warning"
                      showIcon
                    />
                  )}
                  {paymentStatus === 'success' && (
                    <Alert
                      message="Thanh toán thành công!"
                      description="Đang chuyển hướng đến trang xác nhận..."
                      type="success"
                      showIcon
                      icon={<CheckCircleOutlined />}
                    />
                  )}
                </div>

                {/* Test Button (Remove in production) */}
                {paymentStatus === 'pending' && (
                  <div style={{ marginTop: '16px' }}>
                    <Button 
                      type="dashed" 
                      block
                      onClick={handlePaymentSuccess}
                      style={{ color: '#52c41a', borderColor: '#52c41a' }}
                    >
                      Test: Đã thanh toán
                    </Button>
                  </div>
                )}

                {/* Security Info */}
                <div className="security-info" style={{ marginTop: '24px' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      <SafetyCertificateOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      Giao dịch được bảo mật bởi PayOS
                    </Text>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      <SafetyCertificateOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      Không lưu trữ thông tin thẻ tín dụng
                    </Text>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>

          {/* Cột phải - Thông tin hóa đơn */}
          <Col xs={24} md={14}>
            <Card className="invoice-card">
              {/* Booking Code */}
              <div className="invoice-section">
                <Text strong style={{ fontSize: '16px' }}>Mã đặt phòng</Text>
                <Text code style={{ fontSize: '18px', color: '#1890ff' }}>
                  {bookingCode || 'Chưa có'}
                </Text>
              </div>

              <Divider />

              {/* Booking Details */}
              {bookingInfo && (
                <>
                  <div className="invoice-section">
                    <Title level={5}>Chi tiết đặt phòng</Title>
                    
                    <div className="invoice-item">
                      <Text type="secondary">Loại phòng:</Text>
                      <Text strong>{bookingInfo.roomType?.room_type_name}</Text>
                    </div>
                    
                    <div className="invoice-item">
                      <Text type="secondary">Check-in:</Text>
                      <Text 
                      strong>{formatDate(bookingInfo.checkIn)}
                      </Text>
                    </div>
                    
                    <div className="invoice-item">
                      <Text type="secondary">Check-out:</Text>
                      <Text strong>{formatDate(bookingInfo.checkOut)}</Text>
                    </div>
                    
                    <div className="invoice-item">
                      <Text type="secondary">Số khách:</Text>
                      <Text strong>
                        {bookingInfo.guests?.adults || 0} người lớn
                        {bookingInfo.guests?.children > 0 && `, ${bookingInfo.guests?.children} trẻ em`}
                      </Text>
                    </div>

                    <div className="invoice-item">
                      <Text type="secondary">Số đêm:</Text>
                      <Text strong>{nights}</Text>
                    </div>
                    <div className="invoice-item">
                      <Text type="secondary">Số phòng:</Text>
                      <Text strong>{bookingInfo.numRooms}</Text>
                    </div>
                  </div>
                  <Divider/>
                </>
              )}

              {/* Services Details */}
              {selectedServices && selectedServices.length > 0 && (
                <>
                  <div className="invoice-section">
                    <Title level={5}>Dịch vụ bổ sung</Title>
                    {selectedServices.map((svc, idx) => (
                      <div className="invoice-item" key={`${svc.service_id || svc.name}-${idx}`}>
                        <Text type="secondary">{svc.name} x {svc.quantity || 1}</Text>
                        <Text>{formatPrice((svc.price || 0) * (svc.quantity || 1))}</Text>
                      </div>
                    ))}
                    <div className="invoice-item">
                      <Text strong>Tổng dịch vụ</Text>
                      <Text strong>{formatPrice(servicesTotal)}</Text>
                    </div>
                  </div>
                  <Divider />
                </>
              )}

              {/* Price Breakdown */}
              <div className="invoice-section">
                <Title level={5}>Chi tiết giá</Title>
                
                <div className="invoice-item">
                  <Text>Phòng</Text>
                  <Text>{formatPrice(bookingInfo?.roomType?.price_per_night || 0)}</Text>
                </div>
                
                <div className="invoice-item">
                  <Text type="secondary">Số đêm: </Text>
                  <Text type="secondary">
                    {nights | 0}
                  </Text>
                </div>

               
                
                <Divider style={{ margin: '16px 0' }} />
                
                <div className="invoice-item total">
                  <Text strong style={{ fontSize: '18px' }}>Khuyến mãi</Text>
                  <Text strong style={{ fontSize: '20px', color: '#1890ff' }}>
                    {formatPrice(totalWithServices || 0)}
                  </Text>
                </div>
                <div className="invoice-item total">
                  <Text strong style={{ fontSize: '18px' }}>Tổng cộng</Text>
                  <Text strong style={{ fontSize: '20px', color: '#1890ff' }}>
                    {formatPrice(totalWithServices || 0)}
                  </Text>
                </div>
              </div>

              <Divider />

              {/* Customer Info */}
              {bookingInfo?.customerInfo && (
                <>
                  <div className="invoice-section">
                    <Title level={5}>Thông tin khách hàng</Title>
                    
                    <div className="invoice-item">
                      <Text type="secondary">Họ tên:</Text>
                      <Text>
                        {bookingInfo.customerInfo.fullName}
                      </Text>
                    </div>
                    
                    <div className="invoice-item">
                      <Text type="secondary">Email:</Text>
                      <Text>{bookingInfo.customerInfo.email}</Text>
                    </div>
                  </div>

                  <Divider />
                </>
              )}

              {/* Payment Info */}
              <div className="invoice-section">
                <Title level={5}>Thông tin thanh toán</Title>
                
                <div className="invoice-item">
                  <Text type="secondary">Mã giao dịch:</Text>
                  <Text code>{orderCode || 'Chưa có'}</Text>
                </div>
                
                <div className="invoice-item">
                  <Text type="secondary">Phương thức:</Text>
                  <Text>Quét QR Code (PayOS)</Text>
                </div>
                
                <div className="invoice-item">
                  <Text type="secondary">Trạng thái:</Text>
                  {paymentStatus === 'pending' && (
                    <Text style={{ color: '#faad14' }}>Đang chờ thanh toán</Text>
                  )}
                  {paymentStatus === 'success' && (
                    <Text style={{ color: '#52c41a' }}>Đã thanh toán</Text>
                  )}
                </div>
              </div>

              {/* Payment Instruction */}
              <Alert
                message="Hướng dẫn thanh toán"
                description={
                  <ol style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                    <li>Quét mã QR code bên trái</li>
                    <li>Xác nhận thanh toán trong ứng dụng</li>
                    <li>Chờ xác nhận tự động</li>
                  </ol>
                }
                type="info"
                showIcon
                style={{ marginTop: '24px' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Payment
