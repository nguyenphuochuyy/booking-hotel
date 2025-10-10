import React, { useState, useMemo } from 'react'
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
  Divider
} from 'antd'
import {
  EyeOutlined,
  StopOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  FilterOutlined
} from '@ant-design/icons'
import './userBookingHistory.css'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

// Mock data cho booking history
const mockBookings = [
  {
    id: 'BK001',
    hotelName: 'Bean Hotel',
    roomType: 'Deluxe Room',
    checkInDate: '2025-10-10',
    checkOutDate: '2025-10-12',
    guests: 2,
    status: 'confirmed',
    totalAmount: 1500000,
    bookingDate: '2025-10-01',
    customerName: 'Nguyễn Văn An',
    phone: '0858369609',
    email: 'nguyenvanan@example.com'
  },
  {
    id: 'BK002',
    hotelName: 'Bean Hotel',
    roomType: 'Standard Room',
    checkInDate: '2025-09-15',
    checkOutDate: '2025-09-17',
    guests: 1,
    status: 'completed',
    totalAmount: 800000,
    bookingDate: '2025-09-01',
    customerName: 'Nguyễn Văn An',
    phone: '0858369609',
    email: 'nguyenvanan@example.com'
  },
  {
    id: 'BK003',
    hotelName: 'Bean Hotel',
    roomType: 'VIP Suite',
    checkInDate: '2025-11-20',
    checkOutDate: '2025-11-22',
    guests: 3,
    status: 'pending',
    totalAmount: 2500000,
    bookingDate: '2025-10-05',
    customerName: 'Nguyễn Văn An',
    phone: '0858369609',
    email: 'nguyenvanan@example.com'
  },
  {
    id: 'BK004',
    hotelName: 'Bean Hotel',
    roomType: 'Family Room',
    checkInDate: '2025-08-10',
    checkOutDate: '2025-08-12',
    guests: 4,
    status: 'cancelled',
    totalAmount: 1200000,
    bookingDate: '2025-07-20',
    customerName: 'Nguyễn Văn An',
    phone: '0858369609',
    email: 'nguyenvanan@example.com'
  },
  {
    id: 'BK005',
    hotelName: 'Bean Hotel',
    roomType: 'Premium Room',
    checkInDate: '2025-12-24',
    checkOutDate: '2025-12-26',
    guests: 2,
    status: 'confirmed',
    totalAmount: 1800000,
    bookingDate: '2025-10-08',
    customerName: 'Nguyễn Văn An',
    phone: '0858369609',
    email: 'nguyenvanan@example.com'
  }
]

const statusConfig = {
  pending: { color: 'warning', text: 'Đang xử lý' },
  confirmed: { color: 'success', text: 'Đã xác nhận' },
  completed: { color: 'default', text: 'Hoàn thành' },
  cancelled: { color: 'error', text: 'Đã hủy' }
}

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
  const [bookings, setBookings] = useState(mockBookings) // Use state for bookings to enable updates

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
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

  // Handle cancel booking
  const handleCancelBooking = async (bookingId) => {
    // Add bookingId to cancelling set
    setCancellingBookings(prev => new Set([...prev, bookingId]))
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update booking status to cancelled
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      )
      
      message.success('Hủy booking thành công!')
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      // Remove bookingId from cancelling set
      setCancellingBookings(prev => {
        const newSet = new Set(prev)
        newSet.delete(bookingId)
        return newSet
      })
    }
  }

  // Handle view details
  const handleViewDetails = (booking) => {
    setDetailModal({ visible: true, data: booking })
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
      title: 'Khách sạn',
      dataIndex: 'hotelName',
      key: 'hotelName',
      width: screens.xs ? 120 : 150,
      render: (text) => <Text className="hotel-name">{text}</Text>
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
          <Text>{new Date(date).toLocaleDateString('vi-VN')}</Text>
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
          <Text>{new Date(date).toLocaleDateString('vi-VN')}</Text>
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
      width: screens.xs ? 100 : 120,
      align: 'center',
      render: (status) => {
        const config = statusConfig[status]
        return <Tag color={config.color} className="status-tag">{config.text}</Tag>
      }
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: screens.xs ? 120 : 150,
      align: 'right',
      render: (amount) => (
        <div className="amount-cell">
          <DollarOutlined />
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
        
        // Determine which buttons to show based on status
        const showViewButton = ['confirmed', 'completed'].includes(status)
        const showCancelButton = ['pending', 'confirmed'].includes(status)
        
        return (
          <Space 
            size={screens.xs ? 4 : "small"} 
            direction={screens.xs ? 'vertical' : 'horizontal'}
            wrap
          >
            {showViewButton && (
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleViewDetails(record)}
                className="view-btn"
                type="primary"
              >
                {screens.xs ? '' : 'Chi tiết'}
              </Button>
            )}
            
            {showCancelButton && (
              <Popconfirm
                title="Xác nhận hủy booking"
                description={`Bạn có chắc muốn hủy booking ${id}? Hành động này không thể hoàn tác.`}
                onConfirm={() => handleCancelBooking(id)}
                okText="Xác nhận hủy"
                cancelText="Không hủy"
                okButtonProps={{ 
                  danger: true,
                  loading: isCancelling 
                }}
                disabled={isCancelling}
                placement={screens.xs ? 'topRight' : 'top'}
              >
                <Button
                  icon={<StopOutlined />}
                  size="small"
                  danger
                  loading={isCancelling}
                  disabled={isCancelling}
                  className="cancel-btn"
                >
                  {isCancelling ? (screens.xs ? '' : 'Đang hủy...') : (screens.xs ? '' : 'Hủy')}
                </Button>
              </Popconfirm>
            )}
            
            {status === 'cancelled' && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Đã hủy
              </Text>
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

        {/* Detail Modal */}
        <Modal
          title="Chi tiết Booking"
          open={detailModal.visible}
          onCancel={() => setDetailModal({ visible: false, data: null })}
          footer={[
            <Button 
              key="close" 
              type="primary"
              onClick={() => setDetailModal({ visible: false, data: null })}
            >
              Đóng
            </Button>
          ]}
          width={screens.xs ? '95%' : 600}
          className="detail-modal"
        >
          {detailModal.data && (() => {
            // Get fresh data from bookings state
            const currentBooking = bookings.find(b => b.id === detailModal.data.id) || detailModal.data
            return (
            <div className="booking-detail">
              <Descriptions column={screens.xs ? 1 : 2} bordered size="small">
                <Descriptions.Item label="Booking ID" span={screens.xs ? 1 : 2}>
                  <Text strong>{currentBooking.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Khách sạn">
                  {currentBooking.hotelName}
                </Descriptions.Item>
                <Descriptions.Item label="Loại phòng">
                  {currentBooking.roomType}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">
                  {new Date(currentBooking.bookingDate).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={statusConfig[currentBooking.status].color}>
                    {statusConfig[currentBooking.status].text}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Check-in">
                  {new Date(currentBooking.checkInDate).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Check-out">
                  {new Date(currentBooking.checkOutDate).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Số khách">
                  {currentBooking.guests} người
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền" span={screens.xs ? 1 : 2}>
                  <Text strong style={{ color: '#c08a19', fontSize: '16px' }}>
                    {formatCurrency(currentBooking.totalAmount)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              <Divider>Thông tin khách hàng</Divider>
              
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Họ tên">
                  {currentBooking.customerName}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {currentBooking.phone}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {currentBooking.email}
                </Descriptions.Item>
              </Descriptions>
            </div>
            )
          })()}
        </Modal>
      </div>
    </div>
  )
}

export default UserBookingHistory
