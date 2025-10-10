import React from 'react'
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

function AccessDenied() {
  const navigate = useNavigate()
  return (
    <div className="container" style={{ padding: 24 }}>
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này."
        extra={<Button type="primary" onClick={() => navigate('/')}>Về trang chủ</Button>}
      />
    </div>
  )
}

export default AccessDenied


