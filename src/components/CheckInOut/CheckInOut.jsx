import React, { useState } from 'react'
import { 
  Modal, Form, Input, Button, message, Card, Row, Col, 
  Typography, Tag, Space, Divider, Alert, Spin
} from 'antd'
import { 
  CheckCircleOutlined, ClockCircleOutlined, UserOutlined,
  HomeOutlined, CalendarOutlined, CreditCardOutlined
} from '@ant-design/icons'
import { findBookingByCode, checkInGuest, checkOutGuest } from '../../../src/services/admin.service'
import formatPrice from '../../utils/formatPrice'
import './CheckInOut.css'

const { Title, Text } = Typography

// Format date to dd/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const CheckInOut = ({ visible, onCancel, type = 'checkin', onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState(null)
  const [step, setStep] = useState(1) // 1: Search, 2: Confirm, 3: Success
  const [success, setSuccess] = useState(false)

  const handleSearch = async (values) => {
    try {
      setLoading(true)
      const response = await findBookingByCode(values.bookingCode)
      if (response && response.booking) {
        setBookingData(response.booking)
        setStep(2)
        message.success('Tìm thấy đơn đặt phòng!')
      } else {
        message.error('Không tìm thấy đơn đặt phòng phù hợp')
      }
    } catch (error) {
      console.error('Error finding booking:', error)
      message.error('Không tìm thấy đơn đặt phòng phù hợp')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    try {
      setLoading(true)
      let response
      if (type === 'checkin') {
        response = await checkInGuest(bookingData.booking_code)
      } else {
        response = await checkOutGuest(bookingData.booking_code)
      }
      if (response?.statusCode === 200 || response?.success) {
        setSuccess(true)
        setStep(3) 
        // Call onSuccess callback to refresh booking list
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setSuccess(false)
        setStep(3)
        message.error(`Không thể thực hiện ${type === 'checkin' ? 'check-in' : 'check-out'}!`)
      }
    } catch (error) {
      console.error(`Error ${type}:`, error)
      setSuccess(false)
      setStep(3)
      message.error(`Không thể thực hiện ${type === 'checkin' ? 'check-in' : 'check-out'}!`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setBookingData(null)
    setSuccess(false)
    form.resetFields()
    onCancel()
  }

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Chờ xác nhận' },
      confirmed: { color: 'blue', text: 'Đã xác nhận' },
      checked_in: { color: 'green', text: 'Đã nhận phòng' },
      checked_out: { color: 'purple', text: 'Đã trả phòng' },
      cancelled: { color: 'red', text: 'Đã hủy' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return <Tag color={config.color}>{config.text}</Tag>
  }

  return (
    <Modal
      title={
        <Space>
          {type === 'checkin' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          <span>{type === 'checkin' ? 'Check-in khách hàng' : 'Check-out khách hàng'}</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width={800}
      footer={null}
      destroyOnClose
      centered
    >
      <div className="checkinout-modal">
        {step === 1 && (
          <div className="search-step">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSearch}
              autoComplete="off"
            >
              <Form.Item
                name="bookingCode"
                label="Mã đặt phòng"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã đặt phòng!' },
                  { min: 6, message: 'Mã đặt phòng phải có ít nhất 6 ký tự!' }
                ]}
              >
                <Input
                  placeholder="Nhập mã đặt phòng (ví dụ: ABC123)"
                  size="large"
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>
              
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                >
                  Tìm kiếm đặt phòng
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}

        {step === 2 && bookingData && (
          <div className="confirm-step">
            <Alert
              message={`Xác nhận ${type === 'checkin' ? 'check-in' : 'check-out'}`}
              description={`Bạn có chắc chắn muốn thực hiện ${type === 'checkin' ? 'check-in' : 'check-out'} cho khách hàng này?`}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Card title="Thông tin đặt phòng" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="info-item">
                    <Text strong>Mã đặt phòng:</Text>
                    <Text code>{bookingData.booking_code}</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>Trạng thái:</Text>
                    {getStatusTag(bookingData.booking_status)}
                  </div>
                  <div className="info-item">
                    <Text strong>Loại phòng:</Text>
                    <Text>{bookingData.room?.room_type?.room_type_name}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-item">
                    <Text strong>Số phòng:</Text>
                    <Text>{bookingData.room?.room_num || 'Chưa gán'}</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>Số khách:</Text>
                    <Text>{bookingData.num_person} người</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>Tổng tiền:</Text>
                    <Text strong style={{ color: '#52c41a' }}>
                      {formatPrice(bookingData.final_price || bookingData.total_price)}
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>

            <Card title="Thông tin khách hàng" size="small" style={{ marginTop: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="info-item">
                    <Text strong>Tên khách hàng:</Text>
                    <Text>{bookingData.user?.full_name}</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>Email:</Text>
                    <Text>{bookingData.user?.email}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-item">
                    <Text strong>Số điện thoại:</Text>
                    <Text>{bookingData.user?.phone}</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>Ngày tạo:</Text>
                    <Text>{formatDate(bookingData.created_at)}</Text>
                  </div>
                </Col>
              </Row>
            </Card>

            <Card title="Lịch trình" size="small" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div className="info-item">
                    <CalendarOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    <Text strong>Ngày nhận phòng:</Text>
                    <Text>{formatDate(bookingData.check_in_date)}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-item">
                    <CalendarOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                    <Text strong>Ngày trả phòng:</Text>
                    <Text>{formatDate(bookingData.check_out_date)}</Text>
                  </div>
                </Col>
              </Row>
              
              {bookingData.check_in_time && (
                <div className="info-item">
                  <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                  <Text strong>Thời gian check-in:</Text>
                  <Text>{new Date(bookingData.check_in_time).toLocaleString('vi-VN')}</Text>
                </div>
              )}
              
              {bookingData.check_out_time && (
                <div className="info-item">
                  <ClockCircleOutlined style={{ color: '#722ed1', marginRight: 8 }} />
                  <Text strong>Thời gian check-out:</Text>
                  <Text>{new Date(bookingData.check_out_time).toLocaleString('vi-VN')}</Text>
                </div>
              )}
            </Card>

            <div className="action-buttons" style={{ marginTop: 24 }}>
              <Space>
                <Button size="large" onClick={() => setStep(1)}>
                  Quay lại
                </Button>
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  onClick={handleConfirm}
                  icon={type === 'checkin' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                >
                  {type === 'checkin' ? 'Xác nhận Check-in' : 'Xác nhận Check-out'}
                </Button>
              </Space>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="success-step">
            {success ? (
              <>
                <div className="success-content">
                  <CheckCircleOutlined className="success-icon" style={{ color: '#52c41a', fontSize: '64px' }} />
                  <Title level={3} style={{ color: '#52c41a' }}>
                    {type === 'checkin' ? 'Check-in thành công!' : 'Check-out thành công!'}
                  </Title>
                  <Text style={{ fontSize: '16px', color: '#666' }}>
                    {type === 'checkin' 
                      ? 'Khách hàng đã được check-in thành công. Phòng đã được gán và sẵn sàng sử dụng.'
                      : 'Khách hàng đã được check-out thành công. Phòng đã được giải phóng.'
                    }
                  </Text>
                </div>
                
                <div className="action-buttons" style={{ marginTop: 24 }}>
                  <Button type="primary" size="large" onClick={handleClose}>
                    Đóng
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="success-content">
                  <CheckCircleOutlined className="success-icon" style={{ color: '#ff4d4f', fontSize: '64px' }} />
                  <Title level={3} style={{ color: '#ff4d4f' }}>
                    {type === 'checkin' ? 'Check-in thất bại!' : 'Check-out thất bại!'}
                  </Title>
                  <Text style={{ fontSize: '16px', color: '#666' }}>
                    {type === 'checkin' 
                      ? 'Không thể thực hiện check-in. Vui lòng kiểm tra lại thông tin đặt phòng.'
                      : 'Không thể thực hiện check-out. Vui lòng kiểm tra lại thông tin đặt phòng.'
                    }
                  </Text>
                </div>
                
                <div className="action-buttons" style={{ marginTop: 24 }}>
                  <Button onClick={() => setStep(2)} style={{ marginRight: 8 }}>
                    Quay lại
                  </Button>
                  <Button type="primary" onClick={handleClose}>
                    Đóng
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default CheckInOut
