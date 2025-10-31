import React from 'react'
import { Card, Row, Col, Image, Typography, Space } from 'antd'
import './gallery.css'

// Import một số ảnh có sẵn trong assets
import banner1 from '../../assets/images/banner1.jpg'
import banner2 from '../../assets/images/banner2.jpg'
import banner3 from '../../assets/images/banner3.jpg'
import banner4 from '../../assets/images/banner4.jpg'
import mainBanner from '../../assets/images/main-banner.png'
import luxyryRoom from '../../assets/images/luxyryRoom.jpg'
import about1 from '../../assets/images/about1.webp'
import logo from '../../assets/images/logo.webp'

const { Title, Text } = Typography

const images = [
  { src: mainBanner, title: 'Sảnh chính' },
  { src: banner1, title: 'Không gian khách sạn' },
  { src: banner2, title: 'Lối vào' },
  { src: banner3, title: 'Khu vực thư giãn' },
  { src: banner4, title: 'Quầy lễ tân' },
  { src: luxyryRoom, title: 'Phòng hạng sang' },
  
]

function GalleryPage() {
  return (
    <div className="gallery-page">
      <div className="container">
        <div className="gallery-header">
          <Title level={2} className="gallery-title">Bộ sưu tập hình ảnh</Title>
          <Text type="secondary">Khám phá không gian và tiện nghi tại khách sạn của chúng tôi</Text>
        </div>

        <Card className="gallery-card" bodyStyle={{ padding: 16 }}>
          <Image.PreviewGroup>
            <Row gutter={[16, 16]}>
              {images.map((img, idx) => (
                <Col xs={12} sm={8} md={6} lg={6} key={idx}>
                  <div className="gallery-item">
                    <Image src={img.src} alt={img.title} className="gallery-image" />
                  
                  </div>
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </Card>
      </div>
    </div>
  )
}

export default GalleryPage


