import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Button,
  Card,
  Tabs,
  Typography,
  Row,
  Col,
  Grid,
  Space,
  Divider,
  message,
  Breadcrumb
} from 'antd'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  GoogleOutlined,
  FacebookOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import './Authentication.css'

const { Title, Text, Link } = Typography
const { useBreakpoint } = Grid

const Authentication = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const screens = useBreakpoint()
  const [activeTab, setActiveTab] = useState('login')
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Tự động chuyển tab dựa vào URL
  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('register')
    } else {
      setActiveTab('login')
    }
  }, [location.pathname])

  // Xử lý đăng nhập
  const handleLogin = async (values) => {
    setLoading(true)
    try {
      // TODO: Tích hợp API đăng nhập
      console.log('Login values:', values)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Giả lập API call
      message.success('Đăng nhập thành công!')
      navigate('/')
    } catch (error) {
      message.error('Đăng nhập thất bại!')
    } finally {
      setLoading(false)
    }
  }

  // Xử lý đăng ký
  const handleRegister = async (values) => {
    setLoading(true)
    try {
      // TODO: Tích hợp API đăng ký
      console.log('Register values:', values)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Giả lập API call
      message.success('Đăng ký thành công!')
      setActiveTab('login')
      registerForm.resetFields()
    } catch (error) {
      message.error('Đăng ký thất bại!')
    } finally {
      setLoading(false)
    }
  }

  // Form đăng nhập
  const LoginForm = () => (
    <Form
      style={{ width: screens.xs ? '100%' : '75%', margin: '0 auto' }}
      form={loginForm}
      name="login"
      onFinish={handleLogin}
      layout="vertical"

    >
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Vui lòng nhập email!' },
          { type: 'email', message: 'Email không hợp lệ!' }
        ]}
      >
        <Input
          prefix={<MailOutlined className="input-icon" />}
          placeholder="Nhập email của bạn"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Mật khẩu"
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu!' },
          { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="input-icon" />}
          placeholder="Nhập mật khẩu"
        />
      </Form.Item>

      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="#" className="auth-link">Quên mật khẩu?</Link>
        </div>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          className="auth-button"
          size="middle"
        >
          Đăng nhập
        </Button>
      </Form.Item>

      <Divider plain>
        <Text type="secondary" style={{ fontSize: screens.xs ? 12 : 14 }}>Hoặc đăng nhập với</Text>
      </Divider>

      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        <Button
          icon={<GoogleOutlined />}
          block
          className="social-button google-button"
          size="middle"
        >
          Đăng nhập với Google
        </Button>
        <Button
          icon={<FacebookOutlined />}
          block
          className="social-button facebook-button"
          size="middle"
        >
          Đăng nhập với Facebook
        </Button>
      </Space>
    </Form>
  )

  // Form đăng ký
  const RegisterForm = () => (
    <Form
      style={{ width: screens.xs ? '100%' : '70%', margin: '0 auto' }}
      form={registerForm}
      name="register"
      onFinish={handleRegister}
      layout="vertical"
      size='small'
    >
      <Form.Item
        name="fullName"
        label="Họ và tên"
        rules={[
          { required: true, message: 'Vui lòng nhập họ tên!' },
          { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
        ]}
      >
        <Input
          prefix={<UserOutlined className="input-icon" />}
          placeholder="Nhập họ và tên"
        />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Vui lòng nhập email!' },
          { type: 'email', message: 'Email không hợp lệ!' }
        ]}
      >
        <Input
          prefix={<MailOutlined className="input-icon" />}
          placeholder="Nhập email của bạn"
        />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Số điện thoại"
        rules={[
          { required: true, message: 'Vui lòng nhập số điện thoại!' },
          { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
        ]}
      >
        <Input
          prefix={<PhoneOutlined className="input-icon" />}
          placeholder="Nhập số điện thoại"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Mật khẩu"
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu!' },
          { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="input-icon" />}
          placeholder="Nhập mật khẩu"
        />
      </Form.Item>

      <Form.Item

        name="confirmPassword"
        label="Xác nhận mật khẩu"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'))
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="input-icon" />}
          placeholder="Nhập lại mật khẩu"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          className="auth-button"
          size="middle"
        >
          Đăng ký
        </Button>
      </Form.Item>

      <Divider plain>
        <Text type="secondary" style={{ fontSize: screens.xs ? 12 : 14 }}>Hoặc đăng ký với</Text>
      </Divider>

      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        <Button
          icon={<GoogleOutlined />}
          block
          className="social-button google-button"
          size="middle"
        >
          Đăng ký với Google
        </Button>
        <Button
          icon={<FacebookOutlined />}
          block
          className="social-button facebook-button"
          size="middle"
        >
          Đăng ký với Facebook
        </Button>
      </Space>
    </Form>
  )

  const tabItems = [
    {
      key: 'login',
      label: (
        <span style={{ fontSize: screens.xs ? 14 : 16, fontWeight: 600 }}>
          Đăng nhập
        </span>
      ),
      children: <LoginForm />
    },
    {
      key: 'register',
      label: (
        <span style={{ fontSize: screens.xs ? 14 : 16, fontWeight: 600 }}>
          Đăng ký
        </span>
      ),
      children: <RegisterForm />
    }
  ]

  return (
    <div className="auth-container container">
      {/* Breadcrumb */}
      <div style={{ marginBottom: screens.xs ? 12 : 16 , marginTop: screens.xs ? 12 : 16 }}>
        <Breadcrumb>
          <Breadcrumb.Item>
            <a onClick={() => navigate('/')}>Trang chủ</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: screens.xs ? '20px 16px' : '40px 24px' }}>
        <Col
          xs={24}
          sm={22}
          md={18}
          lg={14}
          xl={12}
          xxl={10}
        >
          <Card
            className="auth-card"
            bordered={false}
          >
            {/* Logo và tiêu đề */}
            <div style={{ textAlign: 'center', marginBottom: screens.xs ? 16 : 20 }}>
              <Title
                level={screens.xs ? 3 : 2}
                style={{ marginBottom: 6, color: '#c08a19' }}
              >
                Bean Hotel
              </Title>
              <Text type="secondary" style={{ fontSize: screens.xs ? 13 : 15 }}>
                Chào mừng bạn đến với hệ thống đặt phòng của chúng tôi
              </Text>
            </div>

            {/* Form tabs */}
            <Tabs
              activeKey={activeTab}
              onChange={(key) => {
                setActiveTab(key)
                navigate(key === 'login' ? '/login' : '/register')
              }}
              items={tabItems}
              centered
              className="auth-tabs"
            />

            {/* Điều khoản */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: screens.xs ? 11 : 12 }}>
                Bằng việc đăng nhập/đăng ký, bạn đồng ý với{' '}
                <Link href="/terms-of-service" className="auth-link">Điều khoản sử dụng</Link>
                {' '}và{' '}
                <Link href="/privacy-policy" className="auth-link">Chính sách bảo mật</Link>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Authentication

