import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Button, Input, Select, Tag, Spin, Empty, Pagination, Space, Divider } from 'antd'
import { SearchOutlined, CalendarOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { postService } from '../../services/post.service'
import './News.css'

const { Title, Paragraph, Text } = Typography
const { Search } = Input
const { Option } = Select

function News() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 6,
    total: 0
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Fetch posts
  const fetchPosts = async (page = 1, search = '', category = '') => {
    setLoading(true)
    setError(null)
    
    try {
      const params = {
        page,
        limit: pagination.pageSize,
        status: 'published'
      }
      
      if (search) params.search = search
      if (category) params.category_id = category
      
      const response = await postService.getPosts(params)
      setPosts(response.posts || [])
      setPagination(prev => ({
        ...prev,
        current: page,
        total: response.pagination?.totalItems || 0
      }))
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải tin tức')
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  // Handle search
  const handleSearch = (value) => {
    setSearchKeyword(value)
    fetchPosts(1, value, selectedCategory)
  }

  // Handle category filter
  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
    fetchPosts(1, searchKeyword, value)
  }

  // Handle pagination
  const handlePageChange = (page) => {
    fetchPosts(page, searchKeyword, selectedCategory)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Truncate text
  const truncateText = (text, maxLength = 150) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div className="news-page">
      <div className="news-container">
        {/* Header */}
        <div className="news-header">
          <Title level={1} className="news-title">
            Tin tức & Sự kiện
          </Title>
          <Paragraph className="news-subtitle">
            Cập nhật những tin tức mới nhất về khách sạn và các sự kiện đặc biệt
          </Paragraph>
        </div>

        {/* Search and Filter */}
        <div className="news-filters">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm kiếm tin tức..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Chọn danh mục"
                allowClear
                size="large"
                style={{ width: '100%' }}
                onChange={handleCategoryChange}
              >
                <Option value="">Tất cả danh mục</Option>
                <Option value="1">Tin tức</Option>
                <Option value="2">Sự kiện</Option>
                <Option value="3">Khuyến mãi</Option>
                <Option value="4">Du lịch</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Space>
                <Text type="secondary">
                  Hiển thị {posts.length} / {pagination.total} bài viết
                </Text>
              </Space>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Posts Grid */}
        {loading ? (
          <div className="news-loading">
            <Spin size="large" />
            <Text>Đang tải tin tức...</Text>
          </div>
        ) : error ? (
          <div className="news-error">
            <Empty
              description={error}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => fetchPosts()}>
                Thử lại
              </Button>
            </Empty>
          </div>
        ) : posts.length === 0 ? (
          <div className="news-empty">
            <Empty
              description="Không có tin tức nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {posts.map((post) => (
                <Col xs={24} sm={12} lg={8} key={post.post_id}>
                  <Card
                    hoverable
                    className="news-card"
                    cover={
                      post.cover_image_url ? (
                        <div className="news-card-image">
                          <img
                            alt={post.title}
                            src={post.cover_image_url}
                            style={{
                              width: '100%',
                              height: '200px',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="news-card-placeholder">
                          <Text type="secondary">Không có hình ảnh</Text>
                        </div>
                      )
                    }
                    actions={[
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/news/${post.slug}`)}
                      >
                        Đọc thêm
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Title level={4} className="news-card-title">
                          {post.title}
                        </Title>
                      }
                      description={
                        <div className="news-card-content">
                          <Paragraph className="news-card-excerpt">
                            {truncateText(post.content)}
                          </Paragraph>
                          
                          <div className="news-card-meta">
                            <Space size="small" wrap>
                              <Space size={4}>
                                <UserOutlined />
                                <Text type="secondary" size="small">
                                  {post.author?.full_name || 'Admin'}
                                </Text>
                              </Space>
                              <Space size={4}>
                                <CalendarOutlined />
                                <Text type="secondary" size="small">
                                  {formatDate(post.published_at || post.created_at)}
                                </Text>
                              </Space>
                            </Space>
                          </div>

                          {post.tags && post.tags.length > 0 && (
                            <div className="news-card-tags">
                              <Space size={4} wrap>
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <Tag key={index} color="blue" size="small">
                                    {tag}
                                  </Tag>
                                ))}
                              </Space>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {pagination.total > pagination.pageSize && (
              <div className="news-pagination">
                <Pagination
                  current={pagination.current}
                  total={pagination.total}
                  pageSize={pagination.pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} bài viết`
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default News

