import React, { useState, useEffect } from 'react'
import { 
  Card, Button, Typography, Space, Divider, 
  Alert, Result, Tag, Spin, message
} from 'antd'
import { 
  CheckCircleOutlined, CloseCircleOutlined, HomeOutlined
} from '@ant-design/icons'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  getBookingById, 
  formatPrice, 
  formatDate, 
  calculateNights,
  downloadInvoicePDF,
  getPaymentStatusText,
  getPaymentStatusColor,
  getUserBookings
} from '../../services/booking.service'
import httpClient from '../../services/httpClient'
import { getPendingPayment, clearPendingPayment, removePendingPayment, getAllPendingPayments } from '../../utils/pendingPayment.util'
import './PaymentSuccess.css'

const { Title, Text } = Typography

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState(null)

  // Parse query params từ URL
  const code = searchParams.get('code')
  const id = searchParams.get('id')
  const cancel = searchParams.get('cancel')
  const status = searchParams.get('status')
  const orderCode = searchParams.get('orderCode')

  // Xác định trạng thái thanh toán
  const isSuccess = code === '00' && status === 'PAID' && cancel === 'false'
  const isFailed = code !== '00' || status !== 'PAID' || cancel === 'true'

  useEffect(() => {
    fetchBookingData()
  }, [orderCode])

  // Tìm booking theo orderCode
  const fetchBookingData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Thử lấy booking_code từ localStorage (nếu có)
      const pendingPayment = getPendingPayment()
      const bookingCode = pendingPayment?.bookingCode || null

      // Nếu có bookingCode, tìm booking theo code bằng API findBookingByCode
      if (bookingCode) {
        try {
          const response = await httpClient.get(`/bookings/code/${bookingCode}`)
          const bookingData = response?.booking || response?.data?.booking
          
          if (bookingData) {
            // Lấy chi tiết đầy đủ booking bằng ID
            try {
              const bookingDetail = await getBookingById(bookingData.booking_id)
              setBooking(bookingDetail?.booking || bookingDetail || bookingData)
            } catch (err) {
              // Nếu không lấy được chi tiết, dùng dữ liệu từ findBookingByCode
              setBooking(bookingData)
            }
            // Xóa pendingPayment và temp booking sau khi lấy được booking
            clearPendingPayment()
            
            // Xóa temp booking từ danh sách theo userId
            const bookingCode = pendingPayment?.bookingCode || bookingData?.booking_code
            const orderCode = pendingPayment?.orderCode || bookingData?.payos_order_code
            const tempBookingKey = pendingPayment?.tempBookingKey
            
            // Lấy userId từ pendingPayment, user context hoặc từ localStorage
            const userId = pendingPayment?.userId || user?.user_id || user?.id || null
            if (userId && (bookingCode || orderCode || tempBookingKey)) {
              // Xóa temp booking theo bookingCode, orderCode hoặc tempBookingKey
              if (bookingCode) {
                removePendingPayment(userId, bookingCode)
              }
              if (orderCode) {
                removePendingPayment(userId, orderCode)
              }
              if (tempBookingKey) {
                removePendingPayment(userId, tempBookingKey)
              }
            }
            
            // Xóa temp booking cũ (tương thích ngược)
            localStorage.removeItem('temp_booking_key')
            localStorage.removeItem('temp_booking_info')
            return
          }
        } catch (err) {
          console.error('Error fetching booking by code:', err)
          // Tiếp tục tìm bằng cách khác
        }
      }

      // Nếu không tìm thấy bằng bookingCode, thử lấy từ danh sách bookings và tìm theo payment transaction_id
      try {
        const response = await getUserBookings({ limit: 100 }) // Lấy nhiều bookings để tìm
        const bookings = response?.bookings || response?.data?.bookings || []
        
        // Tìm booking có payment với transaction_id = orderCode
        for (const b of bookings) {
          try {
            const bookingDetail = await getBookingById(b.booking_id)
            const payments = bookingDetail?.booking?.payments || []
            const payment = payments.find(p => p.transaction_id === orderCode || p.transaction_id === orderCode?.toString())
            
            if (payment) {
              setBooking(bookingDetail?.booking || bookingDetail)
              clearPendingPayment(user?.user_id)
              
              // Xóa temp booking từ danh sách theo userId và orderCode
              const userId = user?.user_id || user?.id || null
              if (userId && orderCode) {
                removePendingPayment(userId, orderCode)
              }
              
              // Xóa temp booking cũ (tương thích ngược)
              localStorage.removeItem('temp_booking_key')
              localStorage.removeItem('temp_booking_info')
              return
            }
          } catch (err) {
            console.error('Error checking booking:', err)
          }
        }
      } catch (err) {
        console.error('Error fetching bookings:', err)
      }

      // Nếu không tìm thấy booking, vẫn hiển thị thông tin thanh toán từ query params
      // Không set error để vẫn hiển thị thông tin thanh toán
    } catch (err) {
      console.error('Error fetching booking data:', err)
      setError('Không thể tải thông tin đặt phòng. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  // Xử lý tải hóa đơn PDF
  const handleDownloadInvoice = async () => {
    if (!booking?.booking_id) {
      message.warning('Không có thông tin đặt phòng để tải hóa đơn')
      return
    }

    try {
      message.loading({ content: 'Đang tải hóa đơn...', key: 'downloadInvoice' })
      const blob = await downloadInvoicePDF(booking.booking_id)
      // Tạo URL và tải file
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hoa-don-${booking.booking_code || booking.booking_id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      message.success({ content: 'Đã tải hóa đơn thành công!', key: 'downloadInvoice' })
    } catch (err) {
      console.error('Error downloading invoice:', err)
      message.error({ content: 'Không thể tải hóa đơn. Vui lòng thử lại.', key: 'downloadInvoice' })
    }
  }

  // Xử lý in hóa đơn
  const handlePrintInvoice = async () => {
    if (!booking?.booking_id) {
      message.warning('Không có thông tin đặt phòng để in hóa đơn')
      return
    }

    try {
      message.loading({ content: 'Đang tải hóa đơn...', key: 'printInvoice' })
      const blob = await downloadInvoicePDF(booking.booking_id)
      
      // Tạo URL và mở cửa sổ in
      const url = window.URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
      
      message.success({ content: 'Đã mở cửa sổ in!', key: 'printInvoice' })
    } catch (err) {
      console.error('Error printing invoice:', err)
      message.error({ content: 'Không thể in hóa đơn. Vui lòng thử lại.', key: 'printInvoice' })
    }
  }

  const handleGoHome = () => {
    // Nếu tab này được mở từ window.open (tab thanh toán)
    if (window.opener && !window.opener.closed) {
      // Focus và navigate tab gốc về trang chủ
      window.opener.location.href = '/'
      window.opener.focus()
      // Đóng tab thanh toán hiện tại
      window.close()
    } else {
      // Nếu không phải tab mới, navigate bình thường
      navigate('/')
    }
  }

  const handleViewBookings = () => {
    navigate('/user/bookings')
  }

  // Tính toán các giá trị
  const nights = booking ? calculateNights(booking.check_in_date, booking.check_out_date) : 0
  const services = booking?.booking_services || booking?.services || []
  const servicesTotal = services.reduce((sum, s) => sum + (Number(s.total_price) || 0), 0)
  const roomPrice = booking?.room_type?.price_per_night || 0
  const roomTotal = roomPrice * nights * (booking?.num_rooms || 1)
  const totalPrice = booking?.final_price || booking?.total_price || (roomTotal + servicesTotal)

  if (loading) {
    return (
      <div className="payment-success-page">
        <div className="container">
          <Spin size="large" tip="Đang tải thông tin thanh toán..." />
        </div>
      </div>
    )
  }

  return (
    <div className="payment-success-page">
      <div className="container">
        {/* Payment Status Header */}
        <div className="payment-status-header">
          {isSuccess ? (
            <Result
              status="success"
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              title="Thanh toán thành công!"
              subTitle={
                <div>
                  <Text type="secondary">
                    Giao dịch của bạn đã được xử lý thành công
                  </Text>
                  {orderCode && (
                    <>
                      <br />
                      <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                        Mã giao dịch: {orderCode}
                      </Text>
                    </>
                  )}
                </div>
              }
            />
          ) : (
            <Result
              status="error"
              icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              title="Thanh toán không thành công"
              subTitle={
                <div>
                  <Text type="secondary">
                    Giao dịch của bạn không thể hoàn tất
                  </Text>
                  {orderCode && (
                    <>
                      <br />
                      <Text strong style={{ fontSize: 16 }}>
                        Mã giao dịch: {orderCode}
                      </Text>
                    </>
                  )}
                </div>
              }
            />
          )}
        </div>

        {error && !booking && (
          <Alert
            message="Thông báo"
            description={error}
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {booking && (
          <Card className="booking-info-card">
            <div className="booking-info-content">
              <div className="info-row">
                <Text type="secondary">Mã đặt phòng:</Text>
                <Text code strong style={{ fontSize: 16 }}>
                  {booking.booking_code}
                </Text>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <div className="info-row">
                <Text type="secondary">Loại phòng:</Text>
                <Text strong>{booking.room_type?.room_type_name || 'N/A'}</Text>
              </div>

              <div className="info-row">
                <Text type="secondary">Số lượng:</Text>
                <Text strong>{booking.num_rooms || booking.rooms?.length || 0} phòng</Text>
              </div>

              <div className="info-row">
                <Text type="secondary">Số khách:</Text>
                <Text strong>{booking.num_person || 0} người</Text>
              </div>

              <div className="info-row">
                <Text type="secondary">Số đêm:</Text>
                <Text strong>{nights} đêm</Text>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <div className="info-row">
                <Text type="secondary">Tổng tiền:</Text>
                <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                  {formatPrice(totalPrice)}
                </Text>
              </div>

              <div className="info-row">
                <Text type="secondary">Trạng thái thanh toán:</Text>
                <Tag color={getPaymentStatusColor(status === 'PAID' ? 'paid' : 'pending')}>
                  {getPaymentStatusText(status === 'PAID' ? 'paid' : 'pending')}
                </Tag>
              </div>
            </div>

            <Divider />

            <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
              <Button
                type="primary"
                size="large"
                icon={<HomeOutlined />}
                onClick={handleGoHome}
              >
                Về trang chủ
              </Button>
              <Button
                size="large"
                onClick={handleViewBookings}
              >
                Xem lịch sử đặt phòng
              </Button>
            </Space>
          </Card>
        )}

        {/* Nếu không có booking nhưng thanh toán thành công */}
        {!booking && isSuccess && (
          <Card>
            <Alert
              message="Thanh toán đã được xử lý"
              description={
                <div>
                  <p>Giao dịch của bạn đã được xử lý thành công với mã: <Text code>{orderCode}</Text></p>
                  <p>Vui lòng kiểm tra email hoặc liên hệ với chúng tôi nếu bạn cần hỗ trợ.</p>
                </div>
              }
              type="success"
              showIcon
            />
            <div style={{ marginTop: 16 }}>
              <Button type="primary" onClick={handleGoHome}>
                Về trang chủ
              </Button>
              <Button onClick={handleViewBookings} style={{ marginLeft: 8 }}>
                Xem lịch sử đặt phòng
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default PaymentSuccess

