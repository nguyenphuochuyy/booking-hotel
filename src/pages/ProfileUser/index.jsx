import React, { useState } from 'react'
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Avatar,
  Typography,
  Divider,
  message,
  Upload,
  Grid,
  Space
} from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  CalendarOutlined,
  CameraOutlined,
  EditOutlined,
  SaveOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons'
import dayjs from 'dayjs'
import './profileUser.css'
import { useAuth } from '../../context/AuthContext'
import { getUserProfile, updateUserProfile, changePassword } from '../../services/user.service'
import MessageNotification from '../../components/MessageNotification'
const { Title, Text } = Typography
const { useBreakpoint } = Grid

function ProfileUser() {
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const screens = useBreakpoint()
  const { user, setUser } = useAuth()
  const [messageApi, contextHolder] = message.useMessage()
  
  // States
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    avatar: null
  })
  // load dữ liệu user khi component mount
  React.useEffect(() => {
    if (user) {
      const userData = {
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.date_of_birth ? dayjs(user.date_of_birth) : null,
        avatar: user.avatar || null
      }
      setUserInfo(userData)
      form.setFieldsValue(userData)
    }
  }, [user, form])

  // Handle form submission
  const handleUpdateProfile = async (values) => {
    setLoading(true)
    try {
      // Validate ngày sinh phải trước ngày hiện tại
      if (values.dateOfBirth && values.dateOfBirth.isAfter(dayjs(), 'day')) {
        messageApi.error('Ngày sinh phải trước ngày hiện tại!')
        setLoading(false)
        return
      }

      // Map field names to API format
      const payload = {
        full_name: values.fullName,
        phone: values.phone,
        date_of_birth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null
      }
      
      const response = await updateUserProfile(payload)

      if (response?.user) {
        // Update AuthContext với data từ backend
        setUser(response.user)
        
        // Update local state với format đúng từ backend
        const newUserData = {
          ...userInfo,
          fullName: response.user.full_name || values.fullName,
          phone: response.user.phone || values.phone,
          dateOfBirth: response.user.date_of_birth ? dayjs(response.user.date_of_birth) : values.dateOfBirth
        }
        setUserInfo(newUserData)
        
        messageApi.success('Cập nhật thông tin thành công!')
        setEditMode(false)
      } else {
        messageApi.error('Cập nhật thông tin thất bại!')
      }
    } catch (error) {
      const errMsg = error?.data?.message || error?.message || 'Có lỗi xảy ra, vui lòng thử lại!'
      messageApi.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditMode(false)
    form.resetFields()
    form.setFieldsValue({
      ...userInfo,
      dateOfBirth: userInfo.dateOfBirth
    })
  }

  // hàm đổi mật khẩu
  const handleChangePassword = async (values) => {
    setPasswordLoading(true)
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      })
      messageApi.success('Đổi mật khẩu thành công!')
      passwordForm.resetFields()
    } catch (error) {
      const errMsg = error?.data?.message || error?.message || 'Có lỗi xảy ra, vui lòng thử lại!' 
      messageApi.error(errMsg)
      passwordForm.resetFields()
    } finally {
      setPasswordLoading(false)
    }
  }

  // hàm upload ảnh đại diện
  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      messageApi.success('Cập nhật ảnh đại diện thành công!')
    }
  }

  const uploadButton = (
    <div className="avatar-upload-button">
      <CameraOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh</div>
    </div>
  )

  return (
    <div className="profile-user-page">
      {contextHolder}
      <div className="profile-container">
        <Row gutter={screens.xs ? [16, 24] : screens.md ? [24, 32] : [32, 32]}>
          {/* Profile Header Card */}
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Card className="profile-header-card">
              <div className="profile-header-content">
                <div className="avatar-section">
                  <Upload
                    name="avatar"
                    listType="picture-circle"
                    className="avatar-uploader"
                    showUploadList={false}
                    action="/upload"
                    onChange={handleAvatarChange}
                    disabled={!editMode}
                  >
                    {userInfo.avatar ? (
                      <img src={userInfo.avatar} alt="avatar" className="avatar-image" />
                    ) : (
                      <Avatar size={screens.xs ? 80 : screens.md ? 100 : 120} icon={<UserOutlined />} />
                    )}
                    {editMode && (
                      <div className="avatar-overlay">
                        <CameraOutlined />
                      </div>
                    )}
                  </Upload>
                </div>
                
                <div className="profile-info">
                  <Title level={3} className="profile-name">
                    {userInfo.fullName}
                  </Title>
                  <Text className="profile-email" type="secondary">
                    {userInfo.email}
                  </Text>
                  <Text className="profile-phone" type="secondary">
                    {userInfo.phone}
                  </Text>
                </div>

                <Button
                  type={editMode ? "primary" : "default"}
                  icon={editMode ? <SaveOutlined /> : <EditOutlined />}
                  className={editMode ? "save-profile-btn" : "edit-profile-btn"}
                  onClick={() => {
                    if (editMode) {
                      form.submit()
                    } else {
                      setEditMode(true)
                      form.setFieldsValue({
                        ...userInfo,
                        dateOfBirth: userInfo.dateOfBirth
                      })
                    }
                  }}
                  size={screens.xs ? "middle" : "large"}
                  loading={editMode && loading}
                >
                  {editMode ? 'Lưu thay đổi' : 'Chỉnh sửa thông tin'}
                </Button>
              </div>
            </Card>
          </Col>

          {/* Profile Forms */}
          <Col xs={24} sm={24} md={16} lg={16} xl={16}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Personal Information Form */}
              <Card 
                title={
                  <div className="card-title">
                    <UserOutlined />
                    <span>Thông tin cá nhân</span>
                    {editMode && (
                      <span className="edit-mode-badge">Đang chỉnh sửa</span>
                    )}
                  </div>
                }
                className={`profile-form-card ${editMode ? 'edit-mode' : 'view-mode'}`}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                  className="profile-form"
                >
                  <Row gutter={screens.xs ? [16, 16] : [24, 24]}>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[
                          { required: true, message: 'Vui lòng nhập họ và tên!' },
                          { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="Nhập họ và tên"
                          disabled={!editMode}
                          size={screens.xs ? "middle" : "large"}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: 'Vui lòng nhập email!' },
                          { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined />}
                          placeholder="Nhập email"
                          disabled={!editMode}
                          size={screens.xs ? "middle" : "large"}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                          { required: true, message: 'Vui lòng nhập số điện thoại!' },
                          { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                        ]}
                      >
                        <Input
                          prefix={<PhoneOutlined />}
                          placeholder="Nhập số điện thoại"
                          disabled={!editMode}
                          size={screens.xs ? "middle" : "large"}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Ngày sinh"
                        name="dateOfBirth"
                        rules={[
                          { required: true, message: 'Vui lòng chọn ngày sinh!' }
                        ]}
                      >
                        <DatePicker
                          placeholder="Chọn ngày sinh"
                          disabled={!editMode}
                          size={screens.xs ? "middle" : "large"}
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {editMode && (
                    <div className="form-actions">
                      <Space size="middle">
                        <Button
                          onClick={handleCancelEdit}
                          size={screens.xs ? "middle" : "large"}
                          disabled={loading}
                        >
                          Hủy bỏ
                        </Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          size={screens.xs ? "middle" : "large"}
                          className="save-btn"
                        >
                          Lưu thay đổi
                        </Button>
                      </Space>
                    </div>
                  )}
                </Form>
              </Card>

              {/* Change Password Form */}
              <Card
                title={
                  <div className="card-title">
                    <LockOutlined />
                    <span>Đổi mật khẩu</span>
                  </div>
                }
                className="profile-form-card"
              >
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleChangePassword}
                  className="password-form"
                >
                  <Row gutter={screens.xs ? [16, 16] : [24, 24]}>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        rules={[
                          { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="Nhập mật khẩu hiện tại"
                          size={screens.xs ? "middle" : "large"}
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                          { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                          { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="Nhập mật khẩu mới"
                          size={screens.xs ? "middle" : "large"}
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
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
                          prefix={<LockOutlined />}
                          placeholder="Xác nhận mật khẩu mới"
                          size={screens.xs ? "middle" : "large"}
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div className="form-actions">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={passwordLoading}
                      size={screens.xs ? "middle" : "large"}
                      className="change-password-btn"
                    >
                      Đổi mật khẩu
                    </Button>
                  </div>
                </Form>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default ProfileUser
