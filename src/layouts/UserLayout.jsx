import React, { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { FloatButton, notification, Button } from "antd";
import ChatBot from '../components/ChatBot/ChatBot'
import { ArrowUpOutlined } from '@ant-design/icons';
function UserLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pendingPayment')
      if (!raw) return
      if (location.pathname === '/payment') return
      const data = JSON.parse(raw)
      const key = 'pendingPaymentNotice'
      notification.open({
        message: 'Bạn có đơn hàng chưa thanh toán',
        description: 'Tiếp tục thanh toán để hoàn tất đặt phòng.',
        placement: 'bottomLeft',
        key,
        btn: (
          <Button type="primary" size="small" onClick={() => {
            navigate('/payment')
            notification.close(key)

          }}>
            Đi đến
          </Button>
        )
      })
    } catch {}
  }, [location.pathname, navigate])
  return (
    <div className="App">
      <Navigation/>
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <FloatButton.BackTop icon={<ArrowUpOutlined />} />
      <ChatBot />
    </div>
  )
}

export default UserLayout


