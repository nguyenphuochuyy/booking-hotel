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
  Breadcrumb,
  Modal
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
// import { GoogleLogin } from '@react-oauth/google'
import './Authentication.css'
import { useAuth } from '../../context/AuthContext'
import { getUserProfile } from '../../services/user.service'
import authenticationService from '../../services/authentication.service'

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
  const { login , setUser , setAccessToken  } = useAuth()
  const [messageApi, contextHolder] = message.useMessage()
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false)
  const [forgotPasswordForm] = Form.useForm()
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)

  // Tự động chuyển tab dựa vào URL
  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('register')
    } else {
      setActiveTab('login')
    }
  }, [location.pathname])
  // message khi đăng nhập
  const success = () => {
    messageApi.open({
      type: 'success',
      content: 'Đăng nhập thành công!',
      duration: 3,
    });
  };
  // Xử lý đăng nhập
  const handleLogin = async (values) => {
    setLoading(true)
    try {
      const response = await login(values)
      if(response){
        success()
        // lấy thông tin của user sau khi đăng nhập thành công bằng accessToken
        const userProfile = await getUserProfile()
        console.log(userProfile.user);
        
        const profileUser = userProfile?.user
        if (profileUser) {
          setUser(profileUser)
        }
        setTimeout(() => {
          const role = profileUser?.role
          if (role === 'admin') {
            navigate('/admin')
          } else {
            navigate('/')
          }
        }, 1000)
      }
      
    } catch (error) {
      message.error('Đăng nhập thất bại!')
    } finally {
      setLoading(false)
    }
  }

  // Xử lý đăng nhập Google
  // const handleGoogleSuccess = async (credentialResponse) => {
  //   setLoading(true)
  //   try {
  //     // Gửi credential token lên backend để verify và tạo user/login
  //     const response = await authenticationService.googleLogin({
  //       credential: credentialResponse.credential
  //     })
      
  //     if (response) {
  //       messageApi.success('Đăng nhập Google thành công!')
        
  //       // Lấy thông tin user
  //       const userProfile = await getUserProfile()
  //       if (userProfile?.user) {
  //         setUser(userProfile.user)
  //       }
        
  //       setTimeout(() => {
  //         const role = userProfile?.user?.role
  //         if (role === 'admin') {
  //           navigate('/admin')
  //         } else {
  //           navigate('/')
  //         }
  //       }, 1500)
  //     }
  //   } catch (error) {
  //     const errMsg = error?.data?.message || error?.message || 'Đăng nhập Google thất bại!'
  //     messageApi.error(errMsg)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleGoogleError = () => {
    messageApi.error('Đăng nhập Google thất bại!')
  }

  // Xử lý quên mật khẩu
  const handleForgotPassword = async (values) => {
    setForgotPasswordLoading(true)
    try {
      const response = await authenticationService.forgotPassword({ email: values.email })
      messageApi.success('Đã gửi email hướng dẫn đặt lại mật khẩu!')
      setForgotPasswordModal(false)
      forgotPasswordForm.resetFields()
    } catch (error) {
      const errMsg = error?.data?.message || error?.message || 'Có lỗi xảy ra!'
      messageApi.error(errMsg)
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  // Xử lý đăng ký
  const handleRegister = async (values) => {
    setLoading(true)
    try {
      const payload = {
        full_name: values.fullName,
        email: values.email,
        password: values.password,
      }
      const result = await authenticationService.register(payload)
      console.log(result);
      message.success('Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.')
      registerForm.resetFields()
      navigate('/register/success')
    } catch (error) {
      const errMsg = error?.data?.message || error?.message || 'Đăng ký thất bại!'
      message.error(errMsg)
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
          <Link 
            onClick={() => setForgotPasswordModal(true)} 
            className="auth-link"
            style={{ cursor: 'pointer' }}
          >
            Quên mật khẩu?
          </Link>
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

      <Space direction="vertical" style={{ width: '100%'  }} size={8}>
        {/* <div style={{ width: '100%' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width={'100%'}
            text="signin_with"
            shape="rectangular"
          />
        </div> */}
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
        {/* <div style={{ width: '100%' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width={'100%'}
            text="signup_with"
            shape="rectangular"
          />
        </div> */}
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
      {contextHolder}
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

      {/* Modal Quên mật khẩu */}
      <Modal
        title={<span style={{ fontSize: screens.xs ? 18 : 20, fontWeight: 600 }}>Quên mật khẩu</span>}
        open={forgotPasswordModal}
        onCancel={() => {
          setForgotPasswordModal(false)
          forgotPasswordForm.resetFields()
        }}
        footer={null}
        centered
        width={screens.xs ? '90%' : screens.md ? 500 : 520}
      >
        <div style={{ padding: screens.xs ? '16px 0' : '20px 0' }}>
          <Text type="secondary" style={{ fontSize: screens.xs ? 14 : 15, display: 'block', marginBottom: 24 }}>
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
          </Text>
          
          <Form
            form={forgotPasswordForm}
            onFinish={handleForgotPassword}
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
                size="large"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => {
                    setForgotPasswordModal(false)
                    forgotPasswordForm.resetFields()
                  }}
                  size={screens.xs ? 'middle' : 'large'}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={forgotPasswordLoading}
                  className="auth-button"
                  size={screens.xs ? 'middle' : 'large'}
                >
                  Gửi email
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  )
}

export default Authentication

