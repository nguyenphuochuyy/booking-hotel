import React, { useMemo } from 'react'
import { Card, Avatar, Typography, Descriptions, Row, Col, Tag, Divider } from 'antd'
import { UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, CrownOutlined } from '@ant-design/icons'
import { useAuth } from '../../../context/AuthContext'

const { Title, Text } = Typography

const formatDate = (dateString) => {
  if (!dateString) return 'Chưa cập nhật'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function AdminProfile() {
  const { user } = useAuth()

  // Lấy user từ context hoặc localStorage (phòng trường hợp reload nhanh)
  const currentUser = useMemo(() => {
    if (user) return user
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (_err) {
      return null
    }
    return null
  }, [user])

  if (!currentUser) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Title level={3}>Thông tin cá nhân</Title>
          <Text type="secondary">
            Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.
          </Text>
        </Card>
      </div>
    )
  }

  const isAdmin = currentUser.role === 'admin'

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 900,
        margin: '0 auto'
      }}
    >
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
            <Avatar
              size={96}
              icon={<UserOutlined />}
              style={{
                background: 'linear-gradient(135deg, #c08a19, #f5d27b)',
                marginBottom: 16
              }}
            />
            <Title level={4} style={{ marginBottom: 8 }}>
              {currentUser.full_name || 'Quản trị viên'}
            </Title>
            <Tag
              color={isAdmin ? 'gold' : 'blue'}
              style={{
                borderRadius: 999,
                padding: '4px 12px',
                fontWeight: 500,
              }}
            >
              {isAdmin ? (
                <>
                  <CrownOutlined style={{ marginRight: 6 }} />
                  Quản trị viên
                </>
              ) : (
                'Người dùng'
              )}
            </Tag>
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">
                Tài khoản được bảo vệ theo chính sách bảo mật của Bean Hotel.
              </Text>
            </div>
          </Col>

          <Col xs={24} sm={16}>
            <Title level={4} style={{ marginBottom: 16 }}>
              Thông tin cá nhân
            </Title>
            <Descriptions
              column={1}
              labelStyle={{ fontWeight: 500, width: 140 }}
              contentStyle={{ fontWeight: 400 }}
            >
              <Descriptions.Item label="Họ và tên">
                <UserOutlined style={{ marginRight: 8 }} />
                {currentUser.full_name || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined style={{ marginRight: 8 }} />
                {currentUser.email || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <PhoneOutlined style={{ marginRight: 8 }} />
                {currentUser.phone || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="CCCD/CMND">
                <IdcardOutlined style={{ marginRight: 8 }} />
                {currentUser.cccd || currentUser.national_id || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {formatDate(currentUser.date_of_birth)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo tài khoản">
                {formatDate(currentUser.created_at)}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5} style={{ marginBottom: 8 }}>
              Bảo mật & quyền truy cập
            </Title>
            <Text type="secondary">
              Vai trò hiện tại:&nbsp;
            </Text>
            <Tag color={isAdmin ? 'red' : 'blue'}>
              {isAdmin ? 'Admin' : 'User'}
            </Tag>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default AdminProfile


