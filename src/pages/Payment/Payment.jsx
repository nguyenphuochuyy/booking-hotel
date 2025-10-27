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
import { checkPaymentStatus } from '../../services/booking.service'
const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [paymentStatus, setPaymentStatus] = useState('pending')
  
  const bookingData = location.state
  
  if (!bookingData) {
    message.error('Thông tin thanh toán không hợp lệ')
    navigate('/')
    return null
  }

  // Lấy thông tin từ bookingData
  const {
    qrCode,
    paymentUrl,
    bookingCode,
    orderCode,
    amount,
    bookingInfo
  } = bookingData
  const OrderCode = orderCode
  const status = 'PAID'
  const buyerName = bookingInfo.customerInfo.firstName + ' ' + bookingInfo.customerInfo.lastName
  const buyerEmail = bookingInfo.customerInfo.email
  // Xử lý thanh toán thành công
  const handlePaymentSuccess = async () => {
    const checkPaymentStatusResponse = await checkPaymentStatus({
      OrderCode,
      status,
      buyerName,
      buyerEmail
    })
    console.log(checkPaymentStatusResponse)
    // Chuyển sang trang thành công sau 2 giây
    setTimeout(() => {
      navigate('/booking-success', {
        state: {
          bookingCode,
          amount
        }
      })
    }, 2000)
  }

  // Polling để kiểm tra trạng thái thanh toán
  useEffect(() => {
    console.log(OrderCode, status, buyerName, buyerEmail);
    

    return () => {
      // Cleanup if needed
    }
  }, [])
  return (
    <div className="payment-page-new">
      <div className="container">
        {/* Header */}
        <div className="payment-header-new">
          <Title level={2} style={{ margin: 0, textAlign: 'center' }}>
            <CreditCardOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Thanh toán đặt phòng
          </Title>
          <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: '8px' }}>
            Quét mã QR để hoàn tất thanh toán
          </Text>
        </div>

        <Row gutter={32}>
          {/* Cột trái - QR Code */}
          <Col xs={24} md={10}>
            <Card className="qr-code-card">
              <div className="qr-code-section">
                <QrcodeOutlined className="qr-icon" />
                <Title level={4} style={{ textAlign: 'center', marginTop: '16px' }}>
                  Quét mã QR để thanh toán
                </Title>
                <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginBottom: '24px' }}>
                  Sử dụng ứng dụng ngân hàng để quét và thanh toán
                </Text>
                
                {/* QR Code */}
                {qrCode ? (
                  <div className="qr-code-container">
                    <QRCode value={qrCode} />
                  </div>
                ) : (
                  <div className="qr-code-placeholder">
                    <Spin size="large" />
                    <Text type="secondary" style={{ display: 'block', marginTop: '16px' }}>
                      Đang tải mã QR...
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
            <Card className="invoice-card" title="Thông tin thanh toán">
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
                      <Text strong>{bookingInfo.checkIn}</Text>
                    </div>
                    
                    <div className="invoice-item">
                      <Text type="secondary">Check-out:</Text>
                      <Text strong>{bookingInfo.checkOut}</Text>
                    </div>
                    
                    <div className="invoice-item">
                      <Text type="secondary">Số khách:</Text>
                      <Text strong>
                        {bookingInfo.guests?.adults || 0} người lớn
                        {bookingInfo.guests?.children > 0 && `, ${bookingInfo.guests?.children} trẻ em`}
                      </Text>
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
                  <Text type="secondary">Thuế (10%)</Text>
                  <Text type="secondary">
                    {formatPrice((amount || 0) * 0.1)}
                  </Text>
                </div>
                
                <Divider style={{ margin: '16px 0' }} />
                
                <div className="invoice-item total">
                  <Text strong style={{ fontSize: '18px' }}>Tổng cộng</Text>
                  <Text strong style={{ fontSize: '20px', color: '#1890ff' }}>
                    {formatPrice(amount || 0)}
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
                        {bookingInfo.customerInfo.firstName} {bookingInfo.customerInfo.lastName}
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
