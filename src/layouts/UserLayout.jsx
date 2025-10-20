import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { FloatButton } from "antd";
import { ArrowUpOutlined } from '@ant-design/icons';
function UserLayout() {
  return (
    <div className="App">
      <Navigation />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <FloatButton.BackTop icon={<ArrowUpOutlined />} />
    </div>
  )
}

export default UserLayout


