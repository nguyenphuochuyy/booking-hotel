import React from 'react'
import './About.css'

function About() {
  return (
    <div className="about-page">
      <h1>Về chúng tôi</h1>
      <div className="about-content">
        <div className="about-section">
          <h2>🏢 Công ty Hotel Booking</h2>
          <p>
            Chúng tôi là nền tảng đặt phòng khách sạn hàng đầu Việt Nam, 
            cung cấp dịch vụ đặt phòng trực tuyến với hơn 1000+ khách sạn 
            trên toàn quốc.
          </p>
        </div>
        
        <div className="about-section">
          <h2>🎯 Sứ mệnh</h2>
          <p>
            Mang đến trải nghiệm đặt phòng khách sạn đơn giản, nhanh chóng 
            và tiết kiệm chi phí cho mọi du khách.
          </p>
        </div>
        
        <div className="about-section">
          <h2>📞 Liên hệ</h2>
          <p>Email: info@hotelbooking.vn</p>
          <p>Điện thoại: 1900-xxxx</p>
          <p>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
        </div>
      </div>
    </div>
  )
}

export default About

