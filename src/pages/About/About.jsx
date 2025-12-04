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
      transition={{ duration: 1, ease: "backInOut" }} // Thời gian và kiểu hiệu ứng
      className="animated-section"
    >
      {children}
    </motion.div>
  );
};

function About() {
  return (
    <div className='about-page container'>
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
          <h1>VỀ CHÚNG TÔI</h1>
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <div className="story-mission-section">
          <Row gutter={[48, 32]} align="middle">
            {/* Cột Ảnh */}
            <Col xs={24} md={12} className="story-img-col">
              <div className="story-img-wrapper">
                <img src="https://images.pexels.com/photos/14024792/pexels-photo-14024792.jpeg?_gl=1*1qf4o9w*_ga*MjEzNjEzNjIxNC4xNzYyNDM0NDAy*_ga_8JE65Q40S6*czE3NjI1MDU4NTEkbzIkZzEkdDE3NjI1MDY2OTIkajU5JGwwJGgw" alt="Bean Hotel Intro" />
              </div>
            </Col>
            {/* Cột Nội dung */}
            <Col xs={24} md={12}>
              <div className="story-content">
                <span className="section-subtitle">Tiện nghi & Đẳng cấp</span>
                <h2>Chào mừng đến với Ngôi nhà của bạn</h2>
                <p>
                  Với hệ thống phòng tiêu chuẩn và phòng hạng sang thiết kế đẹp mắt và trang nhã,
                  chúng tôi chú trọng tới từng chi tiết nhỏ nhất để đem lại sự tiện nghi và thoải mái tối đa cho quý khách.
                  Dù là thời gian nghỉ ngơi thư giãn hay trong chuyến công tác, Bean Hotel luôn là điểm dừng chân lý tưởng.
                </p>
                <p>
                  Bean Hotel tích hợp đầy đủ tất cả các dịch vụ tiện ích, từ ẩm thực, giải trí đến không gian làm việc,
                  giúp Quý khách có một trải nghiệm trọn vẹn mà không cần đi đâu xa.
                </p>
                {/* Thêm một box điểm nhấn nhỏ nếu muốn giống phần dưới */}
                <div className="mission-box" style={{ marginTop: '24px' }}>
                  <h3>Trải nghiệm hoàn hảo</h3>
                  <p style={{ marginBottom: '12px' }}>
                    Tại Bean Hotel, chúng tôi tin rằng sự hoàn hảo đến từ những chi tiết nhỏ nhất.
                    Không chỉ là một nơi để ngủ, đây là không gian để bạn tái tạo năng lượng và tận hưởng cuộc sống
                    thông qua những đặc quyền riêng biệt:
                  </p>
                  <ul style={{ paddingLeft: '20px', margin: 0, color: '#555', lineHeight: '1.8' }}>
                    <li><strong>Không gian tinh tế:</strong> Sự giao thoa giữa kiến trúc hiện đại và hơi thở thiên nhiên xanh mát.</li>
                    <li><strong>Dịch vụ cá nhân hóa:</strong> Đội ngũ nhân viên thấu hiểu và sẵn sàng đáp ứng mọi nhu cầu riêng biệt 24/7.</li>
                    <li><strong>Giấc ngủ chuẩn 5 sao:</strong> Hệ thống giường nệm cao cấp cùng liệu pháp hương thơm giúp bạn ngủ sâu và ngon hơn.</li>
                  </ul>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </AnimatedSection>

      {/* --- KHỐI CÂU CHUYỆN & SỨ MỆNH --- */}
      <AnimatedSection>
        <div className="story-mission-section">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <div className="story-content">
                <span className="section-subtitle">Chào mừng đến với Bean Hotel</span>
                <h2>Hành trình kiến tạo trải nghiệm nghỉ dưỡng tinh tế</h2>
                <p>
                  Bean Hotel được thành lập vào năm 2024 bởi đội ngũ những người trẻ đam mê du lịch
                  và nghệ thuật hiếu khách. Chúng tôi bắt đầu từ một homestay nhỏ, nuôi dưỡng khát
                  vọng đem đến cho du khách một nơi chốn thân thuộc, nơi từng chi tiết đều được chăm chút
                  tỉ mỉ như đang ở chính ngôi nhà của mình.
                </p>
                <p>
                  Lấy cảm hứng từ tinh thần cởi mở, chân thành của văn hóa Á Đông, Bean Hotel phát triển
                  nên phong cách phục vụ ấm áp, tinh tế nhưng vẫn phóng khoáng. Mỗi không gian trong khách
                  sạn đều được thiết kế để kết nối con người với thiên nhiên, với những giá trị bền vững và
                  trải nghiệm cá nhân hóa.
                </p>
                <div className="mission-box">
                  <h3>Sứ mệnh của chúng tôi</h3>
                  <p>
                    Tạo nên một không gian nghỉ dưỡng tinh tế, nơi dịch vụ tận tâm và sự thoải mái vượt trên
                    cả mong đợi. Chúng tôi cam kết mang lại trải nghiệm đáng nhớ, nuôi dưỡng cảm hứng và nguồn
                    năng lượng tích cực cho mỗi chuyến đi của quý khách.
                  </p>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} className="story-img-col">
              <div className="story-img-wrapper">
                <img src="https://images.pexels.com/photos/2565222/pexels-photo-2565222.jpeg?_gl=1*1ey5rmr*_ga*MjEzNjEzNjIxNC4xNzYyNDM0NDAy*_ga_8JE65Q40S6*czE3NjI1MDU4NTEkbzIkZzEkdDE3NjI1MDY5MDMkajMxJGwwJGgw" alt="Bean Hotel" />
              </div>
            </Col>
          </Row>
        </div>
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
                <span className="feature-icon" style={{ fontSize: '24px' }}>🏊</span>
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
          <Carousel
            autoplay
            draggable
            slidesToShow={4}
            slidesToScroll={1}
            responsive={[
              { breakpoint: 1200, settings: { slidesToShow: 3 } },
              { breakpoint: 992, settings: { slidesToShow: 2 } },
              { breakpoint: 576, settings: { slidesToShow: 1 } },
            ]}
          >
            <div className="gallery-item">
              <img src="https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?_gl=1*1eh6xqo*_ga*MjEzNjEzNjIxNC4xNzYyNDM0NDAy*_ga_8JE65Q40S6*czE3NjI1MDU4NTEkbzIkZzEkdDE3NjI1MDc1NTkkajU0JGwwJGgw" alt="Sảnh khách sạn" />
            </div>
            <div className="gallery-item">
              <img src="https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg?_gl=1*lnhbds*_ga*MjEzNjEzNjIxNC4xNzYyNDM0NDAy*_ga_8JE65Q40S6*czE3NjI1MDU4NTEkbzIkZzEkdDE3NjI1MDg0MDEkajU2JGwwJGgw" alt="Phòng ngủ" />
            </div>
            <div className="gallery-item">
              <img src="https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?_gl=1*8teq6v*_ga*MjEzNjEzNjIxNC4xNzYyNDM0NDAy*_ga_8JE65Q40S6*czE3NjI1MDU4NTEkbzIkZzEkdDE3NjI1MDg0MjEkajM2JGwwJGgw" alt="Hồ bơi" />
            </div>
            <div className="gallery-item">
              <img src="https://images.pexels.com/photos/2869215/pexels-photo-2869215.jpeg?_gl=1*q0g9qi*_ga*MjEzNjEzNjIxNC4xNzYyNDM0NDAy*_ga_8JE65Q40S6*czE3NjI1MDU4NTEkbzIkZzEkdDE3NjI1MDg0NDMkajE0JGwwJGgw" alt="Sảnh lounge" />
            </div>
            <div className="gallery-item">
              <img src="https://images.pexels.com/photos/460537/pexels-photo-460537.jpeg?_gl=1*1y6p9mw*_ga*MjEzNjEzNjIxNC4xNzYyNDM0NDAy*_ga_8JE65Q40S6*czE3NjI1MDU4NTEkbzIkZzEkdDE3NjI1MDg0NjgkajU5JGwwJGgw" alt="Nhà hàng" />
            </div>
            <div className="gallery-item">
              <img src="https://images.pexels.com/photos/2507010/pexels-photo-2507010.jpeg?_gl=1*1glvtnv*_ga*MjEzNjEzNjIxNC4xNzYyNDM0NDAy*_ga_8JE65Q40S6*czE3NjI1MDU4NTEkbzIkZzEkdDE3NjI1MDgyOTAkajU0JGwwJGgw" alt="Cảnh quan" />
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
  );
}

export default About;