import React from 'react'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

function Loading({ message = 'Đang tải...', fullScreen = true }) {
  const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#c08a19' }} spin />
  
  const containerStyle = fullScreen ? {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
    gap: 24,
    background: '#f0f2f5'
  } : {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 0',
    flexDirection: 'column',
    gap: 24
  }

  return (
    <div style={containerStyle}>
      <Spin indicator={antIcon} size="large" />
      <div style={{ 
        color: '#666', 
        fontSize: 16,
        fontWeight: 500 
      }}>
        {message}
      </div>
    </div>
  )
}

export default Loading


