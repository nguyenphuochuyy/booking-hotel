import React from 'react'
import { 
  Card, Row, Col, Button, Typography, Space, Divider, 
  Alert, Result, Tag, Timeline, Steps
} from 'antd'
import { 
  CheckCircleOutlined, HomeOutlined, CalendarOutlined, 
  UserOutlined, CreditCardOutlined, MailOutlined,
  PhoneOutlined, ClockCircleOutlined, GiftOutlined
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { formatPrice, formatDate } from '../../services/booking.service'
import './BookingSuccess.css'

const { Title, Text, Paragraph } = Typography
const { Step } = Steps

const BookingSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const { bookingCode, amount } = location.state || {}

  const handleGoHome = () => {
    navigate('/')
  }

  const handleViewBookings = () => {
    navigate('/user/bookings')
  }

  const handleBookAgain = () => {
    navigate('/hotels')
  }

  return (
    <div className="booking-success">
      <div className="container">
        {/* Success Header */}
        <div className="success-header">
          <Result
            status="success"
            title="Đặt phòng thành công!"
            subTitle={
              <div>
                <Text type="secondary">
                  Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi
                </Text>
                <br />
                <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                  Mã đặt phòng: {bookingCode || 'N/A'}
                </Text>
              </div>
            }
            extra={[
              <Button type="primary" size="large" onClick={handleGoHome} key="home">
                Về trang chủ
              </Button>,
              <Button size="large" onClick={handleViewBookings} key="bookings">
                Xem lịch sử đặt phòng
              </Button>
            ]}
          />
        </div>

        <Row gutter={24}>
          {/* Left Column - Booking Details */}
          <Col xs={24} lg={16}>
            {/* What's Next */}
            <Card title="Bước tiếp theo" className="next-steps-card">
              <Steps
                direction="vertical"
                current={0}
                items={[
                  {
                    title: 'Nhận email xác nhận',
                    description: 'Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn',
                    icon: <MailOutlined />
                  },
                  {
                    title: 'Đến khách sạn',
                    description: 'Vui lòng đến khách sạn đúng giờ check-in với mã đặt phòng',
                    icon: <HomeOutlined />
                  },
                  {
                    title: 'Check-in',
                    description: 'Xuất trình mã đặt phòng tại quầy lễ tân để nhận phòng',
                    icon: <CheckCircleOutlined />
                  },
                  {
                    title: 'Tận hưởng kỳ nghỉ',
                    description: 'Chúc bạn có một kỳ nghỉ tuyệt vời!',
                    icon: <GiftOutlined />
                  }
                ]}
              />
            </Card>

            {/* Important Information */}
            <Card title="Thông tin quan trọng" className="important-info-card">
              <Alert
                message="Lưu ý quan trọng"
                description={
                  <div>
                    <Paragraph>
                      • Vui lòng mang theo giấy tờ tùy thân khi đến nhận phòng
                    </Paragraph>
                    <Paragraph>
                      • Thời gian check-in: 14:00 - 22:00
                    </Paragraph>
                    <Paragraph>
                      • Thời gian check-out: 06:00 - 12:00
                    </Paragraph>
                    <Paragraph>
                      • Nếu có thay đổi về lịch trình, vui lòng liên hệ trước 24h
                    </Paragraph>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Alert
                message="Hỗ trợ khách hàng"
                description={
                  <div>
                    <Space direction="vertical" size="small">
                      <Text>
                        <PhoneOutlined style={{ marginRight: 8 }} />
                        Hotline: 1900-xxxx
                      </Text>
                      <Text>
                        <MailOutlined style={{ marginRight: 8 }} />
                        Email: support@hotelbooking.com
                      </Text>
                      <Text>
                        <ClockCircleOutlined style={{ marginRight: 8 }} />
                        Thời gian hỗ trợ: 24/7
                      </Text>
                    </Space>
                  </div>
                }
                type="success"
                showIcon
              />
            </Card>
          </Col>

          {/* Right Column - Booking Summary */}
          <Col xs={24} lg={8}>
            <Card title="Tóm tắt đặt phòng" className="summary-card">
              <div className="booking-summary">
                <div className="summary-item">
                  <Text strong>Mã đặt phòng:</Text>
                  <Text code>{bookingCode || 'N/A'}</Text>
                </div>
                
                <div className="summary-item">
                  <Text strong>Tổng thanh toán:</Text>
                  <Text strong className="total-amount">
                    {formatPrice(amount)}
                  </Text>
                </div>
                
                <div className="summary-item">
                  <Text strong>Trạng thái:</Text>
                  <Tag color="green">Đã xác nhận</Tag>
                </div>
                
                <div className="summary-item">
                  <Text strong>Phương thức thanh toán:</Text>
                  <Text>PayOS</Text>
                </div>
                
                <Divider />
                
                <div className="summary-item">
                  <Text strong>Thời gian đặt phòng:</Text>
                  <Text>{formatDate(new Date())}</Text>
                </div>
              </div>

              <Divider />

              <div className="action-buttons">
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleBookAgain}
                  className="book-again-button"
                >
                  Đặt phòng khác
                </Button>
                
                <Button
                  size="large"
                  block
                  onClick={handleViewBookings}
                  style={{ marginTop: 8 }}
                >
                  Xem lịch sử đặt phòng
                </Button>
              </div>

              <div className="security-info">
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">
                  Thông tin đặt phòng đã được bảo mật
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default BookingSuccess

