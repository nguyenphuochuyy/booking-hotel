import React, { useState } from 'react'
import { 
  Modal, Card, Row, Col, Button, Typography, Space, 
  Image, Tag, InputNumber, Radio, Divider, Empty,
  Tooltip, Badge, Spin
} from 'antd'
import { 
  GiftOutlined, PlusOutlined, MinusOutlined, 
  DollarOutlined, ClockCircleOutlined, CheckCircleOutlined
} from '@ant-design/icons'
import { formatPrice } from '../../services/booking.service'
import './ServiceSelector.css'

const { Title, Text, Paragraph } = Typography

const ServiceSelector = ({ 
  visible, 
  onCancel, 
  services, 
  onAddService 
}) => {
  const [selectedServices, setSelectedServices] = useState({})
  const [loading, setLoading] = useState(false)

  // Handle service selection
  const handleServiceSelect = (service) => {
    setSelectedServices(prev => ({
      ...prev,
      [service.service_id]: {
        ...service,
        quantity: 1,
        payment_type: 'prepaid'
      }
    }))
  }

  // Handle quantity change
  const handleQuantityChange = (serviceId, quantity) => {
    if (quantity <= 0) {
      const newSelected = { ...selectedServices }
      delete newSelected[serviceId]
      setSelectedServices(newSelected)
      return
    }

    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        quantity
      }
    }))
  }

  // Handle payment type change
  const handlePaymentTypeChange = (serviceId, paymentType) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        payment_type: paymentType
      }
    }))
  }

  // Handle add services
  const handleAddServices = async () => {
    const servicesToAdd = Object.values(selectedServices)
    
    if (servicesToAdd.length === 0) {
      return
    }

    setLoading(true)
    
    try {
      // Add each service
      for (const service of servicesToAdd) {
        await onAddService(service, service.quantity, service.payment_type)
      }
      
      // Reset selection
      setSelectedServices({})
      onCancel()
    } catch (error) {
      console.error('Error adding services:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate total price
  const calculateTotalPrice = () => {
    return Object.values(selectedServices).reduce((total, service) => {
      return total + (service.price * service.quantity)
    }, 0)
  }

  // Get service type color
  const getServiceTypeColor = (serviceType) => {
    const colors = {
      'food': 'orange',
      'spa': 'purple',
      'transport': 'blue',
      'entertainment': 'green',
      'other': 'default'
    }
    return colors[serviceType] || 'default'
  }

  return (
    <Modal
      title={
        <div className="service-selector-header">
          <GiftOutlined style={{ color: '#52c41a', marginRight: 8 }} />
          <span>Chọn dịch vụ bổ sung</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={null}
      destroyOnClose
      className="service-selector-modal"
    >
      <div className="service-selector-content">
        {services.length === 0 ? (
          <Empty
            description="Không có dịch vụ nào khả dụng"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            {/* Services List */}
            <div className="services-list">
              <Row gutter={[16, 16]}>
                {services.map(service => (
                  <Col xs={24} sm={12} lg={8} key={service.service_id}>
                    <Card
                      className={`service-card ${
                        selectedServices[service.service_id] ? 'selected' : ''
                      }`}
                      hoverable
                      onClick={() => handleServiceSelect(service)}
                    >
                      <div className="service-image-container">
                        <Image
                          src={service.images?.[0] || '/placeholder-service.jpg'}
                          alt={service.name}
                          className="service-image"
                          preview={false}
                        />
                        {selectedServices[service.service_id] && (
                          <div className="selected-badge">
                            <CheckCircleOutlined />
                          </div>
                        )}
                      </div>
                      
                      <div className="service-content">
                        <Title level={5} className="service-name">
                          {service.name}
                        </Title>
                        
                        <Paragraph 
                          className="service-description"
                          ellipsis={{ rows: 2 }}
                        >
                          {service.description}
                        </Paragraph>
                        
                        <div className="service-meta">
                          <Space wrap>
                            <Tag color={getServiceTypeColor(service.service_type)}>
                              {service.service_type}
                            </Tag>
                            <Tag 
                              color={service.service_type === 'prepaid' ? 'green' : 'orange'}
                              icon={<DollarOutlined />}
                            >
                              {service.service_type === 'prepaid' ? 'Trả trước' : 'Trả sau'}
                            </Tag>
                          </Space>
                        </div>
                        
                        <div className="service-price">
                          <Text strong className="price-amount">
                            {formatPrice(service.price)}
                          </Text>
                          <Text type="secondary" className="price-unit">
                            /{service.unit || 'lần'}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Selected Services Summary */}
            {Object.keys(selectedServices).length > 0 && (
              <div className="selected-services-summary">
                <Divider />
                <Title level={4}>Dịch vụ đã chọn</Title>
                
                <div className="selected-services-list">
                  {Object.values(selectedServices).map(service => (
                    <div key={service.service_id} className="selected-service-item">
                      <div className="service-info">
                        <Text strong>{service.name}</Text>
                        <Text type="secondary">{service.description}</Text>
                      </div>
                      
                      <div className="service-controls">
                        <div className="quantity-control">
                          <Text>Số lượng:</Text>
                          <InputNumber
                            min={1}
                            max={10}
                            value={service.quantity}
                            onChange={(value) => handleQuantityChange(service.service_id, value)}
                            addonBefore={<MinusOutlined />}
                            addonAfter={<PlusOutlined />}
                          />
                        </div>
                        
                        <div className="payment-type-control">
                          <Text>Thanh toán:</Text>
                          <Radio.Group
                            value={service.payment_type}
                            onChange={(e) => handlePaymentTypeChange(service.service_id, e.target.value)}
                            size="small"
                          >
                            <Radio value="prepaid">Trả trước</Radio>
                            <Radio value="postpaid">Trả sau</Radio>
                          </Radio.Group>
                        </div>
                        
                        <div className="service-total">
                          <Text strong>
                            {formatPrice(service.price * service.quantity)}
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="total-summary">
                  <div className="total-price">
                    <Text strong>Tổng cộng:</Text>
                    <Text strong className="total-amount">
                      {formatPrice(calculateTotalPrice())}
                    </Text>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="service-actions">
              <Button size="large" onClick={onCancel}>
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleAddServices}
                loading={loading}
                disabled={Object.keys(selectedServices).length === 0}
                icon={<PlusOutlined />}
              >
                Thêm {Object.keys(selectedServices).length} dịch vụ
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default ServiceSelector

