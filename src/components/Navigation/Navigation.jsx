import React, { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'
import logo from '../../assets/images/z7069108952704_e5432be9b3a36f7a517a48cad2d3807b-removebg-preview.png'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
function Navigation() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const menuItems = useMemo(() => ([
    { key: '/', label: 'Trang chủ' },
    { key: '/about', label: 'Về chúng tôi' },
    { key: '/services', label: 'Dịch vụ' },
    { key: '/news', label: 'Tin tức' },
    { key: '/gallery', label: 'Thư viện ảnh' },
    { key: '/contact', label: 'Liên hệ' },
  ]), [])

  const activeKey = menuItems.find(i => i.key === location.pathname)?.key || '/'

  const renderMenu = (isMobile = false) => (
    <ul className={`nav-menu${isMobile ? ' mobile' : ''}`}>
      {menuItems.map(item => (
        <li key={item.key} className={`nav-item${activeKey === item.key ? ' active' : ''}`}>
          <Link to={item.key} className="nav-link" onClick={() => { if (isMobile) setIsMenuOpen(false) }}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="navigation">
      <div className="nav-container">
        {/* Left: Logo */}
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <img src={logo} alt="Hotel Logo" className="hotel-logo" />
            <span className="hotel-name">Bean Hotel</span>
          </Link>
        </div>

        {/* Center: Menu (tablet/pc) */}
        <nav className="nav-center" style={{ justifySelf: 'center' }}>
          {renderMenu(false)}
        </nav>

        {/* Right: Actions (PC/Tablet) */}
        <div className="nav-actions" style={{ justifySelf: 'end' }}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="action-link login-btn">Đăng nhập</Link>
              <Link to="/register" className="action-link register-btn">Đăng ký</Link>
            </>
          ) : (
            <div
              className="user-menu"
              onMouseEnter={() => setIsUserMenuOpen(true)}
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <button
                className="user-avatar"
                onClick={() => setIsUserMenuOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </button>
              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/user/profile" className="user-item">Thông tin cá nhân</Link>
                  <Link to="/user/bookings" className="user-item">Lịch sử đặt phòng</Link>
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="user-item">Trang quản lý</Link>
                  )}
                  <button className="user-item logout" onClick={() => { logout(); navigate('/login') }}>Đăng xuất</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Mobile burger (<992px) */}
        <div className="nav-right" style={{ justifySelf: 'end' }}>
          <button
            className={`menu-toggle${isMenuOpen ? ' open' : ''}`}
            aria-label="Toggle navigation menu"
            onClick={() => setIsMenuOpen(v => !v)}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div style={{ display: isMenuOpen ? 'block' : 'none' }}>
        {renderMenu(true)}
        <div style={{ padding: '12px' }}>
          {!isAuthenticated ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <Link to="/login" className="login-btn" style={{ textAlign: 'center' }} onClick={() => setIsMenuOpen(false)}>Đăng nhập</Link>
              <Link to="/register" className="register-btn" style={{ textAlign: 'center' }} onClick={() => setIsMenuOpen(false)}>Đăng ký</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              <Link to="/user/profile" className="login-btn" onClick={() => setIsMenuOpen(false)}>Thông tin cá nhân</Link>
              <Link to="/user/bookings" className="login-btn" onClick={() => setIsMenuOpen(false)}>Lịch sử đặt phòng</Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="login-btn" onClick={() => setIsMenuOpen(false)}>Trang quản lý</Link>
              )}
              <button className="login-btn" onClick={() => { setIsMenuOpen(false); logout(); navigate('/login') }}>Đăng xuất</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navigation

