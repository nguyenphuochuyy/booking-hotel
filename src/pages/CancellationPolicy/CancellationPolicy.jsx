import React, { useState } from 'react'
import { Typography, Row, Col, Card, Space, Divider, Timeline, Statistic, Tag, Button, DatePicker, Alert } from 'antd'
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import './CancellationPolicy.css'

const { Title, Paragraph, Text } = Typography

const CancellationPolicy = () => {
  // State cho tính năng check nhanh
  const [checkInDate, setCheckInDate] = useState(null);

  // Hàm tính mốc thời gian (Demo logic đơn giản)
  const getDeadlines = (date) => {
    if (!date) return null;
    const checkInTime = dayjs(date).hour(14).minute(0).second(0);
    const deadline48h = checkInTime.subtract(48, 'hour');
    return deadline48h.format('HH:mm DD/MM/YYYY');
  };

  const deadlineString = getDeadlines(checkInDate);

  const policySteps = [
    {
      percent: 85,
      color: '#52c41a', // Green
      icon: <CheckCircleOutlined />,
      title: 'Trong vòng 1H sau khi đặt',
      summary: 'Hoàn lại 85% giá trị',
      desc: 'Khoảng thời gian "hối tiếc". Bạn chỉ mất 15% phí xử lý hệ thống.',
    },
    {
      percent: 70,
      color: '#faad14', // Orange/Gold
      icon: <ExclamationCircleOutlined />,
      title: 'Trước 48H so với giờ Check-in',
      summary: 'Hoàn lại 70% giá trị',
      desc: 'Áp dụng khi bạn thay đổi kế hoạch sớm.',
    },
    {
      percent: 0,
      color: '#ff4d4f', // Red
      icon: <CloseCircleOutlined />,
      title: 'Trong vòng 48H trước giờ Check-in',
      summary: 'Không hoàn tiền (0%)',
      desc: 'Do khách sạn đã giữ phòng cho bạn và từ chối các khách khác.',
    }
  ]

  return (
    <div className="cancellation-container">
      {/* 1. Hero Section Cải tiến */}
      <div className="cancellation-hero-enhanced">
        <Title level={1} style={{ color: '#fff', margin: 0 }}>Chính Sách Hủy & Hoàn Tiền</Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, maxWidth: 600, margin: '16px auto' }}>
          Minh bạch - Rõ ràng - Đảm bảo quyền lợi. Bean Hotel cam kết hỗ trợ tối đa trong các trường hợp thay đổi kế hoạch.
        </Paragraph>
      </div>

      <div className="cancellation-content">
        
        {/* 2. Tính năng tương tác: Kiểm tra mốc hủy phòng */}
        <Row justify="center" style={{ marginTop: -40, marginBottom: 40 }}>
          <Col xs={22} md={16} lg={12}>
            <Card className="interactive-card" bordered={false}>
              <Space direction="vertical" style={{ width: '100%' }} align="center">
                <Title level={5} style={{ margin: 0 }}><ClockCircleOutlined /> Kiểm tra mốc hủy phòng của bạn</Title>
                <Space>
                  <Text>Ngày Check-in dự kiến:</Text>
                  <DatePicker onChange={setCheckInDate} format="DD/MM/YYYY" />
                </Space>
                {deadlineString && (
                  <Alert 
                    message="Mốc thời gian quan trọng"
                    description={<span>Để được hoàn <b>70%</b>, bạn cần hủy trước: <Tag color="red" style={{fontSize: 14, padding: '4px 10px'}}>{deadlineString}</Tag></span>}
                    type="warning"
                    showIcon
                    style={{ width: '100%' }}
                  />
                )}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* 3. Timeline Visualized */}
        <Row justify="center">
          <Col xs={24} lg={18}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>Mức hoàn tiền theo thời gian</Title>
            <div className="visual-timeline-container">
              <Row gutter={[24, 24]}>
                {policySteps.map((step, index) => (
                  <Col xs={24} md={8} key={index}>
                    <Card className="step-card" bordered={false} style={{ borderTop: `4px solid ${step.color}` }}>
                      <div style={{ textAlign: 'center' }}>
                        <div className="percent-circle" style={{ color: step.color, borderColor: step.color }}>
                          {step.percent}%
                        </div>
                        <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>{step.title}</Title>
                        <Tag color={step.color} style={{ fontSize: 14, padding: '4px 12px', marginBottom: 16 }}>
                          {step.summary}
                        </Tag>
                        <Paragraph type="secondary" style={{ minHeight: 44 }}>
                          {step.desc}
                        </Paragraph>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: '60px 0' }} />

        {/* 4. Thông tin bổ sung dạng Grid icon lớn */}
        <Row gutter={[40, 40]} justify="center">
          <Col xs={24} md={12}>
            <Space align="start" size={16}>
              <SafetyCertificateOutlined style={{ fontSize: 32, color: '#c08a19' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>Quy trình hoàn tiền tự động</Title>
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  Khi bạn hủy hợp lệ, hệ thống tự động tính toán và gửi yêu cầu hoàn tiền. Admin sẽ xử lý chuyển khoản hoặc hoàn qua PayOS trong vòng 3-5 ngày làm việc.
                </Paragraph>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <Space align="start" size={16}>
              <QuestionCircleOutlined style={{ fontSize: 32, color: '#c08a19' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>Lưu ý đặc biệt</Title>
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  Mốc thời gian tính theo giờ chuẩn Check-in (14:00). Các trường hợp bất khả kháng (thiên tai, dịch bệnh) sẽ được xem xét chính sách riêng linh hoạt hơn.
                </Paragraph>
              </div>
            </Space>
          </Col>
        </Row>

      </div>
    </div>
  )
}

export default CancellationPolicy