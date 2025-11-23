import React, { useState, useEffect, useMemo } from 'react'
import {
  Table, Button, Space, Modal, message, 
  Popconfirm, Tag, Card, Row, Col, Statistic, Tooltip, 
  Typography, Divider, Empty, Spin, Select, Input, Rate, Image, Avatar,
  Upload
} from 'antd'
import { 
  ReloadOutlined, SearchOutlined, ExclamationCircleOutlined,
  StarOutlined, MessageOutlined, UserOutlined, EyeOutlined,
  DeleteOutlined, FilterOutlined, SortAscendingOutlined, SendOutlined,
  EditOutlined, PlusOutlined
} from '@ant-design/icons'
import { getAllReviews, replyToReview, updateReview, deleteReview } from '../../../services/admin.service'
import './review.css'
import formatDateTime from '../../../utils/formatDateTime'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

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
  const [replyModal, setReplyModal] = useState({ visible: false, reviewId: null, loading: false })
  const [replyText, setReplyText] = useState('')
  const [editModal, setEditModal] = useState({ visible: false, review: null, loading: false })
  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: '',
    images: []
  })

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

  // Handle delete review
  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId)
      message.success('Xóa đánh giá thành công!')
      fetchReviews(pagination.current, pagination.pageSize)
      
      // Đóng detail modal nếu đang mở review bị xóa
      if (detailModal.visible && detailModal.review?.review_id === reviewId) {
        setDetailModal({ visible: false, review: null })
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể xóa đánh giá!'
      message.error(errorMessage)
    }
  }

  // Handle mở modal edit
  const handleOpenEditModal = (review) => {
    // Convert images URLs to Upload file format
    const imageFiles = (review.images || []).map((img, index) => ({
      uid: `existing-${index}`,
      name: `image-${index}.jpg`,
      status: 'done',
      url: img,
      thumbUrl: img
    }))
    
    setEditForm({
      rating: review.rating || 5,
      comment: review.comment || '',
      images: imageFiles
    })
    setEditModal({
      visible: true,
      review: review,
      loading: false
    })
  }

  // Handle cập nhật review
  const handleUpdateReview = async () => {
    if (!editModal.review) return
    
    if (!editForm.rating || editForm.rating < 1) {
      message.warning('Vui lòng chọn số sao đánh giá')
      return
    }
    
    setEditModal(prev => ({ ...prev, loading: true }))
    try {
      // Lấy các file mới từ fileList (chỉ file có originFileObj)
      const newImageFiles = editForm.images
        .filter(file => file.originFileObj)
        .map(file => file.originFileObj)
      
      // Tạo FormData để gửi
      const formData = new FormData()
      formData.append('rating', editForm.rating)
      formData.append('comment', editForm.comment.trim() || '')
      
      // Append existing images (nếu có)
      editForm.images.forEach((file) => {
        if (!file.originFileObj && file.url) {
          formData.append('existingImages', file.url)
        }
      })
      
      // Append new image files (nếu có)
      newImageFiles.forEach((file) => {
        formData.append('images', file)
      })
      
      await updateReview(editModal.review.review_id, formData)
      
      message.success('Cập nhật đánh giá thành công!')
      
      // Đóng modal và reset form
      setEditModal({ visible: false, review: null, loading: false })
      setEditForm({ rating: 5, comment: '', images: [] })
      
      // Reload reviews
      await fetchReviews(pagination.current, pagination.pageSize)
      
      // Cập nhật detail modal nếu đang mở
      if (detailModal.visible && detailModal.review?.review_id === editModal.review.review_id) {
        await fetchReviews(pagination.current, pagination.pageSize)
        // Reload sẽ tự động cập nhật detail modal khi user mở lại
      }
    } catch (error) {
      console.error('Error updating review:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể cập nhật đánh giá. Vui lòng thử lại.'
      message.error(errorMessage)
    } finally {
      setEditModal(prev => ({ ...prev, loading: false }))
    }
  }

  // Get rating color
  const getRatingColor = (rating) => {
    if (rating >= 4) return '#52c41a'
    if (rating >= 3) return '#faad14'
    return '#ff4d4f'
  }


  // Handle mở modal phản hồi
  const handleOpenReplyModal = (review) => {
    // Backend sử dụng field 'reply', không phải 'admin_reply'
    setReplyText(review.reply || review.admin_reply || '')
    setReplyModal({ visible: true, reviewId: review.review_id, loading: false })
  }

  // Handle gửi phản hồi
  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      message.warning('Vui lòng nhập nội dung phản hồi')
      return
    }

    setReplyModal(prev => ({ ...prev, loading: true }))
    try {
      const response = await replyToReview(replyModal.reviewId, replyText.trim())
      message.success('Phản hồi đánh giá thành công!')
      // Đóng modal reply
      setReplyModal({ visible: false, reviewId: null, loading: false })
      setReplyText('')
      // Reload reviews để cập nhật danh sách
      await fetchReviews(pagination.current, pagination.pageSize)
      // Cập nhật review trong detail modal nếu đang mở
      if (detailModal.visible && detailModal.review?.review_id === replyModal.reviewId) {
        // Sử dụng review từ response nếu có, nếu không thì cập nhật thủ công
        // Backend trả về field 'reply', không phải 'admin_reply'
        const updatedReview = response?.review || response?.data?.review || {
          ...detailModal.review,
          reply: replyText.trim(),
          admin_reply: replyText.trim(), // Giữ lại để tương thích
          reply_at: new Date().toISOString()
        }
        setDetailModal({ ...detailModal, review: updatedReview })
      }
    } catch (error) {
      console.error('Error replying to review:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể gửi phản hồi. Vui lòng thử lại.'
      message.error(errorMessage)
    } finally {
      setReplyModal(prev => ({ ...prev, loading: false }))
    }
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
        <Text style={{ fontSize: '13px' }}>{formatDateTime(date)}</Text>
      ),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => setDetailModal({ visible: true, review: record })}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa đánh giá"
            description="Bạn có chắc chắn muốn xóa đánh giá này không?"
            onConfirm={() => handleDelete(record.review_id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
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
          </Button>,
          <Button
            key="edit"
            icon={<EditOutlined />}
            onClick={() => {
              handleOpenEditModal(detailModal.review)
              setDetailModal({ visible: false, review: null })
            }}
          >
            Chỉnh sửa
          </Button>,
          <Popconfirm
            key="delete"
            title="Xóa đánh giá"
            description="Bạn có chắc chắn muốn xóa đánh giá này không?"
            onConfirm={() => {
              handleDelete(detailModal.review?.review_id)
              setDetailModal({ visible: false, review: null })
            }}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>,
          <Button
            key="reply"
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleOpenReplyModal(detailModal.review)}
          >
            {detailModal.review?.reply || detailModal.review?.admin_reply ? 'Sửa phản hồi' : 'Phản hồi'}
          </Button>
        ]}
        width={600}
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
                    <Text>{formatDateTime(detailModal.review.created_at)}</Text>
                  </div>
                  {detailModal.review.updated_at && detailModal.review.updated_at !== detailModal.review.created_at && (
                    <div>
                      <Text strong>Cập nhật lúc: </Text>
                      <Text>{formatDateTime(detailModal.review.updated_at)}</Text>
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

            {/* Phản hồi của admin (nếu có) */}
            {(detailModal.review.reply || detailModal.review.admin_reply) && (
              <>
                <Divider />
                <div style={{ 
                  background: '#f0f2f5', 
                  padding: '16px', 
                  borderRadius: '8px',
                  borderLeft: '4px solid #1890ff'
                }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={5} style={{ margin: 0 }}>
                        <MessageOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Phản hồi từ quản trị viên
                      </Title>
                      {detailModal.review.reply_at && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {formatDateTime(detailModal.review.reply_at)}
                        </Text>
                      )}
                    </div>
                    <Text style={{ fontSize: '14px', lineHeight: '1.8', color: '#333' }}>
                      {detailModal.review.reply || detailModal.review.admin_reply}
                    </Text>
                  </Space>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Phản hồi */}
      <Modal
        title={
          <Space>
            <SendOutlined />
            <span>{replyModal.reviewId && (detailModal.review?.reply || detailModal.review?.admin_reply) ? 'Sửa phản hồi' : 'Phản hồi đánh giá'}</span>
          </Space>
        }
        open={replyModal.visible}
        onCancel={() => {
          setReplyModal({ visible: false, reviewId: null, loading: false })
          setReplyText('')
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setReplyModal({ visible: false, reviewId: null, loading: false })
              setReplyText('')
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SendOutlined />}
            loading={replyModal.loading}
            onClick={handleSubmitReply}
            disabled={!replyText.trim()}
          >
            Gửi phản hồi
          </Button>
        ]}
        width={600}
        centered
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Nội dung phản hồi <Text type="danger">*</Text>
            </Text>
            <TextArea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Nhập nội dung phản hồi cho khách hàng..."
              rows={6}
              maxLength={1000}
              showCount
            />
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Phản hồi của bạn sẽ được hiển thị công khai dưới đánh giá này.
          </Text>
        </Space>
      </Modal>

      {/* Modal Chỉnh sửa Review */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>Chỉnh sửa đánh giá</span>
          </Space>
        }
        open={editModal.visible}
        onCancel={() => {
          setEditModal({ visible: false, review: null, loading: false })
          setEditForm({ rating: 5, comment: '', images: [] })
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setEditModal({ visible: false, review: null, loading: false })
              setEditForm({ rating: 5, comment: '', images: [] })
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={editModal.loading}
            onClick={handleUpdateReview}
            disabled={!editForm.rating || editForm.rating < 1}
          >
            Cập nhật
          </Button>
        ]}
        width={600}
        centered
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Đánh giá <Text type="danger">*</Text>
            </Text>
            <Rate
              value={editForm.rating}
              onChange={(value) => setEditForm(prev => ({ ...prev, rating: value }))}
              style={{ fontSize: '24px' }}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}>
              {editForm.rating === 1 && 'Rất không hài lòng'}
              {editForm.rating === 2 && 'Không hài lòng'}
              {editForm.rating === 3 && 'Bình thường'}
              {editForm.rating === 4 && 'Hài lòng'}
              {editForm.rating === 5 && 'Rất hài lòng'}
            </Text>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Nội dung đánh giá
            </Text>
            <TextArea
              value={editForm.comment}
              onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Nhập nội dung đánh giá..."
              rows={6}
              maxLength={1000}
              showCount
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Hình ảnh đính kèm (tối đa 10 ảnh)
            </Text>
            <Upload
              listType="picture-card"
              fileList={editForm.images}
              onChange={({ fileList }) => {
                const validFiles = fileList.filter(file => {
                  if (file.originFileObj) return true
                  return file.url || file.thumbUrl
                })
                setEditForm(prev => ({
                  ...prev,
                  images: validFiles.slice(0, 10)
                }))
              }}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/')
                if (!isImage) {
                  message.error('Chỉ có thể upload file ảnh!')
                  return false
                }
                const isLt5M = file.size / 1024 / 1024 < 5
                if (!isLt5M) {
                  message.error('Ảnh phải nhỏ hơn 5MB!')
                  return false
                }
                return false
              }}
              onRemove={(file) => {
                setEditForm(prev => ({
                  ...prev,
                  images: prev.images.filter(img => img.uid !== file.uid)
                }))
              }}
              accept="image/*"
            >
              {editForm.images.length < 10 && (
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
  )
}

export default ReviewManagement

