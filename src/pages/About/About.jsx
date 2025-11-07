import React from 'react';
import "./About.css"; // Chúng ta sẽ cập nhật file CSS này rất nhiều
import { Breadcrumb, Row, Col, Card, Carousel, Button } from 'antd';
import { HomeOutlined, WifiOutlined, CoffeeOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

// Một component HOC (Higher-Order Component) nhỏ để bọc hiệu ứng cho gọn
// Nó sẽ làm cho component con "nảy" lên và mờ dần xuất hiện khi cuộn tới
const AnimatedSection = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }} // Trạng thái ban đầu: mờ, ở dưới 50px
      whileInView={{ opacity: 1, y: 0 }} // Trạng thái khi lọt vào tầm nhìn: rõ, ở vị trí 0
      viewport={{ once: false }} // 
      transition={{ duration: 1, ease: "easeInOut" }} // Thời gian và kiểu hiệu ứng
      className="animated-section"
    >
      {children}
    </motion.div>
  );
};

function About() {
  return (
    <div className='about-page'>
      <div className="container">
        {/* Phần Breadcrumb giữ nguyên */}
        <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item href="/">
            <HomeOutlined />
            <span>Trang chủ</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Về chúng tôi</Breadcrumb.Item>
        </Breadcrumb>
        
        {/* --- KHỐI HERO --- */}
        <AnimatedSection>
          <div className="about-hero">
            <h1>Về Bean Hotel</h1>
            <p className="subtitle">Là khách sạn 5 sao đẳng cấp quốc tế, tọa lạc tại giao điểm của bốn quận chính, nơi được xem như trái tim và trung tâm của TP. Hồ Chí Minh.</p>
          </div>
        </AnimatedSection>
        
        {/* --- KHỐI GIỚI THIỆU VÀ HÌNH ẢNH --- */}
        <AnimatedSection>
          <Row gutter={[32, 32]} className="about-intro-section">
            <Col xs={24} md={12}>
              <div className='about-image'>
                <img src="https://bizweb.dktcdn.net/100/423/358/files/alper-gio-thieu.jpg?v=1623225626615" alt="Bean Hotel" />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <h2>Chào mừng đến với Ngôi nhà của bạn</h2>
              <p>Với hệ thống phòng tiêu chuẩn và phòng hạng sang thiết kế đẹp mắt và trang nhã được chú trọng tới từng chi tiết sẽ đem lại sự tiện nghi và thoải mái tối đa cho quý khách dù là thời gian nghỉ ngơi thư giãn hay trong chuyến công tác. </p>
              <p>Bean Hotel tích hợp đầy đủ tất cả các dịch vụ cho Quý khách có một chuyến công tác hoặc kỳ nghỉ thật sự tiện ích...</p>
            </Col>
          </Row>
        </AnimatedSection>

        {/* --- KHỐI DỊCH VỤ NỔI BẬT --- */}
        <AnimatedSection>
          <div className="features-section">
            <h2>Dịch vụ đẳng cấp</h2>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} hoverable>
                  <WifiOutlined className="feature-icon" />
                  <h3>Wifi miễn phí</h3>
                  <p>Kết nối tốc độ cao mọi lúc mọi nơi trong khách sạn.</p>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} hoverable>
                  <CoffeeOutlined className="feature-icon" />
                  <h3>Nhà hàng & Bar</h3>
                  <p>Trải nghiệm ẩm thực Á-Âu tinh tế và đa dạng.</p>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} hoverable>
                  <CustomerServiceOutlined className="feature-icon" />
                  <h3>Dịch vụ phòng 24/7</h3>
                  <p>Luôn sẵn sàng phục vụ nhu cầu của quý khách.</p>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} hoverable>
                  {/* Bạn có thể thêm icon khác, ví dụ: <CarOutlined /> */}
                  <span className="feature-icon" style={{fontSize: '24px'}}>🏊</span>
                  <h3>Hồ bơi & Spa</h3>
                  <p>Thư giãn tuyệt đối với hồ bơi vô cực và dịch vụ spa.</p>
                </Card>
              </Col>
            </Row>
          </div>
        </AnimatedSection>
        
        {/* --- KHỐI SLIDE HÌNH ẢNH (GALLERY) --- */}
        <AnimatedSection>
          <div className="gallery-section">
            <h2>Khoảnh khắc tại Bean Hotel</h2>
            <Carousel autoplay>
              <div>
                <img src="https://kksapahotel.com/uploads/images/VQK_2153%20(1).jpg" alt="Sảnh khách sạn" />
              </div>
              <div>
                <img src="https://images.unsplash.com/photo-1542314831-068cd1db356d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" alt="Phòng ngủ" />
              </div>
              <div>
                <img src="https://images.unsplash.com/photo-1582719508428-2cd401214s9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" alt="Hồ bơi" />
              </div>
            </Carousel>
          </div>
        </AnimatedSection>

        {/* --- KHỐI CALL TO ACTION (CTA) --- */}
        <AnimatedSection>
          <div className="cta-section">
            <h2>Trải nghiệm sự khác biệt</h2>
            <p>Đội ngũ nhân viên chuyên nghiệp, chu đáo và thân thiện của Bean Hotel hứa hẹn sẽ mang đến cho Quý khách sự thoải mái và hài lòng nhất.</p>
            <Button type="primary" size="large" href="/hotels">Khám phá phòng ngay</Button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}

export default About;