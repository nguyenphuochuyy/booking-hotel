import React, { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Button, Grid, Drawer, Space, Typography, Avatar, Badge, Dropdown, Divider } from 'antd'
import './Navigation.css'
import { MenuOutlined, LoginOutlined, UserAddOutlined, BellOutlined, UserOutlined, HomeOutlined, BookOutlined, InfoCircleOutlined, ReadOutlined, ShoppingCartOutlined, SearchOutlined, LogoutOutlined, CalendarOutlined, AppstoreOutlined } from '@ant-design/icons'
import logo from '../../assets/images/z7069108952704_e5432be9b3a36f7a517a48cad2d3807b-removebg-preview.png'
import { useAuth } from '../../context/AuthContext'
const { Header } = Layout
const { useBreakpoint } = Grid
const { Text } = Typography

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const screens = useBreakpoint()
  const { user, setUser , logout , isAuthenticated } = useAuth()

  // Responsive sizing tokens by device type 
  const device = screens.lg ? 'pc' : (screens.md ? 'tablet' : 'phone')
  const sizes = {
    phone: {
      topBarPaddingY: 8,
      topBarPaddingX: 12,
      topTextSize: 12,
      headerHeight: 72,
      containerPadX: 12,
      logo: 80,
      menuFont: 14,
      menuPadY: 6,
      menuPadX: 8,
      iconSize: 16,
      bookBtnSize: 'small',
      drawerLogoSize: 45,
      drawerTitleSize: 16,
    },
    tablet: {
      topBarPaddingY: 10,
      topBarPaddingX: 16,
      topTextSize: 13,
      headerHeight: 90,
      containerPadX: 16,
      logo: 110,
      menuFont: 15,
      menuPadY: 8,
      menuPadX: 10,
      iconSize: 18,
      bookBtnSize: 'middle',
      drawerLogoSize: 50,
      drawerTitleSize: 18,
    },
    pc: {
      topBarPaddingY: 10,
      topBarPaddingX: 20,
      topTextSize: 14,
      headerHeight: 100,
      containerPadX: 20,
      logo: 130,
      menuFont: 16,
      menuPadY: 10,
      menuPadX: 12,
      iconSize: 20,
      bookBtnSize: 'middle',
      drawerLogoSize: 50,
      drawerTitleSize: 18,
    },
  }
  const S = sizes[device]
  const menuItems = useMemo(() => ([
    { key: '/', label: 'Trang chủ' },
    { key: '/about', label: 'Về chúng tôi' },
    {
      key: '/hotels',
      label: 'Phòng',
     
    },
    { key: '/services', label: 'Dịch vụ' },
    { key: '/gallery', label: 'Thư viện ảnh' },
    { key: '/contact', label: 'Liên hệ' },
  ]), [])
  // hàm xử lý đăng xuất 
  const UserLogout = () => {
    logout()
    navigate('/login')
  }
  // đóng menu khi click vào menu
  const onMenuClick = (e) => {
    navigate(e.key)
    setDrawerOpen(false)
  }

  const notificationBell = (
    <Badge count={3} overflowCount={99} size="small">
      <Button type="text" icon={<BellOutlined style={{  fontSize: S.iconSize }} />} />
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
              { key: 'profile', label: 'Hồ sơ', onClick: () => navigate('/user/profile') },
              { key: 'orders', label: 'Đơn đặt phòng', onClick: () => navigate('/user/bookings') },
              { key: 'logout', label: 'Đăng xuất', onClick: () => UserLogout() },
            ]
          : [
              { key: 'login', label: 'Đăng nhập', onClick: () => navigate('/login') },
              { key: 'register', label: 'Đăng ký', onClick: () => navigate('/register') },
            ],
      }}
      placement="bottomRight"
    >
      {isAuthenticated ? (
        <Avatar style={{ backgroundColor: '#7265e6' }} icon={<UserOutlined style={{ fontSize: S.iconSize }} />} />
      ) : (
        <Button type="text" icon={<UserOutlined style={{ fontSize: S.iconSize }} />} />
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
            style={isMobile ? { fontSize: S.menuFont, padding: `${S.menuPadY}px ${S.menuPadX}px` } : {}}
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
    <div className="header-yellow">
      {/* Top wellcome bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        padding : `${S.topBarPaddingY}px ${S.topBarPaddingX}px`,
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
          <Text style={{ color: '#fff', fontSize: S.topTextSize }} ellipsis>
            {device === 'phone' ? '' : 'Chào mừng bạn đến với Bean Hotel!'}
          </Text>
          <Space size={12}>
            <Divider type="vertical" style={{ background: 'rgba(255,255,255,0.35)', margin: '0 4px' }} />
            <Button type="link" icon={<SearchOutlined style={{ fontSize: S.iconSize }} />} style={{ color: '#fff', padding: 0 }}>{device !== 'phone' ? 'Tìm kiếm' : ''}</Button>
          </Space>
        </div>
      </div>

      {/* Main header */}
      <Header style={{
        position: 'sticky',
        top: 0,
        height: S.headerHeight,
        zIndex: 100,
        width: '100%',
        padding: '0',
        background: '#fff',
        borderBottom: '1px solid rgba(2,6,23,0.06)',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: `0 ${S.containerPadX}px`, 
          maxWidth: 1400, 
          margin: '0 auto',
          width: '100%',
          height: '100%'
        }}>
          {/* Left: Logo */}
          <Link to="/" style={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: `${S.logo}px`,
            height: `${S.logo}px`,
            flexShrink: 0,
            marginRight: screens.md ? 20 : 10
          }}>
            <img 
              src={logo} 
              alt="Hotel Logo" 
              style={{ 
                width: '100%', 
                height: '100%',
                objectFit: 'contain'
              }} 
            />
          </Link>
          
          {/* Center: Menu (desktop/tablet) */}
          {screens.md && (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center',
              paddingLeft: device === 'pc' ? 20 : 12,
              paddingRight: device === 'pc' ? 20 : 12
            }}>
              {renderMenuItems(menuItems, false)}
            </div>
          )}

          {/* Right: Actions */}
          {screens.md ? (
            <Space size={12} style={{ marginLeft: 'auto', flexShrink: 0 }}>
              {notificationBell}
              {userSection}
              <Link to="/booking">
                <Button 
                  type="primary" 
                  size={S.bookBtnSize}
                  icon={<CalendarOutlined style={{ fontSize: S.iconSize }} />} 
                  style={{ background: '#c08a19', borderColor: '#c08a19' }}
                >
                  {device === 'pc' ? 'Đặt phòng' : ''}
                </Button>
              </Link>
            </Space>
          ) : (
            <Space size={8} style={{ marginLeft: 'auto' }}>
              <Link to="/booking">
                <Button 
                  type="primary" 
                  size={S.bookBtnSize} 
                  icon={<CalendarOutlined style={{ fontSize: S.iconSize }} />} 
                  style={{ background: '#c08a19', borderColor: '#c08a19' }}
                >
                  Đặt
                </Button>
              </Link>
              <Button 
                type="text" 
                icon={<MenuOutlined style={{ color: '#1f2937', fontSize: S.iconSize + 2 }} />} 
                onClick={() => setDrawerOpen(true)} 
              />
            </Space>
          )}
        </div>
      </Header>

      {!screens.md && (
        <Drawer
          className="header-yellow"
          title={
            <Space>
              <img src={logo} alt="Hotel Logo" style={{ width: S.drawerLogoSize, height: S.drawerLogoSize, objectFit: 'contain' }} />
              <span style={{ fontSize: S.drawerTitleSize, fontWeight: 600 }}>Bean Hotel</span>
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
              <Button block type="primary" size="large" icon={<CalendarOutlined style={{ fontSize: S.iconSize }} />} style={{ background: '#c08a19', borderColor: '#c08a19' }}>Đặt phòng</Button>
            </Link>
          </div>
        </Drawer>
      )}
    </div>
  )
}

export default Navigation

