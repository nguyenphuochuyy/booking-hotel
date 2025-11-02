import React, { useState, useEffect, useMemo } from 'react'
import { 
  Table, Button, Space, Modal, message, 
  Popconfirm, Tag, Card, Row, Col, Statistic, Tooltip, 
  Typography, Divider, Empty, Spin, Select, Input, Rate, Image, Avatar
} from 'antd'
import { 
  ReloadOutlined, SearchOutlined, ExclamationCircleOutlined,
  StarOutlined, MessageOutlined, UserOutlined, EyeOutlined,
  DeleteOutlined, FilterOutlined, SortAscendingOutlined
} from '@ant-design/icons'
import { getAllReviews } from '../../../services/admin.service'
import './review.css'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [ratingFilter, setRatingFilter] = useState(null)
  const [roomTypeFilter, setRoomTypeFilter] = useState(null)
  const [sortBy, setSortBy] = useState('newest') // newest, date_asc, date_desc, room_type, rating
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [detailModal, setDetailModal] = useState({ visible: false, review: null })

  // Fetch reviews data
  const fetchReviews = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: pageSize,
        ...(ratingFilter && { rating: ratingFilter }),
      }
      const response = await getAllReviews(params)
      
      let reviewsData = []
      let total = 0
      if (response) { 
        if (Array.isArray(response)) {
          reviewsData = response
          total = response.length
        } else if (response.reviews) {
          reviewsData = response.reviews
          total = response.pagination?.totalItems || response.reviews.length
        } else if (response.data) {
          reviewsData = response.data.reviews || response.data
          total = response.data.total || response.data.length
        }
      }
      
      setReviews(reviewsData)
      setPagination({
        current: page,
        pageSize,
        total: total
      })
    } catch (error) {
      console.error('Error fetching reviews:', error)
      message.error(`Không thể tải danh sách đánh giá: ${error.message || 'Lỗi không xác định'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  // Get unique room types from reviews
  const roomTypes = useMemo(() => {
    const uniqueTypes = new Set()
    reviews.forEach(review => {
      if (review.booking?.room_type_name) {
        uniqueTypes.add(review.booking.room_type_name)
      }
    })
    return Array.from(uniqueTypes).sort()
  }, [reviews])

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...reviews]

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(review => {
        const userName = review.user?.full_name?.toLowerCase() || ''
        const comment = review.comment?.toLowerCase() || ''
        const bookingCode = review.booking?.booking_code?.toLowerCase() || ''
        const roomTypeName = review.booking?.room_type_name?.toLowerCase() || ''
        
        return userName.includes(searchLower) ||
               comment.includes(searchLower) ||
               bookingCode.includes(searchLower) ||
               roomTypeName.includes(searchLower)
      })
    }

    // Room type filter
    if (roomTypeFilter) {
      filtered = filtered.filter(review => 
        review.booking?.room_type_name === roomTypeFilter
      )
    }

    // Rating filter is handled by API, but we keep it here for consistency
    if (ratingFilter) {
      filtered = filtered.filter(review => review.rating === ratingFilter)
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'room_type':
        filtered.sort((a, b) => {
          const nameA = a.booking?.room_type_name || ''
          const nameB = b.booking?.room_type_name || ''
          return nameA.localeCompare(nameB)
        })
        break
      case 'rating_desc':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'rating_asc':
        filtered.sort((a, b) => a.rating - b.rating)
        break
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    return filtered
  }, [reviews, searchText, ratingFilter, roomTypeFilter, sortBy])

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      total: reviews.length,
      rating5: reviews.filter(r => r.rating === 5).length,
      rating4: reviews.filter(r => r.rating === 4).length,
      rating3: reviews.filter(r => r.rating === 3).length,
      rating2: reviews.filter(r => r.rating === 2).length,
      rating1: reviews.filter(r => r.rating === 1).length,
      average: reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0
    }
    return stats
  }, [reviews])

  // Handle table change
  const handleTableChange = (paginationInfo) => {
    fetchReviews(paginationInfo.current, paginationInfo.pageSize)
  }

  // Handle delete review (if needed - currently not in API, but placeholder)
  const handleDelete = async (reviewId) => {
    try {
      // await deleteReview(reviewId)
      message.success('Xóa đánh giá thành công!')
      fetchReviews(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Error deleting review:', error)
      message.error('Không thể xóa đánh giá!')
    }
  }

  // Get rating color
  const getRatingColor = (rating) => {
    if (rating >= 4) return '#52c41a'
    if (rating >= 3) return '#faad14'
    return '#ff4d4f'
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return dayjs(dateString).format('DD/MM/YYYY HH:mm')
  }

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'review_id',
      key: 'review_id',
      width: 60,
      align: 'center',
      sorter: (a, b) => a.review_id - b.review_id
    },
    {
      title: 'Khách hàng',
      dataIndex: ['user', 'full_name'],
      key: 'user_name',
      width: 150,
      render: (name, record) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
            {name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: '14px' }}>{name || 'N/A'}</Text>
            {record.user?.email && (
              <div style={{ fontSize: '12px', color: '#999' }}>{record.user.email}</div>
            )}
          </div>
        </Space>
      )
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      align: 'center',
      render: (rating) => (
        <Space direction="vertical" size={2}>
          <Rate disabled value={rating} style={{ fontSize: '14px' }} />
          <Tag color={getRatingColor(rating)} style={{ margin: 0 }}>
            {rating} sao
          </Tag>
        </Space>
      ),
      sorter: (a, b) => a.rating - b.rating,
      filters: [
        { text: '5 sao', value: 5 },
        { text: '4 sao', value: 4 },
        { text: '3 sao', value: 3 },
        { text: '2 sao', value: 2 },
        { text: '1 sao', value: 1 }
      ],
      onFilter: (value, record) => record.rating === value
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      width: 250,
      render: (comment) => (
        <Tooltip title={comment || 'Không có nội dung'}>
          <Text 
            style={{ 
              fontSize: '14px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {comment || 'Không có nội dung đánh giá'}
          </Text>
        </Tooltip>
      ),
      ellipsis: true
    },
    {
      title: 'Loại phòng',
      dataIndex: ['booking', 'room_type_name'],
      key: 'room_type',
      width: 150,
      render: (roomType) => (
        <Tag color="blue">{roomType || 'N/A'}</Tag>
      ),
      filters: roomTypes.map(type => ({ text: type, value: type })),
      onFilter: (value, record) => record.booking?.room_type_name === value
    },
    {
      title: 'Mã booking',
      dataIndex: ['booking', 'booking_code'],
      key: 'booking_code',
      width: 120,
      render: (code) => (
        <Text code style={{ fontSize: '12px' }}>{code || 'N/A'}</Text>
      )
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      align: 'center',
      render: (images) => {
        if (!images || !Array.isArray(images) || images.length === 0) {
          return <Text type="secondary">Không có</Text>
        }
        return (
          <Tooltip title={`${images.length} ảnh`}>
            <Image.PreviewGroup>
              <Image
                src={images[0]}
                width={40}
                height={40}
                style={{ borderRadius: '4px', objectFit: 'cover' }}
                preview={{ mask: `${images.length} ảnh` }}
              />
            </Image.PreviewGroup>
          </Tooltip>
        )
      }
    },
    {
      title: 'Ngày đánh giá',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => (
        <Text style={{ fontSize: '13px' }}>{formatDate(date)}</Text>
      ),
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
              onClick={() => setDetailModal({ visible: true, review: record })}
              className="action-button view-button"
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div className="review-management">
      {/* Header */}
      <div className="review-header">
        <h2 className="page-title">
          <StarOutlined /> Quản lý đánh giá
        </h2>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchReviews(pagination.current, pagination.pageSize)}
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="statistics-row">
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng đánh giá"
              value={statistics.total}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Đánh giá trung bình"
              value={statistics.average}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix="/ 5"
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="5 sao"
              value={statistics.rating5}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="1-2 sao"
              value={statistics.rating1 + statistics.rating2}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <div className="review-search">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={12} lg={8}>
            <Input
              placeholder="Tìm kiếm theo tên, email, nội dung, mã booking..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="search-input"
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="Lọc theo số sao"
              style={{ width: '100%' }}
              onChange={(value) => setRatingFilter(value)}
              allowClear
              value={ratingFilter}
              size="large"
            >
              <Option value={5}>5 sao</Option>
              <Option value={4}>4 sao</Option>
              <Option value={3}>3 sao</Option>
              <Option value={2}>2 sao</Option>
              <Option value={1}>1 sao</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="Lọc theo loại phòng"
              style={{ width: '100%' }}
              onChange={(value) => setRoomTypeFilter(value)}
              allowClear
              value={roomTypeFilter}
              size="large"
            >
              {roomTypes.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={12} lg={8}>
            <Select
              placeholder="Sắp xếp"
              style={{ width: '100%' }}
              onChange={(value) => setSortBy(value)}
              value={sortBy}
              size="large"
              prefix={<SortAscendingOutlined />}
            >
              <Option value="newest">
                <SortAscendingOutlined /> Mới nhất
              </Option>
              <Option value="oldest">Cũ nhất</Option>
              <Option value="date_desc">Ngày (mới → cũ)</Option>
              <Option value="date_asc">Ngày (cũ → mới)</Option>
              <Option value="room_type">Loại phòng (A-Z)</Option>
              <Option value="rating_desc">Số sao (cao → thấp)</Option>
              <Option value="rating_asc">Số sao (thấp → cao)</Option>
            </Select>
          </Col>
        </Row>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredAndSortedReviews}
        rowKey="review_id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đánh giá`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        onChange={handleTableChange}
        loading={loading}
        scroll={{ x: 1500 }}
        locale={{
          emptyText: (
            <Empty
              description="Không có dữ liệu đánh giá"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        }}
      />

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <StarOutlined />
            <span>Chi tiết đánh giá</span>
          </Space>
        }
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, review: null })}
        footer={[
          <Button key="close" onClick={() => setDetailModal({ visible: false, review: null })}>
            Đóng
          </Button>
        ]}
        width={800}
        centered
      >
        {detailModal.review && (
          <div>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar size={80} style={{ backgroundColor: '#1890ff', marginBottom: '16px' }}>
                    {detailModal.review.user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <Title level={5} style={{ margin: 0 }}>
                    {detailModal.review.user?.full_name || 'N/A'}
                  </Title>
                  <Text type="secondary" style={{ display: 'block', marginTop: '4px' }}>
                    {detailModal.review.user?.email || ''}
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={16}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Đánh giá: </Text>
                    <Rate disabled value={detailModal.review.rating} />
                    <Tag color={getRatingColor(detailModal.review.rating)} style={{ marginLeft: '8px' }}>
                      {detailModal.review.rating} sao
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Loại phòng: </Text>
                    <Tag color="blue">{detailModal.review.booking?.room_type_name || 'N/A'}</Tag>
                  </div>
                  <div>
                    <Text strong>Mã booking: </Text>
                    <Text code>{detailModal.review.booking?.booking_code || 'N/A'}</Text>
                  </div>
                  <div>
                    <Text strong>Ngày đánh giá: </Text>
                    <Text>{formatDate(detailModal.review.created_at)}</Text>
                  </div>
                  {detailModal.review.updated_at && detailModal.review.updated_at !== detailModal.review.created_at && (
                    <div>
                      <Text strong>Cập nhật lúc: </Text>
                      <Text>{formatDate(detailModal.review.updated_at)}</Text>
                    </div>
                  )}
                </Space>
              </Col>
            </Row>
            
            <Divider />
            
            <div>
              <Title level={5}>Nội dung đánh giá</Title>
              <Text style={{ fontSize: '14px', lineHeight: '1.8' }}>
                {detailModal.review.comment || 'Không có nội dung đánh giá'}
              </Text>
            </div>

            {detailModal.review.images && Array.isArray(detailModal.review.images) && detailModal.review.images.length > 0 && (
              <>
                <Divider />
                <div>
                  <Title level={5}>Hình ảnh ({detailModal.review.images.length})</Title>
                  <Image.PreviewGroup>
                    <Row gutter={[8, 8]}>
                      {detailModal.review.images.map((img, index) => (
                        <Col xs={8} sm={6} md={6} key={index}>
                          <Image
                            src={img}
                            alt={`Review image ${index + 1}`}
                            style={{ 
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                            preview={{ mask: 'Xem ảnh lớn' }}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Image.PreviewGroup>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ReviewManagement

