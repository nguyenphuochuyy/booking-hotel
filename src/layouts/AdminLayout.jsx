import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

function AdminLayout() {
  const navigate = useNavigate()
  return (
    <div className="AdminApp">
      <header style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>Admin Panel</h3>
        <nav>
          <button onClick={() => navigate('/admin')}>Dashboard</button>
          <button onClick={() => navigate('/')}>Trang người dùng</button>
        </nav>
      </header>
      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout


