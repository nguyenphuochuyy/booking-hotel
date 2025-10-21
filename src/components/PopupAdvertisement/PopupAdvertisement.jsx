import React, { useState, useEffect } from 'react'
import { Modal, Row, Col, Typography, Button, Image } from 'antd'
import { CloseOutlined, GiftOutlined, CalendarOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './PopupAdvertisement.css'

const { Title, Paragraph } = Typography

function PopupAdvertisement() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Hiển thị popup sau 1 giây khi component mount
    const timer = setTimeout(() => {
      setVisible(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setVisible(false)
  }

  const handleBookNow = () => {
    setVisible(false)
    navigate('/booking')
  }

  const handleOverlayClick = (e) => {
    // Ngăn đóng popup khi click vào overlay
    e.stopPropagation()
  }

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={800}
      centered
      maskClosable={false}
      closable={false}
      className="advertisement-popup"
      destroyOnClose={false}
    >
      <div className="popup-content" onClick={handleOverlayClick}>
        {/* Close button */}
        <Button
          type="text"
          icon={<CloseOutlined />}
          className="popup-close-btn"
          onClick={handleClose}
        />

        <Row gutter={0} className="popup-row">
          {/* Left side - Image */}
          <Col xs={24} md={12} className="popup-image-col">
            <div className="popup-image-container">
              <Image
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Ưu đãi đặt phòng"
                className="popup-image"
                preview={false}
              />
              <div className="popup-image-overlay">
                <div className="discount-badge">
                  <GiftOutlined className="discount-icon" />
                  <span className="discount-text">10% OFF</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Right side - Content */}
          <Col xs={24} md={12} className="popup-content-col">
            <div className="popup-text-content">
              <div className="popup-header">
                <Title level={2} className="popup-title">
                  Ưu đãi khi đặt phòng lần đầu
                </Title>
                <Paragraph className="popup-subtitle">
                  Chào mừng bạn đến với Bean Hotel!
                </Paragraph>
              </div>

              <div className="popup-promo">
                <div className="promo-code-container">
                  <Title level={3} className="promo-code-title">
                    Nhập mã ưu đãi:
                  </Title>
                  <div className="promo-code-box">
                    <span className="promo-code">FIRST10</span>
                  </div>
                  <Paragraph className="promo-description">
                    Áp dụng cho lần đặt phòng đầu tiên
                  </Paragraph>
                </div>
              </div>

              <div className="popup-benefits">
                <ul className="benefits-list">
                  <li>Giảm giá 10% cho lần đặt phòng đầu tiên</li>
                  <li>Miễn phí bữa sáng cho 2 người</li>
                  <li>Nâng cấp phòng miễn phí (nếu có)</li>
                  <li>Hỗ trợ 24/7 trong suốt chuyến đi</li>
                </ul>
              </div>

              <div className="popup-actions">
                <Button
                  type="primary"
                  size="large"
                  icon={<CalendarOutlined />}
                  className="book-now-btn"
                  onClick={handleBookNow}
                  block
                >
                  Đặt phòng ngay
                </Button>
                <Button
                  type="link"
                  className="skip-btn"
                  onClick={handleClose}
                >
                  Bỏ qua
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  )
}

export default PopupAdvertisement
