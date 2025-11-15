import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Breadcrumb, Space, Spin, message } from 'antd'
import { HomeOutlined, CalendarOutlined, HeartOutlined, CoffeeOutlined, CarOutlined, WifiOutlined, SafetyOutlined, ShopOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import './Services.css'
import { serviceService } from '../../services/service.service'

const { Title, Paragraph } = Typography

// Mapping icon và color dựa trên tên service
const getServiceIcon = (serviceName) => {
  const name = serviceName.toLowerCase()
  if (name.includes('hội nghị') || name.includes('sự kiện') || name.includes('hội thảo')) {
    return <CalendarOutlined />
  }
  if (name.includes('cưới') || name.includes('tiệc')) {
    return <HeartOutlined />
  }
  if (name.includes('sức khỏe') || name.includes('làm đẹp') || name.includes('spa')) {
    return <HeartOutlined />
  }
  if (name.includes('nhà hàng') || name.includes('ẩm thực') || name.includes('ăn uống')) {
    return <CoffeeOutlined />
  }
  if (name.includes('sân bay') || name.includes('đưa đón') || name.includes('xe')) {
    return <CarOutlined />
  }
  if (name.includes('phòng') || name.includes('room service')) {
    return <WifiOutlined />
  }
  if (name.includes('bảo vệ') || name.includes('an ninh') || name.includes('security')) {
    return <SafetyOutlined />
  }
  if (name.includes('giặt') || name.includes('ủi') || name.includes('vệ sinh')) {
    return <ShopOutlined />
  }
  return <ShopOutlined />
}

const getServiceColor = (serviceName) => {
  const name = serviceName.toLowerCase()
  if (name.includes('hội nghị') || name.includes('sự kiện')) return '#1890ff'
  if (name.includes('cưới') || name.includes('tiệc')) return '#ff4d4f'
  if (name.includes('sức khỏe') || name.includes('làm đẹp')) return '#ff85c0'
  if (name.includes('nhà hàng') || name.includes('ẩm thực')) return '#faad14'
  if (name.includes('sân bay') || name.includes('đưa đón')) return '#52c41a'
  if (name.includes('phòng')) return '#722ed1'
  if (name.includes('bảo vệ') || name.includes('an ninh')) return '#2f54eb'
  if (name.includes('giặt') || name.includes('ủi')) return '#13c2c2'
  return '#1890ff'
}

// Tạo slug từ name
const createSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function Services() {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await serviceService.getServices({ limit: 1000 }) // Lấy tất cả services
      if (response && response.services) {
        // Map dữ liệu từ API sang format cần thiết
        const mappedServices = response.services
          .filter(service => service.is_available) // Chỉ hiển thị service available
          .map(service => {
            // Lấy ảnh đầu tiên từ images (có thể là JSON array hoặc string)
            let imageUrl = ''
            if (service.images) {
              if (typeof service.images === 'string') {
                try {
                  const parsed = JSON.parse(service.images)
                  imageUrl = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : service.images
                } catch {
                  imageUrl = service.images
                }
              } else if (Array.isArray(service.images) && service.images.length > 0) {
                imageUrl = service.images[0]
              }
            }
            
            // Fallback image nếu không có
            if (!imageUrl) {
              imageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
            }

            return {
              id: service.service_id,
              title: service.name,
              slug: createSlug(service.name),
              description: service.description || 'Dịch vụ chất lượng cao từ Bean Hotel',
              icon: getServiceIcon(service.name),
              image: imageUrl,
              color: getServiceColor(service.name),
              price: service.price,
              service_type: service.service_type
            }
          })
        setServices(mappedServices)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      message.error('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const handleServiceClick = (service) => {
    // Chuyển trực tiếp sang trang chi tiết (không truyền service object có icon)
    navigate(`/services/${service.slug}`)
  }

  return (
    <div className="services-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb className="breadcrumb-custom">
        <Breadcrumb.Item href="/">

            <HomeOutlined />
            <span>Trang chủ</span>
        
          </Breadcrumb.Item>
          <Breadcrumb.Item
 
          >Dịch vụ</Breadcrumb.Item>
        </Breadcrumb>

        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Dịch vụ của chúng tôi</h1>
          <Paragraph className="page-description">
            Bean Hotel cam kết mang đến cho quý khách những trải nghiệm tuyệt vời nhất với đa dạng các dịch vụ cao cấp
          </Paragraph>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Paragraph>Hiện tại chưa có dịch vụ nào.</Paragraph>
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {services.map((service) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={service.id}>
                <div 
                  className="service-card-wrapper"
                  onClick={() => handleServiceClick(service)}
                  onMouseEnter={() => setHoveredCard(service.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Card
                    hoverable
                    className={`service-card ${hoveredCard === service.id ? 'hovered' : ''}`}
                    cover={
                      <div className="service-image-wrapper">
                        <img
                          alt={service.title}
                          src={service.image}
                          className="service-image"
                        />
                        <div className="service-overlay" style={{ background: `${service.color}ee` }}>
                          <div className="service-icon" style={{ color: '#fff', fontSize: 48 }}>
                            {service.icon}
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <Card.Meta
                      title={<span className="service-title">{service.title}</span>}
                      description={
                        <Paragraph className="service-description" ellipsis={{ rows: 3 }}>
                          {service.description}
                        </Paragraph>
                      }
                    />
                    <div className="service-footer">
                      <span className="view-detail-link" style={{ color: service.color }}>
                        Xem chi tiết →
                      </span>
                    </div>
                  </Card>
                </div>
              </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <Space direction="vertical" size={16} style={{ textAlign: 'center', width: '100%' }}>
            <Title level={3} style={{ color: '#1a1a1a', margin: 0 }}>
              Cần hỗ trợ thêm thông tin?
            </Title>
            <Paragraph style={{ color: '#666', fontSize: 16, margin: 0 }}>
              Liên hệ với chúng tôi để được tư vấn chi tiết về các dịch vụ
            </Paragraph>
            <Space size={12}>
              <Link to="/contact">
                <button className="cta-button primary">Liên hệ ngay</button>
              </Link>
              <Link to="/hotels">
                <button className="cta-button secondary">Đặt phòng</button>
              </Link>
            </Space>
          </Space>
        </div>
      </div>
    </div>
  )
}

export default Services

