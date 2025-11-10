import React, { useState, useMemo, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Grid,
  Popconfirm,
  message,
  Modal,
  Descriptions,
  Divider,
  Rate,
  Input,
  Upload
} from 'antd'
import {
  EyeOutlined,
  StopOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  FilterOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  PrinterOutlined
} from '@ant-design/icons'
import './userBookingHistory.css'
import { getUserBookings, cancelBooking, downloadInvoicePDF } from '../../services/booking.service'
import { useAuth } from '../../context/AuthContext'
import { cancelBookingOnline } from '../../services/booking.service'
import { getBookingStatusText, getBookingStatusColor, getPaymentStatusText, getPaymentStatusColor } from '../../services/booking.service'
import { createReview } from '../../services/review.service'
import { Tooltip } from 'antd'
const { Title, Text } = Typography
const { TextArea } = Input
const { useBreakpoint } = Grid

// Helper map backend status -> UI keys
const mapStatus = (backend) => {
  switch (backend) {
    case 'pending': return 'pending'
    case 'confirmed': return 'confirmed'
    case 'checked_in': return 'confirmed'
    case 'completed': return 'completed'
    case 'checked_out': return 'completed'
    case 'cancelled': return 'cancelled'
    default: return 'pending'
  }
}

// Trạng thái hiển thị dạng text thuần

const filterOptions = [
  { key: 'all', label: 'Tất cả', count: 0 },
  { key: 'pending', label: 'Đang xử lý', count: 0 },
  { key: 'confirmed', label: 'Đã xác nhận', count: 0 },
  { key: 'completed', label: 'Hoàn thành', count: 0 },
  { key: 'cancelled', label: 'Đã hủy', count: 0 }
]

function UserBookingHistory() {
  const screens = useBreakpoint()
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [detailModal, setDetailModal] = useState({ visible: false, data: null })
  const [cancellingBookings, setCancellingBookings] = useState(new Set()) // Track cancelling bookings by ID
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [cancelModal, setCancelModal] = useState({ visible: false, bookingId: null, bookingCode: null, reason: '' })
  const [cancelSubmitting, setCancelSubmitting] = useState(false)
  const [reviewModal, setReviewModal] = useState({ visible: false, bookingId: null, bookingCode: null })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    images: []
  })
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const {user} = useAuth()
  // Load bookings from backend
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getUserBookings({ limit: 100 })
        console.log(user);
        
        if(res.statusCode === 200) {
          const list = Array.isArray(res.bookings) ? res.bookings : []
          const mapped = list.map(b => ({
            id: b.booking_code || `BK-${b.booking_id}`,
            bookingId: b.booking_id,
            bookingCode: b.booking_code || null,
            hotelName: b.hotel?.name || (b.room_num ? `Phòng ${b.room_num}` : 'N/A'),
            roomType: b.room_type_name || 'N/A',
            checkInDate: b.check_in_date,
            checkOutDate: b.check_out_date,
            guests: b.num_person || 1,
            status: b.booking_status || 'pending',
            totalAmount: b.final_price ?? b.total_price ?? 0,
            bookingDate: b.created_at,
            customerName: b.customer_name || b.guest_name || b.user?.full_name || 'N/A',
            phone: b.customer_phone || b.guest_phone || b.user?.phone || 'N/A',
            email: b.customer_email || b.user?.email || 'N/A',
            customerAddress: b.customer_address || b.address || null,
            citizenId: b.identity_number || b.citizen_id || null,
            note: b.note || b.customer_note || null,
            reviewLink: b.review_link || null,
            paymentStatus: b.payment_status || 'pending',
            bookingType: b.booking_type || 'online',
            roomNum: b.room_num || null,
            services: Array.isArray(b.services) ? b.services : []
          }))
          setBookings(mapped)
        } else {
          message.error(res.message)
          setBookings([])
        }
      } catch (e) {
        message.error('Không thể tải lịch sử đặt phòng')
        setBookings([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Format date with fixed time (e.g., check-in 14:00, check-out 12:00)
  const formatDateWithTime = (date, hour, minute = 0) => {
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return 'N/A'
      const dateStr = d.toLocaleDateString('vi-VN')
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      return `${dateStr} ${timeStr}`
    } catch {
      return 'N/A'
    }
  }

  // Chuẩn hóa thời điểm check-in lúc 14:00 của ngày check-in
  const getCheckInDateTime = (date) => {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null
    d.setHours(14, 0, 0, 0)
    return d
  }

  // Tính chính sách hoàn tiền dựa trên các mốc thời gian (48h và 12h)
  const computeRefundInfo = (checkInDate, totalAmount, bookingDate) => {
    if (!checkInDate || typeof totalAmount !== 'number') return null
    const checkIn = getCheckInDateTime(checkInDate)
    if (!checkIn) return null
    
    const now = new Date()
    const checkInTime = checkIn.getTime()
    const nowTime = now.getTime()
    
    // Tính thời gian từ bây giờ đến check-in (giờ)
    const hoursUntilCheckIn = Math.floor((checkInTime - nowTime) / (1000 * 60 * 60))
    
    // Tính thời gian từ lúc đặt đến bây giờ (giờ)
    let hoursSinceBooking = null
    if (bookingDate) {
      const bookingTime = new Date(bookingDate).getTime()
      hoursSinceBooking = Math.floor((nowTime - bookingTime) / (1000 * 60 * 60))
    }
    
    // Mốc 1: Nếu < 48h trước check-in: mất 100% (hoàn 0%)
    if (hoursUntilCheckIn < 48) {
      return {
        eligible: false,
        refundable: 0,
        nonRefundable: totalAmount,
        hoursUntilCheckIn,
        hoursSinceBooking,
        policy: 'Hủy trong vòng 48 giờ trước giờ check-in - mất 100%',
        message: `Không thể hoàn tiền do hủy trong vòng 48 giờ trước giờ check-in (còn ${hoursUntilCheckIn} giờ). Tổng tiền không hoàn: ${formatCurrency(totalAmount)}.`
      }
    }
    
    // Mốc 2: Nếu ≥ 48h trước check-in, xét thời gian từ lúc đặt
    if (hoursSinceBooking !== null) {
      // Nếu hủy ≤ 12h từ lúc đặt: hoàn 85%, phí 15%
      if (hoursSinceBooking <= 12) {
        const refundable = Math.round(totalAmount * 0.85)
        const nonRefundable = totalAmount - refundable
        return {
          eligible: true,
          refundable,
          nonRefundable,
          hoursUntilCheckIn,
          hoursSinceBooking,
          policy: 'Hủy trước 48 giờ và trong vòng 12 giờ từ lúc đặt - hoàn 85%, phí 15%',
          message: `Bạn sẽ được hoàn lại ${formatCurrency(refundable)} (85%). Khách sạn giữ ${formatCurrency(nonRefundable)} (15%).`
        }
      }
      
      // Nếu hủy > 12h từ lúc đặt: hoàn 70%, phí 30%
      const refundable = Math.round(totalAmount * 0.7)
      const nonRefundable = totalAmount - refundable
      return {
        eligible: true,
        refundable,
        nonRefundable,
        hoursUntilCheckIn,
        hoursSinceBooking,
        policy: 'Hủy trước 48 giờ và sau 12 giờ từ lúc đặt - hoàn 70%, phí 30%',
        message: `Bạn sẽ được hoàn lại ${formatCurrency(refundable)} (70%). Khách sạn giữ ${formatCurrency(nonRefundable)} (30%).`
      }
    }
    
    // Nếu không có bookingDate, mặc định hoàn 70% (trường hợp cũ)
    const refundable = Math.round(totalAmount * 0.7)
    const nonRefundable = totalAmount - refundable
    return {
      eligible: true,
      refundable,
      nonRefundable,
      hoursUntilCheckIn,
      hoursSinceBooking: null,
      policy: 'Hủy trước 48 giờ - hoàn 70%, phí 30%',
      message: `Bạn sẽ được hoàn lại ${formatCurrency(refundable)} (70%). Khách sạn giữ ${formatCurrency(nonRefundable)} (30%).`
    }
  }

  // Filter bookings by status
  const filteredBookings = useMemo(() => {
    if (selectedFilter === 'all') return bookings
    return bookings.filter(booking => booking.status === selectedFilter)
  }, [selectedFilter, bookings])

  // Calculate counts for filters
  const filterOptionsWithCount = useMemo(() => {
    return filterOptions.map(option => ({
      ...option,
      count: option.key === 'all' 
        ? bookings.length 
        : bookings.filter(booking => booking.status === option.key).length
    }))
  }, [bookings])

  // Mở modal nhập lý do hủy
  const handleOpenCancelModal = (record) => {
    setCancelModal({
      visible: true,
      bookingId: record.bookingId,
      bookingCode: record.id,
      reason: '',
      checkInDate: record.checkInDate,
      totalAmount: record.totalAmount
    })
  }

  // Gửi hủy booking với lý do
  const handleSubmitCancelReason = async () => {
    if (!cancelModal.bookingId) {
      message.error('Không xác định được booking cần hủy')
      return
    }
    if (!cancelModal.reason || cancelModal.reason.trim().length < 3) {
      message.warning('Vui lòng nhập lý do hủy (tối thiểu 3 ký tự)')
      return
    }
    setCancelSubmitting(true)
    setCancellingBookings(prev => new Set([...prev, cancelModal.bookingCode]))
    try {
      const res = await cancelBookingOnline(cancelModal.bookingId, cancelModal.reason.trim())
      // cập nhật trạng thái trong bảng
      setBookings(prev => prev.map(b => (
        b.bookingId === cancelModal.bookingId ? { ...b, status: 'cancelled', cancelReason: cancelModal.reason.trim() } : b
      )))
      message.success('Hủy booking thành công')
      setCancelModal({ visible: false, bookingId: null, bookingCode: null, reason: '' })
    } catch (e) {
      message.error('Hủy booking thất bại, vui lòng thử lại')
    } finally {
      setCancelSubmitting(false)
      setCancellingBookings(prev => {
        const next = new Set(prev)
        if (cancelModal.bookingCode) next.delete(cancelModal.bookingCode)
        return next
      })
    }
  }

  // Handle view details
  const handleViewDetails = (booking) => {
    setDetailModal({ visible: true, data: booking })
    console.log(booking);
    
  }
  
  // Handle download invoice
  const handleDownloadInvoice = async (bookingId, bookingCode) => {
    if (!bookingId) {
      message.error('Không tìm thấy thông tin đặt phòng!')
      return
    }

    try {
      setInvoiceLoading(true)
      // Gọi API để tạo PDF
      const blob = await downloadInvoicePDF(bookingId)
      
      // Tạo URL từ blob
      const url = window.URL.createObjectURL(blob)
      
      // Tạo link tải xuống
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${bookingCode || bookingId}.pdf`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      message.success('Đã tải hóa đơn thành công!')
    } catch (error) {
      console.error('Error downloading invoice:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể tải hóa đơn!'
      
      // Xử lý lỗi cụ thể
      if (error?.response?.status === 403) {
        message.error('Bạn không có quyền xem hóa đơn này hoặc booking chưa được check-out!')
      } else if (error?.response?.status === 404) {
        message.error('Không tìm thấy thông tin đặt phòng!')
      } else {
        message.error(errorMessage)
      }
    } finally {
      setInvoiceLoading(false)
    }
  }

  // Handle submit review
  const handleSubmitReview = async () => {
    if (!reviewModal.bookingId) {
      message.error('Không xác định được booking cần đánh giá')
      return
    }
    
    if (!reviewForm.rating || reviewForm.rating < 1) {
      message.warning('Vui lòng chọn số sao đánh giá')
      return
    }
    
    setReviewSubmitting(true)
    try {
      // Lấy các file từ fileList
      const imageFiles = reviewForm.images
        .filter(file => file.originFileObj)
        .map(file => file.originFileObj)
      
      const reviewData = {
        booking_id: reviewModal.bookingId,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim() || '',
        images: imageFiles
      }
      
      const response = await createReview(reviewData)
      
      if (response) {
        message.success('Đánh giá thành công! Cảm ơn bạn đã chia sẻ trải nghiệm.')
        
        // Reset form và đóng modal
        setReviewModal({ visible: false, bookingId: null, bookingCode: null })
        setReviewForm({ rating: 5, comment: '', images: [] })
        
        // Reload bookings để cập nhật (có thể cập nhật reviewLink nếu có)
        const res = await getUserBookings({ limit: 100 })
        if (res.statusCode === 200) {
          const list = Array.isArray(res.bookings) ? res.bookings : []
          const mapped = list.map(b => ({
            id: b.booking_code || `BK-${b.booking_id}`,
            bookingId: b.booking_id,
            bookingCode: b.booking_code || null,
            hotelName: b.hotel?.name || (b.room_num ? `Phòng ${b.room_num}` : 'N/A'),
            roomType: b.room_type_name || 'N/A',
            checkInDate: b.check_in_date,
            checkOutDate: b.check_out_date,
            guests: b.num_person || 1,
            status: b.booking_status || 'pending',
            totalAmount: b.final_price ?? b.total_price ?? 0,
            bookingDate: b.created_at,
            customerName: b.customer_name || b.guest_name || b.user?.full_name || 'N/A',
            phone: b.customer_phone || b.guest_phone || b.user?.phone || 'N/A',
            email: b.customer_email || b.user?.email || 'N/A',
            customerAddress: b.customer_address || b.address || null,
            citizenId: b.identity_number || b.citizen_id || null,
            note: b.note || b.customer_note || null,
            reviewLink: b.review_link || null,
            paymentStatus: b.payment_status || 'pending',
            bookingType: b.booking_type || 'online',
            roomNum: b.room_num || null,
            services: Array.isArray(b.services) ? b.services : []
          }))
          setBookings(mapped)
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể gửi đánh giá, vui lòng thử lại'
      message.error(errorMessage)
    } finally {
      setReviewSubmitting(false)
    }
  }

  // Table columns
  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'id',
      key: 'id',
      width: screens.xs ? 100 : 120,
      fixed: screens.xs ? 'left' : false,
      render: (text) => <Text strong className="booking-id">{text}</Text>
    },
    {
      title: 'Loại phòng',
      dataIndex: 'roomType',
      key: 'roomType',
      width: screens.xs ? 120 : 150,
      render: (text) => <Text className="room-type">{text}</Text>
    },
    {
      title: 'Check-in',
      dataIndex: 'checkInDate',
      key: 'checkInDate',
      width: screens.xs ? 100 : 120,
      render: (date) => (
        <div className="date-cell">
          <CalendarOutlined />
          <Text>{formatDateWithTime(date, 14, 0)}</Text>
        </div>
      )
    },
    {
      title: 'Check-out',
      dataIndex: 'checkOutDate',
      key: 'checkOutDate',
      width: screens.xs ? 100 : 120,
      render: (date) => (
        <div className="date-cell">
          <CalendarOutlined />
          <Text>{formatDateWithTime(date, 12, 0)}</Text>
        </div>
      )
    },
    {
      title: 'Số khách',
      dataIndex: 'guests',
      key: 'guests',
      width: screens.xs ? 80 : 100,
      align: 'center',
      render: (guests) => (
        <div className="guests-cell">
          <UserOutlined />
          <Text>{guests}</Text>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: screens.xs ? 50 : 70,
      align: 'left',
      render: (status) => (
        <Tag color={getBookingStatusColor(status)}>{getBookingStatusText(status)}</Tag>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: screens.xs ? 120 : 150,
      align: 'left',
      render: (amount) => (
        <div className="amount-cell">
          <Text strong className="amount-text">{formatCurrency(amount)}</Text>
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: screens.xs ? 120 : 150,
      fixed: screens.xs ? 'right' : false,
      align: 'center',
      render: (_, record) => {
        const { status, id } = record
        const isCancelling = cancellingBookings.has(id)
        
        // Chỉ hiển thị nút Chi tiết ở ngoài bảng
        const showViewButton = ['pending','confirmed', 'completed', 'cancelled', 'checked_out'].includes(status)
        
        return (
          <Space 
            size={screens.xs ? 4 : "small"} 
            direction={screens.xs ? 'vertical' : 'horizontal'}
            wrap
          >
            {showViewButton && (
              screens.xs ? (
                <Tooltip title="Chi tiết">
                  <Button
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => handleViewDetails(record)}
                    className="view-btn"
                    type="primary"
                    shape="round"
                  />
                </Tooltip>
              ) : (
                <Button
                  icon={<EyeOutlined />}
                  size="middle"
                  onClick={() => handleViewDetails(record)}
                  className="view-btn"
                  type="primary"
                  shape="round"
                >
                  Chi tiết
                </Button>
              )
            )}
        
          </Space>
        )
      }
    }
  ]

  return (
    <div className="user-booking-history-page">
      <div className="booking-history-container">
        {/* Header */}
        <Card className="header-card">
          <Row align="middle" justify="space-between">
            <Col xs={24} sm={12}>
              <Title level={2} className="page-title">
                Lịch sử đặt phòng của bạn
              </Title>
            </Col>
            <Col xs={24} sm={12} style={{ textAlign: screens.xs ? 'left' : 'right' }}>
              <Space wrap className="filter-buttons">
                {filterOptionsWithCount.map(option => (
                  <Button
                    key={option.key}
                    type={selectedFilter === option.key ? 'primary' : 'default'}
                    icon={<FilterOutlined />}
                    onClick={() => setSelectedFilter(option.key)}
                    className={`filter-btn ${selectedFilter === option.key ? 'active' : ''}`}
                  >
                    {option.label} ({option.count})
                  </Button>
                ))}
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card className="table-card">
          <Table
            columns={columns}
            dataSource={filteredBookings}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              total: filteredBookings.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} booking`,
              responsive: true
            }}
            className="booking-table"
            size={screens.xs ? 'small' : 'middle'}
          />
        </Card>
        
        {/* Modal chi tiết đặt phòng */}
        <Modal
          open={detailModal.visible}
          title={
            detailModal.data ? (
              <Space direction="vertical" size={0}>
                <Text strong>Chi tiết booking</Text>
                <Text type="secondary">Mã: {detailModal.data.id}</Text>
              </Space>
            ) : 'Chi tiết booking'
          }
          onCancel={() => setDetailModal({ visible: false, data: null })}
          footer={[
            detailModal.data && detailModal.data.status === 'confirmed' && (
              <Button
                key="cancel-booking"
                danger
                className="cancel-btn"
                icon={<StopOutlined />}
                onClick={() => {
                  setDetailModal({ visible: false, data: null })
                  handleOpenCancelModal(detailModal.data)
                }}
              >
                Hủy phòng
              </Button>
            ),
            detailModal.data && (detailModal.data.status === 'checked_out' || detailModal.data.status === 'completed') && (
              <Button
                key="download-invoice"
                type="primary"
                icon={<PrinterOutlined />}
                onClick={() => handleDownloadInvoice(detailModal.data.bookingId, detailModal.data.id)}
                loading={invoiceLoading}
              >
                Xuất hóa đơn
              </Button>
            ),
            <Button key="close" onClick={() => setDetailModal({ visible: false, data: null })}>Đóng</Button>
          ]}
          width={screens.xs ? 360 : 720}
        >
          {detailModal.data && (
            <div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" bordered>
                    <Space align="center" size="small">
                      <Text strong>Trạng thái:</Text>
                      <Tag color={getBookingStatusColor(detailModal.data.status)}>
                        {getBookingStatusText(detailModal.data.status)}
                      </Tag>
                    </Space>
                    <Divider style={{ margin: '12px 0' }} />
                    <Descriptions size="small" column={1} colon>
                      <Descriptions.Item label="Khách sạn">
                        {detailModal.data.hotelName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Loại phòng">
                        {detailModal.data.roomType}
                      </Descriptions.Item>
                      {detailModal.data.roomNum && (
                        <Descriptions.Item label="Số phòng">
                          {detailModal.data.roomNum}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card size="small" bordered>
                    <Descriptions size="small" column={1} colon>
                      <Descriptions.Item label="Tổng tiền">
                        <Text strong>{formatCurrency(detailModal.data.totalAmount)}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Thanh toán">
                        <Tag color={getPaymentStatusColor(detailModal.data.paymentStatus)}>
                          {getPaymentStatusText(detailModal.data.paymentStatus)}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày đặt">
                        {new Date(detailModal.data.bookingDate).toLocaleString('vi-VN')}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>

              {/* Hiển thị thông tin hoàn tiền nếu booking chưa hủy và đã thanh toán */}
              {detailModal.data && 
               detailModal.data.status !== 'cancelled' && 
               detailModal.data.paymentStatus === 'paid' && (
                <>
                  <Divider />
                  <Card size="small" title="Chính sách hủy phòng và hoàn tiền" bordered>
                    {(() => {
                      const refundInfo = computeRefundInfo(
                        detailModal.data.checkInDate, 
                        detailModal.data.totalAmount,
                        detailModal.data.bookingDate
                      )
                      if (!refundInfo) return <Text type="secondary">Không thể tính toán chính sách hoàn tiền</Text>
                      
                      return (
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <div>
                            <Text strong>Thời gian đến check-in: </Text>
                            <Text>{refundInfo.hoursUntilCheckIn !== null ? `${refundInfo.hoursUntilCheckIn} giờ` : 'N/A'}</Text>
                          </div>
                          {refundInfo.hoursSinceBooking !== null && (
                            <div>
                              <Text strong>Thời gian từ lúc đặt: </Text>
                              <Text>{refundInfo.hoursSinceBooking} giờ</Text>
                            </div>
                          )}
                          <Divider style={{ margin: '8px 0' }} />
                          <div>
                            <Text strong style={{ display: 'block', marginBottom: 4 }}>
                              Chính sách áp dụng:
                            </Text>
                            <Text type={refundInfo.eligible ? 'success' : 'danger'}>
                              {refundInfo.policy}
                            </Text>
                          </div>
                          <div>
                            <Text strong style={{ display: 'block', marginBottom: 4 }}>
                              Số tiền được hoàn:
                            </Text>
                            <Text 
                              strong 
                              style={{ 
                                fontSize: 16, 
                                color: refundInfo.eligible ? '#52c41a' : '#ff4d4f' 
                              }}
                            >
                              {formatCurrency(refundInfo.refundable)}
                            </Text>
                            {refundInfo.eligible && (
                              <Text type="secondary" style={{ marginLeft: 8 }}>
                                ({Math.round((refundInfo.refundable / detailModal.data.totalAmount) * 100)}%)
                              </Text>
                            )}
                          </div>
                          {refundInfo.eligible && (
                            <div>
                              <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                Phí hủy:
                              </Text>
                              <Text type="secondary">
                                {formatCurrency(refundInfo.nonRefundable)}
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                  ({Math.round((refundInfo.nonRefundable / detailModal.data.totalAmount) * 100)}%)
                                </Text>
                              </Text>
                            </div>
                          )}
                        </Space>
                      )
                    })()}
                  </Card>
                </>
              )}

              <Divider />

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Thông tin khách hàng" bordered>
                    <Descriptions size="small" column={1} colon>
                      <Descriptions.Item label="Họ tên">
                        {user?.full_name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">
                        {user?.phone || 'Chưa cập nhật'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {user?.email}
                      </Descriptions.Item>
                      {/* {detailModal.data.citizenId && (
                        <Descriptions.Item label="CCCD/CMND">
                          {detailModal.data.citizenId}
                        </Descriptions.Item>
                      )} */}
                      {detailModal.data.note && (
                        <Descriptions.Item label="Ghi chú">
                          {detailModal.data.note}
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Số khách">
                        {detailModal.data.guests}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card size="small" title="Thời gian lưu trú" bordered>
                    <Descriptions size="small" column={1} colon>
                      <Descriptions.Item label="Check-in">
                        {formatDateWithTime(detailModal.data.checkInDate, 14, 0)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Check-out">
                        {formatDateWithTime(detailModal.data.checkOutDate, 12, 0)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Hình thức đặt">
                        {detailModal.data.bookingType}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>

              {Array.isArray(detailModal.data.services) && detailModal.data.services.length > 0 && (
                <>
                  <Divider />
                  <Card size="small" title="Dịch vụ kèm theo" bordered>
                    <Space wrap>
                      {detailModal.data.services.map((sv, idx) => {
                        const isObject = sv && typeof sv === 'object'
                        const name = isObject ? (sv.service_name || sv.name || 'Dịch vụ') : String(sv)
                        const quantity = isObject && sv.quantity ? ` x${sv.quantity}` : ''
                        const priceValue = isObject ? (sv.total_price ?? sv.unit_price) : undefined
                        const price = typeof priceValue === 'number' ? ` - ${formatCurrency(priceValue)}` : ''
                        const label = `${name}${quantity}${price}`
                        return (
                          <Tag key={idx} color="processing">{label}</Tag>
                        )
                      })}
                    </Space>
                  </Card>
                </>
              )}

              {detailModal.data && detailModal.data.status === 'checked_out' && (
                <>
                  <Divider />
                  <Space>
                    <Button 
                      type="primary" 
                      onClick={() => {
                        setDetailModal({ visible: false, data: null })
                        setReviewModal({
                          visible: true,
                          bookingId: detailModal.data.bookingId,
                          bookingCode: detailModal.data.id
                        })
                        setReviewForm({
                          rating: 5,
                          comment: '',
                          images: []
                        })
                      }}
                    >
                      Viết đánh giá
                    </Button>
                  </Space>
                </>
              )}
            </div>
          )}
        </Modal>

        {/* Modal lý do hủy */}
        <Modal
          open={cancelModal.visible}
          title={
            <Space direction="vertical" size={0}>
              <Text strong>Nhập lý do hủy booking</Text>
              {cancelModal.bookingCode && (
                <Text type="secondary">Mã: {cancelModal.bookingCode}</Text>
              )}
            </Space>
          }
          onCancel={() => setCancelModal({ visible: false, bookingId: null, bookingCode: null, reason: '' })}
          footer={[
            <Button key="cancel" onClick={() => setCancelModal({ visible: false, bookingId: null, bookingCode: null, reason: '' })}>
              Đóng
            </Button>,
            <Button key="ok" type="primary" danger loading={cancelSubmitting} onClick={handleSubmitCancelReason}>
              Xác nhận hủy
            </Button>
          ]}
          width={screens.xs ? 360 : 560}
        >
          <div>
            <Text type="secondary">Vui lòng cho chúng tôi biết lý do hủy để cải thiện dịch vụ.</Text>
            {cancelModal.checkInDate !== undefined && cancelModal.totalAmount !== undefined && (
              <div style={{ marginTop: 12 }}>
                {(() => {
                  // Lấy bookingDate từ booking data
                  const booking = bookings.find(b => b.bookingId === cancelModal.bookingId)
                  const bookingDate = booking?.bookingDate || null
                  const info = computeRefundInfo(cancelModal.checkInDate, cancelModal.totalAmount, bookingDate)
                  if (!info) return null
                  const checkInStr = formatDateWithTime(cancelModal.checkInDate, 14, 0)
                  return (
                    <Card size="small" bordered>
                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <Text><strong>Giờ check-in:</strong> {checkInStr}</Text>
                        {info.hoursUntilCheckIn !== null && (
                          <Text type="secondary">
                            Còn {info.hoursUntilCheckIn} giờ đến giờ check-in
                          </Text>
                        )}
                        {info.hoursSinceBooking !== null && (
                          <Text type="secondary">
                            Đã đặt {info.hoursSinceBooking} giờ trước
                          </Text>
                        )}
                        <Divider style={{ margin: '8px 0' }} />
                        <Text strong style={{ color: info.eligible ? '#52c41a' : '#ff4d4f' }}>
                          {info.policy}
                        </Text>
                        <Text type={info.eligible ? 'success' : 'danger'}>{info.message}</Text>
                      </Space>
                    </Card>
                  )
                })()}
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="Lý do hủy">
                  <textarea
                    value={cancelModal.reason}
                    onChange={(e) => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
                    rows={4}
                    style={{ width: '100%', resize: 'vertical', padding: 8 }}
                    placeholder="Nhập lý do hủy..."
                  />
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        </Modal>

        {/* Modal viết đánh giá */}
        <Modal
          open={reviewModal.visible}
          title={
            <Space direction="vertical" size={0}>
              <Text strong>Viết đánh giá</Text>
              {reviewModal.bookingCode && (
                <Text type="secondary">Mã booking: {reviewModal.bookingCode}</Text>
              )}
            </Space>
          }
          onCancel={() => {
            setReviewModal({ visible: false, bookingId: null, bookingCode: null })
            setReviewForm({ rating: 5, comment: '', images: [] })
          }}
          footer={[
            <Button 
              key="cancel" 
              onClick={() => {
                setReviewModal({ visible: false, bookingId: null, bookingCode: null })
                setReviewForm({ rating: 5, comment: '', images: [] })
              }}
            >
              Hủy
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              loading={reviewSubmitting}
              onClick={handleSubmitReview}
              disabled={!reviewForm.rating || reviewForm.rating < 1}
            >
              Gửi đánh giá
            </Button>
          ]}
          width={screens.xs ? 360 : 600}
          className="review-modal"
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Đánh giá của bạn <Text type="danger">*</Text>
              </Text>
              <Rate
                value={reviewForm.rating}
                onChange={(value) => setReviewForm(prev => ({ ...prev, rating: value }))}
                style={{ fontSize: '24px' }}
              />
              <Text type="secondary" style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}>
                {reviewForm.rating === 1 && 'Rất không hài lòng'}
                {reviewForm.rating === 2 && 'Không hài lòng'}
                {reviewForm.rating === 3 && 'Bình thường'}
                {reviewForm.rating === 4 && 'Hài lòng'}
                {reviewForm.rating === 5 && 'Rất hài lòng'}
              </Text>
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Nội dung đánh giá
              </Text>
              <TextArea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ và phòng ở..."
                rows={6}
                maxLength={1000}
                showCount
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Hình ảnh đính kèm (tối đa 5 ảnh)
              </Text>
              <Upload
                listType="picture-card"
                fileList={reviewForm.images}
                onChange={({ fileList }) => {
                  const validFiles = fileList.filter(file => {
                    // Chỉ lấy file mới upload (có originFileObj)
                    if (file.originFileObj) {
                      return true
                    }
                    // Giữ lại file đã có (từ URL)
                    return file.url || file.thumbUrl
                  })
                  setReviewForm(prev => ({ 
                    ...prev, 
                    images: validFiles.slice(0, 5) // Giới hạn 5 ảnh
                  }))
                }}
                beforeUpload={(file) => {
                  // Validate file type
                  const isImage = file.type.startsWith('image/')
                  if (!isImage) {
                    message.error('Chỉ có thể upload file ảnh!')
                    return false
                  }
                  // Validate file size (max 5MB)
                  const isLt5M = file.size / 1024 / 1024 < 5
                  if (!isLt5M) {
                    message.error('Ảnh phải nhỏ hơn 5MB!')
                    return false
                  }
                  return false // Prevent auto upload
                }}
                onRemove={(file) => {
                  setReviewForm(prev => ({
                    ...prev,
                    images: prev.images.filter(img => img.uid !== file.uid)
                  }))
                }}
                accept="image/*"
              >
                {reviewForm.images.length < 5 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </div>
          </Space>
        </Modal>
        
      </div>
    </div>
  )
}

export default UserBookingHistory
