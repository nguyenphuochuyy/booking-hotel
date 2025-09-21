import React from 'react'
import { Link } from 'react-router-dom'
import './NotFound.css'

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="error-content">
        <h1>404</h1>
        <h2>Trang không tồn tại</h2>
        <p>Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <Link to="/" className="back-home-btn">
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}

export default NotFound

