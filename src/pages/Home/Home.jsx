import React from 'react'
import './Home.css'
import { Row, Col, Typography, Button, Grid } from 'antd'
const { useBreakpoint } = Grid

import { GlobalOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useRoomTypes } from "../../hooks/roomtype"
import banner1 from '../../assets/images/main-banner.png'
import aboutBanner from "../../assets/images/banner/banner1.jpg"
import luxuryRoom from "../../assets/images/luxyryRoom.jpg"
import dishes from "../../assets/images/dishes.jpg"
import spaImage from "../../assets/images/pin.jpg"
import RoomList from '../../components/RoomList/RoomList'
import HomeNews from '../../components/HomeNews'
import BookingWidget from '../../components/BookingWidget'
import WhyChooseUs from '../../components/WhyChooseUs'
import Testimonials from '../../components/Testimonials/Testimonials'
import Moments from '../../components/Moments/Moments'

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
        <div className="banner-image-container">
          <img src={banner1} alt="BEAN HOTEL" className="banner-image" />
          <div className="banner-overlay">
        
          </div>
        </div>
        
        {/* Booking Widget - Nổi trên banner */}
        <div className="booking-widget-container">
          <BookingWidget />
        </div>
      </div>

      <div className="home-page container">
        <div className="about">
          <div className="about-container">
            <Row
              gutter={screens.xs ? [16, 24] : [32, 32]}
              align="middle"
              className="about-row"
            >
              <Col 
                xs={24} 
                sm={24} 
                md={12} 
                lg={12} 
                xl={12}
                order={screens.xs || screens.sm ? 1 : undefined}
              >
                <div className="about-content">
                  <Typography.Title
                    level={1}
                    className="about-main-title"
                  >
                    TẬN HƯỞNG KÌ NGHỈ DƯỠNG
                  </Typography.Title>
                  <Typography.Title
                    level={4}
                    className="about-subtitle"
                  >
                    Thư Giãn & Sang Trọng
                  </Typography.Title>
                  <Typography.Paragraph className="about-description">
                    Chào mừng bạn đến với dịch vụ 5 sao sang trọng tại Bean Hotel. 
                    Thiết kế hiện đại kết hợp cùng phong cách cổ điển sẽ mang lại trải nghiệm 
                    tuyệt vời cho những ai có niềm đam mê du lịch. Tạo ra một phong cách sống 
                    hoàn toàn mới với dịch vụ của chúng tôi: từ phòng nghỉ tiện nghi đến bữa 
                    tiệc thịnh soạn. Dịch vụ ẩm thực phong phú với các nhà hàng và quán bar; 
                    phòng gym; và hồ bơi vô cực trên cao lớn nhất thành phố cùng tầm nhìn tuyệt đẹp. 
                    Một kì nghỉ dưỡng thư thái đang chờ đón bạn!
                  </Typography.Paragraph>
                </div>
              </Col>
              <Col 
                xs={24} 
                sm={24} 
                md={12} 
                lg={12} 
                xl={12}
                order={screens.xs || screens.sm ? 2 : undefined}
              >
                <div className="about-banner-container">
                  <div className="about-banner-images">
                    <div className="about-banner-item">
                      <img
                        src={aboutBanner}
                        alt="Luxury Experience 1"
                        className="about-banner-image"
                      />
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
        {/* Luxury Section */}
        <div className="luxury-section">
          <div className="luxury-container">
            {/* Header */}
            <div className="luxury-header">
              <Typography.Text className="luxury-subtitle">
                KHÁM PHÁ
              </Typography.Text>
              <Typography.Title className="luxury-title">
                Điểm Đến Của Không Gian Sang Trọng
              </Typography.Title>
            </div>

            {/* Content */}
            <Row 
              gutter={screens.xs ? [16, 24] : screens.md ? [24, 32] : [32, 48]}
              className="luxury-content-row"
            >
              <Col 
                xs={24} 
                sm={24} 
                md={12} 
                lg={12} 
                xl={12}
                order={screens.xs || screens.sm ? 2 : 1}
              >
                  <div className="luxury-image-container">
                  <img 
                    src={luxuryRoom} 
                    alt="Luxury Room" 
                    className="luxury-image"
                  />
                </div>
              </Col>
              <Col 
                xs={24} 
                sm={24} 
                md={12} 
                lg={12} 
                xl={12}
                order={screens.xs || screens.sm ? 1 : 2}
              >
           

                <div className="luxury-text-card">
                  <Typography.Title level={2} className="luxury-card-title">
                    Một Kỳ Nghỉ Thú Vị
                  </Typography.Title>
                  <Typography.Paragraph className="luxury-card-description">
                    Bean Hotel - khách sạn với thiết kế mang tính biểu tượng cùng 70 phòng bao gồm 
                    phòng tiêu chuẩn, phòng suite, phòng tổng thống. Màu sắc nhẹ nhàng, nội thất sang trọng 
                    trong mỗi phòng tạo nên một không gian thư giãn tuyệt vời cho du khách sau một ngày khám phá 
                    thành phố cùng nhịp sống sôi động nơi đây.
                  </Typography.Paragraph>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Culinary Section */}
        <div className="culinary-section">
          <div className="culinary-container">
            <Row 
              gutter={screens.xs ? [16, 24] : screens.md ? [24, 32] : [32, 48]}
              className="culinary-content-row"
              align="middle"
            >
              <Col 
                xs={24} 
                sm={24} 
                md={12} 
                lg={12} 
                xl={12}
                order={1}
              >
                <div className="culinary-image-container">
                  <img 
                    src={dishes} 
                    alt="Exquisite Cuisine" 
                    className="culinary-image"
                  />
                </div>
              </Col>
              <Col 
                xs={24} 
                sm={24} 
                md={12} 
                lg={12} 
                xl={12}
                order={2}
              >
                <div className="culinary-text-card">
                  <Typography.Title level={2} className="culinary-card-title">
                    Những Hương Vị Tinh Tế
                  </Typography.Title>
                  <Typography.Paragraph className="culinary-card-description">
                    Sự sáng tạo trong hành trình ẩm thực với thực đơn phong phú từ khắp mọi nơi trên 
                    thế giới cùng nét chấm phá đặc biệt với hương vị truyền thống. Dù là bữa tiệc 
                    như thế nào đi nữa, các đầu bếp tài năng của chúng tôi sẽ mang đến cho quý khách 
                    những món ăn hào hạng nhất.
                  </Typography.Paragraph>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Spa Section */}
        <div className="spa-section">
          <div className="spa-container">
            <Row 
              gutter={screens.xs ? [16, 24] : screens.md ? [24, 32] : [32, 48]}
              className="spa-content-row"
              align="middle"
            >
              <Col 
                xs={24} 
                sm={24} 
                md={12} 
                lg={12} 
                xl={12}
                order={1}
              >
                <div className="spa-text-card">
                  <Typography.Title level={2} className="spa-card-title">
                    Thư Giãn Cơ Thể Và Tâm Hồn
                  </Typography.Title>
                  <Typography.Paragraph className="spa-card-description">
                    Không gì tuyệt vời hơn khi để tâm trí và cơ thể của bạn thư giãn tuyệt đối sau một ngày 
                    dài hoạt động năng suất. Hãy ngồi lại, cảm nhận và nuôi dưỡng năng lượng tích cực từ bên 
                    trong cùng những hoạt động nâng cao thể chất và tinh thần với các thiết bị hiện đại, 
                    phương pháp chăm sóc sức khỏe.
                  </Typography.Paragraph>
                </div>
              </Col>
              <Col 
                xs={24} 
                sm={24} 
                md={12} 
                lg={12} 
                xl={12}
                order={2}
              >
                <div className="spa-image-container">
                  <img 
                    src={spaImage} 
                    alt="Spa & Relaxation" 
                    className="spa-image"
                  />
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* <div className='features'>
          <RoomList />
        </div> */}
       {/* Section khoảng khắc thú vị với chúng tôi */}
        {/* Tại sao chọn chúng tôi */}
        {/* <HomeNews /> */}
      </div>

      <div className='container'>

        <WhyChooseUs />
      </div>


      {/* <div className='container'>
        <Testimonials />
      </div> */}

      <div className='container'>
      <Moments />
      </div>
    </>

  )
}

export default Home