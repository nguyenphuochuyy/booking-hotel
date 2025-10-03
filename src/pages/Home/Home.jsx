import React from 'react'
import './Home.css'
import banner from '../../assets/images/banner.webp'
import { Row, Col, Typography, Button } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import aboutBanner from '../../assets/images/about1.webp'
import RoomList from '../../components/RoomList/RoomList'
import HomeNews from '../../components/HomeNews'

function Home() {
  return (
    <div className="home-page">
      <div className="banner">
        <img src={banner} alt="Banner" />
      </div>
      <div className="about">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 16px' }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12} xl={12}>
              <div className="about-banner">
                <img
                  src={aboutBanner}
                  alt="About Banner"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </Col>
            <Col xs={24} md={12} xl={12}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    border: '4px solid #e9e9e9',
                    padding: '16px 20px',
                    display: 'inline-block',
                    marginBottom: 16,
                  }}
                >
                  <Typography.Title
                    level={3}
                    style={{
                      margin: 0,
                      color: '#1f2937',
                      fontWeight: 600,
                      fontSize: '20px',
                    }}
                  >
                    Bean Hotel
                  </Typography.Title>
                  <Typography.Title
                    level={2}
                    style={{
                      margin: '6px 0 0 0',
                      color: '#1f2937',
                      fontWeight: 700,
                      fontSize: '28px',
                    }}
                  >
                    Giới thiệu về chúng tôi
                  </Typography.Title>
                </div>



                <Typography.Paragraph
                  style={{
                    color: '#4b5563',
                    marginBottom: 24,
                    maxWidth: 640,
                    lineHeight: 1.7,
                    fontSize: 14,
                  }}
                >
                  Là khách sạn 5 sao đẳng cấp quốc tế, tọa lạc tại giao điểm của
                  bốn quận chính, nơi được xem như trái tim và trung tâm của TP.
                  Hồ Chí Minh. Với hệ thống phòng tiêu chuẩn và phòng hạng sang
                  thiết kế đẹp mắt và trang nhã được chú trọng tới từng chi tiết
                  sẽ đem lại sự tiện nghi và thoải mái tối đa cho quý khách dù là
                  thời gian nghỉ ngơi thư giãn hay trong chuyến công tác...
                </Typography.Paragraph>
                <Button
                  type="primary"
                  size="large"
                  style={{
                    background: '#c08a19',
                    borderColor: '#c08a19',
                    padding: '0 28px',
                    height: 44,
                    fontWeight: 600,
                  }}
                >
                  Xem thêm
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
      <div className='features'>
        <RoomList />
      </div>
      <HomeNews />
    </div>
  )
}

export default Home