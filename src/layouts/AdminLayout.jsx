import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Layout, 
  Menu, 
  Avatar, 
  Dropdown, 
  Typography, 
  Button,
  Grid
} from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  HomeOutlined,
  ShopOutlined,
  AppstoreOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
  CalendarOutlined,
  TagOutlined,
  StarOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined
} from '@ant-design/icons'

const { Sider, Header, Content } = Layout
const { Text } = Typography
const { useBreakpoint } = Grid

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const screens = useBreakpoint()
  const [collapsed, setCollapsed] = useState(false)

  // Menu items
  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Quản lý người dùng',
    },
    {
      key: '/admin/hotels',
      icon: <HomeOutlined />,
      label: 'Quản lý khách sạn',
    },
    {
      key: '/admin/bookings',
      icon: <CalendarOutlined />,
      label: 'Quản lý đặt phòng',
    },
    {
      key: '/admin/room-types',
      icon: <AppstoreOutlined />,
      label: 'Quản lý loại phòng',
    },
    {
      key: '/admin/rooms',
      icon: <ShopOutlined />,
      label: 'Quản lý phòng',
    },
    {
      key: '/admin/room-prices',
      icon: <DollarOutlined />,
      label: 'Quản lý giá phòng',
    },
   
    {
      key: '/admin/promotions',
      icon: <TagOutlined />,
      label: 'Quản lý khuyến mãi',
    },
    {
      key: '/admin/reviews',
      icon: <StarOutlined />,
      label: 'Quản lý đánh giá',
    },
    {
      key: '/admin/posts',
      icon: <FileTextOutlined />,
      label: 'Quản lý bài viết',
    },
    {
      key: '/admin/services',
      icon: <SettingOutlined />,
      label: 'Quản lý dịch vụ',
    },
  ]

  // User dropdown menu
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/admin/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => navigate('/admin/settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'back-to-home',
      icon: <HomeOutlined />,
      label: 'Về trang chủ',
      onClick: () => navigate('/')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => {
        logout()
        navigate('/login')
      }
    }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        theme="dark"
        width={280}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0 16px'
          }}
        >
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <HomeOutlined style={{ fontSize: 24, color: '#c08a19' }} />
              <Text strong style={{ color: '#fff', fontSize: 18 }}>
                Bean Hotel Admin
              </Text>
            </div>
          ) : (
            <HomeOutlined style={{ fontSize: 24, color: '#c08a19' }} />
          )}
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, marginTop: 16 , fontSize : '16px' }}
        />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: 'all 0.2s' }}>
        {/* Header */}
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fff',
            padding: '0 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
              }}
            />
            <Text strong style={{ fontSize: 16 }}>
              Bảng điều khiển quản trị
            </Text>
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <Avatar
                size="large"
                style={{ backgroundColor: '#c08a19' }}
                icon={<UserOutlined />}
              />
              {!screens.xs && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text strong>{user?.full_name || 'Admin'}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                  </Text>
                </div>
              )}
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content
          style={{
            // margin: '24px',
            // padding: 24,
            minHeight: 'calc(100vh - 112px)',
            background: '#f0f2f5',
          }}
        >
          <div
            style={{
              background: '#fff',
              // padding: 24,
              borderRadius: 8,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              minHeight: 'calc(100vh - 160px)',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout


