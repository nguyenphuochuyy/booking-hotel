import React from 'react'
import './Hotels.css'

function Hotels() {
  return (
    <div className="hotels-page">
      <h1>Danh sách khách sạn</h1>
      <div className="search-section">
        <input 
          type="text" 
          placeholder="Tìm kiếm khách sạn..." 
          className="search-input"
        />
        <button className="search-btn">Tìm kiếm</button>
      </div>
      
      <div className="hotels-grid">
        <div className="hotel-card">
          <div className="hotel-image">🏨</div>
          <h3>Grand Hotel</h3>
          <p>5 sao • Trung tâm thành phố</p>
          <p className="price">Từ 2,000,000 VNĐ</p>
          <button className="book-btn">Đặt phòng</button>
        </div>
        
        <div className="hotel-card">
          <div className="hotel-image">🏖️</div>
          <h3>Beach Resort</h3>
          <p>4 sao • Gần biển</p>
          <p className="price">Từ 1,500,000 VNĐ</p>
          <button className="book-btn">Đặt phòng</button>
        </div>
        
        <div className="hotel-card">
          <div className="hotel-image">🌃</div>
          <h3>City View Hotel</h3>
          <p>3 sao • View thành phố</p>
          <p className="price">Từ 800,000 VNĐ</p>
          <button className="book-btn">Đặt phòng</button>
        </div>
      </div>
    </div>
  )
}

export default Hotels

