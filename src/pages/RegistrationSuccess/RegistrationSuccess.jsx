import React from 'react'
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

function RegistrationSuccess() {
  const navigate = useNavigate()
  return (
    <div className="container" style={{ padding: 24 }}>
      <Result
        status="success"
        title="Đăng ký thành công!"
        subTitle="Vui lòng kiểm tra email để xác minh và kích hoạt tài khoản trước khi đăng nhập."
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>Về trang chủ</Button>,
          <Button key="login" onClick={() => navigate('/login')}>Đến trang đăng nhập</Button>,
        ]}
      />
    </div>
  )
}

export default RegistrationSuccess


