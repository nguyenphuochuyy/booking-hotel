import React from 'react'
import './Home.css'

function Home() {
  return (
    <div className="home-page">
      <h1>Chào mừng đến với Hotel Booking</h1>
      <p>Khám phá các khách sạn tuyệt vời và đặt phòng dễ dàng</p>
      <div className="features">
        <div className="feature">
          <h3>🎯 Đặt phòng nhanh chóng</h3>
          <p>Chỉ vài cú nhấp chuột để đặt phòng khách sạn</p>
        </div>
        <div className="feature">
          <h3>💰 Giá tốt nhất</h3>
          <p>Đảm bảo giá tốt nhất cho mọi khách sạn</p>
        </div>
        <div className="feature">
          <h3>⭐ Đánh giá thực tế</h3>
          <p>Đánh giá từ khách hàng thực tế</p>
        </div>
      </div>
    </div>
  )
}

export default Home

