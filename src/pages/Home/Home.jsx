import React from 'react'
import './Home.css'
import banner from '../../assets/images/banner.webp'
import { Row, Col, Typography, Button, Grid } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import aboutBanner from '../../assets/images/about1.webp'
import RoomList from '../../components/RoomList/RoomList'
import HomeNews from '../../components/HomeNews'
import { useNavigate } from 'react-router-dom'
const { useBreakpoint } = Grid

function Home() {
  const screens = useBreakpoint()
  const navigate = useNavigate()
  return (
    <div className="home-page container">
      
      <div className="banner">
        <img src={banner} alt="Banner" />
      </div>
      <div className="about">
        <div className="about-container">
          <Row 
            gutter={screens.xs ? [16, 24] : screens.md ? [24, 32] : [32, 32]} 
            align="middle"
          >
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
              <div className="about-content">
                <div className="about-header">
                  <Typography.Title
                    level={3}
                    className="about-brand-title"
                  >
                    Bean Hotel
                  </Typography.Title>
                  <Typography.Title
                    level={2}
                    className="about-main-title"
                  >
                    Giới thiệu về chúng tôi
                  </Typography.Title>
                </div>

                <Typography.Paragraph className="about-description">
                  Là khách sạn 5 sao đẳng cấp quốc tế, tọa lạc tại giao điểm của
                  bốn quận chính, nơi được xem như trái tim và trung tâm của TP.
                  Hồ Chí Minh. Với hệ thống phòng tiêu chuẩn và phòng hạng sang
                  thiết kế đẹp mắt và trang nhã được chú trọng tới từng chi tiết
                  sẽ đem lại sự tiện nghi và thoải mái tối đa cho quý khách dù là
                  thời gian nghỉ ngơi thư giãn hay trong chuyến công tác...
                </Typography.Paragraph>
                
                <div className="about-button-wrapper">
                  <Button
                    onClick={() => navigate('/about')}
                    type="primary"
                    size={screens.xs ? "middle" : "large"}
                    className="about-cta-button"
                  >
                    Xem thêm
                  </Button>
                </div>
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