import React, { useState } from 'react'
import { Row, Col, Card, Typography, Breadcrumb, Space } from 'antd'
import { HomeOutlined, CalendarOutlined, HeartOutlined, CoffeeOutlined, CarOutlined, WifiOutlined, SafetyOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import './Services.css'

const { Title, Paragraph } = Typography

function Services() {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState(null)

  const services = [
    {
      id: 1,
      title: 'Hội nghị - Sự kiện',
      slug: 'hoi-nghi-su-kien',
      description: 'Tổ chức hội nghị, hội thảo chuyên nghiệp với đầy đủ trang thiết bị hiện đại, phòng họp rộng rãi và dịch vụ hỗ trợ tận tình.',
      icon: <CalendarOutlined />,
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
  
    },
    {
      id: 2,
      title: 'Tiệc cưới',
      slug: 'tiec-cuoi',
      description: 'Không gian lãng mạn cho ngày trọng đại của bạn. Đội ngũ chuyên nghiệp sẽ biến giấc mơ đám cưới của bạn thành hiện thực.',
      icon: <HeartOutlined />,
      image: 'https://bizweb.dktcdn.net/thumb/large/100/472/947/articles/to-chuc-tiec-cuoi-ket-noi-nhan-duyen.jpg?v=1670341337250',

    },
    {
      id: 3,
      title: 'Sức khỏe - Làm đẹp',
      slug: 'suc-khoe-lam-dep',
      description: 'Spa cao cấp với các liệu trình massage, chăm sóc da mặt, và trị liệu thư giãn bằng các sản phẩm thiên nhiên cao cấp.',
      icon: <HeartOutlined />,
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',

    },
    {
      id: 4,
      title: 'Nhà hàng - Ẩm thực',
      slug: 'nha-hang-am-thuc',
      description: 'Thưởng thức ẩm thực đa dạng từ Á đến Âu với đội ngũ đầu bếp hàng đầu và không gian sang trọng, lãng mạn.',
      icon: <CoffeeOutlined />,
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',

    },
    {
      id: 5,
      title: 'Đưa đón sân bay',
      slug: 'dua-don-san-bay',
      description: 'Dịch vụ đưa đón sân bay 24/7 với xe sang trọng, tài xế chuyên nghiệp, đảm bảo sự thoải mái và đúng giờ.',
      icon: <CarOutlined />,
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',

    },
    {
      id: 6,
      title: 'Dịch vụ phòng 24/7',
      slug: 'dich-vu-phong',
      description: 'Phục vụ tận phòng 24/7 với thực đơn đa dạng, nước uống và các tiện ích khác theo yêu cầu của quý khách.',
      icon: <WifiOutlined />,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',

    },
    {
      id: 7,
      title: 'Bảo vệ - An ninh',
      slug: 'bao-ve-an-ninh',
      description: 'Hệ thống an ninh 24/7 với camera giám sát hiện đại và đội ngũ bảo vệ chuyên nghiệp để đảm bảo an toàn tuyệt đối.',
      icon: <SafetyOutlined />,
      image: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800',

    },
    {
      id: 8,
      title: 'Giặt ủi - Vệ sinh',
      slug: 'giat-ui-ve-sinh',
      description: 'Dịch vụ giặt ủi cao cấp với công nghệ hiện đại, trả nhanh trong ngày, đảm bảo quần áo luôn sạch sẽ và thơm tho.',
      icon: <CoffeeOutlined />,
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800',

    }
  ]

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
              <Link to="/booking">
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

