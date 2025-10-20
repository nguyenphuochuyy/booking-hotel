import React from 'react'
import './Home.css'
import banner1 from '../../assets/images/banner1.jpg'
import banner2 from '../../assets/images/banner2.jpg'
import banner3 from '../../assets/images/banner3.jpg'
import { Row, Col, Typography, Button, Grid, Carousel } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import aboutBanner from '../../assets/images/about1.webp'
import RoomList from '../../components/RoomList/RoomList'
import HomeNews from '../../components/HomeNews'
import { useNavigate } from 'react-router-dom'
const { useBreakpoint } = Grid
import {useRoomTypes} from "../../hooks/roomtype"
function Home() {
  const screens = useBreakpoint()
  const navigate = useNavigate()
  const {
    roomTypes, pagination, loading, error,
    search, setSearch, category, setCategory,
    page, setPage, limit, setLimit,
    refresh, nextPage, prevPage,
  } = useRoomTypes();
  
  return (
    <>
      <div className="banner-slider">
        <Carousel
          autoplay
          effect="scrollx"
          autoplaySpeed={4000}
          dots={true}
          infinite={true}
          className="banner-carousel"
          arrows={false}
          draggable={true}
        >
          <div className="banner-slide">
            <img src={banner1} alt="Banner 1" loading="eager" />
          </div>
          <div className="banner-slide">
            <img src={banner2} alt="Banner 2" loading="lazy" />
          </div>
          <div className="banner-slide">
            <img src={banner3} alt="Banner 3" loading="lazy" />
          </div>
        </Carousel>

      </div>
      <div className="home-page container">
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
    </>

  )
}

export default Home