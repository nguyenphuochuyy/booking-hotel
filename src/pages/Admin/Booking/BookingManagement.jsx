import React, { useState, useEffect, useMemo } from 'react'
import {
  Table, Button, Space, Modal, Form, Input, Select, message,
  Popconfirm, Tag, Card, Row, Col, Statistic, Tooltip,
  Typography, Badge, Divider, Empty, Spin, DatePicker, InputNumber
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  CalendarOutlined, ReloadOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  UserOutlined, CreditCardOutlined, EyeOutlined, PrinterOutlined,
  CustomerServiceFilled,ClearOutlined, 
  KeyOutlined
} from '@ant-design/icons'
import {
  getAllBookings, getBookingById, cancelBooking, cancelBookingAdmin, markRefundCompleted,
  getAllHotels, getAllRoomTypes, getAllUsers,
  checkOutGuest,
  checkInGuest,
  createWalkInBooking,
  getAvailableRoomsForType,
  generateInvoicePDF,
  viewInvoice,
  getInfoRefundBooking,
  getAllServices,
  addServiceToBooking
} from '../../../services/admin.service'
import CheckInOut from '../../../components/CheckInOut/CheckInOut'
import formatPrice from '../../../utils/formatPrice'
import formatDateTime from '../../../utils/formatDateTime'
import './BookingManagement.css'
const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

// Format date to dd/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const BookingManagement = () => {
  const [bookings, setBookings] = useState([])
  const [hotels, setHotels] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [isCheckInModalVisible, setIsCheckInModalVisible] = useState(false)
  const [isCheckOutModalVisible, setIsCheckOutModalVisible] = useState(false)
  const [editingBooking, setEditingBooking] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const [typeFilter, setTypeFilter] = useState(null)
  const [sortBy, setSortBy] = useState(null) // 'status' | 'type'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' | 'desc'
  const [dateRange, setDateRange] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [form] = Form.useForm()
  const [walkInForm] = Form.useForm()
  const [walkInLoading, setWalkInLoading] = useState(false)
  const [availableRooms, setAvailableRooms] = useState([])
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [selectedRoomType, setSelectedRoomType] = useState(null)
  const [cancelModal, setCancelModal] = useState({ visible: false, bookingId: null, bookingCode: null, reason: '', refundManually: false })
  const [cancelSubmitting, setCancelSubmitting] = useState(false)
  const [refundSubmitting, setRefundSubmitting] = useState(false)
  const [refundInfo, setRefundInfo] = useState(null) // Thông tin hoàn tiền
  const [loadingRefundInfo, setLoadingRefundInfo] = useState(false)
  const [isAddServiceModalVisible, setIsAddServiceModalVisible] = useState(false)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [servicesList, setServicesList] = useState([])
  const [selectedServices, setSelectedServices] = useState({})
  const [paymentType, setPaymentType] = useState('postpaid') // 'postpaid' hoặc 'prepaid'
  const [addingServices, setAddingServices] = useState(false)

  const handleLoadAvailableRooms = async () => {
    try {
      const values = walkInForm.getFieldsValue()
      const { room_type_id, num_nights } = values
      if (!room_type_id) return
      const today = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const check_in_date = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
      const d2 = new Date(today)
      const nights = Number(num_nights) > 0 ? Number(num_nights) : 1
      d2.setDate(d2.getDate() + nights)
      const check_out_date = `${d2.getFullYear()}-${pad(d2.getMonth() + 1)}-${pad(d2.getDate())}`
      const res = await getAvailableRoomsForType({ room_type_id, check_in_date, check_out_date })
      const rooms = res?.rooms || []
      setAvailableRooms(rooms)
      if (rooms.length === 0) {
        walkInForm.setFieldsValue({ room_id: undefined })
      }
    } catch (e) {
      setAvailableRooms([])
    }
  }

  const handleCreateWalkIn = async () => {
    try {
      const values = await walkInForm.validateFields()
      setWalkInLoading(true)
      const today = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const check_in_date = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
      const d2 = new Date(today)
      const nights = Number(values.num_nights) > 0 ? Number(values.num_nights) : 1
      d2.setDate(d2.getDate() + nights)
      const check_out_date = `${d2.getFullYear()}-${pad(d2.getMonth() + 1)}-${pad(d2.getDate())}`

      const payload = {
        full_name: values.full_name,
        phone: values.phone,
        national_id: values.national_id,
        room_type_id: values.room_type_id,
        room_id: values.room_id,
        check_in_date,
        check_out_date,
        num_person: values.num_person || 1
      }
      const res = await createWalkInBooking(payload)
      if (res) {
        message.success('Tạo đặt phòng thành công!')
        setIsModalVisible(false)
        walkInForm.resetFields()
        fetchBookings()
      }
    } catch (error) {
      if (error?.errorFields) return
      message.error('Không thể tạo đặt phòng!')
    } finally {
      setWalkInLoading(false)
    }
  }

  // Fetch bookings data (client-side pagination)
  const fetchBookings = async () => {
    setLoading(true)
    try {
      const params = { page: 1, limit: 1000 }
      // Add date range filter
      if (dateRange && dateRange.length === 2) {
        params.check_in_date = dateRange[0].format('YYYY-MM-DD')
        params.check_out_date = dateRange[1].format('YYYY-MM-DD')
      }

      const response = await getAllBookings(params)
      const data = response.bookings || []
      setBookings(data)
      setPagination(prev => ({
        ...prev,
        total: data.length
      }))
    } catch (error) {
      console.error('Error fetching bookings:', error)
      message.error('Không thể tải danh sách đặt phòng')
    } finally {
      setLoading(false)
    }
  }

  // Fetch hotels for dropdown
  const fetchHotels = async () => {
    try {
      const response = await getAllHotels({ limit: 1000 })
      setHotels(response.hotels || [])
    } catch (error) {
      console.error('Error fetching hotels:', error)
    }
  }

  // Fetch room types for dropdown
  const fetchRoomTypes = async () => {
    try {
      const response = await getAllRoomTypes({ limit: 1000 })
      setRoomTypes(response.roomTypes || [])
    } catch (error) {
      console.error('Error fetching room types:', error)
    }
  }

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await getAllUsers({ limit: 1000 })
      setUsers(response.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    fetchBookings()
    fetchHotels()
    fetchRoomTypes()
    fetchUsers()
  }, [])

  const hasActiveFilters = useMemo(() => {
    const hasSearch = Boolean(searchText?.trim())
    const hasStatus = Boolean(statusFilter)
    const hasType = Boolean(typeFilter)
    const hasDateRange = Boolean(dateRange && dateRange.length === 2)
    return hasSearch || hasStatus || hasType || hasDateRange
  }, [searchText, statusFilter, typeFilter, dateRange])

  // lọc danh sách đặt phòng theo từ khóa, trạng thái, loại đặt
  const filteredBookings = useMemo(() => {
    let filtered = bookings

    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(booking => {
        const bookingCode = booking.booking_code?.toLowerCase() || ''
        const userName = booking.user?.full_name?.toLowerCase() || ''
        const userEmail = booking.user?.email?.toLowerCase() || ''
        // Lấy room_type từ booking trực tiếp hoặc từ booking_rooms
        const roomTypeName = (booking.room_type?.room_type_name ||
          booking.booking_rooms?.[0]?.room?.room_type?.room_type_name ||
          '').toLowerCase()

        return bookingCode.includes(searchLower) ||
          userName.includes(searchLower) ||
          userEmail.includes(searchLower) ||
          roomTypeName.includes(searchLower)
      })
    }

    if (statusFilter) {
      filtered = filtered.filter(booking => booking.booking_status === statusFilter)
    }

    if (typeFilter) {
      filtered = filtered.filter(booking => booking.booking_type === typeFilter)
    }

    // Lọc theo khoảng ngày (check_in_date hoặc check_out_date)
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange
      filtered = filtered.filter(booking => {
        if (!booking.check_in_date && !booking.check_out_date) return false
        
        // Ant Design RangePicker trả về dayjs objects
        const start = startDate ? startDate.startOf('day').toDate() : null
        const end = endDate ? endDate.endOf('day').toDate() : null
        
        if (!start || !end) return false
        
        const checkIn = booking.check_in_date ? new Date(booking.check_in_date) : null
        const checkOut = booking.check_out_date ? new Date(booking.check_out_date) : null
        
        // Kiểm tra nếu check_in_date hoặc check_out_date nằm trong khoảng
        if (checkIn) {
          checkIn.setHours(0, 0, 0, 0)
          if (checkIn >= start && checkIn <= end) return true
        }
        if (checkOut) {
          checkOut.setHours(0, 0, 0, 0)
          if (checkOut >= start && checkOut <= end) return true
        }
        return false
      })
    }

    // Sort mapping for status
    const statusRank = {
      pending: 1,
      confirmed: 2,
      checked_in: 3,
      checked_out: 4,
      cancelled: 5,
      completed: 6
    }

    if (sortBy === 'status') {
      filtered = [...filtered].sort((a, b) => {
        const av = statusRank[a.booking_status] || 999
        const bv = statusRank[b.booking_status] || 999
        return sortOrder === 'asc' ? av - bv : bv - av
      })
    } else if (sortBy === 'type') {
      // online before walkin by default
      const typeRank = { online: 1, walkin: 2 }
      filtered = [...filtered].sort((a, b) => {
        const av = typeRank[a.booking_type] || 999
        const bv = typeRank[b.booking_type] || 999
        return sortOrder === 'asc' ? av - bv : bv - av
      })
    }

    return filtered
  }, [bookings, searchText, statusFilter, typeFilter, sortBy, sortOrder, dateRange])

  // Handle xem chi tiết đặt phòng
  const handleViewDetails = async (bookingId) => {
    try {
      const response = await getBookingById(bookingId)
      const booking = response.booking
      setSelectedBooking(booking)
      setIsDetailModalVisible(true)
      
      // Nếu booking có trạng thái đã hủy, gọi API lấy thông tin hoàn tiền
      if (booking.booking_status === 'cancelled') {
        setLoadingRefundInfo(true)
        try {
          const refundResponse = await getInfoRefundBooking(bookingId)
          console.log(refundResponse);
          // Giả định API trả về refund info trong response.booking hoặc response
          setRefundInfo(refundResponse?.booking || refundResponse || null)
        } catch (refundError) {
          console.error('Error fetching refund info:', refundError)
          setRefundInfo(null)
        } finally {
          setLoadingRefundInfo(false)
        }
      } else {
        // Reset refund info nếu không phải cancelled
        setRefundInfo(null)
      }
    } catch (error) {
      console.error('Error fetching booking details:', error)
      message.error('Không thể tải chi tiết đặt phòng')
    }
  }



  // hanlde check in 
  const handleCheckIn = async (bookingCode) => {
    setLoading(true)
    try {
      const response = await checkInGuest(bookingCode)
      if (response.statusCode === 200) {
        message.success('Check-in thành công!')
        fetchBookings()
      }
      else {
        const errorMessage = response?.message || 'Không thể check-in đặt phòng!'
        message.error(errorMessage)
      }
    } catch (error) {
      console.error('Error checking in:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể check-in đặt phòng!'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  // handle check out
  const handleCheckOut = async (bookingCode) => {
    setLoading(true)
    try {
      const response = await checkOutGuest(bookingCode)
      if (response.statusCode === 200) {
        message.success('Check-out thành công!')
        fetchBookings(pagination.current, pagination.pageSize)
      } else {
        message.error('Không thể check-out đặt phòng!')
      }
      fetchBookings()
    } catch (error) {
      console.error('Error checking out:', error)
      message.error('Không thể check-out đặt phòng!')
    } finally {
      setLoading(false)
    }
  }

  // Handle print invoice
  const handlePrintInvoice = async (bookingId) => {
    if (!bookingId) {
      message.error('Không tìm thấy thông tin đặt phòng!')
      return
    }
    try {
      setLoading(true)
      // Gọi API để tạo PDF
      const blob = await generateInvoicePDF(bookingId)

      // Tạo URL từ blob
      const url = window.URL.createObjectURL(blob)

      // Tạo link tải xuống
      const link = document.createElement('a')
      link.href = url

      // Lấy tên file từ response header hoặc đặt tên mặc định
      const bookingCode = selectedBooking?.booking_code || 'booking'
      link.download = `invoice-${bookingCode}.pdf`
      // Trigger download
      document.body.appendChild(link)
      link.click()
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      message.success('Đã tải hóa đơn thành công!')
    } catch (error) {
      message.error('Không thể tải hóa đơn!')
    } finally {
      setLoading(false)
    }
  }
  // Kiểm tra xem có thể hủy booking không (chưa tới check-in và chưa checked_out)
  const canCancelBooking = (booking) => {
    if (!booking) return false
    // Không thể hủy nếu đã checked_out
    if (booking.booking_status === 'checked_out') return false
    // Kiểm tra xem đã tới check-in chưa (14:00 ngày check-in)
    if (booking.check_in_date) {
      const checkInDate = new Date(booking.check_in_date)
      checkInDate.setHours(14, 0, 0, 0)
      const now = new Date()
      // Nếu đã qua thời gian check-in thì không cho hủy
      if (now >= checkInDate) return false
    }
    return true
  }

  // Mở modal hủy booking
  const handleOpenCancelModal = (booking) => {
    setCancelModal({
      visible: true,
      bookingId: booking.booking_id,
      bookingCode: booking.booking_code,
      reason: '',
      refundManually: false
    })
  }
  // Xử lý hủy booking (admin)
  const handleCancelBookingAdmin = async () => {
    if (!cancelModal.bookingId) {
      message.error('Không xác định được booking cần hủy')
      return
    }
    if (!cancelModal.reason || cancelModal.reason.trim().length < 3) {
      message.warning('Vui lòng nhập lý do hủy (tối thiểu 3 ký tự)')
      return
    }

    setCancelSubmitting(true)
    try {
      await cancelBookingAdmin(
        cancelModal.bookingId,
        cancelModal.reason.trim(),
        cancelModal.refundManually
      )
      message.success('Hủy đặt phòng thành công!')
      setCancelModal({ visible: false, bookingId: null, bookingCode: null, reason: '', refundManually: false })
      setIsDetailModalVisible(false)
      fetchBookings()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      message.error(error?.response?.data?.message || 'Không thể hủy đặt phòng!')
    } finally {
      setCancelSubmitting(false)
    }
  }

  // Xử lý đánh dấu đã hoàn tiền
  const handleMarkRefundCompleted = async (bookingId) => {
    if (!bookingId) {
      message.error('Không xác định được booking')
      return
    }
   const totalRefunded = refundInfo.payment_summary.total_refunded

    setRefundSubmitting(true)
    try {
      // Gọi API đánh dấu hoàn tiền
      // Backend sẽ tự kiểm tra và validate số tiền theo chính sách (1h, 48h, etc.)
      const response = await markRefundCompleted(
        bookingId, 
        totalRefunded, 
        'banking', 
        ''
      )
      // Hiển thị thông báo thành công từ response
      message.success('Đã đánh dấu hoàn tiền thành công!')
      
      // Reload lại booking details để cập nhật trạng thái
      const updatedResponse = await getBookingById(bookingId)
      const updatedBooking = updatedResponse.booking
      setSelectedBooking(updatedBooking)
      
      // Reload lại refund info nếu booking vẫn là cancelled
      if (updatedBooking.booking_status === 'cancelled') {
        try {
          const refundResponse = await getInfoRefundBooking(bookingId)
          setRefundInfo(refundResponse?.booking || refundResponse || null)
        } catch (refundError) {
          console.error('Error fetching refund info:', refundError)
          setRefundInfo(null)
        }
      } else {
        setRefundInfo(null)
      }
      
      // Reload lại danh sách bookings để cập nhật payment_status
      await fetchBookings()
    } catch (error) {
      console.error('Error marking refund completed:', error)
      
      // Xử lý lỗi chi tiết từ backend
      const errorResponse = error?.response?.data
      if (errorResponse) {
        const errorMessage = errorResponse.message || 'Không thể đánh dấu hoàn tiền!'
        
        // Nếu có thông tin về số tiền hoàn tối đa cho phép, hiển thị
        if (errorResponse.allowed_max_refund !== undefined) {
          message.error(
            `${errorMessage}\nSố tiền hoàn tối đa cho phép: ${formatPrice(errorResponse.allowed_max_refund)}`
          )
        } else {
          message.error(errorMessage)
        }
      } else {
        message.error(error?.message || 'Không thể đánh dấu hoàn tiền!')
      }
    } finally {
      setRefundSubmitting(false)
    }
  }

  // Handle table change (client-side pagination)
  const handleTableChange = (paginationInfo) => {
    setPagination(paginationInfo)
  }

  // Handle filter changes
  const handleFilterChange = () => {
    const filters = {}
    if (statusFilter) filters.status = statusFilter
    if (typeFilter) filters.type = typeFilter
    fetchBookings()
  }
  // handle refresh
  const handleRefresh = () => {
    setSearchText('')
    setStatusFilter(null)
    setTypeFilter(null)
    setSortBy(null)
    setSortOrder('asc')
    setDateRange(null)
    fetchBookings()
    message.success('Đã làm mới danh sách đặt phòng')
  }
  // lấy tag cho trạng thái đặt phòng
  const getStatusTag = (status) => {
    const statusConfig = {
      confirmed: { color: 'blue', icon: <CheckCircleOutlined />, text: 'Đã xác nhận' },
      checked_in: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đã nhận phòng' },
      checked_out: { color: 'purple', icon: <CheckCircleOutlined />, text: 'Đã trả phòng' },
      cancelled: { color: 'red', icon: <CloseCircleOutlined />, text: 'Đã hủy' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    )
  }

  // lấy tag cho trạng thái thanh toán
  const getPaymentStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Chờ thanh toán' },
      paid: { color: 'green', text: 'Đã thanh toán' },
      refunded: { color: 'blue', text: 'Đã hoàn tiền' },
      partial_refunded: { color: 'cyan', text: 'Hoàn tiền một phần' },
      failed: { color: 'red', text: 'Thanh toán thất bại' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <Tag color={config.color}>
        {config.text}
      </Tag>
    )
  }

  // tính toán thống kê số lượng và doanh thu
  const statistics = useMemo(() => {
    const dataSource = hasActiveFilters ? filteredBookings : bookings
    const stats = {
      total: dataSource.length,
      confirmed: dataSource.filter(b => b.booking_status === 'confirmed').length,
      checkedIn: dataSource.filter(b => b.booking_status === 'checked_in').length,
      checkedOut: dataSource.filter(b => b.booking_status === 'checked_out').length,
      cancelled: dataSource.filter(b => b.booking_status === 'cancelled').length,
      totalRevenue: dataSource
        .filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + (parseFloat(b.final_price) || 0), 0)
    }
    return stats
  }, [filteredBookings, bookings, hasActiveFilters])

  // Đồng bộ tổng số record cho pagination sau khi lọc
  useEffect(() => {
    setPagination(prev => {
      const total = filteredBookings.length
      const maxPage = Math.max(1, Math.ceil(total / prev.pageSize))
      const current = Math.min(prev.current, maxPage)
      return { ...prev, total, current }
    })
  }, [filteredBookings.length])

  // cột cho bảng danh sách đặt phòng
  const columns = [
    {
      title: 'Mã đặt phòng',
      dataIndex: 'booking_code',
      key: 'booking_code',
      width: 100,
      align: 'center',
      render: (code) => (
        <Text code style={{ fontSize: '16px', color: 'blue' , fontWeight: 'bold' }}>
          {code}
        </Text>
      )
    },
    {
      title: 'Khách hàng',
      dataIndex: 'user',
      key: 'user',
      width: 150,
      render: (user) => (
        <div className="user-info">
          <div>
            <Text strong>{user?.full_name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {user?.email}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Loại phòng',
      key: 'room_type',
      width: 150,
      render: (_, record) => {
        // Lấy room_type từ booking trực tiếp hoặc từ booking_rooms
        const roomTypeName = record.room_type?.room_type_name ||
          record.booking_rooms?.[0]?.room?.room_type?.room_type_name ||
          'Chưa xác định'

        // Lấy danh sách phòng từ booking_rooms
        const rooms = record.booking_rooms?.map(br => br.room?.room_num).filter(Boolean) || []
        const numRooms = rooms.length || record.num_rooms || 0

        return (
          <div>
            <Text strong>{roomTypeName}</Text>
            {numRooms > 0 && (
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {numRooms === 1 && rooms.length > 0
                    ? `Phòng ${rooms[0]}`
                    : numRooms > 1
                      ? `${numRooms} phòng ${rooms.length > 0 ? `(${rooms.slice(0, 2).join(', ')}${rooms.length > 2 ? '...' : ''})` : ''}`
                      : `${numRooms} phòng`
                  }
                </Text>
                <br />
                {/* Hiển thị số khách của booking đó */}
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {record.num_person} khách
                </Text>
              </div>
            )}
          </div>
        )
      }
    },
    {
      title: 'Ngày nhận/trả',
      key: 'dates',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="date-info">
          <div>
            <CalendarOutlined style={{ color: '#52c41a', marginRight: 4 }} />
            <Text strong>{formatDate(record.check_in_date)}</Text>
          </div>
          <div>
            <CalendarOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
            <Text strong>{formatDate(record.check_out_date)}</Text>
          </div>
        </div>
      )
    },
    // {
    //   title: 'Số khách',
    //   dataIndex: 'num_person',
    //   key: 'num_person',
    //   width: 80,
    //   align: 'center',
    //   render: (num) => (
    //     <Badge count={num} style={{ backgroundColor: '#1890ff' }} />
    //   )
    // },
    {
      title: 'Tổng tiền',
      dataIndex: 'final_price',
      key: 'final_price',
      width: 120,
      align: 'left',
      render: (price) => (
        <Text strong style={{ color: '#000' }}>
          {formatPrice(price)}
        </Text>
      ),
      sorter: (a, b) => (parseFloat(a.final_price) || 0) - (parseFloat(b.final_price) || 0)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'booking_status',
      key: 'booking_status',
      width: 120,
      align: 'left',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Đã xác nhận', value: 'confirmed' },
        { text: 'Đã nhận phòng', value: 'checked_in' },
        { text: 'Đã trả phòng', value: 'checked_out' },
        { text: 'Đã hủy', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.booking_status === value
    },
    {
      title: 'Thanh toán',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 100,
      align: 'left',
      render: (status) => getPaymentStatusTag(status),
      filters: [
        { text: 'Chờ thanh toán', value: 'pending' },
        { text: 'Đã thanh toán', value: 'paid' },
        { text: 'Đã hoàn tiền', value: 'refunded' },
        { text: 'Thanh toán thất bại', value: 'failed' },
      ],
      onFilter: (value, record) => record.payment_status === value
    },
    // {
    //   title: 'Ngày tạo',
    //   dataIndex: 'created_at',
    //   key: 'created_at',
    //   width: 120,
    //   render: (date) => formatDate(date),
    //   sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    // },
    {
      title: 'Hành động',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record.booking_id)}
          >
            Chi tiết
          </Button>
        </Tooltip>
      )
    }
  ]

  return (
    <div className="booking-management"
      style={{ padding: '20px' }}
    >
      {/* Header */}
      <div className="booking-header">
        <h2 className="page-title">
        Quản lý đặt phòng
        </h2>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="statistics-row">
        <Col xs={12} sm={12} md={6} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Tổng đặt phòng"
              value={statistics.total}
              valueStyle={{ color: '#262626' , fontWeight: 'bold' , fontSize: '24px' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Đã xác nhận"
              value={statistics.confirmed}
        valueStyle={{ color: '#1677ff' , fontWeight: 'bold' , fontSize: '24px' }}
        prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Đã nhận phòng"
              value={statistics.checkedIn}
              valueStyle={{ color: '#13c2c2',fontWeight: 'bold' , fontSize: '24px'  }}
              prefix={<KeyOutlined />}
              
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Đã trả phòng"
              value={statistics.checkedOut}
              valueStyle={{ color: '#c08a19 ',fontWeight: 'bold' , fontSize: '24px'  }}
              prefix={<ClearOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Đã hủy"
              value={statistics.cancelled}
              valueStyle={{ color: '#CC0000',fontWeight: 'bold' , fontSize: '24px'  }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Tổng doanh thu"
              value={statistics.totalRevenue.toLocaleString('vi-VN')}
              valueStyle={{ color: '#008000' ,fontWeight: 'bold' , fontSize: '24px'}}
            />
          </Card>
        </Col>
      </Row>
      {/* Toolbar tìm kiếm và lọc , tạo mới đặt phòng mới */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Input
            placeholder="Tìm kiếm theo tên khách hàng, email, mã đặt phòng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="large"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Select
            style={{ width: '100%' }}
            size="large"
            placeholder="Lọc theo trạng thái"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            allowClear
          >
            <Option value="confirmed">Đã xác nhận</Option>
            <Option value="cancelled">Đã hủy</Option>
            <Option value="checked_in">Đã nhận phòng</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8}>
          <RangePicker
            style={{ width: '100%' }}
            size="large"
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            allowClear
          />
        </Col>
        
      </Row>
   
   
      {/* Check-in/Check-out Buttons */}
      {/* <Row gutter={[16, 16]} className="statistics-row">
        <Col span={12}>
          <Space size="middle" style={{ width: '100%', justifyContent: 'start' }}>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={() => setIsCheckInModalVisible(true)}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Check-in
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<ClockCircleOutlined />}
              onClick={() => setIsCheckOutModalVisible(true)}
              style={{ background: '#722ed1', borderColor: '#722ed1' }}
            >
              Check-out
            </Button>
    
            <Button
              type="primary"
              size="large"
              icon={<ReloadOutlined />}
              onClick={() => handleRefresh()}
            >
              Làm mới
            </Button>
          </Space>
        </Col>
      </Row> */}

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredBookings}
        rowKey="booking_id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đặt phòng`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        onChange={handleTableChange}
        loading={loading}
        scroll={{ x: 'min-content' }}
        locale={{
          emptyText: (
            <Empty
              description="Không có dữ liệu đặt phòng"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        }}
      />

      {/* Booking Details Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Chi tiết đặt phòng</span>
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false)
          setSelectedBooking(null)
          setRefundInfo(null) // Reset refund info khi đóng modal
        }}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          // Cho phép thêm dịch vụ khi booking_status là confirmed hoặc checked_in
          (selectedBooking?.booking_status === 'confirmed' || selectedBooking?.booking_status === 'checked_in') && (
            <Button
              key="addService"
              icon={<CustomerServiceFilled/>}
              onClick={async () => {
                try {
                  setIsAddServiceModalVisible(true)
                  setServicesLoading(true)
                  setSelectedServices({})
                  setPaymentType('postpaid')
                  // Thử lọc theo khách sạn nếu có, nếu không sẽ lấy tất cả
                  const hotelId =
                    selectedBooking?.room_type?.hotel_id ||
                    selectedBooking?.booking_rooms?.[0]?.room?.room_type?.hotel_id ||
                    undefined
                  const res = await getAllServices(hotelId ? { hotel_id: hotelId, limit: 1000 } : { limit: 1000 })
                  const list = res?.services || res?.data?.services || res?.items || []
                  setServicesList(Array.isArray(list) ? list : [])
                } catch (e) {
                  setServicesList([])
                  message.error('Không thể tải danh sách dịch vụ')
                } finally {
                  setServicesLoading(false)
                }
              }}
            >
              Thêm dịch vụ
            </Button>
          ),
          // Nút hủy phòng (chỉ hiển thị nếu trạng thái là confirmed và chưa tới check-in)
          selectedBooking?.booking_status === 'confirmed' && canCancelBooking(selectedBooking) && (
            <Button
              key="cancel"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setIsDetailModalVisible(false)
                handleOpenCancelModal(selectedBooking)
              }}
            >
              Hủy phòng
            </Button>
          ),
          selectedBooking?.booking_status === 'confirmed' && (() => {
            return (
              <Tooltip title={"Click để check-in khách hàng" }>
                <Button
                  key="checkin"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    setIsDetailModalVisible(false)
                    handleCheckIn(selectedBooking?.booking_code)
                  }}
                >
                  Check-in
                </Button>
              </Tooltip>
            )
          })(),
          selectedBooking?.booking_status === 'checked_in' && (
            <Button
              key="checkout"
              type="primary"
              icon={<ClockCircleOutlined />}
              onClick={() => {
                setIsDetailModalVisible(false)
                handleCheckOut(selectedBooking?.booking_code)

              }}
              style={{ background: '#722ed1', borderColor: '#722ed1' }}
            >
              Check-out
            </Button>
          ),

          selectedBooking?.booking_status === 'checked_out' && (
            <Button
              key="print"
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() => handlePrintInvoice(selectedBooking?.booking_id)}
              loading={loading}
            >
              In hóa đơn
            </Button>
          )
        ]}
        destroyOnClose
        centered
      >
        {selectedBooking && (
          <div className="booking-details">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Thông tin đặt phòng" size="small">
                  <div className="detail-item">
                    <Text strong>Mã đặt phòng:</Text>
                    <Text code>{selectedBooking.booking_code}</Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Trạng thái:</Text>
                    {getStatusTag(selectedBooking.booking_status)}
                  </div>
                  <div className="detail-item">
                    <Text strong>Loại đặt:</Text>
                    <Tag color={selectedBooking.booking_type === 'online' ? 'blue' : 'green'}>
                      {selectedBooking.booking_type === 'online' ? 'Online' : 'Walk-in'}
                    </Tag>
                  </div>
                  <div className="detail-item">
                    <Text strong>Ngày tạo:</Text>
                    <Text>{formatDateTime(selectedBooking.created_at)}</Text>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Thông tin khách hàng" size="small">
                  <div className="detail-item">
                    <Text strong>Tên:</Text>
                    <Text>{selectedBooking.user?.full_name}</Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Email:</Text>
                    <Text>{selectedBooking.user?.email}</Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Số điện thoại:</Text>
                    <Text>{selectedBooking.user?.phone}</Text>
                  </div>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="Thông tin phòng" size="small" >
                  <div className="detail-item">
                    <Text strong>Loại phòng:</Text>
                    <Text>
                      {selectedBooking.room_type?.room_type_name ||
                        selectedBooking.booking_rooms?.[0]?.room?.room_type?.room_type_name ||
                        'Chưa xác định'}
                    </Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Số phòng:</Text>
                    <Text>
                      {selectedBooking.booking_rooms && selectedBooking.booking_rooms.length > 0
                        ? selectedBooking.booking_rooms
                          .map(br => br.room?.room_num)
                          .filter(Boolean)
                          .join(', ') || 'Chưa gán'
                        : selectedBooking.num_rooms
                          ? `${selectedBooking.num_rooms} phòng`
                          : 'Chưa gán'}
                    </Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Số khách:</Text>
                    <Text>{selectedBooking.num_person} người</Text>
                  </div>
                  {selectedBooking.num_rooms > 1 && (
                    <div className="detail-item">
                      <Text strong>Số lượng phòng:</Text>
                      <Text>{selectedBooking.num_rooms} phòng</Text>
                    </div>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Thông tin thanh toán" size="small">
                  <div className="detail-item">
                    <Text strong>Tổng tiền:</Text>
                    <Text strong style={{ color: '#52c41a' }}>
                      {formatPrice(selectedBooking.final_price || selectedBooking.total_price)}
                    </Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Trạng thái thanh toán:</Text>
                    {getPaymentStatusTag(selectedBooking.payment_status)}
                  </div>
                  <div className="detail-item">
                    <Text strong>Phương thức:</Text>
                    <Text>{selectedBooking.payment_status === 'paid' ? 'PayOS' : selectedBooking.payment_status === 'partial_refunded' ? 'Chờ hoàn tiền từ admin' : 'Admin chuyển khoản'}</Text>
                  </div>
                  
                  {/* Hiển thị thông tin hoàn tiền khi booking đã hủy */}
                  {selectedBooking.booking_status === 'cancelled' && (
                    <>
                      <Divider style={{ margin: '12px 0' }} />
                      {loadingRefundInfo ? (
                        <div style={{ textAlign: 'center', padding: '16px' }}>
                          <Spin size="small" />
                          <div style={{ marginTop: 8 }}>
                            <Text type="secondary">Đang tải thông tin hoàn tiền...</Text>
                          </div>
                        </div>
                      ) : refundInfo ? (
                        <>
                          <div className="detail-item" style={{ marginTop: 8 }}>
                            <Text strong>Số tiền khách được hoàn: </Text>
                            <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                              {formatPrice(refundInfo.payment_summary?.total_refunded)}
                            </Text>
                          </div>
                        </>
                      ) : (
                        <div className="detail-item" style={{ marginTop: 8 }}>
                          <Text type="secondary">Không có thông tin hoàn tiền</Text>
                        </div>
                      )}
                    </>
                  )}
                
                </Card>
              </Col>
            </Row>

            <Card title="Lịch trình" size="small" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div className="detail-item" >
                    <Text strong>Ngày nhận phòng: {formatDate(selectedBooking.check_in_date)}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="detail-item">
                    <Text >Ngày trả phòng:</Text>
                    <Text strong>{formatDate(selectedBooking.check_out_date)}</Text>
                  </div>
                </Col>
              </Row>
              {selectedBooking.check_in_time && (
                <div className="detail-item">
                  <Text strong>Thời gian check-in: </Text>
                  <Text>{formatDateTime(selectedBooking.check_in_time)}</Text>
                 
                </div>
              )}
              {selectedBooking.check_out_time && (
                <div className="detail-item">   
                  <Text strong>Thời gian check-out:</Text>
                  <Text strong>{new Date(selectedBooking.check_out_time).toLocaleString('vi-VN')}</Text>
                </div>
              )}
            </Card>

            {/* Hiển thị danh sách dịch vụ nếu có */}
            {selectedBooking.booking_services && selectedBooking.booking_services.length > 0 && (
              <Card 
                title={
                  <Space>
                    <CustomerServiceFilled />
                    <span>Dịch vụ đã sử dụng</span>
                  </Space>
                }
                size="small" 
                style={{ marginTop: 16 }}
              >
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', fontWeight: 600, padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ flex: 1 }}>Tên dịch vụ</div>
                    <div style={{ width: 100, textAlign: 'center' }}>Số lượng</div>
                    <div style={{ width: 120, textAlign: 'right' }}>Đơn giá</div>
                    <div style={{ width: 120, textAlign: 'right' }}>Thành tiền</div>
                    <div style={{ width: 100, textAlign: 'center' }}>Loại thanh toán</div>
                  </div>
                  {(() => {
                    const activeServices = selectedBooking.booking_services.filter(bs => bs.status !== 'cancelled')
                    return activeServices.map((bookingService, index) => {
                      const service = bookingService.service || {}
                      const unitPrice = parseFloat(bookingService.unit_price || bookingService.service?.price || 0)
                      const quantity = Number(bookingService.quantity || 1)
                      const totalPrice = parseFloat(bookingService.total_price || unitPrice * quantity)
                      
                      return (
                        <div 
                          key={bookingService.booking_service_id || index} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '10px 0', 
                            borderBottom: index < activeServices.length - 1 ? '1px solid #f5f5f5' : 'none'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <Text>{service.name || 'Dịch vụ không xác định'}</Text>
                          </div>
                          <div style={{ width: 100, textAlign: 'center' }}>
                            <Text>{quantity}</Text>
                          </div>
                          <div style={{ width: 120, textAlign: 'right' }}>
                            <Text>{formatPrice(unitPrice)}</Text>
                          </div>
                          <div style={{ width: 120, textAlign: 'right' }}>
                            <Text strong style={{ color: '#52c41a' }}>
                              {formatPrice(totalPrice)}
                            </Text>
                          </div>
                          <div style={{ width: 100, textAlign: 'center' }}>
                            <Tag color={bookingService.payment_type === 'prepaid' ? 'blue' : 'green'}>
                              {bookingService.payment_type === 'prepaid' ? 'Trả trước' : 'Trả sau'}
                            </Tag>
                          </div>
                        </div>
                      )
                    })
                  })()}
                  
                  {/* Tổng tiền dịch vụ */}
                  {(() => {
                    const totalServicesPrice = selectedBooking.booking_services
                      .filter(bs => bs.status !== 'cancelled')
                      .reduce((sum, bs) => {
                        const price = parseFloat(bs.total_price || 0)
                        return sum + price
                      }, 0)
                    
                    if (totalServicesPrice > 0) {
                      return (
                        <div style={{ 
                          marginTop: 12, 
                          paddingTop: 12, 
                          borderTop: '2px solid #f0f0f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Text strong style={{ fontSize: 14 }}>Tổng tiền dịch vụ:</Text>
                          <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                            {formatPrice(totalServicesPrice)}
                          </Text>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </Card>
            )}

            {/* Thông tin hủy phòng - chỉ hiển thị khi booking_status là cancelled */}
            {selectedBooking.booking_status === 'cancelled' && (
              <Card
                title={
                  <Space>
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    <Text strong>Thông tin hủy phòng</Text>
                  </Space>
                }
                size="small"
                style={{ marginTop: 16 }}
                headStyle={{ backgroundColor: '#fff1f0', borderColor: '#ffccc7' }}
                
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div className="detail-item">
                    <Text strong>Lý do hủy:</Text>
                    <div style={{ marginTop: 8 }}>
                      {selectedBooking.note ? (
                        <Text>{selectedBooking.note}</Text>
                      ) : (
                        <Text type="secondary">Không có thông tin</Text>
                      )}
                    </div>
                  </div>

                  <Divider style={{ margin: '8px 0' }} />

                  <div className="detail-item">
                    <Text strong>Trạng thái hoàn tiền:</Text>
                    <div style={{ marginTop: 8 }}>
                      {selectedBooking.payment_status === 'refunded' && (
                        <Text type="success" style={{ marginLeft: 8 }}>
                          ✓ Đã hoàn tiền đầy đủ
                        </Text>
                      )}
                      {selectedBooking.payment_status === 'partial_refunded' && (
                        <Text type="warning" style={{ marginLeft: 8 }}>
                          ⚠ Chờ hoàn tiền từ admin
                        </Text>
                      )}
                      {selectedBooking.payment_status === 'paid' && (
                        <Text type="danger" style={{ marginLeft: 8 }}>
                          ⚠ Chưa hoàn tiền
                        </Text>
                      )}
                    </div>
                  </div>

                  {selectedBooking.note && selectedBooking.note.includes('Admin hủy') && (
                    <>
                      <Divider style={{ margin: '8px 0' }} />
                      <div className="detail-item">
                        <Text strong>Người hủy:</Text>
                        <Tag color="red" style={{ marginLeft: 8 }}>Admin</Tag>
                        {selectedBooking.note.includes('Đã hoàn tiền thủ công') && (
                          <Tag color="green" style={{ marginLeft: 8 }}>Đã hoàn tiền thủ công</Tag>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Chỉ hiển thị nút đánh dấu hoàn tiền khi booking đã hủy và chưa hoàn tiền đầy đủ */}
                  {(selectedBooking.payment_status === 'paid' || selectedBooking.payment_status === 'partial_refunded') && (
                    <div style={{ textAlign: 'center' }}>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        loading={refundSubmitting}
                        onClick={() => handleMarkRefundCompleted(selectedBooking.booking_id)}
                        style={{
                          backgroundColor: '#52c41a',
                          borderColor: '#52c41a'
                        }}
                        disabled={selectedBooking.payment_status === 'refunded'}
                      >
                        {selectedBooking.payment_status === 'partial_refunded' 
                          ? 'Đánh dấu đã hoàn tiền đầy đủ' 
                          : 'Đánh dấu đã hoàn tiền'}
                      </Button>
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {selectedBooking.payment_status === 'partial_refunded'
                            ? 'Click để đánh dấu đã hoàn tiền đầy đủ cho khách hàng'
                            : 'Click để đánh dấu đã hoàn tiền thủ công cho khách hàng'}
                        </Text>
                      </div>
                    </div>
                  )}
                  
                  {/* Hiển thị thông báo khi đã hoàn tiền đầy đủ */}
                  {selectedBooking.payment_status === 'refunded' && (
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                      <div>
                        <Text type="success" strong>Đã hoàn tiền đầy đủ</Text>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Booking này đã được đánh dấu hoàn tiền đầy đủ
                        </Text>
                      </div>
                    </div>
                  )}

                </Space>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Modal thêm dịch vụ cho booking đã check-in */}
      <Modal
        title="Thêm dịch vụ"
        open={isAddServiceModalVisible}
        onCancel={() => {
          setIsAddServiceModalVisible(false)
          setSelectedServices({})
          setPaymentType('postpaid')
        }}
        width={720}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setIsAddServiceModalVisible(false)
              setSelectedServices({})
              setPaymentType('postpaid')
            }}
          >
            Đóng
          </Button>,
          <Button
            key="ok"
            type="primary"
            loading={addingServices}
            onClick={async () => {
              const picked = Object.entries(selectedServices)
                .filter(([, val]) => (val || 0) > 0)
                .map(([id, qty]) => ({ service_id: Number(id), quantity: Number(qty) }))
              
              if (picked.length === 0) {
                message.warning('Vui lòng chọn ít nhất 1 dịch vụ')
                return
              }
              
              if (!selectedBooking?.booking_id) {
                message.error('Không xác định được booking')
                return
              }

              // Kiểm tra booking status
              if (selectedBooking.booking_status !== 'confirmed' && selectedBooking.booking_status !== 'checked_in') {
                message.warning('Chỉ có thể thêm dịch vụ khi booking đang confirmed hoặc checked_in')
                return
              }

              setAddingServices(true)
              try {
                // Gửi từng dịch vụ một (API chỉ hỗ trợ thêm từng dịch vụ)
                const results = []
                for (const service of picked) {
                  try {
                    const res = await addServiceToBooking(
                      selectedBooking.booking_id,
                      service.service_id,
                      service.quantity,
                      paymentType
                    )
                    results.push({ success: true, service_id: service.service_id, data: res })
                  } catch (error) {
                    results.push({ 
                      success: false, 
                      service_id: service.service_id, 
                      error: error?.response?.data?.message || error?.message || 'Lỗi không xác định'
                    })
                  }
                }

                // Kiểm tra kết quả
                const successCount = results.filter(r => r.success).length
                const failCount = results.filter(r => !r.success).length

                if (successCount > 0) {
                  message.success(`Đã thêm thành công ${successCount} dịch vụ${successCount > 1 ? '' : ''}`)
                }
                
                if (failCount > 0) {
                  message.warning(`${failCount} dịch vụ thêm thất bại`)
                }

                // Refresh booking details và danh sách
                if (successCount > 0) {
                  setIsAddServiceModalVisible(false)
                  setSelectedServices({})
                  // Refresh booking details
                  await handleViewDetails(selectedBooking.booking_id)
                  // Refresh danh sách bookings
                  fetchBookings()
                }
              } catch (e) {
                console.error('Error adding services:', e)
                message.error(e?.response?.data?.message || 'Không thể thêm dịch vụ')
              } finally {
                setAddingServices(false)
              }
            }}
          >
            Xác nhận
          </Button>
        ]}
        destroyOnClose
        centered
      >
        <Spin spinning={servicesLoading}>
          {(!servicesList || servicesList.length === 0) ? (
            <Empty description="Không có dịch vụ nào" />
          ) : (
            <div>
              {/* Payment type selector */}
              <div style={{ marginBottom: 16 }}>
           
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {paymentType === 'postpaid' 
                      ? 'Dịch vụ sẽ được thanh toán khi check-out'
                      : 'Dịch vụ sẽ được cộng vào tổng tiền booking ngay lập tức'}
                  </Text>
                </div>
              </div>

              <div style={{ display: 'flex', fontWeight: 600, padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ flex: 1 }}>Dịch vụ</div>
                <div style={{ width: 140, textAlign: 'right' }}>Đơn giá</div>
                <div style={{ width: 160, textAlign: 'right', paddingLeft: 12 }}>Số lượng</div>
              </div>
              {servicesList.map(svc => {
                const qty = Number(selectedServices[svc.service_id]) || 0
                return (
                  <div key={svc.service_id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ flex: 1 }}>
                      <Text>{svc.name}</Text>
                    </div>
                    <div style={{ width: 140, textAlign: 'right' }}>
                      <Tag color="blue">{formatPrice(svc.price)}</Tag>
                    </div>
                    <div style={{ width: 160, textAlign: 'right', paddingLeft: 12 }}>
                      <InputNumber
                        min={0}
                        value={qty}
                        onChange={(val) => {
                          const v = Number(val) || 0
                          setSelectedServices(prev => ({
                            ...prev,
                            [svc.service_id]: v
                          }))
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Spin>
      </Modal>

      {/* Walk-in Create Booking Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            <span>Thêm đặt phòng (Walk-in)</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          walkInForm.resetFields()
          setAvailableRooms([])
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>Hủy</Button>,
          <Button key="create" type="primary" loading={walkInLoading} onClick={handleCreateWalkIn}>Tạo mới</Button>
        ]}
        width={860}
        centered
        destroyOnClose
      >
        <Form form={walkInForm} layout="vertical" onValuesChange={() => handleLoadAvailableRooms()}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card size="small" title="Thông tin khách hàng">
                <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
                {/* <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                  <Input placeholder="09xxxxxxxx" />
                </Form.Item> */}
                <Form.Item name="national_id" label="CCCD/CMND" rules={[{ required: true, message: 'Vui lòng nhập CCCD/CMND' }]}>
                  <Input placeholder="0123456789" />
                </Form.Item>
                <Form.Item name="num_person" label="Số khách" initialValue={1}>
                  <InputNumber min={1} max={20} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="num_nights" label="Số đêm" initialValue={1}>
                  <InputNumber min={1} max={30} style={{ width: '100%' }} onChange={() => handleLoadAvailableRooms()} />
                </Form.Item>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card size="small" title="Chọn phòng">
                <Form.Item name="room_type_id" label="Loại phòng" rules={[{ required: true, message: 'Vui lòng chọn loại phòng' }]}>
                  <Select placeholder="Chọn loại phòng" showSearch optionFilterProp="children">
                    {roomTypes.map(rt => (
                      <Option key={rt.room_type_id} value={rt.room_type_id}
                      >{rt.room_type_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Phòng còn trống" required>
                  {availableRooms && availableRooms.length > 0 ? (
                    <Space wrap>
                      {availableRooms.map(r => (
                        <Button
                          key={r.room_id}
                          type={walkInForm.getFieldValue('room_id') === r.room_id ? 'primary' : 'default'}
                          onClick={() => {
                            setSelectedRoomId(r.room_id)
                            walkInForm.setFieldsValue({ room_id: r.room_id })
                          }}
                        >
                          {`Phòng ${r.room_num}`}
                        </Button>
                      ))}
                    </Space>
                  ) : (
                    <Empty description="Không có phòng trống" />
                  )}
                </Form.Item>
                <Form.Item name="room_id" hidden rules={[{ required: true, message: 'Vui lòng chọn phòng' }]}>
                  <Input />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Check-in Modal */}
      <CheckInOut
        visible={isCheckInModalVisible}
        onCancel={() => setIsCheckInModalVisible(false)}
        type="checkin"
        onSuccess={() => {
          fetchBookings()
        }}
      />

      {/* Check-out Modal */}
      <CheckInOut
        visible={isCheckOutModalVisible}
        onCancel={() => setIsCheckOutModalVisible(false)}
        type="checkout"
        onSuccess={() => {
          fetchBookings()
        }}
      />

      {/* Modal hủy booking (Admin) */}
      <Modal
        title={
          <Space direction="vertical" size={0}>
            <Text strong>Hủy đặt phòng (Admin)</Text>
            {cancelModal.bookingCode && (
              <Text type="secondary">Mã: {cancelModal.bookingCode}</Text>
            )}
          </Space>
        }
        open={cancelModal.visible}
        onCancel={() => setCancelModal({ visible: false, bookingId: null, bookingCode: null, reason: '', refundManually: false })}
        footer={[
          <Button
            key="cancel"
            onClick={() => setCancelModal({ visible: false, bookingId: null, bookingCode: null, reason: '', refundManually: false })}
          >
            Đóng
          </Button>,
          <Button
            key="ok"
            type="primary"
            danger
            loading={cancelSubmitting}
            onClick={handleCancelBookingAdmin}
          >
            Xác nhận hủy
          </Button>
        ]}
        width={600}
      >
        <div>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Vui lòng nhập lý do hủy đặt phòng. Lưu ý: Admin hủy booking sẽ không hoàn tiền tự động, cần xử lý thủ công.
          </Text>

          <Form.Item label="Lý do hủy" required>
            <Input.TextArea
              value={cancelModal.reason}
              onChange={(e) => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
              rows={4}
              placeholder="Nhập lý do hủy đặt phòng..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <input
                type="checkbox"
                checked={cancelModal.refundManually}
                onChange={(e) => setCancelModal(prev => ({ ...prev, refundManually: e.target.checked }))}
                id="refund-manually"
              />
              <label htmlFor="refund-manually">
                <Text>Đã hoàn tiền thủ công cho khách hàng</Text>
              </label>
            </Space>
            <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
              Đánh dấu nếu bạn đã xử lý hoàn tiền cho khách hàng bên ngoài hệ thống
            </Text>
          </Form.Item>
        </div>
      </Modal>
    </div>
  )
}

export default BookingManagement
