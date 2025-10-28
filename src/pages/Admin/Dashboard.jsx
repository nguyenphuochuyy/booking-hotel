import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Typography, Spin, Tag, Empty } from 'antd'
import {
  UserOutlined,
  HomeOutlined,
  ShopOutlined,
  DollarOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { getAllDashboardStats, getBookingStatusColor, getBookingStatusText, formatDate } from '../../services/dashboard.service'
import formatPrice from '../../utils/formatPrice'

const { Title, Text } = Typography

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentBookings: []
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await getAllDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <Title align='center' level={2}>Trang quản trị</Title>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Chào mừng đến với bảng điều khiển quản trị Bean Hotel
      </p>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', color: '#666' }}>Đang tải thống kê...</p>
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={4}>
              <Card>
                <Statistic
                  title="Tổng người dùng"
                  value={stats.totalUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card>
                <Statistic
                  title="Khách sạn"
                  value={stats.totalHotels}
                  prefix={<HomeOutlined />}
                  valueStyle={{ color: '#c08a19' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={5}>
              <Card>
                <Statistic
                  title="Tổng phòng"
                  value={stats.totalRooms}
                  prefix={<ShopOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={5}>
              <Card>
                <Statistic
                  title="Doanh thu"
                  value={formatPrice(stats.totalRevenue)}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={5}>
              <Card>
                <Statistic
                  title="Tổng đặt phòng"
                  value={stats.totalBookings}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={10}>
              <Card title="Hoạt động gần đây" bordered={false}>
                {stats.recentBookings && stats.recentBookings.length > 0 ? (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {stats.recentBookings.map((booking, index) => (
                      <div 
                        key={booking.booking_id || index} 
                        style={{ 
                          padding: '16px',
                          borderBottom: '1px solid #f0f0f0',
                          marginBottom: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <div>
                            <Text strong style={{ fontSize: '14px' }}>Mã: {booking.booking_code || 'N/A'}</Text>
                            <Tag 
                              color={getBookingStatusColor(booking.booking_status)}
                              style={{ marginLeft: '8px' }}
                            >
                              {getBookingStatusText(booking.booking_status)}
                            </Tag>
                          </div>
                          <Text style={{ color: '#1890ff', fontSize: '14px' ,marginLeft: '60px'}}>
                            {formatPrice(booking.final_price || booking.total_price)}
                          </Text>
                        </div>
                        
                        {booking.user && (
                          <div style={{ marginBottom: '4px' }}>
                            <Text type="secondary">Khách hàng: </Text>
                            <Text>{booking.user.full_name || 'N/A'}</Text>
                            <Text type="secondary" style={{ marginLeft: '12px' }}>{booking.user.email}</Text>
                          </div>
                        )}
                        
                        <div style={{ marginBottom: '4px' }}>
                          <Text type="secondary">Check-in: </Text>
                          <Text>{formatDate(booking.check_in_date)}</Text>
                          <Text type="secondary" style={{ marginLeft: '12px' }}>Check-out: </Text>
                          <Text>{formatDate(booking.check_out_date)}</Text>
                        </div>
                        
                        {booking.room?.room_type && (
                          <div>
                            <Text type="secondary">Phòng: </Text>
                            <Text>{booking.room.room_type.room_type_name || 'N/A'}</Text>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="Chưa có đơn đặt phòng" />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={14}>
              <Card title="Thống kê nhanh" bordered={false}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Doanh thu trung bình/booking</Text>
                    <Title level={4} style={{ margin: '8px 0 0 0', color: '#1890ff' }}>
                      {stats.totalBookings > 0 ? formatPrice(stats.totalRevenue / stats.totalBookings) : 'VND 0'}
                    </Title>
                  </div>
                  
                  <div style={{ padding: '16px', background: '#f6ffed', borderRadius: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Tỷ lệ lấp đầy</Text>
                    <Title level={4} style={{ margin: '8px 0 0 0', color: '#52c41a' }}>
                      {stats.totalRooms > 0 ? ((stats.totalBookings / stats.totalRooms) * 100).toFixed(1) : 0}%
                    </Title>
                  </div>
                  
                  <div style={{ padding: '16px', background: '#fff7e6', borderRadius: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Tỷ lệ phòng/khách sạn</Text>
                    <Title level={4} style={{ margin: '8px 0 0 0', color: '#faad14' }}>
                      {stats.totalHotels > 0 ? (stats.totalRooms / stats.totalHotels).toFixed(1) : 0}
                    </Title>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  )
}

export default Dashboard
