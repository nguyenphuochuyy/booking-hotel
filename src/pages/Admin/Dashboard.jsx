import React from 'react'
import { Row, Col, Card, Statistic, Typography } from 'antd'
import {
  UserOutlined,
  HomeOutlined,
  ShopOutlined,
  CalendarOutlined,
} from '@ant-design/icons'

const { Title } = Typography

function Dashboard() {
  return (
    <div>
      <Title align='center' level={2}>Trang quản trị</Title>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Chào mừng đến với bảng điều khiển quản trị Bean Hotel
      </p>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={1234}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách sạn"
              value={15}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#c08a19' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng phòng"
              value={245}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đặt phòng"
              value={89}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Hoạt động gần đây" bordered={false}>
            <p>Chưa có dữ liệu</p>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Thống kê nhanh" bordered={false}>
            <p>Chưa có dữ liệu</p>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard

