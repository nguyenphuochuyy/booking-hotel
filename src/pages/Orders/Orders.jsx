import React from 'react'
import './Orders.css'

function Orders() {
  return (
    <div className="orders-page">
      <h1>Đơn đặt phòng</h1>
      <p className="subtitle">Quản lý các đặt phòng của bạn</p>
      <div className="orders-list">
        <div className="order-card">
          <div>
            <h3>Đơn #HB-0001</h3>
            <p>Phòng Deluxe • 2 đêm • 12/08 - 14/08</p>
          </div>
          <div className="order-status paid">Đã thanh toán</div>
        </div>
      </div>
    </div>
  )
}

export default Orders

