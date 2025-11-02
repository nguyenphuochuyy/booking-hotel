import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Breadcrumb, 
  Typography, 
  Spin, 
  Empty, 
  Tag, 
  Space, 
  Button,
  Image,
  Divider,
  Row,
  Col,
  Grid
} from 'antd'
import { 
  HomeOutlined, 
  CalendarOutlined, 
  UserOutlined,
  TagOutlined,
  ArrowLeftOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { usePostDetail } from '../../hooks/posts'
import { getMockPostByIdentifier } from '../../data/mockNews'
import './NewsDetail.css'

const { Title, Text, Paragraph } = Typography
const { useBreakpoint } = Grid

function NewsDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const screens = useBreakpoint()
  
  // usePostDetail hỗ trợ cả ID và slug tự động
  const { post: apiPost, loading, error } = usePostDetail(slug)
  
  // Fallback to mock data if API fails or no data
  const mockPost = useMemo(() => getMockPostByIdentifier(slug), [slug])
  const post = apiPost || (!loading ? mockPost : null)

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="news-detail-page">
        <div className="news-detail-container">
          <div className="news-detail-loading">
            <Spin size="large" />
            <Text className="news-detail-loading-text">Đang tải bài viết...</Text>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="news-detail-page">
        <div className="news-detail-container">
          <div className="news-detail-error">
            <Empty 
              description={error || 'Không tìm thấy bài viết'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button 
              type="primary" 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/news')}
              style={{ marginTop: 24 }}
            >
              Quay lại trang tin tức
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="news-detail-page">
      <div className="news-detail-container">
        {/* Breadcrumb */}
        <Breadcrumb 
          className="news-detail-breadcrumb"
          items={[
            {
              href: '/',
              title: (
                <>
                  <HomeOutlined />
                  <span>Trang chủ</span>
                </>
              ),
            },
            {
              href: '/news',
              title: 'Tin tức',
            },
            {
              title: post.title,
            },
          ]}
        />

        {/* Back Button */}
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/news')}
          className="news-detail-back-button"
        >
          Quay lại
        </Button>

        {/* Header */}
        <div className="news-detail-header">
          {post.category && (
            <Tag color="gold" className="news-detail-category-tag">
              {post.category.name}
            </Tag>
          )}
          <Title level={1} className="news-detail-title">
            {post.title}
          </Title>
          
          <div className="news-detail-meta">
            <Space size="large" wrap>
              {post.author && (
                <Text className="news-detail-meta-item">
                  <UserOutlined /> {post.author.full_name || 'Admin'}
                </Text>
              )}
              {post.created_at && (
                <Text className="news-detail-meta-item">
                  <CalendarOutlined /> {formatDate(post.created_at)}
                </Text>
              )}
              {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="news-detail-tags">
                  <Space size={[0, 8]} wrap>
                    <TagOutlined style={{ color: '#9ca3af', marginRight: 4 }} />
                    {post.tags.map((tag, index) => (
                      <Tag key={index} color="default">{tag}</Tag>
                    ))}
                  </Space>
                </div>
              )}
            </Space>
          </div>
        </div>

        {/* Cover Image */}
        {(post.cover_image_url || post.image) && (
          <div className="news-detail-cover">
            <Image
              src={post.cover_image_url || post.image}
              alt={post.title}
              className="news-detail-cover-image"
              preview={{
                mask: (
                  <div className="news-detail-preview-mask">
                    <EyeOutlined />
                    <span>Xem ảnh</span>
                  </div>
                )
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="news-detail-content">
          {post.content && (
            <div 
              className="news-detail-content-html"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}
        </div>

        {/* Additional Images */}
        {post.images && Array.isArray(post.images) && post.images.length > 0 && (
          <>
            <Divider className="news-detail-divider" />
            <div className="news-detail-images">
              <Title level={4} className="news-detail-images-title">
                Hình ảnh liên quan
              </Title>
              <Row 
                gutter={screens.xs ? [16, 16] : screens.md ? [20, 20] : [24, 24]}
                className="news-detail-images-grid"
              >
                {post.images.map((imageUrl, index) => (
                  <Col 
                    key={index}
                    xs={24}
                    sm={12}
                    md={8}
                    lg={8}
                  >
                    <Image
                      src={imageUrl}
                      alt={`${post.title} - Ảnh ${index + 1}`}
                      className="news-detail-image-item"
                      preview={{
                        mask: (
                          <div className="news-detail-preview-mask">
                            <EyeOutlined />
                            <span>Xem ảnh</span>
                          </div>
                        )
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          </>
        )}

        {/* Footer Actions */}
        <Divider className="news-detail-divider" />
        <div className="news-detail-footer">
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/news')}
            size={screens.xs ? 'middle' : 'large'}
          >
            Quay lại danh sách tin tức
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NewsDetail

