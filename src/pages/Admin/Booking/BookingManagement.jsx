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
  UserOutlined, CreditCardOutlined, EyeOutlined, PrinterOutlined
} from '@ant-design/icons'
import { 
  getAllBookings, getBookingById, cancelBooking,
  getAllHotels, getAllRoomTypes, getAllUsers
} from '../../../services/admin.service'
import CheckInOut from '../../../components/CheckInOut/CheckInOut'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

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
  const [dateRange, setDateRange] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [form] = Form.useForm()

  // Fetch bookings data
  const fetchBookings = async (page = 1, pageSize = 10, filters = {}) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: pageSize,
        ...filters
      }
      
      // Add date range filter
      if (dateRange && dateRange.length === 2) {
        params.check_in_date = dateRange[0].format('YYYY-MM-DD')
        params.check_out_date = dateRange[1].format('YYYY-MM-DD')
      }
      
      const response = await getAllBookings(params)
      setBookings(response.bookings || [])
      setPagination({
        current: page,
        pageSize,
        total: response.pagination?.totalItems || 0
      })
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
      const response = await getAllHotels({ limit: 100 })
      setHotels(response.hotels || [])
    } catch (error) {
      console.error('Error fetching hotels:', error)
    }
  }

  // Fetch room types for dropdown
  const fetchRoomTypes = async () => {
    try {
      const response = await getAllRoomTypes({ limit: 100 })
      setRoomTypes(response.roomTypes || [])
    } catch (error) {
      console.error('Error fetching room types:', error)
    }
  }

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await getAllUsers({ limit: 100 })
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

  // Filter bookings based on search
  const filteredBookings = useMemo(() => {
    let filtered = bookings
    
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(booking => {
        const bookingCode = booking.booking_code?.toLowerCase() || ''
        const userName = booking.user?.full_name?.toLowerCase() || ''
        const userEmail = booking.user?.email?.toLowerCase() || ''
        const roomTypeName = booking.room?.room_type?.room_type_name?.toLowerCase() || ''
        
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
    
    return filtered
  }, [bookings, searchText, statusFilter, typeFilter])

  // Handle view booking details
  const handleViewDetails = async (bookingId) => {
    try {
      const response = await getBookingById(bookingId)
      console.log(response);
      
      setSelectedBooking(response)
      setIsDetailModalVisible(true)
    } catch (error) {
      console.error('Error fetching booking details:', error)
      message.error('Không thể tải chi tiết đặt phòng')
    }
  }

  // Handle cancel booking
  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId, 'Hủy bởi admin')
      message.success('Hủy đặt phòng thành công!')
      fetchBookings(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Error cancelling booking:', error)
      message.error('Không thể hủy đặt phòng!')
    }
  }

  // Handle table change
  const handleTableChange = (paginationInfo) => {
    fetchBookings(paginationInfo.current, paginationInfo.pageSize)
  }

  // Handle filter changes
  const handleFilterChange = () => {
    const filters = {}
    if (statusFilter) filters.status = statusFilter
    if (typeFilter) filters.type = typeFilter
    fetchBookings(1, pagination.pageSize, filters)
  }

  // Get status tag
  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chờ xác nhận' },
      confirmed: { color: 'blue', icon: <CheckCircleOutlined />, text: 'Đã xác nhận' },
      checked_in: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đã nhận phòng' },
      checked_out: { color: 'purple', icon: <CheckCircleOutlined />, text: 'Đã trả phòng' },
      cancelled: { color: 'red', icon: <CloseCircleOutlined />, text: 'Đã hủy' },
      completed: { color: 'green', icon: <CheckCircleOutlined />, text: 'Hoàn thành' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    )
  }

  // Get payment status tag
  const getPaymentStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Chờ thanh toán' },
      paid: { color: 'green', text: 'Đã thanh toán' },
      refunded: { color: 'blue', text: 'Đã hoàn tiền' },
      failed: { color: 'red', text: 'Thanh toán thất bại' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <Tag color={config.color}>
        {config.text}
      </Tag>
    )
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.booking_status === 'pending').length,
      confirmed: bookings.filter(b => b.booking_status === 'confirmed').length,
      checked_in: bookings.filter(b => b.booking_status === 'checked_in').length,
      cancelled: bookings.filter(b => b.booking_status === 'cancelled').length,
      totalRevenue: bookings
        .filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + (parseFloat(b.final_price) || 0), 0)
    }
    return stats
  }, [bookings])

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'booking_id',
      key: 'booking_id',
      width: 60,
      align: 'center',
      sorter: (a, b) => a.booking_id - b.booking_id
    },
    {
      title: 'Mã đặt phòng',
      dataIndex: 'booking_code',
      key: 'booking_code',
      width: 120,
      render: (code) => (
        <Text code style={{ fontSize: '12px', color: '#1890ff' }}>
          {code}
        </Text>
      )
    },
    {
      title: 'Khách hàng',
      dataIndex: 'user',
      key: 'user',
      width: 200,
      render: (user) => (
        <div className="user-info">
          <UserOutlined style={{ color: '#1890ff', marginRight: 4 }} />
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
      dataIndex: 'room',
      key: 'room',
      width: 150,
      render: (room) => (
        <div>
          <Text strong>{room?.room_type?.room_type_name}</Text>
          {room?.room_num && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Phòng {room.room_num}
              </Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Ngày nhận/trả',
      key: 'dates',
      width: 180,
      render: (_, record) => (
        <div className="date-info">
          <div>
            <CalendarOutlined style={{ color: '#52c41a', marginRight: 4 }} />
            <Text strong>{record.check_in_date}</Text>
          </div>
          <div>
            <CalendarOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
            <Text strong>{record.check_out_date}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Số khách',
      dataIndex: 'num_person',
      key: 'num_person',
      width: 80,
      align: 'center',
      render: (num) => (
        <Badge count={num} style={{ backgroundColor: '#1890ff' }} />
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'final_price',
      key: 'final_price',
      width: 120,
      align: 'right',
      render: (price) => (
        <Text strong style={{ color: '#52c41a' }}>
          {price}
        </Text>
      ),
      sorter: (a, b) => (parseFloat(a.final_price) || 0) - (parseFloat(b.final_price) || 0)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'booking_status',
      key: 'booking_status',
      width: 120,
      align: 'center',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Chờ xác nhận', value: 'pending' },
        { text: 'Đã xác nhận', value: 'confirmed' },
        { text: 'Đã nhận phòng', value: 'checked_in' },
        { text: 'Đã trả phòng', value: 'checked_out' },
        { text: 'Đã hủy', value: 'cancelled' },
        { text: 'Hoàn thành', value: 'completed' }
      ],
      onFilter: (value, record) => record.booking_status === value
    },
    {
      title: 'Thanh toán',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 100,
      align: 'center',
      render: (status) => getPaymentStatusTag(status),
      filters: [
        { text: 'Chờ thanh toán', value: 'pending' },
        { text: 'Đã thanh toán', value: 'paid' },
        { text: 'Đã hoàn tiền', value: 'refunded' },
        { text: 'Thanh toán thất bại', value: 'failed' }
      ],
      onFilter: (value, record) => record.payment_status === value
    },
    {
      title: 'Loại đặt',
      dataIndex: 'booking_type',
      key: 'booking_type',
      width: 100,
      align: 'center',
      render: (type) => (
        <Tag color={type === 'online' ? 'blue' : 'green'}>
          {type === 'online' ? 'Online' : 'Walk-in'}
        </Tag>
      ),
      filters: [
        { text: 'Online', value: 'online' },
        { text: 'Walk-in', value: 'walkin' }
      ],
      onFilter: (value, record) => record.booking_type === value
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => date,
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record.booking_id)}
              className="action-button view-button"
            />
          </Tooltip>
          {record.booking_status === 'pending' && (
            <Tooltip title="Hủy đặt phòng">
              <Popconfirm
                title="Xác nhận hủy"
                description="Bạn có chắc chắn muốn hủy đặt phòng này?"
                onConfirm={() => handleCancelBooking(record.booking_id)}
                okText="Hủy"
                cancelText="Không"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  danger
                  icon={<CloseCircleOutlined />}
                  className="action-button cancel-button"
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="booking-management">
      {/* Header */}
      <div className="booking-header">
        <h2 className="page-title">
          <CalendarOutlined /> Quản lý đặt phòng
        </h2>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchBookings(pagination.current, pagination.pageSize)}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => setIsCheckInModalVisible(true)}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Check-in
          </Button>
          <Button
            type="primary"
            icon={<ClockCircleOutlined />}
            onClick={() => setIsCheckOutModalVisible(true)}
            style={{ background: '#722ed1', borderColor: '#722ed1' }}
          >
            Check-out
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="statistics-row">
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng đặt phòng"
              value={statistics.total}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Chờ xác nhận"
              value={statistics.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Đã xác nhận"
              value={statistics.confirmed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng doanh thu"
              value={statistics.totalRevenue}
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => (value)}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <div className="booking-search">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={8} lg={6}>
            <Input
              placeholder="Tìm kiếm theo mã đặt phòng, tên khách hàng..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="search-input"
              size="large"
            />
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              onChange={setStatusFilter}
              allowClear
              value={statusFilter}
              size="large"
            >
              <Option value="pending">Chờ xác nhận</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="checked_in">Đã nhận phòng</Option>
              <Option value="checked_out">Đã trả phòng</Option>
              <Option value="cancelled">Đã hủy</Option>
              <Option value="completed">Hoàn thành</Option>
            </Select>
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Select
              placeholder="Loại đặt"
              style={{ width: '100%' }}
              onChange={setTypeFilter}
              allowClear
              value={typeFilter}
              size="large"
            >
              <Option value="online">Online</Option>
              <Option value="walkin">Walk-in</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={8} lg={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={setDateRange}
              size="large"
              placeholder={['Ngày nhận phòng', 'Ngày trả phòng']}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={4}>
            <Button
              type="primary"
              onClick={handleFilterChange}
              size="large"
              style={{ width: '100%' }}
            >
              Áp dụng bộ lọc
            </Button>
          </Col>
        </Row>
      </div>

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
        scroll={{ x: 1500 }}
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
        onCancel={() => setIsDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />}>
            In hóa đơn
          </Button>
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
                    <Text>{selectedBooking.created_at}</Text>
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
                <Card title="Thông tin phòng" size="small">
                  <div className="detail-item">
                    <Text strong>Loại phòng:</Text>
                    <Text>{selectedBooking.room?.room_type?.room_type_name}</Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Số phòng:</Text>
                    <Text>{selectedBooking.room?.room_num || 'Chưa gán'}</Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Số khách:</Text>
                    <Text>{selectedBooking.num_person} người</Text>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Thông tin thanh toán" size="small">
                  <div className="detail-item">
                    <Text strong>Tổng tiền:</Text>
                    <Text strong style={{ color: '#52c41a' }}>
                      {selectedBooking.final_price}
                    </Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Trạng thái thanh toán:</Text>
                    {getPaymentStatusTag(selectedBooking.payment_status)}
                  </div>
                  <div className="detail-item">
                    <Text strong>Phương thức:</Text>
                    <Text>{selectedBooking.payment_status === 'paid' ? 'PayOS' : 'Chưa thanh toán'}</Text>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Card title="Lịch trình" size="small" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div className="detail-item">
                    <Text strong>Ngày nhận phòng:</Text>
                    <Text>{selectedBooking.check_in_date}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="detail-item">
                    <Text strong>Ngày trả phòng:</Text>
                    <Text>{selectedBooking.check_out_date}</Text>
                  </div>
                </Col>
              </Row>
              {selectedBooking.check_in_time && (
                <div className="detail-item">
                  <Text strong>Thời gian check-in:</Text>
                  <Text>{new Date(selectedBooking.check_in_time).toLocaleString('vi-VN')}</Text>
                </div>
              )}
              {selectedBooking.check_out_time && (
                <div className="detail-item">
                  <Text strong>Thời gian check-out:</Text>
                  <Text>{new Date(selectedBooking.check_out_time).toLocaleString('vi-VN')}</Text>
                </div>
              )}
            </Card>
          </div>
        )}
      </Modal>

      {/* Check-in Modal */}
      <CheckInOut
        visible={isCheckInModalVisible}
        onCancel={() => setIsCheckInModalVisible(false)}
        type="checkin"
      />

      {/* Check-out Modal */}
      <CheckInOut
        visible={isCheckOutModalVisible}
        onCancel={() => setIsCheckOutModalVisible(false)}
        type="checkout"
      />
    </div>
  )
}

export default BookingManagement
