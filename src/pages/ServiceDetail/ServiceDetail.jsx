import React, { useEffect, useState } from 'react'
import { Row, Col, Typography, Breadcrumb, Space, Card, Button, Divider } from 'antd'
import { HomeOutlined, PhoneOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined, StarFilled } from '@ant-design/icons'
import { Link, useParams, useNavigate } from 'react-router-dom'
import './ServiceDetail.css'

const { Title, Paragraph } = Typography

function ServiceDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Data mẫu cho các dịch vụ
  const servicesData = {
    'hoi-nghi-su-kien': {
      title: 'Hội nghị - Sự kiện',
      description: 'Tổ chức hội nghị, hội thảo chuyên nghiệp với đầy đủ trang thiết bị hiện đại',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
      details: {
        intro: 'Bean Hotel tự hào cung cấp dịch vụ tổ chức hội nghị, sự kiện chuyên nghiệp với không gian sang trọng và đội ngũ hỗ trợ tận tình. Chúng tôi có các phòng họp với sức chứa từ 20 đến 500 người, đáp ứng mọi quy mô sự kiện của bạn.',
        features: [
          'Phòng họp rộng rãi, hiện đại với sức chứa linh hoạt',
          'Hệ thống âm thanh, ánh sáng chuyên nghiệp',
          'Máy chiếu, màn hình LED cỡ lớn',
          'Kết nối Internet tốc độ cao, WiFi miễn phí',
          'Dịch vụ ăn uống, coffee break theo yêu cầu',
          'Đội ngũ kỹ thuật hỗ trợ 24/7',
          'Bãi đậu xe rộng rãi cho khách tham dự',
          'Thiết kế bố trí phòng theo yêu cầu'
        ],
        pricing: 'Từ 5.000.000 VNĐ/ngày',
        duration: 'Linh hoạt theo nhu cầu',
        availability: 'Đặt trước 7 ngày'
      }
    },
    'tiec-cuoi': {
      title: 'Tiệc cưới',
      description: 'Không gian lãng mạn cho ngày trọng đại của bạn',
      image: 'https://images.unsplash.com/photo-1519167758481-83f29da8c2b0?w=1200',
      details: {
        intro: 'Biến giấc mơ đám cưới của bạn thành hiện thực với không gian sang trọng, lãng mạn tại Bean Hotel. Đội ngũ wedding planner giàu kinh nghiệm sẽ đồng hành cùng bạn trong ngày trọng đại.',
        features: [
          'Sảnh tiệc sang trọng, sức chứa 200-800 khách',
          'Trang trí tiệc cưới theo chủ đề',
          'Thực đơn đa dạng từ Á đến Âu',
          'Hệ thống âm thanh, ánh sáng chuyên nghiệp',
          'Màn hình LED hiển thị ảnh cưới',
          'Đội ngũ phục vụ chuyên nghiệp',
          'Phòng cô dâu trang điểm riêng biệt',
          'Wedding planner tư vấn miễn phí'
        ],
        pricing: 'Từ 15.000.000 VNĐ',
        duration: '1 ngày',
        availability: 'Đặt trước 3 tháng'
      }
    },
    'suc-khoe-lam-dep': {
      title: 'Sức khỏe - Làm đẹp',
      description: 'Spa cao cấp với các liệu trình massage và chăm sóc sức khỏe',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',

      details: {
        intro: 'Trải nghiệm thư giãn tuyệt vời tại Spa của Bean Hotel với các liệu trình chăm sóc sức khỏe và làm đẹp bằng sản phẩm thiên nhiên cao cấp. Đội ngũ chuyên viên giàu kinh nghiệm sẽ mang đến cho bạn những phút giây thư thái nhất.',
        features: [
          'Massage body thư giãn toàn thân',
          'Chăm sóc da mặt chuyên sâu',
          'Tắm trắng, tẩy tế bào chết',
          'Liệu trình chăm sóc tóc',
          'Manicure, Pedicure cao cấp',
          'Xông hơi, Jacuzzi thư giãn',
          'Yoga, Meditation',
          'Sản phẩm thiên nhiên cao cấp'
        ],
        pricing: 'Từ 500.000 VNĐ/liệu trình',
        duration: '60 - 180 phút',
        availability: 'Đặt trước 1 ngày'
      }
    },
    'nha-hang-am-thuc': {
      title: 'Nhà hàng - Ẩm thực',
      description: 'Thưởng thức ẩm thực đa dạng từ Á đến Âu',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',

      details: {
        intro: 'Nhà hàng Bean Hotel mang đến trải nghiệm ẩm thực đẳng cấp với thực đơn đa dạng từ món Á đến Âu, được chế biến bởi đội ngũ đầu bếp hàng đầu. Không gian sang trọng, lãng mạn là điểm đến lý tưởng cho mọi dịp.',
        features: [
          'Thực đơn đa dạng Á - Âu',
          'Đầu bếp chuyên nghiệp nhiều năm kinh nghiệm',
          'Nguyên liệu tươi ngon, cao cấp',
          'Không gian sang trọng, riêng tư',
          'Phục vụ buffet và set menu',
          'Bar với các loại cocktail đặc biệt',
          'View thành phố tuyệt đẹp',
          'Phục vụ từ sáng đến đêm'
        ],
        pricing: 'Từ 300.000 VNĐ/người',
        duration: 'Linh hoạt',
        availability: 'Mở cửa 6:00 - 23:00'
      }
    },
    'dua-don-san-bay': {
      title: 'Đưa đón sân bay',
      description: 'Dịch vụ đưa đón sân bay 24/7 với xe sang trọng',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200',

      details: {
        intro: 'Bean Hotel cung cấp dịch vụ đưa đón sân bay cao cấp với xe sang trọng và tài xế chuyên nghiệp. Chúng tôi cam kết đúng giờ, an toàn và thoải mái cho mọi chuyến đi.',
        features: [
          'Xe sang trọng 4-7 chỗ',
          'Tài xế chuyên nghiệp, lịch sự',
          'Phục vụ 24/7 kể cả ngày lễ',
          'Theo dõi chuyến bay real-time',
          'Hỗ trợ hành lý miễn phí',
          'WiFi và nước uống trên xe',
          'Đúng giờ, an toàn',
          'Giá cả minh bạch, không phụ thu'
        ],
        pricing: 'Từ 500.000 VNĐ/chuyến',
        duration: '30-60 phút',
        availability: 'Đặt trước 2 giờ'
      }
    },
    'dich-vu-phong': {
      title: 'Dịch vụ phòng 24/7',
      description: 'Phục vụ tận phòng 24/7 với thực đơn đa dạng',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',

      details: {
        intro: 'Dịch vụ phòng 24/7 của Bean Hotel mang đến sự tiện nghi tối đa với thực đơn đa dạng và phục vụ nhanh chóng. Quý khách có thể thưởng thức bữa ăn ngon trong không gian riêng tư của mình.',
        features: [
          'Phục vụ 24/7 không ngừng nghỉ',
          'Thực đơn đa dạng hơn 100 món',
          'Đồ ăn nóng hổi, tươi ngon',
          'Giao hàng nhanh chóng trong 30 phút',
          'Nước uống, rượu vang cao cấp',
          'Bữa sáng tại phòng miễn phí',
          'Đồ dùng sinh hoạt theo yêu cầu',
          'Phục vụ chuyên nghiệp, kín đáo'
        ],
        pricing: 'Theo thực đơn',
        duration: '24/7',
        availability: 'Luôn sẵn sàng'
      }
    },
    'bao-ve-an-ninh': {
      title: 'Bảo vệ - An ninh',
      description: 'Hệ thống an ninh 24/7 đảm bảo an toàn tuyệt đối',
      image: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=1200',
 
      details: {
        intro: 'Bean Hotel đầu tư hệ thống an ninh hiện đại nhất với camera giám sát 24/7 và đội ngũ bảo vệ chuyên nghiệp. An toàn của quý khách là ưu tiên hàng đầu của chúng tôi.',
        features: [
          'Camera giám sát 24/7 toàn bộ khu vực',
          'Đội ngũ bảo vệ tuần tra liên tục',
          'Hệ thống kiểm soát ra vào bằng thẻ từ',
          'Két an toàn trong phòng',
          'Hệ thống báo cháy tự động',
          'Lối thoát hiểm khẩn cấp',
          'Đào tạo nhân viên về an toàn',
          'Phối hợp công an địa phương'
        ],
        pricing: 'Miễn phí',
        duration: '24/7',
        availability: 'Luôn hoạt động'
      }
    },
    'giat-ui-ve-sinh': {
      title: 'Giặt ủi - Vệ sinh',
      description: 'Dịch vụ giặt ủi cao cấp, trả nhanh trong ngày',
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1200',
 
      details: {
        intro: 'Dịch vụ giặt ủi cao cấp của Bean Hotel sử dụng công nghệ hiện đại và hóa chất thân thiện với môi trường. Chúng tôi cam kết quần áo của bạn luôn sạch sẽ, thơm tho và được trả đúng hạn.',
        features: [
          'Giặt khô, giặt ướt chuyên nghiệp',
          'Ủi là phẳng phiu, gấp gọn',
          'Hóa chất cao cấp, an toàn',
          'Trả trong 24h, gấp trong 6h',
          'Giặt đồ cao cấp, áo vest, váy dạ hội',
          'Vệ sinh giày dép',
          'Giá cả hợp lý, minh bạch',
          'Bảo quản đồ cẩn thận'
        ],
        pricing: 'Từ 30.000 VNĐ/kg',
        duration: '24 giờ',
        availability: 'Đặt trước 1 giờ'
      }
    }
  }

  useEffect(() => {
    // Scroll về đầu trang
    window.scrollTo(0, 0)
    
    // Lấy dữ liệu từ servicesData dựa trên slug
    const serviceData = servicesData[slug]
    
    if (serviceData) {
      setService(serviceData)
    }

    // Hiệu ứng fade in
    setTimeout(() => {
      setIsLoaded(true)
    }, 200)
  }, [slug])

  if (!service) {
    return (
      <div className="service-detail-page">
        <div className="container">
          <Title level={3}>Không tìm thấy dịch vụ</Title>
          <Link to="/services">
            <Button type="primary">Quay lại danh sách dịch vụ</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`service-detail-page ${isLoaded ? 'loaded' : ''}`}>
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/services">Dịch vụ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{service.title}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Hero Image */}
        <div className="hero-section">
          <img src={service.image} alt={service.title} className="hero-image" />
          <div className="hero-overlay">
            <Title className="hero-title">{service.title}</Title>
            <Paragraph className="hero-description">{service.description}</Paragraph>
          </div>
        </div>

        {/* Content Section */}
        <Row gutter={[32, 32]} className="content-section">
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card className="detail-card">
              <Title level={3} style={{ color: service.color }}>Giới thiệu</Title>
              <Paragraph className="intro-text">{service.details?.intro}</Paragraph>

              <Divider />

              <Title level={3} style={{ color: service.color }}>Đặc điểm nổi bật</Title>
              <div className="features-list">
                {service.details?.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <CheckCircleOutlined style={{ color: service.color, fontSize: 18 }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Card className="info-card" style={{ borderTop: `4px solid ${service.color}` }}>
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <div className="info-item">
                  <DollarOutlined style={{ fontSize: 24, color: service.color }} />
                  <div>
                    <div className="info-label">Giá dịch vụ</div>
                    <div className="info-value">{service.details?.pricing}</div>
                  </div>
                </div>

                <Divider style={{ margin: 0 }} />

                <div className="info-item">
                  <ClockCircleOutlined style={{ fontSize: 24, color: service.color }} />
                  <div>
                    <div className="info-label">Thời gian</div>
                    <div className="info-value">{service.details?.duration}</div>
                  </div>
                </div>

                <Divider style={{ margin: 0 }} />

                <div className="info-item">
                  <StarFilled style={{ fontSize: 24, color: service.color }} />
                  <div>
                    <div className="info-label">Đặt trước</div>
                    <div className="info-value">{service.details?.availability}</div>
                  </div>
                </div>

                <Divider style={{ margin: 0 }} />

                <Button 
                  type="primary" 
                  icon={<PhoneOutlined />} 
                  block 
                  size="large"
                  style={{ background: service.color, borderColor: service.color, height: 50 }}
                  onClick={() => navigate('/contact')}
                >
                  Liên hệ đặt dịch vụ
                </Button>

                <Button 
                  block 
                  size="large"
                  style={{ height: 50 }}
                  onClick={() => navigate('/services')}
                >
                  Xem dịch vụ khác
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default ServiceDetail

