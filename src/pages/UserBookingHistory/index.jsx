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
  Upload,
  Alert
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
  PrinterOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import './userBookingHistory.css'
import { getUserBookings, cancelBooking, downloadInvoicePDF, formatDate, formatDateTime as formatDateTimeService } from '../../services/booking.service'
import formatDateTime from '../../utils/formatDateTime'
import { useAuth } from '../../context/AuthContext'
import { cancelBookingOnline } from '../../services/booking.service'
import { getBookingStatusText, getBookingStatusColor, getPaymentStatusText, getPaymentStatusColor } from '../../services/booking.service'
import { createReview } from '../../services/review.service'
import { Tooltip } from 'antd'
import { getAllPendingPayments, removePendingPayment } from '../../utils/pendingPayment.util'
import { useNavigate } from 'react-router-dom'
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
  { key: 'checked_out', label: 'Hoàn thành', count: 0 },
  { key: 'cancelled', label: 'Đã hủy', count: 0 }
]

function UserBookingHistory() {
  const screens = useBreakpoint()
  const modalWidth = useMemo(() => {
    if (screens?.xl) return 700
    if (screens?.lg) return 680
    if (screens?.md) return 640
    if (screens?.sm) return 560
    return 340
  }, [screens])
  const navigate = useNavigate()
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
  const { user, isAuthenticated } = useAuth()
  const [pendingPayments, setPendingPayments] = useState([])

  // Chuyển đổi pendingPayment thành format booking
  const convertPendingPaymentToBooking = (pendingPayment) => {
    if (!pendingPayment || !pendingPayment.bookingInfo) return null
    
    const { 
      bookingInfo, 
      bookingCode, 
      amount, 
      paymentUrl, 
      orderCode, 
      selectedServices,
      tempBookingKey,
      promoCode,
      qrCode
    } = pendingPayment
    
    const createdAt =
      pendingPayment.createdAt ||
      pendingPayment.bookingDate ||
      bookingInfo?.createdAt ||
      bookingInfo?.created_at ||
      new Date().toISOString()

    return {
      id: bookingCode || `PENDING-${Date.now()}`,
      bookingId: null, // Chưa có booking_id vì chưa thanh toán
      bookingCode: bookingCode || null,
      hotelName: bookingInfo?.roomType?.hotel?.name || 'N/A',
      roomType: bookingInfo?.roomType?.room_type_name || 'N/A',
      checkInDate: bookingInfo?.checkIn,
      checkOutDate: bookingInfo?.checkOut,
      guests: bookingInfo?.guests?.adults || bookingInfo?.num_person || 1,
      status: 'pending',
      totalAmount: amount || 0,
      amount: amount || 0,
      bookingDate: new Date(createdAt).toISOString(),
      customerName: bookingInfo?.customerInfo?.fullName || user?.full_name || 'N/A',
      phone: user?.phone || 'N/A',
      email: bookingInfo?.customerInfo?.email || user?.email || 'N/A',
      customerAddress: null,
      citizenId: null,
      note: null,
    reviewLink: null,
    hasReview: false,
    canReview: false,
      paymentStatus: 'pending',
      bookingType: 'online',
      roomNum: null,
      services: Array.isArray(selectedServices) ? selectedServices : [],
      isPendingPayment: true, // Flag để nhận biết
      paymentUrl: paymentUrl, // URL thanh toán PayOS
      orderCode: orderCode,
      tempBookingKey,
      bookingInfo,
      selectedServices: Array.isArray(selectedServices) ? selectedServices : [],
      promoCode: promoCode || null,
      qrCode: qrCode || null
    }
  }

  // load danh sách đặt phòng và thanh toán đang chờ
  useEffect(() => {
    let isMounted = true
    const load = async () => {
      const userId = user?.user_id || user?.id
      if (!isAuthenticated || !userId) {
        if (!isMounted) return
        setPendingPayments([])
        setBookings([])
        setLoading(false)
        return
      }
      try {
        if (!isMounted) return
        setLoading(true)
        // Lấy tất cả temp bookings của user từ localStorage
        let tempBookings = getAllPendingPayments(userId) || []
        
        // Xử lý từng temp booking để tạo payment link nếu chưa có
        const pendingBookings = []
        const validTempBookings = []
        
        for (const tempBooking of tempBookings) {
          try {
            const { tempBookingKey, bookingInfo, selectedServices, promoCode, paymentUrl, bookingCode, amount, orderCode } = tempBooking
            
            // Nếu đã có paymentUrl, chuyển đổi trực tiếp
            if (paymentUrl && bookingInfo) {
              const booking = convertPendingPaymentToBooking({
                tempBookingKey,
                bookingInfo,
                selectedServices: selectedServices || [],
                promoCode: promoCode || null,
                paymentUrl,
                bookingCode,
                amount,
                orderCode
              })
              if (booking) {
                pendingBookings.push(booking)
                validTempBookings.push(tempBooking)
              }
            } 
            // Nếu chưa có paymentUrl, tạo lại payment link
            else if (tempBookingKey) {
              try {
                const { createPaymentLink } = await import('../../services/booking.service')
                const paymentResponse = await createPaymentLink({
                  temp_booking_key: tempBookingKey,
                  promotion_code: promoCode || null
                })
                
                // Cập nhật temp booking với paymentUrl
                const updatedTempBooking = {
                  ...tempBooking,
                  paymentUrl: paymentResponse.payment_url,
                  qrCode: paymentResponse.qr_code,
                  orderCode: paymentResponse.order_code,
                  bookingCode: paymentResponse.booking_code,
                  amount: paymentResponse.amount
                }
                
                // Lưu lại vào localStorage
                const { savePendingPayment } = await import('../../utils/pendingPayment.util')
                savePendingPayment(userId, updatedTempBooking, 30)
                
                // Chuyển đổi thành booking để hiển thị
                const booking = convertPendingPaymentToBooking({
                  tempBookingKey,
                  bookingInfo: bookingInfo || null,
                  selectedServices: selectedServices || [],
                  promoCode: promoCode || null,
                  paymentUrl: paymentResponse.payment_url,
                  bookingCode: paymentResponse.booking_code,
                  amount: paymentResponse.amount,
                  orderCode: paymentResponse.order_code
                })
                
                if (booking) {
                  pendingBookings.push(booking)
                  validTempBookings.push(updatedTempBooking)
                }
              } catch (error) {
                console.error('Error recreating payment link for temp booking:', error)
                // Nếu temp booking đã hết hạn (404), không thêm vào validTempBookings
                if (error?.response?.status !== 404) {
                  validTempBookings.push(tempBooking)
                } else {
                  // Xóa temp booking đã hết hạn
                  if (userId) {
                    removePendingPayment(userId, tempBookingKey)
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error processing temp booking:', error)
          }
        }
        
        if (!isMounted) return
        setPendingPayments(pendingBookings)
    
        // Lấy danh sách bookings từ API
        const res = await getUserBookings({ limit: 1000 })
        if(res.statusCode === 200) {
          const list = Array.isArray(res.bookings) ? res.bookings : []
          
          const mapped = list.map(b => {
            const createdAt =
              b.created_at ||
              b.createdAt ||
              b.booking_date ||
              b.created_on ||
              b.updated_at

            let bookingDate = null
            if (createdAt) {
              const parsed = new Date(createdAt)
              bookingDate = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
            } else {
              bookingDate = new Date().toISOString()
            }

            return {
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
            bookingDate,
            customerName: b.customer_name || b.guest_name || b.user?.full_name || 'N/A',
            phone: b.customer_phone || b.guest_phone || b.user?.phone || 'N/A',
            email: b.customer_email || b.user?.email || 'N/A',
            customerAddress: b.customer_address || b.address || null,
            citizenId: b.identity_number || b.citizen_id || null,
            note: b.note || b.customer_note || null,
            reviewLink: b.review_link || null,
            hasReview: Boolean(b.has_review),
            canReview: Boolean(b.can_review),
            paymentStatus: b.payment_status || 'pending',
            bookingType: b.booking_type || 'online',
            roomNum: b.room_num || null,
            services: Array.isArray(b.services) ? b.services : [],
            isPendingPayment: false
          }})
          if (!isMounted) return
          setBookings(mapped)
        } else {
          message.error(res.message)
          setBookings([])
        }
      } catch (e) {
        message.error('Không thể tải lịch sử đặt phòng')
        setBookings([])
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => { isMounted = false }
  }, [isAuthenticated, user?.user_id, user?.id])

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

  // Tính chính sách hoàn tiền dựa trên các mốc thời gian (48h và 1h)
  // Theo chính sách: Ngoại lệ 1 tiếng có ưu tiên cao nhất, áp dụng bất kể còn bao nhiêu giờ trước check-in
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
    
    // 🎯 ƯU TIÊN 1: Ngoại lệ 1 tiếng (Ưu tiên cao nhất)
    // Áp dụng bất kể còn bao nhiêu giờ trước check-in
    if (hoursSinceBooking !== null && hoursSinceBooking <= 1) {
      const refundable = Math.round(totalAmount * 0.85)
      const nonRefundable = totalAmount - refundable
      return {
        eligible: true,
        refundable,
        nonRefundable,
        hoursUntilCheckIn,
        hoursSinceBooking,
        policy: 'Hủy trong vòng 1 giờ từ lúc đặt - hoàn 85%, phí 15%',
        message: `Bạn sẽ được hoàn lại ${formatCurrency(refundable)} (85%). Khách sạn giữ ${formatCurrency(nonRefundable)} (15%). Áp dụng bất kể còn bao nhiêu giờ trước check-in.`
      }
    }
    
    // 🎯 ƯU TIÊN 2: Xét thời gian trước check-in (chỉ khi đã qua > 1h từ lúc đặt)
    if (hoursSinceBooking === null || hoursSinceBooking > 1) {
      // Trường hợp 1: Hủy < 48h trước check-in → Mất 100%
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
      
      // Trường hợp 2: Hủy ≥ 48h trước check-in → Hoàn 70%, phí 30%
      const refundable = Math.round(totalAmount * 0.7)
      const nonRefundable = totalAmount - refundable
      return {
        eligible: true,
        refundable,
        nonRefundable,
        hoursUntilCheckIn,
        hoursSinceBooking,
        policy: 'Hủy ≥ 48 giờ trước giờ check-in - hoàn 70%, phí 30%',
        message: `Bạn sẽ được hoàn lại ${formatCurrency(refundable)} (70%). Khách sạn giữ ${formatCurrency(nonRefundable)} (30%).`
      }
    }
    
    // Fallback: Nếu không có bookingDate, mặc định hoàn 70% (trường hợp cũ)
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

  // Filter đặt phòng theo trạng thái
  const filteredBookings = useMemo(() => {
    let result = bookings
    // Nếu chọn tab "Đang xử lý" (pending), thêm pendingPayments vào
    if (selectedFilter === 'pending') {
      result = [...pendingPayments, ...bookings.filter(booking => booking.status === 'pending' && !booking.isPendingPayment)]
    } else if (selectedFilter === 'all') {
      // Tab "Tất cả": hiển thị cả pendingPayments và bookings
      result = [...pendingPayments, ...bookings]
    } else {
      // Các tab khác: chỉ hiển thị bookings
      result = bookings.filter(booking => booking.status === selectedFilter)
    }
    
    return result
  }, [selectedFilter, bookings, pendingPayments])

  // Calculate counts for filters
  const filterOptionsWithCount = useMemo(() => {
    return filterOptions.map(option => {
      if (option.key === 'all') {
        return {
      ...option,
          count: bookings.length + pendingPayments.length
        }
      } else if (option.key === 'pending') {
        return {
          ...option,
          count: bookings.filter(booking => booking.status === 'pending' && !booking.isPendingPayment).length + pendingPayments.length
        }
      } else {
        return {
          ...option,
          count: bookings.filter(booking => booking.status === option.key).length
        }
      }
    })
  }, [bookings, pendingPayments])

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

  // Xem chi tiết đánh giá
  const handleViewDetails = (booking) => {
    setDetailModal({ visible: true, data: booking })
  }


  // Gửi đánh giá
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
        const res = await getUserBookings({ limit: 1000 })
        if (res.statusCode === 200) {
          const list = Array.isArray(res.bookings) ? res.bookings : []
          const mapped = list.map(b => {
            const createdAt =
              b.created_at ||
              b.createdAt ||
              b.booking_date ||
              b.created_on ||
              b.updated_at

            let bookingDate = null
            if (createdAt) {
              const parsed = new Date(createdAt)
              bookingDate = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
            } else {
              bookingDate = new Date().toISOString()
            }

            return {
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
            bookingDate,
            customerName: b.customer_name || b.guest_name || b.user?.full_name || 'N/A',
            phone: b.customer_phone || b.guest_phone || b.user?.phone || 'N/A',
            email: b.customer_email || b.user?.email || 'N/A',
            customerAddress: b.customer_address || b.address || null,
            citizenId: b.identity_number || b.citizen_id || null,
            note: b.note || b.customer_note || null,
            reviewLink: b.review_link || null,
            hasReview: Boolean(b.has_review),
            canReview: Boolean(b.can_review),
            paymentStatus: b.payment_status || 'pending',
            bookingType: b.booking_type || 'online',
            roomNum: b.room_num || null,
            services: Array.isArray(b.services) ? b.services : []
          }})
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

  // Cột bảng lịch sử đặt phòng
  const columns = [
    {
      title: 'Booking Code',
      dataIndex: 'id',
      key: 'id',
      width: screens.xs ? 70 : 90,
      fixed: screens.xs ? 'left' : false,
      render: (text) => <Text strong className="booking-id">{text}</Text>
    },
    {
      title: 'Loại phòng',
      dataIndex: 'roomType',
      key: 'roomType',
      width: screens.xs ? 120 : 150,
      render: (text) => <Text className="room-type">{text}</Text>,
      sorter: (a, b) => a.roomType.localeCompare(b.roomType)
    },
    {
      title: 'Check-in',
      dataIndex: 'checkInDate',
      key: 'checkInDate',
      width: screens.xs ? 100 : 120,
      render: (date) => (
        <div className="date-cell">
          <Text>{formatDate(date)}</Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.checkInDate) - new Date(b.checkInDate)
    },
    {
      title: 'Check-out',
      dataIndex: 'checkOutDate',
      key: 'checkOutDate',
      width: screens.xs ? 70 : 90,
      render: (date) => (
        <div className="date-cell">
          <Text>{formatDate(date)}</Text>
        </div>
      )
    },
    {
      title: 'Số khách',
      dataIndex: 'guests',
      key: 'guests',
      width: screens.xs ? 50 : 70,
      align: 'center',
      render: (guests) => (
        <div className="guests-cell">
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
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: screens.xs ? 120 : 150,
      fixed: screens.xs ? 'right' : false,
      align: 'center',
      render: (_, record) => {
        const { status, id, isPendingPayment, paymentUrl } = record
        const isCancelling = cancellingBookings.has(id)
        
        // Hiển thị nút Thanh toán cho pendingPayment (có paymentUrl) và đã thanh toán
        const showPaymentButton = isPendingPayment && paymentUrl
        
        // Chỉ hiển thị nút Chi tiết cho các booking đã thanh toán (không phải pending payment)
        const showViewButton = !isPendingPayment && ['pending','confirmed', 'completed', 'cancelled', 'checked_out'].includes(status)
        
        return (
          <Space 
            size={screens.xs ? 4 : "small"} 
            direction={screens.xs ? 'vertical' : 'horizontal'}
            wrap
          >
            {showPaymentButton && (
              screens.xs ? (
                <Tooltip title="Thanh toán">
                  <Button
                    icon={<DollarOutlined />}
                    size="small"
                    onClick={() => {
                      navigate('/payment', {
                        state: {
                          tempBookingKey: record.tempBookingKey,
                          orderCode: record.orderCode,
                          bookingCode: record.bookingCode,
                          bookingData: record
                        }
                      })
                    }}
                    className="payment-btn"
                    type="primary"
                    danger
                    shape="round"
                  />
                </Tooltip>
              ) : (
                <Button
                  icon={<DollarOutlined />}
                  size="middle"
                  onClick={() => {
                    navigate('/payment', {
                      state: {
                        tempBookingKey: record.tempBookingKey,
                        orderCode: record.orderCode,
                        bookingCode: record.bookingCode,
                        bookingData: record
                      }
                    })
                  }}
                  className="payment-btn"
                  type="primary"
                  danger
                  shape="round"
                >
                  Thanh toán
                </Button>
              )
            )}
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
        <Card className="header-card" align="center" title = {"Lịch sử đặt phòng của bạn"}>
          <Row>
          <Col xs={24} sm={24} style={{ textAlign: screens.xs ? 'left' : 'right' }}>
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
              // showSizeChanger: true,
              // showQuickJumper: true,
              // showTotal: (total, range) => 
              //   `${range[0]}-${range[1]} của ${total} booking`,
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
              <Space direction="vertical" size={1}>
                <Text strong>Chi tiết booking</Text>
                <Text>Mã: {detailModal.data.id}</Text>
              </Space>
            ) : 'Chi tiết booking'
          }
          onCancel={() => setDetailModal({ visible: false, data: null })}
          className="detail-modal"
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
            // đã đánh giá thì ko đánh giá nữa
            detailModal.data && ['checked_out', 'completed'].includes(detailModal.data.status) && (
              <>
                <Divider />
                <Space>
                  {detailModal.data.hasReview ? (
                    <Tooltip title="Bạn đã đánh giá cho loại phòng này">
                      <span>
                        <Button type="primary" disabled>
                          Viết đánh giá
                        </Button>
                      </span>
                    </Tooltip>
                  ) : (
                    <Button 
                      type="primary" 
                      onClick={() => {
                        if (detailModal.data.hasReview) return
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
                  )}
                </Space>
              </>
            ),
            <Button key="close" onClick={() => setDetailModal({ visible: false, data: null })}>Đóng</Button>
          ]}
          width={modalWidth}
          centered
        >
          {detailModal.data && (
            <div className="detail-modal-body">
              {/* Hàng 1: 2 card */}
              <div className="detail-grid-row">
                <div className="detail-card">
                  <div className="detail-card-header">
                    <Space align="center" size="small">
                      <Text strong>Trạng thái:</Text>
                      <Tag color={getBookingStatusColor(detailModal.data.status)}>
                        {getBookingStatusText(detailModal.data.status)}
                      </Tag>
                    </Space>
                  </div>
                  <div className="detail-card-divider"></div>
                  <div className="detail-card-content">
                    {/* <div className="detail-info-item">
                      <span className="detail-info-label">Khách sạn:</span>
                      <span className="detail-info-value">{detailModal.data.hotelName}</span>
                    </div> */}
                    <div className="detail-info-item">
                      <span className="detail-info-label">Loại phòng:</span>
                      <span className="detail-info-value">{detailModal.data.roomType}</span>
                    </div>
                    <div className="detail-info-item">
                      <span className="detail-info-label">Số khách:</span>
                      <span className="detail-info-value">{detailModal.data.guests}</span>
                    </div>
                
                    {/* {detailModal.data.roomNum && (
                      <div className="detail-info-item">
                        <span className="detail-info-label">Số phòng:</span>
                        <span className="detail-info-value">{detailModal.data.roomNum}</span>
                      </div>
                    )} */}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-card-content">
                    <div className="detail-info-item">
                      <span className="detail-info-label">Tổng tiền:</span>
                      <span className="detail-info-value strong">{formatCurrency(detailModal.data.totalAmount)}</span>
                    </div>
                    <div className="detail-info-item">
                      <span className="detail-info-label">Thanh toán:</span>
                      <span className="detail-info-value">
                        <Space size={4}>
                          <Tag color={getPaymentStatusColor(detailModal.data.paymentStatus)}>
                            {getPaymentStatusText(detailModal.data.paymentStatus)}
                          </Tag>
                          {detailModal.data.paymentStatus === 'partial_refunded' && (
                            <Tooltip
                              title="Yêu cầu hoàn tiền của bạn đang được xử lý. Vui lòng kiểm tra email hoặc liên hệ khách sạn để biết thêm chi tiết."
                              placement="top"
                            >
                              <InfoCircleOutlined 
                                style={{ 
                                  color: '#faad14', 
                                  cursor: 'pointer',
                                  fontSize: '16px'
                                }} 
                              />
                            </Tooltip>
                          )}
                        </Space>
                      </span>
                    </div>
                    <div className="detail-info-item">
                      <span className="detail-info-label">Ngày đặt:</span>
                      <span className="detail-info-value">{formatDateTime(detailModal.data.bookingDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hiển thị thông tin chính sách hủy nếu booking chưa thanh toán */}
              {detailModal.data && 
               detailModal.data.status === 'confirmed' &&
               detailModal.data.paymentStatus === 'pending' && (
                <>
                  <div className="detail-divider"></div>
                  <Alert
                    type="info"
                    showIcon
                    className="detail-alert"
                    message="Chính sách hủy áp dụng sau khi bạn hoàn tất thanh toán"
                    description="Vui lòng thanh toán đầy đủ để kích hoạt các quyền lợi hoàn tiền theo chính sách của khách sạn."
                  />
                </>
              )}

              {/* Hàng 2: 2 card */}
              <div className="detail-divider"></div>
              <div className="detail-grid-row">
                <div className="detail-card">
                  <div className="detail-card-title">Thông tin khách hàng</div>
                  <div className="detail-card-content">
                    <div className="detail-info-item">
                      <span className="detail-info-label">Họ tên:</span>
                      <span className="detail-info-value">{user?.full_name}</span>
                    </div>
                    <div className="detail-info-item">
                      <span className="detail-info-label">Số điện thoại:</span>
                      <span className="detail-info-value">{user?.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="detail-info-item">
                      <span className="detail-info-label">Email:</span>
                      <span className="detail-info-value">{user?.email}</span>
                    </div>
                    {detailModal.data.note && (
                      <div className="detail-info-item">
                        <span className="detail-info-label">Ghi chú:</span>
                        <span className="detail-info-value">{detailModal.data.note}</span>
                      </div>
                    )}
                  
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-card-title">Thời gian lưu trú</div>
                  <div className="detail-card-content">
                    <div className="detail-info-item">
                      <span className="detail-info-label">Check-in:</span>
                      <span className="detail-info-value">{formatDateWithTime(detailModal.data.checkInDate, 14, 0)}</span>
                    </div>
                    <div className="detail-info-item">
                      <span className="detail-info-label">Check-out:</span>
                      <span className="detail-info-value">{formatDateWithTime(detailModal.data.checkOutDate, 12, 0)}</span>
                    </div>
                    <div className="detail-info-item">
                      <span className="detail-info-label">Hình thức đặt:</span>
                      <span className="detail-info-value">{detailModal.data.bookingType}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dịch vụ kèm theo */}
              {Array.isArray(detailModal.data.services) && detailModal.data.services.length > 0 && (
                <>
                  <div className="detail-divider"></div>
                  <div className="detail-card detail-card-full">
                    <div className="detail-card-title">Dịch vụ kèm theo</div>
                    <div className="detail-card-content">
                      <div className="detail-services-list">
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
                      </div>
                    </div>
                  </div>
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
