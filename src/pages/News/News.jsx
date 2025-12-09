import React, { useState, useEffect, useMemo } from 'react'
import { 
  Row, 
  Col, 
  Card, 
  Input, 
  Select, 
  Typography, 
  Pagination, 
  Empty, 
  Spin,
  Tag,
  Button,
  Breadcrumb,
  Grid,
  Space
} from 'antd'
import { 
  SearchOutlined, 
  CalendarOutlined, 
  UserOutlined,
  TagOutlined,
  HomeOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePosts, useCategories } from '../../hooks/posts'
import './News.css'

const { Title, Text, Paragraph } = Typography
const { Search } = Input
const { Option } = Select
const { useBreakpoint } = Grid

function News() {
  const screens = useBreakpoint()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Get initial params from URL
  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || 'all'

  const { posts, loading, error, pagination, search, category, searchPosts, filterByCategory, goToPage } = usePosts({
    search: initialSearch,
    category: initialCategory,
    status: 'published'
  })
  
  const { categories } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category !== 'all') params.set('category', category)
    setSearchParams(params)
  }, [search, category, setSearchParams])

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

  // Get excerpt from content
  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return ''
    // Remove HTML tags
    const plainText = content.replace(/<[^>]*>/g, '')
    if (plainText.length <= maxLength) return plainText
    return plainText.substring(0, maxLength) + '...'
  }

  // Get short HTML excerpt (preserve first paragraph/line-breaks)
  const getExcerptHtml = (contentHtml) => {
    if (!contentHtml || typeof contentHtml !== 'string') return ''
    try {
      // Lấy đoạn <p> đầu tiên (nếu có), bỏ hình ảnh để tránh vỡ layout
      const parts = contentHtml.split(/<\/p>/i)
      const firstPara = parts[0] || ''
      const cleaned = firstPara
        .replace(/<img[^>]*>/gi, '') // bỏ ảnh
        .replace(/<br\s*\/?>/gi, '<br/>') // chuẩn hóa br
      // Nếu không có thẻ <p>, bọc lại
      const hasP = /<p[^>]*>/i.test(cleaned)
      return hasP ? `${cleaned}</p>` : `<p>${cleaned}</p>`
    } catch {
      return ''
    }
  }

  // Handle search
  const handleSearch = (value) => {
    searchPosts(value)
    setSelectedCategory('all')
  }

  // Handle category filter
  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
    filterByCategory(value)
  }

  // Handle pagination
  const handlePageChange = (page) => {
    goToPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Navigate to post detail
  const handleCardClick = (post) => {
    if (post.slug) {
      navigate(`/news/${post.slug}`)
    } else if (post.post_id) {
      navigate(`/news/${post.post_id}`)
    }
  }
  const featuredPost = posts[0];
  return (
    <div className="news-page container">
      <div className="news-container">
        {/* Breadcrumb */}
        <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item href="/"><HomeOutlined /> Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item>Tin tức</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">TIN TỨC & SỰ KIỆN</h1>
          <Paragraph className="page-description">
            Cập nhật những thông tin mới nhất về khách sạn, du lịch và các sự kiện đặc biệt
          </Paragraph>
        </div>

        {/* Filters */}
        <div className="news-filters">
          <Row 
            gutter={screens.xs ? [16, 16] : screens.md ? [20, 20] : [24, 24]}
            align="middle"
          >
            <Col 
              xs={24} 
              sm={24} 
              md={14} 
              lg={16}
            >
              <Search
                placeholder="Tìm kiếm tin tức..."
                allowClear
                enterButton={<SearchOutlined />}
                size={screens.xs ? "middle" : "large"}
                onSearch={handleSearch}
                defaultValue={search}
                className="news-search-input"
              />
            </Col>
            <Col 
              xs={24} 
              sm={24} 
              md={10} 
              lg={8}
            >
              <Select
                placeholder="Tất cả danh mục"
                value={selectedCategory}
                onChange={handleCategoryChange}
                size={screens.xs ? "middle" : "large"}
                className="news-category-select"
                style={{ width: '100%' }}
              >
                <Option value="all">Tất cả danh mục</Option>
                {categories.map((cat) => (
                  <Option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="news-loading">
            <Spin size="large" />
            <Text className="news-loading-text">Đang tải tin tức...</Text>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="news-error">
            <Text type="danger">{error}</Text>
            <Button 
              type="primary" 
              onClick={() => window.location.reload()}
              style={{ marginTop: 16 }}
            >
              Thử lại
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="news-empty">
            <Empty 
              description="Không tìm thấy tin tức nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            {(search || category !== 'all') && (
              <Button 
                type="primary"
                onClick={() => {
                  handleSearch('')
                  handleCategoryChange('all')
                }}
                style={{ marginTop: 16 }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        )}

        {/* News Grid */}
        {!loading && !error && posts.length > 0 && (
          <>
          <div className="featured-post-wrapper" onClick={() => handleCardClick(featuredPost)}>
        <Row gutter={[0, 0]} className="featured-card">
          <Col xs={24} md={14}>
            <div className="featured-image-container">
               <img 
                 src={featuredPost.cover_image_url || featuredPost.image} 
                 alt={featuredPost.title} 
               />
               <Tag color="#E6A73F" className="featured-tag">Mới nhất</Tag>
            </div>
          </Col>
          <Col xs={24} md={10}>
            <div className="featured-content">
              <div className="featured-meta">
                <CalendarOutlined /> {formatDate(featuredPost.created_at)}
              </div>
              <Title level={2} className="featured-title">{featuredPost.title}</Title>
              <Paragraph className="featured-desc" ellipsis={{ rows: 4 }}>
                 {/* Chỉ lấy text thuần, không render HTML để tránh lỗi */}
                 {getExcerpt(featuredPost.content, 250)}
              </Paragraph>
              <Button type="link" className="featured-btn">Đọc tiếp <ArrowRightOutlined /></Button>
            </div>
          </Col>
        </Row>
      </div>
            <Row 
              gutter={screens.xs ? [16, 24] : screens.md ? [24, 32] : [32, 40]}
              className="news-grid"
            >
              {posts.map((post) => (
                <Col 
                  key={post.post_id}
                  xs={24} 
                  sm={24} 
                  md={12} 
                  lg={8}
                  xl={8}
                >
                  <Card
                    className="news-card"
                    hoverable
                    cover={
                      <div className="news-card-image">
                        {post.cover_image_url || post.image ? (
                          <img 
                            src={post.cover_image_url || post.image} 
                            alt={post.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className="news-card-placeholder">
                            <Text type="secondary">Không có ảnh</Text>
                          </div>
                        )}
                        {post.category && (
                          <div className="news-card-category">
                            <Tag color="gold">{post.category.name}</Tag>
                          </div>
                        )}
                      </div>
                    }
                    onClick={() => handleCardClick(post)}
                  >
                    <div className="news-card-content">
                      <Title level={4} className="news-card-title">
                        {post.title}
                      </Title>
                      
                      <Paragraph className="news-card-excerpt">
                        {/* Fallback text if HTML excerpt empty */}
                        <span style={{ display: 'none' }}>{getExcerpt(post.content)}</span>
                        <div
                          className="news-card-excerpt-html"
                          dangerouslySetInnerHTML={{ __html: getExcerptHtml(post.content) }}
                        />
                      </Paragraph>

                      <div className="news-card-meta">
                        <Space size="small" wrap>
                          {post.author && (
                            <Text className="news-card-author">
                              <UserOutlined /> {post.author.full_name || 'Admin'}
                            </Text>
                          )}
                          {post.created_at && (
                            <Text className="news-card-date">
                              <CalendarOutlined /> {formatDate(post.created_at)}
                            </Text>
                          )}
                        </Space>
                      </div>

                      {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                        <div className="news-card-tags">
                          <Space size={[0, 8]} wrap>
                            <TagOutlined style={{ color: '#9ca3af' }} />
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <Tag key={index} color="default">{tag}</Tag>
                            ))}
                            {post.tags.length > 3 && (
                              <Tag color="default">+{post.tags.length - 3}</Tag>
                            )}
                          </Space>
                        </div>
                      )}

                      <div className="news-card-footer">
                        <Button 
                          type="primary" 
                          className="news-card-button"
                        >
                          Đọc thêm
                        </Button>
                      </div>
                    </div>
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
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} của ${total} tin tức`
                  }
                  responsive
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

