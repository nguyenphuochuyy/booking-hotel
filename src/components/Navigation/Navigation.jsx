import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, Button, Divider, Drawer, Dropdown, Space } from 'antd'
import { MenuOutlined, UserOutlined } from '@ant-design/icons'
import './Navigation.css'
import logo from '../../assets/images/z7069108952704_e5432be9b3a36f7a517a48cad2d3807b-removebg-preview.webp'
import { useAuth } from '../../context/AuthContext'

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = useMemo(() => ([
    { key: '/', label: 'Trang chủ' },
    { key: '/about', label: 'Về chúng tôi' },
    { key: '/services', label: 'Dịch vụ' },
    { key: '/news', label: 'Tin tức' },
    { key: '/gallery', label: 'Thư viện ảnh' },
    { key: '/contact', label: 'Liên hệ' },
  ]), [])

  const activeKey = menuItems.find(i => i.key === location.pathname)?.key || '/'

  const handleLogout = () => {
    logout()
    navigate('/login')
    setDrawerOpen(false)
  }

  const userMenuItems = [
    {
      key: 'profile',
      label: <Link to="/user/profile">Thông tin cá nhân</Link>,
    },
    {
      key: 'bookings',
      label: <Link to="/user/bookings">Lịch sử đặt phòng</Link>,
    },
    ...(user?.role === 'ADMIN'
      ? [{
          key: 'admin',
          label: <Link to="/admin">Trang quản lý</Link>,
        }]
      : []),
    { type: 'divider' },
    {
      key: 'logout',
      label: <span className="dropdown-logout">Đăng xuất</span>,
    },
  ]

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      handleLogout()
    } else {
      setDrawerOpen(false)
    }
  }

  const renderNavLinks = (isMobile = false) => (
    <ul className={`nav-menu${isMobile ? ' mobile' : ''}`}>
      {menuItems.map(item => (
        <li
          key={item.key}
          className={`nav-item${activeKey === item.key ? ' active' : ''}`}
        >
          <Link
            to={item.key}
            className="nav-link"
            onClick={() => {
              if (isMobile) setDrawerOpen(false)
            }}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      <header className={`navigation ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-left">
            <button
              className="mobile-menu-btn"
              aria-label="Toggle navigation menu"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuOutlined />
            </button>

            <Link to="/" className="nav-logo" aria-label="Trang chủ">
              <img src={logo} alt="Bean Hotel" className="hotel-logo" />
              <span className="hotel-name">Bean Hotel</span>
            </Link>
          </div>

          <nav className="nav-center">
            {renderNavLinks()}
          </nav>

          <div className="nav-actions">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="action-link ghost">Đăng nhập</Link>
                <Link to="/register" className="action-link primary">Đăng ký</Link>
              </>
            ) : (
              <Dropdown
                trigger={['click']}
                placement="bottomRight"
                menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              >
                <Space className="user-trigger" size={8}>
                  <Avatar
                    size="large"
                    src={user?.avatar}
                    icon={!user?.avatar && <UserOutlined />}
                  />
                  <span className="user-name">
                    {user?.full_name || 'Người dùng'}
                  </span>
                </Space>
              </Dropdown>
            )}
          </div>

          <div className="nav-mobile-user">
            {isAuthenticated && (
              <Link
                to="/user/profile"
                className="mobile-user-btn"
                aria-label="Trang cá nhân"
              >
                <Avatar
                  size="large"
                  src={user?.avatar}
                  icon={!user?.avatar && <UserOutlined />}
                />
              </Link>
            )}
          </div>

        </div>
      </header>

      <Drawer
        placement="left"
        width={280}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        bodyStyle={{ padding: '24px 20px' }}
        headerStyle={{ borderBottom: 'none' }}
        className="nav-drawer"
      >
        <div className="drawer-header">
          <Link to="/" className="nav-logo" onClick={() => setDrawerOpen(false)}>
            <img src={logo} alt="Bean Hotel" className="hotel-logo" />
            <span className="hotel-name">Bean Hotel</span>
          </Link>
        </div>

        <Divider />

        {renderNavLinks(true)}

        <Divider />

        {!isAuthenticated ? (
          <div className="drawer-actions">
            <Button
              block
              className="action-link ghost"
              onClick={() => {
                setDrawerOpen(false)
                navigate('/login')
              }}
            >
              Đăng nhập
            </Button>
            <Button
              type="primary"
              block
              className="action-link primary"
              onClick={() => {
                setDrawerOpen(false)
                navigate('/register')
              }}
            >
              Đăng ký
            </Button>
          </div>
        ) : (
          <>
           {/* đăng xuất */}
           <Button
              block
              className="action-link ghost"
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </>
        )}
      </Drawer>
    </>
  )
}

export default Navigation

