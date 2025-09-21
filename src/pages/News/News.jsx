import React from 'react'
import './News.css'

function News() {
  return (
    <div className="news-page">
      <h1>Tin tức</h1>
      <div className="news-list">
        <article className="news-card">
          <h3>Khai trương cơ sở mới</h3>
          <p>Khách sạn vừa khai trương thêm cơ sở mới với nhiều ưu đãi hấp dẫn.</p>
          <button className="read-btn">Đọc thêm</button>
        </article>
        <article className="news-card">
          <h3>Ưu đãi mùa lễ</h3>
          <p>Giảm giá đến 30% cho các phòng nghỉ trong mùa lễ hội.</p>
          <button className="read-btn">Đọc thêm</button>
        </article>
      </div>
    </div>
  )
}

export default News

