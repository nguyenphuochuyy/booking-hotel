import React, { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Button, Grid, Drawer, Space, Typography, Avatar, Badge, Dropdown, Divider } from 'antd'
import './Navigation.css'
import { MenuOutlined, LoginOutlined, UserAddOutlined, BellOutlined, UserOutlined, HomeOutlined, BookOutlined, InfoCircleOutlined, ReadOutlined, ShoppingCartOutlined, SearchOutlined, LogoutOutlined, CalendarOutlined, AppstoreOutlined } from '@ant-design/icons'
import logo from '../../assets/images/logo.webp'
const { Header } = Layout
const { useBreakpoint } = Grid
const { Text } = Typography

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isAuthenticated] = useState(true)
  const screens = useBreakpoint()

  const menuItems = useMemo(() => ([
    { key: '/', label: 'Trang chủ' },
    { key: '/about', label: 'Về chúng tôi' },
    {
      key: '/hotels',
      label: 'Phòng',
      children: [
        { key: '/hotels', label: 'Danh sách phòng' },
        { key: '/booking', label: 'Giá & khuyến mãi' },
      ],
    },
    { key: '/about#services', label: 'Dịch vụ' },
    { key: '/news#gallery', label: 'Thư viện ảnh' },
    { key: '/about#contact', label: 'Liên hệ' },
  ]), [])

  // đóng menu khi click vào menu
  const onMenuClick = (e) => {
    navigate(e.key)
    setDrawerOpen(false)
  }

  const notificationBell = (
    <Badge count={3} overflowCount={99} size="small">
      <Button type="text" icon={<BellOutlined style={{  fontSize: 18 }} />} />
    </Badge>
  )

  
  // Phần notificationBell là biểu tượng chuông thông báo với số lượng thông báo (ở đây là 3).
  // Khi có nhiều thông báo hơn 99 thì sẽ hiển thị 99+.
  // Sử dụng Badge của Ant Design để hiển thị số lượng, và Button để hiển thị icon chuông.
  const userSection = (
    <Dropdown
      menu={{
        items: isAuthenticated
          ? [
              { key: 'profile', label: 'Hồ sơ' },
              { key: 'orders', label: 'Đơn đặt phòng', onClick: () => navigate('/orders') },
              { key: 'logout', label: 'Đăng xuất' },
            ]
          : [
              { key: 'login', label: 'Đăng nhập', onClick: () => navigate('/login') },
              { key: 'register', label: 'Đăng ký', onClick: () => navigate('/register') },
            ],
      }}
      placement="bottomRight"
    >
      {isAuthenticated ? (
        <Avatar style={{ backgroundColor: '#7265e6' }} icon={<UserOutlined />} />
      ) : (
        <Button type="text" icon={<UserOutlined style={{ fontSize: 18 }} />} />
      )}
    </Dropdown>
  )

  const activeKey = menuItems.find(i => i.key === location.pathname)?.key || '/'

  const renderMenuItems = (items, isMobile = false) => (
    <ul className={`nav-menu${isMobile ? ' mobile' : ''}`}>
      {items.map((item) => (
        <li key={item.key} className={`nav-item${activeKey === item.key ? ' active' : ''}${item.children ? ' has-children' : ''}`}>
          <Link
            to={item.key}
            className="nav-link"
            onClick={() => {
              if (isMobile) setDrawerOpen(false)
            }}
          >
            {item.icon} <span style={{ marginLeft: 6 }}>{item.label}</span>
          </Link>
          {Array.isArray(item.children) && item.children.length > 0 && (
            <ul className="submenu">
              {item.children.map((sub) => (
                <li key={sub.key} className={`nav-subitem${activeKey === sub.key ? ' active' : ''}`}>
                  <Link
                    to={sub.key}
                    className="nav-sublink"
                    onClick={() => {
                      if (isMobile) setDrawerOpen(false)
                    }}
                  >
                    {sub.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )

  return (
    <Layout className="header-yellow">
      {/* Top wellcome bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        padding : '10px 16px',
        zIndex: 101,
        width: '100%',
        background: '#c08a19',
        color: '#fff',
      }}>
        <div style={{
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          gap: 12,
          maxWidth: 1280,
          margin: '0 auto',
        }}>
          <Text style={{ color: '#fff', fontSize: 14 }} ellipsis>
            {screens.xs ? '' : 'Chào mừng bạn đến với Bean Hotel!'}
          </Text>
          <Space size={12}>
            <Button type="link" icon={<ShoppingCartOutlined />} style={{ color: '#fff', padding: 0 }}>Giỏ hàng (1)</Button>
            <Divider type="vertical" style={{ background: 'rgba(255,255,255,0.35)', margin: '0 4px' }} />
            <Button type="link" icon={<SearchOutlined />} style={{ color: '#fff', padding: 0 }}>{screens.sm ? 'Tìm kiếm' : ''}</Button>
          </Space>
        </div>
      </div>

      {/* Main header */}
      <Header style={{
        position: 'sticky',
        top: 32,
        zIndex: 100,
        width: '100%',
        padding: '0',
        background: '#fff',
        borderBottom: '1px solid rgba(2,6,23,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 64, gap: 16, padding: '0 16px', maxWidth: 1280, margin: '0 auto' }}>
          {/* Left: Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit', textDecoration: 'none' }}>
            <img src={logo} alt="Hotel Logo" style={{  height: 50 }} />
          </Link>
          
          {/* Center: Menu (desktop/tablet) */}
          {screens.md && (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              {renderMenuItems(menuItems, false)}
            </div>
          )}

          {/* Right: Actions */}
          {screens.md ? (
            <Space size={12} style={{ marginLeft: 'auto' }}>
              {notificationBell}
              {userSection}
              <Link to="/booking">
                <Button type="primary" icon={<CalendarOutlined />} style={{ background: '#c08a19', borderColor: '#c08a19' }}>Đặt phòng</Button>
              </Link>
            </Space>
          ) : (
            <Space size={8} style={{ marginLeft: 'auto' }}>
              <Link to="/booking">
                <Button type="primary" size="small" icon={<CalendarOutlined />} style={{ background: '#c08a19', borderColor: '#c08a19' }}>Đặt phòng</Button>
              </Link>
              <Button type="text" icon={<MenuOutlined style={{ color: '#1f2937', fontSize: 20 }} />} onClick={() => setDrawerOpen(true)} />
            </Space>
          )}
        </div>
      </Header>

      {!screens.md && (
        <Drawer
          className="header-yellow"
          title={
            <Space>
              <img src={logo} alt="Hotel Logo" style={{ width: 36, height: 36 }} />
              <span>Hotel Booking</span>
            </Space>
          }
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          bodyStyle={{ padding: 0 }}
        >
          <nav style={{ padding: 12 }}>
            {renderMenuItems(menuItems, true)}
          </nav>
          <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {notificationBell}
            {userSection}
          </div>
          <div style={{ padding: 16 }}>
            <Link to="/booking" onClick={() => setDrawerOpen(false)}>
              <Button block type="primary" size="large" icon={<CalendarOutlined />} style={{ background: '#c08a19', borderColor: '#c08a19' }}>Đặt phòng</Button>
            </Link>
          </div>
        </Drawer>
      )}
    </Layout>
  )
}

export default Navigation

