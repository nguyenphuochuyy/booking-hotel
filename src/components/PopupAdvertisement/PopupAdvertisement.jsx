import React, { useState, useEffect } from 'react'
import { Modal, Row, Col, Typography, Button, Image } from 'antd'
import { CloseOutlined, GiftOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import khuyenmai from "../../assets/images/khuyenmai1.jpg"
import './PopupAdvertisement.css'

const { Title, Paragraph } = Typography

function PopupAdvertisement() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  // Kiểm tra xem có đang ở trang admin không
  const isAdminPage = location.pathname.startsWith('/admin')

  useEffect(() => {
    // Chỉ hiển thị popup nếu không phải trang admin VÀ chỉ khi người dùng refresh trình duyệt
    if (!isAdminPage) {
      let isReload = false
      const navEntries = performance && performance.getEntriesByType ? performance.getEntriesByType('navigation') : []
      if (navEntries && navEntries.length > 0) {
        isReload = navEntries[0].type === 'reload'
      } else if (window.performance && window.performance.navigation) {
        // Fallback (deprecated API)
        isReload = window.performance.navigation.type === 1
      }

      if (isReload) {
        const timer = setTimeout(() => {
          setVisible(true)
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [isAdminPage])

  const handleClose = () => {
    setVisible(false)
  }


  const handleOverlayClick = (e) => {
    // Ngăn đóng popup khi click vào overlay
    e.stopPropagation()
  }

  // Không render popup nếu đang ở trang admin
  if (isAdminPage) {
    return null
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
      style={{ top: '5vh' }}
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
                src={khuyenmai}
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
                  Khuyến mãi đặt online giảm 10%
                </Title>
                <Paragraph className="popup-subtitle">
                  Đặt phòng trực tuyến ngay hôm nay!
                </Paragraph>
              </div>

              <div className="popup-promo">
                <div className="promo-code-container">
                  <Title level={3} className="promo-code-title">
                    Nhập mã ưu đãi:
                  </Title>
                  <div className="promo-code-box">
                    <span className="promo-code">ONLINE10</span>
                  </div>
                  <Paragraph className="promo-description">
                    Áp dụng cho tất cả đặt phòng online
                  </Paragraph>
                </div>
              </div>

              <div className="popup-benefits">
                <ul className="benefits-list">
                  <li>Giảm giá 10% khi đặt phòng online</li>
                  <li>Thanh toán nhanh chóng và an toàn</li>
                  <li>Xác nhận đặt phòng ngay lập tức</li>
                </ul>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  )
}

export default PopupAdvertisement
