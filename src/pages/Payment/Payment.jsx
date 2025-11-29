import React, { useState, useEffect } from 'react'
import { 
  Card, Row, Col, Typography, Space, Divider, 
  Alert, Spin, message, Button, Steps, Tag
} from 'antd'
import { 
  QrcodeOutlined, CheckCircleOutlined, ClockCircleOutlined,
  SafetyCertificateOutlined, HomeOutlined, SolutionOutlined, CreditCardOutlined,
  ScanOutlined, CopyOutlined , UserOutlined
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import QRCode from 'antd/es/qr-code'
import formatPrice from '../../utils/formatPrice'
import { calculateNights, checkPaymentStatus, findBookingByCode, formatDate } from '../../services/booking.service'
import { getPendingPayment, clearPendingPayment, getRemainingTime, getPendingPaymentByIdentifier, removePendingPayment } from '../../utils/pendingPayment.util'
import { useAuth } from '../../context/AuthContext'
import './Payment.css'

const { Title, Text } = Typography

const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [remainingSeconds, setRemainingSeconds] = useState(1800) 
  
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

    if (!booking && stateData?.bookingData) booking = stateData.bookingData
    if (!booking && userId) booking = getPendingPayment(userId)
    if (!booking) booking = getPendingPayment()

    return booking
  })()
  
  useEffect(() => {
    if (bookingData && bookingData.bookingInfo) {
      if (bookingData.expiresAt) {
        const now = Date.now()
        const expiry = typeof bookingData.expiresAt === 'string' 
          ? new Date(bookingData.expiresAt).getTime() 
          : bookingData.expiresAt
        const remaining = Math.max(Math.floor((expiry - now) / 1000), 0)
        if (remaining > 0) {
          setRemainingSeconds(remaining)
          return
        }
      }
      
      const initialRemain = getRemainingTime()
      if (initialRemain > 0) {
        setRemainingSeconds(initialRemain)
      } else {
        if (bookingData.createdAt) {
          const createdAt = typeof bookingData.createdAt === 'string'
            ? new Date(bookingData.createdAt).getTime()
            : bookingData.createdAt
          const now = Date.now()
          const elapsed = Math.floor((now - createdAt) / 1000)
          const remaining = Math.max(1800 - elapsed, 0)
          setRemainingSeconds(remaining)
        } else {
          setRemainingSeconds(1800)
        }
      }
    } else {
      message.error('Thông tin thanh toán không hợp lệ')
      navigate('/')
    }
  }, [])
 
   // đếm ngược thời gian thanh toán
  useEffect(() => {
    if (remainingSeconds <= 0 || paymentStatus !== 'pending') {
      if (remainingSeconds <= 0 && paymentStatus === 'pending') {
        setPaymentStatus('expired')
      }
      return
    }

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          setPaymentStatus('expired')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [remainingSeconds, paymentStatus])
 

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const {
    qrCode,
    bookingCode,
    orderCode,
    bookingInfo,
    tempBookingKey,
    selectedServices = []
  } = bookingData || {}
 
  
  const attachRoomTypeData = (bookingRecord) => {
    if (!bookingRecord) return bookingRecord
    if (bookingRecord.room_type && bookingRecord.room_type.images && bookingRecord.room_type.images.length > 0) {
      return bookingRecord
    }
    if (!bookingInfo?.roomType) return bookingRecord
    return {
      ...bookingRecord,
      room_type: {
        ...bookingInfo.roomType,
        ...bookingRecord.room_type,
        images: (bookingRecord.room_type?.images && bookingRecord.room_type.images.length > 0)
          ? bookingRecord.room_type.images
          : (bookingInfo.roomType.images || [])
      }
    }
  }
  
  const nights = bookingInfo ? calculateNights(bookingInfo.checkIn, bookingInfo.checkOut) : 0
  const numRooms = bookingInfo?.numRooms || 1
  const roomSubtotal = (bookingInfo?.roomType?.price_per_night || 0) * nights * numRooms
  const servicesTotal = selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0)
  const totalWithServices = roomSubtotal + servicesTotal

  // --- CẬP NHẬT 1: POLLING TỰ ĐỘNG ---
  useEffect(() => {
    if (!bookingCode || paymentStatus === 'success') return
    const checkBookingStatus = async () => {
      try {
        const response = await findBookingByCode(bookingCode)
        const booking = response?.booking || response?.data?.booking
        
        if (booking) {
          const normalizedBooking = attachRoomTypeData(booking)
          setPaymentStatus('success')
          
          if (userId) {
            if (orderCode) removePendingPayment(userId, orderCode)
            if (bookingCode) removePendingPayment(userId, bookingCode)
            if (tempBookingKey) removePendingPayment(userId, tempBookingKey)
          } else {
            clearPendingPayment()
          }
          
          setTimeout(() => {
            const successUrl = `/payment/success?code=00&id=${encodeURIComponent(orderCode || bookingCode || tempBookingKey || '' || normalizedBooking?.booking_code || '')}&cancel=false&status=PAID&orderCode=${encodeURIComponent(orderCode || '')}`
            navigate(successUrl, { 
              replace: true,
              state: { booking: normalizedBooking }
            })
          }, 1500)
        }
      } catch (error) {}
    }

    checkBookingStatus()
    const intervalId = setInterval(checkBookingStatus, 5000)
    return () => clearInterval(intervalId)
  }, [bookingCode, paymentStatus, orderCode, tempBookingKey, userId])

  // --- CẬP NHẬT 2: NÚT TEST / FALLBACK ---
  const handlePaymentSuccess = async () => {
    if (paymentStatus === 'success') return
    try {
      if (bookingCode) {
        try {
          const response = await findBookingByCode(bookingCode)
          const booking = response?.booking || response?.data?.booking
          if (booking) {
            const normalizedBooking = attachRoomTypeData(booking)
            setPaymentStatus('success')
            if (userId) {
              if (orderCode) removePendingPayment(userId, orderCode)
              if (bookingCode) removePendingPayment(userId, bookingCode)
              if (tempBookingKey) removePendingPayment(userId, tempBookingKey)
            } else {
              clearPendingPayment()
            }
     
            const successUrl = `/payment/success?code=00&id=${encodeURIComponent(orderCode || bookingCode || tempBookingKey || '' || normalizedBooking?.booking_code || '')}&cancel=false&status=PAID&orderCode=${encodeURIComponent(orderCode || '')}`
            navigate(successUrl, { 
              replace: true,
              state: { booking: normalizedBooking }
            })
            return
          }
        } catch (error) {}
      }
      
      // Fallback cũ nếu không tìm thấy booking qua bookingCode (ít xảy ra)
      const buyerName = bookingInfo?.customerInfo?.fullName || ''
      const buyerEmail = bookingInfo?.customerInfo?.email || ''
      const res = await checkPaymentStatus({
        orderCode : orderCode,
        status : "PAID",
        buyerName,
        buyerEmail,
      })
      const data = res?.data || res
      if (data?.status === 'success' || data?.statusCode === 200) {
        if (userId) {
          if (orderCode) removePendingPayment(userId, orderCode)
          if (bookingCode && !orderCode) removePendingPayment(userId, bookingCode)
          if (tempBookingKey && !orderCode && !bookingCode) removePendingPayment(userId, tempBookingKey)
        } else {
          clearPendingPayment()
        }
        const tempSuccessData = {
          booking_code: bookingCode || 'PROCESSING',
          room_type: bookingInfo?.roomType || {},
          check_in_date: bookingInfo?.checkIn,
          check_out_date: bookingInfo?.checkOut,
          num_rooms: bookingInfo?.numRooms,
          num_person: (bookingInfo?.guests?.adults || 0) + (bookingInfo?.guests?.children || 0),
          final_price: totalWithServices, // Biến đã tính ở trên
          total_price: totalWithServices,
          customer_name: bookingInfo?.customerInfo?.fullName,
          customer_email: bookingInfo?.customerInfo?.email,
          booking_services: selectedServices.map(s => ({
              service: { name: s.name },
              quantity: s.quantity,
              total_price: s.price * s.quantity
          }))
      }
         // Lưu ý: Ở đây không có object `booking` đầy đủ, trang success sẽ phải tự fetch
         setTimeout(() => {
            const successUrl = `/payment/success?code=00&cancel=false&status=PAID&orderCode=${encodeURIComponent(orderCode || '')}`
            navigate(successUrl, { replace: true, state: { booking: tempSuccessData } })
         }, 500)

      } else {
        message.error('Thanh toán chưa được xác nhận. Vui lòng thử lại.')
      }
    } catch (err) {
      message.error('Không thể xác nhận thanh toán. Vui lòng thử lại.')
    }
  }

  return (
    // ... (Giữ nguyên phần JSX hiển thị giao diện thanh toán như code bạn gửi)
    <div className="luxury-payment-page">
      <div className="luxury-container">
        <div className="steps-wrapper">
          <Steps 
            current={2} 
            items={[
              { title: 'Chọn phòng', icon: <HomeOutlined /> },
              { title: 'Thông tin & Dịch vụ', icon: <SolutionOutlined /> },
              { title: 'Thanh toán', icon: <CreditCardOutlined /> },
            ]} 
          />
        </div>

        <div className="payment-header">
          <Title level={2}>Cổng thanh toán an toàn</Title>
          <Text type="secondary">Hoàn tất giao dịch để giữ phòng của bạn</Text>
        </div>

        <Row gutter={40} align="stretch">
          <Col xs={24} md={13}>
            <Card className="luxury-card payment-zone-card" bordered={false}>
              <div className="payment-zone-header">
                <div className="method-badge">
                  <ScanOutlined /> PayOS QR
                </div>
                <div className={`timer-badge ${remainingSeconds <= 300 ? 'urgent' : ''}`}>
                  <ClockCircleOutlined /> {formatCountdown(remainingSeconds)}
                </div>
              </div>

              <div className="qr-display-area">
                {qrCode && paymentStatus !== 'expired' ? (
                  <>
                    <div className="qr-frame">
                      <QRCode 
                        value={qrCode} 
                        size={220} 
                        iconSize={40}
                        errorLevel="H"
                        style={{ padding: 10, background: 'white', borderRadius: 8 }}
                      />
                      <div className="scan-line"></div>
                    </div>
                    <Text className="scan-instruction">
                      Mở ứng dụng ngân hàng <br/> và quét mã để thanh toán
                    </Text>
                  </>
                ) : (
                  <div className="qr-placeholder">
                    <Spin size="large" />
                    <Text>{paymentStatus === 'expired' ? 'Mã QR đã hết hạn' : 'Đang tạo mã QR...'}</Text>
                  </div>
                )}
              </div>

              <div className="status-area">
                {paymentStatus === 'pending' && (
                  <Alert
                    message="Đang chờ thanh toán..."
                    description="Giao dịch sẽ tự động được xác nhận sau khi bạn chuyển khoản."
                    type="info"
                    showIcon
                    className="luxury-alert"
                  />
                )}
                {paymentStatus === 'expired' && (
                  <Alert
                    message="Đơn hàng đã hết hạn"
                    description="Vui lòng thực hiện lại quy trình đặt phòng."
                    type="error"
                    showIcon
                    className="luxury-alert"
                  />
                )}
                {paymentStatus === 'success' && (
                  <Alert
                    message="Thanh toán thành công!"
                    type="success"
                    showIcon
                    className="luxury-alert"
                  />
                )}
              </div>

              {paymentStatus === 'pending' && (
                <Button 
                  type="dashed" 
                  block 
                  onClick={handlePaymentSuccess}
                  className="test-btn"
                >
                  (Test) Giả lập đã thanh toán
                </Button>
              )}

              <div className="security-badges">
                <Space size="large">
                  <span className="sec-item"><SafetyCertificateOutlined /> Bảo mật tuyệt đối</span>
                  <span className="sec-item"><CreditCardOutlined /> Không lưu thẻ</span>
                </Space>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={11}>
            <div className="receipt-wrapper">
              <Card className="luxury-card receipt-card" bordered={false}>
                <div className="receipt-header">
                  <Title level={4}>HÓA ĐƠN TẠM TÍNH</Title>
                  <Text type="secondary">Mã đặt phòng: <strong className="code-highlight">{bookingCode || '---'}</strong></Text>
                </div>
                
                <div className="zigzag-divider"></div>

                <div className="receipt-body">
                  
                  {/* User & Room Info */}
                  <div className="receipt-section">
                    <div className="receipt-row">
                      <span className="label">Khách hàng</span>
                      <span className="value">{bookingInfo?.customerInfo?.fullName}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="label">Email</span>
                      <span className="value">{bookingInfo?.customerInfo?.email}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="label">Loại phòng</span>
                      <span className="value highlight">{bookingInfo?.roomType?.room_type_name}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="label">Nhận phòng - Trả phòng</span>
                      <span className="value">
                        {formatDate(bookingInfo?.checkIn)} - {formatDate(bookingInfo?.checkOut)}
                      </span>
                    </div>
                    <div className="receipt-row">
                      <span className="label">Thời lượng</span>
                      <span className="value">{bookingInfo?.numRooms} phòng &times; {nights} đêm</span>
                    </div>
                  </div>

                  <Divider className="light-divider" />

                  <div className="receipt-section">
                    <div className="receipt-row">
                      <span className="label">Giá phòng</span>
                      <span className="value">{formatPrice(roomSubtotal)}</span>
                    </div>
                    
                    {selectedServices.length > 0 && (
                      <div className="receipt-services">
                        <div className="service-header">Dịch vụ bổ sung:</div>
                        {selectedServices.map((svc, idx) => (
                          <div key={idx} className="receipt-row sub-row">
                            <span className="label">• {svc.name} (x{svc.quantity})</span>
                            <span className="value">{formatPrice(svc.price * svc.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Divider className="bold-divider" />

                  <div className="receipt-total">
                    <span>TỔNG THANH TOÁN</span>
                    <span className="total-amount">{formatPrice(totalWithServices)}</span>
                  </div>
                  
                 
                </div>
                <div className="receipt-footer">
                  <Text type="secondary" style={{fontSize: 12}}>Cảm ơn bạn đã lựa chọn Bean Hotel</Text>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Payment