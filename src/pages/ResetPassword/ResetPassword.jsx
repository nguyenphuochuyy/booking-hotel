import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Result, Spin, Grid } from 'antd'
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone, LoadingOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import authenticationService from '../../services/authentication.service'
import './ResetPassword.css'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const screens = useBreakpoint()
  const [form] = Form.useForm()
  
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [status, setStatus] = useState('verifying') // verifying | valid | invalid | success
  const [message, setMessage] = useState('')
  const token = searchParams.get('token')

  // Verify token khi component mount
  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      setMessage('Token không hợp lệ hoặc đã hết hạn.')
      setVerifying(false)
      return
    }

    // Token exists, ready to reset
    setStatus('valid')
    setTokenValid(true)
    setVerifying(false)
  }, [token])

  // Handle reset password
  const handleResetPassword = async (values) => {
    setLoading(true)
    try {
      await authenticationService.resetPassword({
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      })
      
      setStatus('success')
      setMessage('Đặt lại mật khẩu thành công!')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      const errMsg = error?.data?.message || error?.message || 'Có lỗi xảy ra!'
      setStatus('invalid')
      setMessage(errMsg)
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    if (verifying) {
      return (
        <div className="reset-password-loading">
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
            size="large"
          />
          <Title level={3} style={{ marginTop: 24, marginBottom: 8 }}>
            Đang xác thực...
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
          title="Đặt lại mật khẩu thành công!"
          subTitle="Bạn sẽ được chuyển đến trang đăng nhập trong 3 giây..."
          extra={[
            <Button 
              type="primary" 
              key="login" 
              size="large"
              onClick={() => navigate('/login')}
            >
              Đăng nhập ngay
            </Button>
          ]}
        />
      )
    }

    if (status === 'invalid') {
      return (
        <Result
          status="error"
          title="Token không hợp lệ"
          subTitle={message}
          extra={[
            <Button 
              type="primary" 
              key="home" 
              size="large"
              onClick={() => navigate('/')}
            >
              Về trang chủ
            </Button>,
            <Button 
              key="login" 
              size="large"
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
          ]}
        />
      )
    }

    // status === 'valid' - Show form
    return (
      <div className="reset-password-form-container">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#c08a19', marginBottom: 8 }}>
            Đặt lại mật khẩu
          </Title>
          <Text type="secondary" style={{ fontSize: screens.xs ? 14 : 15 }}>
            Nhập mật khẩu mới của bạn
          </Text>
        </div>

        <Form
          form={form}
          onFinish={handleResetPassword}
          layout="vertical"
          style={{ width: '100%' }}
        >
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="Nhập mật khẩu mới"
              size="large"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="Nhập lại mật khẩu mới"
              size="large"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
              className="reset-password-button"
            >
              Đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    )
  }

  return (
    <div className="reset-password-container">
      <Card 
        className="reset-password-card"
        bordered={false}
      >
        {renderContent()}
      </Card>
    </div>
  )
}

export default ResetPassword

