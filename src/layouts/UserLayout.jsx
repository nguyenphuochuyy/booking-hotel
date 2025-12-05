import React, { useEffect, Suspense } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { FloatButton, notification, Button, Spin } from "antd";
import ChatBot from '../components/ChatBot/ChatBot'
import { ArrowUpOutlined, LoadingOutlined } from '@ant-design/icons';

function UserLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  // Nếu còn đăng nhập và là admin, chuyển hướng sang trang admin khi mở website
  useEffect(() => {
    try {
      const token = localStorage.getItem('accessToken')
      const rawUser = localStorage.getItem('user')
      const user = rawUser ? JSON.parse(rawUser) : null
      const isAdmin = user?.role === 'admin'
      if (token && isAdmin && !location.pathname.startsWith('/admin')) {
        navigate('/admin', { replace: true })
      }
    } catch {}
  }, [location.pathname, navigate])
  
  const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#c08a19' }} spin />
  
  return (
    <div className="App">
      <Navigation/>
      <main className="main-content">
        <Suspense fallback={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            flexDirection: 'column',
            gap: 24
          }}>
            <Spin indicator={antIcon} size="large" />
            <div style={{ color: '#666', fontSize: 16, fontWeight: 500 }}>
              Đang tải...
            </div>
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <FloatButton.BackTop icon={<ArrowUpOutlined />} />
      <ChatBot />
    </div>
  )
}

export default UserLayout


