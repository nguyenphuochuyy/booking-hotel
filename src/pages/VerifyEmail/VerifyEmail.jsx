import React, { useEffect, useState } from 'react'
import { Result, Button, Spin, Card, Typography } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoadingOutlined } from '@ant-design/icons'
import authenticationService from '../../services/authentication.service'
import './VerifyEmail.css'

const { Title, Text } = Typography

function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyAccount = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setStatus('error')
        setMessage('Token xác thực không hợp lệ hoặc đã hết hạn.')
        setLoading(false)
        return
      }

      try {
        const result = await authenticationService.verifyEmail({ token })
        setStatus('success')
        setMessage(result?.message || 'Xác minh email thành công!')
      } catch (error) {
        setStatus('error')
        setMessage(error?.data?.message || error?.message || 'Xác minh email thất bại!')
      } finally {
        setLoading(false)
      }
    }

    verifyAccount()
  }, [searchParams])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="verify-email-loading">
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
            size="large"
          />
          <Title level={3} style={{ marginTop: 24, marginBottom: 8 }}>
            Đang xác minh tài khoản...
          </Title>
          <Text type="secondary">
            Vui lòng đợi trong giây lát
          </Text>
        </div>
      )
    }

    if (status === 'success') {
      return (
        <Result
          status="success"
          title="Xác minh email thành công!"
          subTitle={message}
          extra={[
            <Button 
              type="primary" 
              key="login" 
              size="large"
              onClick={() => navigate('/login')}
            >
              Đăng nhập ngay
            </Button>,
            <Button 
              key="home" 
              size="large"
              onClick={() => navigate('/')}
            >
              Về trang chủ
            </Button>,
          ]}
        />
      )
    }

    return (
      <Result
        status="error"
        title="Xác minh thất bại"
        subTitle={message}
        extra={[
          <Button 
            type="primary" 
            key="register" 
            size="large"
            onClick={() => navigate('/register')}
          >
            Đăng ký lại
          </Button>,
          <Button 
            key="home" 
            size="large"
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>,
        ]}
      />
    )
  }

  return (
    <div className="verify-email-container">
      <Card 
        className="verify-email-card"
        bordered={false}
      >
        <div className="verify-email-logo">
          <Title level={2} style={{ color: '#c08a19', marginBottom: 8 }}>
            Bean Hotel
          </Title>
          <Text type="secondary">Xác minh tài khoản</Text>
        </div>
        {renderContent()}
      </Card>
    </div>
  )
}

export default VerifyEmail

