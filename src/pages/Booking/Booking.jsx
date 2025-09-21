import React from 'react'
import './Booking.css'

function Booking() {
  return (
    <div className="booking-page" id="booking-form">
      <h1>Đặt phòng</h1>
      <p className="subtitle">Tìm kiếm phòng trống và đặt phòng nhanh chóng</p>

      <div className="booking-search card">
        <div className="form-group">
          <label className="form-label">Ngày nhận phòng</label>
          <input type="date" className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Ngày trả phòng</label>
          <input type="date" className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Số lượng khách</label>
          <select className="form-input">
            <option>1 khách</option>
            <option>2 khách</option>
            <option>3 khách</option>
            <option>4+ khách</option>
          </select>
        </div>
        <button className="search-btn">Tìm phòng</button>
      </div>

      <div className="room-list">
        <div className="room-card">
          <div className="room-image">🛏️</div>
          <div className="room-info">
            <h3>Phòng Deluxe</h3>
            <p>Giường đôi • 30m² • View thành phố</p>
            <div className="room-footer">
              <span className="price">1,200,000 VNĐ/đêm</span>
              <button className="book-btn">Đặt ngay</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking

