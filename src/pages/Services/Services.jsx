import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Breadcrumb, Spin, message, Tag, Modal, Button, Empty } from 'antd'
import {
  HomeOutlined, CalendarOutlined, HeartOutlined, CoffeeOutlined,
  CarOutlined, WifiOutlined, SafetyOutlined, ShopOutlined,
  InfoCircleOutlined, PhoneOutlined,
  KeyOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './Services.css'
import { serviceService } from '../../services/service.service'

const { Title, Paragraph, Text } = Typography

// --- CÁC HÀM HELPER (Giúp code gọn gàng hơn) ---

// 1. Chọn icon dựa trên tên dịch vụ
const getServiceIcon = (serviceName) => {
  const name = serviceName?.toLowerCase() || ''
  if (name.includes('hội nghị') || name.includes('sự kiện')) return <CalendarOutlined />
  if (name.includes('cưới') || name.includes('tiệc') || name.includes('spa')) return <HeartOutlined />
  if (name.includes('nhà hàng') || name.includes('ẩm thực') || name.includes('ăn')) return <CoffeeOutlined />
  if (name.includes('xe') || name.includes('đưa đón') || name.includes('taxi')) return <CarOutlined />
  if (name.includes('phòng') || name.includes('wifi')) return <WifiOutlined />
  if (name.includes('an ninh') || name.includes('bảo vệ')) return <SafetyOutlined />
  return <ShopOutlined />
}

// 2. Chọn màu sắc tag dựa trên tên dịch vụ
const getServiceColor = (serviceName) => {
  const name = serviceName?.toLowerCase() || ''
  if (name.includes('hội nghị') || name.includes('sự kiện')) return 'blue'
  if (name.includes('cưới') || name.includes('tiệc')) return 'magenta'
  if (name.includes('sức khỏe') || name.includes('spa')) return 'pink'
  if (name.includes('nhà hàng') || name.includes('ẩm thực')) return 'orange'
  if (name.includes('xe')) return 'green'
  if (name.includes('phòng')) return 'purple'
  return 'cyan'
}

// 3. Format tiền Việt Nam (VND)
const formatPrice = (price) => {
  if (price === 0) return 'Miễn phí'
  if (!price) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

// 4. Dịch payment_type sang tiếng Việt
const translatePaymentType = (paymentType) => {
  if (!paymentType) return null
  const type = paymentType.toUpperCase()
  if (type === 'POSTPAID' || type === 'TRẢ SAU') return 'Trả sau'
  if (type === 'PREPAID' || type === 'TRẢ TRƯỚC') return 'Trả trước'
  return paymentType
}

// 5. Dịch service_type sang tiếng Việt (nếu là POSTPAID/PREPAID)
const translateServiceType = (serviceType) => {
  if (!serviceType) return 'Tiện ích khác'
  const type = serviceType.toUpperCase()
  // Kiểm tra nếu service_type là POSTPAID hoặc PREPAID
  if (type === 'POSTPAID' || type === 'TRẢ SAU') return 'Trả sau'
  if (type === 'PREPAID' || type === 'TRẢ TRƯỚC') return 'Trả trước'
  // Nếu không phải POSTPAID/PREPAID, trả về giá trị gốc
  return serviceType
}

function Services() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      // Lấy danh sách services (giả sử API hỗ trợ pagination, lấy limit lớn để hiện hết)
      const response = await serviceService.getServices({ limit: 100 })

      if (response && response.services) {
        const mappedServices = response.services
          .filter(service => service.is_available) // Chỉ lấy dịch vụ đang hoạt động
          .map(service => {
            // Xử lý ảnh: API có thể trả về string JSON, array hoặc string thường
            let imageUrl = ''
            if (service.images) {
              if (typeof service.images === 'string') {
                try {
                  // Thử parse JSON nếu là string dạng mảng '["url1", "url2"]'
                  const parsed = JSON.parse(service.images)
                  imageUrl = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : service.images
                } catch {
                  // Nếu lỗi parse, dùng luôn string đó
                  imageUrl = service.images
                }
              } else if (Array.isArray(service.images) && service.images.length > 0) {
                imageUrl = service.images[0]
              }
            }
            // Ảnh mặc định nếu không có ảnh
            if (!imageUrl) imageUrl = 'https://via.placeholder.com/400x300?text=Bean+Hotel+Service'

            return {
              id: service.service_id,
              title: service.name,
              description: service.description || 'Dịch vụ cao cấp tại Bean Hotel.',
              image: imageUrl,
              color: getServiceColor(service.name),
              icon: getServiceIcon(service.name),
              price: service.price,
              service_type: service.service_type || 'Tiện ích khác',
              payment_type: service.payment_type || null // Lưu payment_type để hiển thị trong modal
            }
          })
        setServices(mappedServices)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      message.error('Không thể tải danh sách dịch vụ. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Mở Modal xem chi tiết
  const showModal = (service) => {
    setSelectedService(service)
    setIsModalOpen(true)
  }

  // Đóng Modal
  const handleCancel = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedService(null), 300) // Reset data sau khi đóng animation
  }

  // Xử lý khi nhấn nút Liên hệ/Đặt ngay
  const handleContact = () => {
    setIsModalOpen(false)
    navigate('/contact') // Chuyển hướng sang trang liên hệ
  }

  return (
    <div className="services-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item href="/"><HomeOutlined /> Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item>Dịch vụ</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">DỊCH VỤ & TIỆN ÍCH</h1>
          <Paragraph className="page-description">
            Tận hưởng kỳ nghỉ trọn vẹn với hệ thống dịch vụ đa dạng và đẳng cấp tại Bean Hotel.
          </Paragraph>
        </div>

        {/* Grid Danh sách Dịch vụ */}
        <div className="services-list-container">
          {loading ? (
            <div className="loading-container"><Spin size="large" tip="Đang tải dịch vụ..." /></div>
          ) : services.length === 0 ? (
            <div className="empty-container"><Empty description="Hiện chưa có dịch vụ nào." /></div>
          ) : (
            <Row gutter={[24, 24]}>
              {services.map((service) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={service.id}>
                  <Card
                    hoverable
                    className="service-card-item"
                    onClick={() => showModal(service)} // Click vào card mở Modal
                    cover={
                      <div className="service-card-img-wrapper">
                        <img alt={service.title} src={service.image} loading="lazy" />
                      </div>
                    }
                  >
                    <div className="service-card-body">
                      {/* Tên dịch vụ */}
                      <Title level={5} className="service-card-title" ellipsis={{ rows: 2 }}>
                        {service.title}
                      </Title>

                      {/* Giá tiền */}
                      <Text className="service-card-price">
                        {formatPrice(service.price)}
                      </Text>

                      {/* Mô tả ngắn (cắt bớt nếu dài) */}
                      <Paragraph className="service-card-desc" ellipsis={{ rows: 3 }}>
                        {service.description}
                      </Paragraph>

                      {/* Nút xem thêm giả (visual cue) */}
                      <div className="service-card-footer">
                        <Text type="secondary" style={{ fontSize: 12 }}>Nhấn để xem chi tiết</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        <div className="cta-wrapper">
          <Row justify="center" align="middle" gutter={[40, 40]}>
            <Col xs={24} md={14}>
              <div className="cta-content">
                <Title level={2} className="cta-title">
                  Bạn cần tư vấn thêm về dịch vụ?
                </Title>
                <Paragraph className="cta-desc">
                  Đừng ngần ngại liên hệ với đội ngũ chăm sóc khách hàng của Bean Hotel.
                  Chúng tôi luôn sẵn sàng hỗ trợ thiết kế những trải nghiệm riêng biệt dành cho bạn.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={10} style={{ textAlign: 'center' }}>
              <div className="cta-actions">
                <Button
                  type="primary"
                  size="large"
                  className="cta-btn-primary"
                  icon={<KeyOutlined />}
                  onClick={() => navigate('/booking')} // Điều hướng sang trang đặt phòng
                >
                  Đặt phòng ngay
                </Button>
                <Button
                  size="large"
                  className="cta-btn-secondary"
                  icon={<PhoneOutlined />}
                  onClick={() => navigate('/contact')} // Điều hướng sang liên hệ
                >
                  Liên hệ tư vấn
                </Button>
              </div>
            </Col>
          </Row>
        </div>
        {/* --- KẾT THÚC PHẦN CTA --- */}
        {/* --- MODAL CHI TIẾT DỊCH VỤ --- */}
        <Modal
          title={null}
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          width={700}
          centered
          className="service-detail-modal"
        >
          {selectedService && (
            <div className="modal-content-wrapper">
              {/* Ảnh lớn trong Modal */}
              <div className="modal-image-header">
                <img src={selectedService.image} alt={selectedService.title} />
              </div>

              <div className="modal-body-text">
                {/* Tag loại dịch vụ */}
                <Tag color={selectedService.color} style={{ marginBottom: 12, padding: '4px 10px' }}>
                  {selectedService.icon} {translateServiceType(selectedService.service_type).toUpperCase()}
                </Tag>

                {/* Tiêu đề lớn */}
                <Title level={3} style={{ margin: '0 0 8px 0', color: '#1a1a1a' }}>
                  {selectedService.title}
                </Title>

                {/* Loại thanh toán (chỉ hiển thị trong modal) */}
                {selectedService.payment_type && (
                  <div style={{ marginBottom: 12 }}>
                    <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px' }}>
                      Hình thức thanh toán: {translatePaymentType(selectedService.payment_type)}
                    </Tag>
                  </div>
                )}

                {/* Giá tiền nổi bật */}
                <Text className="modal-price">
                  {formatPrice(selectedService.price)}
                  {selectedService.price > 0 && <span className="price-unit"> / lần (hoặc khách)</span>}
                </Text>

                <div className="modal-divider" />

                <Title level={5}>Thông tin chi tiết</Title>
                <Paragraph className="modal-description">
                  {selectedService.description}
                </Paragraph>
                <Paragraph className="modal-note">
                  * Vui lòng liên hệ lễ tân hoặc đặt trước để được phục vụ tốt nhất.
                </Paragraph>

                {/* Nút hành động */}
                <div className="modal-actions">
                  <Button size="large" onClick={handleCancel}>
                    Đóng
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PhoneOutlined />}
                    onClick={handleContact}
                    style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
                  >
                    Liên hệ đặt dịch vụ
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </div>
  )
}

export default Services